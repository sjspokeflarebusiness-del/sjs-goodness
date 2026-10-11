/* ============================================
   AUTH — Firebase edition
   ============================================ */

const ADMIN_CONTACT = '8056669214';
const ADMIN_EMAIL = 'flaren@sjs.com';

const Auth = {
  currentShop() {
    const session = DB.getSession();
    if (!session) return null;
    return DB.getShop(session.shopId);
  },

  // Is the logged-in shop the admin?
  isAdmin() {
    const shop = Auth.currentShop();
    return shop && shop.ownerEmail === ADMIN_EMAIL;
  },

  async login(email, password) {
    const shops = DB.getShops();
    const shop = shops.find(s =>
      s.ownerEmail === email.trim().toLowerCase() &&
      s.ownerPassword === password
    );
    if (!shop) return { error: 'Invalid email or password.' };
    if (shop.status === 'pending') return { error: 'pending', shop };
    if (shop.status === 'rejected') return { error: 'Your shop was not approved. Contact admin.' };
    DB.setSession({ shopId: shop.id, loginAt: new Date().toISOString() });
    return { shop };
  },

  logout() {
    DB.clearSession();
    window.location.href = 'index.html';
  },

  async register(data) {
    const shops = DB.getShops();
    if (shops.some(s => s.ownerEmail === data.email.toLowerCase())) {
      return { error: 'This email is already registered.' };
    }
    const shop = {
      id: 'shop_' + Math.random().toString(36).slice(2, 10),
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
    await DB.saveShops([...shops, shop]);
    await DB.addNotification(null, 'new_shop_request',
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
