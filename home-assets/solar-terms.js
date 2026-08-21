(() => {
  const names = [
    "小寒", "大寒", "立春", "雨水", "惊蛰", "春分",
    "清明", "谷雨", "立夏", "小满", "芒种", "夏至",
    "小暑", "大暑", "立秋", "处暑", "白露", "秋分",
    "寒露", "霜降", "立冬", "小雪", "大雪", "冬至",
  ];
  const minutes = [
    0, 21208, 42467, 63836, 85337, 107014,
    128867, 150921, 173149, 195551, 218072, 240693,
    263343, 285989, 308563, 331033, 353350, 375494,
    397447, 419210, 440795, 462224, 483532, 504758,
  ];

  const termDay = (year, index) => new Date(
    Date.UTC(1900, 0, 6, 2, 5) +
    31556925974.7 * (year - 1900) +
    minutes[index] * 60000,
  ).getUTCDate();

  const annotate = () => {
    const page = document.querySelector(".home-page");
    const note = page?.querySelector(".month-note")?.textContent || "";
    const match = note.match(/(\d{4})年(\d{1,2})月/);
    if (!page || !match) return;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const monthTerms = [month * 2 - 2, month * 2 - 1];

    page.querySelectorAll(".calendar-event").forEach((event) => {
      if (!event.classList.contains("system-solar-term") && names.includes(event.textContent.trim())) {
        const events = event.parentElement;
        event.remove();
        if (events?.classList.contains("calendar-events") && !events.children.length) events.remove();
      }
    });

    monthTerms.forEach((termIndex) => {
      const name = names[termIndex];
      const day = termDay(year, termIndex);
      const cell = [...page.querySelectorAll(".calendar-cell:not(.is-empty)")]
        .find((item) => Number(item.querySelector(".calendar-date")?.textContent) === day);
      if (!cell) return;

      const existing = [...cell.querySelectorAll(".system-solar-term")]
        .find((item) => item.textContent.trim() === name);
      if (existing) {
        existing.classList.add("event-solar-term");
        const image = existing.querySelector("img");
        if (image) image.src = "./images/jq.png";
        return;
      }

      let events = cell.querySelector(".calendar-events");
      if (!events) {
        events = document.createElement("span");
        events.className = "calendar-events";
        events.setAttribute("aria-label", "日历事件");
        cell.appendChild(events);
      }

      const event = document.createElement("span");
      event.className = "calendar-event event-solar-term system-solar-term";
      event.innerHTML = `<img src="./images/jq.png" alt=""><span>${name}</span>`;
      events.prepend(event);
    });
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      annotate();
    });
  };

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
