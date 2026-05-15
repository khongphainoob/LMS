#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_SOURCE = 'frontend/src'
const DEFAULT_TARGET = 'lms/translations/vi.csv'

const GLOSSARY_OVERRIDES = new Map([
  ['Back', 'Quay lai'],
  ['Export Grades', 'Xuat diem'],
  ['GradingBook', 'So diem'],
  ['Student SBD', 'So bao danh hoc sinh'],
  ['Open the', 'Mo'],
])

const SUSPICIOUS_TRANSLATION_PATTERNS = [
  /Hoc sinh to/i,
  /\bLop\)/i,
]

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE,
    target: DEFAULT_TARGET,
    dryRun: false,
    limit: 0,
  }

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') {
      args.dryRun = true
      continue
    }
    if (arg === '--source' && argv[i + 1]) {
      args.source = argv[++i]
      continue
    }
    if (arg === '--target' && argv[i + 1]) {
      args.target = argv[++i]
      continue
    }
    if (arg === '--limit' && argv[i + 1]) {
      args.limit = Number(argv[++i]) || 0
      continue
    }
  }

  return args
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)))
      continue
    }
    if (/\.(vue|js|ts|jsx|tsx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

function extractTranslatableStrings(content) {
  const regex = /__\(\s*(["'`])((?:\\.|(?!\1)[\s\S])*?)\1\s*\)/g
  const strings = new Set()

  let match = regex.exec(content)
  while (match) {
    const raw = match[2]
    if (!raw.includes('${')) {
      const unescaped = raw
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .trim()
      const hasVietnameseChars = /[\u00C0-\u1EF9]/.test(unescaped)
      if (/[A-Za-z]/.test(unescaped) && !hasVietnameseChars) {
        strings.add(unescaped)
      }
    }
    match = regex.exec(content)
  }

  return strings
}

function parseCsvLine(line) {
  const cols = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    const next = line[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      cols.push(current)
      current = ''
      continue
    }

    current += ch
  }

  cols.push(current)
  return cols
}

function quoteCsv(value) {
  const str = String(value ?? '')
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

async function readExistingTranslations(csvPath) {
  let content = ''
  try {
    content = await fs.readFile(csvPath, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { map: new Map(), raw: '' }
    }
    throw error
  }

  const map = new Map()
  const lines = content.split(/\r?\n/).filter(Boolean)
  for (const line of lines) {
    const [source = '', target = ''] = parseCsvLine(line)
    if (source.trim()) {
      map.set(source, target)
    }
  }
  return { map, raw: content }
}

function protectPlaceholders(text) {
  const tokens = []
  let protectedText = text.replace(/\{\d+\}/g, (m) => {
    const token = `PH_TOKEN_${tokens.length}_END`
    tokens.push({ token, value: m })
    return token
  })

  protectedText = protectedText.replace(/\{\{[^{}]+\}\}/g, (m) => {
    const token = `PH_TOKEN_${tokens.length}_END`
    tokens.push({ token, value: m })
    return token
  })
  return { protectedText, tokens }
}

function protectBrandTerms(text, tokens) {
  let protectedText = text.replace(/Frappe Learning|Frappe/g, (m) => {
    const token = `BRAND_TOKEN_${tokens.length}_END`
    tokens.push({ token, value: m })
    return token
  })

  protectedText = protectedText.replace(/\b[A-Z]{2,}(?:\+\+)?\b/g, (m) => {
    const token = `ABBR_TOKEN_${tokens.length}_END`
    tokens.push({ token, value: m })
    return token
  })

  return { protectedText, tokens }
}

function restorePlaceholders(text, tokens) {
  let output = text
  for (const { token, value } of tokens) {
    output = output.replaceAll(token, value)
  }
  return output
}

async function translateEnToVi(text) {
  const override = GLOSSARY_OVERRIDES.get(text)
  if (override) {
    return override
  }

  const placeholderResult = protectPlaceholders(text)
  const brandResult = protectBrandTerms(
    placeholderResult.protectedText,
    placeholderResult.tokens
  )
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(brandResult.protectedText)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Translate failed with status ${response.status}`)
  }

  const data = await response.json()
  const translated = Array.isArray(data?.[0])
    ? data[0].map((item) => item?.[0] || '').join('')
    : ''

  if (!translated) {
    return text
  }

  return restorePlaceholders(translated, brandResult.tokens)
}

function isSuspiciousTranslation(source, translated) {
  if (!translated || !translated.trim()) {
    return true
  }

  if (source.trim() === translated.trim()) {
    return true
  }

  for (const pattern of SUSPICIOUS_TRANSLATION_PATTERNS) {
    if (pattern.test(translated)) {
      return true
    }
  }

  const sourceHasLetters = /[A-Za-z]/.test(source)
  const translatedHasVietnamese = /[\u00C0-\u1EF9]/.test(translated)
  const sourceHasTemplateOrPlaceholder = /\{\{|\{\d+\}/.test(source)

  if (sourceHasLetters && !translatedHasVietnamese && !sourceHasTemplateOrPlaceholder) {
    return true
  }

  return false
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const args = parseArgs(process.argv)
  const root = process.cwd()
  const sourceDir = path.resolve(root, args.source)
  const targetCsv = path.resolve(root, args.target)

  const files = await walkFiles(sourceDir)
  const sourceStrings = new Set()

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')
    const strings = extractTranslatableStrings(content)
    for (const str of strings) {
      sourceStrings.add(str)
    }
  }

  const { map: existingMap, raw } = await readExistingTranslations(targetCsv)

  const missing = [...sourceStrings]
    .filter((text) => {
      const translated = existingMap.get(text)
      return !translated || !translated.trim()
    })
    .sort((a, b) => a.localeCompare(b))

  const cappedMissing = args.limit > 0 ? missing.slice(0, args.limit) : missing

  if (cappedMissing.length === 0) {
    console.log('No missing frontend translation keys found.')
    return
  }

  console.log(`Found ${cappedMissing.length} missing keys (out of ${missing.length} total).`)

  const newRows = []
  for (const key of cappedMissing) {
    try {
      const translated = await translateEnToVi(key)
      if (isSuspiciousTranslation(key, translated)) {
        newRows.push([key, key])
        console.warn(`Suspicious translation, kept source: ${key} -> ${translated}`)
      } else {
        newRows.push([key, translated])
        console.log(`Translated: ${key} -> ${translated}`)
      }
    } catch (error) {
      newRows.push([key, key])
      console.warn(`Fallback to source text for key: ${key}`)
      console.warn(`Reason: ${error.message}`)
    }
    await sleep(120)
  }

  if (args.dryRun) {
    console.log('Dry run completed. No file changes were written.')
    return
  }

  const lines = newRows.map(([key, value]) => `${quoteCsv(key)},${quoteCsv(value)},`)
  const appendText = `${raw && !raw.endsWith('\n') ? '\n' : ''}${lines.join('\n')}\n`

  await fs.mkdir(path.dirname(targetCsv), { recursive: true })
  await fs.appendFile(targetCsv, appendText, 'utf8')

  console.log(`Appended ${newRows.length} translations to ${args.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
