// =====================================================================
// Amanda's Goodies — order form
//
// To mark an item as temporarily unavailable, change `available: true`
// to `available: false` on its line below. The item will disappear from
// the order form (and customers can't order it) until you flip it back.
//
// To change a price, edit the `price` value.
// =====================================================================

const ITEMS = [
  { id: 'monster_6',          name: 'Monster Cookies (6-pack)',           price: 3.50, available: true },
  { id: 'monster_18',         name: 'Monster Cookies (18-pack)',          price: 9.00, available: true },
  { id: 'chip_6',             name: 'Chocolate Chip Cookies (6-pack)',    price: 2.50, available: true },
  { id: 'chip_18',            name: 'Chocolate Chip Cookies (18-pack)',   price: 6.00, available: true },
  { id: 'blueberry_dozen',    name: 'Blueberry Muffins (dozen)',          price: 7.00, available: true },
  { id: 'choc_chip_dozen',    name: 'Chocolate Chip Muffins (dozen)',     price: 7.00, available: true },
  { id: 'cinnamon_roll',      name: 'Cinnamon Rolls (per roll)',          price: 1.00, available: true },
  { id: 'banana_loaf',        name: 'Banana Bread (full loaf)',           price: 7.00, available: true },
  { id: 'banana_mini',        name: 'Banana Bread (mini loaf)',           price: 1.50, available: true },
];

// Web3Forms access key. https://web3forms.com
const WEB3FORMS_ACCESS_KEY = 'cff0009c-ae39-4f94-9413-9be7e6b37857';

// ---------------------------------------------------------------------

const fmt = (n) => '$' + n.toFixed(2);

const form         = document.getElementById('order-form');
const itemsList    = document.getElementById('items-list');
const reviewLines  = document.getElementById('review-lines');
const reviewCount  = document.getElementById('review-count');
const reviewTotal  = document.getElementById('review-total');
const formError    = document.getElementById('form-error');
const submitBtn    = document.getElementById('order-submit');
const successPanel = document.getElementById('order-success');
const successSummary = document.getElementById('success-summary');

function renderItems() {
  itemsList.innerHTML = '';
  ITEMS.filter((i) => i.available).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <span class="item-name">${item.name}</span>
        <span class="item-price">${fmt(item.price)}</span>
      </div>
      <div class="item-qty">
        <button type="button" class="qty-btn" data-act="dec" aria-label="Decrease ${item.name}">−</button>
        <input type="number" name="qty_${item.id}" min="0" step="1" value="0"
               inputmode="numeric" data-item-id="${item.id}" />
        <button type="button" class="qty-btn" data-act="inc" aria-label="Increase ${item.name}">+</button>
      </div>
    `;
    itemsList.appendChild(row);
  });
}

function getQuantities() {
  return ITEMS.filter((i) => i.available).map((item) => {
    const input = itemsList.querySelector(`input[data-item-id="${item.id}"]`);
    const qty = Math.max(0, parseInt(input.value, 10) || 0);
    return { ...item, qty, subtotal: qty * item.price };
  });
}

function updateReview() {
  const lines = getQuantities().filter((l) => l.qty > 0);
  reviewLines.innerHTML = '';
  if (lines.length === 0) {
    const li = document.createElement('li');
    li.className = 'review-empty';
    li.textContent = 'No items selected yet.';
    reviewLines.appendChild(li);
  } else {
    lines.forEach((l) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${l.qty} × ${l.name}</span>
        <span>${fmt(l.subtotal)}</span>
      `;
      reviewLines.appendChild(li);
    });
  }
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  reviewCount.textContent = count;
  reviewTotal.textContent = fmt(total);
}

itemsList.addEventListener('input', updateReview);
itemsList.addEventListener('click', (e) => {
  const btn = e.target.closest('.qty-btn');
  if (!btn) return;
  const input = btn.parentElement.querySelector('input[type="number"]');
  let v = parseInt(input.value, 10) || 0;
  v = btn.dataset.act === 'inc' ? v + 1 : Math.max(0, v - 1);
  input.value = v;
  updateReview();
});

function buildOrderSummary(lines, total) {
  const rows = lines.map((l) => `  - ${l.qty} × ${l.name} @ ${fmt(l.price)} = ${fmt(l.subtotal)}`);
  return rows.join('\n') + `\n\n  Total: ${fmt(total)}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const lines = getQuantities().filter((l) => l.qty > 0);
  if (lines.length === 0) {
    formError.textContent = 'Please add at least one item to your order.';
    formError.hidden = false;
    formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!form.checkValidity()) {
    formError.textContent = 'Please fill in your name, phone, email, and pickup method.';
    formError.hidden = false;
    form.reportValidity();
    return;
  }

  const fd = new FormData(form);
  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const orderSummary = buildOrderSummary(lines, total);

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `New order from ${fd.get('name')} — ${itemCount} items, ${fmt(total)}`,
    from_name: "Amanda's Goodies order form",
    name:           fd.get('name'),
    phone:          fd.get('phone'),
    email:          fd.get('email'),
    receive_method: fd.get('receive_method'),
    needed_by:      fd.get('needed_by') || '(not specified)',
    notes:          fd.get('notes') || '(none)',
    order_summary:  orderSummary,
    item_count:     itemCount,
    order_total:    fmt(total),
    replyto:        fd.get('email'),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Submission failed');
    }
    form.hidden = true;
    successSummary.innerHTML = `
      <ul>${lines.map((l) => `<li>${l.qty} × ${l.name} &mdash; ${fmt(l.subtotal)}</li>`).join('')}</ul>
      <p class="success-total"><strong>Total: ${fmt(total)}</strong> (paid in person)</p>
    `;
    successPanel.hidden = false;
    successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    formError.textContent = `Something went wrong sending your order: ${err.message}. Please try again or text Amanda directly.`;
    formError.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Order';
  }
});

renderItems();
updateReview();
