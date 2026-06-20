(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (slides.length > 1) {
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          restart();
        });
      });
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }
      restart();
    }
  });

  document.querySelectorAll('[data-card-filter]').forEach(function (input) {
    const list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      const keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const haystack = (card.getAttribute('data-search') || '').toLowerCase();
        card.hidden = keyword !== '' && haystack.indexOf(keyword) === -1;
      });
    });
  });

  const searchForm = document.querySelector('[data-search-form]');
  const searchResults = document.getElementById('searchResults');

  function renderSearchResults(items) {
    if (!searchResults) {
      return;
    }
    if (!items.length) {
      searchResults.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
      return;
    }
    searchResults.innerHTML = items.slice(0, 120).map(function (movie) {
      const tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="video-card movie-card">'
        + '<a class="card-cover" href="' + escapeAttribute(movie.url) + '">'
        + '<img class="video-card-cover" src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy">'
        + '<span class="card-play">▶</span>'
        + '<span class="card-year">' + escapeHtml(movie.year) + '</span>'
        + '</a>'
        + '<div class="video-card-content">'
        + '<a class="video-card-title" href="' + escapeAttribute(movie.url) + '">' + escapeHtml(movie.title) + '</a>'
        + '<p class="video-card-description">' + escapeHtml(movie.oneLine || '') + '</p>'
        + '<div class="video-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>'
        + '<div class="card-tags">' + tagHtml + '</div>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  function runSearch() {
    if (!searchForm || !searchResults || !window.MOVIES) {
      return;
    }
    const formData = new FormData(searchForm);
    const q = String(formData.get('q') || '').trim().toLowerCase();
    const type = String(formData.get('type') || '').trim();
    const year = String(formData.get('year') || '').trim();
    const items = window.MOVIES.filter(function (movie) {
      const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
      const matchText = q === '' || text.indexOf(q) !== -1;
      const matchType = type === '' || movie.type === type;
      const matchYear = year === '' || String(movie.year) === year;
      return matchText && matchType && matchYear;
    });
    renderSearchResults(items);
  }

  if (searchForm && searchResults) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      searchForm.elements.q.value = q;
    }
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
    });
    searchForm.addEventListener('input', runSearch);
    window.setTimeout(runSearch, 0);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
