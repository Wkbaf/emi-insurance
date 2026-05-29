const MAX_THUMBNAIL_SIZE = 800 * 1024;

// PAGINATE
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

const defaultSections = [
  {
    number: "01",
    title: "Vấn đề thường gặp",
    content:
      "Nhiều người trẻ bắt đầu đi làm có thu nhập ổn định nhưng chưa có kế hoạch hưu trí rõ ràng. Tiền tiết kiệm thường bị dùng cho các mục tiêu ngắn hạn, còn câu chuyện nghỉ hưu bị đẩy về tương lai rất xa.",
    bullets: [],
  },
  {
    number: "02",
    title: "Nguyên nhân",
    content:
      "Có 5 nguyên nhân thường gặp khiến kế hoạch hưu trí tự nguyện bị trì hoãn:",
    bullets: [
      "Chưa hình dung rõ số tiền cần có khi nghỉ hưu",
      "Ưu tiên tiêu dùng hiện tại hơn tích lũy dài hạn",
      "Không biết bắt đầu với số tiền nhỏ như thế nào",
      "Nhầm lẫn giữa tiết kiệm, bảo hiểm và đầu tư",
    ],
    note: "Quan trọng nhất: kế hoạch càng bắt đầu muộn thì áp lực tích lũy càng lớn.",
  },
  {
    number: "03",
    title: "Góc nhìn chuyên gia",
    content:
      "EMI gợi ý người trẻ bắt đầu bằng một kế hoạch nhỏ, đều đặn và có thể điều chỉnh theo từng giai đoạn thu nhập.",
    bullets: [
      "Xác định mục tiêu hưu trí theo mức sống mong muốn",
      "Tách riêng quỹ dự phòng, quỹ bảo vệ và quỹ tích lũy",
      "Bắt đầu bằng khoản đóng phù hợp với dòng tiền",
      "Đánh giá lại kế hoạch mỗi 6-12 tháng",
    ],
    note: "Triết lý phù hợp: làm chậm, hiểu đúng, rồi mới cam kết dài hạn.",
  }
];

const blogModal = new bootstrap.Modal(document.getElementById("blogModal"));
const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));

let blogs = [];
let blogCategories = [];
let defaultBlogCategory = "";

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  renderDetailSectionInputs(defaultSections);
  loadBlogCategories();
  loadBlogs();
});

// =========================
// Category helpers
// =========================

function getCategoryName(category) {
  return category.name || category.title || category.categoryName || "";
}

function getCategorySlug(category) {
  return category.slug || createSlug(getCategoryName(category));
}

function getCategoryStatus(category) {
  return category.status || "active";
}

function isCategoryDeleted(category) {
  return category.isDeleted === true || category.deleted === true;
}

function getBlogCategory(item) {
  const categoryId = item.categoryId || "";

  let matchedCategory = blogCategories.find((category) => {
    return category.id === categoryId;
  });

  if (!matchedCategory) {
    matchedCategory = blogCategories.find((category) => {
      const slug = getCategorySlug(category);
      const name = getCategoryName(category);

      return (
        slug === item.categorySlug ||
        slug === item.category ||
        name === item.category
      );
    });
  }

  if (matchedCategory) {
    return {
      id: matchedCategory.id,
      name: getCategoryName(matchedCategory),
      slug: getCategorySlug(matchedCategory),
      isDeleted: isCategoryDeleted(matchedCategory),
      status: getCategoryStatus(matchedCategory),
    };
  }

  return {
    id: categoryId,
    name: item.category || "",
    slug: item.categorySlug || item.category || "",
    isDeleted: item.categoryIsDeleted === true,
    status: item.categoryStatus || "",
  };
}

function renderCategoryLabel(categoryData) {
  const name = categoryData.name || "Không có category";

  if (categoryData.isDeleted) {
    return `
                    <span class="term-category bg-danger text-white">
                        ${escapeHtml(name)}
                    </span>
                    <div class="small text-danger mt-1">
                        Category đã xóa
                    </div>
                `;
  }

  if (categoryData.status && categoryData.status !== "active") {
    return `
                    <span class="term-category">
                        ${escapeHtml(name)}
                    </span>
                    <span class="term-category text-warning mt-1">
                        ${escapeHtml(categoryData.status)}
                    </span>
                `;
  }

  return `
                <span class="term-category">
                    ${escapeHtml(name)}
                </span>
            `;
}

