// js/register.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorAlert = document.getElementById('register-error');

    if (auth.isAuthenticated()) {
        window.location.href = '/shop.html';
        return;
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        try {
            errorAlert.classList.add('d-none');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';

            await auth.register(fullName, email, password);
            
            // Auto login after registration
            await auth.login(email, password);
            
            window.location.href = '/shop.html';

        } catch (error) {
            errorAlert.textContent = error.message || 'Registration failed';
            errorAlert.classList.remove('d-none');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });
});
