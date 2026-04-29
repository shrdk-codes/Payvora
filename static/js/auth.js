import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithRedirect,
    GoogleAuthProvider, 
    onAuthStateChanged,
    getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 1. Handle the result of the redirect FIRST
getRedirectResult(auth)
    .then((result) => {
        if (result?.user) {
            // Success! Now we move to dashboard
            window.location.replace("/templates/dashboard.html");
        }
    })
    .catch((error) => {
        console.error("Redirect Error:", error.code, error.message);
        // If there's an error (like the user closed the window), 
        // stay on this page and re-enable the button
        const loginBtn = document.getElementById('googleLoginBtn');
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = "Continue with Google";
        }
    });

// 2. Only use onAuthStateChanged for users who are ALREADY logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Use .replace instead of .href to prevent "back button" loops
        window.location.replace("/templates/dashboard.html");
    }
});

const loginBtn = document.getElementById('googleLoginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginBtn.disabled = true;
        loginBtn.textContent = "Redirecting...";
        signInWithRedirect(auth, provider);
    });
}
