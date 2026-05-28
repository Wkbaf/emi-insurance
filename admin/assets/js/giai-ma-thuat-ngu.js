let currentPage = 1;
const ITEMS_PER_PAGE = 10;

const termModal = new bootstrap.Modal(document.getElementById("termModal"));
const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));

let terms = [];
let categories = [];
let categoriesLoaded = false;
let termsLoaded = false;

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadCategories();
  loadTerms();
});

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
  return category.categoryType || category.category_type || category.type || "";
}

function isCategoryDeleted(category) {
  return category.isDeleted === true || category.deleted === true;
}

function isTermCategory(category) {
  return getCategoryType(category) === "term" && !isCategoryDeleted(category);
}

function findCategoryByTerm(term) {
  if (!term) return null;

  return (
    categories.find((category) => category.id === term.categoryId) ||
    categories.find(
      (category) => getCategorySlug(category) === term.categorySlug,
    ) ||
    categories.find(
      (category) => getCategoryName(category) === term.category,
    ) ||
    null
  );
}

function getTermCategoryData(term) {
  const category = findCategoryByTerm(term);

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
    id: term.categoryId || "",
    name: term.category || "",
    slug: term.categorySlug || toSlug(term.category || ""),
    isDeleted: term.categoryIsDeleted === true,
    status: term.categoryStatus || "active",
  };
}

async function loadCategories() {
  try {
    db.collection("categories").onSnapshot(
      (snapshot) => {
        categories = [];

        snapshot.forEach((doc) => {
          const data = {
            id: doc.id,
            ...doc.data(),
          };

          if (isTermCategory(data)) {
            categories.push(data);
          }
        });

        categories.sort((a, b) => {
          const posA = Number(a.position || 0);
          const posB = Number(b.position || 0);

          if (posA !== posB) return posA - posB;

          return getCategoryName(a).localeCompare(getCategoryName(b), "vi");
        });

        categoriesLoaded = true;
        renderCategoryOptions();
        renderTerms();
      },
      (error) => {
        console.log("Load categories error:", error);
        document.getElementById("categoryWarning").classList.remove("d-none");
      },
    );
  } catch (error) {
    console.log(error);
    document.getElementById("categoryWarning").classList.remove("d-none");
  }
}

