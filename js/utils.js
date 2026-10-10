/* ============================================
   UTILITY FUNCTIONS
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

// ============ IMAGE UPLOAD + COMPRESSION ============

function compressImage(file, maxWidth = 500, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderImageUploader(containerId, currentValue, onImage) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const preview = currentValue
    ? `<img src="${currentValue}" style="width:100%;height:140px;object-fit:cover;border-radius:10px;">`
    : `<div style="width:100%;height:140px;background:var(--gray-100);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--gray-500);font-size:2rem;">📷</div>`;

  container.innerHTML = `
    <div style="position:relative;">
      ${preview}
      <input type="file" accept="image/*" id="${containerId}_file" style="display:none;">
      <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
        <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('${containerId}_file').click()">
          📁 ${currentValue ? 'Change' : 'Upload Image'}
        </button>
        ${currentValue ? `<button type="button" class="btn btn-danger btn-sm" id="${containerId}_remove">Remove</button>` : ''}
      </div>
      <div style="font-size:0.72rem;color:var(--gray-500);margin-top:0.35rem;">Images auto-compress. Max ~40KB each.</div>
    </div>
  `;

  document.getElementById(containerId + '_file').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      onImage(dataUrl);
      renderImageUploader(containerId, dataUrl, onImage);
    } catch (err) {
      alert('Could not process image.');
    }
  };

  const removeBtn = document.getElementById(containerId + '_remove');
  if (removeBtn) {
    removeBtn.onclick = () => {
      onImage('');
      renderImageUploader(containerId, '', onImage);
    };
  }
}

// ============ PRODUCT IMAGE HELPER ============
function productImageTag(p, extraClass) {
  extraClass = extraClass || 'product-img';
  if (p && p.image && p.image.trim()) {
    return `<img src="${esc(p.image)}" class="${extraClass}" alt="${esc(p.name || '')}" onerror="this.outerHTML='<div class=\\'product-img-fallback\\'>🛍️</div>'">`;
  }
  const icons = {
    'Sugars': '🍬', 'Seeds & Nuts': '🥜', 'Fruits': '🍎', 'Vegetables': '🥕',
    'Drinks': '🥤', 'Water Bottles': '💧', 'Snacks': '🍪', 'Dairy': '🥛',
    'Spices': '🌶️', 'Grains & Rice': '🌾', 'Oils': '🫒', 'Bakery': '🍞',
    'Household': '🏠', 'Personal Care': '🧴', 'Medicines': '💊',
    'Stationery': '✏️', 'Electronics': '🔌', 'Clothing': '👕',
    'Groceries': '🛒', 'General': '📦'
  };
  const emoji = (p && icons[p.category]) || '🛍️';
  return `<div class="product-img-fallback">${emoji}</div>`;
}

// ============ THEME ============
function applyTheme() {
  if (typeof DB === 'undefined') return;
  const theme = DB.getTheme();
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
}
function toggleTheme() {
  if (typeof DB === 'undefined') return;
  const next = DB.getTheme() === 'dark' ? 'light' : 'dark';
  DB.setTheme(next);
  applyTheme();
}

// Run after DOM + all scripts ready
if (typeof DB !== 'undefined') {
  applyTheme();
} else {
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof DB !== 'undefined') applyTheme();
  });
}
