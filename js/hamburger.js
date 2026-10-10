/* ============================================
   MOBILE HAMBURGER MENU
   ============================================ */

function initHamburger() {
  // Find sidebar
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    console.warn('No sidebar found on this page');
    return;
  }

  // Find or create overlay
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  // Add click handler to hamburger(s)
  const hb = document.querySelector('.hamburger');
  if (hb) {
    // Remove any existing handler to avoid double binding
    hb.onclick = null;
    hb.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
      console.log('Hamburger clicked. Sidebar open:', sidebar.classList.contains('open'));
    };
  } else {
    console.warn('No .hamburger element found. Did you add it to HTML?');
  }

  // Close when overlay clicked
  overlay.onclick = function () {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  };

  // Close when any sidebar link clicked
  sidebar.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  });
}

// Run on DOM ready, and also after a delay (in case dashboard.js injects things late)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHamburger);
} else {
  initHamburger();
}
setTimeout(initHamburger, 500); // retry in case sidebar loaded late
