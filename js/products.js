/* ============================================
   PRODUCTS PAGE
   ============================================ */

let currentShop = null;
let editingProduct = null;
let currentImageData = '';

function renderProducts() {
  if (!currentShop) return;
  const products = DB.getProductsForShop(currentShop.id);
  const c = document.getElementById('content');

  if (products.length === 0) {
    c.innerHTML = `
      <div class="empty-state">
        <p>No products yet.</p>
        <button class="btn btn-primary mt-3" onclick="openProductForm()">+ Add Your First Product</button>
      </div>`;
    return;
  }

  c.innerHTML = `
    <div class="table-card">
      <table class="data-table">
        <thead><tr>
          <th>Product</th><th>Cost</th><th>Price</th><th>Margin</th>
          <th>Stock</th><th>Status</th><th class="text-right">Actions</th>
        </tr></thead>
        <tbody>${products.map(p => {
          const margin = p.price - p.cost;
          const pct = p.price > 0 ? ((margin / p.price) * 100).toFixed(0) : 0;
          const low = p.stock <= (p.lowStockAt || 5);
          const thumb = (typeof productImageTag === 'function')
            ? `<div style="width:36px;height:36px;border-radius:6px;overflow:hidden;display:inline-block;vertical-align:middle;margin-right:0.5rem;">${productImageTag(p, '').replace('product-img', 'thumb-img')}</div>`
            : '';
          return `
            <tr>
              <td>${thumb}<strong>${esc(p.name)}</strong><br><span class="text-xs text-muted">${esc(p.category || '—')}</span></td>
              <td>${fmt(p.cost)}</td>
              <td><strong>${fmt(p.price)}</strong></td>
              <td style="color:${margin > 0 ? 'var(--green)' : 'var(--red)'}">${fmt(margin)} (${pct}%)</td>
              <td style="color:${low ? 'var(--red)' : 'inherit'};${low ? 'font-weight:600;' : ''}">${p.stock} ${esc(p.unit)}</td>
              <td>${p.isPublished ? '<span class="badge badge-green">Published</span>' : '<span class="badge badge-gray">Draft</span>'}</td>
              <td class="text-right">
                <button class="btn btn-ghost btn-sm" onclick="openProductForm('${p.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">Delete</button>
              </td>
            </tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
}

