/* ============================================
   SJS GOODNESS — UTILITY FUNCTIONS
   ============================================ */

// Format money in Indian style
function fmt(n) {
  return '₹' + Number(n || 0).toFixed(0);
}

// Today's date string
function today() {
  return new Date().toISOString().split('T')[0];
}

// Random ID
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Format date nicely
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN');
}

// Escape HTML to prevent injection
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Get query param from URL
function qp(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Redirect helper
function go(url) {
  window.location.href = url;
}

// Simple confirm + alert replacements
function toast(msg) {
  alert(msg);
}
