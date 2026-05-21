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
                                <a href="https://zalo.me/sdt" target="_blank">Zalo</a>
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
                                    <a href="bao-ve-tien-ich-song.html">
                                        Bảo vệ Tiện ích sống
                                    </a>
                                </li>

                                <li>
                                    <a href="quy-cham-soc-y-te.html">
                                        Quỹ Chăm sóc Y tế
                                    </a>
                                </li>

                                <li>
                                    <a href="thu-vien.html">
                                        Thư viện Video / Case Study
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
                                    <p>emiinsurance4@gmail.com</p>
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

            <div class="floating-contact">
                <a href="https://zalo.me/sdt" class="float-btn zalo" target="_blank">
                    <i class="bi bi-chat-dots"></i>
                </a>

                <a href="https://web.facebook.com/baohiem.hieudung.chondung.vn/?_rdc=1&_rdr" class="float-btn facebook" target="_blank"  style="background:#1877F2">
                    <i class="bi bi-facebook"></i>
                </a>

                <a href="https://m.me/username" class="float-btn messenger" target="_blank" style="background:linear-gradient(135deg, #0084ff, #a43ff2)">
                    <i class="bi bi-messenger"></i>
                </a>

                <a href="https://www.tiktok.com/@emi_hotrobaohiem?_r=1&_t=ZS-96LGpjw1DPO" style="background:#000" class="float-btn tiktok" target="_blank">
                    <i class="bi bi-tiktok"></i>
                </a>
            </div>
        `;
    }
}

customElements.define('emi-footer', EmiFooter);