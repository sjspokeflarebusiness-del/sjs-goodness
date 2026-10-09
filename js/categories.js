/* ============================================
   SJS GOODNESS — SMART CATEGORIES + UNITS
   ============================================ */

const CATEGORIES = {
  'Sugars':            { units: ['kg', 'g'],  icon: '🍬' },
  'Seeds & Nuts':      { units: ['kg', 'g'],  icon: '🥜' },
  'Fruits':            { units: ['kg', 'g', 'piece'], icon: '🍎' },
  'Vegetables':        { units: ['kg', 'g'], icon: '🥕' },
  'Drinks':            { units: ['L', 'ml'],  icon: '🥤' },
  'Water Bottles':     { units: ['piece', 'pack'], icon: '💧' },
  'Snacks':            { units: ['piece', 'pack'], icon: '🍪' },
  'Dairy':             { units: ['L', 'ml', 'g'], icon: '🥛' },
  'Spices':            { units: ['g', 'kg'], icon: '🌶️' },
  'Grains & Rice':     { units: ['kg', 'g'], icon: '🌾' },
  'Oils':              { units: ['L', 'ml'], icon: '🫒' },
  'Bakery':            { units: ['piece', 'pack'], icon: '🍞' },
  'Household':         { units: ['piece', 'pack'], icon: '🏠' },
  'Personal Care':     { units: ['piece', 'ml', 'g'], icon: '🧴' },
  'Medicines':         { units: ['piece', 'strip'], icon: '💊' },
  'Stationery':        { units: ['piece', 'pack'], icon: '✏️' },
  'Electronics':       { units: ['piece'], icon: '🔌' },
  'Clothing':          { units: ['piece'], icon: '👕' },
  'Groceries':         { units: ['kg', 'g', 'piece', 'L'], icon: '🛒' },
  'General':           { units: ['piece', 'kg', 'L'], icon: '📦' }
};

const UNIT_LABELS = {
  kg: 'kg (kilogram)',
  g: 'g (gram)',
  L: 'L (litre)',
  ml: 'ml (millilitre)',
  piece: 'piece',
  pack: 'pack',
  strip: 'strip',
  box: 'box'
};

function getUnitsForCategory(cat) {
  return (CATEGORIES[cat] && CATEGORIES[cat].units) || ['piece', 'kg', 'L'];
}

function getCategoryOptions() {
  return Object.keys(CATEGORIES).map(k => `<option value="${k}">${CATEGORIES[k].icon} ${k}</option>`).join('');
}
