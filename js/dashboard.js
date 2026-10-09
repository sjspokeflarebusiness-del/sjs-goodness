/* ============================================
   SHARED DASHBOARD BOILERPLATE
   ============================================ */

function initDashboard(pageKey) {
  const shop = Auth.requireLogin();
  if (!shop) return null;

  // If shop is pending approval, redirect to pending page (except on profile page)
  if (shop.status === 'pending' && pageKey !== 'profile') {
    window.location.href = 'pending.html';
    return null;
  }

  document.getElementById('shop-name').textContent = shop.name;

  const nav = document.getElementById('sidebar-nav');
  if (nav) {
    const items = [
      { key: 'dashboard', label: 'Overview', icon: '📊', href: 'dashboard.html' },
      { key: 'products', label: 'Products', icon: '📦', href: 'products.html' },
      { key: 'orders', label: 'Orders', icon: '🛒', href: 'orders.html' },
      { key: 'customers', label: 'Customers', icon: '👥', href: 'customers.html' },
      { key: 'expenses', label: 'Expenses', icon: '💰', href: 'expenses.html' },
      { key: 'analytics', label: 'Analytics', icon: '📈', href: 'analytics.html' },
      { key: 'profile', label: 'Shop Profile', icon: '🏪', href: 'profile.html' }
    ];
    nav.innerHTML = items.map(it => `
      <a href="${it.href}" class="sidebar-link ${it.key === pageKey ? 'active' : ''}">
        <span>${it.icon}</span> ${it.label}
      </a>
    `).join('') + `
      <button class="sidebar-link sidebar-logout" onclick="Auth.logout()">
        <span>🚪</span> Logout
      </button>
    `;
  }

  const viewLink = document.getElementById('view-shop-link');
  if (viewLink) {
    viewLink.innerHTML = `<a href="shop.html?id=${esc(shop.id)}" target="_blank" class="btn btn-ghost btn-sm">View Public Shop ↗</a>`;
  }

  // Notification bell
  const notifContainer = document.getElementById('notif-container');
  if (notifContainer) renderNotificationBell('notif-container', shop.id);

  return shop;
}

/* ============================================
   DASHBOARD OVERVIEW
   ============================================ */
(function () {
  if (!document.getElementById('content') || !window.location.pathname.endsWith('dashboard.html')) return;
  const shop = initDashboard('dashboard');
  if (!shop) return;

  const orders = DB.getOrdersForShop(shop.id);
  const products = DB.getProductsForShop(shop.id);
  const expenses = DB.getExpensesForShop(shop.id);
  const customers = DB.getCustomersForShop(shop.id);

  const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');
  const revenue = validOrders.reduce((s, o) => s + o.total, 0);
  const cogs = validOrders.reduce((s, o) => s + (o.items || []).reduce((x, i) => x + (i.cost || 0) * i.qty, 0), 0);
  const grossProfit = revenue - cogs;
  const otherExp = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = grossProfit - otherExp;
  const pending = orders.filter(o => ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.orderStatus)).length;
  const lowStock = products.filter(p => p.stock <= (p.lowStockAt || 5));

  document.getElementById('content').innerHTML = `
    <div class="metrics-grid">
      <div class="metric metric-green"><div class="metric-label">Total Revenue</div><div class="metric-value">${fmt(revenue)}</div></div>
      <div class="metric metric-blue"><div class="metric-label">Gross Profit</div><div class="metric-value">${fmt(grossProfit)}</div></div>
      <div class="metric metric-purple"><div class="metric-label">Net Profit</div><div class="metric-value">${fmt(netProfit)}</div></div>
      <div class="metric metric-orange"><div class="metric-label">Total Orders</div><div class="metric-value">${orders.length}</div></div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Pending Orders</div><div class="stat-value">${pending}</div></div>
      <div class="stat-card"><div class="stat-label">Customers</div><div class="stat-value">${customers.length}</div></div>
      <div class="stat-card"><div class="stat-label">Products</div><div class="stat-value">${products.length}</div></div>
      <div class="stat-card"><div class="stat-label">Low Stock</div><div class="stat-value" style="color:${lowStock.length > 0 ? 'var(--red)' : 'inherit'}">${lowStock.length}</div></div>
    </div>

    <div class="table-card">
      <div class="table-card-header">
        <h2>Recent Orders</h2>
        <a href="orders.html" class="text-sm" style="color:var(--orange);text-decoration:none;font-weight:600;">View all →</a>
      </div>
      ${orders.length === 0
        ? '<div style="padding:2rem;text-align:center;color:var(--gray-500);" class="text-sm">No orders yet. Share your shop link!</div>'
        : `<table class="data-table"><tbody>${orders.slice().reverse().slice(0, 5).map(o => `
            <tr>
              <td><strong>#${esc(o.orderNumber)}</strong><br><span class="text-xs text-muted">${esc(o.customerName)}</span></td>
              <td class="text-right"><strong>${fmt(o.total)}</strong><br><span class="badge badge-blue">${esc(o.orderStatus.replace(/_/g, ' '))}</span></td>
            </tr>`).join('')}</tbody></table>`
      }
    </div>

    ${lowStock.length > 0 ? `
      <div class="alert alert-warning">
        <h3>⚠️ Low Stock Alert</h3>
        <ul>${lowStock.map(p => `<li>${esc(p.name)} — ${p.stock} ${esc(p.unit)} left</li>`).join('')}</ul>
      </div>
    ` : ''}
  `;
})();
