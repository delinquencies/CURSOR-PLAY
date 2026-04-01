(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var loader = document.getElementById("page-loader");
  var body = document.body;

  function hideLoader() {
    if (!loader) return;
    loader.classList.add("is-done");
    body.classList.remove("is-loading");
    setTimeout(function () {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 600);
  }

  function showLoaderMinThen(done) {
    var start = Date.now();
    var minMs = 900;
    function finish() {
      var elapsed = Date.now() - start;
      var wait = Math.max(0, minMs - elapsed);
      setTimeout(done, wait);
    }
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }
  }

  body.classList.add("is-loading");
  showLoaderMinThen(hideLoader);

  // Year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Header: scroll shadow
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  // Mobile nav
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");
  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    if (siteNav) {
      siteNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          header.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "Open menu");
        });
      });
    }
  }

  // Intersection: reveals + stacked lines (hero is driven separately so stagger stays intact)
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        io.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );

  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    if (el.closest(".hero")) return;
    io.observe(el);
  });
  document.querySelectorAll("[data-reveal-line]").forEach(function (el) {
    if (el.closest(".hero")) return;
    io.observe(el);
  });

  // Hero lines: animate after loader (stagger)
  var heroLines = document.querySelectorAll(".hero [data-reveal-line]");
  function runHeroLines() {
    if (prefersReducedMotion) {
      heroLines.forEach(function (line) {
        line.classList.add("is-inview");
      });
      document.querySelectorAll(".hero [data-reveal]").forEach(function (el) {
        el.classList.add("is-inview");
      });
      return;
    }
    heroLines.forEach(function (line, i) {
      setTimeout(function () {
        line.classList.add("is-inview");
      }, 120 + i * 110);
    });
    document.querySelectorAll(".hero [data-reveal]").forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add("is-inview");
      }, 500 + i * 80);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(runHeroLines, 100);
    });
  } else {
    setTimeout(runHeroLines, 100);
  }

  // Stats counter
  var statValues = document.querySelectorAll(".stat__value[data-count]");
  var counted = false;

  function animateValue(el, target) {
    var duration = prefersReducedMotion ? 0 : 1400;
    var start = 0;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var p = duration === 0 ? 1 : Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = String(current);
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    }
    requestAnimationFrame(step);
  }

  var statsBlock = document.querySelector(".stats");
  if (statsBlock && statValues.length) {
    var statsIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || counted) return;
          counted = true;
          statValues.forEach(function (el) {
            var n = parseInt(el.getAttribute("data-count"), 10);
            if (!isNaN(n)) animateValue(el, n);
          });
          statsIo.disconnect();
        });
      },
      { threshold: 0.25 }
    );
    statsIo.observe(statsBlock);
  }

  // Contact form (demo: no backend)
  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("form-status");
  if (form && statusEl) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        statusEl.textContent = "Please fill in every field.";
        return;
      }
      statusEl.textContent = "Sending…";
      setTimeout(function () {
        statusEl.textContent = "Thank you—your note is on its way. I will reply soon.";
        form.reset();
      }, 700);
    });
  }
})();
