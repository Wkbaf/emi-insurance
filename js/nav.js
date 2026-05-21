/* MENU SMOOTH SCROLL */
function initSmoothScroll() {
    document.querySelectorAll(".nav-link, .btn-main").forEach(link => {
        if (link.dataset.menuReady === "true") return;
        link.dataset.menuReady = "true";

        link.addEventListener("click", function (e) {
            const href = this.getAttribute("href");

            if (href && href.startsWith("#")) {
                e.preventDefault();

                const target = document.querySelector(href);

                if (target) {
                    const y = target.offsetTop - 90;

                    window.scrollTo({
                        top: y,
                        behavior: "smooth"
                    });

                    const navbarCollapse = document.querySelector(".navbar-collapse");

                    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
                        new bootstrap.Collapse(navbarCollapse).hide();
                    }
                }
            }
        });
    });
}


/* ACTIVE MENU */
let menuObserver;

function initActiveMenu() {
    const nav = document.querySelector("emi-nav");
    const fixedActive = nav?.getAttribute("active");

    if (menuObserver) {
        menuObserver.disconnect();
    }

    // PAGE CON: mặc định active products, nhưng xuống contact thì active contact
    if (fixedActive) {
        const setActiveMenu = (target) => {
            document.querySelectorAll(".nav-link").forEach(link => {
                link.classList.remove("active-menu");

                const href = link.getAttribute("href");

                if (href && href.includes(`#${target}`)) {
                    link.classList.add("active-menu");
                }
            });
        };

        setActiveMenu(fixedActive);

        const contactSection = document.querySelector("#contact");

        if (contactSection) {
            menuObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveMenu("contact");
                    } else {
                        setActiveMenu(fixedActive);
                    }
                });
            }, {
                threshold: 0.35
            });

            menuObserver.observe(contactSection);
        }

        return;
    }

    // HOME PAGE: active theo section khi scroll
    menuObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll(".nav-link").forEach(link => {
                    link.classList.remove("active-menu");

                    const href = link.getAttribute("href");

                    if (href === "#" + entry.target.id) {
                        link.classList.add("active-menu");
                    }
                });
            }
        });
    }, {
        threshold: 0.35
    });

    document.querySelectorAll("section[id]").forEach(section => {
        menuObserver.observe(section);
    });
}


/* INIT */
function initCommonMenu() {
    initSmoothScroll();
    initActiveMenu();
}

document.addEventListener("DOMContentLoaded", initCommonMenu);

window.addEventListener("emi-nav-loaded", initCommonMenu);
window.addEventListener("emi-contact-loaded", initCommonMenu);