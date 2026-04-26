if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Disable button to prevent double clicks
        loginBtn.disabled = true;

        // Set persistence in background (fire and forget)
        setPersistence(auth, browserLocalPersistence).catch(err => 
            console.warn("Persistence error:", err)
        );

        // Trigger popup IMMEDIATELY
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("Login successful!");
                window.location.replace("dashboard.html");
            })
            .catch((error) => {
                console.error("Auth Error Code:", error.code);
                console.error("Auth Error Message:", error.message);
                
                if (error.code === 'auth/popup-blocked') {
                    alert("❌ Popup blocked! Please:\n1. Check your browser's popup settings\n2. Add this site to popup exceptions\n3. Try again");
                } else if (error.code === 'auth/popup-closed-by-user') {
                    console.log("User closed the window.");
                    loginBtn.disabled = false;
                } else {
                    alert("Error: " + error.message);
                    loginBtn.disabled = false;
                }
            });
    });
}
