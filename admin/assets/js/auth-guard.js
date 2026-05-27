const auth = firebase.auth();

const PAGE_PERMISSIONS = {
  dashboard: "dashboard:view",
  "giai-ma-thuat-ngu": "terms:manage",
  "case-study": "case-studies:manage",
  blog: "blogs:manage",
};

function getCurrentPage() {
  const path = window.location.pathname;

  // /admin/dashboard -> dashboard
  return path.split("/").pop().replace(".html", "");
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

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.replace("/admin/login");
    return;
  }

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
