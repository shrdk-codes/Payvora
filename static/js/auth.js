import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithRedirect,
    GoogleAuthProvider, 
    browserLocalPersistence,
    setPersistence,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch(() => {});

// Add this to check auth state on page load
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

const loginBtn = document.getElementById('googleLoginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginBtn.disabled = true;
        loginBtn.textContent = "Redirecting to Google...";
        
        signInWithRedirect(auth, provider)
            .catch((error) => {
                console.error("❌ Error:", error.code);
                loginBtn.disabled = false;
                loginBtn.textContent = "Continue with Google";
            });
    });
}
