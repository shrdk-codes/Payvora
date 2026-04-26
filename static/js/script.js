import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithRedirect,
    GoogleAuthProvider, 
    onAuthStateChanged,
    getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

console.log("🚀 Initializing Firebase...");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const loginBtn = document.getElementById('googleLoginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log("🖱️ Clicked - Starting Google sign in...");
        loginBtn.disabled = true;
        loginBtn.textContent = "Redirecting...";
        
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("❌ Error:", error.code, error.message);
            loginBtn.disabled = false;
            loginBtn.textContent = "Continue with Google";
        }
    });
}

// Handle returning from Google login
getRedirectResult(auth)
    .then((result) => {
        if (result && result.user) {
            console.log("✅ Login successful:", result.user.email);
            window.location.replace("dashboard.html");
        }
    })
    .catch((error) => {
        console.error("❌ Redirect error:", error.code);
    });

// Check if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ Already logged in:", user.email);
        if (window.location.pathname.includes("Start.html")) {
            window.location.replace("dashboard.html");
        }
    }
});
