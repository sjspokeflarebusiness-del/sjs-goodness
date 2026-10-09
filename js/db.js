/* ============================================
   SJS GOODNESS — DATABASE LAYER
   Uses browser localStorage as the database.
   All keys are prefixed with "sjs_".
   ============================================ */

const DB = {

  get(key, fallback) {
    try {
      const v = localStorage.getItem('sjs_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },

  set(key, value) {
    localStorage.setItem('sjs_' + key, JSON.stringify(value));
  },

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

  // Session
  getSession: () => DB.get('session', null),
  setSession: (s) => DB.set('session', s),
  clearSession: () => localStorage.removeItem('sjs_session'),

  // Get one shop by ID
  getShop: (id) => DB.getShops().find(s => s.id === id),

  // Get products for a shop
  getProductsForShop: (shopId) => DB.getProducts().filter(p => p.shopId === shopId),

  // Get orders for a shop
  getOrdersForShop: (shopId) => DB.getOrders().filter(o => o.shopId === shopId),

  // Get expenses for a shop
  getExpensesForShop: (shopId) => DB.getExpenses().filter(e => e.shopId === shopId),

  // Get customers for a shop
  getCustomersForShop: (shopId) => DB.getCustomers().filter(c => c.shopId === shopId),

  // Seed demo data on very first load
  seed() {
    if (DB.getShops().length > 0) return;

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
        createdAt: new Date().toISOString()
      },
      {
        id: 'shop_2',
        ownerEmail: 'demo2@example.com',
        ownerPassword: 'demo1234',
        name: 'Pondy Fresh Mart',
        description: 'Fresh vegetables and fruits delivered daily across Puducherry.',
        category: 'Vegetables',
        serviceArea: 'Puducherry',
        phone: '+91 90000 00001',
        logo: '',
        isApproved: true,
        createdAt: new Date().toISOString()
      }
    ];
    DB.saveShops(demos);

    DB.saveProducts([
      { id: 'p1', shopId: 'shop_sjs', name: 'Country Sugar (Nattu Sakkarai)', description: 'Pure traditional country sugar', price: 120, cost: 80, stock: 50, unit: 'kg', category: 'Sugar', image: 'https://images.unsplash.com/photo-1581447100594-7e3d0f5c1b8b?w=400', isAvailable: true, isPublished: true, lowStockAt: 10, createdAt: new Date().toISOString() },
      { id: 'p2', shopId: 'shop_sjs', name: 'Pumpkin Seeds', description: 'Premium raw pumpkin seeds', price: 250, cost: 180, stock: 30, unit: 'kg', category: 'Seeds', image: 'https://images.unsplash.com/photo-1599909631950-9f4f0d0b9e6b?w=400', isAvailable: true, isPublished: true, lowStockAt: 5, createdAt: new Date().toISOString() },
      { id: 'p3', shopId: 'shop_sjs', name: 'Sunflower Seeds', description: 'Fresh sunflower seeds', price: 200, cost: 140, stock: 3, unit: 'kg', category: 'Seeds', image: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=400', isAvailable: true, isPublished: true, lowStockAt: 5, createdAt: new Date().toISOString() },
      { id: 'p4', shopId: 'shop_2', name: 'Fresh Tomatoes', description: 'Local farm tomatoes', price: 40, cost: 25, stock: 100, unit: 'kg', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1546470427-e5ac89b6e4b1?w=400', isAvailable: true, isPublished: true, lowStockAt: 20, createdAt: new Date().toISOString() }
    ]);
  }
};

// Seed on every page load (only runs once, then skips)
DB.seed();
