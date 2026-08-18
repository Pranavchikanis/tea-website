// js/admin-products.js

document.addEventListener('DOMContentLoaded', () => {
    const alertBox = document.getElementById('admin-alert');
    const productList = document.getElementById('product-list');
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    
    let products = [];

    // Check auth
    setTimeout(async () => {
        if (!auth.isAuthenticated() || auth.currentUser.role !== 'ROLE_ADMIN') {
            window.location.href = '/login.html';
            return;
        }
        
        await loadProducts();
    }, 500);

    async function loadProducts() {
        try {
            products = await api.get('/admin/products');
            renderTable();
        } catch (error) {
            showError('Failed to load products: ' + error.message);
        }
    }

    function renderTable() {
        if (products.length === 0) {
            productList.innerHTML = '<tr><td colspan="7" style="text-align: center;">No products found.</td></tr>';
            return;
        }

        productList.innerHTML = products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td>${p.categoryName || '-'}</td>
                <td>$${p.price.toFixed(2)}</td>
                <td>${p.stockQuantity}</td>
                <td>
                    <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; 
                                 background: ${p.isActive ? '#e8f5e9' : '#ffebee'}; color: ${p.isActive ? '#2e7d32' : '#c62828'};">
                        ${p.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;" onclick="editProduct(${p.id})">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    // Modal UI
    document.getElementById('btn-add-product').addEventListener('click', () => {
        form.reset();
        document.getElementById('prod-id').value = '';
        document.getElementById('modal-title').textContent = 'Add Product';
        modal.classList.remove('d-none');
    });

    document.getElementById('btn-close-modal').addEventListener('click', () => {
        modal.classList.add('d-none');
    });

    window.editProduct = (id) => {
        const p = products.find(prod => prod.id === id);
        if (!p) return;
        
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-desc').value = p.description;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-stock').value = p.stockQuantity;
        document.getElementById('prod-category').value = p.categoryId || '';
        document.getElementById('prod-image').value = p.imageUrl || '';
        document.getElementById('prod-active').checked = p.isActive;
        
        document.getElementById('modal-title').textContent = 'Edit Product';
        modal.classList.remove('d-none');
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('prod-id').value;
        const payload = {
            name: document.getElementById('prod-name').value,
            description: document.getElementById('prod-desc').value,
            price: parseFloat(document.getElementById('prod-price').value),
            stockQuantity: parseInt(document.getElementById('prod-stock').value, 10),
            categoryId: parseInt(document.getElementById('prod-category').value, 10) || null,
            imageUrl: document.getElementById('prod-image').value,
            isActive: document.getElementById('prod-active').checked
        };

        try {
            if (id) {
                await api.put(`/admin/products/${id}`, payload);
                showSuccess('Product updated successfully!');
            } else {
                await api.post('/admin/products', payload);
                showSuccess('Product created successfully!');
            }
            modal.classList.add('d-none');
            await loadProducts();
        } catch (error) {
            showError('Failed to save product: ' + error.message);
        }
    });

    function showError(message) {
        alertBox.textContent = message;
        alertBox.className = 'alert alert-error';
        alertBox.classList.remove('d-none');
        setTimeout(() => alertBox.classList.add('d-none'), 5000);
    }

    function showSuccess(message) {
        alertBox.textContent = message;
        alertBox.className = 'alert alert-success';
        alertBox.classList.remove('d-none');
        setTimeout(() => alertBox.classList.add('d-none'), 5000);
    }
});
