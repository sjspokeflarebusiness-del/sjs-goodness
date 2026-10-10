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
