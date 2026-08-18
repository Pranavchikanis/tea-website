// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorAlert = document.getElementById('login-error');

    if (auth.isAuthenticated()) {
        window.location.href = '/shop.html';
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        try {
            errorAlert.classList.add('d-none');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            await auth.login(email, password);
            
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect') || '/shop.html';
            window.location.href = redirect;

        } catch (error) {
            errorAlert.textContent = error.message || 'Invalid email or password';
            errorAlert.classList.remove('d-none');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
});
