const MAX_THUMBNAIL_SIZE = 800 * 1024;

// PAGINATE
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

const defaultSections = [
  {
    number: "01",
    title: "Khúc mắc ban đầu",
    content:
      "Khách hàng tìm đến EMI với 4 hợp đồng đã tham gia hơn 4 năm. Tổng phí đóng mỗi năm gần 50 triệu đồng, nhưng cả gia đình không ai thực sự hiểu mình đang được bảo vệ điều gì. Người chồng lo lắng khi phát hiện thông tin người thụ hưởng có sai lệch, trong khi người vợ bắt đầu cảm thấy áp lực vì dòng tiền hằng tháng ngày càng nặng nề.",
    bullets: [],
  },
  {
    number: "02",
    title: "Bắt mạch & bóc tách",
    content: "Sau khi rà soát toàn bộ điều khoản, EMI phát hiện:",
    bullets: [
      "Trùng lặp quyền lợi nội trú giữa 2 hợp đồng",
      "Thiếu lớp bảo vệ sinh mạng cho người trụ cột",
      "Mệnh giá học vấn cho con chưa đủ",
      "Thông tin người thụ hưởng sai lệch với hồ sơ gốc",
    ],
    note: "Quan trọng nhất: Khách hàng chưa từng được giải thích rõ các điểm loại trừ.",
  },
  {
    number: "03",
    title: "Giải pháp 4.0",
    content:
      "Đội ngũ EMI làm việc trực tiếp với tổng đài hãng bảo hiểm để điều chỉnh luồng tin người thụ hưởng.",
    bullets: [
      "Loại bỏ các quyền lợi trùng lặp",
      "Giữ lại lớp bảo vệ cốt lõi",
      "Thiết kế thêm thẻ y tế độc lập để tránh lỗ hổng",
      "Tối ưu lại dòng phí đóng hằng năm",
    ],
    note: "Toàn bộ quá trình được thực hiện theo đúng triết lý: “Làm chậm mà chắc.”",
  }
];

const caseStudyModal = new bootstrap.Modal(
  document.getElementById("caseStudyModal"),
);
const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));

let caseStudies = [];
let caseStudyCategories = [];
let defaultBlogCategory = "";

// =========================
// CATEGORY HELPERS
// =========================

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

function getCaseStudyCategory(item) {
  const categoryId = item.categoryId || "";

  let matchedCategory = caseStudyCategories.find((category) => {
    return category.id === categoryId;
  });

  if (!matchedCategory) {
    matchedCategory = caseStudyCategories.find((category) => {
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

      // NEW
      isDeleted: matchedCategory.isDeleted === true,
      status: matchedCategory.status || "active",
    };
  }

  return {
    id: categoryId,
    name: item.category || "",
    slug: item.categorySlug || item.category || "",

    // fallback snapshot
    isDeleted: item.categoryIsDeleted === true,
    status: item.categoryStatus || "active",
  };
}

async function loadCaseStudyCategories() {
  try {
    const filterSelect = document.getElementById("categoryFilter");
    const formSelect = document.getElementById("category");

    const snapshot = await db
      .collection("categories")
      .where("type", "==", "case_study")
      .where("isDeleted", "==", false)
      .where("status", "==", "active")
      .orderBy("position", "asc")
      .get();

    caseStudyCategories = [];
    defaultBlogCategory = "";

    filterSelect.innerHTML = `<option value="all">Tất cả category</option>`;
    formSelect.innerHTML = `<option value="">Chọn category</option>`;

    snapshot.forEach((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
      };

      const name = getCategoryName(data);
      const slug = getCategorySlug(data);

      if (!name) return;

      caseStudyCategories.push(data);

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

    renderCaseStudies();
  } catch (error) {
    console.error("loadCaseStudyCategories error:", error);
  }
}

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  renderDetailSectionInputs(defaultSections);
  loadCaseStudyCategories();
  loadCaseStudies();
});

async function loadCaseStudies() {
  try {
    const snapshot = await db
      .collection("caseStudies")
      .where("isDeleted", "==", false)
      .where("categoryIsDeleted", "==", false)
      .orderBy("createdAt", "desc")
      .get();

    caseStudies = [];

    snapshot.forEach((doc) => {
      caseStudies.push({ id: doc.id, ...doc.data() });
    });

    renderCaseStudies();
  } catch (error) {
    console.log(error);
  }
}

