import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithRedirect, 
    getRedirectResult, 
    GoogleAuthProvider, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const loginBtn = document.getElementById('googleLoginBtn');

// 1. HANDLE REDIRECT RESULT (Runs when the page returns from Google)
getRedirectResult(auth)
    .then((result) => {
        if (result?.user) {
            console.log("Redirect Login Success:", result.user.email);
            window.location.replace("dashboard.html");
        }
    })
    .catch((error) => {
        console.error("Redirect Error:", error.code, error.message);
        alert("Login failed: " + error.message);
    });

// 2. PROTECTION LOGIC
onAuthStateChanged(auth, (user) => {
    const isDashboard = window.location.pathname.includes("dashboard.html");
    if (!user && isDashboard) {
        window.location.replace("start.html"); 
    }
});

// 3. LOGIN TRIGGER
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // This will redirect the entire tab to Google's login page
        signInWithRedirect(auth, provider);
    });
}
