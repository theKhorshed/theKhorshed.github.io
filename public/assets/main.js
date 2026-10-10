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

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submit.disabled = true;
      showStatus('Sending…', true);

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (!data.success) throw new Error(data.message);
          form.reset();
          showStatus('Thanks! Your message is on its way.', true);
        })
        .catch(function () {
          showStatus('Something went wrong. Please try again in a moment.', false);
        })
        .finally(function () {
          submit.disabled = false;
        });
    });
  }
})();
