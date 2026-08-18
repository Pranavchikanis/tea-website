// js/account.js

document.addEventListener('DOMContentLoaded', () => {
    const accountView = document.getElementById('account-view');
    const alertBox = document.getElementById('account-alert');
    
    // Wait for auth init
    setTimeout(async () => {
        if (!auth.isAuthenticated()) {
            window.location.href = '/login.html?redirect=/account.html';
            return;
        }

        try {
            await loadProfile();
            await loadOrders();
            accountView.classList.remove('d-none');
        } catch (error) {
            showError('Failed to load account details: ' + error.message);
        }
    }, 500);

    async function loadProfile() {
        const user = auth.currentUser;
        if (!user) return;
        
        document.getElementById('profile-name').textContent = user.fullName;
        document.getElementById('profile-email').textContent = user.email;
        
        // Initials for avatar
        const initials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('profile-initial').textContent = initials;
    }

    async function loadOrders() {
        const ordersContainer = document.getElementById('orders-container');
        
        try {
            const orders = await api.get('/orders');
            
            if (!orders || orders.length === 0) {
                ordersContainer.innerHTML = `
                    <div style="text-align: center; padding: 3rem 0;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                        <h3 style="margin-bottom: 0.5rem;">No orders yet</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">You haven't placed any orders.</p>
                        <a href="/shop.html" class="btn btn-primary">Start Shopping</a>
                    </div>
                `;
                return;
            }

            // Sort orders newest first
            orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            ordersContainer.innerHTML = orders.map(order => {
                const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                
                const itemsHtml = order.items.map(item => `
                    <li class="order-item">
                        <span>${item.quantity}x ${item.productName}</span>
                        <span>$${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                    </li>
                `).join('');

                return `
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-meta">
                                <div class="meta-group">
                                    <span class="meta-label">Order Placed</span>
                                    <span class="meta-value">${date}</span>
                                </div>
                                <div class="meta-group">
                                    <span class="meta-label">Total</span>
                                    <span class="meta-value">$${order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div class="meta-group">
                                    <span class="meta-label">Order #</span>
                                    <span class="meta-value">${order.id}</span>
                                </div>
                            </div>
                            <div class="order-status">${order.status}</div>
                        </div>
                        <div class="order-body">
                            <h4 style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">Items</h4>
                            <ul class="order-item-list">
                                ${itemsHtml}
                            </ul>
                            <div style="margin-top: 1rem; font-size: 0.875rem;">
                                <strong>Shipping To:</strong><br>
                                <span style="color: var(--text-secondary); white-space: pre-wrap;">${order.shippingAddress}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            ordersContainer.innerHTML = `<div class="alert alert-error">Failed to load orders: ${error.message}</div>`;
        }
    }

    function showError(message) {
        alertBox.textContent = message;
        alertBox.className = 'alert alert-error';
        alertBox.classList.remove('d-none');
    }
});
