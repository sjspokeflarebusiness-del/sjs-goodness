/* ============================================
   TAIL LOADER v2 — waits for cloud DB to load
   ============================================ */
(function () {

  var common = [
    'js/config.js',       // ← MUST be first (has API keys)
    'js/db.js',
    'js/utils.js',
    'js/categories.js',
    'js/auth.js',
    'js/notifications.js',
    'js/ai-bot.js'
  ];

  var path = window.location.pathname.split('/').pop() || 'index.html';
  var pageScripts = {
    'index.html':     ['js/marketplace.js'],
    'shop.html':      ['js/shop.js'],
    'dashboard.html': ['js/dashboard.js'],
    'products.html':  ['js/dashboard.js', 'js/products.js'],
    'orders.html':    ['js/dashboard.js', 'js/orders.js'],
    'customers.html': ['js/dashboard.js', 'js/customers.js'],
    'expenses.html':  ['js/dashboard.js', 'js/expenses.js'],
    'analytics.html': ['js/dashboard.js', 'js/analytics.js'],
    'profile.html':   ['js/dashboard.js', 'js/profile.js'],
    'admin.html':     ['js/admin.js'],
    'admin-login.html': [],
    'login.html':     [],
    'register.html':  [],
    'pending.html':   []
  };

  var scripts = common.concat(pageScripts[path] || []);
  scripts.push('js/hamburger.js');

  function loadNext(i) {
    if (i >= scripts.length) {
      // All scripts loaded. Now wait for DB.init() (async cloud load)
      console.log('📦 All scripts loaded, initializing cloud DB...');
      showLoadingOverlay();

      DB.init().then(function () {
        hideLoadingOverlay();
        // Re-render page-specific content after data is loaded
        if (window.onDBReady) window.onDBReady();
        window.dispatchEvent(new Event('sjs:ready'));
        window.dispatchEvent(new Event('sjs:datachanged'));
      }).catch(function (err) {
        console.error('DB init failed:', err);
        hideLoadingOverlay();
        window.dispatchEvent(new Event('sjs:ready'));
      });
      return;
    }
    var s = document.createElement('script');
    s.src = scripts[i];
    s.onload = function () { loadNext(i + 1); };
    s.onerror = function () {
      console.error('Failed to load: ' + scripts[i]);
      loadNext(i + 1);
    };
    document.body.appendChild(s);
  }

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

  loadNext(0);
})();
