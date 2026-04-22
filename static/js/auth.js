import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// If we came back from a redirect sign-in, finish it here.
try {
  const redirectResult = await getRedirectResult(auth);
  if (redirectResult?.user) {
    console.log("User logged in (redirect):", redirectResult.user);
    window.location.href = "dashboard.html";
  }
} catch (error) {
  console.error("Redirect Auth Error:", error);
}

const loginBtn = document.getElementById("googleLoginBtn");

function friendlyAuthMessage(error) {
  const code = error?.code || "";
  if (code === "auth/popup-blocked") {
    return "Popup was blocked by the browser. Redirecting to Google sign-in…";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Popup was closed before completing sign-in. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      // Keep popup attempt directly inside the click handler.
      const result = await signInWithPopup(auth, provider);
      console.log("User logged in (popup):", result.user);
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Auth Error:", error);

      // Fallback for desktop popup-blocked scenarios
      if (error?.code === "auth/popup-blocked") {
        alert(friendlyAuthMessage(error));
        await signInWithRedirect(auth, provider);
        return;
      }

      alert(friendlyAuthMessage(error));
    }
  });
}
