/* ============================================
   TAIL LOADER — injects all scripts in correct order
   ============================================ */
(function () {
  // Common scripts (loaded on every page)
  var common = [
    'js/db.js',
    'js/utils.js',
    'js/categories.js',
    'js/auth.js',
    'js/notifications.js',
    'js/ai-bot.js'
  ];

  // Page-specific scripts
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

  // Final list: common + page-specific + hamburger LAST
  var scripts = common.concat(pageScripts[path] || ['js/hamburger.js']);
  // Always append hamburger at the very end
  if (scripts.indexOf('js/hamburger.js') === -1) {
    scripts.push('js/hamburger.js');
  }

  // Inject one after another (sequential — order matters!)
  function loadNext(i) {
    if (i >= scripts.length) {
      // All loaded — fire ready event
      window.dispatchEvent(new Event('sjs:ready'));
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
  loadNext(0);
})();
