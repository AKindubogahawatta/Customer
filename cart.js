import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.innerText = getCart().length;
  }
}

function displayCart() {
  const cartItems = document.getElementById("cartItems");
  const totalSpan = document.getElementById("total");

  const cart = getCart();

  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty">Your cart is empty.</p>`;
  }

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>£${item.price.toFixed(2)}</p>
          <p>Quantity: ${item.quantity}</p>
        </div>

        <div>
          <button onclick="increaseQty(${index})">+</button>
          <button onclick="decreaseQty(${index})">-</button>
          <button onclick="removeItem(${index})" class="remove">Remove</button>
        </div>
      </div>
    `;
  });

  totalSpan.innerText = total.toFixed(2);
  updateCartCount();
}

window.increaseQty = function (index) {
  const cart = getCart();
  cart[index].quantity += 1;
  saveCart(cart);
  displayCart();
};

window.decreaseQty = function (index) {
  const cart = getCart();

  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }

  saveCart(cart);
  displayCart();
};

window.removeItem = function (index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  displayCart();
};

window.placeOrder = async function () {
  const user = auth.currentUser;

  if (!user) {
    alert("Please login before placing order");
    openLoginPopup();
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  await addDoc(collection(db, "orders"), {
    userId: user.uid,
    customerEmail: user.email,
    items: cart,
    total,
    status: "Pending",
    createdAt: serverTimestamp()
  });

  localStorage.removeItem("cart");
  displayCart();

  alert("Order placed successfully");
  window.location.href = "orders.html";
};

displayCart();