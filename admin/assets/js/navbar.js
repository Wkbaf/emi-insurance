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
  {
    label: "Settings",
    icon: "bi-gear",
    key: "settings",
    permission: "settings:manage",
    children: [
      {
        label: "Convert link",
        href: "/admin/settings/convert-link",
        icon: "bi-link-45deg",
        permission: "convert-links:manage",
        key: "convert-link",
      },
      {
        label: "Video link",
        href: "/admin/settings/video-link",
        icon: "bi-link-45deg",
        permission: "video-links:manage",
        key: "video-link",
      },
      {
        label: "Config",
        href: "/admin/settings/config",
        icon: "bi-sliders",
        permission: "configs:manage",
        key: "config",
      },
    ],
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
  if (path.includes("/admin/settings/convert-link")) return "convert-link";
  if (path.includes("/admin/settings/config")) return "config";

  return "";
}

function renderNavbar(permissions = []) {
  console.log("rendering");
  const navbar = document.getElementById("adminNavbar");
  if (!navbar) return;

  const currentPageKey = getCurrentPageKey();
  const hasAllPermission = permissions.includes("all");

  const allowedItems = NAV_ITEMS.map((item) => {
    if (hasAllPermission) return item;

    if (item.children?.length) {
      const allowedChildren = item.children.filter((child) =>
        permissions.includes(child.permission),
      );

      if (allowedChildren.length) {
        return {
          ...item,
          children: allowedChildren,
        };
      }

      return null;
    }

    return permissions.includes(item.permission) ? item : null;
  }).filter(Boolean);

  navbar.innerHTML = `
    <h3 class="mb-4">
      <i class="bi bi-shield-check"></i>
      EMI Admin
    </h3>

    ${allowedItems
      .map((item) => {
        const hasChildren = item.children?.length;

        // MENU CHA
        if (hasChildren) {
          const isParentActive = item.children.some(
            (child) => child.key === currentPageKey,
          );

          return `
            <div class="nav-group">
              <div class="nav-link-admin parent-menu ${isParentActive ? "active" : ""}"
                   onclick="toggleSubMenu(this)">
                <div>
                  <i class="bi ${item.icon} me-2"></i>
                  ${item.label}
                </div>
    
                <i class="bi bi-chevron-down"></i>
              </div>
    
              <div class="sub-navbar">
                ${item.children
                  .map((child) => {
                    const isChildActive = child.key === currentPageKey;

                    return `
                      <a href="${child.href}"
                         class="nav-link-admin sub-link ${isChildActive ? "active" : ""}">
                        <i class="bi ${child.icon || "bi-dot"} me-2"></i>
                        ${child.label}
                      </a>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        }

        // MENU THƯỜNG
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

function toggleSubMenu(element) {
  const submenu = element.nextElementSibling;
  submenu.classList.toggle("open");
}

function toggleSidebarCollapse() {
  document.body.classList.toggle("sidebar-collapsed");

  const collapsed = document.body.classList.contains("sidebar-collapsed");

  localStorage.setItem("adminSidebarCollapsed", collapsed ? "true" : "false");

  updateSidebarIcon();
}

function updateSidebarIcon() {
  const icon = document.querySelector(".sidebar-collapse-btn i");

  if (!icon) return;

  const isCollapsed = document.body.classList.contains("sidebar-collapsed");

  if (isCollapsed) {
    icon.classList.remove("bi-arrow-left-short");
    icon.classList.add("bi-arrow-right-short");
  } else {
    icon.classList.remove("bi-arrow-right-short");
    icon.classList.add("bi-arrow-left-short");
  }
}

function openMobileSidebar() {
  document.body.classList.add("sidebar-mobile-open");
}

function closeMobileSidebar() {
  document.body.classList.remove("sidebar-mobile-open");
}

document.addEventListener("DOMContentLoaded", () => {
  const collapsed = localStorage.getItem("adminSidebarCollapsed");

  if (collapsed === "true") {
    document.body.classList.add("sidebar-collapsed");
  }

  updateSidebarIcon();
});
