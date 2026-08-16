(function () {
  const SITE_CONFIG_DOC = "config";
  const CACHE_KEY = "emi_site_config";

  const DEFAULT_ABOUT_IMAGE = "assets/image/image-about.jpg";

  const DEFAULT_ADVISOR_IMAGES = [
    "assets/image/advisor1.jpg",
    "assets/image/advisor2.jpg",
    "assets/image/advisor4.jpg",
    "assets/image/advisor3.jpg",
    "assets/image/advisor5.jpg",
  ];

  const DEFAULT_ADVISORS = [
    {
      id: "advisor-1",
      name: "Emi Ho",
      title: "Người Đồng Hành & Hoạch định Tổng thể",
      note: "(Trưởng dự án 4.0)",
      imageUrl: "",
    },
    {
      id: "advisor-2",
      name: "Lụa Nguyễn",
      title: "Cố vấn Hoạch định An sinh & Pháp lý",
      note: "(Phụ trách BHXH/BHYT)",
      imageUrl: "",
    },
    {
      id: "advisor-3",
      name: "Uyen Nguyen",
      title: "Chuyên viên Thẩm định Y tế",
      note: "(Phụ trách Thẻ sức khỏe & Bồi thường)",
      imageUrl: "",
    },
    {
      id: "advisor-4",
      name: "Cao Tiến Phi",
      title: "Chuyên gia Quản trị Rủi ro Tài sản",
      note: "(Phụ trách Phi nhân thọ)",
      imageUrl: "",
    },
    {
      id: "advisor-5",
      name: "Tuan Tran",
      title: "Chuyên viên Hoạch định Di sản",
      note: "(Phụ trách Nhân thọ chuyên sâu)",
      imageUrl: "",
    },
  ];

  function escapeHtml(text) {
    return String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatMultiline(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  function hidePartnerSection(section) {
    section.classList.remove("partner-section--pending");
    section.classList.add("partner-section--hidden");
    document.documentElement.setAttribute("data-partner-hidden", "true");
  }

  function showPartnerSection(section) {
    section.classList.remove("partner-section--pending", "partner-section--hidden");
    document.documentElement.removeAttribute("data-partner-hidden");
  }

  function normalizeAdvisors(data = {}) {
    if (Array.isArray(data.advisors) && data.advisors.length) {
      return data.advisors.map((advisor, index) => ({
        id: advisor.id || `advisor-${index + 1}`,
        name: advisor.name || DEFAULT_ADVISORS[index]?.name || "Cố vấn",
        title: advisor.title || DEFAULT_ADVISORS[index]?.title || "",
        note: advisor.note || DEFAULT_ADVISORS[index]?.note || "",
        imageUrl:
          advisor.imageUrl ||
          DEFAULT_ADVISOR_IMAGES[index] ||
          "assets/image/advisor.jpg",
      }));
    }

    const legacy = data.images?.advisors || {};

    return DEFAULT_ADVISORS.map((advisor, index) => ({
      ...advisor,
      imageUrl: legacy[`advisor${index + 1}`] || DEFAULT_ADVISOR_IMAGES[index],
    }));
  }

  function normalizeShareLinks(data = {}) {
    const legacyEnabled = data.shareLinkEnabled !== false;
    const links = data.shareLinks || {};

    return {
      blogDetail: links.blogDetail !== undefined ? links.blogDetail !== false : legacyEnabled,
      videoDetail: links.videoDetail !== undefined ? links.videoDetail !== false : legacyEnabled,
      caseStudyDetail: links.caseStudyDetail !== undefined ? links.caseStudyDetail !== false : legacyEnabled,
    };
  }

  function normalizeContactActionLinks(data = {}) {
    const legacyEnabled = data.contactActionEnabled !== false;
    const links = data.contactActionLinks || {};

    return {
      blogDetail: links.blogDetail !== undefined ? links.blogDetail !== false : legacyEnabled,
      videoDetail: links.videoDetail !== undefined ? links.videoDetail !== false : legacyEnabled,
      caseStudyDetail: links.caseStudyDetail !== undefined ? links.caseStudyDetail !== false : legacyEnabled,
    };
  }

  function buildCachePayload(data) {
    const images = data?.images || {};
    const rawAdvisors = Array.isArray(data.advisors) ? data.advisors : [];

    return {
      partnerSectionEnabled: data.partnerSectionEnabled !== false,
      shareLinks: normalizeShareLinks(data),
      contactActionLinks: normalizeContactActionLinks(data),
      images: {
        about: images.about || "",
      },
      advisors: rawAdvisors.length
        ? rawAdvisors.map((advisor, index) => ({
            id: advisor.id || `advisor-${index + 1}`,
            name: advisor.name || "",
            title: advisor.title || "",
            note: advisor.note || "",
            imageUrl: advisor.imageUrl || "",
          }))
        : DEFAULT_ADVISORS.map((advisor) => ({ ...advisor })),
    };
  }

  function cacheConfig(data) {
    try {
      const payload = buildCachePayload(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      window.__EMI_CONFIG_CACHE__ = payload;
    } catch (error) {
      console.log("Site config cache error:", error);
    }
  }

  function getCachedConfig() {
    if (window.__EMI_CONFIG_CACHE__) {
      return window.__EMI_CONFIG_CACHE__;
    }

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw);
      window.__EMI_CONFIG_CACHE__ = data;
      return data;
    } catch (error) {
      console.log("Site config cache read error:", error);
      return null;
    }
  }

  function markImageLoaded(wrap) {
    if (!wrap) return;
    wrap.classList.remove("config-image-wrap--pending");
  }

  function bindImageLoad(wrap, img) {
    if (!wrap || !img) return;

    wrap.classList.add("config-image-wrap--pending");

    const finish = () => markImageLoaded(wrap);

    if (img.complete && img.naturalWidth > 0) {
      finish();
      return;
    }

    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
  }

  function applyImageToElement(img, url) {
    if (!img || !url) return;

    const wrap =
      img.closest("[data-config-wrap]") ||
      img.closest(".config-image-wrap");

    bindImageLoad(wrap, img);

    if (img.getAttribute("src") !== url) {
      img.src = url;
    }
  }

  function applyAboutImage(data) {
    const images = data?.images || {};
    const aboutImage = document.querySelector('[data-config-image="about"]');
    const url = images.about || DEFAULT_ABOUT_IMAGE;

    applyImageToElement(aboutImage, url);
  }

  function renderAdvisorCard(advisor) {
    return `
      <article class="advisor-card">
        <div class="advisor-card-image config-image-wrap config-image-wrap--pending" data-config-wrap="${escapeHtml(advisor.id)}">
          <div class="config-image-loader" aria-hidden="true">
            <div class="spinner-border spinner-border-sm text-success" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
          </div>
          <img
            data-config-image="${escapeHtml(advisor.id)}"
            src="${escapeHtml(advisor.imageUrl)}"
            alt="${escapeHtml(advisor.name)}"
            loading="lazy"
          >
        </div>
        <div class="advisor-info">
          <h4>${escapeHtml(advisor.name)}</h4>
          <h5>${formatMultiline(advisor.title)}</h5>
          <p>${escapeHtml(advisor.note)}</p>
        </div>
      </article>
    `;
  }

  function renderAdvisors(data) {
    const grid = document.getElementById("advisorGrid");
    if (!grid) return;

    const advisors = normalizeAdvisors(data);
    grid.innerHTML = advisors.map(renderAdvisorCard).join("");

    advisors.forEach((advisor) => {
      const img = grid.querySelector(`[data-config-image="${advisor.id}"]`);
      applyImageToElement(img, advisor.imageUrl);
    });
  }

  function applyPartnerConfig(data) {
    const section = document.getElementById("partners");
    if (!section) return;

    if (data.partnerSectionEnabled === false) {
      hidePartnerSection(section);
      return;
    }

    showPartnerSection(section);
  }

  function applySiteData(data) {
    applyPartnerConfig(data);
    applyAboutImage(data);
    renderAdvisors(data);
  }

  function isShareLinkEnabled(pageKey, data) {
    const source = data || getCachedConfig() || {};
    const shareLinks = source.shareLinks || normalizeShareLinks(source);

    if (pageKey && shareLinks[pageKey] !== undefined) {
      return shareLinks[pageKey] !== false;
    }

    return source.shareLinkEnabled !== false;
  }

  function isContactActionEnabled(pageKey, data) {
    const source = data || getCachedConfig() || {};
    const contactActionLinks = source.contactActionLinks || normalizeContactActionLinks(source);

    if (pageKey && contactActionLinks[pageKey] !== undefined) {
      return contactActionLinks[pageKey] !== false;
    }

    return source.contactActionEnabled !== false;
  }

  async function loadSiteConfigData() {
    if (typeof db === "undefined") {
      return getCachedConfig() || {};
    }

    try {
      const doc = await db.collection("siteSettings").doc(SITE_CONFIG_DOC).get();
      const data = doc.exists ? doc.data() : {};

      cacheConfig(data);
      return data;
    } catch (error) {
      console.log("Site config error:", error);
      return getCachedConfig() || {};
    }
  }

  async function applySiteConfig() {
    const data = await loadSiteConfigData();

    const hasConfigTargets =
      document.getElementById("partners") ||
      document.getElementById("advisorGrid") ||
      document.querySelector('[data-config-image="about"]');

    if (!hasConfigTargets) return;

    applySiteData(data);
  }

  window.EMISiteConfig = {
    isShareLinkEnabled,
    getShareLinkEnabled: async function (pageKey) {
      const data = await loadSiteConfigData();
      return isShareLinkEnabled(pageKey, data);
    },
    isContactActionEnabled,
    getContactActionEnabled: async function (pageKey) {
      const data = await loadSiteConfigData();
      return isContactActionEnabled(pageKey, data);
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    const cached = getCachedConfig();
    const fallbackData = cached || { advisors: DEFAULT_ADVISORS };

    if (document.documentElement.getAttribute("data-partner-hidden") === "true") {
      const partnerSection = document.getElementById("partners");
      if (partnerSection) hidePartnerSection(partnerSection);
    } else if (cached) {
      applyPartnerConfig(cached);
    }

    applySiteData(fallbackData);
    applySiteConfig();
  });
})();
