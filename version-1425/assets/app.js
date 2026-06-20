(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMenu() {
    var toggle = one('[data-menu-toggle]');
    var menu = one('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        move(1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearchForms() {
    all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = one('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        var target = form.getAttribute('action') || './search.html';
        window.location.href = target + '?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function initScrollRails() {
    all('[data-scroll-section]').forEach(function (section) {
      var rail = one('[data-scroll-rail]', section);
      var prev = one('[data-scroll-left]', section);
      var next = one('[data-scroll-right]', section);
      if (!rail) {
        return;
      }
      function scrollByStep(step) {
        rail.scrollBy({
          left: step,
          behavior: 'smooth'
        });
      }
      if (prev) {
        prev.addEventListener('click', function () {
          scrollByStep(-420);
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          scrollByStep(420);
        });
      }
    });
  }

  function initCardFilter() {
    all('[data-card-filter]').forEach(function (input) {
      var scope = input.closest('[data-filter-scope]') || document;
      var cards = all('.js-filter-card', scope);
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
          card.classList.toggle('is-hidden-card', query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function renderCard(movie) {
    return [
      '<a class="video-card" href="' + movie.href + '">',
      '  <div class="card-cover-wrap">',
      '    <img class="video-card-cover" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-corner">' + escapeHtml(movie.year) + '</span>',
      '    <span class="card-play">▶</span>',
      '  </div>',
      '  <div class="video-card-content">',
      '    <h2 class="video-card-title">' + escapeHtml(movie.title) + '</h2>',
      '    <p class="video-card-description">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="video-card-meta">',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '      <span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = one('[data-search-results]');
    var input = one('[data-search-page-input]');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var query = getQuery();
    if (input && query) {
      input.value = query;
    }
    function run(value) {
      var term = (value || '').trim().toLowerCase();
      if (!term) {
        results.innerHTML = '<div class="search-results-empty">请输入片名、题材、年份或地区进行搜索。</div>';
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.searchText.toLowerCase().indexOf(term) !== -1;
      }).slice(0, 96);
      if (!matched.length) {
        results.innerHTML = '<div class="search-results-empty">没有找到匹配内容，换个关键词试试。</div>';
        return;
      }
      results.innerHTML = matched.map(renderCard).join('');
    }
    run(query);
    if (input) {
      input.addEventListener('input', function () {
        run(input.value);
      });
    }
  }

  function initPlayer(source) {
    var video = one('[data-player-video]');
    var overlay = one('[data-player-overlay]');
    var startButton = one('[data-player-start]');
    var hls = null;
    var loaded = false;
    if (!video || !source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
      loaded = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function play() {
      load();
      hideOverlay();
      video.controls = true;
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {});
      }
    }

    function toggleVideo() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (startButton && startButton !== overlay) {
      startButton.addEventListener('click', play);
    }
    video.addEventListener('click', toggleVideo);
    video.addEventListener('play', hideOverlay);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchForms();
    initScrollRails();
    initCardFilter();
    initSearchPage();
  });
})();
