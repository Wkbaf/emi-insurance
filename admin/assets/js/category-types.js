/**
 * Load category type definitions from Firebase and filter by user permissions.
 */
window.CategoryTypes = {
  _cache: [],
  _loaded: false,

  TYPE_PERMISSION_MAP: {
    term: "terms:manage",
    blog: "blogs:manage",
    case_study: "case-studies:manage",
    case_study_video: "videos:manage",
  },

  TYPE_COLLECTION_MAP: {
    term: "explainCards",
    blog: "blogs",
    case_study: "caseStudies",
    case_study_video: "caseStudyVideos",
  },

  resolvePermission(type, explicitPermission) {
    if (this.TYPE_PERMISSION_MAP[type]) {
      return this.TYPE_PERMISSION_MAP[type];
    }

    return explicitPermission || null;
  },

  hasPermission(permissions, requiredPermission) {
    if (!requiredPermission) return false;
    return (
      permissions.includes("all") || permissions.includes(requiredPermission)
    );
  },

  formatTypeLabel(type) {
    return String(type || "")
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  },

  normalizeTypeDoc(doc) {
    const data = doc.data() || {};
    const type = data.type || doc.id;

    return {
      id: doc.id,
      type,
      label: data.label || data.name || "",
      icon: data.icon || "bi-tag",
      permission: this.resolvePermission(type, data.permission),
      relatedCollection:
        data.relatedCollection ||
        data.collection ||
        this.TYPE_COLLECTION_MAP[type] ||
        "",
      position: Number(data.position || 0),
      status: data.status || "active",
      isDeleted: data.isDeleted === true,
    };
  },

  async loadTypes() {
    if (this._loaded) return this._cache;

    try {
      const snapshot = await db.collection("categoryTypes").get();

      this._cache = [];
      snapshot.forEach((doc) => {
        const item = this.normalizeTypeDoc(doc);
        if (!item.isDeleted && item.status === "active") {
          this._cache.push(item);
        }
      });

      this._cache.sort((a, b) => a.position - b.position);

      if (!this._cache.length) {
        this._cache = await this.buildFallbackTypesFromCategories();
      }

      this._loaded = true;
      return this._cache;
    } catch (error) {
      console.error("CategoryTypes.loadTypes error:", error);
      this._cache = await this.buildFallbackTypesFromCategories();
      this._loaded = true;
      return this._cache;
    }
  },

  async buildFallbackTypesFromCategories() {
    try {
      const snapshot = await db
        .collection("categories")
        .where("isDeleted", "==", false)
        .get();

      const typeMap = new Map();

      snapshot.forEach((doc) => {
        const data = doc.data() || {};
        const type = data.type;
        if (!type || typeMap.has(type)) return;

        typeMap.set(type, {
          id: type,
          type,
          label: this.formatTypeLabel(type),
          icon: "bi-tag",
          permission: this.resolvePermission(type),
          relatedCollection: this.TYPE_COLLECTION_MAP[type] || "",
          position: typeMap.size + 1,
          status: "active",
          isDeleted: false,
        });
      });

      return Array.from(typeMap.values()).sort(
        (a, b) => a.position - b.position,
      );
    } catch (error) {
      console.error("CategoryTypes fallback error:", error);
      return [];
    }
  },

  async getAllowedTypes(permissions = []) {
    const types = await this.loadTypes();

    return types.filter(
      (item) =>
        item.permission && this.hasPermission(permissions, item.permission),
    );
  },

  getTypeLabel(type, allowedTypes = []) {
    const matched = allowedTypes.find((item) => item.type === type);
    return matched?.label || this.formatTypeLabel(type);
  },

  getRelatedCollection(type, allowedTypes = []) {
    const matched = allowedTypes.find((item) => item.type === type);
    return matched?.relatedCollection || "";
  },

  renderLoading(container) {
    if (!container) return;

    container.innerHTML = `
      <span class="text-muted small">
        <i class="bi bi-arrow-repeat me-1"></i>Đang tải loại category...
      </span>`;
  },

  renderTabs(container, allowedTypes, activeType, onChange) {
    if (!container) return;

    if (!allowedTypes.length) {
      container.innerHTML = `
        <div class="alert alert-warning mb-0">
          Không có loại category nào bạn được phép quản lý.
        </div>`;
      return;
    }

    container.innerHTML = allowedTypes
      .map((item) => {
        const isActive = item.type === activeType;

        return `
          <button
            type="button"
            id="tab-${item.type}"
            class="category-tab-btn ${isActive ? "active" : ""}"
            data-type="${item.type}">
            <i class="bi ${item.icon} me-2"></i>${item.label}
          </button>`;
      })
      .join("");

    container.querySelectorAll(".category-tab-btn").forEach((button) => {
      button.addEventListener("click", () => {
        onChange(button.dataset.type || "");
      });
    });
  },

  renderSelectOptions(select, allowedTypes, selectedType = "") {
    if (!select) return;

    if (!allowedTypes.length) {
      select.innerHTML = `<option value="">Không có loại category khả dụng</option>`;
      select.disabled = true;
      return;
    }

    select.disabled = false;
    select.innerHTML = allowedTypes
      .map((item) => {
        const selected = item.type === selectedType ? "selected" : "";
        return `<option value="${item.type}" ${selected}>${item.label}</option>`;
      })
      .join("");
  },
};
