import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Standardize Paths
const DASHBOARD_URL = "/templates/dashboard.html";
const START_URL = "/templates/start.html";

// 1. Auth Observer: Controls access to the dashboard
onAuthStateChanged(auth, (user) => {
  const path = window.location.pathname.toLowerCase();
  const isOnDashboard = path.includes("dashboard.html");

  if (user) {
    console.log("User detected:", user.email);
    // If logged in and on Start page, move to Dashboard
    if (path.includes("start.html")) {
      window.location.assign(DASHBOARD_URL);
    }
  } else {
    // If NOT logged in and trying to view Dashboard, kick to Start
    if (isOnDashboard) {
      console.warn("No session. Redirecting to login...");
      window.location.assign(START_URL);
    }
  }
});

// 2. Login Button: Using the Popup Method
const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      // Step A: Ensure the session is saved locally
      await setPersistence(auth, browserLocalPersistence);
      
      // Step B: Open the Google Popup
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        console.log("Login Successful!");
        // Step C: Manually redirect to dashboard immediately
        window.location.assign(DASHBOARD_URL);
      }
    } catch (error) {
      console.error("Login failed:", error.code, error.message);
      if (error.code === 'auth/popup-blocked') {
        alert("Please enable popups for this website to log in.");
      }
    }
  });
}
