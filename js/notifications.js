/* ============================================
   SJS GOODNESS — NOTIFICATIONS WIDGET
   ============================================ */

function renderNotificationBell(containerId, shopId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  function update() {
    const all = DB.getNotifications();
    const mine = shopId === 'admin'
      ? all.filter(n => n.shopId === null)
      : all.filter(n => n.shopId === shopId);
    const unread = mine.filter(n => !n.read).length;

    el.innerHTML = `
      <div class="notif-wrap">
        <button class="notif-btn" id="notif-toggle-${containerId}">
          🔔
          ${unread > 0 ? `<span class="notif-dot">${unread > 9 ? '9+' : unread}</span>` : ''}
        </button>
        <div id="notif-panel-${containerId}" style="display:none;"></div>
      </div>
    `;

    document.getElementById('notif-toggle-' + containerId).onclick = (e) => {
      e.stopPropagation();
      const panel = document.getElementById('notif-panel-' + containerId);
      const open = panel.style.display === 'block';
      panel.style.display = open ? 'none' : 'block';
      if (!open) {
        panel.innerHTML = `
          <div class="notif-panel">
            <div class="notif-header flex-between">
              <span>Notifications</span>
              ${unread > 0 ? `<button class="text-xs" style="color:var(--orange);background:none;border:none;cursor:pointer;font-weight:600;" id="mark-all-${containerId}">Mark all read</button>` : ''}
            </div>
            ${mine.length === 0
              ? '<div class="notif-empty">No notifications yet</div>'
              : mine.slice(0, 20).map(n => `
                  <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
                    <div class="notif-item-title">${esc(n.title)}</div>
                    <div class="notif-item-msg">${esc(n.message)}</div>
                    <div class="notif-item-time">${timeAgo(n.createdAt)}</div>
                  </div>
                `).join('')}
          </div>
        `;
        panel.querySelectorAll('[data-notif-id]').forEach(item => {
          item.onclick = () => {
            DB.markNotificationRead(item.getAttribute('data-notif-id'));
            update();
          };
        });
        const markAll = document.getElementById('mark-all-' + containerId);
        if (markAll) markAll.onclick = () => { DB.markAllRead(shopId === 'admin' ? null : shopId); update(); };
      }
    };

    document.addEventListener('click', closeOnOutside, { once: false });
    function closeOnOutside(e) {
      if (!el.contains(e.target)) {
        const panel = document.getElementById('notif-panel-' + containerId);
        if (panel) panel.style.display = 'none';
      }
    }
  }

  update();
  setInterval(update, 5000); // Poll every 5s for demo (localStorage change)
}
