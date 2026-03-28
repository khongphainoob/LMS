const fs = require('fs')
const path = require('path')

const root = process.cwd()
const vueRoot = path.join(root, 'frontend', 'src')
const viCsvPath = path.join(root, 'lms', 'translations', 'vi.csv')
const viPoPath = path.join(root, 'locale', 'vi.po')
const missingOutPath = path.join(root, 'scripts', 'missing_vi_from_vue.txt')

function walk(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) walk(full, out)
		else if (entry.isFile() && full.endsWith('.vue')) out.push(full)
	}
	return out
}

function unescapePo(str) {
	return str
		.replace(/\\n/g, '\n')
		.replace(/\\"/g, '"')
		.replace(/\\\\/g, '\\')
}

function parsePo(poText) {
	const map = new Map()
	const lines = poText.split(/\r?\n/)
	let currentId = null
	let currentStr = null
	let mode = null

	const flush = () => {
		if (currentId !== null && currentId !== '' && currentStr !== null && currentStr !== '') {
			map.set(currentId, currentStr)
		}
		currentId = null
		currentStr = null
		mode = null
	}

	for (const line of lines) {
		if (line.startsWith('msgid ')) {
			flush()
			mode = 'id'
			currentId = unescapePo(line.slice(6).trim().replace(/^"|"$/g, ''))
			currentStr = ''
			continue
		}
		if (line.startsWith('msgstr ')) {
			mode = 'str'
			currentStr = unescapePo(line.slice(7).trim().replace(/^"|"$/g, ''))
			continue
		}
		if (line.startsWith('"')) {
			const chunk = unescapePo(line.trim().replace(/^"|"$/g, ''))
			if (mode === 'id' && currentId !== null) currentId += chunk
			if (mode === 'str' && currentStr !== null) currentStr += chunk
			continue
		}
		if (line.trim() === '') {
			flush()
		}
	}
	flush()
	return map
}

function parseCsvFirstColumn(csvText) {
	const set = new Set()
	for (const rawLine of csvText.split(/\r?\n/)) {
		if (!rawLine.trim()) continue
		const line = rawLine
		let key = ''
		if (line.startsWith('"')) {
			let i = 1
			while (i < line.length) {
				if (line[i] === '"' && line[i + 1] === '"') {
					key += '"'
					i += 2
					continue
				}
				if (line[i] === '"') break
				key += line[i]
				i++
			}
		} else {
			const idx = line.indexOf(',')
			key = (idx === -1 ? line : line.slice(0, idx)).trim()
		}
		if (key) set.add(key)
	}
	return set
}

function csvEscape(value) {
	if (value == null) return ''
	const text = String(value)
	if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
	return text
}

const vueFiles = walk(vueRoot)
const keyRegex = /__\(\s*(['"])((?:\\.|(?!\1)[^\\])*?)\1\s*\)/gms
const vueKeys = new Set()

for (const file of vueFiles) {
	const content = fs.readFileSync(file, 'utf8')
	let match
	while ((match = keyRegex.exec(content)) !== null) {
		const raw = match[2]
		const normalized = raw
			.replace(/\\n/g, '\n')
			.replace(/\\'/g, "'")
			.replace(/\\"/g, '"')
		if (normalized) vueKeys.add(normalized)
	}
}

const existingCsv = fs.readFileSync(viCsvPath, 'utf8')
const existingKeys = parseCsvFirstColumn(existingCsv)
const poMap = parsePo(fs.readFileSync(viPoPath, 'utf8'))

const missing = [...vueKeys].filter((k) => !existingKeys.has(k)).sort((a, b) => a.localeCompare(b))

const appendLines = []
const unresolved = []
for (const key of missing) {
	if (poMap.has(key)) {
		appendLines.push(`${csvEscape(key)},${csvEscape(poMap.get(key))},`)
	} else {
		unresolved.push(key)
	}
}

if (appendLines.length > 0) {
	const prefix = existingCsv.endsWith('\n') ? '' : '\n'
	fs.writeFileSync(viCsvPath, existingCsv + prefix + appendLines.join('\n') + '\n', 'utf8')
}

fs.writeFileSync(missingOutPath, unresolved.join('\n') + (unresolved.length ? '\n' : ''), 'utf8')

console.log(`VUE_KEYS=${vueKeys.size}`)
console.log(`MISSING_IN_CSV=${missing.length}`)
console.log(`ADDED_FROM_PO=${appendLines.length}`)
console.log(`UNRESOLVED=${unresolved.length}`)
console.log(`UNRESOLVED_FILE=${path.relative(root, missingOutPath)}`)
