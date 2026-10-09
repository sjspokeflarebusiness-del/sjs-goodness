/* ============================================
   PRODUCTS PAGE
   ============================================ */

let currentShop, editingProduct = null;

function renderProducts() {
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
          const thumb = p.image
            ? `<img src="${esc(p.image)}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;vertical-align:middle;margin-right:0.5rem;" onerror="this.style.display='none'">`
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
  editingProduct = id ? DB.getProducts().find(p => p.id === id) : null;
  const p = editingProduct || { name: '', description: '', category: 'Groceries', price: '', cost: '', stock: '', unit: 'kg', image: '', lowStockAt: 5, isPublished: true, isAvailable: true };

  const catOptions = getCategoryOptions();
  const unitOptions = getUnitsForCategory(p.category);

  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>${editingProduct ? 'Edit Product' : 'Add Product'}</h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="form-group"><label>Product Name *</label><input id="p-name" class="form-input" value="${esc(p.name)}"></div>
        <div class="form-group"><label>Category</label>
          <select id="p-category" class="form-input" onchange="onCategoryChange()">
            <option value="">Select category…</option>
            ${catOptions.replace(`value="${p.category}"`, `value="${p.category}" selected`)}
          </select>
          <div class="category-hint" id="unit-hint"></div>
        </div>
        <div class="form-group"><label>Description</label><input id="p-desc" class="form-input" value="${esc(p.description || '')}"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div class="form-group"><label>Purchase Cost ₹</label><input type="number" id="p-cost" class="form-input" value="${p.cost}"></div>
          <div class="form-group"><label>Selling Price ₹ *</label><input type="number" id="p-price" class="form-input" value="${p.price}"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div class="form-group"><label>Stock Qty</label><input type="number" id="p-stock" class="form-input" value="${p.stock}"></div>
          <div class="form-group"><label>Unit</label>
            <select id="p-unit" class="form-input">
              ${unitOptions.map(u => `<option value="${u}" ${p.unit === u ? 'selected' : ''}>${UNIT_LABELS[u] || u}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label>Low Stock Alert At</label><input type="number" id="p-lowstock" class="form-input" value="${p.lowStockAt}"></div>
        <div class="form-group"><label>Image URL</label><input id="p-image" class="form-input" value="${esc(p.image || '')}" placeholder="https://..."></div>
        <div class="form-group"><label><input type="checkbox" id="p-published" ${p.isPublished ? 'checked' : ''}> Publish on public marketplace</label></div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="saveProduct()">${editingProduct ? 'Save' : 'Add Product'}</button>
        </div>
      </div>
    </div>`;

  if (window.onCategoryChange) window.onCategoryChange();
}

function onCategoryChange() {
  const cat = document.getElementById('p-category').value;
  const units = getUnitsForCategory(cat);
  const unitSel = document.getElementById('p-unit');
  const current = unitSel.value;
  unitSel.innerHTML = units.map(u => `<option value="${u}" ${current === u ? 'selected' : ''}>${UNIT_LABELS[u] || u}</option>`).join('');
  const hint = document.getElementById('unit-hint');
  if (hint) hint.textContent = cat ? `Suggested units for ${cat}: ${units.join(', ')}` : '';
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
  editingProduct = null;
}

function saveProduct() {
  const name = document.getElementById('p-name').value.trim();
  const price = Number(document.getElementById('p-price').value);
  if (!name || !price) return alert('Name and price are required.');

  const data = {
    name,
    description: document.getElementById('p-desc').value.trim(),
    category: document.getElementById('p-category').value || 'General',
    cost: Number(document.getElementById('p-cost').value || 0),
    price,
    stock: Number(document.getElementById('p-stock').value || 0),
    unit: document.getElementById('p-unit').value,
    lowStockAt: Number(document.getElementById('p-lowstock').value || 5),
    image: document.getElementById('p-image').value.trim(),
    isPublished: document.getElementById('p-published').checked,
    isAvailable: true
  };

  const all = DB.getProducts();
  if (editingProduct) {
    const idx = all.findIndex(p => p.id === editingProduct.id);
    all[idx] = { ...editingProduct, ...data, updatedAt: new Date().toISOString() };
  } else {
    all.push({ id: uid(), shopId: currentShop.id, ...data, createdAt: new Date().toISOString() });
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

if (window.location.pathname.endsWith('products.html')) {
  currentShop = initDashboard('products');
  if (currentShop) renderProducts();
}
