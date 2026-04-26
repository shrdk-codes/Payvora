import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged,
    browserLocalPersistence,
    setPersistence 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

console.log("🚀 Auth script loading...");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("✅ Firebase initialized:", auth.app.options.projectId);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

let loginBtn = null;
let isSetup = false;

// Function to setup login button
function setupLoginButton() {
    if (isSetup) return;
    
    loginBtn = document.getElementById('googleLoginBtn');
    
    if (!loginBtn) {
        console.warn("⚠️ Button #googleLoginBtn not found yet, will retry...");
        setTimeout(setupLoginButton, 100);
        return;
    }
    
    isSetup = true;
    console.log("✅ Button found and setting up click handler");
    
    loginBtn.addEventListener('click', handleLoginClick);
}

// Handle login button click
function handleLoginClick(e) {
    e.preventDefault();
    console.log("🖱️ Login button clicked");
    
    if (loginBtn.disabled) {
        console.warn("⚠️ Button already processing, ignoring click");
        return;
    }
    
    loginBtn.disabled = true;
    const originalText = loginBtn.textContent;
    loginBtn.textContent = "Loading...";
    loginBtn.style.opacity = "0.6";

    // Set persistence in background
    setPersistence(auth, browserLocalPersistence)
        .then(() => console.log("✅ Persistence set"))
        .catch(err => console.warn("⚠️ Persistence error:", err));

    // Trigger popup immediately after click
    console.log("🔓 Triggering Firebase popup...");
    
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("✅ Login successful! User:", result.user.email);
            window.location.replace("dashboard.html");
        })
        .catch((error) => {
            console.error("❌ Auth Error - Code:", error.code);
            console.error("❌ Auth Error - Message:", error.message);
            
            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.textContent = originalText;
            loginBtn.style.opacity = "1";
            
            // Show specific error messages
            if (error.code === 'auth/popup-blocked') {
                console.warn("🚫 POPUP BLOCKED - User must enable popups");
                alert("❌ POPUP BLOCKED\n\nPlease enable popups:\n1. Click 🔒 or ⓘ icon in URL bar\n2. Select 'Continue allowing' or 'Always allow'\n3. Refresh page and try again");
            } 
            else if (error.code === 'auth/popup-closed-by-user') {
                console.log("👤 User closed the popup window");
            } 
            else if (error.code === 'auth/network-request-failed') {
                console.error("🌐 NETWORK ERROR");
                alert("❌ Network Error\n\nCheck your internet connection and try again");
            }
            else if (error.code === 'auth/cancelled-popup-request') {
                console.log("⏸️ Popup request cancelled");
            }
            else {
                console.error("❌ Unexpected error:", error);
                alert("❌ Error: " + (error.message || error.code));
            }
        });
}

// Try to setup button immediately if DOM is ready
console.log("📍 Document ready state:", document.readyState);

if (document.readyState === 'loading') {
    console.log("⏳ DOM still loading, waiting for DOMContentLoaded...");
    document.addEventListener('DOMContentLoaded', () => {
        console.log("✅ DOMContentLoaded fired");
        setupLoginButton();
    });
} else {
    console.log("✅ DOM already loaded, setting up button now");
    setupLoginButton();
}

// Also try after a small delay as backup
setTimeout(() => {
    if (!isSetup) {
        console.log("📍 Retry setup after 500ms");
        setupLoginButton();
    }
}, 500);

// Monitor auth state changes
console.log("🔐 Setting up auth state listener...");

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ User is logged in:", user.email);
        const path = window.location.pathname;
        if (path.includes("Start.html") || path === "/" || path.endsWith("templates/")) {
            console.log("📍 User on login page, redirecting to dashboard...");
            window.location.replace("dashboard.html");
        }
    } else {
        console.log("❌ User is logged out");
        const path = window.location.pathname;
        if (path.includes("dashboard.html")) {
            console.log("🚫 User on dashboard without login, redirecting to login...");
            window.location.replace("../templates/Start.html");
        }
    }
});

console.log("✨ Auth module fully loaded and ready");