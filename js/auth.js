/* ============================================
   SJS GOODNESS — AUTHENTICATION
   ============================================ */

const Auth = {
  // Get current logged-in shop, or null
  currentShop() {
    const session = DB.getSession();
    if (!session) return null;
    return DB.getShop(session.shopId);
  },

  // Login with email + password
  login(email, password) {
    const shops = DB.getShops();
    const shop = shops.find(s =>
      s.ownerEmail === email.trim().toLowerCase() &&
      s.ownerPassword === password
    );
    if (!shop) return null;
    DB.setSession({ shopId: shop.id, loginAt: new Date().toISOString() });
    return shop;
  },

  // Logout
  logout() {
    DB.clearSession();
    window.location.href = 'index.html';
  },

  // Register a new shop owner
  register(data) {
    const shops = DB.getShops();
    if (shops.some(s => s.ownerEmail === data.email.toLowerCase())) {
      return { error: 'This email is already registered.' };
    }
    const shop = {
      id: 'shop_' + uid(),
      ownerEmail: data.email.toLowerCase(),
      ownerPassword: data.password,
      name: data.name,
      description: data.description || '',
      category: data.category || 'General',
      serviceArea: 'Puducherry',
      phone: data.phone || '',
      logo: '',
      isApproved: true,
      createdAt: new Date().toISOString()
    };
    shops.push(shop);
    DB.saveShops(shops);
    DB.setSession({ shopId: shop.id, loginAt: new Date().toISOString() });
    return { shop };
  },

  // Guard: redirect to login if not authenticated
  requireLogin() {
    if (!Auth.currentShop()) {
      window.location.href = 'login.html';
      return null;
    }
    return Auth.currentShop();
  }
};
