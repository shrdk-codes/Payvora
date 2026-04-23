import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- Path detection ---
const path = window.location.pathname.toLowerCase();
const isOnStartPage = path.includes("/start.html") || path.endsWith("/start");
const isOnDashboard = path.includes("/dashboard.html") || path.includes("/templates/dashboard");

console.log("Auth script loaded. Path:", window.location.pathname);

// --- Handle redirect result (one-time, after OAuth callback) ---
let redirectHandled = false;

getRedirectResult(auth)
  .then((result) => {
    redirectHandled = true;
    if (result?.user) {
      console.log("Redirect result: success", result.user.email);
      if (isOnStartPage) {
        window.location.replace("/templates/dashboard.html");
      }
    } else {
      console.log("Redirect result: no user (normal if not coming from login)");
    }
  })
  .catch((err) => {
    redirectHandled = true;
    console.error("Redirect error:", err);
  });

// --- Auth state observer ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Observer: User logged in as", user.email);

    // Only redirect if we're on the login page AND we didn't just handle a redirect
    // (avoids double-redirect and prevents loop if dashboard loads this script)
    if (isOnStartPage && !redirectHandled) {
      console.log("On start page with active session. Moving to dashboard...");
      window.location.replace("/templates/dashboard.html");
    }
    
    // If already on dashboard, do nothing — stay here
  } else {
    console.log("Observer: No active session.");
    
    // Optional: kick unauthenticated users back to login from protected pages
    if (isOnDashboard) {
      console.log("On dashboard without session. Redirecting to login...");
      window.location.replace("/start.html"); // or wherever your login is
    }
  }
});

// --- Login button ---
const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    console.log("Initiating Google redirect...");
    signInWithRedirect(auth, provider);
  });
}
