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
        <button class="btn btn-primary mt-3" onclick="openProductForm()">Add Your First Product</button>
      </div>`;
    return;
  }

  c.innerHTML = `
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Product</th><th>Cost</th><th>Price</th><th>Margin</th>
            <th>Stock</th><th>Status</th><th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => {
            const margin = p.price - p.cost;
            const pct = p.price > 0 ? ((margin / p.price) * 100).toFixed(0) : 0;
            const low = p.stock <= (p.lowStockAt || 5);
            return `
              <tr>
                <td><strong>${esc(p.name)}</strong><br><span class="text-xs text-muted">${esc(p.category || '—')}</span></td>
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
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openProductForm(id) {
  editingProduct = id ? DB.getProducts().find(p => p.id === id) : null;
  const p = editingProduct || { name: '', description: '', category: '', price: '', cost: '', stock: '', unit: 'kg', image: '', lowStockAt: 5, isPublished: true, isAvailable: true };

  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>${editingProduct ? 'Edit Product' : 'Add Product'}</h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="form-group"><label>Product Name *</label><input id="p-name" class="form-input" value="${esc(p.name)}"></div>
        <div class="form-group"><label>Description</label><input id="p-desc" class="form-input" value="${esc(p.description || '')}"></div>
        <div class="form-group"><label>Category</label><input id="p-category" class="form-input" value="${esc(p.category || '')}"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div class="form-group"><label>Purchase Cost ₹</label><input type="number" id="p-cost" class="form-input" value="${p.cost}"></div>
          <div class="form-group"><label>Selling Price ₹ *</label><input type="number" id="p-price" class="form-input" value="${p.price}"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div class="form-group"><label>Stock Qty</label><input type="number" id="p-stock" class="form-input" value="${p.stock}"></div>
          <div class="form-group"><label>Unit</label><input id="p-unit" class="form-input" value="${esc(p.unit)}"></div>
        </div>
        <div class="form-group"><label>Low Stock Alert At</label><input type="number" id="p-lowstock" class="form-input" value="${p.lowStockAt}"></div>
        <div class="form-group"><label>Image URL</label><input id="p-image" class="form-input" value="${esc(p.image || '')}"></div>
        <div class="form-group"><label><input type="checkbox" id="p-published" ${p.isPublished ? 'checked' : ''}> Publish on public marketplace</label></div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="saveProduct()">${editingProduct ? 'Save Changes' : 'Add Product'}</button>
        </div>
      </div>
    </div>`;
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
    category: document.getElementById('p-category').value.trim(),
    cost: Number(document.getElementById('p-cost').value || 0),
    price,
    stock: Number(document.getElementById('p-stock').value || 0),
    unit: document.getElementById('p-unit').value.trim() || 'pc',
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
    all.push({
      id: uid(), shopId: currentShop.id, ...data,
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

currentShop = initDashboard('products');
if (currentShop) renderProducts();
