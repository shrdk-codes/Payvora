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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("✅ Firebase initialized");

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

// Set persistence
setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("✅ Persistence set"))
    .catch(err => console.warn("⚠️ Persistence error:", err));

// CRITICAL: Check if user is RETURNING from Google login redirect
console.log("🔍 Checking for redirect result...");
getRedirectResult(auth)
    .then((result) => {
        if (result && result.user) {
            console.log("✅✅✅ LOGIN SUCCESSFUL!", result.user.email);
            window.location.replace("dashboard.html");
        }
    })
    .catch((error) => {
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
    if (!loginBtn) {
        console.warn("❌ Button not found");
        return;
    }
    
    console.log("✅ Button found");
    
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("🖱️ Login clicked");
        
        loginBtn.disabled = true;
        loginBtn.textContent = "Opening Google...";
        
        // Use REDIRECT instead of POPUP - cannot be blocked!
        signInWithRedirect(auth, provider)
            .catch((error) => {
                console.error("❌ Error:", error.code);
                loginBtn.disabled = false;
                loginBtn.textContent = "Continue with Google";
            });
    });
}

// Check auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ User logged in:", user.email);
        const path = window.location.pathname;
        if (path.includes("Start.html") || path === "/" || path.includes("templates")) {
            window.location.replace("dashboard.html");
        }
    } else {
        console.log("❌ User not logged in");
    }
});

console.log("✨ Auth ready!");
