(() => {
  let initialized = false;

  const showToday = () => {
    if (initialized) return true;
    const todayButton = document.querySelector(".hotspot-today");
    if (!todayButton) return false;
    initialized = true;
    todayButton.click();
    return true;
  };

  if (!showToday()) {
    const observer = new MutationObserver(() => {
      if (showToday()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 3000);
  }
})();
