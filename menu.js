import {
  db
} from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/*
|--------------------------------------------------------------------------
| Variables
|--------------------------------------------------------------------------
*/

let allProducts = [];

/*
|--------------------------------------------------------------------------
| Elements
|--------------------------------------------------------------------------
*/

const productGrid =
  document.getElementById("productGrid");

const productsMessage =
  document.getElementById("productsMessage");

const productResultCount =
  document.getElementById("productResultCount");

const productSearch =
  document.getElementById("productSearch");

const categoryFilter =
  document.getElementById("categoryFilter");

const sortFilter =
  document.getElementById("sortFilter");

const inStockFilter =
  document.getElementById("inStockFilter");

const clearFiltersButton =
  document.getElementById("clearFiltersButton");

const cartCount =
  document.getElementById("cartCount");

const cartNotification =
  document.getElementById("cartNotification");

const mobileMenuButton =
  document.getElementById("mobileMenuButton");

const customerNavigation =
  document.getElementById("customerNavigation");

const currentYear =
  document.getElementById("currentYear");

/*
|--------------------------------------------------------------------------
| Mobile navigation
|--------------------------------------------------------------------------
*/

if (mobileMenuButton && customerNavigation) {
  mobileMenuButton.addEventListener("click", () => {
    customerNavigation.classList.toggle("visible");

    mobileMenuButton.textContent =
      customerNavigation.classList.contains("visible")
        ? "✕"
        : "☰";
  });
}

/*
|--------------------------------------------------------------------------
| Read category from the page URL
|--------------------------------------------------------------------------
|
| Example:
| menu.html?category=Women
|
*/

const queryParameters =
  new URLSearchParams(window.location.search);

const selectedUrlCategory =
  queryParameters.get("category");

if (selectedUrlCategory && categoryFilter) {
  categoryFilter.value = selectedUrlCategory;
}

/*
|--------------------------------------------------------------------------
| Listen for products from Firestore
|--------------------------------------------------------------------------
*/

onSnapshot(
  collection(db, "products"),

  (snapshot) => {
    allProducts = [];

    snapshot.forEach((productDocument) => {
      allProducts.push({
        id: productDocument.id,
        ...productDocument.data()
      });
    });

    applyProductFilters();
  },

  (error) => {
    console.error("Unable to load products:", error);

    productsMessage.textContent =
      "Unable to load products. Please try again.";

    productsMessage.classList.add("error-message");

    productResultCount.textContent = "0 products";
  }
);

/*
|--------------------------------------------------------------------------
| Filter events
|--------------------------------------------------------------------------
*/

productSearch.addEventListener(
  "input",
  applyProductFilters
);

categoryFilter.addEventListener(
  "change",
  applyProductFilters
);

sortFilter.addEventListener(
  "change",
  applyProductFilters
);

inStockFilter.addEventListener(
  "change",
  applyProductFilters
);

clearFiltersButton.addEventListener(
  "click",
  () => {
    productSearch.value = "";
    categoryFilter.value = "all";
    sortFilter.value = "newest";
    inStockFilter.checked = false;

    history.replaceState(
      {},
      "",
      window.location.pathname
    );

    applyProductFilters();
  }
);

/*
|--------------------------------------------------------------------------
| Apply filters
|--------------------------------------------------------------------------
*/

function applyProductFilters() {
  const searchValue =
    productSearch.value.trim().toLowerCase();

  const selectedCategory =
    categoryFilter.value;

  const selectedSort =
    sortFilter.value;

  const onlyInStock =
    inStockFilter.checked;

  let products = [...allProducts];

  if (searchValue) {
    products = products.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.category
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchValue);
    });
  }

  if (selectedCategory !== "all") {
    products = products.filter((product) => {
      return product.category === selectedCategory;
    });
  }

  if (onlyInStock) {
    products = products.filter((product) => {
      return Number(product.stock || 0) > 0;
    });
  }

  sortProducts(products, selectedSort);

  displayProducts(products);
}

/*
|--------------------------------------------------------------------------
| Sort products
|--------------------------------------------------------------------------
*/

function sortProducts(products, sortType) {
  products.sort((first, second) => {
    if (sortType === "price-low") {
      return (
        Number(first.price || 0) -
        Number(second.price || 0)
      );
    }

    if (sortType === "price-high") {
      return (
        Number(second.price || 0) -
        Number(first.price || 0)
      );
    }

    if (sortType === "name") {
      return String(first.name || "")
        .localeCompare(String(second.name || ""));
    }

    const firstTime =
      first.createdAt?.toMillis?.() || 0;

    const secondTime =
      second.createdAt?.toMillis?.() || 0;

    return secondTime - firstTime;
  });
}

/*
|--------------------------------------------------------------------------
| Display products
|--------------------------------------------------------------------------
*/

