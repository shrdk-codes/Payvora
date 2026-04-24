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
const path = window.location.pathname;
const pathLower = path.toLowerCase();

// Support both local dev (maybe /Start.html) and deployed (/templates/Start.html)
const isOnStartPage =
  pathLower.endsWith("/templates/start.html") ||
  pathLower.endsWith("/start.html") ||
  pathLower.endsWith("/start");

const isOnDashboard =
  pathLower.endsWith("/templates/dashboard.html") ||
  pathLower.endsWith("/dashboard.html") ||
  pathLower.includes("/templates/dashboard");

const DASHBOARD_URL = "/templates/dashboard.html";
const LOGIN_URL = "/templates/Start.html";

console.log("Auth script loaded. Path:", path);

// --- Handle redirect result (one-time, after OAuth callback) ---
let redirectHandled = false;

getRedirectResult(auth)
  .then((result) => {
    redirectHandled = true;

    if (result?.user) {
      console.log("Redirect result: success", result.user.email);

      // After returning from Google, we can be on /templates/Start.html.
      // Always move authenticated users to the dashboard.
      if (!isOnDashboard) {
        window.location.replace(DASHBOARD_URL);
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

    // If user is logged in and still on the login page, go to dashboard.
    // Note: We do NOT gate on redirectHandled; onAuthStateChanged can fire
    // before getRedirectResult resolves, and we still want to leave Start.
    if (isOnStartPage) {
      console.log("On Start page with active session. Moving to dashboard...");
      window.location.replace(DASHBOARD_URL);
    }
  } else {
    console.log("Observer: No active session.");

    // Kick unauthenticated users back to login from protected pages.
    // IMPORTANT: login lives under /templates/Start.html on Vercel.
    if (isOnDashboard) {
      console.log("On dashboard without session. Redirecting to login...");
      window.location.replace(LOGIN_URL);
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