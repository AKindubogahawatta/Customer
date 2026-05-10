import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbCw_Zqp-aOch_wsFA_q_DR-1LNRc8cw8",
  authDomain: "shoe-shop-a0001.firebaseapp.com",
  projectId: "shoe-shop-a0001",
  storageBucket: "shoe-shop-a0001.firebasestorage.app",
  messagingSenderId: "136317985843",
  appId: "1:136317985843:web:c2ebdf2510ce8779542f46",
  measurementId: "G-D1W2PHKWMW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let cart = [];

onAuthStateChanged(auth, user => {
  currentUser = user;
});

window.openLoginPopup = function () {
  document.getElementById("loginPopup").style.display = "flex";
};

window.closeLoginPopup = function () {
  document.getElementById("loginPopup").style.display = "none";
};

window.register = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created successfully");
    closeLoginPopup();
  } catch (error) {
    alert(error.message);
  }
};

window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in successfully");
    closeLoginPopup();
  } catch (error) {
    alert(error.message);
  }
};

window.logout = async function () {
  try {
    await signOut(auth);
    alert("Logged out successfully");
  } catch (error) {
    alert(error.message);
  }
};

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
          <div class="price">£${Number(product.price).toFixed(2)}</div>
          <button class="add-btn" onclick='addToCart("${doc.id}", ${JSON.stringify(product)})'>
            Add to Cart
          </button>
        </div>
      </div>
    `;
  });
});

window.addToCart = function (id, product) {
  cart.push({
    id,
    name: product.name,
    price: Number(product.price),
    quantity: 1
  });

  displayCart();
};

function displayCart() {
  const cartItems = document.getElementById("cartItems");
  const totalSpan = document.getElementById("total");

  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name} - £${item.price.toFixed(2)}</span>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalSpan.innerText = total.toFixed(2);
}

window.removeItem = function (index) {
  cart.splice(index, 1);
  displayCart();
};

window.placeOrder = async function () {
  if (!currentUser) {
    alert("Please login before placing an order");
    openLoginPopup();
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    await addDoc(collection(db, "orders"), {
      userId: currentUser.uid,
      customerEmail: currentUser.email,
      items: cart,
      total: total,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    cart = [];
    displayCart();
    alert("Order placed successfully");
  } catch (error) {
    alert(error.message);
  }
};