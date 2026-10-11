/* ============================================
   HEAD LOADER — runs immediately, injects favicon + theme + MindPal
   ============================================ */
(function () {
  // ---------- FAVICON (uses your uploaded logo) ----------
  var link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = 'css/sjs.png';
  document.head.appendChild(link);

  // ---------- THEME (prevent white flash) ----------
  try {
    var theme = JSON.parse(localStorage.getItem('sjs_theme') || '"light"');
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}

  // ---------- MINDPAL CHATBOT ----------
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var skipPages = ['login.html', 'register.html', 'admin.html', 'admin-login.html', 'pending.html'];

  if (skipPages.indexOf(path) === -1) {
    window.mindpalConfig = {
      chatbotId: "sjs-goodness-helper-iwt",
      display: {
        type: "floating-corner",
        anchor: "right"
      },
      behavior: {
        showInitialMessageBubbleWhenMinimized: true,
        minimizedByDefault: true
      }
    };

    var mindpalScript = document.createElement('script');
    mindpalScript.src = 'https://chatbot.getmindpal.com/embed.min.js';
    mindpalScript.async = true;
    document.head.appendChild(mindpalScript);
  }
})();
