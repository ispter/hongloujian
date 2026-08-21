(() => {
  let inlineSearch = null;

  const closeSearch = () => {
    if (!inlineSearch) return;
    inlineSearch.classList.remove("is-open");
    document.body.classList.remove("inline-search-active");
    const element = inlineSearch;
    inlineSearch = null;
    window.setTimeout(() => element.remove(), 320);
  };

  const openSearch = () => {
    if (inlineSearch) {
      inlineSearch.querySelector("input")?.focus({ preventScroll: true });
      return;
    }
    const homePage = document.querySelector(".home-page");
    if (!homePage) return;
    inlineSearch = document.createElement("label");
    inlineSearch.className = "inline-home-search";
    inlineSearch.setAttribute("aria-label", "搜索红楼岁时内容");
    inlineSearch.innerHTML = `<span class="inline-search-icon" aria-hidden="true"></span><input type="search" placeholder="输入人物、节气、节日或日期" autocomplete="off" />`;
    homePage.appendChild(inlineSearch);
    document.body.classList.add("inline-search-active");
    requestAnimationFrame(() => {
      inlineSearch?.classList.add("is-open");
      window.setTimeout(() => inlineSearch?.querySelector("input")?.focus({ preventScroll: true }), 180);
    });
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest(".hotspot-search")) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openSearch();
      return;
    }
    if (inlineSearch && !event.target.closest(".inline-home-search")) closeSearch();
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSearch();
  });
})();
