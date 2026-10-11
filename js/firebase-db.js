/* ============================================
   FIREBASE DB LAYER
   Uses Firestore for cloud storage.
   Uses Firebase Auth for user accounts.
   ============================================ */

// ====== IN-MEMORY CACHE ======
const FBCache = {
  shops: [],
  products: [],
  orders: [],
  customers: [],
  expenses: [],
  notifications: []
};

let fbDb = null;
let fbAuth = null;
let fbReady = false;
let fbInitPromise = null;

// ====== INITIALIZE FIREBASE ======
async function initFirebase() {
  if (fbInitPromise) return fbInitPromise;

  fbInitPromise = (async () => {
    // Wait for Firebase SDK to be loaded
    while (typeof firebase === 'undefined') {
      await new Promise(r => setTimeout(r, 50));
    }

    firebase.initializeApp(FIREBASE_CONFIG);
    fbDb = firebase.firestore();
    fbAuth = firebase.auth();

    // Load all data once into memory
    await loadAllFromFirestore();

    fbReady = true;
    console.log('🔥 Firebase ready. Loaded:', {
      shops: FBCache.shops.length,
      products: FBCache.products.length,
      orders: FBCache.orders.length
    });

    // Seed admin shop if empty
    if (FBCache.shops.length === 0) {
      await seedFlarenShop();
    }

    return true;
  })();

  return fbInitPromise;
}

// ====== LOAD ALL COLLECTIONS INTO CACHE ======
async function loadAllFromFirestore() {
  const collections = ['shops', 'products', 'orders', 'customers', 'expenses', 'notifications'];
  const promises = collections.map(async (name) => {
    try {
      const snap = await fbDb.collection(name).get();
      FBCache[name] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Load failed for', name, e);
      FBCache[name] = [];
    }
  });
  await Promise.all(promises);
}

// ====== SAVE A SINGLE DOC TO FIRESTORE ======
async function saveDoc(collectionName, doc) {
  if (!doc.id) {
    const ref = await fbDb.collection(collectionName).add(doc);
    doc.id = ref.id;
    return ref.id;
  } else {
    await fbDb.collection(collectionName).doc(doc.id).set(doc);
    return doc.id;
  }
}

async function deleteDoc(collectionName, id) {
  await fbDb.collection(collectionName).doc(id).delete();
}

// ====== SEED ======
async function seedFlarenShop() {
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
  await fbDb.collection('shops').doc('shop_flaren').set(flaren);
  FBCache.shops = [flaren];
  console.log('🌱 Seeded Flaren shop');
}

// ====== PUBLIC DB API ======
const DB = {

  // ---- INIT ----
  async init() {
    return initFirebase();
  },

  isLoaded: () => fbReady,

  // ---- READ (from cache — sync, fast) ----
  getShops: () => FBCache.shops,
  getProducts: () => FBCache.products,
  getOrders: () => FBCache.orders,
  getCustomers: () => FBCache.customers,
  getExpenses: () => FBCache.expenses,
  getNotifications: () => FBCache.notifications,

  getShop: (id) => FBCache.shops.find(s => s.id === id),
  getProductsForShop: (shopId) => FBCache.products.filter(p => p.shopId === shopId),
  getOrdersForShop: (shopId) => FBCache.orders.filter(o => o.shopId === shopId),
  getExpensesForShop: (shopId) => FBCache.expenses.filter(e => e.shopId === shopId),
  getCustomersForShop: (shopId) => FBCache.customers.filter(c => c.shopId === shopId),

  // ---- SAVE (write to cache + Firestore in background) ----
  saveShops: async (arr) => { FBCache.shops = arr; await syncAll('shops', arr); },
  saveProducts: async (arr) => { FBCache.products = arr; await syncAll('products', arr); },
  saveOrders: async (arr) => { FBCache.orders = arr; await syncAll('orders', arr); },
  saveCustomers: async (arr) => { FBCache.customers = arr; await syncAll('customers', arr); },
  saveExpenses: async (arr) => { FBCache.expenses = arr; await syncAll('expenses', arr); },
  saveNotifications: async (arr) => { FBCache.notifications = arr; await syncAll('notifications', arr); },

  // ---- SESSION (local only — per device) ----
  getSession: () => {
    try { return JSON.parse(localStorage.getItem('sjs_session')); } catch { return null; }
  },
  setSession: (s) => localStorage.setItem('sjs_session', JSON.stringify(s)),
  clearSession: () => localStorage.removeItem('sjs_session'),

  // ---- THEME (local only) ----
  getTheme: () => localStorage.getItem('sjs_theme') || 'light',
  setTheme: (t) => localStorage.setItem('sjs_theme', t),

  // ---- NOTIFICATIONS ----
  addNotification: async (shopId, type, title, message) => {
    const n = {
      id: 'n_' + Math.random().toString(36).slice(2, 10),
      shopId, type, title, message,
      read: false,
      createdAt: new Date().toISOString()
    };
    await saveDoc('notifications', n);
    FBCache.notifications.unshift(n);
  },
  markNotificationRead: async (id) => {
    const n = FBCache.notifications.find(x => x.id === id);
    if (n) {
      n.read = true;
      await saveDoc('notifications', n);
    }
  },
  markAllRead: async (shopId) => {
    const mine = FBCache.notifications.filter(n => n.shopId === shopId);
    for (const n of mine) {
      n.read = true;
      await saveDoc('notifications', n);
    }
  },

  // ---- FULL REFRESH ----
  async refresh() {
    await loadAllFromFirestore();
    window.dispatchEvent(new Event('sjs:datachanged'));
  }
};

// ====== SYNC HELPERS ======
// Compares cache to Firestore and pushes changes
async function syncAll(collectionName, items) {
  const existing = await fbDb.collection(collectionName).get();
  const existingIds = new Set(existing.docs.map(d => d.id));
  const currentIds = new Set(items.map(i => i.id));

  // Delete removed
  for (const doc of existing.docs) {
    if (!currentIds.has(doc.id)) {
      await doc.ref.delete();
    }
  }

  // Add or update
  for (const item of items) {
    if (item.id) {
      await fbDb.collection(collectionName).doc(item.id).set(item, { merge: true });
    } else {
      const ref = await fbDb.collection(collectionName).add(item);
      item.id = ref.id;
    }
  }
}
