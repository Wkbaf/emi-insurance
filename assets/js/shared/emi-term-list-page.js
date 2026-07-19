/**
 * Shared listing page logic for giai-ma-thuat-ngu.html and case-study-thuc-te.html
 */
window.EMITermListPage = {
  init(config) {
    document.addEventListener("DOMContentLoaded", () => {
      const tabsWrap = document.getElementById(config.categoryTabsId);
      const searchInput = document.getElementById(config.searchInputId);
      const clearBtn = document.getElementById(config.clearSearchId);
      const empty = document.getElementById(config.emptyId);
      const grid = document.getElementById(config.gridId);
      const loadMoreBtn = document.getElementById(config.loadMoreBtnId);
      const ITEMS_PER_PAGE = config.pageSize || 6;

      let visibleLimit = ITEMS_PER_PAGE;
      let items = [];
      let categories = [];
      let activeCategory = "all";
      let unsubscribeItems = null;
      let unsubscribeCategories = null;

      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromUrl = urlParams.get(config.categoryParamName || "category");
      if (categoryFromUrl) {
        activeCategory = categoryFromUrl;
      }

      function normalize(text) {
        return String(text || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      }

      function escapeHtml(text) {
        return String(text || "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      }

      function shortText(text, max = 90) {
        if (!text) return "";
        return text.length > max ? text.slice(0, max) + "..." : text;
      }

      function createSlug(text) {
        return String(text || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }

      function getCategorySlug(item) {
        if (item.categorySlug) return item.categorySlug;

        const matched = categories.find(
          (category) => category.name === item.category,
        );
        return matched ? matched.slug : createSlug(item.category || "other");
      }

      function getDetailUrl(id) {
        if (!id) return config.detailPageUrl;
        return `${config.detailPageUrl}?id=${encodeURIComponent(id)}`;
      }

      function navigateToDetail(id) {
        if (!id) return;
        window.location.href = getDetailUrl(id);
      }

      function renderCategoryTabs() {
        const activeExists =
          activeCategory === "all" ||
          categories.some((category) => category.slug === activeCategory);
        if (!activeExists) activeCategory = "all";

        tabsWrap.innerHTML = `
          <button class="term-tab ${activeCategory === "all" ? "active" : ""}" data-category="all">
            Tất cả
          </button>
          ${categories
            .map(
              (category) => `
              <button class="term-tab ${activeCategory === category.slug ? "active" : ""}" data-category="${escapeHtml(category.slug)}">
                ${escapeHtml(category.name)}
              </button>
            `,
            )
            .join("")}
        `;

        tabsWrap.querySelectorAll(".term-tab").forEach((tab) => {
          tab.addEventListener("click", () => {
            tabsWrap
              .querySelectorAll(".term-tab")
              .forEach((item) => item.classList.remove("active"));
            tab.classList.add("active");
            activeCategory = tab.dataset.category;
            visibleLimit = ITEMS_PER_PAGE;
            filterItems();
          });
        });
      }

      function buildSearchKeywords(item) {
        if (typeof config.buildSearchKeywords === "function") {
          return normalize(config.buildSearchKeywords(item));
        }

        return normalize(`
          ${item.termName || ""}
          ${item.title || ""}
          ${item.category || ""}
          ${item.categorySlug || ""}
          ${item.video || ""}
          ${item.definition || ""}
          ${item.simple || ""}
          ${item.description || ""}
        `);
      }

      function renderCards() {
        grid.innerHTML = "";

        items.forEach((item, index) => {
          const article = document.createElement("article");
          article.className = index === 0 ? "term-card active" : "term-card";
          article.dataset.id = item.id;
          article.dataset.category = getCategorySlug(item);
          article.dataset.keywords = buildSearchKeywords(item);

          article.innerHTML =
            typeof config.renderCard === "function"
              ? config.renderCard({ item, escapeHtml, shortText, getDetailUrl })
              : "";

          article.addEventListener("click", (event) => {
            if (event.target.closest("a[href]")) return;

            const id = article.dataset.id;
            if (id) navigateToDetail(id);
          });

          grid.appendChild(article);
        });

        filterItems();
      }

      function filterItems() {
        const keyword = normalize(searchInput.value.trim());
        let matchedCards = [];
        const cards = Array.from(document.querySelectorAll(".term-card"));

        cards.forEach((card) => {
          const matchCategory =
            activeCategory === "all" || card.dataset.category === activeCategory;
          const text = normalize(card.innerText + " " + card.dataset.keywords);
          const matchSearch = !keyword || text.includes(keyword);
          const matched = matchCategory && matchSearch;

          card.hidden = true;
          if (matched) matchedCards.push(card);
        });

        matchedCards.forEach((card, index) => {
          card.hidden = index >= visibleLimit;
        });

        clearBtn.classList.toggle("show", searchInput.value.length > 0);
        empty.classList.toggle("show", matchedCards.length === 0);
        loadMoreBtn.style.display =
          matchedCards.length > visibleLimit ? "inline-flex" : "none";
      }

      function loadCategoriesFromFirebase() {
        try {
          unsubscribeCategories = db
            .collection("categories")
            .where("isDeleted", "==", false)
            .where("type", "==", config.categoryType)
            .where("status", "==", "active")
            .orderBy("position", "asc")
            .onSnapshot(
              (snapshot) => {
                categories = [];

                snapshot.forEach((doc) => {
                  categories.push({
                    id: doc.id,
                    ...doc.data(),
                  });
                });

                renderCategoryTabs();
                renderCards();
              },
              (error) => {
                console.log(error);
                tabsWrap.innerHTML = `<button class="term-tab active" data-category="all">Tất cả</button>`;
              },
            );
        } catch (error) {
          console.log(error);
        }
      }

      function loadItemsFromFirebase() {
        try {
          grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:40px;">
              ${escapeHtml(config.loadingText || "Đang tải dữ liệu...")}
            </div>
          `;

          unsubscribeItems = db
            .collection(config.collectionName)
            .where("isDeleted", "==", false)
            .where("categoryIsDeleted", "==", false)
            .where("categoryStatus", "==", "active")
            .orderBy("createdAt", "desc")
            .onSnapshot(
              (snapshot) => {
                items = [];

                snapshot.forEach((doc) => {
                  items.push({
                    id: doc.id,
                    ...doc.data(),
                  });
                });

                renderCards();
              },
              (error) => {
                console.log(error);
                grid.innerHTML = `
                  <div style="grid-column: 1 / -1; text-align:center; padding:40px; color:red;">
                    Không thể tải dữ liệu.
                  </div>
                `;
              },
            );
        } catch (error) {
          console.log(error);
          grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:40px; color:red;">
              Không thể tải dữ liệu.
            </div>
          `;
        }
      }

      searchInput.addEventListener("input", () => {
        visibleLimit = ITEMS_PER_PAGE;
        filterItems();
      });

      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.focus();
        filterItems();
      });

      loadMoreBtn.addEventListener("click", () => {
        visibleLimit += ITEMS_PER_PAGE;
        filterItems();
      });

      window.addEventListener("beforeunload", () => {
        if (typeof unsubscribeItems === "function") unsubscribeItems();
        if (typeof unsubscribeCategories === "function")
          unsubscribeCategories();
      });

      loadCategoriesFromFirebase();
      loadItemsFromFirebase();
    });
  },
};
