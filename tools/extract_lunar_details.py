import json
from pathlib import Path

from docx import Document


SOURCE_ROOT = Path("/Volumes/Yanru/20240301/Work/京华岁时红楼笺/《京华岁时红楼笺》制作材料/文件")
OUTPUT = Path("home-assets/lunar-details-data.js")

MONTHS = [
    ("01正月.docx", "正月"), ("02二月.docx", "二月"),
    ("03三月.docx", "三月"), ("04四月.docx", "四月"),
    ("05五月.docx", "五月"), ("06六月.docx", "六月"),
    ("07七月.docx", "七月"), ("08八月.docx", "八月"),
    ("09九月.docx", "九月"), ("10十月.docx", "十月"),
    ("11冬月.docx", "冬月"), ("12腊月.docx", "腊月"),
]

DAY_NAMES = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
]


def extract_month(path: Path, month_name: str):
    title_to_day = {f"{month_name}{name}": index + 1 for index, name in enumerate(DAY_NAMES)}
    details = {}
    current_day = None
    pending_break = False

    for paragraph in Document(path).paragraphs:
        text = " ".join(paragraph.text.split())
        if not text:
            if current_day is not None:
                pending_break = True
            continue

        normalized_title = text[:-1] if text.endswith("日") else text
        if normalized_title in title_to_day:
            current_day = title_to_day[normalized_title]
            details[str(current_day)] = {
                "title": normalized_title,
                "lunarDay": DAY_NAMES[current_day - 1],
                "paragraphs": [],
            }
            pending_break = False
            continue

        if current_day is not None:
            details[str(current_day)]["paragraphs"].append({
                "text": text,
                "breakBefore": pending_break,
            })
            pending_break = False

    missing = [day for day in range(1, 31) if str(day) not in details]
    for day in missing:
        details[str(day)] = {
            "title": f"{month_name}{DAY_NAMES[day - 1]}",
            "lunarDay": DAY_NAMES[day - 1],
            "paragraphs": [{
                "text": "本日附件未提供独立内容。",
                "breakBefore": False,
            }],
            "sourceMissing": True,
        }
    return dict(sorted(details.items(), key=lambda item: int(item[0]))), missing


def main():
    all_details = {}
    total_paragraphs = 0
    for filename, month_name in MONTHS:
        details, missing = extract_month(SOURCE_ROOT / filename, month_name)
        all_details[month_name] = details
        paragraph_count = sum(len(item["paragraphs"]) for item in details.values())
        total_paragraphs += paragraph_count
        print(f"{month_name}: 30 days, {paragraph_count} paragraphs, missing source days: {missing or '-'}")

    payload = json.dumps(all_details, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(f"window.LUNAR_DETAILS={payload};\n", encoding="utf-8")
    print(f"Wrote {OUTPUT}: 12 months, 360 days, {total_paragraphs} paragraphs")


if __name__ == "__main__":
    main()
