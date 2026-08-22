(() => {
  let overlay = null;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const positionOverlay = () => {
    if (!overlay) return;
    const page = document.querySelector("#root .home-page");
    if (!page) return;
    const bounds = page.getBoundingClientRect();
    const scale = bounds.width / 393;
    Object.assign(overlay.style, {
      top: `${bounds.top}px`,
      left: `${bounds.left}px`,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    });
  };

  const closeDetail = () => {
    if (!overlay) return;
    overlay.classList.add("is-closing");
    const closingOverlay = overlay;
    overlay = null;
    document.body.classList.remove("date-detail-active");
    window.setTimeout(() => closingOverlay.remove(), 300);
  };

  const getLunarDate = (year, month, day) => {
    try {
      const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
        month: "long",
        day: "numeric",
      }).formatToParts(new Date(year, month - 1, day, 12));
      const rawLunarMonth = parts.find((part) => part.type === "month")?.value || "八月";
      const normalizedMonth = rawLunarMonth.replace(/^闰/, "");
      const lunarMonth = normalizedMonth === "十一月" ? "冬月" : normalizedMonth;
      const lunarDayValue = parts.find((part) => part.type === "day")?.value || String(day);
      const lunarDay = detailDayName(Number(lunarDayValue));
      return {
        month: lunarMonth.endsWith("月") ? lunarMonth : `${lunarMonth}月`,
        day: lunarDay,
        title: `${lunarMonth.endsWith("月") ? lunarMonth : `${lunarMonth}月`}${lunarDay}`,
      };
    } catch {
      return { month: "八月", day: detailDayName(day), title: `八月${detailDayName(day)}` };
    }
  };

  const detailDayName = (day) => {
    const names = ["", "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
      "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
      "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
    return names[day] || String(day);
  };

  const detailDayNumber = (name) => {
    for (let day = 1; day <= 30; day += 1) {
      if (detailDayName(day) === name) return day;
    }
    return 0;
  };

  const loadCardImage = (src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

  const wrapCardText = (context, text, maxWidth) => {
    const lines = [];
    let line = "";
    for (const character of text) {
      const candidate = line + character;
      if (context.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = character;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const createShareCard = async ({ title, date, summary }) => {
    const canvas = document.createElement("canvas");
    canvas.width = 750;
    canvas.height = 1000;
    const context = canvas.getContext("2d");
    const [background, plum] = await Promise.all([
      loadCardImage("./images/bg.jpg"),
      loadCardImage("./images/plum_branch.png"),
    ]);

    context.fillStyle = "#eee0bd";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (background) {
      const scale = Math.max(canvas.width / background.width, canvas.height / background.height);
      const width = background.width * scale;
      const height = background.height * scale;
      context.globalAlpha = 0.72;
      context.drawImage(background, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      context.globalAlpha = 1;
    }
    if (plum) {
      context.globalAlpha = 0.38;
      context.drawImage(plum, 405, -25, 390, 245);
      context.globalAlpha = 1;
    }

    context.strokeStyle = "rgba(139,37,5,.72)";
    context.lineWidth = 3;
    context.strokeRect(28, 28, 694, 944);
    context.lineWidth = 1;
    context.strokeRect(39, 39, 672, 922);

    context.textAlign = "center";
    context.fillStyle = "#8b2505";
    context.font = '36px "HYBeiWeiXieJing", "STKaiti", serif';
    context.fillText("京华岁时红楼笺", 375, 112);
    context.fillStyle = "#1c120e";
    context.font = '76px "HYBeiWeiXieJing", "STKaiti", serif';
    context.fillText(title, 375, 275);
    context.fillStyle = "#6c4939";
    context.font = '25px "PingFang SC", sans-serif';
    context.fillText(date, 375, 333);

    context.strokeStyle = "rgba(139,37,5,.6)";
    context.beginPath();
    context.moveTo(115, 378);
    context.lineTo(635, 378);
    context.stroke();

    context.textAlign = "left";
    context.fillStyle = "#32221a";
    context.font = '32px "PingFang SC", sans-serif';
    const lines = wrapCardText(context, summary, 535).slice(0, 8);
    lines.forEach((line, index) => context.fillText(line, 108, 470 + index * 58));

    context.textAlign = "center";
    context.fillStyle = "#9b3217";
    context.font = '28px "STKaiti", serif';
    context.fillText("长按保存图片 · 分享此日笺", 375, 910);
    return canvas.toDataURL("image/png", 1);
  };

  const showSharePreview = async (cardData, fileName) => {
    document.querySelector(".date-share-preview")?.remove();
    const preview = document.createElement("section");
    preview.className = "date-share-preview";
    preview.innerHTML = `
      <div class="date-share-preview-inner">
        <img src="${cardData}" alt="当日分享卡片">
        <p>微信内可长按图片保存，再分享给好友或朋友圈</p>
        <div>
          <button class="date-share-system" type="button">分享图片</button>
          <a href="${cardData}" download="${escapeHtml(fileName)}">保存图片</a>
        </div>
      </div>
    `;
    document.body.appendChild(preview);
    const systemShareButton = preview.querySelector(".date-share-system");
    if (!navigator.share || !navigator.canShare || typeof File === "undefined") {
      systemShareButton?.remove();
    }
    preview.addEventListener("click", (event) => {
      if (event.target === preview) preview.remove();
    });
    systemShareButton?.addEventListener("click", async () => {
      try {
        const blob = await (await fetch(cardData)).blob();
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: "京华岁时红楼笺", files: [file] });
        }
      } catch (error) {
        if (error?.name !== "AbortError") console.warn("分享图片失败", error);
      }
    });
  };

  const showDetail = (day, year, month, yearName) => {
    const lunar = getLunarDate(year, month, day);
    const lunarDayNumber = detailDayNumber(lunar.day);
    const detail = window.LUNAR_DETAILS?.[lunar.month]?.[String(lunarDayNumber)];
    if (!detail || overlay) return;

    const paragraphs = detail.paragraphs.map((item, index) => {
      const source = /《.+》.*(?:写道|云|载)[：:]?$/.test(item.text);
      const classes = [
        item.breakBefore ? "detail-section-break" : "",
        source ? "detail-source-line" : "",
        index === 0 ? "detail-lead" : "",
      ].filter(Boolean).join(" ");
      return `<p class="${classes}">${escapeHtml(item.text)}</p>`;
    }).join("");

    const lead = detail.paragraphs[0]?.text || lunar.title;
    overlay = document.createElement("section");
    overlay.className = "august-detail-page";
    overlay.setAttribute("aria-label", `${lunar.title}详情`);
    overlay.innerHTML = `
      <div class="date-detail-scroll">
        <img class="date-detail-plum" src="./images/plum_branch.png" alt="">
        <header class="date-detail-header">
          <div class="date-detail-tag"><span>${escapeHtml(yearName || "丙午年")}</span><b>${escapeHtml(lunar.month)}</b></div>
          <div class="date-detail-heading">
            <h1>${escapeHtml(lunar.title)}</h1>
            <time>${year}年${month}月${day}日</time>
            <div class="date-detail-rule"><i></i></div>
          </div>
        </header>
        <article class="date-detail-article">${paragraphs}</article>
        <section class="date-share-card" aria-label="分享此日笺">
          <h2>分享此日笺</h2>
          <div class="date-share-inner">
            <strong>${escapeHtml(lunar.title)}</strong>
            <p>${escapeHtml(lead.slice(0, 72))}${lead.length > 72 ? "……" : ""}</p>
            <small>${year}年${month}月${day}日　农历${escapeHtml(lunar.title)}</small>
          </div>
        </section>
        <button class="date-detail-close-bottom" type="button">分享此日笺</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add("date-detail-active");
    positionOverlay();
    requestAnimationFrame(() => overlay?.classList.add("is-open"));
    overlay.addEventListener("click", closeDetail);
    overlay.querySelector(".date-detail-close-bottom")?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = "正在生成…";
      const cardData = await createShareCard({
        title: lunar.title,
        date: `${year}年${month}月${day}日`,
        summary: lead,
      });
      await showSharePreview(cardData, `${year}年${month}月${day}日-${lunar.title}.png`);
      button.disabled = false;
      button.textContent = "分享此日笺";
    });
  };

  document.addEventListener("click", (event) => {
    const cell = event.target.closest(".home-page .calendar-cell:not(.is-empty)");
    if (!cell || overlay) return;
    const note = document.querySelector(".home-page .month-note")?.textContent || "";
    const monthMatch = note.match(/(\d{4})年(\d{1,2})月/);
    if (!monthMatch) return;
    const day = Number(cell.querySelector(".calendar-date")?.textContent);
    if (day < 1 || day > 31) return;
    const yearName = note.match(/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年)/)?.[1];
    event.preventDefault();
    event.stopImmediatePropagation();
    showDetail(day, Number(monthMatch[1]), Number(monthMatch[2]), yearName);
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDetail();
  });
  window.addEventListener("resize", positionOverlay);
  window.visualViewport?.addEventListener("resize", positionOverlay);
})();
