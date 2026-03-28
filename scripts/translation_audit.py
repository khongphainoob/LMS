import csv
import re
from pathlib import Path

ROOT = Path("frontend/src")
TARGETS = [
    ROOT / "pages" / "Home",
    ROOT / "pages" / "Courses.vue",
    ROOT / "pages" / "CourseDetail.vue",
    ROOT / "pages" / "Profile.vue",
    ROOT / "pages" / "ProfileAbout.vue",
    ROOT / "pages" / "Settings.vue",
    ROOT / "components",
]
CSV_PATH = Path("lms/translations/vi.csv")

PATTERN = re.compile(r"__\(\s*'([^']+)'\s*\)|__\(\s*\"([^\"]+)\"\s*\)")


def iter_files(target):
    if target.is_file() and target.suffix in {".vue", ".js", ".ts"}:
        yield target
        return
    if target.is_dir():
        for path in target.rglob("*"):
            if path.suffix in {".vue", ".js", ".ts"}:
                yield path


def get_keys_from_source():
    keys = set()
    for target in TARGETS:
        if not target.exists():
            continue
        for file_path in iter_files(target):
            text = file_path.read_text(encoding="utf-8", errors="ignore")
            for m in PATTERN.finditer(text):
                key = m.group(1) or m.group(2)
                if key:
                    keys.add(key)
    return keys


def get_csv_keys():
    keys = set()
    if not CSV_PATH.exists():
        return keys
    with CSV_PATH.open("r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if row and row[0].strip():
                keys.add(row[0])
    return keys


def main():
    source_keys = get_keys_from_source()
    csv_keys = get_csv_keys()
    missing = sorted(k for k in source_keys if k not in csv_keys)
    print(f"source_keys={len(source_keys)}")
    print(f"csv_keys={len(csv_keys)}")
    print(f"missing={len(missing)}")
    for k in missing[:220]:
        print(k)


if __name__ == "__main__":
    main()
