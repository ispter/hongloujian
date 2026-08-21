(() => {
  const applyCorrections = () => {
    const page = document.querySelector(".home-page");
    const note = page?.querySelector(".month-note")?.textContent || "";
    const match = note.match(/\d{4}年(\d{1,2})月/);
    if (!page || Number(match?.[1]) !== 8) return;

    const cell = [...page.querySelectorAll(".calendar-cell:not(.is-empty)")]
      .find((item) => Number(item.querySelector(".calendar-date")?.textContent) === 19);
    if (!cell) return;

    cell.querySelectorAll(".calendar-event").forEach((event) => {
      const imageSource = event.querySelector("img")?.getAttribute("src") || "";
      if (event.classList.contains("event-birthday") || imageSource.endsWith("/sr.png")) {
        const events = event.parentElement;
        event.remove();
        if (events?.classList.contains("calendar-events") && !events.children.length) events.remove();
      }
    });
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyCorrections();
    });
  };

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
