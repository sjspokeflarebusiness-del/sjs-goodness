/* ============================================
   SHOP DETAIL PAGE — Firebase + Share + Smart Overlay
   ============================================ */

window.addEventListener('sjs:ready', function () {
  (function () {
    const shopId = qp('id');
    const shop = DB.getShop(shopId);

    if (!shop || !shop.isApproved) {
      document.body.innerHTML = '<div class="container" style="padding:4rem;text-align:center;"><h2>Shop not found or not approved</h2><p class="mt-2"><a href="index.html">← Back to marketplace</a></p></div>';
      return;
    }

  document.title = shop.name + ' — SJS & CO';

// Logo
const logoHtml = shop.logo
  ? `<img src="${esc(shop.logo)}" class="shop-hero-logo" alt="${esc(shop.name)}">`
  : `<div class="shop-hero-logo">${esc(shop.name[0])}</div>`;

// Hero — SET UP FIRST, THEN APPLY CLASSES
const heroEl = document.getElementById('shop-hero');

// Build inner HTML FIRST
heroEl.innerHTML = `
  <div class="container">
    <div class="shop-hero-inner">
      ${logoHtml}
      <div class="shop-hero-info">
        <h1>${esc(shop.name)}</h1>
        <div class="meta">
          <span>🏪 ${esc(shop.category || 'General')}</span>
          <span>📍 ${esc(shop.serviceArea || 'Puducherry')}</span>
          ${shop.phone ? `<span>📞 ${esc(shop.phone)}</span>` : ''}
        </div>
        <p class="shop-hero-desc">${esc(shop.description || '')}</p>
        <span class="shop-hero-badge">✅ Approved Shop</span>
        <div class="shop-hero-actions">
          <div class="share-wrap" id="share-wrap">
            <button class="share-btn share-btn-primary" id="share-btn-main">
              📤 Share Shop
            </button>
          </div>
          ${shop.phone ? `<a href="https://wa.me/91${esc((shop.phone||'').replace(/\D/g,''))}" target="_blank" class="share-btn" style="text-decoration:none;">💬 WhatsApp</a>` : ''}
        </div>
      </div>
    </div>
  </div>
`;

// NOW apply banner + classes AFTER innerHTML is set
if (shop.banner) {
  heroEl.style.backgroundImage = `url('${shop.banner}')`;
  heroEl.style.backgroundSize = 'cover';
  heroEl.style.backgroundPosition = 'center';
  heroEl.classList.add('has-banner');
} else {
  heroEl.style.backgroundImage = '';
  heroEl.classList.remove('has-banner');
}

    // Detect if banner is dark and add appropriate text class
    if (shop.banner) {
      detectBannerBrightness(shop.banner).then(isDark => {
        if (isDark) heroEl.classList.add('dark-banner');
        else heroEl.classList.add('light-banner');
      }).catch(() => {
        // Fallback: assume dark-ish banner, apply overlay
        heroEl.classList.add('dark-banner');
      });
    }

    heroEl.innerHTML = `
      <div class="container">
        <div class="shop-hero-inner">
          ${logoHtml}
          <div class="shop-hero-info">
            <h1>${esc(shop.name)}</h1>
            <div class="meta">
              <span>🏪 ${esc(shop.category || 'General')}</span>
              <span>📍 ${esc(shop.serviceArea || 'Puducherry')}</span>
              ${shop.phone ? `<span>📞 ${esc(shop.phone)}</span>` : ''}
            </div>
            <p class="shop-hero-desc">${esc(shop.description || '')}</p>
            <span class="shop-hero-badge">✅ Approved Shop</span>

            <div class="shop-hero-actions">
              <div class="share-wrap" id="share-wrap">
                <button class="share-btn share-btn-primary" id="share-btn-main">
                  📤 Share Shop
                </button>
              </div>
              ${shop.phone ? `<a href="https://wa.me/91${esc((shop.phone||'').replace(/\D/g,''))}" target="_blank" class="share-btn" style="text-decoration:none;">💬 WhatsApp</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // ============ BANNER BRIGHTNESS DETECTION ============
    // Loads the banner image, samples pixels, returns whether it's dark
    function detectBannerBrightness(imageUrl) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // Sample a small region for speed
            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);
            const data = ctx.getImageData(0, 0, 50, 50).data;
            let totalLum = 0;
            let count = 0;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i], g = data[i + 1], b = data[i + 2];
              // Perceived luminance formula
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              totalLum += lum;
              count++;
            }
            const avgLum = totalLum / count;
            // Below 128 = dark image
            resolve(avgLum < 128);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = reject;
        img.src = imageUrl;
      });
    }

    // ============ SHARE ============
    const shareBtn = document.getElementById('share-btn-main');
    const shareWrap = document.getElementById('share-wrap');
    const shareUrl = window.location.href;
    const shareTitle = `${shop.name} — SJS & CO`;
    const shareText = `Check out ${shop.name} on SJS & CO 🛍️`;

    shareBtn.onclick = (e) => {
      e.stopPropagation();
      const existing = shareWrap.querySelector('.share-menu');
      if (existing) { existing.remove(); return; }

      const menu = document.createElement('div');
      menu.className = 'share-menu';
      menu.innerHTML = `
        <button class="share-menu-item" data-action="native">
          <span class="icon">📤</span> Share via…
        </button>
        <button class="share-menu-item wa" data-action="whatsapp">
          <span class="icon">💬</span> Share on WhatsApp
        </button>
        <button class="share-menu-item" data-action="copy">
          <span class="icon">🔗</span> Copy Link
        </button>
        <button class="share-menu-item" data-action="sms">
          <span class="icon">📱</span> Share via SMS
        </button>
      `;
      shareWrap.appendChild(menu);

      menu.querySelectorAll('[data-action]').forEach(btn => {
        btn.onclick = async (ev) => {
          ev.stopPropagation();
          const action = btn.getAttribute('data-action');
          await handleShare(action);
          menu.remove();
        };
      });

      setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
          const m = shareWrap.querySelector('.share-menu');
          if (m) m.remove();
          document.removeEventListener('click', closeMenu);
        }, { once: true });
      }, 100);
    };

    async function handleShare(action) {
      if (action === 'native') {
        if (navigator.share) {
          try {
            await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
            return;
          } catch (e) {}
        }
        await copyToClipboard(shareUrl);
        showToast('✅ Link copied to clipboard');
        return;
      }
      if (action === 'whatsapp') {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
        window.open(waUrl, '_blank');
        return;
      }
      if (action === 'copy') {
        await copyToClipboard(shareUrl);
        showToast('✅ Link copied to clipboard');
        return;
      }
      if (action === 'sms') {
        const smsUrl = `sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        window.location.href = smsUrl;
        return;
      }
    }

    async function copyToClipboard(text) {
      try {
        if (navigator.clipboard) { await navigator.clipboard.writeText(text); return true; }
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch (e) { return false; }
    }

    function showToast(msg) {
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2200);
    }

    // ============ PRODUCTS ============
    const products = DB.getProductsForShop(shop.id).filter(p => p.isPublished && p.isAvailable);
    const grid = document.getElementById('products-grid');
    const noProducts = document.getElementById('no-products');

    if (products.length === 0) {
      if (noProducts) noProducts.style.display = 'block';
    } else {
      if (noProducts) noProducts.style.display = 'none';
      grid.innerHTML = products.map(p => `
        <div class="product-card">
          ${productImageTag(p)}
          <div class="product-body">
            <div class="product-name">${esc(p.name)}</div>
            <div class="product-meta">${p.stock} ${esc(p.unit)} in stock</div>
            <div class="product-footer">
              <span class="product-price">${fmt(p.price)}</span>
              <button class="add-btn" data-add="${esc(p.id)}">ADD</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    // ============ CART ============
    let cart = {};

    function renderCart() {
      const items = Object.entries(cart).map(([pid, qty]) => {
        const p = products.find(x => x.id === pid);
        return p ? { p, qty, total: p.price * qty } : null;
      }).filter(Boolean);

      const container = document.getElementById('cart-items');
      const summary = document.getElementById('cart-summary');

      if (items.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm">Cart is empty</p>';
        if (summary) summary.style.display = 'none';
        return;
      }
      if (summary) summary.style.display = 'block';

      container.innerHTML = items.map(i => `
        <div class="cart-item">
          <div>
            <div style="font-weight:500;">${esc(i.p.name)}</div>
            <div class="text-xs text-muted">${i.qty} × ${fmt(i.p.price)}</div>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" data-dec="${esc(i.p.id)}">−</button>
            <button class="qty-btn" data-inc="${esc(i.p.id)}">+</button>
          </div>
        </div>
      `).join('');

      const total = items.reduce((s, i) => s + i.total, 0);
      document.getElementById('cart-total').textContent = fmt(total);
    }

    function addToCart(pid) { cart[pid] = (cart[pid] || 0) + 1; renderCart(); }
    function decFromCart(pid) { if (!cart[pid]) return; cart[pid]--; if (cart[pid] <= 0) delete cart[pid]; renderCart(); }

    if (grid) {
      grid.addEventListener('click', e => {
        const id = e.target.getAttribute('data-add');
        if (id) { addToCart(id); e.target.textContent = 'ADDED ✓'; setTimeout(() => e.target.textContent = 'ADD', 700); }
      });
    }
    const cartItemsEl = document.getElementById('cart-items');
    if (cartItemsEl) {
      cartItemsEl.addEventListener('click', e => {
        const inc = e.target.getAttribute('data-inc'), dec = e.target.getAttribute('data-dec');
        if (inc) addToCart(inc);
        if (dec) decFromCart(dec);
      });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const items = Object.entries(cart).map(([pid, qty]) => {
          const p = products.find(x => x.id === pid);
          return p ? { p, qty, total: p.price * qty } : null;
        }).filter(Boolean);
        const total = items.reduce((s, i) => s + i.total, 0);

        document.getElementById('checkout-modal').innerHTML = `
          <div class="modal-overlay">
            <div class="modal">
              <div class="modal-header">
                <h2>Delivery Details</h2>
                <button class="modal-close" onclick="document.getElementById('checkout-modal').innerHTML=''">×</button>
              </div>
              <div class="form-group"><label>Your Name *</label><input id="cust-name" class="form-input"></div>
              <div class="form-group"><label>Phone *</label><input id="cust-phone" class="form-input"></div>
              <div class="form-group"><label>Delivery Address</label><input id="cust-addr" class="form-input"></div>
              <div class="form-group"><label>Notes</label><input id="cust-notes" class="form-input"></div>
              <div class="cart-total" style="margin-bottom:1rem;"><span>Total</span><span>${fmt(total)}</span></div>
              <div class="modal-footer">
                <button class="btn btn-ghost" onclick="document.getElementById('checkout-modal').innerHTML=''">Cancel</button>
                <button class="btn btn-success" id="place-order">Place Order</button>
              </div>
              <p class="text-xs text-muted mt-2" style="text-align:center;">💵 Payment on delivery. The shop will contact you.</p>
            </div>
          </div>`;

        document.getElementById('place-order').onclick = async () => {
          const name = document.getElementById('cust-name').value.trim();
          const phone = document.getElementById('cust-phone').value.trim();
          if (!name || !phone) return alert('Please enter name and phone.');

          const orderNumber = 'SJS' + Date.now().toString().slice(-6);
          const order = {
            id: uid(), orderNumber, shopId: shop.id,
            customerName: name, customerPhone: phone,
            deliveryAddress: document.getElementById('cust-addr').value.trim(),
            notes: document.getElementById('cust-notes').value.trim(),
            items: items.map(i => ({
              productId: i.p.id, name: i.p.name, qty: i.qty,
              price: i.p.price, cost: i.p.cost, total: i.total
            })),
            subtotal: total, total,
            amountPaid: 0, paymentStatus: 'unpaid', orderStatus: 'placed',
            createdAt: new Date().toISOString()
          };

          const allOrders = DB.getOrders();
          allOrders.push(order);
          await DB.saveOrders(allOrders);

          const allProducts = DB.getProducts();
          items.forEach(i => {
            const p = allProducts.find(x => x.id === i.p.id);
            if (p) p.stock = Math.max(0, p.stock - i.qty);
          });
          await DB.saveProducts(allProducts);

          const customers = DB.getCustomers();
          const existing = customers.find(c => c.shopId === shop.id && c.phone === phone);
          if (existing) {
            existing.totalSpent = (existing.totalSpent || 0) + total;
            existing.orderCount = (existing.orderCount || 0) + 1;
            existing.lastOrderAt = new Date().toISOString();
          } else {
            customers.push({
              id: uid(), shopId: shop.id, name, phone,
              address: order.deliveryAddress,
              totalSpent: total, orderCount: 1,
              lastOrderAt: new Date().toISOString(), notes: ''
            });
          }
          await DB.saveCustomers(customers);

          await DB.addNotification(shop.id, 'new_order',
            'New Order #' + orderNumber,
            `${name} (${phone}) placed an order for ${fmt(total)}.`);

          document.getElementById('checkout-modal').innerHTML = `
            <div class="modal-overlay">
              <div class="modal" style="text-align:center;">
                <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
                <h2>Order Placed!</h2>
                <p class="text-muted mt-2">Order #${esc(orderNumber)}</p>
                <p style="font-weight:700;font-size:1.4rem;margin-top:0.5rem;">${fmt(total)}</p>
                <p class="text-sm text-muted mt-3">${esc(shop.name)} will contact you shortly.</p>
                <a href="index.html" class="btn btn-primary mt-4">Back to Shops</a>
              </div>
            </div>`;
        };
      });
    }

    renderCart();
  })();
});
