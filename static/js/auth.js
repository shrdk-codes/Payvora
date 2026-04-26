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

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const loginBtn = document.getElementById('googleLoginBtn');

/**
 * PROTECTION LOGIC
 * We use 'isInitializing' to prevent the race condition that causes loops.
 */
let isInitializing = true;

onAuthStateChanged(auth, (user) => {
    isInitializing = false; 
    const path = window.location.pathname;
    const isDashboard = path.includes("dashboard.html");
    const isStartPage = path.includes("start.html") || path === "/";

    if (user) {
        console.log("User detected:", user.email);
        // If logged in and on start page, move to dashboard
        if (isStartPage) {
            window.location.replace("dashboard.html");
        }
    } else {
        // If NOT logged in and trying to see dashboard, kick to start
        if (isDashboard) {
            console.warn("Access denied. Redirecting to login...");
            window.location.replace("start.html");
        }
    }
});

/**
 * LOGIN LOGIC
 * CRITICAL: Popup MUST be triggered synchronously within the click event
 * Do NOT await setPersistence before signInWithPopup - browsers block delayed popups
 */
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Set persistence in background (fire and forget)
        setPersistence(auth, browserLocalPersistence).catch(err => 
            console.warn("Persistence error:", err)
        );

        // Trigger popup IMMEDIATELY (synchronously within click handler)
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("Login successful!");
                window.location.replace("dashboard.html");
            })
            .catch((error) => {
                console.error("Auth Error:", error.code);
                
                if (error.code === 'auth/popup-blocked') {
                    alert("Popup blocked! Please check your URL bar and allow popups for this site, then refresh.");
                } else if (error.code === 'auth/popup-closed-by-user') {
                    console.log("User closed the window.");
                } else {
                    alert("Error: " + error.message);
                }
            });
    });
}
