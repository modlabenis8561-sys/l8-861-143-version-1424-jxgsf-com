(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.querySelectorAll('[data-nav-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var nav = document.querySelector('[data-site-nav]');
        if (nav) {
          nav.classList.toggle('is-open');
        }
      });
    });

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('poster-missing');
      });
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          return;
        }
      });
    });

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
      var current = 0;
      var timer = null;

      if (slides.length <= 1) {
        return;
      }

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  });
})();
