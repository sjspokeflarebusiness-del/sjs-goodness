/* ============================================
   ORDERS PAGE
   ============================================ */

let currentShop, orderFilter = 'all';

function statusBadge(s) {
  const map = {
    placed: 'badge-blue', confirmed: 'badge-indigo', preparing: 'badge-yellow',
    out_for_delivery: 'badge-orange', delivered: 'badge-green', cancelled: 'badge-red'
  };
  return `<span class="badge ${map[s] || 'badge-gray'}">${s.replace(/_/g, ' ')}</span>`;
}

function payBadge(s) {
  const map = { unpaid: 'badge-red', partially_paid: 'badge-yellow', paid: 'badge-green', refunded: 'badge-gray' };
  return `<span class="badge ${map[s] || 'badge-gray'}">${s.replace(/_/g, ' ')}</span>`;
}

function renderOrders() {
  const all = DB.getOrdersForShop(currentShop.id);
  const filtered = orderFilter === 'all' ? all : all.filter(o => o.orderStatus === orderFilter);
  const c = document.getElementById('content');

  const filters = ['all', 'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  c.innerHTML = `
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
      ${filters.map(f => `
        <button class="btn ${orderFilter === f ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="setFilter('${f}')">
          ${f.replace(/_/g, ' ')} (${f === 'all' ? all.length : all.filter(o => o.orderStatus === f).length})
        </button>`).join('')}
    </div>

    ${filtered.length === 0
      ? '<div class="empty-state">No orders in this filter.</div>'
      : `<div class="table-card"><table class="data-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th class="text-right"></th></tr></thead>
          <tbody>${filtered.slice().reverse().map(o => `
            <tr>
              <td><strong>#${esc(o.orderNumber)}</strong><br><span class="text-xs text-muted">${fmtDateTime(o.createdAt)}</span></td>
              <td>${esc(o.customerName)}<br><span class="text-xs text-muted">${esc(o.customerPhone)}</span></td>
              <td><strong>${fmt(o.total)}</strong></td>
              <td>${statusBadge(o.orderStatus)}</td>
              <td>${payBadge(o.paymentStatus)}</td>
              <td class="text-right"><button class="btn btn-ghost btn-sm" onclick="openOrder('${o.id}')">Manage</button></td>
            </tr>`).join('')}</tbody>
        </table></div>`
    }`;
}

function setFilter(f) { orderFilter = f; renderOrders(); }

function openOrder(id) {
  const o = DB.getOrders().find(x => x.id === id);
  if (!o) return;

  const orderStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  const payStatuses = ['unpaid', 'partially_paid', 'paid', 'refunded'];

  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Order #${esc(o.orderNumber)}</h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div style="background:var(--gray-50);padding:0.85rem;border-radius:8px;margin-bottom:1rem;font-size:0.9rem;">
          <div><strong>${esc(o.customerName)}</strong> · ${esc(o.customerPhone)}</div>
          ${o.deliveryAddress ? `<div class="text-muted text-sm">${esc(o.deliveryAddress)}</div>` : ''}
          ${o.notes ? `<div class="text-muted text-sm" style="font-style:italic;">"${esc(o.notes)}"</div>` : ''}
        </div>
        <div class="mb-4">
          ${(o.items || []).map(i => `
            <div class="flex-between text-sm" style="padding:0.35rem 0;border-bottom:1px solid var(--gray-100);">
              <span>${esc(i.name)} × ${i.qty}</span><span>${fmt(i.total)}</span>
            </div>`).join('')}
          <div class="flex-between" style="font-weight:700;padding-top:0.5rem;border-top:1px solid var(--gray-200);margin-top:0.5rem;">
            <span>Total</span><span>${fmt(o.total)}</span>
          </div>
        </div>
        <div class="mb-4">
          <div class="text-xs text-muted mb-2">Order Status</div>
          <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
            ${orderStatuses.map(s => `<button class="btn ${o.orderStatus === s ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="updateOrderStatus('${o.id}','${s}')">${s.replace(/_/g, ' ')}</button>`).join('')}
          </div>
        </div>
        <div>
          <div class="text-xs text-muted mb-2">Payment Status</div>
          <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
            ${payStatuses.map(s => `<button class="btn ${o.paymentStatus === s ? 'btn-success' : 'btn-ghost'} btn-sm" onclick="updatePaymentStatus('${o.id}','${s}')">${s.replace(/_/g, ' ')}</button>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

function updateOrderStatus(orderId, status) {
  const all = DB.getOrders();
  const idx = all.findIndex(o => o.id === orderId);
  all[idx].orderStatus = status;
  all[idx].updatedAt = new Date().toISOString();
  DB.saveOrders(all);
  openOrder(orderId);
  renderOrders();
}

function updatePaymentStatus(orderId, status) {
  const all = DB.getOrders();
  const idx = all.findIndex(o => o.id === orderId);
  all[idx].paymentStatus = status;
  if (status === 'paid') all[idx].amountPaid = all[idx].total;
  else if (status === 'unpaid') all[idx].amountPaid = 0;
  DB.saveOrders(all);
  openOrder(orderId);
  renderOrders();
}

currentShop = initDashboard('orders');
if (currentShop) renderOrders();
