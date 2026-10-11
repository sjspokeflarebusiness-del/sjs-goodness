window.addEventListener('sjs:ready', function () {
/* ============================================
   ADMIN CONTROL CENTER
   ============================================ */

const adminShop = Auth.currentShop();
if (!adminShop || !Auth.isAdmin()) {
  window.location.href = 'login.html';
  throw new Error('Not admin');
}

// Sidebar
document.getElementById('admin-nav').innerHTML = `
  <a href="admin.html" class="sidebar-link active"><span>📊</span> Dashboard</a>
  <a href="admin.html#requests" class="sidebar-link"><span>📥</span> Shop Requests</a>
  <a href="admin.html#shops" class="sidebar-link"><span>🏪</span> All Shops</a>
  <a href="admin.html#users" class="sidebar-link"><span>👥</span> Owners</a>
  <a href="admin.html#products" class="sidebar-link"><span>📦</span> All Products</a>
 <button class="sidebar-link sidebar-logout" onclick="Auth.logout()"><span>🚪</span> Logout</button>
<a href="dashboard.html" class="sidebar-link"><span>🏪</span> Back to Shop Dashboard</a>
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
});
/* ============================================
   SJS GOODNESS — AI HELPER BOT
   Rule-based, works offline, always free.
   ============================================ */

const AIBot = {
  currentShop: null,

  init() {
    // Inject button + panel
    document.body.insertAdjacentHTML('beforeend', `
      <button class="ai-bot-btn" id="ai-bot-open" title="Ask for help">💬</button>
      <div id="ai-bot-root"></div>
    `);
    document.getElementById('ai-bot-open').onclick = () => this.open();
  },

  open() {
    const root = document.getElementById('ai-bot-root');
    if (root.innerHTML) { root.innerHTML = ''; return; }

    root.innerHTML = `
      <div class="ai-bot-panel">
        <div class="ai-bot-header">
          <span>💬 SJS Helper</span>
          <button class="ai-bot-close" onclick="document.getElementById('ai-bot-root').innerHTML=''">×</button>
        </div>
        <div class="ai-bot-messages" id="ai-msgs">
          <div class="ai-msg bot">Hi! I can help you with products, orders, prices, stock, and admin stuff. Try asking:</div>
          <div class="ai-msg bot">• "How do I add a product?"<br>• "Low stock items"<br>• "How many orders today?"<br>• "How do I approve a shop?"</div>
        </div>
        <form class="ai-bot-input" id="ai-form">
          <input id="ai-input" placeholder="Ask me anything…" autocomplete="off">
          <button type="submit">➤</button>
        </form>
      </div>
    `;

    document.getElementById('ai-form').onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('ai-input');
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      this.push('user', q);
      setTimeout(() => this.reply(q), 300);
    };

    setTimeout(() => document.getElementById('ai-input').focus(), 100);
  },

  push(role, text) {
    const msgs = document.getElementById('ai-msgs');
    if (!msgs) return;
    msgs.insertAdjacentHTML('beforeend', `<div class="ai-msg ${role}">${text}</div>`);
    msgs.scrollTop = msgs.scrollHeight;
  },

  reply(q) {
    const lower = q.toLowerCase();
    const answer = this.getAnswer(lower, q);
    this.push('bot', answer);
  },

  getAnswer(lower, original) {
    const shop = Auth.currentShop();
    const isAdmin = Auth.isAdmin();

    // --- HELP: Add product ---
    if (lower.match(/add (a )?product|how.*product/)) {
      return "To add a product:<br>1. Go to <strong>Products</strong> in the sidebar<br>2. Click <strong>+ Add Product</strong> at top right<br>3. Choose a Category first — the Unit dropdown auto-updates (kg for sugars, ml for drinks, etc.)<br>4. Upload an image or skip it<br>5. Set your cost and selling price<br>6. Save!";
    }

    // --- HELP: Approve shop ---
    if (lower.match(/approve|pending.*shop|shop.*request/)) {
      if (!isAdmin) return "Only admins can approve shops. Contact <strong>8056669214</strong>.";
      return "To approve a shop:<br>1. Open <strong>Admin</strong> panel<br>2. Look at the yellow <strong>Pending Shop Requests</strong> section<br>3. Contact them on WhatsApp first (verify identity)<br>4. Click <strong>✓ Approve</strong><br>They'll get a notification.";
    }

    // --- HELP: Orders today ---
    if (lower.match(/order.*today|today.*order|how many orders/)) {
      if (!shop) return "Log in as a shop owner to see your orders.";
      const todayStr = new Date().toISOString().split('T')[0];
      const todays = DB.getOrdersForShop(shop.id).filter(o => o.createdAt.startsWith(todayStr));
      return `You have <strong>${todays.length} order${todays.length === 1 ? '' : 's'}</strong> today worth <strong>${fmt(todays.reduce((s, o) => s + o.total, 0))}</strong>.`;
    }

    // --- Low stock ---
    if (lower.match(/low stock|restock|running out/)) {
      if (!shop) return "Log in to see your low-stock products.";
      const low = DB.getProductsForShop(shop.id).filter(p => p.stock <= (p.lowStockAt || 5));
      if (low.length === 0) return "Nothing is low on stock right now. 👍";
      return `⚠️ <strong>${low.length} item${low.length === 1 ? '' : 's'}</strong> are low:<br>${low.map(p => `• ${esc(p.name)} — ${p.stock} ${esc(p.unit)} left`).join('<br>')}`;
    }

    // --- Profit / revenue ---
    if (lower.match(/profit|revenue|earn|sales/)) {
      if (!shop) return "Log in to see your profit.";
      const orders = DB.getOrdersForShop(shop.id).filter(o => o.orderStatus !== 'cancelled');
      const revenue = orders.reduce((s, o) => s + o.total, 0);
      const cogs = orders.reduce((s, o) => s + (o.items || []).reduce((x, i) => x + (i.cost || 0) * i.qty, 0), 0);
      const expenses = DB.getExpensesForShop(shop.id).reduce((s, e) => s + Number(e.amount), 0);
      const gross = revenue - cogs;
      const net = gross - expenses;
      return `💰 <strong>Revenue:</strong> ${fmt(revenue)}<br>📊 <strong>Gross Profit:</strong> ${fmt(gross)}<br>💵 <strong>Net Profit:</strong> ${fmt(net)}<br><br>Based on ${orders.length} orders.`;
    }

    // --- Price / margin ---
    if (lower.match(/margin|price.*profit|markup/)) {
      if (!shop) return "Log in to see margins.";
      const products = DB.getProductsForShop(shop.id);
      if (products.length === 0) return "You haven't added any products yet.";
      const avg = products.reduce((s, p) => s + ((p.price - p.cost) / p.price * 100), 0) / products.length;
      return `Your average product margin is <strong>${avg.toFixed(1)}%</strong>. Aim for at least 25-30% to cover packaging and delivery.`;
    }

    // --- Customer questions ---
    if (lower.match(/customer|clients?/)) {
      if (!shop) return "Log in to see your customers.";
      const customers = DB.getCustomersForShop(shop.id);
      const repeat = customers.filter(c => c.orderCount > 1).length;
      return `You have <strong>${customers.length} customer${customers.length === 1 ? '' : 's'}</strong>, of which <strong>${repeat}</strong> have ordered more than once. Retention is key!`;
    }

    // --- WhatsApp tip ---
    if (lower.match(/whatsapp|contact.*customer|message/)) {
      return "To WhatsApp a customer: open <strong>Orders</strong>, click <strong>Manage</strong> on any order, then click the green <strong>📱 WhatsApp Customer</strong> button. It opens WhatsApp with their number prefilled.";
    }

    // --- How to register ---
    if (lower.match(/register|sign.?up|join/)) {
      return "To register your shop:<br>1. Click <strong>Register</strong> on the login page<br>2. Fill your shop details<br>3. Submit<br>4. WhatsApp <strong>8056669214</strong> to get approved<br>5. Once approved, you'll get a notification and can log in!";
    }

    // --- Dark mode ---
    if (lower.match(/dark mode|theme|night/)) {
      return "Tap the 🌙/☀️ button in the top-right header to toggle dark mode. Your choice is saved.";
    }

    // --- Image upload ---
    if (lower.match(/image|photo|picture|upload/)) {
      return "To upload an image: when adding/editing a product or your shop, click <strong>📁 Upload Image</strong>. Choose a photo from your device. It auto-compresses to save space.";
    }

    // --- Help / start ---
    if (lower.match(/help|what can you|start/)) {
      return "I can help with:<br>• Adding products<br>• Checking stock<br>• Viewing profit<br>• Managing orders<br>• Approving shops (admin)<br>• Customer info<br><br>Just ask naturally!";
    }

    // --- Greeting ---
    if (lower.match(/^(hi|hello|hey|vanakkam)/)) {
      return shop ? `Hi ${esc(shop.name)}! How can I help?` : "Hello! I'm the SJS Helper bot. Ask me anything about the platform.";
    }

    // --- Fallback ---
    return "I'm not sure about that yet. Try asking things like:<br>• <em>How do I add a product?</em><br>• <em>Low stock items</em><br>• <em>What's my profit?</em><br>• <em>How many orders today?</em><br><br>Or WhatsApp admin at <strong>8056669214</strong>.";
  }
};

// Auto-init on any page
if (typeof DB !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => AIBot.init());
  else AIBot.init();
}
});
