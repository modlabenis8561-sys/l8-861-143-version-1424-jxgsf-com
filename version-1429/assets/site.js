/* 好片推荐：导航、Hero 轮播、搜索跳转与本页筛选交互 */

(function () {
  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      button.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-thumb]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function setActive(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        setActive(activeIndex + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActive(Number(dot.getAttribute('data-hero-dot')));
        startTimer();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        setActive(Number(thumb.getAttribute('data-hero-thumb')));
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        setActive(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setActive(activeIndex + 1);
        startTimer();
      });
    }

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    setActive(0);
    startTimer();
  }

  function initLocalFilters() {
    var filterInput = document.querySelector('[data-local-filter]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var grid = document.querySelector('[data-filter-grid]');

    if (!grid || (!filterInput && !typeSelect)) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(filterInput ? filterInput.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !type || cardType.indexOf(type) !== -1;

        card.style.display = matchesQuery && matchesType ? '' : 'none';
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var info = document.querySelector('[data-search-info]');
    var input = document.querySelector('[data-search-input]');

    if (!results || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function cardTemplate(movie) {
      return [
        '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + movie.year + '" data-type="' + escapeHtml(movie.type) + '" data-tags="' + escapeHtml(movie.tags.join(' ')) + '">',
        '  <a href="videos/' + movie.id + '.html" class="poster-link" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <div class="poster-frame">',
        '      <img src="' + movie.coverIndex + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="category-badge">' + escapeHtml(movie.categoryName) + '</span>',
        '      <span class="year-badge">' + movie.year + '</span>',
        '      <span class="play-hover">▶</span>',
        '    </div>',
        '  </a>',
        '  <div class="card-body">',
        '    <h3><a href="videos/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
        '    <p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genreRaw) + '</p>',
        '  </div>',
        '</article>'
      ].join('\n');
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    var normalizedQuery = normalize(query);
    var matched = [];

    if (normalizedQuery) {
      matched = window.SEARCH_INDEX.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genreRaw,
          movie.oneLine,
          movie.summary,
          movie.categoryName,
          movie.tags.join(' ')
        ].join(' ');

        return normalize(text).indexOf(normalizedQuery) !== -1;
      });
    }

    if (info) {
      info.textContent = normalizedQuery ? '搜索“' + query + '”共找到 ' + matched.length + ' 个结果' : '请输入关键词开始搜索。';
    }

    if (!normalizedQuery) {
      results.innerHTML = '<div class="search-empty">输入片名、地区、类型、标签或年份后即可搜索全站 2000 部影片。</div>';
      return;
    }

    if (!matched.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配内容，请尝试其他关键词。</div>';
      return;
    }

    results.innerHTML = matched.map(cardTemplate).join('\n');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroCarousel();
    initLocalFilters();
    initSearchPage();
  });
}());
