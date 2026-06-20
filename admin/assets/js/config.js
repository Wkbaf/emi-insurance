const SITE_CONFIG_DOC = "config";

async function loadSiteConfig() {
  const toggle = document.getElementById("partnerSectionEnabled");

  if (!toggle) return;

  try {
    const doc = await db.collection("siteSettings").doc(SITE_CONFIG_DOC).get();
    const data = doc.exists ? doc.data() : {};

    toggle.checked = data.partnerSectionEnabled !== false;
  } catch (error) {
    console.error("Load site config error:", error);
    toggle.checked = true;
  }
}

async function saveSiteConfig() {
  const saveBtn = document.getElementById("saveBtn");
  const statusEl = document.getElementById("saveStatus");
  const toggle = document.getElementById("partnerSectionEnabled");

  if (!saveBtn || !statusEl || !toggle) return;

  const user = firebase.auth().currentUser;

  if (!user) {
    alert("Phiên đăng nhập đã hết hạn.");
    return;
  }

  saveBtn.disabled = true;
  statusEl.style.display = "none";

  try {
    await db.collection("siteSettings").doc(SITE_CONFIG_DOC).set({
      partnerSectionEnabled: toggle.checked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: user.uid,
    }, { merge: true });

    statusEl.textContent = "Đã lưu cấu hình thành công.";
    statusEl.className = "save-status success";
    statusEl.style.display = "block";
  } catch (error) {
    console.error("Save site config error:", error);

    statusEl.textContent = "Không thể lưu cấu hình. Vui lòng thử lại.";
    statusEl.className = "save-status error";
    statusEl.style.display = "block";
  } finally {
    saveBtn.disabled = false;
  }
}

function pageInit() {
  loadSiteConfig();
}
