class EmiOtherProducts extends HTMLElement {
    connectedCallback() {
      const current = this.getAttribute("current");
  
      const products = [
        {
          key: "nhan-tho-di-san",
          icon: "fa-solid fa-people-roof",
          title: "Giải pháp<br>Nhân thọ & Di sản",
          link: "nhan-tho-di-san.html",
          items: [
            "Bảo vệ thu nhập người trụ cột.",
            "Quỹ học vấn vững chắc cho con.",
            "Ủy thác & chuyển giao di sản."
          ]
        },
        {
          key: "tien-ich-cuoc-song",
          icon: "fa-solid fa-house-chimney-user",
          title: "Bảo vệ<br>Tiện ích sống",
          link: "tien-ich-cuoc-song.html",
          items: [
            "Bảo hiểm vật chất xe cộ.",
            "Bảo hiểm rủi ro nhà tư nhân.",
            "Bảo vệ tai nạn & du lịch toàn cầu."
          ]
        },
        {
          key: "cham-soc-y-te",
          icon: "fa-solid fa-heart-pulse",
          title: "Quỹ<br>Chăm sóc Y tế",
          link: "cham-soc-y-te.html",
          items: [
            "Bảo lãnh viện phí toàn diện.",
            "Tiếp cận y tế Quốc tế/Tư nhân.",
            "Trải nghiệm dịch vụ cao cấp."
          ]
        },
        {
          key: "an-sinh-xa-hoi",
          icon: "fa-solid fa-address-card",
          title: "Hoạch định<br>An sinh Xã hội",
          link: "an-sinh-xa-hoi.html",
          items: [
            "Rà soát quyền lợi BHXH.",
            "Thiết kế lộ trình hưu trí độc lập.",
            "Hỗ trợ thủ tục trọn gói, minh bạch."
          ]
        }
      ];
  
      const otherProducts = products.filter(product => product.key !== current);
  
      this.innerHTML = `
        <section class="solution-section other-products-section" id="other-products">
          <div class="bg-circles">
            <span></span>
            <span></span>
            <span></span>
          </div>
  
          <div class="container">
            <div class="solution-header">
              <span class="solution-badge">
                <i class="fa-solid fa-layer-group"></i>
                Các sản phẩm khác
              </span>
  
              <h2>Khám phá thêm các lớp bảo vệ trong hệ sinh thái EMI</h2>
  
              <p>
                Mỗi giải pháp là một mảnh ghép trong kế hoạch bảo vệ tài chính toàn diện,
                giúp bạn an tâm hơn ở từng giai đoạn cuộc sống.
              </p>
            </div>
  
            <div class="row g-4 justify-content-center">
              ${otherProducts.map(product => `
                <div class="col-lg-4 col-md-6">
                  <article class="solution-card">
                    <div class="solution-icon">
                      <i class="${product.icon}"></i>
                    </div>
  
                    <h4>${product.title}</h4>
  
                    <ul>
                      ${product.items.map(item => `<li>${item}</li>`).join("")}
                    </ul>
  
                    <a href="${product.link}">
                      Xem chi tiết <i class="bi bi-arrow-right"></i>
                    </a>
                  </article>
                </div>
              `).join("")}
            </div>
          </div>
        </section>
      `;
    }
  }
  
  customElements.define("emi-other-products", EmiOtherProducts);