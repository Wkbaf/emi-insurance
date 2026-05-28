const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "bi-grid",
    permission: "dashboard:view",
    key: "dashboard",
  },
  {
    label: "Giải mã thuật ngữ",
    href: "/admin/giai-ma-thuat-ngu",
    icon: "bi-book",
    permission: "terms:manage",
    key: "giai-ma-thuat-ngu",
  },
  {
    label: "Case study",
    href: "/admin/case-study",
    icon: "bi-journal-text",
    permission: "case-studies:manage",
    key: "case-study",
  },
  {
    label: "Góc nhìn chuyên gia",
    href: "/admin/blog",
    icon: "bi-play-circle",
    permission: "blogs:manage",
    key: "blog",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "bi-tags",
    permission: "categories:manage",
    key: "categories",
  },
];

async function logout(event) {
  if (event) event.preventDefault();

  try {
    localStorage.removeItem("adminExpiredAt");

    await firebase.auth().signOut();

    window.location.replace("/admin/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

function getCurrentPageKey() {
  const path = window.location.pathname;

  if (path.includes("dashboard")) return "dashboard";
  if (path.includes("giai-ma-thuat-ngu")) return "giai-ma-thuat-ngu";
  if (path.includes("case-study")) return "case-study";
  if (path.includes("blog")) return "blog";
  if (path.includes("categories")) return "categories";

  return "";
}

function renderNavbar(permissions = []) {
  console.log("rendering")
  const navbar = document.getElementById("adminNavbar");
  if (!navbar) return;

  const currentPageKey = getCurrentPageKey();
  const hasAllPermission = permissions.includes("all");

  const allowedItems = NAV_ITEMS.filter(
    (item) => hasAllPermission || permissions.includes(item.permission),
  );

  navbar.innerHTML = `
    <h3 class="mb-4">
      <i class="bi bi-shield-check"></i>
      EMI Admin
    </h3>

    ${allowedItems
      .map((item) => {
        const isActive = currentPageKey === item.key;

        return `
          <a href="${item.href}"
             class="nav-link-admin ${isActive ? "active" : ""}">
            <i class="bi ${item.icon} me-2"></i>
            ${item.label}
          </a>
        `;
      })
      .join("")}

    <a href="#"
       onclick="logout(event)"
       class="nav-link-admin mt-auto text-danger">
      <i class="bi bi-box-arrow-left me-2"></i>
      Logout
    </a>
  `;
}