function renderCaseStudies() {
  const tbody = document.getElementById("caseStudyTableBody");
  const emptyState = document.getElementById("emptyState");

  const keyword = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const categoryFilter = document.getElementById("categoryFilter").value;

  const filtered = caseStudies.filter((item) => {
    const categoryData = getCaseStudyCategory(item);

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
    document.getElementById("paginationInfo").innerText = "0 / 0 case study";
    return;
  }

  emptyState.classList.add("d-none");

  // PAGINATE
  const { paginatedItems } = createPagination({
    items: filtered,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    itemName: "case study",
    onPageChange: (page) => {
      currentPage = page;
      renderCaseStudies();
    },
  });

  paginatedItems.forEach((item) => {
    const row = document.createElement("tr");
    const thumbnailSrc = item.thumbnail || "assets/image/test1.webp";
    const categoryData = getCaseStudyCategory(item);

    row.innerHTML = `
      <td>
        <img src="${escapeAttr(thumbnailSrc)}" style="width:70px;height:70px;object-fit:cover;border-radius:16px;">
      </td>

      <td>
        <div class="term-title">${escapeHtml(item.title || "")}</div>
        <small class="text-muted">${escapeHtml(shortText(item.description || "", 70))}</small>
      </td>

      <td>
        <span class="term-category">${escapeHtml(categoryData.name || "")}</span>
        ${categoryData.status && categoryData.status !== "active" ? ` <span class="term-category text-warning"> ${escapeHtml(categoryData.status)} </span>` : ""}
      </td>

      <td>${escapeHtml(item.readingTime || "")}</td>

      <td>${escapeHtml(formatDisplayDate(item.updatedDate) || "")}</td>

      <td>
        <button class="action-btn btn-view" onclick="viewCaseStudy('${item.id}')"><i class="bi bi-eye"></i></button>
        <button class="action-btn btn-edit" onclick="editCaseStudy('${item.id}')"><i class="bi bi-pencil"></i></button>
        <button class="action-btn btn-delete" onclick="deleteCaseStudy('${item.id}')"><i class="bi bi-trash"></i></button>
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
  document.getElementById("modalTitle").innerText = "Thêm Case Study";
  document.getElementById("caseStudyForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("thumbnailUrl").value = "";
  document.getElementById("thumbnailPreview").src = "assets/image/test1.webp";

  document.getElementById("title").value =
    "Hợp đồng 50 triệu/năm suýt thành giấy lộn vì sai 1 chữ trong hồ sơ";

  document.getElementById("category").value = defaultBlogCategory;

  document.getElementById("readingTime").value = "4 phút";
  document.getElementById("updatedDate").value = "2024-05-15";

  document.getElementById("description").value =
    "Khách hàng tham gia hơn 4 năm, tổng phí gần 50 triệu/năm nhưng chưa hiểu rõ mình đang được bảo vệ điều gì.";

  document.getElementById("keyResults").value = [
    "Giảm hơn 30% phí đóng dự kiến",
    "Gia tăng lớp bảo vệ sinh mạng",
    "Chuyển hóa hồ sơ phức tạp",
    "Gia đình hiểu rõ toàn bộ cấu trúc tài chính",
  ].join("\n");

  document.getElementById("cardQuote").value =
    "Một hợp đồng tốt không phải hợp đồng đắt tiền nhất. Mà là hợp đồng bạn thực sự hiểu rõ.";

  document.getElementById("quoteAuthor").value = "EMI";
  document.getElementById("detailContentType").value = "structured";
  document.getElementById("customDetailEditor").innerHTML = "";

  toggleDetailForm();
  renderDetailSectionInputs(defaultSections);
  caseStudyModal.show();
}

function editCaseStudy(id) {
  const item = caseStudies.find((c) => c.id === id);
  if (!item) return;

  const categoryData = getCaseStudyCategory(item);

  document.getElementById("modalTitle").innerText = "Sửa Case Study";
  document.getElementById("editId").value = item.id;
  document.getElementById("title").value = item.title || "";
  document.getElementById("category").value = categoryData.id || "";
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

  caseStudyModal.show();
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

function viewCaseStudy(id) {
  const item = caseStudies.find((c) => c.id === id);
  if (!item) return;

  const categoryData = getCaseStudyCategory(item);

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

    <div class="view-block">
      <label>Category ID</label>
      <p>${escapeHtml(categoryData.id || "")}</p>
    </div>

    <div class="view-block">
      <label>Category Slug</label>
      <p>${escapeHtml(categoryData.slug || "")}</p>
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
      <label>Kết quả nổi bật</label>
      <ul class="result-list">
        ${keyResults.map((result) => `<li>${escapeHtml(result)}</li>`).join("")}
      </ul>
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

                  ${
                    Array.isArray(section.bullets) && section.bullets.length
                      ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
                      : ""
                  }

                  ${
                    section.note
                      ? `<p class="mb-0"><strong>${escapeHtml(section.note)}</strong></p>`
                      : ""
                  }
                </div>
              `,
            )
            .join("")
    }
  `;

  viewModal.show();
}

async function deleteCaseStudy(id) {
  const confirmDelete = confirm("Bạn có chắc muốn xóa case study này?");
  if (!confirmDelete) return;

  try {
    await db.collection("caseStudies").doc(id).update({
      isDeleted: true,
      deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await loadCaseStudies();
  } catch (error) {
    console.log(error);
    alert("Xóa thất bại");
  }
}

document
  .getElementById("caseStudyForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const editId = document.getElementById("editId").value;
    const thumbnail = document.getElementById("thumbnailUrl").value.trim();

    const detailContentType =
      document.getElementById("detailContentType").value;

    const categoryId = document.getElementById("category").value;

    const selectedCategory = caseStudyCategories.find((category) => {
      return category.id === categoryId;
    });

    if (!selectedCategory) {
      alert("Vui lòng chọn category");
      return;
    }

    if (!thumbnail) {
      alert("Vui lòng nhập link ảnh thumbnail cho case study.");
      return;
    }

    const categoryName = getCategoryName(selectedCategory);
    const categorySlug = getCategorySlug(selectedCategory);

    const data = {
      title: document.getElementById("title").value.trim(),

      // CATEGORY SNAPSHOT
      categoryId: categoryId,
      category: categoryName,
      categorySlug: categorySlug,
      categoryIsDeleted: selectedCategory.isDeleted === true,
      categoryStatus: selectedCategory.status || "active",

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
        await db.collection("caseStudies").doc(editId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.isDeleted = false;

        await db.collection("caseStudies").add(data);
      }

      hideModalSafely(
        caseStudyModal,
        document.getElementById("caseStudyModal"),
      );

      document.getElementById("caseStudyForm").reset();

      await loadCaseStudies();
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
