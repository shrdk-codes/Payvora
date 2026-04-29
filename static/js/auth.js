import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithRedirect,
    GoogleAuthProvider, 
    browserLocalPersistence,
    setPersistence,
    onAuthStateChanged,
    getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch(() => {});

// Handle redirect result on page load
getRedirectResult(auth).then((result) => {
    if (result.user) {
        console.log("Redirect success, user:", result.user.email);
        window.location.href = "/templates/dashboard.html";
    }
}).catch((error) => {
    console.error("Redirect result error:", error.code, error.message);
});

// Check if already signed in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "/templates/dashboard.html";
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
                console.error("Sign-in error:", error.code, error.message);
                loginBtn.disabled = false;
                loginBtn.textContent = "Continue with Google";
            });
    });
}
