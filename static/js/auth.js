import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById('googleLoginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("User logged in:", result.user);
            // Redirect to dashboard after successful login
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error("Auth Error:", error);
            alert("Login failed. Please try again.");
        }
    });
}
