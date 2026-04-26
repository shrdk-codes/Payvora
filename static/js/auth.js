import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithRedirect,
    GoogleAuthProvider, 
    onAuthStateChanged,
    browserLocalPersistence,
    setPersistence,
    getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

console.log("🚀 Auth script loading...");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("✅ Firebase initialized");

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

setPersistence(auth, browserLocalPersistence)
    .catch(err => console.warn("⚠️ Persistence error:", err));

// Flags to prevent infinite loop
let redirectProcessed = false;
let authStateProcessed = false;

// Check redirect result
console.log("🔍 Checking for redirect result...");
getRedirectResult(auth)
    .then((result) => {
        redirectProcessed = true;
        if (result && result.user) {
            console.log("✅✅✅ LOGIN SUCCESSFUL!", result.user.email);
        } else {
            console.log("📍 No redirect result");
        }
    })
    .catch((error) => {
        redirectProcessed = true;
        console.error("❌ Redirect error:", error.code);
    });

// Setup login button
let loginBtn = document.getElementById('googleLoginBtn');

if (!loginBtn) {
    document.addEventListener('DOMContentLoaded', () => {
        loginBtn = document.getElementById('googleLoginBtn');
        setupButton();
    });
} else {
    setupButton();
}

function setupButton() {
    if (!loginBtn) return;
    
    console.log("✅ Button found");
    
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("🖱️ Login clicked");
        
        loginBtn.disabled = true;
        loginBtn.textContent = "Opening Google...";
        
        signInWithRedirect(auth, provider)
            .catch((error) => {
                console.error("❌ Error:", error.code);
                loginBtn.disabled = false;
                loginBtn.textContent = "Continue with Google";
            });
    });
}

// Handle auth state - but WAIT for redirect to complete first
onAuthStateChanged(auth, (user) => {
    // Wait for redirect result to be processed
    if (!redirectProcessed) {
        console.log("⏳ Waiting for redirect...");
        return;
    }
    
    // Only process once
    if (authStateProcessed) {
        console.log("✓ Auth already processed");
        return;
    }
    
    authStateProcessed = true;
    const path = window.location.pathname;
    
    if (user) {
        console.log("✅ User logged in:", user.email);
        
        // Only redirect FROM login page TO dashboard
        if (path.includes("Start.html") || path === "/" || path.includes("templates")) {
            console.log("📍 Redirecting to dashboard");
            window.location.replace("dashboard.html");
        }
    } else {
        console.log("❌ User not logged in");
        
        // Only redirect FROM dashboard TO login
        if (path.includes("dashboard.html")) {
            console.log("🚫 Redirecting to login");
            window.location.replace("../templates/Start.html");
        }
    }
});

console.log("✨ Auth ready!");
