/* ============================================
   TAIL LOADER — injects all scripts in correct order
   ============================================ */
(function () {
  // Load all common scripts sequentially
  var scripts = [
    'js/db.js',
    'js/utils.js',
    'js/categories.js',
    'js/auth.js',
    'js/notifications.js',
    'js/ai-bot.js',
    'js/hamburger.js'
  ];

  // Detect which page-specific script to add
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var pageScripts = {
    'index.html': 'js/marketplace.js',
    'shop.html': 'js/shop.js',
    'dashboard.html': 'js/dashboard.js',
    'products.html': ['js/dashboard.js', 'js/products.js'],
    'orders.html': ['js/dashboard.js', 'js/orders.js'],
    'customers.html': ['js/dashboard.js', 'js/customers.js'],
    'expenses.html': ['js/dashboard.js', 'js/expenses.js'],
    'analytics.html': ['js/dashboard.js', 'js/analytics.js'],
    'profile.html': ['js/dashboard.js', 'js/profile.js'],
    'admin.html': 'js/admin.js'
  };

  var page = pageScripts[path];
  if (Array.isArray(page)) scripts = scripts.concat(page);
  else if (page) scripts.push(page);

  // Inject one after another
  function loadNext(i) {
    if (i >= scripts.length) {
      // All loaded — fire DOMContentLoaded for late initializers
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
