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

// Force Chrome to recognize the user gesture
provider.setCustomParameters({ prompt: 'select_account' });

const loginBtn = document.getElementById('googleLoginBtn');

// 1. PROTECTION LOGIC: If a user tries to access dashboard.html without a session
onAuthStateChanged(auth, (user) => {
    const isDashboard = window.location.pathname.includes("dashboard.html");
    if (!user && isDashboard) {
        console.warn("No user found, kicking to start page.");
        window.location.replace("start.html"); 
    }
});

// 2. LOGIN LOGIC
if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevents any weird form reloads
        console.log("Attempting login...");

        try {
            const result = await signInWithPopup(auth, provider);
            if (result.user) {
                console.log("Login Success:", result.user.email);
                // Use replace to prevent the user from clicking "back" to the login page
                window.location.replace("dashboard.html");
            }
        } catch (error) {
            console.error("Full Auth Error Object:", error);
            
            if (error.code === 'auth/popup-blocked') {
                alert("Chrome blocked the popup! Please click the icon in the URL bar to allow popups for this site.");
            } else {
                alert("Error: " + error.message);
            }
        }
    });
}
