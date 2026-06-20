(function() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                startTimer();
            });
        });
        startTimer();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        var query = normalize(searchInput && searchInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var category = normalize(categorySelect && categorySelect.value);

        cards.forEach(function(card) {
            var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-keywords'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardCategory = normalize(card.getAttribute('data-category'));
            var matched = true;

            if (query && haystack.indexOf(query) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }
            if (category && cardCategory !== category) {
                matched = false;
            }
            card.style.display = matched ? '' : 'none';
        });
    }

    [searchInput, yearSelect, typeSelect, categorySelect].forEach(function(control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });
})();
