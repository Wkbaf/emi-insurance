/**
 * Shared JS for blog-detail.html and case-study-detail.html
 */
(function () {
  function escapeHtml(text) {
    return String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(text) {
    return escapeHtml(text).replaceAll("`", "&#096;");
  }

  function shortText(text, max = 72) {
    text = String(text || "");
    return text.length > max ? text.slice(0, max) + "..." : text;
  }

  function renderList(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function normalizeDateInput(value) {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);
    if (value.toDate) return value.toDate().toISOString().slice(0, 10);
    if (value.seconds)
      return new Date(value.seconds * 1000).toISOString().slice(0, 10);
    return "";
  }

  function formatDisplayDate(value) {
    const dateInput = normalizeDateInput(value);
    if (!dateInput) return "";
    const [year, month, day] = dateInput.split("-");
    return `${day}/${month}/${year}`;
  }

  function sanitizeCustomHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = html || "";

    template.content
      .querySelectorAll("script, iframe, object, embed, style")
      .forEach((el) => el.remove());
    template.content.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value || "";
        if (
          name.startsWith("on") ||
          value.toLowerCase().includes("javascript:")
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return template.innerHTML.trim();
  }

  function getYoutubeEmbedUrl(url) {
    if (!url) return "";

    try {
      const parsedUrl = new URL(url);
      let videoId = "";

      if (parsedUrl.hostname.includes("youtu.be")) {
        videoId = parsedUrl.pathname.replace("/", "");
      } else if (parsedUrl.hostname.includes("youtube.com")) {
        videoId = parsedUrl.searchParams.get("v") || "";

        if (!videoId && parsedUrl.pathname.includes("/embed/")) {
          videoId = parsedUrl.pathname.split("/embed/")[1] || "";
        }

        if (!videoId && parsedUrl.pathname.includes("/shorts/")) {
          videoId = parsedUrl.pathname.split("/shorts/")[1] || "";
        }
      }

      videoId = videoId.split("?")[0].split("&")[0];
      return videoId
        ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`
        : "";
    } catch (error) {
      return "";
    }
  }

  function getParamId() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get("id");

    if (!id && window.location.hash) {
      id = decodeURIComponent(window.location.hash.replace("#", ""));
    }

    return id;
  }

  function renderVideo(item) {
    const embedUrl =
      item.youtubeEmbedUrl ||
      getYoutubeEmbedUrl(item.youtubeUrl || item.videoUrl);
    if (!embedUrl) return "";

    return `
            <div class="video-embed-wrap">
                <iframe
                    src="${escapeAttr(embedUrl)}"
                    title="${escapeAttr(item.title || "Blog video")}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen>
                </iframe>
            </div>
        `;
  }

  function renderSections(sections, fallbackTypeLabel) {
    if (!Array.isArray(sections) || !sections.length) {
      return `
                <div class="timeline-item">
                    <div class="timeline-num">01</div>
                    <div>
                        <h3>Nội dung đang được cập nhật</h3>
                        <p>${escapeHtml(fallbackTypeLabel)} này chưa có nội dung chi tiết.</p>
                    </div>
                </div>
            `;
    }

    return sections
      .map(
        (section, index) => `
            <div class="timeline-item">
                <div class="timeline-num">${escapeHtml(section.number || String(index + 1).padStart(2, "0"))}</div>
                <div>
                    <h3>${escapeHtml(section.title || "")}</h3>
                    ${section.content ? `<p>${escapeHtml(section.content).replaceAll("\n", "<br>")}</p>` : ""}
                    ${Array.isArray(section.bullets) && section.bullets.length ? `<ul>${renderList(section.bullets)}</ul>` : ""}
                    ${section.note ? `<p><strong>${escapeHtml(section.note)}</strong></p>` : ""}
                </div>
            </div>
        `,
      )
      .join("");
  }

  function renderHero(item, config, elements) {
    const updatedDate =
      config.dateFields
        .map((field) => formatDisplayDate(item[field]))
        .find(Boolean) || "";

    const readingTime =
      config.readingTimeFields.map((field) => item[field]).find(Boolean) ||
      config.defaultReadingTime;

    const thumbnail = item.thumbnail || config.defaultThumbnail;

    elements.hero.style.setProperty(
      "--hero-bg",
      `url("${String(thumbnail).replaceAll('"', "%22")}")`,
    );

    elements.heroContent.classList.remove("loading-box");

    elements.heroContent.innerHTML = `
      <div class="hero-eyebrow">
        <i class="fa-solid fa-shield-heart"></i>
        EMI INSURANCE
      </div>
  
      <h1>${escapeHtml(item.cardQuote || "Nội dung đang được cập nhật.")}</h1>
  
      <div class="${escapeHtml(config.metaClass || "blog-meta")}">
        ${config.showAuthor && item.quoteAuthor ? `<span><i class="fa-regular fa-user"></i> ${escapeHtml(item.quoteAuthor)}</span>` : ""}
      </div>
    `;
  }

  function renderDetailBody(item, config) {
    const conclusion = item.conclusion || config.defaultConclusion;
    const conclusion_label =
      item.conclusionLabel || config.defaultConclusionLabel;

    if (item.detailContentType === "custom") {
      return `
                <div class="custom-content">
                    ${sanitizeCustomHtml(item.customDetailHtml || "<p>Nội dung đang được cập nhật.</p>")}
                </div>

                <div class="case-conclusion">
                    <div class="case-conclusion-label">
                        ${escapeHtml(conclusion_label)}
                    </div>

                    <p>${escapeHtml(conclusion)}</p>
                </div>
            `;
    }

    return `
            <div class="timeline">
                ${renderSections(item.detailSections || [], config.entityLabel)}
            </div>

            <div class="case-conclusion">
                <div class="case-conclusion-label">
                    ${escapeHtml(conclusion_label)}
                </div>

                <p>${escapeHtml(conclusion)}</p>
            </div>
        `;
  }
  // FOR SHARE META
  function setMeta(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("property", property);
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", content || "");
  }

  function updateOgMeta(item, config) {
    const title = item.title || config.defaultTitle || "Blog";
    const description = item.description || item.excerpt || title;
    const image = item.thumbnail || config.defaultThumbnail || "";
    const url = window.location.href;

    document.title = `${title} | EMI Insurance`;

    setMeta("og:type", "article");
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:image:secure_url", image);
    setMeta("og:url", url);

    console.log("OG meta updated:", {
      title,
      description,
      image,
      url,
    });
  }

  function renderArticle(item, config, elements) {
    const updatedDate =
      config.dateFields
        .map((field) => formatDisplayDate(item[field]))
        .find(Boolean) || "";
    const readingTime =
      config.readingTimeFields.map((field) => item[field]).find(Boolean) ||
      config.defaultReadingTime;

    const categoryEl = document.getElementById("pageCategory");

    if (categoryEl) {
      categoryEl.textContent = item.category || config.defaultCategory;
    }

    elements.articleContent.innerHTML = `
            <div class="article-body">
                <h2 class="article-title">${escapeHtml(item.title || config.defaultTitle)}</h2>
                ${item.description ? `<p class="article-description">${escapeHtml(item.description)}</p>` : ""}

                <div class="article-meta-line">
                    <span><i class="fa-regular fa-clock"></i> ${escapeHtml(config.readingTimeLabel)}: ${escapeHtml(readingTime)}</span>
                    ${updatedDate ? `<span><i class="fa-regular fa-calendar"></i> Cập nhật: ${escapeHtml(updatedDate)}</span>` : ""}
                    ${config.showAuthor && item.author ? `<span><i class="fa-regular fa-user"></i> Tác giả: ${escapeHtml(item.author)}</span>` : ""}
                </div>

                ${config.showVideo ? renderVideo(item) : ""}
                ${renderDetailBody(item, config)}
                ${renderShareBox(item, config)}
            </div>
        `;
  }

  // function getShareUrl(item, config) {
  //   const currentUrl = window.location.href.split("#")[0].split("?")[0];
  //   return `${currentUrl}?id=${encodeURIComponent(item.id)}&v=${Date.now()}`;
  // }

  function getShareUrl(item, config) {
    return `https://share.emi-insurance.com/share?id=${encodeURIComponent(item.id)}&type=blog`;
  }

  function renderShareBox(item, config) {
    if (config.canShare !== true) return "";

    const shareUrl = getShareUrl(item, config);
    const title = item.title || config.defaultTitle;
    const text = item.description || title;

    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    // const zaloUrl = `https://zalo.me/share?u=${encodeURIComponent(shareUrl)}`;
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
    // const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    // const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;

    return `
      <div class="article-share-box">
        <div>
          <div class="share-label">Chia sẻ bài viết</div>
          <p>Gửi bài viết này lên mạng xã hội hoặc sao chép liên kết.</p>
        </div>
  
        <div class="share-actions">
          <button
            type="button"
            class="share-btn facebook open-share-popup"
            data-share-url="${escapeAttr(shareUrl)}">
            <i class="fa-brands fa-facebook-f"></i>
          </button>

          <button
            type="button"
            class="share-btn zalo open-share-popup"
            data-share-url="${escapeAttr(shareUrl)}">
            Zalo
          </button>
  
          
  
          <button type="button" class="share-btn copy-link" data-share-url="${escapeAttr(shareUrl)}">
            <i class="fa-regular fa-copy"></i>
          </button>
        </div>
      </div>
    `;
  }

  // Link share for linkedin and x
  // <a href="${escapeAttr(linkedinUrl)}" target="_blank" rel="noopener" class="share-btn linkedin">
  //   <i class="fa-brands fa-linkedin-in"></i>
  // </a>

  // <a href="${escapeAttr(xUrl)}" target="_blank" rel="noopener" class="share-btn x-twitter">
  //   <i class="fa-brands fa-x-twitter"></i>
  // </a>

  function renderCurrentSidebar(item, config, elements) {
    const keyResults = Array.isArray(item.keyResults) ? item.keyResults : [];

    elements.sidebarResults.innerHTML = `
            <h3>${escapeHtml(config.sidebarResultTitle)}</h3>
            ${keyResults.length ? `<ul>${renderList(keyResults)}</ul>` : `<p class="mb-0 text-white-50">Nội dung đang được cập nhật.</p>`}
        `;

    const quote = item.cardQuote || item.quote || config.defaultQuote;
    const author = item.author || "EMI";

    elements.sidebarQuote.innerHTML = `
            “${escapeHtml(quote)}”
            <span> ${escapeHtml(author)}</span>
        `;
  }

  function renderError(message, detail, config, elements) {
    elements.heroContent.innerHTML = `
            <div class="error-box">
                <div class="fw-bold mb-2">${escapeHtml(message)}</div>
                ${detail ? `<div class="small">${escapeHtml(detail)}</div>` : ""}
            </div>
        `;
    elements.articleContent.innerHTML = "";
    elements.sidebarResults.innerHTML = `<h3>${escapeHtml(config.sidebarResultTitle)}</h3><p class="mb-0 text-white-50">Không có dữ liệu.</p>`;
    elements.sidebarQuote.innerHTML = `Không có dữ liệu.<span>— EMI</span>`;
  }

  function detailHref(id, config) {
    return `${config.detailPageUrl}?id=${encodeURIComponent(id)}`;
  }

  function buildCategoryUrl(category, item, config) {
    const listUrl = config.listPageUrl || "";
    const paramName = config.categoryParamName || "category";

    const categoryValue =
      item.categorySlug || item.categoryId || item.category || category;

    return `${listUrl}?${paramName}=${encodeURIComponent(categoryValue)}`;
  }

  function renderSidebar(items, currentId, config, elements) {
    const categoryMap = new Map();

    items.forEach((item) => {
      const label = item.category || config.defaultCategory;
      if (!label) return;

      if (!categoryMap.has(label)) {
        categoryMap.set(label, item);
      }
    });

    const categories = Array.from(categoryMap.entries());

    elements.categoryCloud.innerHTML = categories.length
      ? categories
          .map(([category, item]) => {
            return `
              <a href="${escapeAttr(buildCategoryUrl(category, item, config))}">
                ${escapeHtml(category)}
              </a>
            `;
          })
          .join("")
      : `<span class="text-muted small">Chưa có category.</span>`;

    const popular = items.filter((item) => item.id !== currentId).slice(0, 4);

    elements.popularPosts.innerHTML = popular.length
      ? popular
          .map(
            (item) => `
              <a href="${detailHref(item.id, config)}" class="popular-item">
                <img src="${escapeAttr(item.thumbnail || "assets/image/case-study-01.png")}" alt="${escapeAttr(item.title || config.defaultTitle)}">
                <div>
                  <strong>${escapeHtml(shortText(item.title || config.defaultTitle, 54))}</strong>
                  <small>${escapeHtml(item.category || config.defaultCategory)}</small>
                </div>
              </a>
            `,
          )
          .join("")
      : `<span class="text-muted small">Chưa có bài liên quan.</span>`;
  }

  async function loadSidebar(currentId, config, elements) {
    try {
      const snapshot = await db
        .collection(config.collectionName)
        .where("isDeleted", "==", false)
        .get();

      const items = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

      items.sort((a, b) => {
        const timeA =
          a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const timeB =
          b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      renderSidebar(items, currentId, config, elements);
    } catch (error) {
      console.error("Sidebar Error:", error);
      elements.categoryCloud.innerHTML = `<span class="text-muted small">Không tải được category.</span>`;
      elements.popularPosts.innerHTML = `<span class="text-muted small">Không tải được bài liên quan.</span>`;
    }
  }

  async function loadDetail(id, config, elements) {
    if (!id) {
      renderError(
        `Thiếu ID ${config.entityLabelLower}.`,
        `URL cần có dạng ${config.detailPageUrl}#DOCUMENT_ID hoặc ${config.detailPageUrl}?id=DOCUMENT_ID`,
        config,
        elements,
      );
      return;
    }

    try {
      if (typeof firebase === "undefined" || typeof db === "undefined") {
        throw new Error(
          "Firebase chưa được khởi tạo. Kiểm tra Firebase SDK và assets/js/shared/firebase.js.",
        );
      }

      const doc = await db.collection(config.collectionName).doc(id).get();

      if (!doc.exists) {
        renderError(
          `Không tìm thấy ${config.entityLabelLower}.`,
          "",
          config,
          elements,
        );
        return;
      }

      const item = { id: doc.id, ...doc.data() };

      updateOgMeta(item, config);

      if (item.isDeleted === true) {
        renderError(
          `${config.entityLabel} này không còn khả dụng.`,
          "",
          config,
          elements,
        );
        return;
      }

      document.title = `${item.title || config.defaultTitle} | EMI Insurance`;
      renderHero(item, config, elements);
      renderArticle(item, config, elements);
      renderCurrentSidebar(item, config, elements);
      loadSidebar(item.id, config, elements);
    } catch (error) {
      console.error("Firestore Error:", error);
      renderError(
        `Không thể tải ${config.entityLabelLower}.`,
        error.message || error.code || "Không rõ lỗi",
        config,
        elements,
      );
    }
  }

  function init(userConfig) {
    document.addEventListener("DOMContentLoaded", () => {
      const config = {
        defaultThumbnail: "assets/image/case-study-detail-bg.jpg",
        defaultConclusion:
          "Một hợp đồng tốt không phải là hợp đồng đắt nhất. Quan trọng nhất là khách hàng hiểu rõ mình đang được bảo vệ điều gì và quyền lợi đó có thực sự phù hợp với gia đình hay không.",
        defaultConclusionLabel: "EMI Insight",
        dateFields: ["updatedDate", "updatedAt"],
        readingTimeFields: ["readingTime"],
        defaultReadingTime: "4 phút",
        showVideo: false,
        showAuthor: true,
        canShare: false,
        ...userConfig,
      };

      const elements = {
        hero: document.getElementById(config.heroId),
        heroContent: document.getElementById("heroContent"),
        articleContent: document.getElementById("articleContent"),
        sidebarResults: document.getElementById("sidebarResults"),
        sidebarQuote: document.getElementById("sidebarQuote"),
        categoryCloud: document.getElementById("categoryCloud"),
        popularPosts: document.getElementById("popularPosts"),
      };

      loadDetail(getParamId(), config, elements);
    });
  }

  // Event click share
  document.addEventListener("click", async (event) => {
    const shareButton = event.target.closest(".open-share-popup");

    if (shareButton) {
      const popup = document.getElementById("sharePopup");
      const input = document.getElementById("sharePopupInput");
      const copyBtn = document.getElementById("copySharePopupBtn");

      if (!popup || !input) return;

      input.value = shareButton.dataset.shareUrl || "";
      popup.classList.add("show");
      input.select();

      if (copyBtn) {
        copyBtn.innerText = "Copy Link";
      }

      return;
    }

    if (
      event.target.id === "closeSharePopup" ||
      event.target.id === "sharePopup"
    ) {
      document.getElementById("sharePopup")?.classList.remove("show");
    }

    if (event.target.id === "copySharePopupBtn") {
      const input = document.getElementById("sharePopupInput");

      await navigator.clipboard.writeText(input.value);

      const btn = event.target;
      const oldText = btn.innerText;

      btn.innerText = "✓ Đã copy link";

      setTimeout(() => {
        btn.innerText = oldText;
      }, 1500);
    }
    // Copy link
    const button = event.target.closest(".copy-link");
    if (!button) return;

    const url = button.dataset.shareUrl;
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      const oldHtml = button.innerHTML;
      button.innerHTML = `<i class="fa-solid fa-check"></i>`;
      button.classList.add("copied");

      setTimeout(() => {
        button.innerHTML = oldHtml;
        button.classList.remove("copied");
      }, 1400);
    } catch (error) {
      alert("Không thể copy link. Bạn vui lòng copy thủ công.");
    }
  });

  window.EMIDetailPage = { init };
})();
