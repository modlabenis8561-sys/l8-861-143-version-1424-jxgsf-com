import { H as Hls } from "./hls-vendor-dru42stk.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const button = $("[data-menu-toggle]");
  const panel = $("[data-mobile-panel]");
  if (!button || !panel) return;
  button.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function initSearchForms() {
  $$("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : "";
      if (!query) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  });
}

function initHeroCarousel() {
  $$("[data-hero]").forEach((hero) => {
    const slides = $$("[data-hero-slide]", hero);
    const dots = $$("[data-hero-dot]", hero);
    const previous = $("[data-hero-prev]", hero);
    const next = $("[data-hero-next]", hero);
    if (!slides.length) return;
    let index = 0;
    let timer = null;
    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };
    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5000);
    };
    const stop = () => {
      if (timer) window.clearInterval(timer);
    };
    if (previous) previous.addEventListener("click", () => show(index - 1));
    if (next) next.addEventListener("click", () => show(index + 1));
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => show(dotIndex));
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  });
}

function initHorizontalScroll() {
  $$('[data-scroll-left], [data-scroll-right]').forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-scroll-left") || button.getAttribute("data-scroll-right");
      const target = document.getElementById(targetId);
      if (!target) return;
      const direction = button.hasAttribute("data-scroll-left") ? -1 : 1;
      target.scrollBy({ left: direction * 420, behavior: "smooth" });
    });
  });
}

function initFilters() {
  const form = $("[data-filter-form]");
  const cards = $$(".movie-card");
  if (!form || !cards.length) return;
  const keywordInput = $("[data-filter-keyword]", form);
  const yearInput = $("[data-filter-year]", form);
  const typeInput = $("[data-filter-type]", form);
  const categoryInput = $("[data-filter-category]", form);
  const normalize = (value) => (value || "").toString().trim().toLowerCase();
  const apply = () => {
    const keyword = normalize(keywordInput && keywordInput.value);
    const year = normalize(yearInput && yearInput.value);
    const type = normalize(typeInput && typeInput.value);
    const category = normalize(categoryInput && categoryInput.value);
    cards.forEach((card) => {
      const text = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.category
      ].join(" "));
      const matchesKeyword = !keyword || text.includes(keyword);
      const matchesYear = !year || normalize(card.dataset.year) === year;
      const matchesType = !type || normalize(card.dataset.type).includes(type);
      const matchesCategory = !category || normalize(card.dataset.category) === category;
      card.classList.toggle("is-hidden", !(matchesKeyword && matchesYear && matchesType && matchesCategory));
    });
  };
  form.addEventListener("input", apply);
  form.addEventListener("change", apply);
  form.addEventListener("reset", () => window.setTimeout(apply, 0));
}

function initVideoPlayer() {
  const video = $("[data-player]");
  if (!video) return;
  const source = video.dataset.src;
  const startButton = $("[data-play-trigger]");
  const errorBox = $("[data-player-error]");
  let hls = null;
  let loaded = false;
  const showError = (message) => {
    if (!errorBox) return;
    errorBox.hidden = false;
    errorBox.textContent = message;
  };
  const play = () => {
    video.controls = true;
    video.play().catch(() => {
      showError("视频已载入，请再次点击播放。 ");
    });
  };
  const load = () => {
    if (!source) {
      showError("当前播放源暂不可用。 ");
      return;
    }
    if (loaded) {
      play();
      return;
    }
    loaded = true;
    if (startButton) startButton.classList.add("is-hidden");
    if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, play);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data && data.fatal) {
          showError("视频加载失败，请稍后重试。 ");
          if (hls) hls.destroy();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", play, { once: true });
    } else {
      showError("当前浏览器不支持 HLS 播放。 ");
    }
  };
  if (startButton) startButton.addEventListener("click", load);
  video.addEventListener("click", () => {
    if (!loaded) load();
  });
  window.addEventListener("pagehide", () => {
    if (hls) hls.destroy();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSearchForms();
  initHeroCarousel();
  initHorizontalScroll();
  initFilters();
  initVideoPlayer();
});
