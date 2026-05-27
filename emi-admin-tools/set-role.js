// 1 Cài package
// npm install firebase-admin
// 2 Download service account
// Firebase Console:

// Project Settings
// → Service Accounts
// → Generate private key

// 3 Tạo file set-role.js
// 4 Chạy script
// node set-role.js
/**
 * =========================================================
 * ROLE TEMPLATES
 * =========================================================
 *
 * Bạn có thể copy các mẫu này để dùng nhanh.
 *
 */

/**
 * =========================================================
 * 1. SUPER ADMIN
 * =========================================================
 * Full quyền toàn hệ thống
 */

const SUPER_ADMIN = {
  role: "super_admin",
  permissions: [
    "all",
    "dashboard:view",
    "terms:manage",
    "case-studies:manage",
    "videos:manage",
    "categories:manage",
    "users:manage",
  ],
};

/**
 * =========================================================
 * 2. ADMIN
 * =========================================================
 * Quản lý nội dung nhưng không quản lý user
 */

const ADMIN = {
  role: "admin",
  permissions: [
    "dashboard:view",
    "terms:manage",
    "blog:manage",
    "videos:manage",
    "categories:manage",
  ],
};

/**
 * =========================================================
 * 3. EDITOR
 * =========================================================
 * Chỉ quản lý blog + thuật ngữ
 */

const EDITOR = {
  role: "editor",
  permissions: ["dashboard:view", "terms:manage", "blog:manage", "case-studies:manage"],
};

/**
 * =========================================================
 * 4. VIDEO MANAGER
 * =========================================================
 * Chỉ quản lý videos
 */

const VIDEO_MANAGER = {
  role: "video_manager",
  permissions: ["dashboard:view", "videos:manage"],
};

/**
 * =========================================================
 * 5. CATEGORY MANAGER
 * =========================================================
 * Chỉ quản lý categories
 */

const CATEGORY_MANAGER = {
  role: "category_manager",
  permissions: ["dashboard:view", "categories:manage"],
};

/**
 * =========================================================
 * 6. STAFF
 * =========================================================
 * Chỉ được xem dashboard
 */

const STAFF = {
  role: "staff",
  permissions: ["dashboard:view"],
};

/**
 * =========================================================
 * 7. SUPPORT
 * =========================================================
 * Support đọc dữ liệu nhưng không sửa
 */

const SUPPORT = {
  role: "support",
  permissions: ["dashboard:view", "terms:view", "blog:view", "videos:view"],
};

/**
 * =========================================================
 * EXAMPLE SET ROLE
 * =========================================================
 */

const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")), });

async function setRole() {
  try {
    const uid = "YVzDRckntLOO8j8yonsDeesfIWf2";

    await admin.auth().setCustomUserClaims(
      uid,
      EDITOR, // đổi role tại đây
    );

    console.log("✅ Set role success");
  } catch (error) {
    console.error("❌ Set role failed");

    console.error(error);
  }
}

setRole();
