/* ============================================
   SJS GOODNESS — HYBRID DB LAYER v4
   Reads from memory (fast), persists to JSONBin (cloud)
   ============================================ */

const DB = (function () {

  // ====== IN-MEMORY CACHE ======
  const cache = {
    shops: [],
    products: [],
    orders: [],
    customers: [],
    expenses: [],
    notifications: []
  };

  let loaded = false;
  let loadPromise = null;

  // ====== JSONBIN API ======
  const BIN_URL = id => `https://api.jsonbin.io/v3/b/${id}`;

  async function apiGet(binId) {
    try {
      const res = await fetch(BIN_URL(binId) + '/latest', {
        headers: { 'X-Master-Key': CONFIG.JSONBIN_KEY }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return (data.record && data.record.items) || [];
    } catch (e) {
      console.error('API GET failed for bin', binId, e);
      return [];
    }
  }

  async function apiPut(binId, items) {
    try {
      const res = await fetch(BIN_URL(binId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': CONFIG.JSONBIN_KEY
        },
        body: JSON.stringify({ items })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return true;
    } catch (e) {
      console.error('API PUT failed for bin', binId, e);
      return false;
    }
  }

  // ====== LOAD FROM CLOUD (called once at startup) ======
  async function loadFromCloud() {
    const [shops, products, orders, customers, expenses, notifications] = await Promise.all([
      apiGet(CONFIG.BINS.shops),
      apiGet(CONFIG.BINS.products),
      apiGet(CONFIG.BINS.orders),
      apiGet(CONFIG.BINS.customers),
      apiGet(CONFIG.BINS.expenses),
      apiGet(CONFIG.BINS.notifications)
    ]);
    cache.shops = shops || [];
    cache.products = products || [];
    cache.orders = orders || [];
    cache.customers = customers || [];
    cache.expenses = expenses || [];
    cache.notifications = notifications || [];
    loaded = true;
    console.log('☁️ Loaded from cloud:', {
      shops: cache.shops.length,
      products: cache.products.length,
      orders: cache.orders.length
    });
    return true;
  }

  // ====== SEEDING (only runs if cloud is empty) ======
  async function seedIfEmpty() {
    if (cache.shops.length === 0) {
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
      cache.shops = [flaren];
      await apiPut(CONFIG.BINS.shops, cache.shops);
      console.log('🌱 Seeded Flaren shop in cloud');
    }
  }

  // ====== PUBLIC DB OBJECT ======
  const DB = {

    // -------- Async init --------
    async init() {
      if (loadPromise) return loadPromise;
      loadPromise = (async () => {
        await loadFromCloud();
        await seedIfEmpty();
        return true;
      })();
      return loadPromise;
    },

    isLoaded: () => loaded,

    // -------- Shops --------
    getShops: () => cache.shops,
    saveShops: (arr) => { cache.shops = arr; apiPut(CONFIG.BINS.shops, arr); },

    // -------- Products --------
    getProducts: () => cache.products,
    saveProducts: (arr) => { cache.products = arr; apiPut(CONFIG.BINS.products, arr); },

    // -------- Orders --------
    getOrders: () => cache.orders,
    saveOrders: (arr) => { cache.orders = arr; apiPut(CONFIG.BINS.orders, arr); },

    // -------- Customers --------
    getCustomers: () => cache.customers,
    saveCustomers: (arr) => { cache.customers = arr; apiPut(CONFIG.BINS.customers, arr); },

    // -------- Expenses --------
    getExpenses: () => cache.expenses,
    saveExpenses: (arr) => { cache.expenses = arr; apiPut(CONFIG.BINS.expenses, arr); },

    // -------- Notifications --------
    getNotifications: () => cache.notifications,
    saveNotifications: (arr) => { cache.notifications = arr; apiPut(CONFIG.BINS.notifications, arr); },

    // -------- Session (local only — per device) --------
    getSession: () => {
      try { return JSON.parse(localStorage.getItem('sjs_session')); } catch { return null; }
    },
    setSession: (s) => localStorage.setItem('sjs_session', JSON.stringify(s)),
    clearSession: () => localStorage.removeItem('sjs_session'),

    // -------- Theme (local only — per device) --------
    getTheme: () => localStorage.getItem('sjs_theme') || 'light',
    setTheme: (t) => localStorage.setItem('sjs_theme', t),

    // -------- Convenience getters --------
    getShop: (id) => cache.shops.find(s => s.id === id),
    getProductsForShop: (shopId) => cache.products.filter(p => p.shopId === shopId),
    getOrdersForShop: (shopId) => cache.orders.filter(o => o.shopId === shopId),
    getExpensesForShop: (shopId) => cache.expenses.filter(e => e.shopId === shopId),
    getCustomersForShop: (shopId) => cache.customers.filter(c => c.shopId === shopId),

    // -------- Notifications --------
    addNotification(shopId, type, title, message) {
      const all = cache.notifications.slice();
      all.unshift({
        id: Math.random().toString(36).slice(2, 10),
        shopId, type, title, message,
        read: false,
        createdAt: new Date().toISOString()
      });
      DB.saveNotifications(all);
    },
    markNotificationRead(id) {
      const all = cache.notifications.map(n => n.id === id ? { ...n, read: true } : n);
      DB.saveNotifications(all);
    },
    markAllRead(shopId) {
      const all = cache.notifications.map(n =>
        n.shopId === shopId ? { ...n, read: true } : n
      );
      DB.saveNotifications(all);
    },

    // -------- Manual refresh from cloud --------
    async refresh() {
      await loadFromCloud();
      window.dispatchEvent(new Event('sjs:datachanged'));
    }
  };

  return DB;
})();
