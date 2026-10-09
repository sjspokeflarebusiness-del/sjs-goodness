/* ============================================
   SJS GOODNESS — MARKETPLACE HOMEPAGE
   ============================================ */

(function () {
  const searchInput = document.getElementById('search');
  const grid = document.getElementById('shops-grid');
  const empty = document.getElementById('empty-state');
  const title = document.getElementById('shops-title');

  function render(searchTerm = '') {
    const shops = DB.getShops().filter(s => s.isApproved);
    const term = searchTerm.toLowerCase().trim();

    const filtered = shops.filter(s => {
      if (!term) return true;
      return s.name.toLowerCase().includes(term) ||
             (s.category || '').toLowerCase().includes(term) ||
             (s.description || '').toLowerCase().includes(term);
    });

    title.textContent = `Shops (${filtered.length})`;

    if (filtered.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    grid.innerHTML = filtered.map(shop => {
      const productCount = DB.getProductsForShop(shop.id).filter(p => p.isPublished && p.isAvailable).length;
      const avatar = shop.logo
        ? `<img src="${esc(shop.logo)}" class="shop-card-avatar" alt="">`
        : `<div class="shop-card-avatar">${esc(shop.name[0])}</div>`;
      return `
        <a href="shop.html?id=${esc(shop.id)}" class="shop-card">
          <div class="shop-card-banner">${avatar}</div>
          <div class="shop-card-body">
            <h3>${esc(shop.name)}</h3>
            <div class="meta">${esc(shop.category)} · ${esc(shop.serviceArea)}</div>
            <div class="desc">${esc(shop.description)}</div>
            <div class="products-count">${productCount} products available →</div>
          </div>
        </a>
      `;
    }).join('');
  }

  searchInput.addEventListener('input', e => render(e.target.value));
  render();
})();
