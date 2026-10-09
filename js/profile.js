/* ============================================
   SHOP PROFILE EDITOR
   ============================================ */

const currentShop = initDashboard('profile');

if (currentShop) {
  const catOptions = getCategoryOptions();

  document.getElementById('content').innerHTML = `
    <div class="table-card" style="max-width:640px;padding:1.5rem;">
      <h2 style="margin-bottom:1.25rem;">🏪 Shop Profile</h2>
      <div class="form-group">
        <label>Shop Name</label>
        <input id="s-name" class="form-input" value="${esc(currentShop.name)}">
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="s-category" class="form-input">
          <option value="">Select…</option>
          ${catOptions.replace(`value="${currentShop.category}"`, `value="${currentShop.category}" selected`)}
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="s-desc" class="form-input" rows="3">${esc(currentShop.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input id="s-phone" class="form-input" value="${esc(currentShop.phone || '')}">
      </div>
      <div class="form-group">
        <label>Service Area</label>
        <input id="s-area" class="form-input" value="${esc(currentShop.serviceArea || 'Puducherry')}">
      </div>
      <div class="form-group">
        <label>Logo Image URL</label>
        <input id="s-logo" class="form-input" value="${esc(currentShop.logo || '')}" placeholder="https://...">
        <div class="category-hint">Paste any public image URL. Leave empty to use your shop's first letter.</div>
      </div>
      <button class="btn btn-primary btn-block mt-4" onclick="saveProfile()">Save Changes</button>
    </div>
  `;
}

function saveProfile() {
  const shops = DB.getShops();
  const idx = shops.findIndex(s => s.id === currentShop.id);
  if (idx < 0) return;
  shops[idx] = {
    ...shops[idx],
    name: document.getElementById('s-name').value.trim(),
    category: document.getElementById('s-category').value || 'General',
    description: document.getElementById('s-desc').value.trim(),
    phone: document.getElementById('s-phone').value.trim(),
    serviceArea: document.getElementById('s-area').value.trim(),
    logo: document.getElementById('s-logo').value.trim(),
    updatedAt: new Date().toISOString()
  };
  DB.saveShops(shops);
  alert('✅ Shop profile saved!');
  location.reload();
}
