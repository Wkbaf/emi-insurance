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
