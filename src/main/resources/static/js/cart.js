// js/cart.js

const cart = {
    async loadCart() {
        if (!auth.isAuthenticated()) {
            window.location.href = '/login.html?redirect=/cart.html';
            return;
        }

        try {
            const cartData = await api.get('/cart');
            this.renderCart(cartData);
            this.updateNavCount(cartData);
        } catch (error) {
            this.showError('Failed to load cart: ' + error.message);
        }
    },

    async updateQuantity(itemId, newQuantity) {
        try {
            const cartData = await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
            this.renderCart(cartData);
            this.updateNavCount(cartData);
        } catch (error) {
            this.showError('Failed to update quantity: ' + error.message);
            this.loadCart(); // reload to revert to actual state
        }
    },

    async removeItem(itemId) {
        try {
            const cartData = await api.delete(`/cart/items/${itemId}`);
            this.renderCart(cartData);
            this.updateNavCount(cartData);
        } catch (error) {
            this.showError('Failed to remove item: ' + error.message);
        }
    },

    renderCart(cartData) {
        const cartContent = document.getElementById('cart-content');
        const emptyCartMsg = document.getElementById('empty-cart-msg');
        const cartItemsList = document.getElementById('cart-items-list');
        const summarySubtotal = document.getElementById('summary-subtotal');
        const summaryTotal = document.getElementById('summary-total');

        if (!cartData.items || cartData.items.length === 0) {
            cartContent.classList.add('d-none');
            emptyCartMsg.classList.remove('d-none');
            return;
        }

        cartContent.classList.remove('d-none');
        emptyCartMsg.classList.add('d-none');

        cartItemsList.innerHTML = cartData.items.map(item => `
            <div class="cart-item">
                <img src="${item.productImageUrl || 'https://via.placeholder.com/100?text=No+Image'}" alt="${item.productName}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/100?text=Image+Not+Found'">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.productName}</h4>
                    <div class="cart-item-price">$${item.productPrice.toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                           onchange="cart.handleQuantityChange(${item.id}, this.value)">
                    <button class="btn-remove" onclick="cart.removeItem(${item.id})">Remove</button>
                </div>
                <div class="cart-item-price" style="min-width: 80px; text-align: right;">
                    $${(item.productPrice * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');

        const formattedTotal = `$${cartData.totalAmount.toFixed(2)}`;
        summarySubtotal.textContent = formattedTotal;
        summaryTotal.textContent = formattedTotal;
    },

    updateNavCount(cartData) {
        const countSpan = document.getElementById('nav-cart-count');
        if (countSpan && cartData.items) {
            const count = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
            countSpan.textContent = count;
        }
    },

    handleQuantityChange(itemId, value) {
        const qty = parseInt(value, 10);
        if (isNaN(qty) || qty < 1) return;
        this.updateQuantity(itemId, qty);
    },

    showError(message) {
        const alert = document.getElementById('cart-alert');
        alert.textContent = message;
        alert.className = 'alert alert-error';
        
        setTimeout(() => {
            alert.classList.add('d-none');
        }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Check auth directly since cart page requires it
    setTimeout(() => {
        if (auth.isAuthenticated()) {
            cart.loadCart();
        } else {
            window.location.href = '/login.html?redirect=/cart.html';
        }
    }, 500); // Give auth.js a moment to init

    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        window.location.href = '/checkout.html';
    });
});
