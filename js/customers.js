/* ============================================
   CUSTOMERS PAGE
   ============================================ */

if (window.location.pathname.endsWith('customers.html')) {
  const currentShop = initDashboard('customers');
  if (currentShop) {
    const customers = DB.getCustomersForShop(currentShop.id);
    const c = document.getElementById('content');

    if (customers.length === 0) {
      c.innerHTML = '<div class="empty-state">No customers yet. They appear automatically when orders are placed.</div>';
    } else {
      c.innerHTML = `
        <div class="table-card">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Last Order</th></tr></thead>
            <tbody>${customers.map(cust => `
              <tr>
                <td><strong>${esc(cust.name)}</strong></td>
                <td>${esc(cust.phone)}</td>
                <td>${cust.orderCount || 0}</td>
                <td><strong>${fmt(cust.totalSpent || 0)}</strong></td>
                <td class="text-muted">${fmtDate(cust.lastOrderAt)}</td>
              </tr>`).join('')}</tbody>
          </table>
        </div>`;
    }
  }
}
