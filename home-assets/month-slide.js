(() => {
  let startPoint = null;
  let animating = false;

  const cleanClone = (clone) => {
    clone.querySelectorAll("button, input").forEach((element) => element.remove());
    clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  };

  document.addEventListener("pointerdown", (event) => {
    if (animating || !event.target.closest(".home-page")) return;
    if (event.target.closest("button, input, .inline-home-search")) return;
    startPoint = { x: event.clientX, y: event.clientY };
  }, true);

  document.addEventListener("pointerup", (event) => {
    if (!startPoint || animating) return;
    const dx = event.clientX - startPoint.x;
    const dy = event.clientY - startPoint.y;
    startPoint = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;

    const page = document.querySelector(".home-page");
    if (!page) return;
    animating = true;

    const bounds = page.getBoundingClientRect();
    const scale = bounds.width / 393;
    const snapshot = page.cloneNode(true);
    cleanClone(snapshot);
    snapshot.classList.add("month-slide-snapshot");
    Object.assign(snapshot.style, {
      top: `${bounds.top}px`,
      left: `${bounds.left}px`,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    });
    document.body.appendChild(snapshot);

    const forward = dx < 0;
    requestAnimationFrame(() => {
      snapshot.classList.add(forward ? "slide-out-left" : "slide-out-right");
      requestAnimationFrame(() => {
        const currentPage = document.querySelector("#root .home-page");
        if (currentPage) {
          const enterClass = forward ? "slide-in-right" : "slide-in-left";
          currentPage.classList.add(enterClass);
          window.setTimeout(() => currentPage.classList.remove(enterClass), 520);
        }
      });
    });

    window.setTimeout(() => {
      snapshot.remove();
      animating = false;
    }, 540);
  }, true);

  document.addEventListener("pointercancel", () => {
    startPoint = null;
  }, true);
})();
