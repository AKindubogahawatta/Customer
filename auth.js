import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser = null;

/*
|--------------------------------------------------------------------------
| Authentication state
|--------------------------------------------------------------------------
*/

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  updateAuthenticationArea(user);

  // Other files can listen for this event.
  window.dispatchEvent(
    new CustomEvent("customerAuthChanged", {
      detail: {
        user
      }
    })
  );
});

/*
|--------------------------------------------------------------------------
| Display Login/Register or account icon
|--------------------------------------------------------------------------
*/

function updateAuthenticationArea(user) {
  const authArea =
    document.getElementById("authArea");

  if (!authArea) {
    return;
  }

  if (user) {
    authArea.innerHTML = `
      <div class="customer-account">

        <button
          id="accountButton"
          type="button"
          class="account-button"
          aria-label="Open account menu"
        >
          <span class="account-icon">👤</span>
        </button>

        <div
          id="accountDropdown"
          class="account-dropdown"
        >
          <div class="account-dropdown-header">
            <strong>My Account</strong>
            <span>${escapeHtml(user.email || "")}</span>
          </div>

          <a href="orders.html">
            My Orders
          </a>

          <button
            id="customerLogoutButton"
            type="button"
          >
            Logout
          </button>
        </div>

      </div>
    `;

    const accountButton =
      document.getElementById("accountButton");

    const accountDropdown =
      document.getElementById("accountDropdown");

    const logoutButton =
      document.getElementById("customerLogoutButton");

    accountButton.addEventListener("click", (event) => {
      event.stopPropagation();

      accountDropdown.classList.toggle("visible");
    });

    logoutButton.addEventListener("click", customerLogout);
  } else {
    authArea.innerHTML = `
      <div class="guest-auth-buttons">

        <button
          type="button"
          class="header-login-button"
          data-auth-mode="login"
        >
          Login
        </button>

        <button
          type="button"
          class="header-register-button"
          data-auth-mode="register"
        >
          Register
        </button>

      </div>
    `;

    authArea
      .querySelector('[data-auth-mode="login"]')
      .addEventListener("click", () => {
        openLoginPopup("login");
      });

    authArea
      .querySelector('[data-auth-mode="register"]')
      .addEventListener("click", () => {
        openLoginPopup("register");
      });
  }
}

/*
|--------------------------------------------------------------------------
| Open login/register popup
|--------------------------------------------------------------------------
*/

window.openLoginPopup = function (mode = "login") {
  const popup =
    document.getElementById("loginPopup");

  if (!popup) {
    alert(
      "The login popup is missing from this page."
    );

    return;
  }

  clearAuthMessage();

  popup.classList.add("visible");
  popup.style.display = "flex";

  setAuthMode(mode);
};

/*
|--------------------------------------------------------------------------
| Close popup
|--------------------------------------------------------------------------
*/

window.closeLoginPopup = function () {
  const popup =
    document.getElementById("loginPopup");

  if (!popup) {
    return;
  }

  popup.classList.remove("visible");
  popup.style.display = "none";

  clearAuthMessage();
};

/*
|--------------------------------------------------------------------------
| Change between Login and Register
|--------------------------------------------------------------------------
*/

window.setAuthMode = function (mode) {
  const popupTitle =
    document.getElementById("authPopupTitle");

  const popupDescription =
    document.getElementById("authPopupDescription");

  const loginSubmitButton =
    document.getElementById("loginSubmitButton");

  const registerSubmitButton =
    document.getElementById("registerSubmitButton");

  const loginTabButton =
    document.getElementById("loginTabButton");

  const registerTabButton =
    document.getElementById("registerTabButton");

  if (!popupTitle) {
    return;
  }

  const isRegister =
    mode === "register";

  popupTitle.textContent =
    isRegister
      ? "Create Your Account"
      : "Welcome Back";

  popupDescription.textContent =
    isRegister
      ? "Register to place orders and view your order history."
      : "Log in to place orders and view your previous orders.";

  loginSubmitButton.style.display =
    isRegister ? "none" : "block";

  registerSubmitButton.style.display =
    isRegister ? "block" : "none";

  loginTabButton.classList.toggle(
    "active",
    !isRegister
  );

  registerTabButton.classList.toggle(
    "active",
    isRegister
  );
};

/*
|--------------------------------------------------------------------------
| Register customer
|--------------------------------------------------------------------------
*/

