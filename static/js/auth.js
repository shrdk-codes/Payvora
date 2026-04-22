import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Complete redirect sign-in after coming back from Google
try {
  const result = await getRedirectResult(auth);
  if (result?.user) {
    console.log("User logged in:", result.user);
    // Start.html and dashboard.html are both in /templates
    window.location.replace("dashboard.html");
  }
} catch (error) {
  console.error("Redirect Auth Error:", error);
  alert("Login failed. Please try again.");
}

const loginBtn = document.getElementById("googleLoginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Login failed. Please try again.");
    }
  });
}
