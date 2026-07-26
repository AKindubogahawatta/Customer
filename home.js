const mobileMenuButton =
  document.getElementById("mobileMenuButton");

const customerNavigation =
  document.getElementById("customerNavigation");

const cartCount =
  document.getElementById("cartCount");

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

    const isOpen =
      customerNavigation.classList.contains("visible");

    mobileMenuButton.textContent =
      isOpen ? "✕" : "☰";
  });

  customerNavigation
    .querySelectorAll("a")
    .forEach((link) => {
      link.addEventListener("click", () => {
        customerNavigation.classList.remove("visible");
        mobileMenuButton.textContent = "☰";
      });
    });
}

/*
|--------------------------------------------------------------------------
| Cart count
|--------------------------------------------------------------------------
*/

function updateCartCount() {
  const cart = readCart();

  const totalQuantity = cart.reduce(
    (total, item) => {
      return total + Number(item.quantity || 1);
    },
    0
  );

  if (cartCount) {
    cartCount.textContent = totalQuantity;
  }
}

function readCart() {
  try {
    const storedCart =
      localStorage.getItem("shoeShopCart");

    const parsedCart =
      storedCart ? JSON.parse(storedCart) : [];

    return Array.isArray(parsedCart)
      ? parsedCart
      : [];
  } catch (error) {
    console.error("Unable to read cart:", error);
    return [];
  }
}

/*
|--------------------------------------------------------------------------
| Footer year
|--------------------------------------------------------------------------
*/

if (currentYear) {
  currentYear.textContent =
    new Date().getFullYear();
}

updateCartCount();

window.addEventListener("storage", updateCartCount);