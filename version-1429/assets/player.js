/* 好片推荐：HLS 播放器初始化逻辑 */

import { H as Hls } from './hls-dru42stk.js';

function initPlayer(player) {
  var video = player.querySelector('video');
  var playButton = player.querySelector('[data-play-button]');
  var errorBox = player.querySelector('[data-player-error]');
  var source = player.getAttribute('data-video-url');

  if (!video || !source) {
    return;
  }

  function showError(message) {
    player.classList.add('has-error');
    if (errorBox) {
      errorBox.textContent = message;
    }
  }

  function setPlayingState() {
    player.classList.toggle('is-playing', !video.paused);
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      player.classList.remove('has-error');
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        showError('网络错误，正在尝试重新加载视频源。');
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        showError('媒体解码错误，正在尝试恢复播放。');
        hls.recoverMediaError();
      } else {
        showError('视频加载失败，请刷新页面后重试。');
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else {
    showError('当前浏览器不支持 HLS 视频播放，请使用新版 Chrome、Edge、Firefox 或 Safari。');
  }

  function togglePlayback() {
    if (video.paused) {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showError('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    } else {
      video.pause();
    }
  }

  if (playButton) {
    playButton.addEventListener('click', togglePlayback);
  }

  video.addEventListener('click', togglePlayback);
  video.addEventListener('play', setPlayingState);
  video.addEventListener('pause', setPlayingState);
  video.addEventListener('ended', setPlayingState);
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-video-player]').forEach(initPlayer);
});
