function renderDetailSectionInputs(sections = []) {
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
          <textarea class="form-control section-bullets" rows="4">${escapeHtml((section.bullets || []).join("\n"))}</textarea>
        </div>
  
        <div>
          <label class="form-label fw-semibold">Ghi chú</label>
          <textarea class="form-control section-note" rows="2">${escapeHtml(section.note || "")}</textarea>
        </div>
      `;

    wrapper.appendChild(box);
  });
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
