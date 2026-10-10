(function () {
  var root = document.documentElement;

  // Theme toggle
  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    });
  });

  // Mobile menu
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');
  if (menuButton && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('hidden', !open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuButton.addEventListener('click', function () {
      setMenu(menu.classList.contains('hidden'));
    });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Contact form (Web3Forms). Without JS the form still posts normally.
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var status = form.querySelector('[data-form-status]');
    var submit = form.querySelector('button[type="submit"]');
    var showStatus = function (message, ok) {
      status.textContent = message;
      status.className = 'text-sm ' + (ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400');
    };

    // Invisible hCaptcha using Web3Forms' shared free sitekey. Loaded on first
    // interaction with the form; most visitors never see a challenge.
    var SITEKEY = '50b2fe65-b00b-4b9e-ad62-3ba471098be2';
    var captchaWidget = null;
    var loadCaptcha = function () {
      if (captchaWidget) return captchaWidget;
      captchaWidget = new Promise(function (resolve, reject) {
        window.onCaptchaLoad = function () {
          resolve(window.hcaptcha.render(form.querySelector('[data-captcha]'), {
            sitekey: SITEKEY,
            size: 'invisible',
            theme: root.classList.contains('dark') ? 'dark' : 'light'
          }));
        };
        var script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&onload=onCaptchaLoad&recaptchacompat=off';
        script.async = true;
        script.onerror = function () {
          captchaWidget = null;
          reject(new Error('captcha-load'));
        };
        document.head.appendChild(script);
      });
      return captchaWidget;
    };
    form.addEventListener('focusin', function () { loadCaptcha().catch(function () {}); }, { once: true });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submit.disabled = true;
      showStatus('Sending…', true);

      var widget;
      loadCaptcha()
        .then(function (id) {
          widget = id;
          return window.hcaptcha.execute(id, { async: true });
        })
        .then(function (result) {
          var payload = Object.fromEntries(new FormData(form));
          payload['h-captcha-response'] = result.response;
          return fetch(form.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
          });
        })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (!data.success) throw new Error(data.message);
          form.reset();
          showStatus('Thanks! Your message is on its way.', true);
        })
        .catch(function (error) {
          showStatus(error === 'challenge-closed'
            ? 'Verification was cancelled. Please try again.'
            : 'Something went wrong. Please try again in a moment.', false);
        })
        .finally(function () {
          if (widget !== undefined) window.hcaptcha.reset(widget);
          submit.disabled = false;
        });
    });
  }
})();
