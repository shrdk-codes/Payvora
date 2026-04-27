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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("✅ Firebase initialized");

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

setPersistence(auth, browserLocalPersistence)
    .catch(err => console.warn("⚠️ Persistence error:", err));

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
        
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("✅ Login successful:", result.user.email);
                // Direct navigation - NO onAuthStateChanged redirect
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                console.error("❌ Auth Error:", error.code);
                loginBtn.disabled = false;
                loginBtn.textContent = "Continue with Google";
                
                if (error.code === 'auth/popup-blocked') {
                    alert("❌ Popup blocked!\n\nPlease enable popups and try again");
                } else if (error.code !== 'auth/popup-closed-by-user') {
                    alert("Error: " + error.message);
                }
            });
    });
}

// ONLY check on page load - NOT on every auth change
console.log("🔐 Checking auth on page load...");

onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!user && currentPage === 'dashboard.html') {
        console.log("🚫 Dashboard: No user → redirect to login");
        window.location.href = "templates/Start.html";
    } else if (user && currentPage === 'Start.html') {
        console.log("✅ Login page: User logged in → redirect to dashboard");
        window.location.href = "dashboard.html";
    }
});

console.log("✨ Auth ready!");
