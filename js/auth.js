/* ============================================
   AUTHENTICATION — unified admin + shop
   ============================================ */

// ⚙️ CHANGE THIS: the email of the admin account
const ADMIN_EMAIL = 'flaren@sjs.com';

const Auth = {
  currentShop() {
    const session = DB.getSession();
    if (!session) return null;
    return DB.getShop(session.shopId);
  },

  // Is the current logged-in shop the admin?
  isAdmin() {
    const shop = Auth.currentShop();
    if (!shop) return false;
    return shop.ownerEmail === ADMIN_EMAIL;
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
      address: '',
      phone: data.phone || '',
      logo: '',
      banner: '',
      isApproved: false,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    shops.push(shop);
    DB.saveShops(shops);
    DB.addNotification(null, 'new_shop_request',
      'New Shop Request',
      `${shop.name} (${shop.phone}) wants to join. Contact: ${shop.phone}`);
    return { shop };
  },

  requireLogin() {
    const shop = Auth.currentShop();
    if (!shop) { window.location.href = 'login.html'; return null; }
    return shop;
  }
};
