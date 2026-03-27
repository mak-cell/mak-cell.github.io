document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const pageBody = document.body;

    if (!hamburger || !navMenu) {
        return;
    }

    const closeMenu = () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        pageBody.classList.remove('menu-open');
    };

    const toggleMenu = () => {
        const isActive = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active', isActive);
        hamburger.setAttribute('aria-expanded', String(isActive));
        pageBody.classList.toggle('menu-open', isActive);
    };

    hamburger.addEventListener('click', toggleMenu);
    hamburger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleMenu();
        }
    });

    document.querySelectorAll('.nav-link, .nav-menu .btn-primary').forEach((item) => {
        item.addEventListener('click', closeMenu);
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (event) {
            event.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
});
