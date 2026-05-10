import { auth, db } from "./firebase.js";

import {
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.innerText = cart.length;
  }
}

onAuthStateChanged(auth, user => {
  const ordersContainer = document.getElementById("ordersContainer");

  if (!user) {
    ordersContainer.innerHTML = `
      <p class="empty">Please login to view your orders.</p>
      <button onclick="openLoginPopup()" class="checkout-btn">Login</button>
    `;
    return;
  }

  const q = query(
    collection(db, "orders"),
    where("userId", "==", user.uid)
  );

  onSnapshot(q, snapshot => {
    ordersContainer.innerHTML = "";

    if (snapshot.empty) {
      ordersContainer.innerHTML = `<p class="empty">No orders found.</p>`;
      return;
    }

    snapshot.forEach(doc => {
      const order = doc.data();

      const itemsHtml = order.items.map(item => {
        return `
          <li>
            ${item.name} - £${Number(item.price).toFixed(2)} x ${item.quantity}
          </li>
        `;
      }).join("");

      ordersContainer.innerHTML += `
        <div class="order-card">
          <h3>Order ID: ${doc.id}</h3>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Total:</strong> £${Number(order.total).toFixed(2)}</p>
          <ul>${itemsHtml}</ul>
        </div>
      `;
    });
  }, error => {
    console.error(error);
    ordersContainer.innerHTML = `<p class="empty">${error.message}</p>`;
  });
});

updateCartCount();