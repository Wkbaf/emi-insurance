class EmiFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="emi-footer">
                <div class="container">
                    <div class="row gy-5">

                        <div class="col-lg-3 col-md-6">
                            <div class="footer-logo">EMI</div>
                            <div class="footer-subtitle">INSURANCE</div>

                            <p class="footer-desc">
                                Hiểu đúng giá trị - <br>
                                Chọn đúng giải pháp.
                            </p>

                            <div class="social-list">
                                <a href="https://web.facebook.com/baohiem.hieudung.chondung.vn/?_rdc=1&_rdr" target="_blank">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://zalo.me/0823865827" target="_blank">Zalo</a>
                            </div>
                        </div>

                        <div class="col-lg-3 col-md-6">
                            <h5>Hệ sinh thái 4.0</h5>

                            <ul class="footer-links">
                                <li>
                                    <a href="nhan-tho-di-san.html">
                                        Nhân thọ & Di sản
                                    </a>
                                </li>

                                <li>
                                    <a href="tien-ich-cuoc-song.html">
                                        Bảo vệ Tiện ích sống
                                    </a>
                                </li>

                                <li>
                                    <a href="cham-soc-y-te.html">
                                        Quỹ Chăm sóc Y tế
                                    </a>
                                </li>

                                <li>
                                    <a href="an-sinh-xa-hoi.html">
                                        Hoạch định An sinh Xã hội
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div class="col-lg-3 col-md-6">
                            <h5>Hỗ trợ khách hàng</h5>

                            <ul class="footer-links">
                                <li>
                                    <a href="quy-trinh-boi-thuong.html">
                                        Quy trình bồi thường
                                    </a>
                                </li>

                                <li>
                                    <a href="danh-sach-benh-vien.html">
                                        Danh sách bệnh viện bảo lãnh
                                    </a>
                                </li>

                                <li>
                                    <a href="faq.html">
                                        FAQ - Câu hỏi thường gặp
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div class="col-lg-3 col-md-6">
                            <h5>Kết nối với EMI</h5>

                            <div class="contact-item">
                                <div class="icon">
                                    <i class="fas fa-phone"></i>
                                </div>

                                <div>
                                    <strong>Hotline</strong>
                                    <p>0823-865-827</p>
                                </div>
                            </div>

                            <div class="contact-item">
                                <div class="icon">
                                    <i class="far fa-envelope"></i>
                                </div>

                                <div>
                                    <strong>Email</strong>
                                    <p>emiinsurance40@gmail.com</p>
                                </div>
                            </div>

                            <div class="contact-item">
                                <div class="icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>

                                <div>
                                    <strong>Địa chỉ</strong>
                                    <p>
                                        Tầng 15 Tòa nhà Vincom Center <br>
                                        72 Lê Thánh Tôn, P. Sài Gòn
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <hr>

                    <div class="footer-bottom">
                        © 2026 EMI Insurance. All rights reserved.
                    </div>
                </div>
            </footer>

            <div class="floating-actions">
            

            <div class="floating-contact">
                <a href="https://zalo.me/0823865827" class="float-btn contact zalo" target="_blank">Zalo</a>

                <a href="https://web.facebook.com/baohiem.hieudung.chondung.vn/?_rdc=1&_rdr"
                class="float-btn contact facebook" target="_blank">
                    <i class="bi bi-facebook"></i>
                </a>

                <a href="https://m.me/baohiem.hieudung.chondung.vn" class="float-btn contact messenger" target="_blank">
                    <i class="bi bi-messenger"></i>
                </a>

                <a href="https://www.tiktok.com/@emi_hotrobaohiem?_r=1&_t=ZS-96LGpjw1DPO"
                class="float-btn contact tiktok" target="_blank">
                    <i class="bi bi-tiktok"></i>
                </a>

                <button class="float-btn chat-main" type="button">
                    <i class="bi bi-telephone"></i>
                </button>
            </div>

            <button class="back-to-top" type="button" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })">
                <i class="bi bi-arrow-up"></i>
            </button>
         </div>
        `;

        // FOR MOBILE FLOATING CONTACTS
        const floatingActions = this.querySelector('.floating-actions');
        const floatingContact = this.querySelector('.floating-contact');
        const chatMain = this.querySelector('.chat-main');
        const backToTop = this.querySelector('.back-to-top');

        let closeTimer;

        const openContacts = () => {
            clearTimeout(closeTimer);
            floatingActions.classList.add('is-open');
        };

        const closeContacts = () => {
            closeTimer = setTimeout(() => {
                floatingActions.classList.remove('is-open');
            }, 180);
        };

        // Desktop hover
        chatMain.addEventListener('mouseenter', openContacts);

        floatingContact.addEventListener('mouseenter', () => {
            if (floatingActions.classList.contains('is-open')) {
                openContacts();
            }
        });

        backToTop.addEventListener('mouseenter', () => {
            if (floatingActions.classList.contains('is-open')) {
                openContacts();
            }
        });

        floatingActions.addEventListener('mouseleave', closeContacts);

        // Mobile touch/click
        chatMain.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            floatingActions.classList.toggle('is-open');
        });

        backToTop.addEventListener('click', (e) => {
            e.stopPropagation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


}

customElements.define('emi-footer', EmiFooter);