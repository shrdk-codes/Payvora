import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const loginBtn = document.getElementById('googleLoginBtn');

// 1. IMPROVED PROTECTION LOGIC
// We use a flag to wait for the first auth response before redirecting
let isInitialAuthCheck = true;

onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    const isDashboard = path.endsWith("dashboard.html");

    if (isInitialAuthCheck) {
        isInitialAuthCheck = false;
        // Optional: Hide a loading spinner here
    }

    if (!user && isDashboard) {
        console.warn("No user found, redirecting...");
        window.location.replace("start.html"); 
    }
});

// 2. STRENGTHENED LOGIN LOGIC
if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            // Ensure persistence is set to local before signing in
            await setPersistence(auth, browserLocalPersistence);
            
            const result = await signInWithPopup(auth, provider);
            if (result.user) {
                window.location.replace("dashboard.html");
            }
        } catch (error) {
            console.error("Auth Error:", error.code);
            
            // Refined Error Handling
            switch (error.code) {
                case 'auth/popup-blocked':
                    alert("Popup blocked! Please allow popups for this website.");
                    break;
                case 'auth/popup-closed-by-user':
                    console.log("User closed the popup before finishing.");
                    break;
                case 'auth/cancelled-popup-request':
                    console.log("Only one popup allowed at a time.");
                    break;
                default:
                    alert("Login failed: " + error.message);
            }
        }
    });
}
