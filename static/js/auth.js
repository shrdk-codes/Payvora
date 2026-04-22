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

// Log to see if the script is even running
console.log("Auth script loaded. Current path:", window.location.pathname);

// Handle the redirect result
getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      console.log("Redirect success! Target: dashboard.html");
      window.location.assign("dashboard.html"); 
    }
  }).catch(err => console.error("Redirect error:", err));

// The Observer - This catches the session even if getRedirectResult is weird
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Observer: User is logged in as", user.email);
    
    // Only redirect if we are currently on the start/login page
    if (window.location.pathname.includes("start.html")) {
      console.log("On start.html with active session. Moving to dashboard...");
      window.location.assign("dashboard.html");
    }
  } else {
    console.log("Observer: No active session found.");
  }
});

const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.onclick = () => signInWithRedirect(auth, provider);
}
