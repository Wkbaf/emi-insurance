(function () {
  const SITE_CONFIG_DOC = "config";
  const CACHE_KEY = "emi_site_config";

  function hidePartnerSection(section) {
    section.classList.remove("partner-section--pending");
    section.classList.add("partner-section--hidden");
    document.documentElement.setAttribute("data-partner-hidden", "true");
  }

  function showPartnerSection(section) {
    section.classList.remove("partner-section--pending", "partner-section--hidden");
    document.documentElement.removeAttribute("data-partner-hidden");
  }

  function cacheConfig(data) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          partnerSectionEnabled: data.partnerSectionEnabled !== false,
        }),
      );
    } catch (error) {
      console.log("Site config cache error:", error);
    }
  }

  function applyCachedConfig(section) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);

      if (!raw) return false;

      const data = JSON.parse(raw);

      if (data.partnerSectionEnabled === false) {
        hidePartnerSection(section);
        return true;
      }
    } catch (error) {
      console.log("Site config cache read error:", error);
    }

    return false;
  }

  async function applySiteConfig() {
    const section = document.getElementById("partners");

    if (!section) return;

    if (typeof db === "undefined") {
      if (!section.classList.contains("partner-section--hidden")) {
        showPartnerSection(section);
      }
      return;
    }

    try {
      const doc = await db.collection("siteSettings").doc(SITE_CONFIG_DOC).get();
      const data = doc.exists ? doc.data() : {};

      cacheConfig(data);

      if (data.partnerSectionEnabled === false) {
        hidePartnerSection(section);
      } else {
        showPartnerSection(section);
      }
    } catch (error) {
      console.log("Site config error:", error);

      if (!section.classList.contains("partner-section--hidden")) {
        showPartnerSection(section);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const section = document.getElementById("partners");

    if (!section) return;

    if (document.documentElement.getAttribute("data-partner-hidden") === "true") {
      hidePartnerSection(section);
      applySiteConfig();
      return;
    }

    applyCachedConfig(section);
    applySiteConfig();
  });
})();
