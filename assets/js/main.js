/**
 * Template Name: iPortfolio - v3.3.0
 * Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */
(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach((e) => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos,
      behavior: "smooth",
    });
  };

  /**
   * Back to top button
   */
  let backtotop = select(".back-to-top");
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add("active");
      } else {
        backtotop.classList.remove("active");
      }
    };
    window.addEventListener("load", toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
   * Mobile nav toggle
   */
  on("click", ".mobile-nav-toggle", function (e) {
    select("body").classList.toggle("mobile-nav-active");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on(
    "click",
    ".scrollto",
    function (e) {
      if (select(this.hash)) {
        e.preventDefault();

        let body = select("body");
        if (body.classList.contains("mobile-nav-active")) {
          body.classList.remove("mobile-nav-active");
          let navbarToggle = select(".mobile-nav-toggle");
          navbarToggle.classList.toggle("bi-list");
          navbarToggle.classList.toggle("bi-x");
        }
        scrollto(this.hash);
      }
    },
    true
  );

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener("load", () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  /**
   * Hero type effect
   */
  const typed = select(".typed");
  if (typed) {
    let typed_strings = typed.getAttribute("data-typed-items");
    typed_strings = typed_strings.split(",");
    new Typed(".typed", {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 1400,
    });
  }

  /**
   * Skills animation
   */
  let skilsContent = select(".skills-content");
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: "80%",
      handler: function (direction) {
        let progress = select(".progress .progress-bar", true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute("aria-valuenow") + "%";
        });
      },
    });
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener("load", () => {
    let portfolioContainer = select(".portfolio-container");
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: ".portfolio-item",
      });

      let portfolioFilters = select("#portfolio-flters li", true);

      on(
        "click",
        "#portfolio-flters li",
        function (e) {
          e.preventDefault();
          portfolioFilters.forEach(function (el) {
            el.classList.remove("filter-active");
          });
          this.classList.add("filter-active");

          portfolioIsotope.arrange({
            filter: this.getAttribute("data-filter"),
          });
          portfolioIsotope.on("arrangeComplete", function () {
            AOS.refresh();
          });
        },
        true
      );
    }
  });

  /**
   * Initiate portfolio lightbox
   */
  const portfolioLightbox = GLightbox({
    selector: ".portfolio-lightbox",
  });

  /**
   * Portfolio details slider
   */
  new Swiper(".portfolio-details-slider", {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
  });

  /**
   * Testimonials slider
   */
  new Swiper(".testimonials-slider", {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    slidesPerView: "auto",
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20,
      },

      1200: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });

  /**
   * Animation on scroll
   */
  window.addEventListener("load", () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  });
})();

const select = (el, all = false) => {
  el = el.trim();
  if (all) {
    return [...document.querySelectorAll(el)];
  } else {
    return document.querySelector(el);
  }
};

let photoContainer = select("#photo-section .photo-container");

// Add your photos as 'a' (anchor) elements inside the container
photoContainer.innerHTML = `
  <a href="assets/photos/photos (1).jpg" data-caption="Caption 1">
    <img src="assets/photos/photos (1).jpg" alt="Photo 1">
  </a>
  <a href="assets/photos/photos (2).jpg" data-caption="Caption 2">
    <img src="assets/photos/photos (2).jpg" alt="Photo 2">
  </a>
  <a href="assets/photos/photos (3).jpg" data-caption="Caption 3">
  <img src="assets/photos/photos (3).jpg" alt="Photo 3">
</a>
<a href="assets/photos/photos (4).jpg" data-caption="Caption 4">
<img src="assets/photos/photos (4).jpg" alt="Photo 4">
</a>
<a href="assets/photos/photos (5).jpg" data-caption="Caption 5">
<img src="assets/photos/photos (5).jpg" alt="Photo 5">
</a>
<a href="assets/photos/photos (6).jpg" data-caption="Caption 6">
<img src="assets/photos/photos (6).jpg" alt="Photo 6">
</a>
<a href="assets/photos/photos (7).jpg" data-caption="Caption 7">
<img src="assets/photos/photos (7).jpg" alt="Photo 7">
</a>
<a href="assets/photos/photos (8).jpg" data-caption="Caption 8">
<img src="assets/photos/photos (8).jpg" alt="Photo 8">
</a>
<a href="assets/photos/photos (9).jpg" data-caption="Caption 9">
<img src="assets/photos/photos (9).jpg" alt="Photo 9">
</a>
<a href="assets/photos/photos (10).jpg" data-caption="Caption 10">
<img src="assets/photos/photos (10).jpg" alt="Photo 10">
</a>
<a href="assets/photos/photos (11).jpg" data-caption="Caption 11">
<img src="assets/photos/photos (11).jpg" alt="Photo 11">
</a>
</a>
<a href="assets/photos/photos (14).jpg" data-caption="Caption 14">
<img src="assets/photos/photos (14).jpg" alt="Photo 14">
</a>
<a href="assets/photos/photos (15).jpg" data-caption="Caption 15">
<img src="assets/photos/photos (15).jpg" alt="Photo 15">
</a>
<a href="assets/photos/photos (16).jpg" data-caption="Caption 16">
<img src="assets/photos/photos (16).jpg" alt="Photo 16">
</a>
<a href="assets/photos/photos (17).jpg" data-caption="Caption 17">
<img src="assets/photos/photos (17).jpg" alt="Photo 17">
</a>
<a href="assets/photos/photos (18).jpg" data-caption="Caption 18">
<img src="assets/photos/photos (18).jpg" alt="Photo 18">
</a>
<a href="assets/photos/photos (19).jpg" data-caption="Caption 19">
<img src="assets/photos/photos (19).jpg" alt="Photo 19">
</a>
<a href="assets/photos/photos (20).jpg" data-caption="Caption 20">
<img src="assets/photos/photos (20).jpg" alt="Photo 20">
</a>
`;


// Initialize BaguetteBox for the photo section
baguetteBox.run("#photo-section", {
  animation: "fadeIn", // You can customize the animation
  buttons: true, // Add zoom buttons
});
