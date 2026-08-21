(() => {
  const audio = document.querySelector("#background-music");
  if (!audio) return;

  audio.volume = 0.4;
  let syncingReactButton = false;

  function getButton() {
    return document.querySelector(".hotspot-copyright");
  }

  function syncReactStateToPlaying() {
    const button = getButton();
    if (!button || button.getAttribute("aria-label") === "暂停音乐") return;

    syncingReactButton = true;
    button.click();
    syncingReactButton = false;
  }

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest(".hotspot-copyright");
      if (!button || syncingReactButton) return;

      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    },
    true,
  );

  if (sessionStorage.getItem("redmansion-music-autoplay") === "true") {
    sessionStorage.removeItem("redmansion-music-autoplay");
    audio.play().then(syncReactStateToPlaying).catch(() => {});
  }
})();
