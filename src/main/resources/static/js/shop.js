// js/shop.js

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const categoryFilter = document.getElementById('category-filter');

    let allProducts = [];

    async function loadCategories() {
        try {
            const categories = await api.get('/categories');
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categoryFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    }

    async function loadProducts(categoryId = '') {
        try {
            const endpoint = categoryId ? `/products?categoryId=${categoryId}` : '/products';
            allProducts = await api.get(endpoint);
            renderProducts(allProducts);
        } catch (error) {
            productGrid.innerHTML = `<div class="alert alert-error">Failed to load products: ${error.message}</div>`;
        }
    }

    function renderProducts(products) {
        if (products.length === 0) {
            productGrid.innerHTML = '<p>No products found.</p>';
            return;
        }

        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.imageUrl || 'https://via.placeholder.com/300x250?text=No+Image'}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x250?text=Image+Not+Found'">
                <div class="product-info">
                    <span class="product-category">${product.categoryName}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        `).join('');
    }

    categoryFilter.addEventListener('change', (e) => {
        loadProducts(e.target.value);
    });

    loadCategories();
    loadProducts();
});

async function addToCart(productId) {
    if (!auth.isAuthenticated()) {
        window.location.href = '/login.html?redirect=/shop.html';
        return;
    }
    
    try {
        await api.post('/cart/items', { productId: productId, quantity: 1 });
        await auth.updateCartCount();
        
        // Find button and show success temporarily
        const btns = document.querySelectorAll(`button[onclick="addToCart(${productId})"]`);
        btns.forEach(btn => {
            const originalText = btn.textContent;
            btn.textContent = 'Added!';
            btn.style.backgroundColor = 'var(--success-color)';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
            }, 2000);
        });
    } catch (error) {
        alert('Failed to add to cart: ' + error.message);
    }
}
