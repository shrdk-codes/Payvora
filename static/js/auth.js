// 1. Create a variable to track the initialization state
let isAuthResolving = true;

// 2. Handle the redirect result FIRST
getRedirectResult(auth)
    .then((result) => {
        isAuthResolving = false; // Firebase has finished checking the redirect
        if (result?.user) {
            window.location.replace("dashboard.html");
        }
    })
    .catch((error) => {
        isAuthResolving = false;
        console.error("Redirect Error:", error.code);
    });

// 3. Update your protection logic to "Wait"
onAuthStateChanged(auth, (user) => {
    const isDashboard = window.location.pathname.includes("dashboard.html");

    // CRITICAL: If we are still resolving the redirect result, 
    // DO NOT redirect the user anywhere yet.
    if (isAuthResolving) return;

    if (!user && isDashboard) {
        console.warn("No user found after check, moving to start.");
        window.location.replace("start.html"); 
    }
});
