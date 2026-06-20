(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var filterLists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
    var activeField = 'all';
    var activeValue = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function matchesButton(card) {
        if (activeField === 'all' || activeValue === 'all') {
            return true;
        }

        var dataValue = normalize(card.getAttribute('data-' + activeField));
        return dataValue.indexOf(normalize(activeValue)) !== -1;
    }

    function matchesQuery(card, query) {
        if (!query) {
            return true;
        }

        var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-category'),
            card.getAttribute('data-genre'),
            card.textContent
        ].join(' ');

        return normalize(text).indexOf(query) !== -1;
    }

    function applyFilters() {
        var query = normalize(filterInputs.map(function (input) {
            return input.value;
        }).join(' '));

        filterLists.forEach(function (list) {
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

            cards.forEach(function (card) {
                var visible = matchesButton(card) && matchesQuery(card, query);
                card.classList.toggle('hidden-by-filter', !visible);
            });
        });
    }

    filterInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeField = button.getAttribute('data-filter-field') || 'all';
            activeValue = button.getAttribute('data-filter-value') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            applyFilters();
        });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && filterInputs.length) {
        filterInputs.forEach(function (input) {
            input.value = q;
        });
        applyFilters();
    }
})();
