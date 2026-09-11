'use strict';

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function orderTotalFromItems(items, delivery) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return subtotal + delivery;
}

let counter = 0;
function nextId(prefix) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

function orderCode() {
  return `TT-${Math.floor(10000 + Math.random() * 89999)}`;
}

module.exports = { formatMoney, orderTotalFromItems, nextId, orderCode };
