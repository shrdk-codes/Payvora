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

// 1. Handle Redirect Result
try {
  const result = await getRedirectResult(auth);
  if (result?.user) {
    console.log("Login successful, redirecting...");
    window.location.replace("dashboard.html");
  }
} catch (error) {
  console.error("Auth Error:", error);
}

// 2. The "Observer" (Safety Net)
// This catches the user if the redirect result was already processed
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Check if we are still on the login page (start.html)
    if (window.location.pathname.includes("start.html")) {
      window.location.replace("dashboard.html");
    }
  }
});

// 3. Login Trigger
const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    signInWithRedirect(auth, provider);
  });
}
