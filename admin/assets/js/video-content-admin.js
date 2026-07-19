/**
 * Shared admin CRUD for video-style content (explainCards, caseStudyVideos, ...)
 */
window.VideoContentAdmin = {
  create(config) {
    let currentPage = 1;
    const ITEMS_PER_PAGE = 10;

    let items = [];
    let categories = [];
    let categoriesLoaded = false;
    let itemsLoaded = false;

    const termModal = new bootstrap.Modal(document.getElementById("termModal"));
    const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));

    function normalizeText(text) {
      return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();
    }

    function toSlug(text) {
      return normalizeText(text)
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    function getCategoryName(category) {
      return category.name || category.title || category.categoryName || "";
    }

    function getCategorySlug(category) {
      return category.slug || toSlug(getCategoryName(category));
    }

    function getCategoryType(category) {
      return (
        category.categoryType || category.category_type || category.type || ""
      );
    }

    function isCategoryDeleted(category) {
      return category.isDeleted === true || category.deleted === true;
    }

    function isTargetCategory(category) {
      return (
        getCategoryType(category) === config.categoryType &&
        !isCategoryDeleted(category)
      );
    }

    function findCategoryByItem(item) {
      if (!item) return null;

      return (
        categories.find((category) => category.id === item.categoryId) ||
        categories.find(
          (category) => getCategorySlug(category) === item.categorySlug,
        ) ||
        categories.find(
          (category) => getCategoryName(category) === item.category,
        ) ||
        null
      );
    }

    function getItemCategoryData(item) {
      const category = findCategoryByItem(item);

      if (category) {
        return {
          id: category.id || "",
          name: getCategoryName(category),
          slug: getCategorySlug(category),
          isDeleted: category.isDeleted === true,
          status: category.status || "active",
        };
      }

      return {
        id: item.categoryId || "",
        name: item.category || "",
        slug: item.categorySlug || toSlug(item.category || ""),
        isDeleted: item.categoryIsDeleted === true,
        status: item.categoryStatus || "active",
      };
    }

    function getItemTitle(item) {
      return item[config.titleField] || item.termName || item.title || "";
    }

    function getItemThumb(item) {
      return item[config.thumbField] || item.termThumb || item.thumbnail || "";
    }

    function setItemTitle(value) {
      document.getElementById(config.titleInputId).value = value || "";
    }

    function setItemThumb(value) {
      document.getElementById(config.thumbInputId).value = value || "";
    }

    async function loadCategories() {
      try {
        db.collection("categories").onSnapshot(
          (snapshot) => {
            categories = [];

            snapshot.forEach((doc) => {
              const data = { id: doc.id, ...doc.data() };
              if (isTargetCategory(data)) categories.push(data);
            });

            categories.sort((a, b) => {
              const posA = Number(a.position || 0);
              const posB = Number(b.position || 0);
              if (posA !== posB) return posA - posB;
              return getCategoryName(a).localeCompare(getCategoryName(b), "vi");
            });

            categoriesLoaded = true;
            renderCategoryOptions();
            renderItems();
          },
          () => {
            document
              .getElementById("categoryWarning")
              .classList.remove("d-none");
          },
        );
      } catch (error) {
        console.log(error);
        document.getElementById("categoryWarning").classList.remove("d-none");
      }
    }

    async function loadItems() {
      try {
        db.collection(config.collectionName)
          .where("isDeleted", "==", false)
          .where("categoryIsDeleted", "==", false)
          .orderBy("createdAt", "desc")
          .onSnapshot(
            (snapshot) => {
              items = [];
              snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
              });
              itemsLoaded = true;
              renderItems();
            },
            (error) => {
              console.log("Load items error:", error);
            },
          );
      } catch (error) {
        console.log(error);
      }
    }

    function renderCategoryOptions() {
      const categorySelect = document.getElementById("category");
      const categoryFilter = document.getElementById("categoryFilter");
      const warning = document.getElementById("categoryWarning");

      categorySelect.innerHTML = `<option value="">Chọn category</option>`;
      categoryFilter.innerHTML = `<option value="all">Tất cả danh mục</option>`;

      if (categories.length === 0) {
        warning.classList.remove("d-none");
        return;
      }

      warning.classList.add("d-none");

      categories.forEach((category) => {
        const name = getCategoryName(category);
        const slug = getCategorySlug(category);
        if (!name) return;

        categorySelect.innerHTML += `
          <option value="${escapeHtml(category.id)}" data-slug="${escapeHtml(slug)}">
            ${escapeHtml(name)}
          </option>`;

        categoryFilter.innerHTML += `
          <option value="${escapeHtml(category.id)}">
            ${escapeHtml(name)}
          </option>`;
      });
    }

    function renderItems() {
      const tbody = document.getElementById("termTableBody");
      const emptyState = document.getElementById("emptyState");
      const pagination = document.getElementById("pagination");
      const paginationInfo = document.getElementById("paginationInfo");

      if (!itemsLoaded) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-muted py-4">
              Đang tải ${escapeHtml(config.itemLabelLower)}...
            </td>
          </tr>`;
        emptyState.classList.add("d-none");
        pagination.innerHTML = "";
        paginationInfo.innerText = "";
        return;
      }

      const keyword = normalizeText(
        document.getElementById("searchInput").value,
      );
      const categoryFilter = document.getElementById("categoryFilter").value;

      const filteredItems = items.filter((item) => {
        const categoryData = getItemCategoryData(item);
        const text = normalizeText(`
          ${getItemTitle(item)}
          ${categoryData.name || ""}
          ${categoryData.slug || ""}
          ${item.category || ""}
          ${item.categorySlug || ""}
          ${item.video || ""}
          ${item.definition || ""}
          ${item.simple || ""}
          ${item.description || ""}
        `);

        const matchSearch = !keyword || text.includes(keyword);
        const matchCategory =
          categoryFilter === "all" || categoryData.id === categoryFilter;

        return matchSearch && matchCategory;
      });

      tbody.innerHTML = "";
      pagination.innerHTML = "";
      paginationInfo.innerText = "";

      if (filteredItems.length === 0) {
        emptyState.classList.remove("d-none");
        return;
      }

      emptyState.classList.add("d-none");

      const { paginatedItems } = createPagination({
        items: filteredItems,
        currentPage: Number(window.currentPage) || currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
        itemName: config.itemLabelLower,
        onPageChange: (page) => {
          currentPage = page;
          window.currentPage = page;
          renderItems();
        },
      });

      paginatedItems.forEach((item) => {
        const categoryData = getItemCategoryData(item);
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>
            <div class="term-title">${escapeHtml(getItemTitle(item))}</div>
            <small class="text-muted">${escapeHtml(shortText(item.description || "", 70))}</small>
          </td>
          <td>
            <span class="term-category">${escapeHtml(categoryData.name || "")}</span>
            ${
              categoryData.status && categoryData.status !== "active"
                ? `<span class="term-category text-warning">${escapeHtml(categoryData.status)}</span>`
                : ""
            }
          </td>
          <td>${escapeHtml(shortText(item.video || "", 35))}</td>
          <td><small class="text-muted">${item.youtube ? "Có link" : "Chưa có"}</small></td>
          <td>
            <button class="action-btn btn-view" onclick="viewItem('${item.id}')" title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button class="action-btn btn-edit" onclick="editItem('${item.id}')" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="action-btn btn-delete" onclick="deleteItem('${item.id}')" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </td>`;

        tbody.appendChild(row);
      });
    }

    function openAddModal() {
      document.getElementById("modalTitle").innerText = config.addModalTitle;
      document.getElementById("termForm").reset();
      document.getElementById("editId").value = "";

      if (categories.length === 0) {
        alert(config.noCategoryMessage);
      }

      termModal.show();
    }

    function editItem(id) {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;

      const categoryData = getItemCategoryData(item);

      document.getElementById("modalTitle").innerText = config.editModalTitle;
      document.getElementById("editId").value = item.id;
      setItemTitle(getItemTitle(item));
      document.getElementById("category").value = categoryData.id || "";
      document.getElementById("video").value = item.video || "";
      document.getElementById("definition").value = item.definition || "";
      document.getElementById("simple").value = item.simple || "";
      document.getElementById("description").value = item.description || "";
      document.getElementById("youtube").value = item.youtube || "";
      document.getElementById("notes").value = Array.isArray(item.notes)
        ? item.notes.join("\n")
        : "";
      setItemThumb(getItemThumb(item));

      termModal.show();
    }

    function multiline(text) {
      return escapeHtml(text || "").replaceAll("\n", "<br>");
    }

    function viewItem(id) {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;

      const categoryData = getItemCategoryData(item);

      document.getElementById("viewContent").innerHTML = `
        <div class="view-block"><label>${escapeHtml(config.titleLabel)}</label><p>${escapeHtml(getItemTitle(item))}</p></div>
        <div class="view-block"><label>Category</label><p>${escapeHtml(categoryData.name || "")}</p></div>
        <div class="view-block"><label>Video</label><p>${escapeHtml(item.video || "")}</p></div>
        <div class="view-block"><label>Definition</label><p>${multiline(item.definition)}</p></div>
        <div class="view-block"><label>Simple</label><p>${multiline(item.simple)}</p></div>
        <div class="view-block"><label>Description</label><p>${multiline(item.description)}</p></div>
        <div class="view-block"><label>Youtube</label><p>${escapeHtml(item.youtube || "")}</p></div>
        <div class="view-block"><label>Thumbnail</label><p>${escapeHtml(getItemThumb(item))}</p></div>
        <div class="view-block"><label>Notes</label><ul class="mb-0">${(item.notes || []).map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul></div>`;

      viewModal.show();
    }

    async function deleteItem(id) {
      if (!confirm(config.deleteConfirmMessage)) return;

      try {
        await db.collection(config.collectionName).doc(id).update({
          isDeleted: true,
          deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.log(error);
        alert("Xóa thất bại");
      }
    }

    function buildSaveData(selectedCategory) {
      const categoryName = getCategoryName(selectedCategory);
      const categorySlug = getCategorySlug(selectedCategory);
      const titleValue = document
        .getElementById(config.titleInputId)
        .value.trim();
      const thumbValue = document.getElementById(config.thumbInputId).value.trim();

      const data = {
        categoryId: selectedCategory.id,
        category: categoryName,
        categorySlug,
        categoryIsDeleted: selectedCategory.isDeleted === true,
        categoryStatus: selectedCategory.status || "active",
        video: document.getElementById("video").value.trim(),
        definition: document.getElementById("definition").value.trim(),
        simple: document.getElementById("simple").value.trim(),
        description: document.getElementById("description").value.trim(),
        youtube: document.getElementById("youtube").value.trim(),
        notes: document
          .getElementById("notes")
          .value.split("\n")
          .map((note) => note.trim())
          .filter(Boolean),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      data[config.titleField] = titleValue;
      data[config.thumbField] = thumbValue;

      if (config.titleField !== "termName") data.termName = titleValue;
      if (config.thumbField !== "termThumb") data.termThumb = thumbValue;
      if (config.titleField !== "title") data.title = titleValue;
      if (config.thumbField !== "thumbnail") data.thumbnail = thumbValue;

      return data;
    }

    function bindFormSubmit() {
      document.getElementById("termForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const editId = document.getElementById("editId").value;
        const categoryId = document.getElementById("category").value;
        const selectedCategory = categories.find(
          (category) => category.id === categoryId,
        );

        if (!categoryId || !selectedCategory) {
          alert("Vui lòng chọn category");
          return;
        }

        const data = buildSaveData(selectedCategory);

        try {
          if (editId) {
            await db.collection(config.collectionName).doc(editId).update(data);
          } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            data.isDeleted = false;
            await db.collection(config.collectionName).add(data);
          }

          termModal.hide();
          document.getElementById("termForm").reset();
        } catch (error) {
          console.log(error);
          alert("Lưu thất bại");
        }
      });
    }

    function initPage() {
      bindFormSubmit();
      loadCategories();
      loadItems();

      window.openAddModal = openAddModal;
      window.editItem = editItem;
      window.viewItem = viewItem;
      window.deleteItem = deleteItem;
      window.renderItems = () => {
        currentPage = Number(window.currentPage) || 1;
        renderItems();
      };

      document.getElementById("searchInput").addEventListener("input", () => {
        currentPage = 1;
        window.currentPage = 1;
        renderItems();
      });

      const categoryFilter = document.getElementById("categoryFilter");
      if (categoryFilter) {
        categoryFilter.addEventListener("change", () => {
          currentPage = 1;
          window.currentPage = 1;
          renderItems();
        });
      }

      window.currentPage = 1;
    }

    return { initPage };
  },
};

function shortText(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
