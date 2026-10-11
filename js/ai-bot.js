/* ============================================
   SJS GOODNESS — REAL AI HELPER (Groq via Worker)
   ============================================ */

const AIBot = {
  history: [],
  isBusy: false,

  init() {
    document.body.insertAdjacentHTML('beforeend', `
      <button class="ai-bot-btn" id="ai-bot-open" title="Ask for help">💬</button>
      <div id="ai-bot-root"></div>
    `);
    document.getElementById('ai-bot-open').onclick = () => this.open();
  },

  open() {
    const root = document.getElementById('ai-bot-root');
    if (root.innerHTML) { root.innerHTML = ''; return; }

    root.innerHTML = `
      <div class="ai-bot-panel">
        <div class="ai-bot-header">
          <span>💬 SJS AI Helper</span>
          <button class="ai-bot-close" onclick="document.getElementById('ai-bot-root').innerHTML=''">×</button>
        </div>
        <div class="ai-bot-messages" id="ai-msgs">
          <div class="ai-msg bot">Hi! I'm your AI assistant. Ask me anything about your shop, products, pricing, marketing, or customers.</div>
        </div>
        <form class="ai-bot-input" id="ai-form">
          <input id="ai-input" placeholder="Ask me anything…" autocomplete="off">
          <button type="submit" id="ai-send">➤</button>
        </form>
      </div>
    `;

    document.getElementById('ai-form').onsubmit = (e) => {
      e.preventDefault();
      this.submit();
    };
    setTimeout(() => document.getElementById('ai-input').focus(), 100);
  },

  submit() {
    const input = document.getElementById('ai-input');
    const q = input.value.trim();
    if (!q || this.isBusy) return;
    input.value = '';
    this.push('user', esc(q));
    this.ask(q);
  },

  push(role, html) {
    const msgs = document.getElementById('ai-msgs');
    if (!msgs) return;
    const id = 'msg-' + Math.random().toString(36).slice(2, 8);
    msgs.insertAdjacentHTML('beforeend', `<div class="ai-msg ${role}" id="${id}">${html}</div>`);
    msgs.scrollTop = msgs.scrollHeight;
    return id;
  },

  buildContext() {
    let ctx = 'You are the AI helper for "SJS Goodness", a local marketplace app in Puducherry, India.\n';
    ctx += 'You help shop owners manage their business: products, pricing, orders, customers, and marketing.\n';
    ctx += 'Be concise, friendly, and practical. Use ₹ for prices. Keep replies under 150 words.\n\n';

    const page = window.location.pathname.split('/').pop() || 'index.html';
    ctx += `Current page: ${page}\n`;

    if (typeof Auth !== 'undefined' && Auth.currentShop) {
      const shop = Auth.currentShop();
      if (shop) {
        ctx += `Logged-in shop: ${shop.name} (${shop.category || 'General'}) in ${shop.serviceArea || 'Puducherry'}\n`;

        if (typeof DB !== 'undefined' && DB.getProductsForShop) {
          const products = DB.getProductsForShop(shop.id);
          if (products.length > 0) {
            ctx += `Shop has ${products.length} products. Examples:\n`;
            products.slice(0, 5).forEach(p => {
              ctx += `- ${p.name} @ ₹${p.price} (${p.stock} ${p.unit} in stock)\n`;
            });
          }

          const orders = DB.getOrdersForShop(shop.id);
          if (orders.length > 0) {
            const revenue = orders.filter(o => o.orderStatus !== 'cancelled').reduce((s, o) => s + o.total, 0);
            ctx += `Recent orders: ${orders.length}. Total revenue: ₹${revenue}.\n`;
          }
        }
      }
    }

    return ctx;
  },

  async ask(question) {
    if (this.isBusy) return;
    this.isBusy = true;
    const sendBtn = document.getElementById('ai-send');
    if (sendBtn) sendBtn.disabled = true;

    const thinkingId = this.push('bot', '<span class="ai-thinking">Thinking…</span>');

    try {
      const messages = [
        { role: 'system', content: this.buildContext() },
        ...this.history.slice(-10),
        { role: 'user', content: question }
      ];

      const WORKER_URL = 'https://sjs-ai-proxy.sjspokeflare.workers.dev/';

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error('API ' + res.status + ': ' + errText.slice(0, 200));
      }

      const data = await res.json();
      const reply = data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : 'Sorry, I did not get a response.';

      const el = document.getElementById(thinkingId);
      if (el) el.innerHTML = this.formatReply(reply);

      this.history.push({ role: 'user', content: question });
      this.history.push({ role: 'assistant', content: reply });

      const msgs = document.getElementById('ai-msgs');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;

    } catch (err) {
      console.error('AI error:', err);
      const el = document.getElementById(thinkingId);
      if (el) el.innerHTML = '⚠️ Could not reach AI. Try again in a moment.';
    } finally {
      this.isBusy = false;
      if (sendBtn) sendBtn.disabled = false;
    }
  },

  formatReply(text) {
    return esc(text).replace(/\n/g, '<br>');
  }
};

if (typeof DB !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AIBot.init());
  } else {
    AIBot.init();
  }
}
