/* ============================================
   HEAD LOADER — favicon, theme, MindPal, AUTO REBRAND
   Runs on every page. Handles all global changes.
   ============================================ */
(function () {
  var LOGO_PATH = 'css/sjs.png';
  var OLD_NAME = /SJS Goodness/g;
  var NEW_NAME = 'SJS & CO';

  // ---------- FAVICON ----------
  var link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = LOGO_PATH;
  document.head.appendChild(link);

  // ---------- THEME ----------
  try {
    var theme = JSON.parse(localStorage.getItem('sjs_theme') || '"light"');
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}

  // ---------- AUTO REBRAND (runs when DOM is ready) ----------
  function rebrand() {
    // 1. Update <title>
    if (document.title.indexOf('SJS Goodness') !== -1) {
      document.title = document.title.replace(OLD_NAME, NEW_NAME);
    }

    // 2. Replace text "SJS Goodness" everywhere on the page
    //    (uses text node walking to avoid breaking input values / attributes)
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          // Skip script/style
          var p = node.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          var tag = p.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'INPUT' || tag === 'TEXTAREA') {
            return NodeFilter.FILTER_REJECT;
          }
          return OLD_NAME.test(node.nodeValue)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(function (n) {
      n.nodeValue = n.nodeValue.replace(OLD_NAME, NEW_NAME);
    });

    // 3. Swap .brand-logo divs with the real logo image
    document.querySelectorAll('.brand-logo').forEach(function (el) {
      // Only swap if it currently contains just the letter "S"
      if (el.textContent.trim() === 'S') {
        var img = document.createElement('img');
        img.src = LOGO_PATH;
        img.alt = 'SJS & CO';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        el.textContent = '';
        el.appendChild(img);
      }
    });
  }

  // Run rebrand on DOM ready (multiple attempts to catch dynamically rendered content)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rebrand);
  } else {
    rebrand();
  }

  // Run again after 500ms and 1500ms (in case scripts render content later)
  setTimeout(rebrand, 500);
  setTimeout(rebrand, 1500);
  setTimeout(rebrand, 3000);

  // Also run after sjs:ready fires (data loaded)
  window.addEventListener('sjs:ready', function () {
    setTimeout(rebrand, 100);
  });

  // ---------- MINDPAL CHATBOT ----------
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var skipPages = ['login.html', 'register.html', 'admin.html', 'admin-login.html', 'pending.html'];

  if (skipPages.indexOf(path) === -1) {
    window.mindpalConfig = {
      chatbotId: "sjs-goodness-helper-iwt",
      display: { type: "floating-corner", anchor: "right" },
      behavior: { showInitialMessageBubbleWhenMinimized: true, minimizedByDefault: true }
    };
    var mindpalScript = document.createElement('script');
    mindpalScript.src = 'https://chatbot.getmindpal.com/embed.min.js';
    mindpalScript.async = true;
    document.head.appendChild(mindpalScript);
  }
})();