window.register = async function () {
  const email =
    getEmailValue();

  const password =
    getPasswordValue();

  clearAuthMessage();

  const validationError =
    validateCredentials(email, password);

  if (validationError) {
    showAuthMessage(validationError, true);
    return;
  }

  setAuthButtonsLoading(true);

  try {
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    closeLoginPopup();

    alert(
      "Your account was created successfully."
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    showAuthMessage(
      getReadableAuthError(error.code),
      true
    );
  } finally {
    setAuthButtonsLoading(false);
  }
};

/*
|--------------------------------------------------------------------------
| Login customer
|--------------------------------------------------------------------------
*/

window.login = async function () {
  const email =
    getEmailValue();

  const password =
    getPasswordValue();

  clearAuthMessage();

  const validationError =
    validateCredentials(email, password);

  if (validationError) {
    showAuthMessage(validationError, true);
    return;
  }

  setAuthButtonsLoading(true);

  try {
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    closeLoginPopup();

    alert("Logged in successfully.");
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    showAuthMessage(
      getReadableAuthError(error.code),
      true
    );
  } finally {
    setAuthButtonsLoading(false);
  }
};

/*
|--------------------------------------------------------------------------
| Logout customer
|--------------------------------------------------------------------------
*/

async function customerLogout() {
  try {
    await signOut(auth);

    window.location.href =
      "index.html";
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );

    alert(
      "Unable to log out. Please try again."
    );
  }
}

window.logout = customerLogout;

/*
|--------------------------------------------------------------------------
| Get current user
|--------------------------------------------------------------------------
*/

window.getCurrentCustomer = function () {
  return currentUser;
};

/*
|--------------------------------------------------------------------------
| Popup events
|--------------------------------------------------------------------------
*/

const loginPopup =
  document.getElementById("loginPopup");

if (loginPopup) {
  loginPopup.addEventListener("click", (event) => {
    if (event.target === loginPopup) {
      closeLoginPopup();
    }
  });
}

document.addEventListener("click", (event) => {
  const dropdown =
    document.getElementById("accountDropdown");

  const account =
    document.querySelector(".customer-account");

  if (
    dropdown &&
    account &&
    !account.contains(event.target)
  ) {
    dropdown.classList.remove("visible");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLoginPopup();
  }

  if (
    event.key === "Enter" &&
    document
      .getElementById("loginPopup")
      ?.classList.contains("visible")
  ) {
    const registerButton =
      document.getElementById(
        "registerSubmitButton"
      );

    if (
      registerButton &&
      registerButton.style.display !== "none"
    ) {
      register();
    } else {
      login();
    }
  }
});

/*
|--------------------------------------------------------------------------
| Utilities
|--------------------------------------------------------------------------
*/

function getEmailValue() {
  return document
    .getElementById("email")
    ?.value
    .trim()
    .toLowerCase() || "";
}

function getPasswordValue() {
  return document
    .getElementById("password")
    ?.value || "";
}

function validateCredentials(email, password) {
  if (!email) {
    return "Please enter your email address.";
  }

  if (!password) {
    return "Please enter your password.";
  }

  if (password.length < 6) {
    return "The password must contain at least 6 characters.";
  }

  return "";
}

function showAuthMessage(message, isError) {
  const messageElement =
    document.getElementById("authMessage");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;

  messageElement.classList.toggle(
    "auth-error",
    Boolean(isError)
  );

  messageElement.classList.toggle(
    "auth-success",
    !isError
  );
}

function clearAuthMessage() {
  const messageElement =
    document.getElementById("authMessage");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = "";

  messageElement.classList.remove(
    "auth-error",
    "auth-success"
  );
}

function setAuthButtonsLoading(isLoading) {
  const loginButton =
    document.getElementById("loginSubmitButton");

  const registerButton =
    document.getElementById(
      "registerSubmitButton"
    );

  if (loginButton) {
    loginButton.disabled = isLoading;

    loginButton.textContent =
      isLoading
        ? "Please wait..."
        : "Login";
  }

  if (registerButton) {
    registerButton.disabled = isLoading;

    registerButton.textContent =
      isLoading
        ? "Please wait..."
        : "Create Account";
  }
}

function getReadableAuthError(errorCode) {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email address already has an account. Please log in.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Please choose a stronger password.";

    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    default:
      return "Authentication failed. Please try again.";
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

const mobileMenuButton = document.getElementById("mobileMenuButton");
const customerNavigation = document.getElementById("customerNavigation");

if (mobileMenuButton && customerNavigation) {

    mobileMenuButton.addEventListener("click", () => {

        customerNavigation.classList.toggle("show");

        if (customerNavigation.classList.contains("show")) {
            mobileMenuButton.innerHTML = "✕";
        } else {
            mobileMenuButton.innerHTML = "☰";
        }

    });

}