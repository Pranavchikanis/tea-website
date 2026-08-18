// js/checkout.js

document.addEventListener('DOMContentLoaded', () => {
    const checkoutContent = document.getElementById('checkout-content');
    const successContent = document.getElementById('success-content');
    const checkoutForm = document.getElementById('checkout-form');
    const orderItemsContainer = document.getElementById('order-items-container');
    const orderTotalAmount = document.getElementById('order-total-amount');
    const alertBox = document.getElementById('checkout-alert');

    // Wait for auth to init
    setTimeout(async () => {
        if (!auth.isAuthenticated()) {
            window.location.href = '/login.html?redirect=/checkout.html';
            return;
        }

        try {
            const cartData = await api.get('/cart');
            
            if (!cartData.items || cartData.items.length === 0) {
                window.location.href = '/cart.html';
                return;
            }

            renderSummary(cartData);
            checkoutContent.classList.remove('d-none');
            
        } catch (error) {
            showError('Failed to load cart summary: ' + error.message);
        }
    }, 500);

    function renderSummary(cartData) {
        orderItemsContainer.innerHTML = cartData.items.map(item => `
            <div class="order-item-summary">
                <span>${item.quantity}x ${item.productName}</span>
                <span>$${(item.productPrice * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        orderTotalAmount.textContent = `$${cartData.totalAmount.toFixed(2)}`;
    }

    function showError(message) {
        alertBox.textContent = message;
        alertBox.className = 'alert alert-error';
        alertBox.classList.remove('d-none');
        window.scrollTo(0, 0);
    }

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const shippingAddress = document.getElementById('shippingAddress').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            alertBox.classList.add('d-none');

            await api.post('/orders', {
                shippingAddress,
                paymentMethod
            });

            checkoutContent.classList.add('d-none');
            successContent.classList.remove('d-none');
            
            // Update nav cart count to 0
            const countSpan = document.getElementById('nav-cart-count');
            if (countSpan) countSpan.textContent = '0';

        } catch (error) {
            showError('Checkout failed: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    });
});
