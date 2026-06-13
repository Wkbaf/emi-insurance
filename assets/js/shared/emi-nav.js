class EmiNav extends HTMLElement {
  connectedCallback() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    const isHome = currentPage === "" || currentPage === "index.html";

    this.innerHTML = `
      <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container d-flex align-items-center">
  
          <a class="navbar-brand"
             href="${isHome ? "#home" : "index.html#home"}">
  
            EMI<span class="brand-dot">.</span>
            <span class="brand-name">Insurance</span>
          </a>
  
          <button class="navbar-toggler ms-auto me-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar"
            aria-controls="navbar"
            aria-expanded="false"
            aria-label="Mở menu">
  
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <div class="collapse navbar-collapse justify-content-end" id="navbar">
  
            <ul class="navbar-nav align-items-lg-center py-3 py-lg-0">
  
              <li class="nav-item">
                <a class="nav-link"
                   href="${isHome ? "#home" : "index.html#home"}">
                   Trang chủ
                </a>
              </li>
  
              <li class="nav-item">
                <a class="nav-link"
                   href="${isHome ? "#about" : "index.html#about"}">
                   Giới thiệu
                </a>
              </li>

              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle"
                  href="javascript:void(0)"
                  data-menu="products"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  Sản phẩm
                </a>

                <ul class="dropdown-menu emi-dropdown">
                  <li>
                    <a class="dropdown-item" href="nhan-tho-di-san.html">
                      Giải pháp nhân thọ & di sản
                    </a>
                  </li>

                  <li>
                    <a class="dropdown-item" href="tien-ich-cuoc-song.html">
                      Bảo vệ tiện ích sống
                    </a>
                  </li>

                  <li>
                    <a class="dropdown-item" href="cham-soc-y-te.html">
                      Quỹ chăm sóc y tế
                    </a>
                  </li>

                  <li>
                    <a class="dropdown-item" href="an-sinh-xa-hoi.html">
                      Hoạch định an sinh xã hội
                    </a>
                  </li>

                  <li>
                    <a class="dropdown-item dropdown-parent-link"
                      href="${isHome ? "#products" : "index.html#products"}">
                      Xem tất cả sản phẩm
                    </a>
                  </li>
                </ul>
              </li>
  
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle"
                  href="javascript:void(0)"
                  data-menu="knowledge"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  Kiến thức
                </a>

                <ul class="dropdown-menu emi-dropdown">
                  <li>
                    <a class="dropdown-item" href="giai-ma-thuat-ngu.html">
                      Giải mã thuật ngữ
                    </a>
                  </li>

                  <li>
                    <a class="dropdown-item" href="boc-tach-giai-phap.html">
                      Bóc tách giải pháp
                    </a>
                  </li>

                  <li>
                    <a class="dropdown-item" href="case-study-thuc-te.html">
                      Case study thực tế
                    </a>
                  </li>

                  <li>
                    <a class="dropdown-item" href="blog.html">
                      Góc nhìn chuyên gia
                    </a>
                  </li>

                  <li>
                    <a class="dropdown-item dropdown-parent-link"
                      href="${isHome ? "#knowledge" : "index.html#knowledge"}">
                      Xem tất cả kiến thức
                    </a>
                  </li>
                </ul>
              </li>
  
              <li class="nav-item">
                <a class="nav-link"
                   href="#contact">
                   Liên hệ
                </a>
              </li>
  
              <li class="nav-item d-lg-none mt-3">
                <a href="#contact"
                   class="btn btn-main w-100">
                   Nhận báo giá
                </a>
              </li>
  
            </ul>
          </div>
  
          <div class="navbar-cta-desktop d-none d-lg-block">
            <a href="#contact"
               class="btn btn-main">
               Nhận báo giá
            </a>
          </div>
  
        </div>
      </nav>
      `;

    /* =========================
   ACTIVE MENU SYSTEM
========================= */

    const menuGroups = [
      {
        key: "products",
        pages: [
          "nhan-tho-di-san",
          "tien-ich-cuoc-song",
          "cham-soc-y-te",
          "an-sinh-xa-hoi",
        ],
      },
      {
        key: "knowledge",
        pages: [
          "giai-ma-thuat-ngu",
          "boc-tach-giai-phap",
          "case-study-thuc-te",
          "blog",
          "blog-detail",
          "case-study-detail",
        ],
      },
    ];

    const clearActiveMenu = () => {
      this.querySelectorAll(".nav-link, .dropdown-item").forEach((link) => {
        link.classList.remove("active-menu");
      });
    };

    const setActiveMenu = (menuKey) => {
      const menuLink = this.querySelector(`.nav-link[data-menu="${menuKey}"]`);

      if (!menuLink) return;

      clearActiveMenu();
      menuLink.classList.add("active-menu");
    };

    const setActiveSubMenu = (pageName, menuKey) => {
      clearActiveMenu();
    
      const parentLink = this.querySelector(`.nav-link[href*="#${menuKey}"]`);
      const subLink = Array.from(
        this.querySelectorAll(".dropdown-item")
      ).find(link => {
        const href = link.getAttribute("href") || "";
        return href.includes(pageName);
      });
    
      if (parentLink) parentLink.classList.add("active-menu");
      if (subLink) subLink.classList.add("active-menu");
    };

    /* active từ attribute */

    const active = this.getAttribute("active");

    if (active) {
      setActiveMenu(active);
    }

    /* active tự động theo page */

    const matchedGroup = menuGroups.find((group) =>
      group.pages.includes(currentPage),
    );

    if (matchedGroup) {
      // setActiveMenu(matchedGroup.key);
      setActiveSubMenu(currentPage, matchedGroup.key);
    }

    window.dispatchEvent(new Event("emi-nav-loaded"));
  }
}

customElements.define("emi-nav", EmiNav);