function openProductForm(id) {
  if (!currentShop) {
    alert('Shop not loaded. Please refresh.');
    return;
  }

  // Find product if editing
  if (id) {
    editingProduct = DB.getProducts().find(p => p.id === id) || null;
  } else {
    editingProduct = null;
  }

  const p = editingProduct || {
    name: '', description: '', category: 'Groceries', price: '', cost: '',
    stock: '', unit: 'kg', image: '', lowStockAt: 5,
    isPublished: true, isAvailable: true
  };

  const catOptions = (typeof getCategoryOptions === 'function')
    ? getCategoryOptions()
    : '<option value="General">General</option>';
  const unitOptions = (typeof getUnitsForCategory === 'function')
    ? getUnitsForCategory(p.category)
    : ['piece', 'kg', 'L'];

  currentImageData = p.image || '';

  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>${editingProduct ? 'Edit Product' : 'Add Product'}</h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>

        <div class="form-group">
          <label>Product Image</label>
          <div id="product-img-uploader"></div>
        </div>

        <div class="form-group">
          <label>Product Name *</label>
          <input id="p-name" class="form-input" value="${esc(p.name)}">
        </div>

        <div class="form-group">
          <label>Category</label>
          <select id="p-category" class="form-input" onchange="onCategoryChange()">
            <option value="">Select category…</option>
            ${catOptions.replace('value="' + p.category + '"', 'value="' + p.category + '" selected')}
          </select>
          <div class="category-hint" id="unit-hint"></div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <input id="p-desc" class="form-input" value="${esc(p.description || '')}">
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div class="form-group"><label>Purchase Cost ₹</label><input type="number" id="p-cost" class="form-input" value="${p.cost}"></div>
          <div class="form-group"><label>Selling Price ₹ *</label><input type="number" id="p-price" class="form-input" value="${p.price}"></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div class="form-group"><label>Stock Qty</label><input type="number" id="p-stock" class="form-input" value="${p.stock}"></div>
          <div class="form-group"><label>Unit</label>
            <select id="p-unit" class="form-input">
              ${unitOptions.map(u => `<option value="${u}" ${p.unit === u ? 'selected' : ''}>${(typeof UNIT_LABELS !== 'undefined' && UNIT_LABELS[u]) || u}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group"><label>Low Stock Alert At</label><input type="number" id="p-lowstock" class="form-input" value="${p.lowStockAt}"></div>

        <div class="form-group">
          <label><input type="checkbox" id="p-published" ${p.isPublished ? 'checked' : ''}> Publish on public marketplace</label>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="saveProduct()">${editingProduct ? 'Save' : 'Add Product'}</button>
        </div>
      </div>
    </div>`;

  // Image uploader
  if (typeof renderImageUploader === 'function') {
    renderImageUploader('product-img-uploader', currentImageData, (data) => {
      currentImageData = data;
    });
  }

  // Trigger initial unit hint
  onCategoryChange();
}

function onCategoryChange() {
  const catEl = document.getElementById('p-category');
  const unitEl = document.getElementById('p-unit');
  const hintEl = document.getElementById('unit-hint');
  if (!catEl || !unitEl) return;

  const cat = catEl.value;
  const units = (typeof getUnitsForCategory === 'function')
    ? getUnitsForCategory(cat)
    : ['piece', 'kg', 'L'];

  unitEl.innerHTML = units.map(u =>
    `<option value="${u}">${(typeof UNIT_LABELS !== 'undefined' && UNIT_LABELS[u]) || u}</option>`
  ).join('');

  if (hintEl) {
    hintEl.textContent = cat ? `Suggested units for ${cat}: ${units.join(', ')}` : '';
  }
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
  editingProduct = null;
  currentImageData = '';
}

function saveProduct() {
  if (!currentShop) {
    alert('Shop not loaded. Please refresh.');
    return;
  }

  const nameEl = document.getElementById('p-name');
  const priceEl = document.getElementById('p-price');
  if (!nameEl || !priceEl) return;

  const name = nameEl.value.trim();
  const price = Number(priceEl.value);
  if (!name || !price) return alert('Name and price are required.');

  const data = {
    name,
    description: (document.getElementById('p-desc') || {}).value || '',
    category: (document.getElementById('p-category') || {}).value || 'General',
    cost: Number((document.getElementById('p-cost') || {}).value || 0),
    price,
    stock: Number((document.getElementById('p-stock') || {}).value || 0),
    unit: (document.getElementById('p-unit') || {}).value || 'piece',
    lowStockAt: Number((document.getElementById('p-lowstock') || {}).value || 5),
    image: currentImageData || '',
    isPublished: (document.getElementById('p-published') || {}).checked !== false,
    isAvailable: true
  };

  const all = DB.getProducts();

  if (editingProduct && editingProduct.id) {
    // EDIT existing
    const idx = all.findIndex(p => p.id === editingProduct.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    }
  } else {
    // NEW product
    all.push({
      id: uid(),
      shopId: currentShop.id,
      ...data,
      createdAt: new Date().toISOString()
    });
  }

  DB.saveProducts(all);
  closeModal();
  renderProducts();
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  DB.saveProducts(DB.getProducts().filter(p => p.id !== id));
  renderProducts();
}

// ============================================
// INITIALIZE — this sets currentShop
// ============================================
if (window.location.pathname.endsWith('products.html')) {
  // Small delay to let dashboard.js load first
  setTimeout(() => {
    if (typeof initDashboard === 'function') {
      currentShop = initDashboard('products');
      if (currentShop) renderProducts();
    } else {
      console.error('dashboard.js did not load');
    }
  }, 100);
}
function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  DB.saveProducts(DB.getProducts().filter(p => p.id !== id));
  renderProducts();
}

// ============================================
// INITIALIZE
// ============================================
if (window.location.pathname.endsWith('products.html')) {
  // Wait a tick for dashboard.js to run first (sets up shop + sidebar)
  window.addEventListener('sjs:ready', initProductsPage);
  // Fallback if sjs:ready never fires
  setTimeout(() => {
    if (!currentShop) initProductsPage();
  }, 500);
}

function initProductsPage() {
  if (typeof initDashboard !== 'function') {
    console.error('dashboard.js not loaded');
    return;
  }
  if (!document.getElementById('content')) return;
  currentShop = initDashboard('products');
  if (currentShop) renderProducts();
}
