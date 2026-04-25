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

const loginBtn = document.getElementById('googleLoginBtn');

// 1. DUAL-PURPOSE AUTH MONITOR
onAuthStateChanged(auth, (user) => {
    const isDashboard = window.location.pathname.includes("dashboard.html");
    const isStartPage = window.location.pathname.includes("start.html");

    if (user && isStartPage) {
        window.location.replace("dashboard.html");
    } else if (!user && isDashboard) {
        window.location.replace("start.html");
    }
});

// 2. THE INSTANT POPUP (No async/await here to preserve user gesture)
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        console.log("Triggering popup immediately...");

        // CRITICAL: No code can come before this line. 
        // No 'await', no 'fetch', no 'if' statements.
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("Success!");
                window.location.replace("dashboard.html");
            })
            .catch((error) => {
                console.error("Firebase Error Code:", error.code);
                if (error.code === 'auth/popup-blocked') {
                    alert("Chrome is still blocking the window. Try this: \n1. Look at the URL bar for a 'red x' icon.\n2. Click it and select 'Always allow'.\n3. REFRESH THE PAGE (Required!)");
                }
            });
    });
}
