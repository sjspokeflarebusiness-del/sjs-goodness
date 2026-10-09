/* ============================================
   ANALYTICS PAGE
   ============================================ */

if (window.location.pathname.endsWith('analytics.html')) {
  const currentShop = initDashboard('analytics');
  if (currentShop) renderAnalytics(currentShop);
}

function renderAnalytics(currentShop) {
  const orders = DB.getOrdersForShop(currentShop.id).filter(o => o.orderStatus !== 'cancelled');
  const expenses = DB.getExpensesForShop(currentShop.id);
  const products = DB.getProductsForShop(currentShop.id);

  const monthly = {};
  orders.forEach(o => {
    const m = (o.createdAt || '').slice(0, 7);
    if (!monthly[m]) monthly[m] = { revenue: 0, cogs: 0, orders: 0 };
    monthly[m].revenue += o.total;
    monthly[m].cogs += (o.items || []).reduce((s, i) => s + (i.cost || 0) * i.qty, 0);
    monthly[m].orders++;
  });
  const months = Object.keys(monthly).sort().slice(-6);
  const revenueData = months.map(m => monthly[m].revenue);
  const profitData = months.map(m => monthly[m].revenue - monthly[m].cogs);

  const expByCat = {};
  expenses.forEach(e => { expByCat[e.category] = (expByCat[e.category] || 0) + Number(e.amount); });

  const salesByProduct = {};
  orders.forEach(o => (o.items || []).forEach(i => {
    salesByProduct[i.name] = (salesByProduct[i.name] || 0) + i.qty;
  }));
  const topProducts = Object.entries(salesByProduct).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const inventoryValue = products.reduce((s, p) => s + p.cost * p.stock, 0);

  document.getElementById('content').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-value">${fmt(orders.reduce((s, o) => s + o.total, 0))}</div></div>
      <div class="stat-card"><div class="stat-label">Inventory Value</div><div class="stat-value">${fmt(inventoryValue)}</div></div>
      <div class="stat-card"><div class="stat-label">Avg Order Value</div><div class="stat-value">${orders.length ? fmt(orders.reduce((s, o) => s + o.total, 0) / orders.length) : '₹0'}</div></div>
    </div>

    <div class="table-card" style="padding:1.25rem;margin-bottom:1.5rem;">
      <h2 style="font-size:1rem;margin-bottom:1rem;">Revenue vs Profit (Last 6 Months)</h2>
      <canvas id="revenueChart" height="100"></canvas>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;">
      <div class="table-card" style="padding:1.25rem;">
        <h2 style="font-size:1rem;margin-bottom:1rem;">Top Products</h2>
        ${topProducts.length === 0 ? '<p class="text-sm text-muted">No sales yet.</p>' :
          topProducts.map(([name, qty], i) => `<div class="flex-between text-sm" style="padding:0.35rem 0;"><span>${i + 1}. ${esc(name)}</span><span><strong>${qty}</strong> sold</span></div>`).join('')}
      </div>
      <div class="table-card" style="padding:1.25rem;">
        <h2 style="font-size:1rem;margin-bottom:1rem;">Expenses by Category</h2>
        ${Object.keys(expByCat).length === 0 ? '<p class="text-sm text-muted">No expenses.</p>' :
          Object.entries(expByCat).map(([cat, amt]) => `<div class="flex-between text-sm" style="padding:0.35rem 0;"><span>${esc(cat)}</span><span><strong>${fmt(amt)}</strong></span></div>`).join('')}
      </div>
    </div>
  `;

  const canvas = document.getElementById('revenueChart');
  if (canvas) {
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: months.length ? months : ['No data'],
        datasets: [
          { label: 'Revenue', data: revenueData, borderColor: '#fc8019', backgroundColor: 'rgba(252,128,25,0.1)', tension: 0.3, fill: true },
          { label: 'Gross Profit', data: profitData, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.1)', tension: 0.3, fill: true }
        ]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
    });
  }
}
