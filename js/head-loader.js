/* ============================================
   HEAD LOADER — injects favicon + theme early
   ============================================ */
(function () {
  // Favicon (data URL — no 404 ever)
  var link = document.createElement('link');
  link.rel = 'icon';
  link.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23fc8019'/%3E%3Ctext x='50' y='68' font-size='60' font-family='system-ui' font-weight='bold' text-anchor='middle' fill='white'%3ES%3C/text%3E%3C/svg%3E";
  document.head.appendChild(link);

  // Apply theme before page renders (prevents white flash)
  try {
    var theme = JSON.parse(localStorage.getItem('sjs_theme') || '"light"');
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
})();
