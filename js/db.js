/* ============================================
   SJS GOODNESS — DATABASE LAYER v3
   Removes demo products, seeds only the Flaren shop.
   ============================================ */

const DB = {

  get(key, fallback) {
    try {
      const v = localStorage.getItem('sjs_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) { localStorage.setItem('sjs_' + key, JSON.stringify(value)); },

  getShops: () => DB.get('shops', []),
  saveShops: (s) => DB.set('shops', s),

  getProducts: () => DB.get('products', []),
  saveProducts: (p) => DB.set('products', p),

  getOrders: () => DB.get('orders', []),
  saveOrders: (o) => DB.set('orders', o),

  getExpenses: () => DB.get('expenses', []),
  saveExpenses: (e) => DB.set('expenses', e),

  getCustomers: () => DB.get('customers', []),
  saveCustomers: (c) => DB.set('customers', c),

  getNotifications: () => DB.get('notifications', []),
  saveNotifications: (n) => DB.set('notifications', n),

  getSession: () => DB.get('session', null),
  setSession: (s) => DB.set('session', s),
  clearSession: () => localStorage.removeItem('sjs_session'),

  getAdminSession: () => DB.get('admin_session', null),
  setAdminSession: (s) => DB.set('admin_session', s),
  clearAdminSession: () => localStorage.removeItem('sjs_admin_session'),

  getTheme: () => DB.get('theme', 'light'),
  setTheme: (t) => DB.set('theme', t),

  getShop: (id) => DB.getShops().find(s => s.id === id),
  getProductsForShop: (shopId) => DB.getProducts().filter(p => p.shopId === shopId),
  getOrdersForShop: (shopId) => DB.getOrders().filter(o => o.shopId === shopId),
  getExpensesForShop: (shopId) => DB.getExpenses().filter(e => e.shopId === shopId),
  getCustomersForShop: (shopId) => DB.getCustomers().filter(c => c.shopId === shopId),

  addNotification(shopId, type, title, message) {
    const all = DB.getNotifications();
    all.unshift({
      id: Math.random().toString(36).slice(2, 10),
      shopId, type, title, message,
      read: false,
      createdAt: new Date().toISOString()
    });
    DB.saveNotifications(all);
  },
  markNotificationRead(id) {
    const all = DB.getNotifications();
    const n = all.find(x => x.id === id);
    if (n) { n.read = true; DB.saveNotifications(all); }
  },
  markAllRead(shopId) {
    const all = DB.getNotifications().map(n =>
      n.shopId === shopId ? { ...n, read: true } : n
    );
    DB.saveNotifications(all);
  },

  // ============ SEED v3 ============
  // Only creates the Flaren shop owner account.
  // No demo products. No fake data.
  seed() {
    const seededVersion = DB.get('seed_version', 0);
    if (seededVersion < 3) {
      // Wipe everything from old versions
      localStorage.removeItem('sjs_shops');
      localStorage.removeItem('sjs_products');
      localStorage.removeItem('sjs_orders');
      localStorage.removeItem('sjs_customers');
      localStorage.removeItem('sjs_expenses');
      localStorage.removeItem('sjs_notifications');
      DB.set('seed_version', 3);
    }

    // Only seed the Flaren shop owner account (no products)
    if (DB.getShops().length === 0) {
      const flaren = {
        id: 'shop_flaren',
        ownerEmail: 'flaren@sjs.com',
        ownerPassword: 'flaren123',
        name: 'Flaren Digital',
        description: 'Digital products, websites, and design services by Flaren.',
        category: 'Electronics',
        serviceArea: 'Online · All India',
        address: 'Puducherry, India',
        phone: '8056669214',
        logo: '',
        banner: '',
        isApproved: true,
        status: 'approved',
        isAdminShop: true,
        createdAt: new Date().toISOString()
      };
      DB.saveShops([flaren]);
      // NOTE: No products added here — the owner adds them via dashboard
    }
  }
};

DB.seed();
