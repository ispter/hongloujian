import json
import re
from pathlib import Path

from docx import Document


SOURCE = Path("/Volumes/Yanru/20240301/Work/京华岁时红楼笺/《京华岁时红楼笺》制作材料/文件/08八月.docx")
OUTPUT = Path("home-assets/august-details-data.js")

DAY_NAMES = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
]
TITLE_TO_DAY = {f"八月{name}": index + 1 for index, name in enumerate(DAY_NAMES)}
TITLE_PATTERN = re.compile(r"^八月(?:初[一二三四五六七八九十]|十[一二三四五六七八九]?|二十|廿[一二三四五六七八九]|三十)$")


def main():
    document = Document(SOURCE)
    details = {}
    current_day = None
    pending_break = False

    for paragraph in document.paragraphs:
        text = " ".join(paragraph.text.split())
        if not text:
            if current_day is not None:
                pending_break = True
            continue

        if TITLE_PATTERN.match(text) and text in TITLE_TO_DAY:
            current_day = TITLE_TO_DAY[text]
            details[str(current_day)] = {
                "title": text,
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
    if missing:
        raise RuntimeError(f"Missing August day sections: {missing}")

    payload = json.dumps(details, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(f"window.AUGUST_DETAILS={payload};\n", encoding="utf-8")
    print(f"Wrote {OUTPUT} with {len(details)} days and {sum(len(item['paragraphs']) for item in details.values())} paragraphs")


if __name__ == "__main__":
    main()
