const SITE_CONFIG_DOC = "config";
let saveStatusTimer = null;
let saveStatusHideTimer = null;

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

let advisorList = [];

function createAdvisor(partial = {}) {
  return {
    id: `advisor-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: partial.name || "Tên cố vấn",
    title: partial.title || "Chức danh",
    note: partial.note || "",
    imageUrl: partial.imageUrl || "",
  };
}

function normalizeAdvisorsFromData(data = {}) {
  if (Array.isArray(data.advisors) && data.advisors.length) {
    return data.advisors.map((advisor, index) => ({
      id: advisor.id || `advisor-${index + 1}`,
      name: advisor.name || "",
      title: advisor.title || "",
      note: advisor.note || "",
      imageUrl: advisor.imageUrl || "",
    }));
  }

  const legacy = data.images?.advisors || {};

  return DEFAULT_ADVISORS.map((advisor, index) => ({
    ...advisor,
    imageUrl: legacy[`advisor${index + 1}`] || advisor.imageUrl || "",
  }));
}

function updateImagePreview(input, previewId) {
  const preview = document.getElementById(previewId);
  const url = input?.value.trim() || "";

  if (!preview) return;

  if (!url) {
    preview.classList.remove("show");
    preview.removeAttribute("src");
    return;
  }

  preview.src = url;
  preview.classList.add("show");
}

function refreshAboutPreview() {
  const aboutInput = document.getElementById("imageAbout");
  updateImagePreview(aboutInput, "previewAbout");
}

function getAdvisorFromCard(card) {
  return {
    id: card.dataset.advisorId,
    name: card.querySelector('[data-field="name"]')?.value.trim() || "",
    title: card.querySelector('[data-field="title"]')?.value.trim() || "",
    note: card.querySelector('[data-field="note"]')?.value.trim() || "",
    imageUrl: card.querySelector('[data-field="imageUrl"]')?.value.trim() || "",
  };
}

function collectAdvisorsFromForm() {
  return Array.from(document.querySelectorAll(".advisor-config-item")).map(getAdvisorFromCard);
}

function renderAdvisorList(advisors = []) {
  const listEl = document.getElementById("advisorConfigList");
  if (!listEl) return;

  advisorList = advisors.length ? advisors : DEFAULT_ADVISORS.map((item) => ({ ...item }));

  listEl.innerHTML = advisorList.map((advisor, index) => `
    <div class="advisor-config-item" data-advisor-id="${advisor.id}">
      <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
        <h6 class="fw-bold mb-0">Cố vấn #${index + 1}</h6>
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeAdvisor('${advisor.id}')">
          <i class="bi bi-trash me-1"></i>Xóa
        </button>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Tên</label>
          <input type="text" class="form-control" data-field="name" value="${escapeAttr(advisor.name)}" placeholder="Emi Ho">
        </div>

        <div class="col-md-6">
          <label class="form-label fw-semibold">Ghi chú ngắn</label>
          <input type="text" class="form-control" data-field="note" value="${escapeAttr(advisor.note)}" placeholder="(Phụ trách BHXH/BHYT)">
        </div>

        <div class="col-12">
          <label class="form-label fw-semibold">Chức danh / Tiêu đề</label>
          <textarea class="form-control" rows="2" data-field="title" placeholder="Cố vấn Hoạch định An sinh & Pháp lý">${escapeHtml(advisor.title)}</textarea>
          <div class="section-toggle-desc mt-2">Có thể xuống dòng để hiển thị trên 2 dòng ở website.</div>
        </div>

        <div class="col-md-8">
          <label class="form-label fw-semibold">Link ảnh</label>
          <input
            type="url"
            class="form-control config-image-input"
            data-field="imageUrl"
            data-preview="preview_${advisor.id}"
            value="${escapeAttr(advisor.imageUrl)}"
            placeholder="https://..."
          >
        </div>

        <div class="col-md-4">
          <label class="form-label fw-semibold">Preview</label>
          <img id="preview_${advisor.id}" class="image-preview ${advisor.imageUrl ? "show" : ""}" ${advisor.imageUrl ? `src="${escapeAttr(advisor.imageUrl)}"` : ""} alt="Preview ${escapeAttr(advisor.name)}">
        </div>
      </div>
    </div>
  `).join("");

  listEl.querySelectorAll(".config-image-input").forEach((input) => {
    input.addEventListener("input", () => updateImagePreview(input, input.dataset.preview));
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function addAdvisor() {
  advisorList = collectAdvisorsFromForm();
  advisorList.push(createAdvisor());
  renderAdvisorList(advisorList);
}

function removeAdvisor(advisorId) {
  advisorList = collectAdvisorsFromForm().filter((advisor) => advisor.id !== advisorId);

  if (!advisorList.length) {
    advisorList = [createAdvisor()];
  }

  renderAdvisorList(advisorList);
}

function hideSaveStatus() {
  const popup = document.getElementById("saveStatus");
  if (!popup) return;

  clearTimeout(saveStatusTimer);
  clearTimeout(saveStatusHideTimer);
  popup.classList.remove("show");

  saveStatusHideTimer = window.setTimeout(() => {
    popup.hidden = true;
    saveStatusHideTimer = null;
  }, 250);
}

function showSaveStatus(type, message) {
  const popup = document.getElementById("saveStatus");
  const textEl = popup?.querySelector(".save-status-text");
  const iconEl = popup?.querySelector(".save-status-icon");
  const cardEl = popup?.querySelector(".save-status-popup-card");

  if (!popup || !textEl || !iconEl || !cardEl) return;

  clearTimeout(saveStatusTimer);
  clearTimeout(saveStatusHideTimer);

  cardEl.className = `save-status-popup-card ${type}`;
  iconEl.className = type === "success"
    ? "save-status-icon bi bi-check-circle-fill"
    : "save-status-icon bi bi-exclamation-triangle-fill";
  textEl.textContent = message;

  popup.hidden = false;
  requestAnimationFrame(() => popup.classList.add("show"));

  saveStatusTimer = window.setTimeout(() => {
    hideSaveStatus();
  }, 4000);
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

function applyShareLinksToForm(data = {}) {
  const shareLinks = normalizeShareLinks(data);
  const blogToggle = document.getElementById("shareLinkBlogDetail");
  const videoToggle = document.getElementById("shareLinkVideoDetail");
  const caseStudyToggle = document.getElementById("shareLinkCaseStudyDetail");

  if (blogToggle) blogToggle.checked = shareLinks.blogDetail;
  if (videoToggle) videoToggle.checked = shareLinks.videoDetail;
  if (caseStudyToggle) caseStudyToggle.checked = shareLinks.caseStudyDetail;
}

function collectShareLinksFromForm() {
  return {
    blogDetail: document.getElementById("shareLinkBlogDetail")?.checked !== false,
    videoDetail: document.getElementById("shareLinkVideoDetail")?.checked !== false,
    caseStudyDetail: document.getElementById("shareLinkCaseStudyDetail")?.checked !== false,
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

function applyContactActionLinksToForm(data = {}) {
  const contactActionLinks = normalizeContactActionLinks(data);
  const blogToggle = document.getElementById("contactActionBlogDetail");
  const videoToggle = document.getElementById("contactActionVideoDetail");
  const caseStudyToggle = document.getElementById("contactActionCaseStudyDetail");

  if (blogToggle) blogToggle.checked = contactActionLinks.blogDetail;
  if (videoToggle) videoToggle.checked = contactActionLinks.videoDetail;
  if (caseStudyToggle) caseStudyToggle.checked = contactActionLinks.caseStudyDetail;
}

function collectContactActionLinksFromForm() {
  return {
    blogDetail: document.getElementById("contactActionBlogDetail")?.checked !== false,
    videoDetail: document.getElementById("contactActionVideoDetail")?.checked !== false,
    caseStudyDetail: document.getElementById("contactActionCaseStudyDetail")?.checked !== false,
  };
}

async function loadSiteConfig() {
  const toggle = document.getElementById("partnerSectionEnabled");
  const aboutInput = document.getElementById("imageAbout");

  if (!toggle) return;

  try {
    const doc = await db.collection("siteSettings").doc(SITE_CONFIG_DOC).get();
    const data = doc.exists ? doc.data() : {};
    const images = data.images || {};

    toggle.checked = data.partnerSectionEnabled !== false;
    applyShareLinksToForm(data);
    applyContactActionLinksToForm(data);

    if (aboutInput) {
      aboutInput.value = images.about || "";
    }

    renderAdvisorList(normalizeAdvisorsFromData(data));
    refreshAboutPreview();
  } catch (error) {
    console.error("Load site config error:", error);
    toggle.checked = true;
    applyShareLinksToForm({});
    applyContactActionLinksToForm({});
    renderAdvisorList(DEFAULT_ADVISORS);
  }
}

async function saveSiteConfig() {
  const saveBtns = document.querySelectorAll(".save-config-btn");
  const toggle = document.getElementById("partnerSectionEnabled");
  const aboutInput = document.getElementById("imageAbout");

  if (!saveBtns.length || !toggle) return;

  const user = firebase.auth().currentUser;

  if (!user) {
    alert("Phiên đăng nhập đã hết hạn.");
    return;
  }

  saveBtns.forEach((btn) => {
    btn.disabled = true;
  });
  hideSaveStatus();

  try {
    await db.collection("siteSettings").doc(SITE_CONFIG_DOC).set({
      partnerSectionEnabled: toggle.checked,
      shareLinks: collectShareLinksFromForm(),
      contactActionLinks: collectContactActionLinksFromForm(),
      images: {
        about: aboutInput?.value.trim() || "",
      },
      advisors: collectAdvisorsFromForm(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: user.uid,
    }, { merge: true });

    advisorList = collectAdvisorsFromForm();
    showSaveStatus("success", "Đã lưu cấu hình thành công.");
  } catch (error) {
    console.error("Save site config error:", error);
    showSaveStatus("error", "Không thể lưu cấu hình. Vui lòng thử lại.");
  } finally {
    saveBtns.forEach((btn) => {
      btn.disabled = false;
    });
  }
}

function pageInit() {
  loadSiteConfig();
}
