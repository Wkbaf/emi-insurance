class EmiContact extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <section class="contact-section" id="contact">
          <div class="container">
            <div class="contact-wrap">
              <div class="row g-0 align-items-center">
  
                <div class="col-lg-6">
                  <div class="contact-left">
                    <div class="contact-badge">
                      <i class="bi bi-chat-dots"></i>
                      Tư vấn 1-1 minh bạch
                    </div>
  
                    <h2>Bắt đầu hành trình <br><span>Hiểu đúng - Chọn đúng</span></h2>
  
                    <p>
                      Để lại thông tin để thiết lập một buổi trò chuyện 1-1. Chúng tôi cam kết lắng nghe nhu cầu thực tế, rà soát lại bức tranh tài chính hiện tại và giải đáp mọi thắc mắc của bạn – hoàn toàn minh bạch và không có bất kỳ áp lực mua bán nào.
                    </p>
  
                    <div class="contact-image">
                      <img src="assets/image/image-contact.jpg" alt="EMI Insurance tư vấn">
                    </div>
                  </div>
                </div>
  
                <div class="col-lg-6">
                  <form id="consultForm">
                    <div class="contact-form-card">
                      <div class="row g-3">
  
                        <div class="col-12">
                          <input type="text" name="ho_ten" class="form-control custom-input"
                            placeholder="Họ và tên *" required>
                        </div>
  
                        <div class="col-12">
                          <input type="tel" name="so_dien_thoai" class="form-control custom-input"
                            placeholder="Số điện thoại (Zalo) *"
                            required
                            pattern="^(0|\\+84)[0-9]{9,10}$"
                            inputmode="tel"
                            title="Vui lòng nhập số điện thoại hợp lệ, ví dụ: 0912345678 hoặc +84912345678">
                        </div>
  
                        <div class="col-12">

                            <select name="nhu_cau_bao_hiem" class="form-select custom-input" required>
                                <option value="" selected disabled>
                                            Bạn đang quan tâm đến *
                                </option>

                                <option value="Rà soát lại hợp đồng cũ">Rà soát lại hợp đồng cũ</option>
                                <option value="Dự phòng Nhân thọ & Di sản">Dự phòng Nhân thọ & Di sản</option>
                                <option value="Chăm sóc y tế & Bảo lãnh viện phí">Chăm sóc y tế & Bảo lãnh viện
                                            phí</option>
                                <option value="Hoạch định hưu trí (BHXH tự nguyện)">Hoạch định hưu trí (BHXH tự
                                            nguyện)</option>
                                <option value="Bảo vệ tài sản (Ô tô, Nhà cửa)">Bảo vệ tài sản (Ô tô, Nhà cửa)
                                        </option>
                            </select>

                        </div>
  
                        <div class="col-12">
                          <textarea name="ghi_chu" class="form-control custom-textarea"
                            placeholder="Bạn muốn EMI hỗ trợ thêm điều gì?"></textarea>
                        </div>
  
                        <div class="col-12">
                          <button type="submit" class="contact-btn">Đặt lịch trò chuyện</button>
                        </div>
  
                      </div>
  
                      <div class="contact-note">
                        EMI cam kết tư vấn minh bạch, không gây áp lực mua bán.
                      </div>
                    </div>
                  </form>
                </div>
  
              </div>
            </div>
          </div>
        </section>
      `;
    window.dispatchEvent(new Event("emi-contact-loaded"));
    this.initContactForm();
    this.initContactAnimation();
  }

  initContactForm() {
    const consultForm = this.querySelector("#consultForm");
    if (!consultForm) return;

    consultForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!consultForm.checkValidity()) {
        consultForm.reportValidity();
        return;
      }

      const btn = consultForm.querySelector("button[type='submit']");
      btn.innerText = "Đang gửi.";
      btn.disabled = true;

      try {
        await fetch("https://script.google.com/macros/s/AKfycbynEB0RQoZF3s8FoYcbC4b5MiwIClgTwC60exHSAicSODe_JgYHoL4i1AI_UYItmoWm/exec", {
          method: "POST",
          mode: "no-cors",
          body: new FormData(consultForm)
        });

        alert("Gửi yêu cầu thành công! EMI sẽ liên hệ bạn sớm.");
        consultForm.reset();
      } catch (error) {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }

      btn.innerText = "Đặt lịch trò chuyện";
      btn.disabled = false;
    });
  }

  initContactAnimation() {
    const contactSection = this.querySelector("#contact");
    const contactPerson = this.querySelector(".contact-image");

    if (!contactSection || !contactPerson) return;

    const contactObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          contactPerson.classList.add("show");
        } else {
          contactPerson.classList.remove("show");
        }
      });
    }, {
      threshold: 0.45
    });

    contactObserver.observe(contactSection);
  }
}

customElements.define("emi-contact", EmiContact);