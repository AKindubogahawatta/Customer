import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let ordersUnsubscribe = null;

const loginRequiredSection =
  document.getElementById("ordersLoginRequired");

const ordersLoading =
  document.getElementById("ordersLoading");

const ordersContainer =
  document.getElementById("ordersContainer");

/*
|--------------------------------------------------------------------------
| Authentication state
|--------------------------------------------------------------------------
*/

onAuthStateChanged(auth, (user) => {
  stopOrdersListener();

  if (!user) {
    showLoginRequired();
    return;
  }

  showOrdersLoading();
  startOrdersListener(user.uid);
});

/*
|--------------------------------------------------------------------------
| Load only this customer’s orders
|--------------------------------------------------------------------------
*/

function startOrdersListener(userId) {
  const customerOrdersQuery = query(
    collection(db, "orders"),
    where("userId", "==", userId)
  );

  ordersUnsubscribe = onSnapshot(
    customerOrdersQuery,

    (snapshot) => {
      const orders = [];

      snapshot.forEach((orderDocument) => {
        orders.push({
          id: orderDocument.id,
          ...orderDocument.data()
        });
      });

      orders.sort((first, second) => {
        const firstTime =
          first.createdAt?.toMillis?.() || 0;

        const secondTime =
          second.createdAt?.toMillis?.() || 0;

        return secondTime - firstTime;
      });

      displayOrders(orders);
    },

    (error) => {
      console.error(
        "Load customer orders error:",
        error
      );

      ordersLoading.style.display = "none";
      ordersContainer.style.display = "block";

      ordersContainer.innerHTML = `
        <div class="empty-customer-orders">
          <h2>Unable to load orders</h2>
          <p>
            Please check your connection and try again.
          </p>
        </div>
      `;
    }
  );
}

/*
|--------------------------------------------------------------------------
| Display orders
|--------------------------------------------------------------------------
*/

function displayOrders(orders) {
  loginRequiredSection.style.display = "none";
  ordersLoading.style.display = "none";
  ordersContainer.style.display = "grid";
  ordersContainer.innerHTML = "";

  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="empty-customer-orders">

        <div class="empty-orders-icon">
          📦
        </div>

        <h2>You have no orders yet</h2>

        <p>
          Products you order will appear here.
        </p>

        <a href="menu.html">
          Browse Shoes
        </a>

      </div>
    `;

    return;
  }

  orders.forEach((order) => {
    ordersContainer.appendChild(
      createOrderCard(order)
    );
  });
}

/*
|--------------------------------------------------------------------------
| Create order card
|--------------------------------------------------------------------------
*/

function createOrderCard(order) {
  const card =
    document.createElement("article");

  card.className = "customer-order-card";

  const status =
    order.status || "Pending";

  const statusClass =
    status
      .toLowerCase()
      .replaceAll(" ", "-");

  const orderDate =
    order.createdAt?.toDate
      ? order.createdAt
          .toDate()
          .toLocaleString()
      : "Processing";

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  const itemsHtml =
    items.map((item) => {
      const quantity =
        Number(item.quantity || 1);

      const price =
        Number(item.price || 0);

      return `
        <div class="customer-order-item">

          <img
            src="${escapeAttribute(item.image || "")}"
            alt="${escapeHtml(item.name || "Product")}"
          >

          <div>
            <h4>
              ${escapeHtml(item.name || "Product")}
            </h4>

            <p>
              Quantity: ${quantity}
            </p>
          </div>

          <strong>
            £${(price * quantity).toFixed(2)}
          </strong>

        </div>
      `;
    }).join("");

  card.innerHTML = `
    <div class="customer-order-header">

      <div>
        <span>Order number</span>

        <h3>
          #${escapeHtml(order.id.slice(0, 8))}
        </h3>
      </div>

      <span class="customer-order-status ${statusClass}">
        ${escapeHtml(status)}
      </span>

    </div>

    <p class="customer-order-date">
      Ordered on ${escapeHtml(orderDate)}
    </p>

    <div class="customer-order-items">
      ${itemsHtml}
    </div>

    <div class="customer-order-footer">

      <span>Order total</span>

      <strong>
        £${Number(order.total || 0).toFixed(2)}
      </strong>

    </div>
  `;

  card.querySelectorAll("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.src =
          "https://placehold.co/150x150?text=Shoe";
      },
      {
        once: true
      }
    );
  });

  return card;
}

/*
|--------------------------------------------------------------------------
| Page states
|--------------------------------------------------------------------------
*/

function showLoginRequired() {
  loginRequiredSection.style.display = "block";
  ordersLoading.style.display = "none";
  ordersContainer.style.display = "none";
  ordersContainer.innerHTML = "";
}

function showOrdersLoading() {
  loginRequiredSection.style.display = "none";
  ordersLoading.style.display = "block";
  ordersContainer.style.display = "none";
}

function stopOrdersListener() {
  if (ordersUnsubscribe) {
    ordersUnsubscribe();
    ordersUnsubscribe = null;
  }
}

/*
|--------------------------------------------------------------------------
| Cart count
|--------------------------------------------------------------------------
*/

function updateCartCount() {
  try {
    const cart =
      JSON.parse(
        localStorage.getItem("shoeShopCart")
      ) || [];

    const quantity =
      cart.reduce((total, item) => {
        return (
          total +
          Number(item.quantity || 1)
        );
      }, 0);

    const cartCount =
      document.getElementById("cartCount");

    if (cartCount) {
      cartCount.textContent = quantity;
    }
  } catch (error) {
    console.error(
      "Unable to update cart count:",
      error
    );
  }
}

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

updateCartCount();