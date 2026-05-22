class EmiNav extends HTMLElement {
    connectedCallback() {

        const currentPage =
            window.location.pathname.split("/").pop() || "index.html";

        const isHome =
            currentPage === "" ||
            currentPage === "index.html";

        this.innerHTML = `
      <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container d-flex align-items-center">
  
          <a class="navbar-brand"
             href="${isHome ? '#home' : 'index.html#home'}">
  
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
                   href="${isHome ? '#home' : 'index.html#home'}">
                   Trang chủ
                </a>
              </li>
  
              <li class="nav-item">
                <a class="nav-link"
                   href="${isHome ? '#about' : 'index.html#about'}">
                   Giới thiệu
                </a>
              </li>
  
              <li class="nav-item">
                <a class="nav-link"
                   href="${isHome ? '#products' : 'index.html#products'}">
                   Sản phẩm
                </a>
              </li>
  
              <li class="nav-item">
                <a class="nav-link"
                   href="${isHome ? '#knowledge' : 'index.html#knowledge'}">
                   Kiến thức
                </a>
              </li>
  
              <li class="nav-item">
                <a class="nav-link"
                   href="${isHome ? '#contact' : 'index.html#contact'}">
                   Liên hệ
                </a>
              </li>
  
              <li class="nav-item d-lg-none mt-3">
                <a href="${isHome ? '#contact' : 'index.html#contact'}"
                   class="btn btn-main w-100">
                   Nhận báo giá
                </a>
              </li>
  
            </ul>
          </div>
  
          <div class="navbar-cta-desktop d-none d-lg-block">
            <a href="${isHome ? '#contact' : 'index.html#contact'}"
               class="btn btn-main">
               Nhận báo giá
            </a>
          </div>
  
        </div>
      </nav>
      `;

        const active = this.getAttribute("active");

        if (active) {
            const activeLink = this.querySelector(`.nav-link[href*="#${active}"]`);
        
            if (activeLink) {
                this.querySelectorAll(".nav-link").forEach(link => {
                    link.classList.remove("active-menu");
                });
        
                activeLink.classList.add("active-menu");
            }
        }

        window.dispatchEvent(
            new Event("emi-nav-loaded")
        );
    }
}

customElements.define("emi-nav", EmiNav);