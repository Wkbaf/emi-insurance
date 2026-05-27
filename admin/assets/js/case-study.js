const MAX_THUMBNAIL_SIZE = 800 * 1024;

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
  },
  {
    number: "04",
    title: "Kết quả & bài học kinh nghiệm",
    content:
      "Gia đình không chỉ được tối ưu chi phí mà quan trọng hơn là hiểu rõ quyền lợi, tự tin trước mọi rủi ro.",
    bullets: [],
    note: "Bài học rút ra: Đừng để rủi ro nhỏ hôm nay trở thành tổn thất lớn.",
  },
];

const caseStudyModal = new bootstrap.Modal(
  document.getElementById("caseStudyModal"),
);
const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));

let caseStudies = [];

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  renderDetailSectionInputs(defaultSections);
  loadCaseStudies();
});

async function loadCaseStudies() {
  try {
    const snapshot = await db
      .collection("caseStudies")
      .where("isDeleted", "==", false)
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
    const text =
      `${item.title || ""} ${item.category || ""} ${item.description || ""}`.toLowerCase();
    const matchSearch = !keyword || text.includes(keyword);
    const matchCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");

  filtered.forEach((item) => {
    const row = document.createElement("tr");
    const thumbnailSrc =
      item.thumbnail || "assets/image/case-study-placeholder.png";

    row.innerHTML = `
                    <td>
                        <img src="${escapeAttr(thumbnailSrc)}" style="width:70px;height:70px;object-fit:cover;border-radius:16px;">
                    </td>
                    <td>
                        <div class="term-title">${escapeHtml(item.title || "")}</div>
                        <small class="text-muted">${escapeHtml(shortText(item.description || "", 70))}</small>
                    </td>
                    <td><span class="term-category">${escapeHtml(item.category || "")}</span></td>
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

function renderDetailSectionInputs(sections = defaultSections) {
  const wrapper = document.getElementById("detailSections");
  wrapper.innerHTML = "";

  sections.forEach((section, index) => {
    const box = document.createElement("div");
    box.className = "section-box";
    box.innerHTML = `
                    <h6 class="fw-bold mb-3">Mục ${section.number || String(index + 1).padStart(2, "0")}</h6>
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <label class="form-label fw-semibold">Số thứ tự</label>
                            <input class="form-control section-number" value="${escapeAttr(section.number || "")}" required>
                        </div>
                        <div class="col-md-9 mb-3">
                            <label class="form-label fw-semibold">Tiêu đề mục</label>
                            <input class="form-control section-title" value="${escapeAttr(section.title || "")}" required>
                        </div>
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
  document.getElementById("thumbnailData").value = "";
  document.getElementById("thumbnailPreview").src =
    "assets/image/case-study-placeholder.png";

  document.getElementById("title").value =
    "Hợp đồng 50 triệu/năm suýt thành giấy lộn vì sai 1 chữ trong hồ sơ";
  document.getElementById("category").value = "Giải cứu hợp đồng cũ";
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
  renderDetailSectionInputs(defaultSections);
  caseStudyModal.show();
}

function editCaseStudy(id) {
  const item = caseStudies.find((c) => c.id === id);
  if (!item) return;

  document.getElementById("modalTitle").innerText = "Sửa Case Study";
  document.getElementById("editId").value = item.id;
  document.getElementById("title").value = item.title || "";
  document.getElementById("category").value = item.category || "";
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
  document.getElementById("thumbnailData").value = item.thumbnail || "";
  document.getElementById("thumbnailPreview").src =
    item.thumbnail || "assets/image/case-study-placeholder.png";
  document.getElementById("thumbnailFile").value = "";

  renderDetailSectionInputs(
    Array.isArray(item.detailSections) && item.detailSections.length
      ? item.detailSections
      : defaultSections,
  );
  caseStudyModal.show();
}

function handleThumbnailUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    alert("Vui lòng chọn ảnh JPG, PNG hoặc WEBP.");
    event.target.value = "";
    return;
  }

  if (file.size > MAX_THUMBNAIL_SIZE) {
    alert("Ảnh vượt quá 800KB. Vui lòng nén ảnh trước khi upload.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("thumbnailData").value = e.target.result;
    document.getElementById("thumbnailPreview").src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function getDetailSectionsFromForm() {
  return Array.from(document.querySelectorAll(".section-box")).map(
    (box, index) => ({
      number:
        box.querySelector(".section-number").value.trim() ||
        String(index + 1).padStart(2, "0"),
      title: box.querySelector(".section-title").value.trim(),
      content: box.querySelector(".section-content").value.trim(),
      bullets: linesToArray(box.querySelector(".section-bullets").value),
      note: box.querySelector(".section-note").value.trim(),
    }),
  );
}

function viewCaseStudy(id) {
  const item = caseStudies.find((c) => c.id === id);
  if (!item) return;

  const sections = Array.isArray(item.detailSections)
    ? item.detailSections
    : [];
  const keyResults = Array.isArray(item.keyResults) ? item.keyResults : [];
  const thumbnailSrc =
    item.thumbnail || "assets/image/case-study-placeholder.png";

  document.getElementById("viewContent").innerHTML = `
                <div class="mb-4">
                    <img src="${escapeAttr(thumbnailSrc)}" style="width:100%;max-height:320px;object-fit:cover;border-radius:20px;">
                </div>

                <div class="view-block">
                    <label>Category</label>
                    <p>${escapeHtml(item.category || "")}</p>
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
                    <ul class="result-list">${keyResults.map((result) => `<li>${escapeHtml(result)}</li>`).join("")}</ul>
                </div>

                <div class="view-block">
                    <label>Quote</label>
                    <p><strong>“${escapeHtml(item.cardQuote || "")}”</strong></p>
                    <small class="text-muted">— ${escapeHtml(item.quoteAuthor || "EMI")}</small>
                </div>

                ${sections
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
                  .join("")}
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
    const thumbnail = document.getElementById("thumbnailData").value.trim();

    if (!thumbnail) {
      alert("Vui lòng upload thumbnail cho case study.");
      return;
    }

    const data = {
      title: document.getElementById("title").value.trim(),
      category: document.getElementById("category").value.trim(),
      readingTime: document.getElementById("readingTime").value.trim(),
      updatedDate: document.getElementById("updatedDate").value,
      description: document.getElementById("description").value.trim(),
      keyResults: linesToArray(document.getElementById("keyResults").value),
      cardQuote: document.getElementById("cardQuote").value.trim(),
      quoteAuthor: document.getElementById("quoteAuthor").value.trim(),
      thumbnail: thumbnail,
      detailSections: getDetailSectionsFromForm(),
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

      caseStudyModal.hide();
      document.getElementById("caseStudyForm").reset();
      await loadCaseStudies();
    } catch (error) {
      console.log(error);
      alert("Lưu thất bại. Nếu ảnh quá lớn, hãy nén ảnh nhỏ hơn rồi thử lại.");
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
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(text) {
  return escapeHtml(text).replaceAll("`", "&#096;");
}

async function logout() {
  await auth.signOut();
  window.location.href = "login.html";
}
