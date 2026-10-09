/* ============================================
   SJS GOODNESS — UTILITY FUNCTIONS
   ============================================ */

function fmt(n) { return '₹' + Number(n || 0).toFixed(0); }
function today() { return new Date().toISOString().split('T')[0]; }
function uid() { return Math.random().toString(36).slice(2, 10); }

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN');
}
function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 604800) return Math.floor(s / 86400) + 'd ago';
  return fmtDate(iso);
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function qp(name) { return new URLSearchParams(window.location.search).get(name); }
function go(url) { window.location.href = url; }

// Fallback image when product image is broken or empty
function productImageTag(p, extraClass = 'product-img') {
  if (p.image && p.image.trim()) {
    return `<img src="${esc(p.image)}" class="${extraClass}" alt="${esc(p.name)}" onerror="this.outerHTML='<div class=\\'product-img-fallback\\'>🛍️</div>'">`;
  }
  // Pick emoji based on category
  const icons = {
    'Sugars': '🍬', 'Seeds & Nuts': '🥜', 'Fruits': '🍎', 'Vegetables': '🥕',
    'Drinks': '🥤', 'Water Bottles': '💧', 'Snacks': '🍪', 'Dairy': '🥛',
    'Spices': '🌶️', 'Grains & Rice': '🌾', 'Oils': '🫒', 'Bakery': '🍞',
    'Household': '🏠', 'Personal Care': '🧴', 'Medicines': '💊',
    'Stationery': '✏️', 'Electronics': '🔌', 'Clothing': '👕',
    'Groceries': '🛒', 'General': '📦'
  };
  const emoji = icons[p.category] || '🛍️';
  return `<div class="product-img-fallback">${emoji}</div>`;
}
