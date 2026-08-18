-- Categories
INSERT INTO categories (id, name, description, created_at) VALUES (1, 'Black Tea', 'Strong and dark teas', NOW());
INSERT INTO categories (id, name, description, created_at) VALUES (2, 'Green Tea', 'Light and refreshing teas', NOW());
INSERT INTO categories (id, name, description, created_at) VALUES (3, 'Herbal Tea', 'Caffeine-free herbal blends', NOW());
INSERT INTO categories (id, name, description, created_at) VALUES (4, 'Chai', 'Spiced tea blends', NOW());

-- Products
INSERT INTO products (id, category_id, name, description, price, stock_quantity, image_url, is_active, created_at, updated_at) 
VALUES (1, 1, 'Darjeeling First Flush', 'A delicate, floral black tea from the first spring harvest.', 800.00, 50, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&q=80', true, NOW(), NOW());

INSERT INTO products (id, category_id, name, description, price, stock_quantity, image_url, is_active, created_at, updated_at) 
VALUES (2, 1, 'Assam CTC', 'A strong, malty black tea perfect for mornings.', 450.00, 100, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', true, NOW(), NOW());

INSERT INTO products (id, category_id, name, description, price, stock_quantity, image_url, is_active, created_at, updated_at) 
VALUES (3, 2, 'Jasmine Green Tea', 'A fragrant green tea infused with jasmine blossoms.', 650.00, 75, 'https://images.unsplash.com/photo-1594631252845-29fc4cc8c0a1?w=800&q=80', true, NOW(), NOW());

INSERT INTO products (id, category_id, name, description, price, stock_quantity, image_url, is_active, created_at, updated_at) 
VALUES (4, 3, 'Chamomile Calm', 'A soothing herbal blend of chamomile flowers.', 550.00, 60, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80', true, NOW(), NOW());

INSERT INTO products (id, category_id, name, description, price, stock_quantity, image_url, is_active, created_at, updated_at) 
VALUES (5, 4, 'Masala Chai', 'A traditional spiced black tea blend.', 400.00, 120, 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&q=80', true, NOW(), NOW());

-- Admin User (password: admin123)
INSERT INTO users (id, role, full_name, email, password_hash, created_at)
VALUES (1, 'ROLE_ADMIN', 'Store Admin', 'admin@steepandsip.com', '$2a$10$sjtu64GaA8KRKRSiLZBsWe4ye6Q560G9voAxoX9HNAnkSkmHw1YeG', NOW());
