(function () {
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("open");
            mobileToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === current);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")));
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var searchInput = document.querySelector(".site-search");
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
    var emptyState = document.querySelector(".empty-state");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(searchInput ? searchInput.value : "");
        var activeFilters = {};

        filterSelects.forEach(function (select) {
            activeFilters[select.getAttribute("data-filter")] = normalize(select.value);
        });

        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));

            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesFilters = Object.keys(activeFilters).every(function (key) {
                var expected = activeFilters[key];
                return !expected || normalize(card.getAttribute("data-" + key)) === expected;
            });

            var isVisible = matchesKeyword && matchesFilters;
            card.hidden = !isVisible;

            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterCards);
    }

    filterSelects.forEach(function (select) {
        select.addEventListener("change", filterCards);
    });
})();
