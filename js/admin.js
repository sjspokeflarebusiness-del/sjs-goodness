/* ============================================
   ADMIN CONTROL CENTER
   ============================================ */

if (!Auth.requireAdmin()) throw new Error('Not admin');

// Sidebar
document.getElementById('admin-nav').innerHTML = `
  <a href="admin.html" class="sidebar-link active"><span>📊</span> Dashboard</a>
  <a href="admin.html#requests" class="sidebar-link"><span>📥</span> Shop Requests</a>
  <a href="admin.html#shops" class="sidebar-link"><span>🏪</span> All Shops</a>
  <a href="admin.html#users" class="sidebar-link"><span>👥</span> Owners</a>
  <a href="admin.html#products" class="sidebar-link"><span>📦</span> All Products</a>
  <button class="sidebar-link sidebar-logout" onclick="Auth.adminLogout()"><span>🚪</span> Logout</button>
`;

renderNotificationBell('notif-container', 'admin');

function renderAdmin() {
  const shops = DB.getShops();
  const products = DB.getProducts();
  const orders = DB.getOrders();
  const customers = DB.getCustomers();

  const pending = shops.filter(s => s.status === 'pending');

  document.getElementById('content').innerHTML = `
    <div class="metrics-grid">
      <div class="metric metric-orange"><div class="metric-label">Total Shops</div><div class="metric-value">${shops.length}</div></div>
      <div class="metric metric-red"><div class="metric-label">Pending Approval</div><div class="metric-value">${pending.length}</div></div>
      <div class="metric metric-blue"><div class="metric-label">Total Orders</div><div class="metric-value">${orders.length}</div></div>
      <div class="metric metric-green"><div class="metric-label">Total Products</div><div class="metric-value">${products.length}</div></div>
    </div>

    ${pending.length > 0 ? `
      <div class="alert alert-warning" id="requests">
        <h3>📥 Pending Shop Requests (${pending.length})</h3>
        <p class="text-sm" style="margin-bottom:0.75rem;">Only approve shops that have contacted you on WhatsApp at <strong>8056669214</strong>.</p>
        ${pending.map(s => `
          <div class="table-card" style="margin-top:0.75rem;padding:1rem;">
            <div class="flex-between">
              <div>
                <strong>${esc(s.name)}</strong>
                <div class="text-sm text-muted">${esc(s.category)} · ${esc(s.phone)} · ${esc(s.ownerEmail)}</div>
                <div class="text-xs"><span class="shop-row-id">ID: ${esc(s.id)}</span></div>
              </div>
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <a href="https://wa.me/91${esc((s.phone || '').replace(/\D/g, ''))}?text=${encodeURIComponent('Hi ' + s.name + ', this is SJS Goodness admin.')}" target="_blank" class="btn btn-ghost btn-sm">📱 Contact</a>
                <button class="btn btn-success btn-sm" onclick="approveShop('${s.id}')">✓ Approve</button>
                <button class="btn btn-danger btn-sm" onclick="rejectShop('${s.id}')">✕ Reject</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="table-card mt-6" id="shops">
      <div class="table-card-header"><h2>All Shops (${shops.length})</h2></div>
      ${shops.length === 0 ? '<div style="padding:2rem;text-align:center;color:var(--gray-500);">No shops yet.</div>' :
        `<table class="data-table"><thead><tr>
          <th>Shop</th><th>ID</th><th>Owner Email</th><th>Phone</th><th>Status</th><th class="text-right">Actions</th>
        </tr></thead><tbody>
          ${shops.map(s => `
            <tr>
              <td><strong>${esc(s.name)}</strong><br><span class="text-xs text-muted">${esc(s.category)}</span></td>
              <td><span class="shop-row-id">${esc(s.id)}</span></td>
              <td class="text-xs">${esc(s.ownerEmail)}</td>
              <td class="text-xs">${esc(s.phone || '')}</td>
              <td>${s.status === 'approved' ? '<span class="badge badge-green">Approved</span>' :
                    s.status === 'pending' ? '<span class="badge badge-yellow">Pending</span>' :
                    '<span class="badge badge-red">Rejected</span>'}</td>
              <td class="text-right">
                <button class="btn btn-ghost btn-sm" onclick="viewShopProducts('${s.id}')">View</button>
                <button class="btn btn-danger btn-sm" onclick="deleteShop('${s.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody></table>`}
    </div>

    <div class="table-card mt-6" id="users">
      <div class="table-card-header"><h2>All Customers (${customers.length})</h2></div>
      ${customers.length === 0 ? '<div style="padding:2rem;text-align:center;color:var(--gray-500);">No customers yet.</div>' :
        `<table class="data-table"><thead><tr>
          <th>Name</th><th>Phone</th><th>Shop</th><th>Orders</th><th>Spent</th><th class="text-right">Actions</th>
        </tr></thead><tbody>
          ${customers.map(c => {
            const shop = shops.find(s => s.id === c.shopId);
            return `
              <tr>
                <td><strong>${esc(c.name)}</strong></td>
                <td>${esc(c.phone)}</td>
                <td class="text-xs">${shop ? esc(shop.name) : '—'}</td>
                <td>${c.orderCount || 0}</td>
                <td><strong>${fmt(c.totalSpent || 0)}</strong></td>
                <td class="text-right"><button class="btn btn-danger btn-sm" onclick="deleteCustomer('${c.id}')">Delete</button></td>
              </tr>`;
          }).join('')}
        </tbody></table>`}
    </div>

    <div class="table-card mt-6" id="products">
      <div class="table-card-header"><h2>All Products (${products.length})</h2></div>
      ${products.length === 0 ? '<div style="padding:2rem;text-align:center;color:var(--gray-500);">No products yet.</div>' :
        `<table class="data-table"><thead><tr>
          <th>Product</th><th>ID</th><th>Shop</th><th>Price</th><th>Stock</th><th class="text-right">Actions</th>
        </tr></thead><tbody>
          ${products.map(p => {
            const shop = shops.find(s => s.id === p.shopId);
            return `
              <tr>
                <td><strong>${esc(p.name)}</strong><br><span class="text-xs text-muted">${esc(p.category || '')}</span></td>
                <td><span class="shop-row-id">${esc(p.id)}</span></td>
                <td class="text-xs">${shop ? esc(shop.name) : '—'}</td>
                <td>${fmt(p.price)}</td>
                <td>${p.stock} ${esc(p.unit)}</td>
                <td class="text-right"><button class="btn btn-danger btn-sm" onclick="deleteProductAdmin('${p.id}')">Delete</button></td>
              </tr>`;
          }).join('')}
        </tbody></table>`}
    </div>
  `;

  if (window.location.hash === '#requests') {
    const el = document.getElementById('requests');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

// ---------- SHOP APPROVAL ----------
function approveShop(id) {
  const shops = DB.getShops();
  const idx = shops.findIndex(s => s.id === id);
  if (idx < 0) return;
  shops[idx].isApproved = true;
  shops[idx].status = 'approved';
  shops[idx].approvedAt = new Date().toISOString();
  DB.saveShops(shops);
  DB.addNotification(id, 'approved', '🎉 Your shop is approved!',
    'Your shop has been approved by admin. You can now log in and add products.');
  renderAdmin();
}

function rejectShop(id) {
  if (!confirm('Reject this shop application?')) return;
  const shops = DB.getShops();
  const idx = shops.findIndex(s => s.id === id);
  if (idx < 0) return;
  shops[idx].isApproved = false;
  shops[idx].status = 'rejected';
  DB.saveShops(shops);
  DB.addNotification(id, 'rejected', 'Application not approved',
    'Your shop application was not approved. Contact admin at 8056669214.');
  renderAdmin();
}

// ---------- DELETE HELPERS ----------
function deleteShop(id) {
  if (!confirm('DELETE this shop AND all its products/orders? This cannot be undone.')) return;
  DB.saveShops(DB.getShops().filter(s => s.id !== id));
  DB.saveProducts(DB.getProducts().filter(p => p.shopId !== id));
  DB.saveOrders(DB.getOrders().filter(o => o.shopId !== id));
  DB.saveCustomers(DB.getCustomers().filter(c => c.shopId !== id));
  DB.saveExpenses(DB.getExpenses().filter(e => e.shopId !== id));
  renderAdmin();
}

function deleteProductAdmin(id) {
  if (!confirm('Delete this product?')) return;
  DB.saveProducts(DB.getProducts().filter(p => p.id !== id));
  renderAdmin();
}

function deleteCustomer(id) {
  if (!confirm('Delete this customer record?')) return;
  DB.saveCustomers(DB.getCustomers().filter(c => c.id !== id));
  renderAdmin();
}

function viewShopProducts(shopId) {
  const shop = DB.getShop(shopId);
  const products = DB.getProductsForShop(shopId);
  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>${esc(shop.name)} — Products (${products.length})</h2>
          <button class="modal-close" onclick="document.getElementById('modal-root').innerHTML=''">×</button>
        </div>
        ${products.length === 0 ? '<p class="text-muted text-sm">No products.</p>' :
          products.map(p => `
            <div class="flex-between" style="padding:0.5rem 0;border-bottom:1px solid var(--gray-100);">
              <div><strong>${esc(p.name)}</strong> · ${fmt(p.price)} · ${p.stock} ${esc(p.unit)}</div>
              <button class="btn btn-danger btn-sm" onclick="deleteProductAdmin('${p.id}');viewShopProducts('${shopId}')">Delete</button>
            </div>
          `).join('')}
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="document.getElementById('modal-root').innerHTML=''">Close</button>
        </div>
      </div>
    </div>`;
}

// ---------- QUICK DELETE MODAL ----------
function openQuickDelete() {
  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>🗑️ Admin Quick Delete</h2>
          <button class="modal-close" onclick="document.getElementById('modal-root').innerHTML=''">×</button>
        </div>
        <p class="text-sm text-muted mb-4">Choose what to delete. Be careful — deletions are permanent.</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <button class="btn btn-ghost" onclick="quickList('shops')">🏪 Shops (${DB.getShops().length})</button>
          <button class="btn btn-ghost" onclick="quickList('products')">📦 Products (${DB.getProducts().length})</button>
          <button class="btn btn-ghost" onclick="quickList('orders')">🛒 Orders (${DB.getOrders().length})</button>
          <button class="btn btn-ghost" onclick="quickList('customers')">👥 Customers (${DB.getCustomers().length})</button>
          <button class="btn btn-ghost" onclick="quickList('expenses')">💰 Expenses (${DB.getExpenses().length})</button>
          <button class="btn btn-danger" onclick="nukeAll()">💥 NUKE EVERYTHING</button>
        </div>
      </div>
    </div>`;
}

function quickList(type) {
  const dataMap = {
    shops: { list: DB.getShops(), label: s => `${s.name} (${s.ownerEmail}) · ID: ${s.id}` },
    products: { list: DB.getProducts(), label: p => `${p.name} · ${fmt(p.price)} · ID: ${p.id}` },
    orders: { list: DB.getOrders(), label: o => `#${o.orderNumber} · ${o.customerName} · ${fmt(o.total)}` },
    customers: { list: DB.getCustomers(), label: c => `${c.name} · ${c.phone}` },
    expenses: { list: DB.getExpenses(), label: e => `${e.title} · ${fmt(e.amount)}` }
  };
  const { list, label } = dataMap[type];

  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Delete ${type} (${list.length})</h2>
          <button class="modal-close" onclick="document.getElementById('modal-root').innerHTML=''">×</button>
        </div>
        ${list.length === 0 ? '<p class="text-muted text-sm">Nothing to delete.</p>' :
          `<div style="max-height:400px;overflow-y:auto;">
            ${list.map(item => `
              <div class="flex-between" style="padding:0.6rem 0;border-bottom:1px solid var(--gray-100);">
                <div class="text-sm">${esc(label(item))}</div>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('${type}','${item.id}')">Delete</button>
              </div>
            `).join('')}
          </div>`}
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="openQuickDelete()">← Back</button>
        </div>
      </div>
    </div>`;
}

function deleteItem(type, id) {
  if (!confirm('Delete this item permanently?')) return;
  if (type === 'shops') deleteShop(id);
  else if (type === 'products') deleteProductAdmin(id);
  else if (type === 'orders') {
    DB.saveOrders(DB.getOrders().filter(o => o.id !== id));
    renderAdmin();
  }
  else if (type === 'customers') deleteCustomer(id);
  else if (type === 'expenses') {
    DB.saveExpenses(DB.getExpenses().filter(e => e.id !== id));
    renderAdmin();
  }
  document.getElementById('modal-root').innerHTML = '';
  quickList(type);
}

function nukeAll() {
  if (!confirm('⚠️ DELETE EVERYTHING?\n\nThis removes ALL shops, products, orders, customers, and expenses. This CANNOT be undone.')) return;
  if (!confirm('Are you ABSOLUTELY sure? This is your last warning.')) return;
  localStorage.removeItem('sjs_shops');
  localStorage.removeItem('sjs_products');
  localStorage.removeItem('sjs_orders');
  localStorage.removeItem('sjs_customers');
  localStorage.removeItem('sjs_expenses');
  localStorage.removeItem('sjs_notifications');
  DB.seed();
  document.getElementById('modal-root').innerHTML = '';
  renderAdmin();
}

// ---------- INITIAL RENDER ----------
renderAdmin();
