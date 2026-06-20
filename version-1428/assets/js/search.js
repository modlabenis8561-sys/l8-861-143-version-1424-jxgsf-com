(function () {
  var movies = window.MOVIE_SEARCH_DATA || [];
  var state = {
    page: 1,
    pageSize: 36
  };

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function unique(values) {
    var seen = {};
    return values.filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    }).sort(function (a, b) {
      return String(a).localeCompare(String(b), 'zh-CN');
    });
  }

  function fillSelect(select, values, placeholder) {
    if (!select) {
      return;
    }
    select.innerHTML = '<option value="">' + escapeHTML(placeholder) + '</option>' + values.map(function (value) {
      return '<option value="' + escapeHTML(value) + '">' + escapeHTML(value) + '</option>';
    }).join('');
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
      '  <a href="detail/movie-' + escapeHTML(movie.id) + '.html" aria-label="观看 ' + escapeHTML(movie.title) + '">' +
      '    <div class="poster-frame">' +
      '      <img class="poster-img" src="' + escapeHTML(movie.cover) + '.jpg" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
      '      <div class="poster-shade"></div>' +
      '      <div class="play-mark" aria-hidden="true">▶</div>' +
      '      <div class="meta-badge meta-badge--year">' + escapeHTML(movie.year) + '</div>' +
      '      <div class="meta-row"><span>' + escapeHTML(movie.type) + '</span><span>' + escapeHTML(movie.region) + '</span></div>' +
      '    </div>' +
      '    <div class="movie-card__body">' +
      '      <h3>' + escapeHTML(movie.title) + '</h3>' +
      '      <p>' + escapeHTML(movie.oneLine) + '</p>' +
      '      <div class="tag-row">' + tags + '</div>' +
      '    </div>' +
      '  </a>' +
      '</article>';
  }

  function filterMovies() {
    var q = (document.querySelector('[data-search-input]') || {}).value || '';
    var region = (document.querySelector('[data-region-filter]') || {}).value || '';
    var type = (document.querySelector('[data-type-filter]') || {}).value || '';
    var year = (document.querySelector('[data-year-filter]') || {}).value || '';
    var keyword = q.trim().toLowerCase();

    return movies.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine].concat(movie.tags || []).join(' ').toLowerCase();
      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (region && movie.region !== region) {
        return false;
      }
      if (type && movie.type !== type) {
        return false;
      }
      if (year && String(movie.year) !== String(year)) {
        return false;
      }
      return true;
    });
  }

  function render() {
    var results = filterMovies();
    var totalPages = Math.max(1, Math.ceil(results.length / state.pageSize));
    var output = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var pages = document.querySelector('[data-search-pages]');

    if (state.page > totalPages) {
      state.page = totalPages;
    }

    var start = (state.page - 1) * state.pageSize;
    var current = results.slice(start, start + state.pageSize);

    if (summary) {
      summary.textContent = '共找到 ' + results.length + ' 部影片，当前显示第 ' + state.page + ' / ' + totalPages + ' 页';
    }

    if (output) {
      output.innerHTML = current.length ? current.map(movieCard).join('') : '<p class="result-summary">没有找到匹配影片，请调整关键词或筛选条件。</p>';
      output.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
          image.classList.add('poster-missing');
        });
      });
    }

    if (pages) {
      var buttons = [];
      if (state.page > 1) {
        buttons.push('<button type="button" data-page="' + (state.page - 1) + '">上一页</button>');
      }
      var from = Math.max(1, state.page - 2);
      var to = Math.min(totalPages, state.page + 2);
      for (var index = from; index <= to; index += 1) {
        buttons.push('<button type="button" class="' + (index === state.page ? 'is-current' : '') + '" data-page="' + index + '">' + index + '</button>');
      }
      if (state.page < totalPages) {
        buttons.push('<button type="button" data-page="' + (state.page + 1) + '">下一页</button>');
      }
      pages.innerHTML = buttons.join('');
      pages.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('click', function () {
          state.page = Number(button.getAttribute('data-page')) || 1;
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    fillSelect(document.querySelector('[data-region-filter]'), unique(movies.map(function (movie) { return movie.region; })), '全部地区');
    fillSelect(document.querySelector('[data-type-filter]'), unique(movies.map(function (movie) { return movie.type; })), '全部类型');
    fillSelect(document.querySelector('[data-year-filter]'), unique(movies.map(function (movie) { return movie.year; })).reverse(), '全部年份');

    var input = document.querySelector('[data-search-input]');
    if (input) {
      input.value = getQueryParam('q');
    }

    document.querySelectorAll('[data-search-input], [data-region-filter], [data-type-filter], [data-year-filter]').forEach(function (control) {
      control.addEventListener('input', function () {
        state.page = 1;
        render();
      });
      control.addEventListener('change', function () {
        state.page = 1;
        render();
      });
    });

    var reset = document.querySelector('[data-reset-search]');
    if (reset) {
      reset.addEventListener('click', function () {
        document.querySelectorAll('[data-search-input], [data-region-filter], [data-type-filter], [data-year-filter]').forEach(function (control) {
          control.value = '';
        });
        state.page = 1;
        render();
      });
    }

    render();
  });
})();
