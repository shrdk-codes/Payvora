import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup,
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

// Check if already signed in on page load
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "/templates/dashboard.html";
    }
});

const loginBtn = document.getElementById('googleLoginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        loginBtn.disabled = true;
        loginBtn.textContent = "Opening Google...";
        
        try {
            await signInWithPopup(auth, provider);
            console.log("✅ Logged in via popup");
            window.location.href = "/templates/dashboard.html";
        } catch (error) {
            if (error.code === 'auth/popup-blocked') {
                console.log("Popup blocked, falling back to redirect");
                try {
                    await signInWithRedirect(auth, provider);
                } catch (redirectError) {
                    console.error("Redirect error:", redirectError.code);
                    loginBtn.disabled = false;
                    loginBtn.textContent = "Continue with Google";
                }
            } else {
                console.error("Popup error:", error.code);
                loginBtn.disabled = false;
                loginBtn.textContent = "Continue with Google";
            }
        }
    });
}
