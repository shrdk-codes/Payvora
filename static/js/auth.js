import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 1. Silent Check: If already logged in, just move them.
// This handles the "session" so they don't have to click login every time.
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.assign("/templates/dashboard.html");
    }
});

const loginBtn = document.getElementById('googleLoginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Visual feedback
        loginBtn.disabled = true;
        loginBtn.textContent = "Opening Google...";

        try {
            // STRATEGY: Call signInWithPopup immediately. 
            // Browsers only allow popups if they are the direct result of a click.
            const result = await signInWithPopup(auth, provider);
            
            if (result.user) {
                console.log("Success!");
                window.location.assign("/templates/dashboard.html");
            }
        } catch (error) {
            console.error("Popup Error:", error.code);
            
            // Handle the specific "Blocked" error
            if (error.code === 'auth/popup-blocked') {
                alert("Please allow popups for this website to sign in, or check your browser settings.");
            } else if (error.code === 'auth/popup-closed-by-user') {
                alert("Login cancelled. Please try again.");
            } else {
                alert("Error: " + error.message);
            }
            
            // Reset button if it fails
            loginBtn.disabled = false;
            loginBtn.textContent = "Continue with Google";
        }
    });
}
