import {
  auth,
  db
} from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/*
|--------------------------------------------------------------------------
| Local Storage configuration
|--------------------------------------------------------------------------
*/

const CART_STORAGE_KEY = "shoeShopCart";

/*
|--------------------------------------------------------------------------
| HTML elements
|--------------------------------------------------------------------------
*/

const cartItemsContainer =
  document.getElementById("cartItems");

const totalElement =
  document.getElementById("total");

const subtotalElement =
  document.getElementById("subtotal");

const summaryItemCount =
  document.getElementById("summaryItemCount");

const cartCountElement =
  document.getElementById("cartCount");

const placeOrderButton =
  document.getElementById("placeOrderButton");

const cartNotification =
  document.getElementById("cartNotification");

const mobileMenuButton =
  document.getElementById("mobileMenuButton");

const customerNavigation =
  document.getElementById("customerNavigation");

/*
|--------------------------------------------------------------------------
| Read cart
|--------------------------------------------------------------------------
*/

function getCart() {
  try {
    const storedCart =
      localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return [];
    }

    const parsedCart =
      JSON.parse(storedCart);

    return Array.isArray(parsedCart)
      ? parsedCart
      : [];
  } catch (error) {
    console.error(
      "Unable to read cart:",
      error
    );

    return [];
  }
}

/*
|--------------------------------------------------------------------------
| Save cart
|--------------------------------------------------------------------------
*/

function saveCart(cart) {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );
  } catch (error) {
    console.error(
      "Unable to save cart:",
      error
    );

    showNotification(
      "The cart could not be saved.",
      true
    );
  }
}

/*
|--------------------------------------------------------------------------
| Calculate cart item quantity
|--------------------------------------------------------------------------
*/

function getTotalItemQuantity(cart) {
  return cart.reduce(
    (totalQuantity, item) => {
      const quantity =
        Number(item.quantity || 1);

      return totalQuantity + quantity;
    },
    0
  );
}

/*
|--------------------------------------------------------------------------
| Calculate cart total
|--------------------------------------------------------------------------
*/

function calculateCartTotal(cart) {
  return cart.reduce(
    (total, item) => {
      const price =
        Number(item.price || 0);

      const quantity =
        Number(item.quantity || 1);

      return total + price * quantity;
    },
    0
  );
}

/*
|--------------------------------------------------------------------------
| Update navigation cart count
|--------------------------------------------------------------------------
*/

function updateCartCount() {
  const cart = getCart();

  const totalQuantity =
    getTotalItemQuantity(cart);

  if (cartCountElement) {
    cartCountElement.textContent =
      totalQuantity;
  }
}

/*
|--------------------------------------------------------------------------
| Display cart
|--------------------------------------------------------------------------
*/

function displayCart() {
  const cart = getCart();

  cartItemsContainer.innerHTML = "";

  const total =
    calculateCartTotal(cart);

  const totalQuantity =
    getTotalItemQuantity(cart);

  totalElement.textContent =
    total.toFixed(2);

  if (subtotalElement) {
    subtotalElement.textContent =
      total.toFixed(2);
  }

  if (summaryItemCount) {
    summaryItemCount.textContent =
      `${totalQuantity} ${
        totalQuantity === 1
          ? "item"
          : "items"
      }`;
  }

  updateCartCount();

  if (cart.length === 0) {
    displayEmptyCart();

    placeOrderButton.disabled = true;
    placeOrderButton.textContent =
      "Your Cart Is Empty";

    return;
  }

  placeOrderButton.disabled = false;
  placeOrderButton.textContent =
    "Place Order";

  cart.forEach((item, index) => {
    const cartItem =
      createCartItem(item, index);

    cartItemsContainer.appendChild(
      cartItem
    );
  });
}

/*
|--------------------------------------------------------------------------
| Display empty cart
|--------------------------------------------------------------------------
*/

function displayEmptyCart() {
  cartItemsContainer.innerHTML = `
    <div class="empty-cart">

      <div class="empty-cart-icon">
        🛒
      </div>

      <h2>Your cart is empty</h2>

      <p>
        Browse our shoe collection and add your favourite products.
      </p>

      <a
        href="menu.html"
        class="continue-shopping-button"
      >
        Browse Shoes
      </a>

    </div>
  `;
}

