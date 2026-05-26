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
    label: "Blog",
    href: "#",
    icon: "bi-journal-text",
    permission: "blog:manage",
  },
  {
    label: "Videos",
    href: "#",
    icon: "bi-play-circle",
    permission: "videos:manage",
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

  const allowedItems = NAV_ITEMS.filter((item) =>
    permissions.includes(item.permission),
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
