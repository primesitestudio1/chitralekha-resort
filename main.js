(function () {
  "use strict";

  const header = document.getElementById("header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const form = document.getElementById("booking-form");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const galleryButtons = document.querySelectorAll(".gallery-item button");
  const cursorGlow = document.querySelector(".cursor-glow");
  const scrollProgress = document.getElementById("scroll-progress");
  const pageLoader = document.getElementById("page-loader");
  const heroParallax = document.getElementById("hero-parallax");
  const heroMediaWrap = document.getElementById("hero-media-wrap");
  const heroVideo = document.getElementById("hero-video");
  const heroFallback = document.getElementById("hero-fallback");
  const videoModal = document.getElementById("video-modal");
  const videoModalPlayer = document.getElementById("video-modal-player");
  const videoModalTitle = document.getElementById("video-modal-title");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let videoModalOpen = false;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* Page load */
  document.body.classList.add("is-loading");
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.body.classList.remove("is-loading");
      document.body.classList.add("loaded");
    }, prefersReducedMotion ? 0 : 900);
  });

  /* Scroll progress bar */
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + "%";
  }

  /* Header + parallax */
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 60);
    updateScrollProgress();

    if (heroMediaWrap && !prefersReducedMotion) {
      const y = window.scrollY;
      heroMediaWrap.style.transform = `scale(${1 + y * 0.00004}) translateY(${y * 0.2}px) translateZ(0)`;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Hero background video */
  function initHeroVideo() {
    if (!heroVideo || prefersReducedMotion) return;

    const onReady = () => {
      heroParallax.classList.add("video-ready");
      heroVideo.play().catch(() => {});
    };

    heroVideo.addEventListener("canplay", onReady, { once: true });
    if (heroVideo.readyState >= 3) onReady();

    heroVideo.addEventListener("error", () => {
      heroParallax.classList.remove("video-ready");
    });
  }

  initHeroVideo();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden || !heroVideo || !heroParallax.classList.contains("video-ready")) return;
    heroVideo.play().catch(() => {});
  });

  /* Scroll-play video cards + fullscreen modal */
  function openVideoModal(src, title) {
    if (!videoModal || !videoModalPlayer) return;
    videoModalOpen = true;
    videoModalTitle.textContent = title.replace(/&amp;/g, "&");
    videoModalPlayer.src = src;
    videoModal.hidden = false;
    document.body.style.overflow = "hidden";
    videoModalPlayer.play().catch(() => {});
    document.querySelectorAll("[data-video] video").forEach((v) => v.pause());
  }

  function closeVideoModal() {
    if (!videoModal || !videoModalPlayer) return;
    videoModalOpen = false;
    videoModal.hidden = true;
    videoModalPlayer.pause();
    videoModalPlayer.removeAttribute("src");
    document.body.style.overflow = "";
  }

  if (videoModal) {
    videoModal.querySelector(".video-modal-close").addEventListener("click", closeVideoModal);
    videoModal.querySelector(".video-modal-backdrop").addEventListener("click", closeVideoModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !videoModal.hidden) closeVideoModal();
    });
  }

  function initScrollVideos() {
    document.querySelectorAll("[data-video]").forEach((host) => {
      if (host.id === "hero-parallax" || host.closest(".hero")) return;

      const video = host.querySelector("video");
      if (!video) return;

      const src = host.dataset.video;
      const title = host.dataset.title || "Resort film";
      video.src = src;

      if (!prefersReducedMotion) {
        const obs = new IntersectionObserver(
          ([entry]) => {
            if (videoModalOpen) return;
            if (entry.isIntersecting) {
              video.play().catch(() => {});
              host.classList.add("is-playing");
            } else {
              video.pause();
              host.classList.remove("is-playing");
            }
          },
          { threshold: 0.3 }
        );
        obs.observe(host);
      }

      host.querySelector(".video-card-play")?.addEventListener("click", (e) => {
        e.stopPropagation();
        openVideoModal(src, title);
      });
      host.addEventListener("click", () => openVideoModal(src, title));
    });
  }

  initScrollVideos();

  /* Mobile nav */
  navToggle.addEventListener("click", () => {
    const open = navToggle.classList.toggle("active");
    navLinks.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* Stagger grid children */
  const staggerGroups = [
    { sel: ".rooms-grid .room-card", variant: "reveal-up" },
    { sel: ".experience-grid .exp-card:not(.exp-card-large)", variant: "reveal-scale" },
    { sel: ".nearby-grid .nearby-card", variant: "reveal-up" },
    { sel: ".gallery-grid .gallery-item", variant: "reveal-scale" },
    { sel: ".films-item", variant: "reveal-up" },
    { sel: ".hero-stats > div", variant: "reveal-up" },
  ];

  staggerGroups.forEach(({ sel, variant }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains("reveal")) el.classList.add("reveal", variant);
      el.style.transitionDelay = `${0.08 * i}s`;
    });
  });

  /* Scroll reveal — fade in when entering, fade out when leaving */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else if (!prefersReducedMotion && !entry.target.closest(".hero")) {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* Section in-view glow */
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll(".section").forEach((s) => sectionObserver.observe(s));

  /* Hero entrance */
  document.querySelectorAll(".hero .reveal").forEach((el, i) => {
    el.style.transitionDelay = `${0.15 + i * 0.12}s`;
    setTimeout(() => el.classList.add("visible"), prefersReducedMotion ? 0 : 400 + i * 120);
  });

  /* Stat number pulse on reveal */
  document.querySelectorAll(".stat-num").forEach((el) => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animation = "statPop 0.6s var(--ease-spring) forwards";
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
  });

  /* Inject stat pop keyframes */
  if (!document.getElementById("stat-pop-style")) {
    const style = document.createElement("style");
    style.id = "stat-pop-style";
    style.textContent = `@keyframes statPop { 0% { transform: scale(0.8); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }`;
    document.head.appendChild(style);
  }

  /* Cursor glow */
  if (cursorGlow && window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });
    function animateGlow() {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      cursorGlow.style.left = cx + "px";
      cursorGlow.style.top = cy + "px";
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  /* Gallery lightbox */
  const galleryImages = Array.from(galleryButtons).map((btn) => btn.querySelector("img"));
  let currentIndex = 0;

  function showLightbox(index) {
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    const img = galleryImages[currentIndex];
    lightboxImg.style.animation = "none";
    lightboxImg.offsetHeight;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxImg.style.animation = "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function hideLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  galleryButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => showLightbox(i));
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", hideLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () =>
    showLightbox(currentIndex - 1)
  );
  lightbox.querySelector(".lightbox-next").addEventListener("click", () =>
    showLightbox(currentIndex + 1)
  );

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) hideLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!videoModal.hidden && e.key === "Escape") {
      closeVideoModal();
      return;
    }
    if (lightbox.hidden) return;
    if (e.key === "Escape") hideLightbox();
    if (e.key === "ArrowLeft") showLightbox(currentIndex - 1);
    if (e.key === "ArrowRight") showLightbox(currentIndex + 1);
  });

  /* Booking form → mailto */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get("name");
    const phone = data.get("phone");
    const checkin = data.get("checkin");
    const checkout = data.get("checkout");
    const room = data.get("room");
    const message = data.get("message") || "—";

    const subject = encodeURIComponent(`Booking Enquiry — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nRoom: ${room || "Not specified"}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:stay@chitralekharesort.com?subject=${subject}&body=${body}`;
  });

  const checkinInput = form.querySelector('[name="checkin"]');
  const checkoutInput = form.querySelector('[name="checkout"]');
  const today = new Date().toISOString().split("T")[0];
  checkinInput.min = today;

  checkinInput.addEventListener("change", () => {
    checkoutInput.min = checkinInput.value;
    if (checkoutInput.value && checkoutInput.value < checkinInput.value) {
      checkoutInput.value = "";
    }
  });
})();
