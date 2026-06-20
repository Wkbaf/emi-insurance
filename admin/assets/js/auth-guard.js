const auth = firebase.auth();

const PAGE_PERMISSIONS = {
  dashboard: "dashboard:view",
  "giai-ma-thuat-ngu": "terms:manage",
  "case-study": "case-studies:manage",
  blog: "blogs:manage",
  categories: "categories:manage",
  "settings/convert-link": "convert-links:manage",
  "settings/config": "configs:manage"
};

function getCurrentPage() {
  const path = window.location.pathname
    .replace("/admin/", "")
    .replace(".html", "");

  return path;
}

function getFirstAllowedPage(permissions) {
  if (permissions.includes("all")) {
    return "/admin/dashboard";
  }

  for (const [page, permission] of Object.entries(PAGE_PERMISSIONS)) {
    if (permissions.includes(permission)) {
      return `/admin/${page}`;
    }
  }

  return null;
}

function isAdminSessionExpired() {
  const expiredAt = Number(localStorage.getItem("adminExpiredAt"));

  if (!expiredAt) return true;

  return Date.now() > expiredAt;
}

async function logoutAdmin() {
  localStorage.removeItem("adminExpiredAt");
  await firebase.auth().signOut();
  window.location.replace("/admin/login");
}

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.replace("/admin/login");
    return;
  }

  if (isAdminSessionExpired()) {
    alert("Phiên đăng nhập đã hết hạn.");
    await logoutAdmin();
    return;
  }

  // phần check role / permission ở dưới

  try {
    const tokenResult = await user.getIdTokenResult(true);

    const claims = tokenResult.claims;

    const permissions = claims.permissions || [];
    const role = claims.role || null;

    console.log("PERMISSIONS:", permissions);

    if (!role) {
      await auth.signOut();
      window.location.replace("/admin/login");
      return;
    }

    if (!permissions.length) {
      alert("Tài khoản chưa được cấp quyền.");

      await auth.signOut();

      window.location.replace("/admin/login");
      return;
    }

    const currentPage = getCurrentPage();

    const requiredPermission = PAGE_PERMISSIONS[currentPage];

    console.log({
      currentPage,
      requiredPermission,
    });

    // page không tồn tại trong config
    if (!requiredPermission) {
      console.log("Page khong ton tai");
      return;
    }

    const hasPermission =
      permissions.includes("all") || permissions.includes(requiredPermission);

    if (!hasPermission) {
      const fallbackPage = getFirstAllowedPage(permissions);

      if (!fallbackPage) {
        await auth.signOut();
        window.location.replace("/admin/login");
        return;
      }

      const currentPath = window.location.pathname;

      // tránh loop
      if (currentPath !== fallbackPage) {
        window.location.replace(fallbackPage);
      }
      console.log("KHong co quyen");
      return;
    }

    renderNavbar(permissions);

    if (typeof pageInit === "function") {
      pageInit(user, permissions, role);
    }
  } catch (error) {
    console.error(error);

    await auth.signOut();

    window.location.replace("/admin/login");
  }
});
