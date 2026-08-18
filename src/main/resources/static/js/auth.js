// js/auth.js

const auth = {
    currentUser: null,

    async init() {
        try {
            this.currentUser = await api.get('/auth/me');
            this.updateAuthUI();
        } catch (error) {
            this.currentUser = null;
            this.updateAuthUI();
        }
    },

    async login(email, password) {
        try {
            this.currentUser = await api.post('/auth/login', { email, password });
            this.updateAuthUI();
            return true;
        } catch (error) {
            throw error;
        }
    },

    async register(fullName, email, password) {
        try {
            await api.post('/auth/register', { fullName, email, password });
            return true;
        } catch (error) {
            throw error;
        }
    },

    async logout() {
        try {
            await api.post('/auth/logout', {});
            this.currentUser = null;
            this.updateAuthUI();
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Logout failed', error);
        }
    },

    isAuthenticated() {
        return this.currentUser !== null;
    },

    updateAuthUI() {
        const guestElements = document.querySelectorAll('.guest-only');
        const authElements = document.querySelectorAll('.auth-only');
        const adminElements = document.querySelectorAll('.admin-only');
        const userNameDisplays = document.querySelectorAll('.user-name-display');

        if (this.isAuthenticated()) {
            guestElements.forEach(el => el.classList.add('d-none'));
            authElements.forEach(el => el.classList.remove('d-none'));
            userNameDisplays.forEach(el => el.textContent = this.currentUser.fullName);
            
            if (this.currentUser.role === 'ROLE_ADMIN') {
                adminElements.forEach(el => el.classList.remove('d-none'));
            } else {
                adminElements.forEach(el => el.classList.add('d-none'));
            }
        } else {
            guestElements.forEach(el => el.classList.remove('d-none'));
            authElements.forEach(el => el.classList.add('d-none'));
            adminElements.forEach(el => el.classList.add('d-none'));
            userNameDisplays.forEach(el => el.textContent = '');
        }
    }
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.init();

    // Attach logout handlers
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    });
});
