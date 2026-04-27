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

// Single flag - only process redirect result once
let redirectChecked = false;

// Check redirect result first; once resolved, run the auth-state handler
// in case onAuthStateChanged already fired before getRedirectResult completed.
console.log("🔍 Checking for redirect result...");
getRedirectResult(auth)
    .then((result) => {
        if (result && result.user) {
            console.log("✅✅✅ LOGIN SUCCESSFUL!", result.user.email);
        } else {
            console.log("📍 No redirect result");
        }
    })
    .catch((error) => {
        console.error("❌ Redirect error:", error.code);
    })
    .finally(() => {
        redirectChecked = true;
        // onAuthStateChanged may have already fired while redirectChecked was false;
        // manually check current user now so navigation is not skipped.
        handleAuthState(auth.currentUser);
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

// Handle auth state changes - wait for redirect result to be processed first
onAuthStateChanged(auth, (user) => {
    if (!redirectChecked) {
        // getRedirectResult hasn't resolved yet; handleAuthState will be called
        // manually from the getRedirectResult .finally() handler.
        console.log("⏳ Redirect not checked yet, will handle after redirect resolves...");
        return;
    }
    handleAuthState(user);
});

function handleAuthState(user) {
    // Only compare the filename, not the full path, to avoid partial-match loops
    const filename = window.location.pathname.split('/').pop() || '';
    console.log("📄 Current page:", filename);

    if (user) {
        console.log("✅ User logged in:", user.email);

        // Only redirect FROM Start.html (login page) → dashboard.
        // An empty filename means the path is "/" (root), which should also go to dashboard.
        if (filename === 'Start.html' || filename === '') {
            console.log("📍 On login page, redirecting to dashboard");
            window.location.replace("dashboard.html");
        }
    } else {
        console.log("❌ User NOT logged in");

        // Only redirect FROM dashboard.html → login
        if (filename === 'dashboard.html') {
            console.log("🚫 On dashboard without login, redirecting to Start");
            window.location.replace("../templates/Start.html");
        }
    }
}

console.log("✨ Auth ready!");
