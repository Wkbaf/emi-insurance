/**
 * Shared logic for video-detail.html and case-study-detail.html
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

  function formatMultiline(text) {
    return escapeHtml(text || "").replaceAll("\n", "<br>");
  }

  function renderList(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function getParamId() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get("id");

    if (!id && window.location.hash) {
      id = decodeURIComponent(window.location.hash.replace("#", ""));
    }

    return id;
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
        : url;
    } catch (error) {
      return url;
    }
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
    const title = getItemTitle(item, config);
    const description =
      item.description || item.excerpt || item.simple || title;
    const image =
      item.termThumb || item.thumbnail || config.defaultThumbnail || "";
    const url = window.location.href;

    document.title = `${title} | EMI Insurance`;

    setMeta("og:type", "article");
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:image:secure_url", image);
    setMeta("og:url", url);
  }

  function getItemTitle(item, config) {
    return item.termName || item.title || config.defaultTitle || "";
  }

  function getShareUrl(item, config) {
    if (typeof config.shareUrlBuilder === "function") {
      return config.shareUrlBuilder(item, config);
    }

    if (config.shareType) {
      return `https://share.emi-insurance.com/share?id=${encodeURIComponent(item.id)}&type=${encodeURIComponent(config.shareType)}`;
    }

    const origin = window.location.origin;
    const detailPath = config.detailPagePath || window.location.pathname;
    return `${origin}${detailPath}?id=${encodeURIComponent(item.id)}`;
  }

  function renderShareBox(item, config) {
    if (config.canShare !== true) return "";

    const shareUrl = getShareUrl(item, config);
    const title = getItemTitle(item, config);

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

  function renderVideoEmbed(item, config) {
    const rawUrl =
      item.youtube ||
      item.youtubeUrl ||
      item.videoUrl ||
      item.youtubeEmbedUrl ||
      "";
    const embedUrl =
      item.youtubeEmbedUrl || getYoutubeEmbedUrl(rawUrl) || rawUrl;

    if (!embedUrl) return "";

    return `
      <div class="modal-video-wrap">
        <iframe
          src="${escapeAttr(embedUrl)}"
          title="${escapeAttr(getItemTitle(item, config))}"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>
      </div>
    `;
  }

  function renderTermContent(item, config) {
    const notes = Array.isArray(item.notes) ? item.notes : [];

    return `
      <div class="video-detail-head">
        <span class="video-detail-category">${escapeHtml(item.category || config.defaultCategory || "")}</span>
        <h1>${escapeHtml(getItemTitle(item, config))}</h1>
        ${item.description ? `<p class="video-detail-description">${formatMultiline(item.description)}</p>` : ""}
      </div>

      ${renderVideoEmbed(item, config)}

      <div class="modal-content-grid">
        <div class="explain-card explain-full">
          <div class="explain-icon">
            <i class="bi bi-journal-text"></i>
          </div>
          <div class="explain-content">
            <span class="explain-label">1. Định nghĩa chuẩn</span>
            <p>${formatMultiline(item.definition)}</p>
          </div>
        </div>

        <div class="explain-card explain-full">
          <div class="explain-icon">
            <i class="bi bi-lightbulb"></i>
          </div>
          <div class="explain-content">
            <span class="explain-label">2. EMI “dịch”</span>
            <p>${formatMultiline(item.simple)}</p>
          </div>
        </div>

        <div class="explain-card explain-full">
          <div class="explain-icon warning">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <div class="explain-content">
            <span class="explain-label">3. Điều cần lưu ý</span>
            <ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <a href="#contact">Đặt lịch tư vấn ngay <i class="bi bi-arrow-right"></i></a>
      </div>

      ${renderShareBox(item, config)}
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

  function renderCaseStudyBody(item, config) {
    const conclusion = item.conclusion || config.defaultConclusion || "";
    const conclusionLabel =
      item.conclusionLabel || config.defaultConclusionLabel || "EMI Insight";

    if (item.detailContentType === "custom") {
      return `
        <div class="custom-content">
          ${sanitizeCustomHtml(item.customDetailHtml || "<p>Nội dung đang được cập nhật.</p>")}
        </div>
        ${
          conclusion
            ? `
          <div class="case-conclusion">
            <div class="case-conclusion-label">${escapeHtml(conclusionLabel)}</div>
            <p>${escapeHtml(conclusion)}</p>
          </div>
        `
            : ""
        }
      `;
    }

    return `
      <div class="timeline">
        ${renderSections(item.detailSections || [], config.entityLabel || "Case study")}
      </div>
      ${
        conclusion
          ? `
        <div class="case-conclusion">
          <div class="case-conclusion-label">${escapeHtml(conclusionLabel)}</div>
          <p>${escapeHtml(conclusion)}</p>
        </div>
      `
          : ""
      }
    `;
  }

  function renderCaseStudyContent(item, config) {
    return `
      <div class="video-detail-head">
        <span class="video-detail-category">${escapeHtml(item.category || config.defaultCategory || "")}</span>
        <h1>${escapeHtml(getItemTitle(item, config))}</h1>
        ${item.description ? `<p class="video-detail-description">${formatMultiline(item.description)}</p>` : ""}
      </div>

      ${renderVideoEmbed(item, config)}
      ${renderCaseStudyBody(item, config)}
      ${renderShareBox(item, config)}
    `;
  }

  function renderContent(item, config) {
    if (config.contentType === "term") {
      return renderTermContent(item, config);
    }

    return renderCaseStudyContent(item, config);
  }

  function detailHref(id, config) {
    const path = config.detailPagePath || window.location.pathname;
    return `${path}?id=${encodeURIComponent(id)}`;
  }

  function buildCategoryUrl(category, item, config) {
    const listUrl = config.listPageUrl || "";
    const paramName = config.categoryParamName || "category";
    const categoryValue =
      item.categorySlug || item.categoryId || item.category || category;

    return `${listUrl}?${paramName}=${encodeURIComponent(categoryValue)}`;
  }

  function getFeaturedThumbnail(item, config) {
    return (
      item.termThumb ||
      item.thumbnail ||
      config.defaultThumbnail ||
      "assets/image/default-thumbnail.jpg"
    );
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
                <img src="${escapeAttr(getFeaturedThumbnail(item, config))}" alt="${escapeAttr(getItemTitle(item, config))}" loading="lazy">
                <div>
                  <strong>${escapeHtml(shortText(getItemTitle(item, config), 54))}</strong>
                  <small>${escapeHtml(item.category || config.defaultCategory || "")}</small>
                </div>
              </a>
            `,
          )
          .join("")
      : `<span class="text-muted small">Chưa có bài liên quan.</span>`;
  }

  async function loadSidebarItems(currentId, config, elements) {
    try {
      let query = db.collection(config.collectionName).where("isDeleted", "==", false);

      if (config.filterActiveCategory !== false) {
        query = query
          .where("categoryIsDeleted", "==", false)
          .where("categoryStatus", "==", "active");
      }

      const snapshot = await query.get();
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

  function renderError(message, detail, config, elements) {
    elements.articleContent.innerHTML = `
      <div class="error-box">
        <div class="fw-bold mb-2">${escapeHtml(message)}</div>
        ${detail ? `<div class="small">${escapeHtml(detail)}</div>` : ""}
      </div>
    `;

    const categoryEl = document.getElementById("pageCategory");
    if (categoryEl) {
      categoryEl.textContent = config.defaultCategory || "";
    }
  }

  async function loadDetail(id, config, elements) {
    if (!id) {
      renderError(
        `Thiếu ID ${config.entityLabelLower || "nội dung"}.`,
        `URL cần có dạng ${config.detailPagePath || "detail.html"}?id=DOCUMENT_ID`,
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
          `Không tìm thấy ${config.entityLabelLower || "nội dung"}.`,
          "",
          config,
          elements,
        );
        return;
      }

      const item = { id: doc.id, ...doc.data() };

      if (item.isDeleted === true) {
        renderError(
          `${config.entityLabel || "Nội dung"} này không còn khả dụng.`,
          "",
          config,
          elements,
        );
        return;
      }

      updateOgMeta(item, config);

      const categoryEl = document.getElementById("pageCategory");
      if (categoryEl) {
        categoryEl.textContent = item.category || config.defaultCategory || "";
      }

      elements.articleContent.innerHTML = renderContent(item, config);
      loadSidebarItems(item.id, config, elements);
    } catch (error) {
      console.error("Firestore Error:", error);
      renderError(
        `Không thể tải ${config.entityLabelLower || "nội dung"}.`,
        error.message || error.code || "Không rõ lỗi",
        config,
        elements,
      );
    }
  }

  function initShareHandlers() {
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
  }

  function init(userConfig) {
    document.addEventListener("DOMContentLoaded", () => {
      const config = {
        defaultThumbnail: "assets/image/default-thumbnail.jpg",
        defaultConclusion:
          "Một hợp đồng tốt không phải là hợp đồng đắt nhất. Quan trọng nhất là khách hàng hiểu rõ mình đang được bảo vệ điều gì và quyền lợi đó có thực sự phù hợp với gia đình hay không.",
        defaultConclusionLabel: "EMI Insight",
        categoryParamName: "category",
        canShare: true,
        filterActiveCategory: true,
        contentType: "term",
        ...userConfig,
      };

      const elements = {
        articleContent: document.getElementById("articleContent"),
        categoryCloud: document.getElementById("categoryCloud"),
        popularPosts: document.getElementById("popularPosts"),
      };

      loadDetail(getParamId(), config, elements);
    });
  }

  if (!window.EMIVideoShareHandlersInitialized) {
    initShareHandlers();
    window.EMIVideoShareHandlersInitialized = true;
  }

  window.EMIVideoDetailPage = { init };
})();
