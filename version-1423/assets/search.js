const params = new URLSearchParams(window.location.search);
const query = (params.get("q") || "").trim();
const input = document.querySelector("[data-search-page-input]");
const statusBox = document.querySelector("[data-search-status]");
const resultsBox = document.querySelector("[data-search-results]");

if (input) input.value = query;

function normalize(value) {
  return (value || "").toString().toLowerCase().trim();
}

function escapeHtml(value) {
  return (value || "").toString().replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function renderCard(movie) {
  const tags = (movie.tags || "").split(/[,，、/|；;\s]+/).filter(Boolean).slice(0, 3).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  return `
          <article class="video-card movie-card" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-type="${escapeHtml(movie.type)}" data-region="${escapeHtml(movie.region)}" data-genre="${escapeHtml(movie.genre)}" data-category="${escapeHtml(movie.category)}">
            <a href="./${escapeHtml(movie.url)}" class="card-link" aria-label="观看${escapeHtml(movie.title)}">
              <div class="video-cover-wrap">
                <img class="video-card-cover" src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy" decoding="async">
                <span class="cover-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.type)}</span>
              </div>
              <div class="video-card-content">
                <h2 class="video-card-title">${escapeHtml(movie.title)}</h2>
                <p class="video-card-description">${escapeHtml(movie.oneLine)}</p>
                <div class="tag-row">${tags}</div>
                <div class="video-card-meta">
                  <span>${escapeHtml(movie.category)}</span>
                  <span>${escapeHtml(movie.region)}</span>
                </div>
              </div>
            </a>
          </article>`;
}

function searchMovies(movies) {
  const key = normalize(query);
  if (!key) return movies.slice(0, 48);
  return movies.filter((movie) => normalize([
    movie.title,
    movie.year,
    movie.region,
    movie.type,
    movie.genre,
    movie.tags,
    movie.category,
    movie.oneLine
  ].join(" ")).includes(key));
}

fetch("./assets/search-data.json")
  .then((response) => response.json())
  .then((movies) => {
    const results = searchMovies(movies);
    if (statusBox) {
      statusBox.textContent = query ? `搜索关键词“${query}”的相关影片` : "热门影片推荐";
    }
    if (resultsBox) {
      resultsBox.innerHTML = results.length
        ? results.map(renderCard).join("")
        : `<p class="search-status">没有找到相关影片，请尝试其他关键词。</p>`;
    }
  })
  .catch(() => {
    if (statusBox) statusBox.textContent = "搜索数据暂时无法加载。";
  });
