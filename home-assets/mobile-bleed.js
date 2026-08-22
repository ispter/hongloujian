(() => {
  const DESIGN_WIDTH = 393;

  const updateBleed = () => {
    const page = document.querySelector(".home-page");
    if (!page) return;
    const bounds = page.getBoundingClientRect();
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const scale = bounds.width / DESIGN_WIDTH;
    if (!scale || viewportWidth > 600) {
      page.style.removeProperty("--scene-bleed-width");
      page.style.removeProperty("--scene-bleed-left");
      return;
    }
    const width = viewportWidth / scale;
    page.style.setProperty("--scene-bleed-width", `${width}px`);
    page.style.setProperty("--scene-bleed-left", `${(DESIGN_WIDTH - width) / 2}px`);
  };

  requestAnimationFrame(updateBleed);
  window.addEventListener("resize", updateBleed);
  window.visualViewport?.addEventListener("resize", updateBleed);
  new MutationObserver(() => requestAnimationFrame(updateBleed))
    .observe(document.querySelector("#root"), { childList: true });
})();
