const auth = firebase.auth();

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const tokenResult = await user.getIdTokenResult(true);
  const claims = tokenResult.claims;

  const permissions = claims.permissions || [];
  const role = claims.role || null;

  console.log("CLAIMS:", claims);
  console.log("PERMISSIONS:", permissions);

  if (!role) {
    alert("Bạn không có quyền truy cập admin.");
    await auth.signOut();
    window.location.href = "login.html";
    return;
  }

  renderNavbar(permissions);

  if (typeof pageInit === "function") {
    pageInit(user, permissions, role);
  }
});
