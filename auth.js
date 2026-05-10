import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.length;

  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.innerText = count;
  }
}

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
  await signOut(auth);
  alert("Logged out");
  window.location.href = "index.html";
};

window.toggleAccountMenu = function () {
  const menu = document.getElementById("accountDropdown");
  menu.classList.toggle("show");
};

onAuthStateChanged(auth, user => {
  const authArea = document.getElementById("authArea");

  if (!authArea) return;

  if (user) {
    authArea.innerHTML = `
      <div class="account">
        <button onclick="toggleAccountMenu()" class="account-btn">👤</button>

        <div id="accountDropdown" class="dropdown">
          <p>${user.email}</p>
          <a href="orders.html">My Orders</a>
          <button onclick="logout()">Logout</button>
        </div>
      </div>
    `;
  } else {
    authArea.innerHTML = `
      <button onclick="openLoginPopup()" class="login-small">Login</button>
      <button onclick="openLoginPopup()" class="register-small">Register</button>
    `;
  }
});

updateCartCount();