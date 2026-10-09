/* ============================================
   SJS GOODNESS — AUTHENTICATION
   ============================================ */

const ADMIN_CONTACT = '8056669214';
const ADMIN_USERNAME = 'flaren';
const ADMIN_PASSWORD = 'flaren@8056669214';

const Auth = {
  currentShop() {
    const session = DB.getSession();
    if (!session) return null;
    return DB.getShop(session.shopId);
  },

  login(email, password) {
    const shops = DB.getShops();
    const shop = shops.find(s =>
      s.ownerEmail === email.trim().toLowerCase() &&
      s.ownerPassword === password
    );
    if (!shop) return { error: 'Invalid email or password.' };
    if (shop.status === 'pending') return { error: 'pending', shop };
    if (shop.status === 'rejected') return { error: 'Your shop registration was not approved. Contact admin.' };
    DB.setSession({ shopId: shop.id, loginAt: new Date().toISOString() });
    return { shop };
  },

  // Admin login
  adminLogin(username, password) {
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return false;
    DB.setAdminSession({ loggedIn: true, at: new Date().toISOString() });
    return true;
  },
  isAdmin() { return !!DB.getAdminSession(); },
  adminLogout() { DB.clearAdminSession(); window.location.href = 'admin-login.html'; },
  requireAdmin() {
    if (!Auth.isAdmin()) { window.location.href = 'admin-login.html'; return false; }
    return true;
  },

  logout() {
    DB.clearSession();
    window.location.href = 'index.html';
  },

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
      isApproved: false,          // pending approval
      status: 'pending',           // pending | approved | rejected
      createdAt: new Date().toISOString()
    };
    shops.push(shop);
    DB.saveShops(shops);

    // Notify admin
    DB.addNotification(null, 'new_shop_request',
      'New Shop Request',
      `${shop.name} (${shop.phone}) wants to join. Contact: ${shop.phone}`);

    // NO auto-login — owner waits for approval
    return { shop };
  },

  requireLogin() {
    const shop = Auth.currentShop();
    if (!shop) { window.location.href = 'login.html'; return null; }
    return shop;
  }
};
