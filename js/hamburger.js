/* ============================================
   MOBILE HAMBURGER MENU — auto-injects button
   ============================================ */

function initHamburger() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Make sure overlay exists
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  // Inject hamburger into dash-header (if not already there)
  const dashHeader = document.querySelector('.dash-header');
  if (dashHeader && !dashHeader.querySelector('.hamburger')) {
    const btn = document.createElement('button');
    btn.className = 'hamburger';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '☰';
    dashHeader.insertBefore(btn, dashHeader.firstChild);
  }

  // Wire up (always re-wire to be safe)
  const hb = document.querySelector('.hamburger');
  if (hb) {
    hb.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    };
  }

  overlay.onclick = function () {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  };

  // Close sidebar when any nav link clicked
  sidebar.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  });
}

// Run when DOM is ready + retry after a short delay (in case dashboard.js renders late)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHamburger);
} else {
  initHamburger();
}
setTimeout(initHamburger, 800);
setTimeout(initHamburger, 1500);
