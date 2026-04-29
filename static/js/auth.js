import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, // Changed from signInWithRedirect
    GoogleAuthProvider, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 1. Monitor Auth State
// This only redirects if a user is ALREADY signed in when they hit the page
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User detected, moving to dashboard...");
        window.location.href = "/templates/dashboard.html";
    }
});

const loginBtn = document.getElementById('googleLoginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            loginBtn.disabled = true;
            loginBtn.textContent = "Signing in...";
            
            // 2. Use Popup instead of Redirect
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            if (user) {
                console.log("Login successful:", user.email);
                window.location.href = "/templates/dashboard.html";
            }
        } catch (error) {
            console.error("Auth Error:", error.code, error.message);
            alert("Login failed: " + error.message);
            loginBtn.disabled = false;
            loginBtn.textContent = "Continue with Google";
        }
    });
}
