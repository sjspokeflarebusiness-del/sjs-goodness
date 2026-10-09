/* ============================================
   EXPENSES PAGE
   ============================================ */

let expShop;

if (window.location.pathname.endsWith('expenses.html')) {
  expShop = initDashboard('expenses');
  if (expShop) renderExpenses();
}

function renderExpenses() {
  const expenses = DB.getExpensesForShop(expShop.id);
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const c = document.getElementById('content');

  if (expenses.length === 0) {
    c.innerHTML = '<div class="empty-state">No expenses recorded yet.</div>';
    return;
  }

  c.innerHTML = `
    <div class="metrics-grid">
      <div class="metric metric-orange"><div class="metric-label">Total Expenses</div><div class="metric-value">${fmt(total)}</div></div>
      <div class="metric metric-blue"><div class="metric-label">Entries</div><div class="metric-value">${expenses.length}</div></div>
    </div>
    <div class="table-card">
      <table class="data-table">
        <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Amount</th><th class="text-right"></th></tr></thead>
        <tbody>${expenses.slice().reverse().map(e => `
          <tr>
            <td><strong>${esc(e.title)}</strong></td>
            <td>${esc(e.category || '—')}</td>
            <td class="text-muted">${esc(e.date)}</td>
            <td><strong>${fmt(e.amount)}</strong></td>
            <td class="text-right"><button class="btn btn-danger btn-sm" onclick="deleteExpense('${e.id}')">Delete</button></td>
          </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function openExpenseForm() {
  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Add Expense</h2>
          <button class="modal-close" onclick="document.getElementById('modal-root').innerHTML=''">×</button>
        </div>
        <div class="form-group"><label>Title *</label><input id="e-title" class="form-input"></div>
        <div class="form-group"><label>Category</label>
          <select id="e-category" class="form-input">
            <option>Stock Purchase</option><option>Packaging</option><option>Transport</option>
            <option>Rent</option><option>Utilities</option><option>Marketing</option><option>Other</option>
          </select>
        </div>
        <div class="form-group"><label>Amount ₹ *</label><input type="number" id="e-amount" class="form-input"></div>
        <div class="form-group"><label>Date</label><input type="date" id="e-date" class="form-input" value="${today()}"></div>
        <div class="form-group"><label>Notes</label><input id="e-notes" class="form-input"></div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
          <button class="btn btn-primary" onclick="saveExpense()">Save</button>
        </div>
      </div>
    </div>`;
}

function saveExpense() {
  const title = document.getElementById('e-title').value.trim();
  const amount = Number(document.getElementById('e-amount').value);
  if (!title || !amount) return alert('Title and amount required.');
  const all = DB.getExpenses();
  all.push({
    id: uid(), shopId: expShop.id,
    title, amount,
    category: document.getElementById('e-category').value,
    date: document.getElementById('e-date').value,
    notes: document.getElementById('e-notes').value.trim(),
    createdAt: new Date().toISOString()
  });
  DB.saveExpenses(all);
  document.getElementById('modal-root').innerHTML = '';
  renderExpenses();
}

function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  DB.saveExpenses(DB.getExpenses().filter(e => e.id !== id));
  renderExpenses();
}
