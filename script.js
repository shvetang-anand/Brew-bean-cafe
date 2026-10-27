const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sectionLinks = [...document.querySelectorAll('.nav a[href^="#"]')];

const setCurrentNavigation = (sectionId) => {
  sectionLinks.forEach((link) => {
    if (link.hash === `#${sectionId}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

if (menuToggle && nav) {
  const closeNavigation = () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    nav.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeNavigation();
      menuToggle.focus();
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;

    event.preventDefault();
    if (nav?.classList.contains("open")) {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }

    if (window.location.hash !== link.hash) {
      window.history.pushState(null, "", link.hash);
    }
    setCurrentNavigation(target.id);

    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
    );
    progressBar?.style.setProperty(
      "transform",
      `scaleX(${scrollableHeight > 0 ? Math.min(targetScroll / scrollableHeight, 1) : 0})`
    );
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
});

const progressBar = document.querySelector("#scroll-progress-bar");

const updateScrollProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar?.style.setProperty("transform", `scaleX(${Math.min(progress, 1)})`);
};

document.addEventListener("scroll", updateScrollProgress, { passive: true, capture: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const navigationSections = sectionLinks
  .map((link) => document.getElementById(link.hash.slice(1)))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

    if (!visibleSection) return;

    setCurrentNavigation(visibleSection.target.id);
  }, {
    threshold: 0,
    rootMargin: "-15% 0px -50% 0px"
  });

  navigationSections.forEach((section) => sectionObserver.observe(section));
}

setCurrentNavigation(window.location.hash.slice(1) || "home");

const filterButtons = document.querySelectorAll(".filter-button");
const menuCards = document.querySelectorAll(".menu-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-active", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });

    menuCards.forEach((card) => {
      const shouldShow = selectedCategory === "all" || card.dataset.category === selectedCategory;
      card.hidden = !shouldShow;
      card.classList.remove("filter-enter");

      if (shouldShow) {
        requestAnimationFrame(() => card.classList.add("filter-enter"));
      }
    });
  });
});

document.querySelectorAll("img[data-fallback]").forEach((image) => {
  image.addEventListener("error", () => {
    if (image.dataset.fallbackUsed) {
      image.classList.add("image-unavailable");
      return;
    }

    image.dataset.fallbackUsed = "true";
    image.src = image.dataset.fallback;
  });
});

if ("IntersectionObserver" in window && !reduceMotion) {
  document.documentElement.classList.add("reveal-ready");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -35px 0px"
  });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
}
