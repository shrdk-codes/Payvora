const loginBtn = document.getElementById('googleLoginBtn');
const authLoader = document.getElementById('authLoader');

if (authLoader) authLoader.style.display = 'none';

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginBtn.disabled = true;
        const textNode = Array.from(loginBtn.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.textContent = ' Logging in with Google...';
        window.location.href = '/templates/dashboard.html';
    });
}
