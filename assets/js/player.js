const players = document.querySelectorAll('.movie-player');

players.forEach(function (player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const url = player.getAttribute('data-video');
  let prepared = false;
  let preparing = null;
  let hlsInstance = null;

  async function prepare() {
    if (prepared) {
      return;
    }
    if (preparing) {
      return preparing;
    }
    preparing = (async function () {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        const mod = await import('./hls-vendor-dru42stk.js');
        const Hls = mod.H;
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      prepared = true;
    })();
    return preparing;
  }

  async function play() {
    try {
      await prepare();
      player.classList.add('is-playing');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          window.setTimeout(function () {
            video.play().catch(function () {});
          }, 250);
        });
      }
    } catch (error) {
      player.classList.remove('is-playing');
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    player.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      player.classList.remove('is-playing');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