async function loadTerms() {
  try {
    db.collection("explainCards")
      .where("isDeleted", "==", false)
      .where("categoryIsDeleted", "==", false)
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          terms = [];

          snapshot.forEach((doc) => {
            terms.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          termsLoaded = true;
          renderTerms();
        },
        (error) => {
          console.log("Load terms error:", error);
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

  categorySelect.innerHTML = `
                <option value="">
                    Chọn category
                </option>
            `;

  categoryFilter.innerHTML = `
                <option value="all">
                    Tất cả danh mục
                </option>
            `;

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
                    </option>
                `;

    categoryFilter.innerHTML += `
                    <option value="${escapeHtml(category.id)}">
                        ${escapeHtml(name)}
                    </option>
                `;
  });
}

function renderTerms() {
  const tbody = document.getElementById("termTableBody");
  const emptyState = document.getElementById("emptyState");
  const pagination = document.getElementById("pagination");
  const paginationInfo = document.getElementById("paginationInfo");

  if (!termsLoaded) {
    tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-muted py-4">
                            Đang tải thuật ngữ...
                        </td>
                    </tr>
                `;
    emptyState.classList.add("d-none");
    pagination.innerHTML = "";
    paginationInfo.innerText = "";
    return;
  }

  const keyword = normalizeText(document.getElementById("searchInput").value);
  const categoryFilter = document.getElementById("categoryFilter").value;

  const filteredTerms = terms.filter((item) => {
    const categoryData = getTermCategoryData(item);

    const text = normalizeText(`
                    ${item.termName || ""}
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

  if (filteredTerms.length === 0) {
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");

  const { paginatedItems } = createPagination({
    items: filteredTerms,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    itemName: "thuật ngữ",
    onPageChange: (page) => {
      currentPage = page;
      renderTerms();
    },
  });

  paginatedItems.forEach((item) => {
    const categoryData = getTermCategoryData(item);
    const row = document.createElement("tr");

    row.innerHTML = `
                    <td>
                        <div class="term-title">
                            ${escapeHtml(item.termName || "")}
                        </div>

                        <small class="text-muted">
                            ${escapeHtml(shortText(item.description || "", 70))}
                        </small>
                    </td>

                    <td>
                        <span class="term-category">
                            ${escapeHtml(categoryData.name || "")}
                        </span>
                        ${categoryData.status && categoryData.status !== "active" ? ` <span class="term-category text-warning"> ${escapeHtml(categoryData.status)} </span>` : ""}
                    </td>

                    <td>
                        ${escapeHtml(shortText(item.video || "", 35))}
                    </td>

                    <td>
                        <small class="text-muted">
                            ${item.youtube ? "Có link" : "Chưa có"}
                        </small>
                    </td>

                    <td>
                        <button class="action-btn btn-view" onclick="viewTerm('${item.id}')" title="View">
                            <i class="bi bi-eye"></i>
                        </button>

                        <button class="action-btn btn-edit" onclick="editTerm('${item.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button class="action-btn btn-delete" onclick="deleteTerm('${item.id}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;

    tbody.appendChild(row);
  });
}

function openAddModal() {
  document.getElementById("modalTitle").innerText = "Thêm thuật ngữ";
  document.getElementById("termForm").reset();
  document.getElementById("editId").value = "";

  if (categories.length === 0) {
    alert("Chưa có category type term. Hãy thêm category trước.");
  }

  termModal.show();
}

function editTerm(id) {
  const item = terms.find((term) => term.id === id);

  if (!item) return;

  document.getElementById("modalTitle").innerText = "Sửa thuật ngữ";
  document.getElementById("editId").value = item.id;
  document.getElementById("termName").value = item.termName || "";
  const categoryData = getTermCategoryData(item);
  document.getElementById("category").value = categoryData.id || "";
  document.getElementById("video").value = item.video || "";
  document.getElementById("definition").value = item.definition || "";
  document.getElementById("simple").value = item.simple || "";
  document.getElementById("description").value = item.description || "";
  document.getElementById("youtube").value = item.youtube || "";
  document.getElementById("notes").value = Array.isArray(item.notes)
    ? item.notes.join("\n")
    : "";
  document.getElementById("termThumb").value = item.termThumb || "";

  termModal.show();
}

function viewTerm(id) {
  const item = terms.find((term) => term.id === id);

  if (!item) return;

  const categoryData = getTermCategoryData(item);

  document.getElementById("viewContent").innerHTML = `
                <div class="view-block">
                    <label>Tên thuật ngữ</label>
                    <p>${escapeHtml(item.termName || "")}</p>
                </div>

                <div class="view-block">
                    <label>Category</label>
                    <p>${escapeHtml(categoryData.name || "")}</p>
                </div>

                <div class="view-block">
                    <label>Category ID</label>
                    <p>${escapeHtml(categoryData.id || item.categoryId || "")}</p>
                </div>

                <div class="view-block">
                    <label>Category Slug</label>
                    <p>${escapeHtml(categoryData.slug || item.categorySlug || "")}</p>
                </div>

                <div class="view-block">
                    <label>Category Is Deleted</label>
                    <p>${categoryData.isDeleted ? "true" : "false"}</p>
                </div>

                <div class="view-block">
                    <label>Category Status</label>
                    <p>${escapeHtml(categoryData.status || "")}</p>
                </div>

                <div class="view-block">
                    <label>Video</label>
                    <p>${escapeHtml(item.video || "")}</p>
                </div>

                <div class="view-block">
                    <label>Definition</label>
                    <p>${escapeHtml(item.definition || "")}</p>
                </div>

                <div class="view-block">
                    <label>Simple</label>
                    <p>${escapeHtml(item.simple || "")}</p>
                </div>

                <div class="view-block">
                    <label>Description</label>
                    <p>${escapeHtml(item.description || "")}</p>
                </div>

                <div class="view-block">
                    <label>Youtube</label>
                    <p>${escapeHtml(item.youtube || "")}</p>
                </div>

                <div class="view-block">
                    <label>Thumbnail</label>
                    <p>${escapeHtml(item.termThumb || "")}</p>
                </div>

                <div class="view-block">
                    <label>Notes</label>
                    <ul class="mb-0">
                        ${(item.notes || []).map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
                    </ul>
                </div>
            `;

  viewModal.show();
}

async function deleteTerm(id) {
  const confirmDelete = confirm("Bạn có chắc muốn xóa thuật ngữ này không?");

  if (!confirmDelete) return;

  try {
    await db.collection("explainCards").doc(id).update({
      isDeleted: true,
      deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.log(error);
    alert("Xóa thất bại");
  }
}

document
  .getElementById("termForm")
  .addEventListener("submit", async function (e) {
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

    const categoryName = getCategoryName(selectedCategory);
    const categorySlug = getCategorySlug(selectedCategory);

    const data = {
      termName: document.getElementById("termName").value.trim(),
      categoryId: categoryId,
      category: categoryName,
      categorySlug: categorySlug,
      categoryIsDeleted: selectedCategory.isDeleted === true,
      categoryStatus: selectedCategory.status || "active",
      video: document.getElementById("video").value.trim(),
      definition: document.getElementById("definition").value.trim(),
      simple: document.getElementById("simple").value.trim(),
      description: document.getElementById("description").value.trim(),
      youtube: document.getElementById("youtube").value.trim(),
      termThumb: document.getElementById("termThumb").value.trim(),
      notes: document
        .getElementById("notes")
        .value.split("\n")
        .map((note) => note.trim())
        .filter((note) => note !== ""),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      if (editId) {
        await db.collection("explainCards").doc(editId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.isDeleted = false;

        await db.collection("explainCards").add(data);
      }

      termModal.hide();
      document.getElementById("termForm").reset();
    } catch (error) {
      console.log(error);
      alert("Lưu thất bại");
    }
  });

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
