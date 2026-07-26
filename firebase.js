import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth
};