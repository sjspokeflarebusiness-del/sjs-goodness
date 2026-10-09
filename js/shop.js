/* ============================================
   SJS GOODNESS — SHOP DETAIL PAGE
   ============================================ */

(function () {
  const shopId = qp('id');
  const shop = DB.getShop(shopId);

  if (!shop) {
    document.body.innerHTML = '<div class="container" style="padding:4rem;text-align:center;"><h2>Shop not found</h2><p class="mt-2"><a href="index.html">← Back to marketplace</a></p></div>';
    return;
  }

  // Header
  document.getElementById('shop-header').innerHTML = `
    <div style="display:flex;gap:1rem;align-items:center;">
      ${shop.logo ? `<img src="${esc(shop.logo)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;">` : ''}
      <div>
        <h1 style="font-size:1.5rem;">${esc(shop.name)}</h1>
        <p class="text-muted text-sm">${esc(shop.category)} · ${esc(shop.serviceArea)} · ${esc(shop.phone)}</p>
        <p class="text-sm mt-1">${esc(shop.description)}</p>
      </div>
    </div>
  `;

  // Products
  const products = DB.getProductsForShop(shop.id).filter(p => p.isPublished && p.isAvailable);
  const grid = document.getElementById('products-grid');
  const noProducts = document.getElementById('no-products');

  if (products.length === 0) {
    noProducts.style.display = 'block';
  } else {
    grid.innerHTML = products.map(p => `
      <div class="product-card">
        ${p.image ? `<img src="${esc(p.image)}" class="product-img" alt="">` : '<div class="product-img"></div>'}
        <div class="product-body">
          <div class="product-name">${esc(p.name)}</div>
          <div class="product-meta">${p.stock} ${esc(p.unit)} in stock</div>
          <div class="product-footer">
            <span class="product-price">${fmt(p.price)}</span>
            <button class="btn btn-primary btn-sm" data-add="${esc(p.id)}">Add</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Cart state
  let cart = {}; // { productId: qty }

  function renderCart() {
    const items = Object.entries(cart).map(([pid, qty]) => {
      const p = products.find(x => x.id === pid);
      return p ? { p, qty, total: p.price * qty } : null;
    }).filter(Boolean);

    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');

    if (items.length === 0) {
      container.innerHTML = '<p class="text-muted text-sm">Cart is empty</p>';
      summary.style.display = 'none';
      return;
    }
    summary.style.display = 'block';

    container.innerHTML = items.map(i => `
      <div class="cart-item">
        <div>
          <div>${esc(i.p.name)}</div>
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
  function decFromCart(pid) {
    if (!cart[pid]) return;
    cart[pid]--;
    if (cart[pid] <= 0) delete cart[pid];
    renderCart();
  }

  grid.addEventListener('click', e => {
    const addId = e.target.getAttribute('data-add');
    if (addId) addToCart(addId);
  });

  document.getElementById('cart-items').addEventListener('click', e => {
    const incId = e.target.getAttribute('data-inc');
    const decId = e.target.getAttribute('data-dec');
    if (incId) addToCart(incId);
    if (decId) decFromCart(decId);
  });

  // Checkout modal
  document.getElementById('checkout-btn').addEventListener('click', () => {
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
            <button class="modal-close" id="close-modal">×</button>
          </div>
          <div class="form-group"><label>Your Name *</label><input id="cust-name" class="form-input"></div>
          <div class="form-group"><label>Phone *</label><input id="cust-phone" class="form-input"></div>
          <div class="form-group"><label>Delivery Address</label><input id="cust-addr" class="form-input"></div>
          <div class="form-group"><label>Notes</label><input id="cust-notes" class="form-input"></div>
          <div class="cart-total" style="margin-bottom:1rem;"><span>Total</span><span>${fmt(total)}</span></div>
          <div class="modal-footer">
            <button class="btn btn-ghost" id="cancel-order">Cancel</button>
            <button class="btn btn-success" id="place-order">Place Order</button>
          </div>
          <p class="text-xs text-muted mt-2" style="text-align:center;">Payment on delivery. The shop will contact you.</p>
        </div>
      </div>
    `;

    document.getElementById('close-modal').onclick =
    document.getElementById('cancel-order').onclick = () => {
      document.getElementById('checkout-modal').innerHTML = '';
    };

    document.getElementById('place-order').onclick = () => {
      const name = document.getElementById('cust-name').value.trim();
      const phone = document.getElementById('cust-phone').value.trim();
      if (!name || !phone) return alert('Please enter name and phone.');

      const orderNumber = 'SJS' + Date.now().toString().slice(-6);
      const order = {
        id: uid(),
        orderNumber,
        shopId: shop.id,
        customerName: name,
        customerPhone: phone,
        deliveryAddress: document.getElementById('cust-addr').value.trim(),
        notes: document.getElementById('cust-notes').value.trim(),
        items: items.map(i => ({
          productId: i.p.id, name: i.p.name, qty: i.qty,
          price: i.p.price, cost: i.p.cost, total: i.total
        })),
        subtotal: total, total,
        amountPaid: 0,
        paymentStatus: 'unpaid',
        orderStatus: 'placed',
        createdAt: new Date().toISOString()
      };

      const allOrders = DB.getOrders();
      allOrders.push(order);
      DB.saveOrders(allOrders);

      // Deduct stock
      const allProducts = DB.getProducts();
      items.forEach(i => {
        const p = allProducts.find(x => x.id === i.p.id);
        if (p) p.stock = Math.max(0, p.stock - i.qty);
      });
      DB.saveProducts(allProducts);

      // Save/update customer
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
      DB.saveCustomers(customers);

      // Show confirmation
      document.getElementById('checkout-modal').innerHTML = `
        <div class="modal-overlay">
          <div class="modal" style="text-align:center;">
            <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
            <h2>Order Placed!</h2>
            <p class="text-muted mt-2">Order #${esc(orderNumber)}</p>
            <p style="font-weight:600;font-size:1.25rem;margin-top:0.5rem;">${fmt(total)}</p>
            <p class="text-sm text-muted mt-3">${esc(shop.name)} will contact you shortly.</p>
            <a href="index.html" class="btn btn-primary mt-4">Back to Shops</a>
          </div>
        </div>
      `;
    };
  });
})();
