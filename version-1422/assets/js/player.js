(function () {
    function attachStream(video, streamUrl) {
        if (!video || !streamUrl) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.getAttribute("src") !== streamUrl) {
                video.setAttribute("src", streamUrl);
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsPlayer) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hlsPlayer = hls;
            }
            return;
        }

        if (video.getAttribute("src") !== streamUrl) {
            video.setAttribute("src", streamUrl);
        }
    }

    window.initMoviePlayer = function (videoId, streamUrl, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);

        if (!video) {
            return;
        }

        function playMovie() {
            attachStream(video, streamUrl);

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            var playPromise = video.play();

            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playMovie);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playMovie();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    };
})();
