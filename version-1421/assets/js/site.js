document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-menu]");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var previous = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                startTimer();
            });
        }

        carousel.addEventListener("mouseenter", stopTimer);
        carousel.addEventListener("mouseleave", startTimer);
        show(0);
        startTimer();
    });

    document.querySelectorAll("[data-search-input]").forEach(function (input) {
        var root = input.closest("main") || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));

        input.addEventListener("input", function () {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
                card.classList.toggle("is-hidden", value.length > 0 && text.indexOf(value) === -1);
            });
        });
    });

    document.querySelectorAll("[data-player]").forEach(function (box) {
        var video = box.querySelector("video");
        var trigger = box.querySelector("[data-play-trigger]");
        var source = box.getAttribute("data-video");
        var started = false;
        var hlsInstance = null;

        function playVideo() {
            if (!video || !source) {
                return;
            }

            box.classList.add("is-playing");

            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;

            function requestPlay() {
                video.play().catch(function () {});
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal && hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = source;
                        video.load();
                        requestPlay();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", requestPlay, { once: true });
                video.load();
            } else {
                video.src = source;
                video.load();
                requestPlay();
            }
        }

        if (trigger) {
            trigger.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!started) {
                    playVideo();
                }
            });
        }
    });
});
