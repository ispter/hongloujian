(() => {
  const replacements = new Map([
    ["节气1.svg", ["./images/jq.png", "event-solar-term"]],
    ["人物生辰·1.svg", ["./images/sr.png", "event-birthday"]],
    ["重要节日1.svg", ["./images/jr.png", "event-festival"]],
  ]);

  const replaceIcons = (root = document) => {
    root.querySelectorAll?.("img[src]").forEach((image) => {
      for (const [oldName, [newSource, eventClass]] of replacements) {
        if (decodeURI(image.getAttribute("src") || "").endsWith(oldName)) {
          image.src = newSource;
          image.closest(".calendar-event")?.classList.add(eventClass);
          break;
        }
      }
    });
  };

  replaceIcons();
  new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) replaceIcons(node);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