/*
|--------------------------------------------------------------------------
| Create cart item
|--------------------------------------------------------------------------
*/

function createCartItem(item, index) {
  const cartItem =
    document.createElement("article");

  cartItem.className = "cart-item";

  const productName =
    escapeHtml(
      item.name || "Product"
    );

  const image =
    escapeAttribute(
      item.image || ""
    );

  const price =
    Number(item.price || 0);

  const quantity =
    Math.max(
      1,
      Number(item.quantity || 1)
    );

  const itemTotal =
    price * quantity;

  const availableStock =
    Number(item.stock || 0);

  const stockText =
    availableStock > 0
      ? `${availableStock} available`
      : "";

  cartItem.innerHTML = `
    <div class="cart-item-image">

      <img
        src="${image}"
        alt="${productName}"
      >

    </div>

    <div class="cart-item-details">

      <h3>${productName}</h3>

      ${
        item.category
          ? `
            <p class="cart-item-category">
              ${escapeHtml(item.category)}
            </p>
          `
          : ""
      }

      <p class="cart-item-price">
        £${price.toFixed(2)} each
      </p>

      ${
        stockText
          ? `
            <p class="cart-stock-information">
              ${stockText}
            </p>
          `
          : ""
      }

      <button
        type="button"
        class="cart-remove-link"
        data-action="remove"
      >
        Remove
      </button>

    </div>

    <div class="cart-item-controls">

      <div class="quantity-control">

        <button
          type="button"
          data-action="decrease"
          aria-label="Decrease quantity"
        >
          −
        </button>

        <span>
          ${quantity}
        </span>

        <button
          type="button"
          data-action="increase"
          aria-label="Increase quantity"
        >
          +
        </button>

      </div>

      <strong class="cart-item-total">
        £${itemTotal.toFixed(2)}
      </strong>

    </div>
  `;

  const imageElement =
    cartItem.querySelector("img");

  imageElement.addEventListener(
    "error",
    () => {
      imageElement.src =
        "https://placehold.co/300x300?text=No+Image";
    },
    {
      once: true
    }
  );

  const increaseButton =
    cartItem.querySelector(
      '[data-action="increase"]'
    );

  const decreaseButton =
    cartItem.querySelector(
      '[data-action="decrease"]'
    );

  const removeButton =
    cartItem.querySelector(
      '[data-action="remove"]'
    );

  increaseButton.addEventListener(
    "click",
    () => {
      increaseQty(index);
    }
  );

  decreaseButton.addEventListener(
    "click",
    () => {
      decreaseQty(index);
    }
  );

  removeButton.addEventListener(
    "click",
    () => {
      removeItem(index);
    }
  );

  return cartItem;
}

/*
|--------------------------------------------------------------------------
| Increase quantity
|--------------------------------------------------------------------------
*/

function increaseQty(index) {
  const cart = getCart();

  const item = cart[index];

  if (!item) {
    return;
  }

  const currentQuantity =
    Number(item.quantity || 1);

  const availableStock =
    Number(item.stock || 0);

  if (
    availableStock > 0 &&
    currentQuantity >= availableStock
  ) {
    showNotification(
      `Only ${availableStock} item${
        availableStock === 1 ? "" : "s"
      } available.`,
      true
    );

    return;
  }

  item.quantity =
    currentQuantity + 1;

  saveCart(cart);
  displayCart();
}

/*
|--------------------------------------------------------------------------
| Decrease quantity
|--------------------------------------------------------------------------
*/

function decreaseQty(index) {
  const cart = getCart();

  const item = cart[index];

  if (!item) {
    return;
  }

  const currentQuantity =
    Number(item.quantity || 1);

  if (currentQuantity > 1) {
    item.quantity =
      currentQuantity - 1;
  } else {
    cart.splice(index, 1);
  }

  saveCart(cart);
  displayCart();
}

