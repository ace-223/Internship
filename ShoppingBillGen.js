var DISCOUNT_THRESHOLD = 300;   
var DISCOUNT_RATE = 0.10;     

function money(amount) {
  return "GH₵ " + amount.toFixed(2);
}

function readItems() {
  var rows = document.querySelectorAll("tbody tr");
  var items = [];
  for (var i = 0; i < rows.length; i++) {
    var name = rows[i].querySelector(".item").textContent;
    var price = parseFloat(rows[i].querySelector(".price").dataset.price);
    var qty = parseInt(rows[i].querySelector(".item-quantity").value, 10);
    items.push({ name: name, price: price, qty: qty, lineTotal: price * qty });
  }
  return items;
}

function calculateSubtotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].lineTotal;   
  }
  return total;
}

function calculateDiscount(subtotal) {
  if (subtotal >= DISCOUNT_THRESHOLD) {
    return subtotal * DISCOUNT_RATE;
  }
  return 0;
}

function generateBill() {
  var items = readItems();
  var subtotal = calculateSubtotal(items);
  var bill = document.getElementById("bill");

  if (subtotal === 0) {
    bill.innerHTML = '<p class="empty">Your basket is empty. Set at least one quantity above 0.</p>';
    bill.className = "show";
    return;
  }

  var discount = calculateDiscount(subtotal);
  var finalTotal = subtotal - discount;

  var html = '<div class="rule-top"></div>';
  for (var i = 0; i < items.length; i++) {
    if (items[i].qty > 0) {
      html += '<div class="bill-row"><span>' + items[i].name + ' &times; ' + items[i].qty +
              '</span><span>' + money(items[i].lineTotal) + '</span></div>';
    }
  }

  html += '<div class="bill-row subtotal"><span>Subtotal</span><span>' + money(subtotal) + '</span></div>';

  if (discount > 0) {
    html += '<div class="bill-row discount"><span>Discount (' + (DISCOUNT_RATE * 100) + '%)</span><span>- ' + money(discount) + '</span></div>';
  }

  html += '<div class="bill-row total"><span>Total to pay</span><span>' + money(finalTotal) + '</span></div>';

  if (discount > 0) {
    html += '<p class="note">You saved ' + money(discount) + ' on this bill.</p>';
  } else {
    html += '<p class="note">Spend ' + money(DISCOUNT_THRESHOLD - subtotal) + ' more to get ' + (DISCOUNT_RATE * 100) + '% off.</p>';
  }

  bill.innerHTML = html;
  bill.className = "show";
}

var startingQty = [];
(function remember() {
  var inputs = document.querySelectorAll(".item-quantity");
  for (var i = 0; i < inputs.length; i++) { startingQty.push(inputs[i].value); }
})();

function resetQuantities() {
  var inputs = document.querySelectorAll(".item-quantity");
  for (var i = 0; i < inputs.length; i++) { inputs[i].value = startingQty[i]; }
  document.getElementById("bill").className = "";
}

document.getElementById("generate").addEventListener("click", generateBill);
document.getElementById("reset").addEventListener("click", resetQuantities);