/* ============================================
   TAIL LOADER v3 — Firebase edition
   ============================================ */
(function () {

  // Step 1: Load Firebase SDKs from CDN
  var firebaseScripts = [
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js'
  ];

  // Step 2: Load our own scripts
  var common = [
    'js/firebase-config.js',
    'js/firebase-db.js',
    'js/utils.js',
    'js/categories.js',
    'js/auth.js',
    'js/notifications.js',
    'js/ai-bot.js'
  ];

  var path = window.location.pathname.split('/').pop() || 'index.html';
  var pageScripts = {
    'index.html':       ['js/marketplace.js'],
    'shop.html':        ['js/shop.js'],
    'dashboard.html':   ['js/dashboard.js'],
    'products.html':    ['js/dashboard.js', 'js/products.js'],
    'orders.html':      ['js/dashboard.js', 'js/orders.js'],
    'customers.html':   ['js/dashboard.js', 'js/customers.js'],
    'expenses.html':    ['js/dashboard.js', 'js/expenses.js'],
    'analytics.html':   ['js/dashboard.js', 'js/analytics.js'],
    'profile.html':     ['js/dashboard.js', 'js/profile.js'],
    'admin.html':       ['js/admin.js'],
    'admin-login.html': [],
    'login.html':       [],
    'register.html':    [],
    'pending.html':     []
  };

  var scripts = common.concat(pageScripts[path] || []);
  scripts.push('js/hamburger.js');

  function loadNext(list, i, onDone) {
    if (i >= list.length) { onDone(); return; }
    var s = document.createElement('script');
    s.src = list[i];
    s.onload = function () { loadNext(list, i + 1, onDone); };
    s.onerror = function () {
      console.error('Failed to load: ' + list[i]);
      loadNext(list, i + 1, onDone);
    };
    document.body.appendChild(s);
  }

  // Load Firebase SDKs first
  loadNext(firebaseScripts, 0, function () {
    // Then load our scripts
    loadNext(scripts, 0, function () {
      showLoadingOverlay();

      // Initialize Firebase + DB
      DB.init().then(function () {
        hideLoadingOverlay();
        window.dispatchEvent(new Event('sjs:ready'));
        window.dispatchEvent(new Event('sjs:datachanged'));
      }).catch(function (err) {
        console.error('DB init failed:', err);
        hideLoadingOverlay();
        // Still fire ready so pages don't hang
        window.dispatchEvent(new Event('sjs:ready'));
      });
    });
  });

  function showLoadingOverlay() {
    if (document.getElementById('sjs-loading')) return;
    var el = document.createElement('div');
    el.id = 'sjs-loading';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;font-family:system-ui;';
    el.innerHTML = '<div style="width:50px;height:50px;border:4px solid #fc8019;border-top-color:transparent;border-radius:50%;animation:sjsSpin 1s linear infinite;"></div><div style="color:#666;font-size:14px;">Loading your shop...</div><style>@keyframes sjsSpin{to{transform:rotate(360deg)}}</style>';
    document.body.appendChild(el);
  }
  function hideLoadingOverlay() {
    var el = document.getElementById('sjs-loading');
    if (el) el.remove();
  }
})();
