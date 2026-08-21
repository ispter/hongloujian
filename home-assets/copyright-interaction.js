(() => {
  let isClosing = false;

  function preserveHomeUnderlay() {
    const homePage = document.querySelector(".home-page");
    if (!homePage || document.querySelector(".copyright-underlay")) return;

    const underlay = document.createElement("div");
    underlay.className = "copyright-underlay";
    underlay.setAttribute("aria-hidden", "true");

    const clone = homePage.cloneNode(true);
    clone.querySelectorAll("button, input, audio").forEach((element) => {
      element.tabIndex = -1;
    });
    underlay.appendChild(clone);
    document.body.appendChild(underlay);
    document.body.classList.add("copyright-active");
  }

  function removeHomeUnderlay() {
    document.querySelector(".copyright-underlay")?.remove();
    document.body.classList.remove("copyright-active");
  }

  function ensureCopyrightContent() {
    const copyrightPage = document.querySelector(".copyright-page");
    if (!copyrightPage || copyrightPage.querySelector(".copyright-scroll-sheet")) return;

    const sheet = document.createElement("section");
    sheet.className = "copyright-scroll-sheet";
    sheet.setAttribute("aria-label", "版权信息");
    sheet.innerHTML = `
      <h1 class="copyright-scroll-title">版权信息</h1>
      <h2 class="copyright-work-title">《京华岁时红楼笺》</h2>
      <p class="copyright-project">北京宣传文化引导基金资助项目</p>
      <p class="copyright-isbn">ISBN 978-7-89418-***-*（待批）</p>

      <h2 class="copyright-section-title">出版信息</h2>
      <dl class="copyright-details">
        <div><dt>出版：</dt><dd>北京联合出版公司</dd></div>
        <div><dt>策划：</dt><dd>传妙工作室</dd></div>
        <div><dt>支持：</dt><dd>北京曹雪芹学会</dd></div>
        <div><dt>编著：</dt><dd>樊志斌</dd></div>
        <div><dt>设计：</dt><dd>吕燕茹、王馨欣、李欣</dd></div>
        <div><dt>责编：</dt><dd>张佳</dd></div>
        <div><dt>鸣谢：</dt><dd>王立平</dd></div>
        <div><dt></dt><dd>曹雪芹纪念馆</dd></div>
        <div><dt></dt><dd>旅顺博物馆</dd></div>
        <div class="copyright-date"><dt>出版日期：</dt><dd>2026年9月</dd></div>
      </dl>

      <h2 class="copyright-section-title">版权声明</h2>
      <p class="copyright-emphasis">版权所有，侵权必究</p>
      <p class="copyright-notice">本作品受中华人民共和国著作权法保护，未经授权，禁止任何形式的复制、传播、改编或商业使用。</p>
    `;
    copyrightPage.appendChild(sheet);
  }

  function preserveLantern() {
    const lantern = document.querySelector(".home-page .lantern");
    if (!lantern || document.querySelector(".copyright-lantern")) return;

    const bounds = lantern.getBoundingClientRect();
    const clone = lantern.cloneNode(true);
    clone.classList.add("copyright-lantern");
    clone.removeAttribute("className");
    const pageBounds = document.querySelector(".home-page")?.getBoundingClientRect();
    const pageScale = pageBounds ? pageBounds.height / 852 : 1;
    const targetTop = pageBounds ? pageBounds.top + 765 * pageScale : window.innerHeight - 58;
    const travelDistance = Math.max(0, targetTop - bounds.top);
    Object.assign(clone.style, {
      position: "fixed",
      top: `${bounds.top}px`,
      left: `${bounds.left}px`,
      right: "auto",
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
    });
    clone.style.setProperty("--lantern-travel", `${travelDistance}px`);
    document.body.appendChild(clone);
  }

  document.addEventListener(
    "click",
    (event) => {
      const copyrightPage = document.querySelector(".copyright-page");
      if (!copyrightPage) {
        if (event.target.closest(".hotspot-info")) {
          preserveHomeUnderlay();
          preserveLantern();
          window.setTimeout(ensureCopyrightContent, 0);
        }
        return;
      }

      if (isClosing) return;

      const backButton = copyrightPage.querySelector(".copyright-back");
      if (!backButton) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        isClosing = true;
        document.querySelector(".copyright-lantern")?.remove();
        copyrightPage.querySelector(".copyright-scroll-sheet")?.remove();
        backButton.click();
        removeHomeUnderlay();
        isClosing = false;
        return;
      }

      isClosing = true;
      copyrightPage.classList.add("is-closing");
      copyrightPage.querySelector(".copyright-scroll-sheet")?.classList.add("is-closing");
      backButton.classList.add("is-closing");
      document.querySelector(".copyright-lantern")?.classList.add("is-closing");

      window.setTimeout(() => {
        document.querySelector(".copyright-lantern")?.remove();
        copyrightPage.querySelector(".copyright-scroll-sheet")?.remove();
        backButton.click();
        removeHomeUnderlay();
        isClosing = false;
      }, 680);
    },
    true,
  );
})();