/*
|--------------------------------------------------------------------------
| Remove item
|--------------------------------------------------------------------------
*/

function removeItem(index) {
  const cart = getCart();

  if (!cart[index]) {
    return;
  }

  const productName =
    cart[index].name || "Product";

  cart.splice(index, 1);

  saveCart(cart);
  displayCart();

  showNotification(
    `${productName} removed from your cart.`,
    false
  );
}

/*
|--------------------------------------------------------------------------
| Place order
|--------------------------------------------------------------------------
*/

async function placeOrder() {
  const user =
    auth.currentUser;

  if (!user) {
    alert(
      "Please log in before placing your order."
    );

    if (
      typeof window.openLoginPopup ===
      "function"
    ) {
      window.openLoginPopup();
    }

    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const total =
    calculateCartTotal(cart);

  setCheckoutLoading(true);

  try {
    const orderItems =
      cart.map((item) => ({
        productId:
          item.id || "",

        name:
          item.name || "Product",

        image:
          item.image || "",

        category:
          item.category || "",

        price:
          Number(item.price || 0),

        quantity:
          Number(item.quantity || 1)
      }));

    await addDoc(
      collection(db, "orders"),
      {
        userId:
          user.uid,

        customerEmail:
          user.email || "",

        customerName:
          user.displayName || "",

        items:
          orderItems,

        total:
          Number(total.toFixed(2)),

        status:
          "Pending",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      }
    );

    localStorage.removeItem(
      CART_STORAGE_KEY
    );

    displayCart();

    alert(
      "Your order was placed successfully."
    );

    window.location.href =
      "orders.html";
  } catch (error) {
    console.error(
      "Place order error:",
      error
    );

    if (
      error.code ===
      "permission-denied"
    ) {
      alert(
        "Permission denied. Please check your Firestore rules."
      );
    } else if (
      error.code ===
      "unavailable"
    ) {
      alert(
        "Unable to connect to Firebase. Please check your internet connection."
      );
    } else {
      alert(
        "Your order could not be placed. Please try again."
      );
    }
  } finally {
    setCheckoutLoading(false);
  }
}

/*
|--------------------------------------------------------------------------
| Checkout loading state
|--------------------------------------------------------------------------
*/

function setCheckoutLoading(isLoading) {
  placeOrderButton.disabled =
    isLoading;

  placeOrderButton.textContent =
    isLoading
      ? "Placing Order..."
      : "Place Order";
}

/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/

let notificationTimer = null;

function showNotification(
  message,
  isError
) {
  if (!cartNotification) {
    return;
  }

  cartNotification.textContent =
    message;

  cartNotification.classList.toggle(
    "error",
    Boolean(isError)
  );

  cartNotification.classList.add(
    "visible"
  );

  clearTimeout(notificationTimer);

  notificationTimer = setTimeout(
    () => {
      cartNotification.classList.remove(
        "visible"
      );
    },
    2500
  );
}

/*
|--------------------------------------------------------------------------
| Mobile menu
|--------------------------------------------------------------------------
*/

if (
  mobileMenuButton &&
  customerNavigation
) {
  mobileMenuButton.addEventListener(
    "click",
    () => {
      customerNavigation.classList.toggle(
        "visible"
      );

      const isVisible =
        customerNavigation.classList.contains(
          "visible"
        );

      mobileMenuButton.textContent =
        isVisible ? "✕" : "☰";
    }
  );
}

/*
|--------------------------------------------------------------------------
| Security utilities
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

/*
|--------------------------------------------------------------------------
| Make functions available where needed
|--------------------------------------------------------------------------
*/

window.increaseQty =
  increaseQty;

window.decreaseQty =
  decreaseQty;

window.removeItem =
  removeItem;

window.placeOrder =
  placeOrder;

/*
|--------------------------------------------------------------------------
| Events
|--------------------------------------------------------------------------
*/

placeOrderButton.addEventListener(
  "click",
  placeOrder
);

window.addEventListener(
  "storage",
  displayCart
);

/*
|--------------------------------------------------------------------------
| Initial display
|--------------------------------------------------------------------------
*/

displayCart();