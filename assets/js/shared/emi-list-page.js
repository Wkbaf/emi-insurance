window.EMIListPage = {
  init(config) {
    document.addEventListener("DOMContentLoaded", () => {
      const grid = document.getElementById(config.gridId);
      const empty = document.getElementById(config.emptyId);
      const loadMoreWrap = document.getElementById(config.loadMoreWrapId);
      const loadMoreBtn = document.getElementById(config.loadMoreBtnId);
      const clearSearchBtn = document.getElementById(config.clearSearchId);
      const searchInput = document.getElementById(config.searchInputId);
      const categoryTabs = document.getElementById(config.categoryTabsId);

      const PAGE_SIZE = config.pageSize || 6;

      let items = [];
      let categories = [];
      let activeCategory = "all";
      let searchKeyword = "";
      let visibleCount = PAGE_SIZE;

      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromUrl = urlParams.get(
        config.categoryParamName || "category",
      );

      if (categoryFromUrl) {
        activeCategory = categoryFromUrl;
      }

      function escapeHtml(text) {
        return String(text || "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      }

      function normalizeText(text) {
        return String(text || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      }

      function shortText(text, max = 130) {
        if (!text) return "";
        return text.length > max ? text.slice(0, max) + "..." : text;
      }

      function formatDate(value) {
        if (!value) return "";

        let date = null;

        if (value.toDate && typeof value.toDate === "function") {
          date = value.toDate();
        } else if (value.seconds) {
          date = new Date(value.seconds * 1000);
        } else {
          date = new Date(value);
        }

        if (!date || Number.isNaN(date.getTime())) return "";

        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      function getCategoryKey(item) {
        return item.categorySlug || item.categoryId || "";
      }

      function renderCategoryTabs() {
        categoryTabs.innerHTML = `
            <button class="case-tab-btn ${activeCategory === "all" ? "active" : ""}" data-filter="all">
              Tất cả
            </button>
          `;

        categories.forEach((category) => {
          const slug = category.slug || category.id;
          const name = category.name || "";

          categoryTabs.innerHTML += `
              <button class="case-tab-btn ${activeCategory === slug ? "active" : ""}" data-filter="${escapeHtml(slug)}">
                ${escapeHtml(name)}
              </button>
            `;
        });

        categoryTabs.querySelectorAll(".case-tab-btn").forEach((button) => {
          button.addEventListener("click", () => {
            categoryTabs.querySelectorAll(".case-tab-btn").forEach((btn) => {
              btn.classList.remove("active");
            });

            button.classList.add("active");
            activeCategory = button.dataset.filter || "all";
            renderCards(true);
          });
        });
      }

      function getFilteredItems() {
        const keyword = normalizeText(searchKeyword);

        return items.filter((item) => {
          const text = normalizeText(`
              ${item.title || ""}
              ${item.category || ""}
              ${item.description || ""}
              ${item.excerpt || ""}
              ${item.author || ""}
              ${item.cardQuote || ""}
              ${item.quote || ""}
            `);

          const matchSearch = !keyword || text.includes(keyword);
          const categoryKey = getCategoryKey(item);
          const matchCategory =
            activeCategory === "all" || categoryKey === activeCategory;

          return matchSearch && matchCategory;
        });
      }

      function renderCards(resetVisible = false) {
        if (resetVisible) {
          visibleCount = PAGE_SIZE;
        }

        grid.innerHTML = "";

        const filteredItems = getFilteredItems();
        const visibleItems = filteredItems.slice(0, visibleCount);

        visibleItems.forEach((item) => {
          const col = document.createElement("div");
          col.className = "col-lg-4 col-md-6 case-item";
          col.dataset.category = getCategoryKey(item);

          col.innerHTML = config.renderCard({
            item,
            escapeHtml,
            shortText,
            formatDate,
          });

          grid.appendChild(col);
        });

        const hasMore = filteredItems.length > visibleCount;

        if (loadMoreWrap) {
          loadMoreWrap.classList.toggle("d-none", !hasMore);
        }

        if (empty) {
          empty.classList.toggle("show", filteredItems.length === 0);
        }

        if (clearSearchBtn) {
          clearSearchBtn.classList.toggle("show", Boolean(searchKeyword));
        }
      }

      async function loadCategories() {
        const snapshot = await db
          .collection("categories")
          .where("type", "==", config.categoryType)
          .where("isDeleted", "==", false)
          .where("status", "==", "active")
          .orderBy("position", "asc")
          .get();

        categories = [];

        snapshot.forEach((doc) => {
          categories.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        renderCategoryTabs();
      }

      async function loadItems() {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
              ${config.loadingText || "Đang tải dữ liệu..."}
            </div>
          `;

        const snapshot = await db
          .collection(config.collectionName)
          .where("isDeleted", "==", false)
          .where("categoryIsDeleted", "==", false)
          .where("categoryStatus", "==", "active")
          .get();

        items = [];

        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        items.sort((a, b) => {
          const getTime = (item) => {
            const value = item.publishedAt || item.createdAt || item.updatedAt;

            if (!value) return 0;
            if (value.toMillis) return value.toMillis();
            if (value.seconds) return value.seconds * 1000;

            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? 0 : date.getTime();
          };

          return getTime(b) - getTime(a);
        });

        renderCards(true);
      }

      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          searchKeyword = e.target.value.trim();
          renderCards(true);
        });
      }

      if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener("click", () => {
          searchInput.value = "";
          searchKeyword = "";
          renderCards(true);
          searchInput.focus();
        });
      }

      if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", () => {
          visibleCount += PAGE_SIZE;
          renderCards(false);
        });
      }

      Promise.all([loadCategories(), loadItems()]).catch((error) => {
        console.error("EMIListPage error:", error);
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-danger">
              Không thể tải dữ liệu.
            </div>
          `;
      });
    });
  },
};
