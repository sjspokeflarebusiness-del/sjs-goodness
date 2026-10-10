/* ============================================
   MOBILE HAMBURGER MENU
   ============================================ */

function initHamburger() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Add hamburger + overlay if not present
  if (!document.querySelector('.hamburger')) {
    const header = document.querySelector('.dash-header');
    if (header) {
      const btn = document.createElement('button');
      btn.className = 'hamburger';
      btn.innerHTML = '☰';
      btn.onclick = () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
      };
      header.insertBefore(btn, header.firstChild);
    }

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.onclick = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    };
    document.body.appendChild(overlay);

    // Close on any nav link tap
    sidebar.querySelectorAll('a').forEach(a => {
      a.onclick = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      };
    });
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHamburger);
else initHamburger();