function displayProducts(products) {
  productGrid.innerHTML = "";

  productResultCount.textContent =
    `${products.length} ${
      products.length === 1
        ? "product"
        : "products"
    }`;

  if (products.length === 0) {
    productsMessage.textContent =
      "No products match your filters.";

    productsMessage.style.display = "block";
    return;
  }

  productsMessage.textContent = "";
  productsMessage.style.display = "none";

  products.forEach((product) => {
    productGrid.appendChild(
      createProductCard(product)
    );
  });
}

/*
|--------------------------------------------------------------------------
| Create product card
|--------------------------------------------------------------------------
*/

function createProductCard(product) {
  const card =
    document.createElement("article");

  card.className = "customer-product-card";

  const name =
    escapeHtml(product.name || "Unnamed shoe");

  const category =
    escapeHtml(product.category || "Shoes");

  const description =
    escapeHtml(
      product.description ||
      "No description available."
    );

  const image =
    escapeAttribute(product.image || "");

  const price =
    Number(product.price || 0);

  const stock =
    Math.max(0, Number(product.stock || 0));

  const isAvailable =
    stock > 0;

  card.innerHTML = `
    <div class="customer-product-image">

      <img
        src="${image}"
        alt="${name}"
      >

      <span class="customer-category-label">
        ${category}
      </span>

      ${
        !isAvailable
          ? `
            <span class="sold-out-label">
              Sold Out
            </span>
          `
          : ""
      }

    </div>

    <div class="customer-product-content">

      <h3>${name}</h3>

      <p class="customer-product-description">
        ${description}
      </p>

      <div class="customer-product-stock">
        ${
          isAvailable
            ? `${stock} available`
            : "Currently unavailable"
        }
      </div>

      <div class="customer-product-footer">

        <strong>
          £${price.toFixed(2)}
        </strong>

        <button
          type="button"
          class="add-cart-button"
          ${!isAvailable ? "disabled" : ""}
        >
          ${
            isAvailable
              ? "Add to Cart"
              : "Sold Out"
          }
        </button>

      </div>
    </div>
  `;

  const imageElement =
    card.querySelector("img");

  imageElement.addEventListener(
    "error",
    () => {
      imageElement.src =
        "https://placehold.co/700x600?text=No+Shoe+Image";
    },
    {
      once: true
    }
  );

  const addCartButton =
    card.querySelector(".add-cart-button");

  if (isAvailable) {
    addCartButton.addEventListener(
      "click",
      () => {
        addProductToCart(product);
      }
    );
  }

  return card;
}

/*
|--------------------------------------------------------------------------
| Add product to cart
|--------------------------------------------------------------------------
*/

function addProductToCart(product) {
  const cart = readCart();

  const existingProduct =
    cart.find((item) => item.id === product.id);

  const availableStock =
    Number(product.stock || 0);

  if (existingProduct) {
    const newQuantity =
      Number(existingProduct.quantity || 1) + 1;

    if (newQuantity > availableStock) {
      showCartNotification(
        "You cannot add more than the available stock.",
        true
      );

      return;
    }

    existingProduct.quantity = newQuantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name || "Product",
      price: Number(product.price || 0),
      image: product.image || "",
      category: product.category || "",
      stock: availableStock,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartCount();

  showCartNotification(
    `${product.name || "Product"} added to your cart.`,
    false
  );
}

/*
|--------------------------------------------------------------------------
| Cart utilities
|--------------------------------------------------------------------------
*/

function readCart() {
  try {
    const cartValue =
      localStorage.getItem("shoeShopCart");

    const parsedCart =
      cartValue ? JSON.parse(cartValue) : [];

    return Array.isArray(parsedCart)
      ? parsedCart
      : [];
  } catch (error) {
    console.error("Unable to read cart:", error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(
    "shoeShopCart",
    JSON.stringify(cart)
  );
}

function updateCartCount() {
  const cart = readCart();

  const itemCount = cart.reduce(
    (total, item) => {
      return total + Number(item.quantity || 1);
    },
    0
  );

  cartCount.textContent = itemCount;
}

/*
|--------------------------------------------------------------------------
| Cart notification
|--------------------------------------------------------------------------
*/

let notificationTimer = null;

function showCartNotification(
  message,
  isError
) {
  cartNotification.textContent = message;

  cartNotification.classList.toggle(
    "error",
    Boolean(isError)
  );

  cartNotification.classList.add("visible");

  clearTimeout(notificationTimer);

  notificationTimer = setTimeout(() => {
    cartNotification.classList.remove("visible");
  }, 2500);
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
| Initial page setup
|--------------------------------------------------------------------------
*/

updateCartCount();

if (currentYear) {
  currentYear.textContent =
    new Date().getFullYear();
}