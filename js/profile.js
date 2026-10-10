/* ============================================
   SHOP PROFILE EDITOR (with Image Upload)
   ============================================ */

const currentShop = initDashboard('profile');

if (currentShop) {
  let logoData = currentShop.logo || '';
  let bannerData = currentShop.banner || '';

  document.getElementById('content').innerHTML = `
    <div class="table-card" style="max-width:640px;padding:1.5rem;">
      <h2 style="margin-bottom:1.25rem;">🏪 Shop Profile</h2>

      <div class="form-group">
        <label>Shop Logo</label>
        <div id="logo-uploader"></div>
      </div>

      <div class="form-group">
        <label>Shop Banner (optional)</label>
        <div id="banner-uploader"></div>
      </div>

      <div class="form-group">
        <label>Shop Name *</label>
        <input id="s-name" class="form-input" value="${esc(currentShop.name)}">
      </div>

      <div class="form-group">
        <label>Category</label>
        <select id="s-category" class="form-input">
          <option value="">Select…</option>
          ${getCategoryOptions().replace(`value="${currentShop.category}"`, `value="${currentShop.category}" selected`)}
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
        <label>Address (optional)</label>
        <textarea id="s-address" class="form-input" rows="2" placeholder="Full shop address for customers">${esc(currentShop.address || '')}</textarea>
      </div>

      <button class="btn btn-primary btn-block mt-4" onclick="saveProfile()">Save Changes</button>
    </div>
  `;

  renderImageUploader('logo-uploader', logoData, (data) => { logoData = data; });
  renderImageUploader('banner-uploader', bannerData, (data) => { bannerData = data; });
}

function saveProfile() {
  const shops = DB.getShops();
  const idx = shops.findIndex(s => s.id === currentShop.id);
  if (idx < 0) return;

  const name = document.getElementById('s-name').value.trim();
  if (!name) return alert('Shop name is required.');

  shops[idx] = {
    ...shops[idx],
    name,
    category: document.getElementById('s-category').value || 'General',
    description: document.getElementById('s-desc').value.trim(),
    phone: document.getElementById('s-phone').value.trim(),
    serviceArea: document.getElementById('s-area').value.trim(),
    address: document.getElementById('s-address').value.trim(),
    logo: logoData,
    banner: bannerData,
    updatedAt: new Date().toISOString()
  };
  DB.saveShops(shops);
  alert('✅ Shop profile saved!');
  location.reload();
}
