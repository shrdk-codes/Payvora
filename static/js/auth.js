import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup,
    GoogleAuthProvider, 
    browserLocalPersistence,
    setPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

console.log("🚀 Auth initializing...");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch(err => {});

// Setup login button ONLY
const loginBtn = document.getElementById('googleLoginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("🖱️ Login clicked");
        
        loginBtn.disabled = true;
        loginBtn.textContent = "Opening Google...";
        
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("✅ Logged in:", result.user.email);
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                console.error("❌ Error:", error.code);
                loginBtn.disabled = false;
                loginBtn.textContent = "Continue with Google";
            });
    });
}

console.log("✨ Ready!");
