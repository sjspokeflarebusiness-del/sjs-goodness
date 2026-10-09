/* ============================================
   SJS GOODNESS — DATABASE LAYER
   localStorage-based.
   ============================================ */

const DB = {

  get(key, fallback) {
    try {
      const v = localStorage.getItem('sjs_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) { localStorage.setItem('sjs_' + key, JSON.stringify(value)); },

  // Shops
  getShops: () => DB.get('shops', []),
  saveShops: (s) => DB.set('shops', s),

  // Products
  getProducts: () => DB.get('products', []),
  saveProducts: (p) => DB.set('products', p),

  // Orders
  getOrders: () => DB.get('orders', []),
  saveOrders: (o) => DB.set('orders', o),

  // Expenses
  getExpenses: () => DB.get('expenses', []),
  saveExpenses: (e) => DB.set('expenses', e),

  // Customers
  getCustomers: () => DB.get('customers', []),
  saveCustomers: (c) => DB.set('customers', c),

  // Notifications
  getNotifications: () => DB.get('notifications', []),
  saveNotifications: (n) => DB.set('notifications', n),

  // Session
  getSession: () => DB.get('session', null),
  setSession: (s) => DB.set('session', s),
  clearSession: () => localStorage.removeItem('sjs_session'),

  // Admin session
  getAdminSession: () => DB.get('admin_session', null),
  setAdminSession: (s) => DB.set('admin_session', s),
  clearAdminSession: () => localStorage.removeItem('sjs_admin_session'),

  // Helpers
  getShop: (id) => DB.getShops().find(s => s.id === id),
  getProductsForShop: (shopId) => DB.getProducts().filter(p => p.shopId === shopId),
  getOrdersForShop: (shopId) => DB.getOrders().filter(o => o.shopId === shopId),
  getExpensesForShop: (shopId) => DB.getExpenses().filter(e => e.shopId === shopId),
  getCustomersForShop: (shopId) => DB.getCustomers().filter(c => c.shopId === shopId),

  // Notifications helpers
  addNotification(shopId, type, title, message) {
    const all = DB.getNotifications();
    all.unshift({
      id: Math.random().toString(36).slice(2, 10),
      shopId, // null = for admin, otherwise shopId
      type, title, message,
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

  // ============ SEED ============
  seed() {
    if (DB.getShops().length === 0) {
      const demos = [
        {
          id: 'shop_sjs',
          ownerEmail: 'mom@sjs.com',
          ownerPassword: 'sjs12345',
          name: 'SJS Goodness',
          description: 'Country sugar, natural seeds and traditional goodness from Puducherry.',
          category: 'Groceries',
          serviceArea: 'Puducherry',
          phone: '+91 90000 00000',
          logo: '',
          isApproved: true,
          status: 'approved',
          createdAt: new Date().toISOString()
        }
      ];
      DB.saveShops(demos);
      DB.saveProducts([
        { id: 'p1', shopId: 'shop_sjs', name: 'Country Sugar (Nattu Sakkarai)', description: 'Pure traditional country sugar', price: 120, cost: 80, stock: 50, unit: 'kg', category: 'Sugars', image: '', isAvailable: true, isPublished: true, lowStockAt: 10, createdAt: new Date().toISOString() },
        { id: 'p2', shopId: 'shop_sjs', name: 'Pumpkin Seeds', description: 'Premium raw pumpkin seeds', price: 250, cost: 180, stock: 30, unit: 'kg', category: 'Seeds & Nuts', image: '', isAvailable: true, isPublished: true, lowStockAt: 5, createdAt: new Date().toISOString() },
        { id: 'p3', shopId: 'shop_sjs', name: 'Coconut Water', description: 'Fresh tender coconut water', price: 60, cost: 35, stock: 20, unit: 'ml', category: 'Drinks', image: '', isAvailable: true, isPublished: true, lowStockAt: 5, createdAt: new Date().toISOString() }
      ]);
    }

    if (!DB.getAdminSession() && DB.get('admin_seeded', false) === false) {
      DB.set('admin_seeded', true);
    }
  }
};

DB.seed();
