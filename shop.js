import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.innerText = cart.length;
  }
}

onSnapshot(collection(db, "products"), snapshot => {
  const productsContainer = document.getElementById("productsContainer");
  productsContainer.innerHTML = "";

  snapshot.forEach(doc => {
    const product = doc.data();

    productsContainer.innerHTML += `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <h4>£${Number(product.price).toFixed(2)}</h4>
          <button onclick='addToCart("${doc.id}", ${JSON.stringify(product)})'>
            Add to Cart
          </button>
        </div>
      </div>
    `;
  });
});

window.addToCart = function (id, product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  alert("Added to cart");
};

updateCartCount();