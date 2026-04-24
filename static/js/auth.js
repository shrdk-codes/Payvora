import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Standardize URLs - ensure these match your actual folder structure
const DASHBOARD_URL = "/templates/dashboard.html";
const START_URL = "/templates/start.html";

// State flag to prevent the "Auth Observer" from redirecting 
// while we are still checking the result of a login redirect.
let isInitializing = true;

// 1. Check for redirect result immediately on page load
getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      console.log("Redirect success! User:", result.user.email);
      // Immediately move to dashboard if login just finished
      window.location.replace(DASHBOARD_URL);
    } else {
      // No redirect result found, let the observer take over
      isInitializing = false;
      checkCurrentState();
    }
  })
  .catch((error) => {
    console.error("Redirect Error:", error.code, error.message);
    isInitializing = false;
    checkCurrentState();
  });

// 2. Auth State Observer
onAuthStateChanged(auth, (user) => {
  if (isInitializing) return; // Wait for getRedirectResult first
  
  const path = window.location.pathname.toLowerCase();
  const isOnDashboard = path.includes("dashboard.html");
  const isOnStart = path.includes("start.html");

  if (user) {
    // User is logged in
    if (isOnStart) {
      window.location.replace(DASHBOARD_URL);
    }
  } else {
    // User is NOT logged in
    if (isOnDashboard) {
      console.warn("Unauthorized access. Returning to start...");
      window.location.replace(START_URL);
    }
  }
});

// Helper to trigger logic if getRedirectResult is null
function checkCurrentState() {
  const user = auth.currentUser;
  const path = window.location.pathname.toLowerCase();
  if (user && path.includes("start.html")) {
    window.location.replace(DASHBOARD_URL);
  }
}

// 3. Button Click Handler
const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      // Start the redirect flow
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Login Trigger Error:", error);
      alert("Failed to start login. Check console.");
    }
  });
}
