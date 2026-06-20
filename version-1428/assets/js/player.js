import { H as Hls } from './hls.js';

function setStatus(player, message) {
  var status = player.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message || '';
  }
}

function setupPlayer(player) {
  var video = player.querySelector('video[data-src]');
  var button = player.querySelector('[data-player-button]');

  if (!video || !button) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hls = null;
  var initialized = false;

  function attachSource() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    setStatus(player, '正在加载高清播放源…');

    return new Promise(function (resolve, reject) {
      if (!source) {
        reject(new Error('没有可用播放源'));
        return;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            reject(new Error('视频加载失败，请刷新页面重试'));
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          resolve();
        }, { once: true });
        video.addEventListener('error', function () {
          reject(new Error('视频加载失败，请刷新页面重试'));
        }, { once: true });
        return;
      }

      reject(new Error('当前浏览器不支持 HLS 播放'));
    });
  }

  function playVideo() {
    attachSource()
      .then(function () {
        video.controls = true;
        return video.play();
      })
      .then(function () {
        player.classList.add('is-playing');
        setStatus(player, '');
      })
      .catch(function (error) {
        initialized = false;
        setStatus(player, error.message || '播放失败，请稍后重试');
      });
  }

  button.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-video-player]').forEach(setupPlayer);