async function loadBlogs() {
  try {
    const snapshot = await db
      .collection("blogs")
      .where("isDeleted", "==", false)
      .where("categoryIsDeleted", "==", false)
      .orderBy("createdAt", "desc")
      .get();

    blogs = [];

    snapshot.forEach((doc) => {
      blogs.push({ id: doc.id, ...doc.data() });
    });

    renderBlogs();
  } catch (error) {
    console.log(error);
  }
}

async function loadBlogCategories() {
  try {
    const filterSelect = document.getElementById("categoryFilter");
    const formSelect = document.getElementById("category");

    const snapshot = await db
      .collection("categories")
      .where("type", "==", "blog")
      .where("isDeleted", "==", false)
      .where("status", "==", "active")
      .orderBy("position", "asc")
      .get();

    blogCategories = [];
    defaultBlogCategory = "";

    filterSelect.innerHTML = `
                    <option value="all">
                        Tất cả category
                    </option>
                `;

    formSelect.innerHTML = `
                    <option value="">
                        Chọn category
                    </option>
                `;

    snapshot.forEach((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
      };

      const name = getCategoryName(data);
      const slug = getCategorySlug(data);

      if (!name) return;

      blogCategories.push(data);

      if (!defaultBlogCategory) {
        defaultBlogCategory = data.id;
      }

      filterSelect.innerHTML += `
                        <option value="${escapeAttr(data.id)}" data-slug="${escapeAttr(slug)}">
                            ${escapeHtml(name)}
                        </option>
                    `;

      formSelect.innerHTML += `
                        <option value="${escapeAttr(data.id)}" data-slug="${escapeAttr(slug)}">
                            ${escapeHtml(name)}
                        </option>
                    `;
    });

    renderBlogs();
  } catch (error) {
    console.error("loadBlogCategories error:", error);
  }
}

function renderBlogs() {
  const tbody = document.getElementById("blogTableBody");
  const emptyState = document.getElementById("emptyState");

  const keyword = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const categoryFilter = document.getElementById("categoryFilter").value;

  const filtered = blogs.filter((item) => {
    const categoryData = getBlogCategory(item);

    const text = `
            ${item.title || ""}
            ${categoryData.name || ""}
            ${categoryData.slug || ""}
            ${item.category || ""}
            ${item.categorySlug || ""}
            ${item.description || ""}
        `.toLowerCase();

    const matchSearch = !keyword || text.includes(keyword);
    const matchCategory =
      categoryFilter === "all" || categoryData.id === categoryFilter;

    return matchSearch && matchCategory;
  });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("d-none");

    document.getElementById("pagination").innerHTML = "";
    document.getElementById("paginationInfo").innerText = "0 / 0 blog";

    return;
  }

  emptyState.classList.add("d-none");

  const { paginatedItems } = createPagination({
    items: filtered,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    itemName: "blog",
    onPageChange: (page) => {
      currentPage = page;
      renderBlogs();
    },
  });

  paginatedItems.forEach((item) => {
    const row = document.createElement("tr");

    const thumbnailSrc = item.thumbnail || "assets/image/test1.webp";
    const categoryData = getBlogCategory(item);

    row.innerHTML = `
                    <td>
                        <img src="${escapeAttr(thumbnailSrc)}"
                            style="width:70px;height:70px;object-fit:cover;border-radius:16px;">
                    </td>

                    <td>
                        <div class="term-title">${escapeHtml(item.title || "")}</div>
                        <small class="text-muted">
                            ${escapeHtml(shortText(item.description || "", 70))}
                        </small>
                    </td>

                    <td>${renderCategoryLabel(categoryData)}</td>

                    <td>
                        ${
                          item.featured
                            ? `<span class="featured-badge">
                                    <i class="bi bi-star-fill"></i> Nổi bật
                                </span>`
                            : `<span class="text-muted">Bài thường</span>`
                        }
                    </td>

                    <td>${escapeHtml(item.author || "EMI")}</td>

                    <td>${escapeHtml(item.readingTime || "")}</td>

                    <td>${escapeHtml(formatDisplayDate(item.updatedDate) || "")}</td>

                    <td>
                        <button class="action-btn btn-view"
                            onclick="viewBlog('${item.id}')">
                            <i class="bi bi-eye"></i>
                        </button>

                        <button class="action-btn btn-edit"
                            onclick="editBlog('${item.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button class="action-btn btn-delete"
                            onclick="deleteBlog('${item.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;

    tbody.appendChild(row);
  });
}
// CUSTOM SECTION FOR DETAIL
function addDetailSection() {
  const currentSections = getDetailSectionsFromForm();

  currentSections.push({
    number: "",
    title: "",
    content: "",
    bullets: [],
    note: "",
  });

  renderDetailSectionInputs(currentSections);
}

function removeDetailSection(button) {
  const box = button.closest(".section-box");
  if (!box) return;

  box.remove();

  const currentSections = getDetailSectionsFromForm();
  renderDetailSectionInputs(currentSections);
}

function renderDetailSectionInputs(sections = defaultSections) {
  const wrapper = document.getElementById("detailSections");
  wrapper.innerHTML = "";

  sections.forEach((section, index) => {
    const box = document.createElement("div");
    box.className = "section-box";
    box.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="fw-bold mb-0">Mục ${String(index + 1).padStart(2, "0")}</h6>

                      <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeDetailSection(this)">
                        Xóa
                      </button>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Tiêu đề mục</label>
                        <input class="form-control section-title" value="${escapeAttr(section.title || "")}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Nội dung chính</label>
                        <textarea class="form-control section-content" rows="4" required>${escapeHtml(section.content || "")}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Bullet points</label>
                        <textarea class="form-control section-bullets" rows="4" placeholder="Mỗi dòng là một bullet point">${escapeHtml((section.bullets || []).join("\n"))}</textarea>
                    </div>
                    <div>
                        <label class="form-label fw-semibold">Ghi chú / bài học / điểm nhấn</label>
                        <textarea class="form-control section-note" rows="2">${escapeHtml(section.note || "")}</textarea>
                    </div>
                `;
    wrapper.appendChild(box);
  });
}

