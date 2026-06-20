(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuButton.textContent = open ? '×' : '☰';
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }
        stopHero();
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startHero();
        });
    }

    startHero();

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    var mainSearch = document.querySelector('.search-input');

    if (mainSearch && queryFromUrl) {
        mainSearch.value = queryFromUrl;
    }

    var localFilters = Array.prototype.slice.call(document.querySelectorAll('.local-filter'));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll('.genre-filter'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        var text = normalize((mainSearch && mainSearch.value) || (localFilters[0] && localFilters[0].value) || '');
        var year = '';
        yearFilters.forEach(function (select) {
            if (select.value) {
                year = select.value;
            }
        });

        var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year')
            ].join(' '));
            var cardYear = card.getAttribute('data-year') || '';
            var matchText = !text || haystack.indexOf(text) !== -1;
            var matchYear = !year || cardYear === year;
            var visible = matchText && matchYear;
            card.classList.toggle('is-hidden', !visible);
            if (visible) {
                shown += 1;
            }
        });

        var empty = document.querySelector('.empty-state');
        if (empty) {
            empty.classList.toggle('is-visible', cards.length > 0 && shown === 0);
        }
    }

    localFilters.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    yearFilters.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });

    if (mainSearch && queryFromUrl) {
        applyFilters();
    }

    function setupPlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.player-start');
        var url = box.getAttribute('data-video');
        var loaded = false;
        var hls = null;

        if (!video || !url) {
            return;
        }

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                return;
            }

            video.src = url;
        }

        function playVideo() {
            loadVideo();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (button && !video.ended) {
                button.classList.remove('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(setupPlayer);
})();
