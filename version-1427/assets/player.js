import { H as Hls } from './hls.js';

(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('.js-hls-player');
        var trigger = player.querySelector('.play-trigger');
        var loaded = false;
        var hls = null;

        if (!video) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }

            var stream = video.getAttribute('data-stream');

            if (!stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                loaded = true;
                return;
            }

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                loaded = true;
            }
        }

        function start() {
            load();
            player.classList.add('is-active');
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (!loaded) {
                start();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('is-active');
        });

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