function openAddModal() {
  document.getElementById("modalTitle").innerText = "Thêm Blog";
  document.getElementById("blogForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("thumbnailUrl").value = "";
  document.getElementById("thumbnailPreview").src = "assets/image/test1.webp";

  document.getElementById("title").value =
    "Tại sao 80% người trẻ thất bại khi lập quỹ hưu trí tự nguyện?";
  document.getElementById("category").value = defaultBlogCategory;
  document.getElementById("slug").value =
    "tai-sao-80-nguoi-tre-that-bai-khi-lap-quy-huu-tri";
  document.getElementById("featured").value = "true";
  document.getElementById("author").value = "EMI";
  document.getElementById("readingTime").value = "6 phút";
  document.getElementById("updatedDate").value = "2024-05-24";
  document.getElementById("description").value =
    "Không phải vì họ không kiếm đủ tiền, mà vì sai lầm ngay từ bước đầu tiên. Bài viết phân tích 5 nguyên nhân cốt lõi và cách xây dựng quỹ hưu trí bền vững.";
  document.getElementById("keyResults").value = [
    "Giảm hơn 30% phí đóng dự kiến",
    "Gia tăng lớp bảo vệ sinh mạng",
    "Chuyển hóa hồ sơ phức tạp",
    "Gia đình hiểu rõ toàn bộ cấu trúc tài chính",
  ].join("\n");
  document.getElementById("cardQuote").value =
    "Một kế hoạch hưu trí tốt không bắt đầu bằng số tiền lớn, mà bắt đầu bằng sự đều đặn và hiểu đúng.";
  document.getElementById("quoteAuthor").value = "EMI";
  document.getElementById("detailContentType").value = "structured";
  document.getElementById("customDetailEditor").innerHTML = "";
  toggleDetailForm();
  renderDetailSectionInputs(defaultSections);
  blogModal.show();
}

function editBlog(id) {
  const item = blogs.find((c) => c.id === id);
  if (!item) return;

  const categoryData = getBlogCategory(item);

  document.getElementById("modalTitle").innerText = "Sửa Blog";
  document.getElementById("editId").value = item.id;
  document.getElementById("title").value = item.title || "";
  document.getElementById("category").value = categoryData.id || "";
  document.getElementById("slug").value = item.slug || "";
  document.getElementById("featured").value = item.featured ? "true" : "false";
  document.getElementById("author").value = item.author || "EMI";
  document.getElementById("readingTime").value = item.readingTime || "";
  document.getElementById("updatedDate").value = normalizeDateInput(
    item.updatedDate,
  );
  document.getElementById("description").value = item.description || "";
  document.getElementById("keyResults").value = Array.isArray(item.keyResults)
    ? item.keyResults.join("\n")
    : "";
  document.getElementById("cardQuote").value = item.cardQuote || "";
  document.getElementById("quoteAuthor").value = item.quoteAuthor || "";
  document.getElementById("thumbnailUrl").value = item.thumbnail || "";
  document.getElementById("thumbnailPreview").src =
    item.thumbnail || "assets/image/test1.webp";
  document.getElementById("detailContentType").value =
    item.detailContentType || "structured";
  document.getElementById("customDetailEditor").innerHTML =
    item.customDetailHtml || "";
  toggleDetailForm();

  renderDetailSectionInputs(
    Array.isArray(item.detailSections) && item.detailSections.length
      ? item.detailSections
      : defaultSections,
  );
  blogModal.show();
}

function updateThumbnailPreview() {
  const url = document.getElementById("thumbnailUrl").value.trim();
  document.getElementById("thumbnailPreview").src =
    url || "assets/image/test1.webp";
}

function toggleDetailForm() {
  const type = document.getElementById("detailContentType").value;
  document
    .getElementById("structuredDetailForm")
    .classList.toggle("d-none", type !== "structured");
  document
    .getElementById("customDetailForm")
    .classList.toggle("d-none", type !== "custom");
}

function formatEditor(command, value = null) {
  document.getElementById("customDetailEditor").focus();
  document.execCommand(command, false, value);
}

function getDetailSectionsFromForm() {
  return Array.from(
    document.querySelectorAll("#detailSections .section-box"),
  ).map((box, index) => ({
    number: String(index + 1).padStart(2, "0"),
    title: box.querySelector(".section-title").value.trim(),
    content: box.querySelector(".section-content").value.trim(),
    bullets: linesToArray(box.querySelector(".section-bullets").value),
    note: box.querySelector(".section-note").value.trim(),
  }));
}

function viewBlog(id) {
  const item = blogs.find((c) => c.id === id);
  if (!item) return;

  const categoryData = getBlogCategory(item);
  const sections = Array.isArray(item.detailSections)
    ? item.detailSections
    : [];
  const keyResults = Array.isArray(item.keyResults) ? item.keyResults : [];
  const thumbnailSrc = item.thumbnail || "assets/image/test1.webp";

  document.getElementById("viewContent").innerHTML = `
                <div class="mb-4">
                    <img src="${escapeAttr(thumbnailSrc)}" style="width:100%;max-height:320px;object-fit:cover;border-radius:20px;">
                </div>

                <div class="view-block">
                    <label>Category</label>
                    <p>${escapeHtml(categoryData.name || "")}</p>
                </div>

                <div class="row">
                    <div class="col-md-6 view-block">
                        <label>Category ID</label>
                        <p>${escapeHtml(categoryData.id || "")}</p>
                    </div>
                    <div class="col-md-6 view-block">
                        <label>Category Slug</label>
                        <p>${escapeHtml(categoryData.slug || "")}</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 view-block">
                        <label>Category isDeleted</label>
                        <p>${categoryData.isDeleted ? "true" : "false"}</p>
                    </div>
                    <div class="col-md-6 view-block">
                        <label>Category Status</label>
                        <p>${escapeHtml(categoryData.status || "")}</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 view-block">
                        <label>Slug</label>
                        <p>${escapeHtml(item.slug || "")}</p>
                    </div>
                    <div class="col-md-3 view-block">
                        <label>Loại bài</label>
                        <p>${item.featured ? "Bài nổi bật" : "Bài thường"}</p>
                    </div>
                    <div class="col-md-3 view-block">
                        <label>Tác giả</label>
                        <p>${escapeHtml(item.author || "EMI")}</p>
                    </div>
                </div>

                <div class="view-block">
                    <label>Title</label>
                    <p class="fw-bold fs-5">${escapeHtml(item.title || "")}</p>
                </div>

                <div class="row">
                    <div class="col-md-6 view-block">
                        <label>Thời gian đọc</label>
                        <p>${escapeHtml(item.readingTime || "")}</p>
                    </div>
                    <div class="col-md-6 view-block">
                        <label>Cập nhật</label>
                        <p>${escapeHtml(formatDisplayDate(item.updatedDate) || "")}</p>
                    </div>
                </div>

                <div class="view-block">
                    <label>Ý chính / điểm nổi bật</label>
                    <ul class="result-list">${keyResults.map((result) => `<li>${escapeHtml(result)}</li>`).join("")}</ul>
                </div>

                <div class="view-block">
                    <label>Quote</label>
                    <p><strong>“${escapeHtml(item.cardQuote || "")}”</strong></p>
                    <small class="text-muted">— ${escapeHtml(item.quoteAuthor || "EMI")}</small>
                </div>

                ${
                  item.detailContentType === "custom"
                    ? `
                    <div class="view-section">
                        ${item.customDetailHtml || ""}
                    </div>
                `
                    : sections
                        .map(
                          (section) => `
                    <div class="view-section">
                        <h5 class="fw-bold mb-3">
                            <span class="view-section-number">${escapeHtml(section.number || "")}</span>
                            ${escapeHtml(section.title || "")}
                        </h5>
                        <p>${escapeHtml(section.content || "").replaceAll("\n", "<br>")}</p>
                        ${Array.isArray(section.bullets) && section.bullets.length ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}
                        ${section.note ? `<p class="mb-0"><strong>${escapeHtml(section.note)}</strong></p>` : ""}
                    </div>
                `,
                        )
                        .join("")
                }
            `;

  viewModal.show();
}

async function deleteBlog(id) {
  const confirmDelete = confirm("Bạn có chắc muốn xóa blog này?");
  if (!confirmDelete) return;

  try {
    await db.collection("blogs").doc(id).update({
      isDeleted: true,
      deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await loadBlogs();
  } catch (error) {
    console.log(error);
    alert("Xóa thất bại");
  }
}

document
  .getElementById("blogForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const editId = document.getElementById("editId").value;
    const thumbnail = document.getElementById("thumbnailUrl").value.trim();
    const detailContentType =
      document.getElementById("detailContentType").value;
    const categoryId = document.getElementById("category").value;

    const selectedCategory = blogCategories.find((category) => {
      return category.id === categoryId;
    });

    if (!selectedCategory) {
      alert("Vui lòng chọn category");
      return;
    }

    if (!thumbnail) {
      alert("Vui lòng nhập link ảnh thumbnail cho blog.");
      return;
    }

    const categoryName = getCategoryName(selectedCategory);
    const categorySlug = getCategorySlug(selectedCategory);
    const categoryIsDeleted = isCategoryDeleted(selectedCategory);
    const categoryStatus = getCategoryStatus(selectedCategory);

    const data = {
      title: document.getElementById("title").value.trim(),

      // Category snapshot + mapping
      category: categoryName,
      categoryId: categoryId,
      categorySlug: categorySlug,
      categoryIsDeleted: categoryIsDeleted,
      categoryStatus: categoryStatus,

      slug:
        document.getElementById("slug").value.trim() ||
        createSlug(document.getElementById("title").value.trim()),
      featured: document.getElementById("featured").value === "true",
      author: document.getElementById("author").value.trim() || "EMI",
      readingTime: document.getElementById("readingTime").value.trim(),
      updatedDate: document.getElementById("updatedDate").value,
      description: document.getElementById("description").value.trim(),
      keyResults: linesToArray(document.getElementById("keyResults").value),
      cardQuote: document.getElementById("cardQuote").value.trim(),
      quoteAuthor: document.getElementById("quoteAuthor").value.trim(),
      thumbnail: thumbnail,
      detailContentType: detailContentType,
      detailSections:
        detailContentType === "structured" ? getDetailSectionsFromForm() : [],
      customDetailHtml:
        detailContentType === "custom"
          ? sanitizeEditorHtml(
              document.getElementById("customDetailEditor").innerHTML,
            )
          : "",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      if (editId) {
        await db.collection("blogs").doc(editId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.isDeleted = false;
        await db.collection("blogs").add(data);
      }

      hideModalSafely(blogModal, document.getElementById("blogModal"));
      document.getElementById("blogForm").reset();
      await loadBlogs();
    } catch (error) {
      console.log(error);
      alert(`Lưu thất bại: ${error.message || error.code || "Không rõ lỗi"}`);
    }
  });

function linesToArray(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeDateInput(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value.toDate) return value.toDate().toISOString().slice(0, 10);
  return "";
}

function formatDisplayDate(value) {
  const dateInput = normalizeDateInput(value);
  if (!dateInput) return "";
  const [year, month, day] = dateInput.split("-");
  return `${day}/${month}/${year}`;
}

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

function escapeAttr(text) {
  return escapeHtml(text).replaceAll("`", "&#096;");
}

function sanitizeEditorHtml(html) {
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

function clearModalFocus(modalEl) {
  if (
    modalEl &&
    modalEl.contains(document.activeElement) &&
    document.activeElement instanceof HTMLElement
  ) {
    document.activeElement.blur();
  }
}

function hideModalSafely(modalInstance, modalEl) {
  clearModalFocus(modalEl);
  requestAnimationFrame(() => {
    modalInstance.hide();
  });
}

document.querySelectorAll(".modal").forEach((modalEl) => {
  modalEl.addEventListener("hide.bs.modal", () => clearModalFocus(modalEl));
  modalEl.addEventListener("hidden.bs.modal", () => clearModalFocus(modalEl));
});

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

async function logout() {
  await auth.signOut();
  window.location.href = "login.html";
}
