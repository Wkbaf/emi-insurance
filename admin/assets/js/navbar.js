const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "dashboard.html",
    icon: "bi-grid",
    permission: "dashboard:view",
  },
  {
    label: "Giải mã thuật ngữ",
    href: "giai-ma-thuat-ngu.html",
    icon: "bi-book",
    permission: "terms:manage",
  },
  {
    label: "Case study",
    href: "case-study.html",
    icon: "bi-journal-text",
    permission: "case-studies:manage",
  },
  {
    label: "Chuỗi Video Thực Chiến",
    href: "#",
    icon: "bi-play-circle",
    permission: "blogs:manage",
  },
  {
    label: "Categories",
    href: "#",
    icon: "bi-tags",
    permission: "categories:manage",
  },
];

function renderNavbar(permissions = []) {
  const navbar = document.getElementById("adminNavbar");

  if (!navbar) return;

  const currentPage = window.location.pathname.split("/").pop();

  const hasAllPermission = permissions.includes("all");

  const allowedItems = NAV_ITEMS.filter(
    (item) => hasAllPermission || permissions.includes(item.permission),
  );

  navbar.innerHTML = allowedItems
    .map((item) => {
      const isActive = currentPage === item.href;

      return `
        <a href="${item.href}" class="${isActive ? "active" : ""}">
          <i class="bi ${item.icon} me-2"></i>
          ${item.label}
        </a>
      `;
    })
    .join("");
}
