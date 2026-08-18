# 1. Product Overview

* **Product Name:** Steep & Sip
* **Product Type:** B2C E-Commerce Web Application
* **Business Model:** Direct-to-consumer online retail of physical goods.
* **Product Concept:** A premium online tea boutique offering high-quality, authentic tea blends to enthusiasts and health-conscious consumers.
* **Primary Objective:** Provide a seamless, trustworthy, and visually engaging shopping experience for purchasing tea products, while serving as a robust portfolio demonstration of full-stack engineering capabilities.
* **Core Value Proposition:** A curated selection of premium teas presented through a clean, intuitive, and secure shopping interface with reliable order processing.

---

# 2. Product Vision

The long-term vision of Steep & Sip is to become a comprehensive tea lifestyle platform, offering personalized tea recommendations, subscription boxes, and a vibrant community of tea enthusiasts.

**MVP Boundary Restriction:** The MVP focuses exclusively on the core transactional loop: discovering a product, adding it to a cart, checking out via Cash on Delivery, and basic administrator fulfillment. All community, personalization, and advanced payment features are strictly reserved for future iterations.

---

# 3. Product Goals

* **Customer Experience:** Users can navigate from the homepage to a successful checkout in under 3 minutes.
* **Product Discovery:** Users can easily view product details, understand variants (e.g., sizes), and see real-time availability.
* **Shopping Experience:** The cart maintains state accurately during a session, and users can modify quantities seamlessly.
* **Order Experience:** Customers receive immediate on-screen confirmation of their order, and historical orders are permanently accessible.
* **Administration:** Store owners can manage the catalog and process orders without requiring database access.
* **Reliability:** The system accurately enforces inventory limits (no overselling).
* **Security Awareness:** Customer data is protected through proper session management and secure authentication paradigms.
* **Portfolio Value:** The application demonstrates a realistic, complete B2C e-commerce lifecycle suitable for a professional software engineering portfolio.

---

# 4. Target Users

### Customer

* **Goals:** Find premium teas, understand product flavors/benefits, and purchase them securely.
* **Needs:** Clear product images, transparent pricing, intuitive cart management, and easy checkout.
* **Expected Behavior:** Browsing the catalog, adding multiple items to a cart, creating an account during or before checkout, and checking order history.
* **Main Problems:** Intimidated by complex tea terminology; frustrated by clunky checkout processes or hidden fees.
* **Main Interactions:** Browsing, Cart Management, Authentication, Checkout, Order Tracking.

### Administrator

* **Goals:** Manage the product catalog, track incoming orders, and update fulfillment statuses.
* **Responsibilities:** Adding new products, updating stock levels, and advancing orders through the fulfillment lifecycle.
* **Main Workflows:** Logging into the secure dashboard, adding/editing products, viewing the order queue, and marking orders as shipped/delivered.
* **Information Needed:** Real-time inventory levels, customer shipping details, and order totals.

---

# 5. User Problems

* **Discovering Tea Products:** Customers need an organized way to browse teas by type (Black, Green, Herbal) without feeling overwhelmed.
* **Understanding Product Choices:** Customers need clear descriptions of flavors, origins, and sizes before committing to a purchase.
* **Purchasing Conveniently:** The checkout process must be frictionless, requiring only essential information.
* **Managing Orders:** Customers need visibility into whether their order has been received, shipped, or delivered.
* **Managing Products/Orders (Admin):** Store owners need a centralized, easy-to-use interface to manage operations without relying on developer intervention or raw database edits.

---

# 6. Product Scope

### MVP (Minimum Viable Product)

* Customer Registration & Authentication
* Product Catalog & Details Viewing
* Shopping Cart (Add, Update, Remove)
* Checkout (Shipping Details & Cash on Delivery)
* Customer Order History
* Admin Dashboard Authentication
* Admin Product CRUD (Create, Read, Update, Delete)
* Admin Order Management (View, Update Status)
* Absolute Inventory Tracking (Prevent purchasing out-of-stock items)

### Version 2 (Explicitly outside MVP)

* Product Category Management (Admin CRUD for Categories)
* Product Filtering and Sorting (e.g., Price: Low to High)
* User Profile & Address Book Management
* Product Reviews & Ratings
* Basic Sales Dashboard / Charts

### Advanced / Future

* Wishlist functionality
* Real Payment Gateway Integration (Stripe/Razorpay)
* Password Reset via Email
* Discount Codes / Coupons
* Multiple Administrative Roles (Super Admin vs. Manager)
* Advanced Shipping Integrations

### Explicitly Out of Scope (Do NOT Implement in MVP)

* Real Payment Gateways
* Email sending/verification functionality
* Recommendation engines or AI integrations
* Microservices architecture
* Advanced loyalty point systems
* Multi-currency or multi-language support

---

# 7. Feature Requirements

## Authentication

* **Description:** Secure user access.
* **Required Behavior:** Users can sign up with email and password. Users can log in and log out. Passwords must be masked and securely stored. Admins use a separate or role-based login to access the dashboard.
* **Business Rules:** Passwords must not be stored in plaintext. Unauthenticated users cannot access checkout, order history, or admin areas.

## Product Discovery

* **Description:** Browsing the product catalog.
* **Required Behavior:** All active products are displayed on a shop page. Products show image, name, and price.
* **Business Rules:** Out-of-stock products should display an "Out of Stock" indicator and disable the "Add to Cart" action from the catalog view.

## Product Details

* **Description:** Deep dive into a specific product.
* **Required Behavior:** Displays full description, price, available stock, and a quantity selector.
* **Business Rules:** Users cannot select a quantity greater than the available stock.

## Shopping Cart

* **Description:** Temporary storage for intended purchases.
* **Required Behavior:** Users can view added items, change quantities, remove items, and see the total calculated price.
* **Business Rules:** Cart totals are strictly calculated based on backend product prices.

## Checkout

* **Description:** The process of finalizing an order.
* **Required Behavior:** Authenticated users provide a shipping address, review their cart, and confirm the order via Cash on Delivery.
* **Business Rules:** The system must re-verify inventory levels at the exact moment of checkout. If stock is insufficient, the checkout must fail gracefully and inform the user.

## Orders

* **Description:** The record of a completed transaction.
* **Required Behavior:** Completed checkouts generate an order record. The cart is emptied. Inventory is permanently reduced.
* **Business Rules:** Order line items must freeze the price of the product at the time of purchase.

## Customer Account

* **Description:** Post-purchase customer portal.
* **Required Behavior:** Customers can view a list of their past orders and the status of each.
* **Business Rules:** Customers can strictly only view their own orders.

## Administration

* **Description:** Store management portal.
* **Required Behavior:** Admins can view a list of products, add new ones, edit existing ones, and view a list of customer orders to update their statuses.
* **Business Rules:** Strictly restricted to users with the Admin role.

---

# 8. Customer Experience

### First Visit

The customer arrives at the homepage, greeted by premium branding and featured tea products. The navigation clearly points to the "Shop".

### Product Discovery

The customer browses the catalog, seeing clear imagery and pricing. They click on "Darjeeling First Flush" to learn more.

### Product Evaluation

On the details page, the customer reads the flavor profile, sees that 15 units are in stock, selects a quantity of 2, and clicks "Add to Cart". A non-intrusive toast notification confirms the addition.

### Cart Review

The customer clicks the cart icon in the navigation bar. They review the items, increase the quantity of one item, and see the total price update automatically.

### Checkout

The customer clicks "Proceed to Checkout". If not logged in, they are prompted to log in or register. Once authenticated, they enter their shipping address, select "Cash on Delivery", and review the final total.

### Order Confirmation

Upon clicking "Place Order", the system processes the transaction. The customer sees a success screen with an Order ID and a summary of their purchase.

### Order History

The customer navigates to their account profile, where they see their new order marked as "PENDING". They can return later to see when it changes to "SHIPPED".

---

# 9. Administrator Experience

### Admin Login

The admin navigates to a specific admin login route or uses the standard login with an admin account, redirecting them to the Admin Dashboard.

### Product Management

The admin clicks "Products". They see a list of current inventory. They click "Add Product", fill out the name, description, price, stock quantity, and image URL, and save it. The product instantly appears on the public shop.

### Order Management

The admin clicks "Orders". They see a chronological list of recent customer orders.

### Order Status Updates

The admin opens an order that is "PENDING". After packing the physical box, the admin changes the status to "SHIPPED". Days later, they change it to "DELIVERED".

---

# 10. User Flows

### Customer Registration Flow

1. User clicks "Register" in navigation.
2. User enters Name, Email, and Password.
3. User submits form.
4. System validates input and creates account.
5. User is redirected to Login page with a success message.

### Customer Login Flow

1. User clicks "Login".
2. User enters Email and Password.
3. System authenticates user.
4. System redirects user to Home or previous page. Navigation updates to show Account/Logout options.

### Product Details Flow

1. User clicks a product card on the Shop page.
2. System loads product details (image, description, price, stock).
3. User interacts with quantity selector.
4. User clicks "Add to Cart".

### Checkout Flow

1. User navigates to Cart and clicks "Checkout".
2. System checks authentication (prompts login if necessary).
3. System displays shipping address form and order summary.
4. User fills out address and confirms Cash on Delivery.
5. User clicks "Place Order".
6. System verifies stock, creates order, deducts stock, and clears cart.
7. System displays Success page.

### Admin Order Management Flow

1. Admin logs in and navigates to Admin Dashboard.
2. Admin clicks "Orders".
3. Admin selects a "PENDING" order.
4. Admin reviews shipping details and items.
5. Admin clicks "Mark as Shipped".
6. System updates status and refreshes the view.

---

# 11. Information Architecture / Sitemap

### Public Pages

* `/` (Home): Landing page with brand messaging and featured products.
* `/shop` (Shop): Full product catalog.
* `/product/{id}` (Product Details): Specific product information.
* `/cart` (Shopping Cart): Current cart contents.
* `/login` (Login): Customer/Admin authentication.
* `/register` (Register): Customer account creation.

### Customer Pages (Requires Authentication)

* `/checkout` (Checkout): Order finalization.
* `/account` (Account/Orders): Customer order history.

### Admin Pages (Requires Admin Role)

* `/admin` (Dashboard): Overview of store operations.
* `/admin/products` (Product Management): CRUD interface for catalog.
* `/admin/orders` (Order Management): List and status management for orders.

---

# 12. Page-Level Product Requirements

## Home

* **Purpose:** Brand introduction and navigation entry point.
* **Primary User:** All users.
* **Main Content:** Hero banner, brand value proposition, 3-4 featured products.
* **Primary Actions:** "Shop Now" CTA.

## Shop

* **Purpose:** Display all available products.
* **Primary User:** All users.
* **Main Content:** Grid of product cards.
* **Primary Actions:** View product details, Add to cart (quick add).
* **Important States:** "Out of stock" badges on relevant items.

## Product Details

* **Purpose:** Educate user on a specific product to drive purchase.
* **Primary User:** All users.
* **Main Content:** Large image, full description, price, available stock.
* **Primary Actions:** Quantity selector, Add to Cart.

## Cart

* **Purpose:** Review intended purchases.
* **Primary User:** All users (tied to session).
* **Main Content:** List of cart items with thumbnail, name, unit price, quantity, line total, and grand total.
* **Primary Actions:** Update quantity, Remove item, Proceed to Checkout.
* **Important States:** Empty cart state (prompts user to visit shop).

## Checkout

* **Purpose:** Finalize transaction.
* **Primary User:** Authenticated Customers.
* **Main Content:** Shipping form, uneditable order summary.
* **Primary Actions:** Place Order.

## Admin Products

* **Purpose:** Manage catalog.
* **Primary User:** Administrator.
* **Main Content:** Table of products (ID, Name, Price, Stock).
* **Primary Actions:** Add New Product, Edit, Delete.

## Admin Orders

* **Purpose:** Fulfill customer orders.
* **Primary User:** Administrator.
* **Main Content:** Table of orders (Order ID, Customer Email, Date, Total, Status).
* **Primary Actions:** View Order Details, Update Status.

---

# 13. Product Catalog Requirements

A product must be represented by:

* **Name:** e.g., "Assam CTC Black Tea"
* **Description:** Text detailing flavor, origin, and brewing instructions.
* **Category:** Logical grouping (e.g., Black Tea). *(Note: For MVP, category can be a simple text field or basic association).*
* **Image URL:** Link to the product image.
* **Price:** The monetary value of a single unit.
* **Stock Quantity:** The absolute number of units currently available in the warehouse.
* **Availability State:** Derived dynamically (Stock > 0 = Available, Stock = 0 = Out of Stock).

---

# 14. Cart Requirements

* **Adding Products:** Adding an item already in the cart should increment its quantity, not create a duplicate line item.
* **Quantity Modification:** Users can increase/decrease quantities.
* **Removing Products:** Users can completely remove an item.
* **Empty Cart Behavior:** Must display a friendly message guiding the user back to the shop.
* **Stock Validation:** The cart must not allow a user to increment a quantity beyond the currently available stock.
* **Price Display:** Must show individual unit price, line item total, and grand total.
* **Total Calculation:** The backend is the sole authority on the final cart total.

---

# 15. Checkout Requirements

* **Customer Identity:** System inherently knows the user via their authenticated session.
* **Shipping Information:** User provides full name, street address, city, state, postal code, and phone number.
* **Order Summary:** Displays final items, quantities, and total amount.
* **Payment Method:** Hardcoded to "Cash on Delivery" for MVP.
* **Place Order:** Single click action to trigger transaction.
* **Success State:** Clear confirmation screen with an Order ID.
* **Failure State:** If checkout fails (e.g., someone else bought the last item while the user was filling out the form), the user is returned to the cart with an error message detailing which item is out of stock.

---

# 16. Order Requirements

* **Order Contents:** A snapshot of the cart at the moment of checkout.
* **Order Total:** The calculated sum of the items at purchase time.
* **Prices:** The price of a product in the order must remain static, even if the admin changes the catalog price the next day.
* **Customer Association:** Orders are permanently linked to the purchasing user.
* **Order Statuses (Strict Lifecycle):**
1. `PENDING`: Order placed, waiting for admin to process.
2. `SHIPPED`: Admin has dispatched the physical product.
3. `DELIVERED`: Order has reached the customer.



---

# 17. Inventory Requirements

* **Available Stock:** Represents physical inventory.
* **Quantity Validation:** No customer action (add to cart, checkout) can exceed this number.
* **Inventory Reduction:** Stock is *only* reduced upon successful order placement, not when an item is added to the cart.
* **Out-of-Stock:** Products with 0 stock remain visible in the catalog but cannot be purchased.

---

# 18. Admin Product Management Requirements

* **Creating Products:** Admin can input all product fields to create a new active product.
* **Viewing Products:** Admin can see a list of all products with their current stock levels.
* **Editing Products:** Admin can fix typos, update prices, and restock inventory by changing the stock quantity.
* **Deleting Products:** Admin can remove a product. *(Note: If a product is tied to historical orders, the system should prevent deletion or utilize a 'soft delete/deactivate' mechanism to preserve order history).*

---

# 19. Admin Order Management Requirements

* **Viewing Orders:** Admin sees all orders from all customers, sorted newest first.
* **Viewing Order Details:** Admin can see the shipping address, customer email, and specific items purchased.
* **Updating Order Status:** Admin can transition an order from `PENDING` -> `SHIPPED` -> `DELIVERED`.
* **Constraint:** Admins cannot alter the contents or total price of an order once it is placed.

---

# 20. UI/UX Product Requirements

* **Brand Personality:** Earthy, premium, authentic, wellness-focused.
* **Visual Direction:** Clean interfaces with generous whitespace. Not overly corporate.
* **Color Direction:**
* Primary: Matcha Green (`#4A5D23`) for main actions/buttons.
* Background: Warm White (`#F9F6F0`) for app background.
* Typography: Charcoal (`#333333`) for high readability.


* **Typography Direction:** Sans-serif (Inter/Roboto) for UI elements and descriptions; Serif (Playfair Display) for main headers.
* **Navigation:** Fixed top navbar. Cart icon with a dynamic numeric badge showing total items.
* **Product Cards:** Uniform image heights. Title, price, and a subtle "Add to Cart" button.
* **Forms:** Clean inputs with clear focus states. Password fields must mask input.
* **Buttons:** Clear primary vs. secondary visual weight. Disabled buttons must look visually inactive.
* **Feedback:** Use non-blocking Toast notifications (e.g., top-right corner) for standard actions ("Added to cart").
* **Empty States:** Beautiful empty cart and empty order history screens with clear calls to action.
* **Loading States:** Buttons should show a loading indicator during form submission/checkout to prevent double-clicks.

---

# 21. Responsive Requirements

* **Desktop:** Multi-column grids (e.g., 3-4 product cards per row). Full navigation menu.
* **Tablet:** 2 product cards per row.
* **Mobile:** Single column layout. 1 product card per row. Navigation collapses into a Hamburger menu. Cart summary stacks vertically.

---

# 22. Accessibility Requirements

* **Keyboard Accessibility:** All links, buttons, and form fields must be reachable via the `Tab` key.
* **Meaningful Labels:** Form inputs must have associated `<label>` tags.
* **Text Readability:** High contrast between charcoal text and warm white backgrounds.
* **Imagery:** Product images must have descriptive `alt` text (e.g., "Assam Black Tea 250g Tin").

---

# 23. Error and Empty States

* **Product Out of Stock:** Add to cart button is greyed out and reads "Out of Stock".
* **Empty Cart:** "Your cart is empty. Discover our premium blends." -> Link to Shop.
* **Invalid Login:** "Invalid email or password. Please try again."
* **Checkout Failure (Stock changed):** "Sorry, 'Chamomile Calm' is no longer in stock in the requested quantity. Your cart has been updated."
* **Unauthorized Access:** If a user tries to access `/admin`, they receive a clear "Access Denied" or 403 error page.

---

# 24. Notifications and Feedback

* **Product Added:** Green toast notification: "Added [Product Name] to cart."
* **Cart Updated:** Silent update of totals, optional subtle highlight.
* **Registration Success:** Redirect to login with green alert: "Account created successfully. Please log in."
* **Order Success:** Dedicated success page with Order ID and "Thank you for your purchase."

---

# 25. Business Rules

1. **Authentication:** Only authenticated users can access the checkout flow and order history.
2. **Admin Boundary:** Only users with the Admin role can access admin routes and API endpoints.
3. **Inventory Constraint [MVP Critical]:** Stock cannot drop below 0.
4. **Cart Constraint:** Users cannot add more items to the cart than the available stock.
5. **Pricing Authority [MVP Critical]:** The frontend cart calculations are for display only. The backend must recalculate the true total using database prices during checkout.
6. **Order History Integrity [MVP Critical]:** Order line items must copy the product's price at the moment of checkout. Changes to the main product catalog price must not affect past orders.
7. **Data Privacy:** Customers can only query and view their own orders based on their server-side session.
8. **Payment:** Cash on Delivery is the sole allowed payment method for the MVP.

---

# 26. Functional Requirements Matrix

| ID | Requirement | Actor | Priority | Scope | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| FR-AUTH-001 | User Registration | Customer | P0 | MVP | User can create an account with email/password; password is encrypted. |
| FR-AUTH-002 | User Login | Customer | P0 | MVP | User can log in and establish a secure session. |
| FR-PROD-001 | View Product Catalog | All | P0 | MVP | All active products are displayed with image, name, and price. |
| FR-PROD-002 | View Product Details | All | P0 | MVP | Detailed view shows full description and current stock. |
| FR-CART-001 | Add to Cart | Customer | P0 | MVP | User can add a product; quantity does not exceed stock. |
| FR-CART-002 | Update Cart | Customer | P0 | MVP | User can change quantities or remove items; totals update. |
| FR-CHKT-001 | Process Checkout | Customer | P0 | MVP | User can submit shipping info; order is created; cart is cleared. |
| FR-CHKT-002 | Inventory Deduction | System | P0 | MVP | Stock is deducted precisely by the ordered amount upon checkout. |
| FR-ORD-001 | View Order History | Customer | P0 | MVP | Customer sees their past orders and statuses. |
| FR-ADM-001 | Manage Products | Admin | P0 | MVP | Admin can Create, Read, Update, and Delete products. |
| FR-ADM-002 | Manage Orders | Admin | P0 | MVP | Admin can view all orders and update status (Pending -> Shipped -> Delivered). |

---

# 27. Non-Functional Product Requirements

* **Usability:** The UI must be intuitive enough that a first-time user requires zero instruction to complete a purchase.
* **Responsiveness:** The site must function seamlessly on mobile devices, as e-commerce traffic is predominantly mobile.
* **Security:** Standard web vulnerabilities (XSS, CSRF, IDOR) must be mitigated. A user manipulating client-side state (e.g., changing a price in HTML) must not affect the server's processing of the order.
* **Performance:** Pages should load quickly, relying on efficient database querying rather than heavy client-side processing.

---

# 28. MVP Acceptance Criteria

The MVP is complete when the following end-to-end criteria are met:

* [ ] A new visitor can register for an account.
* [ ] The user can log in successfully.
* [ ] The user can browse the tea catalog and view specific product details.
* [ ] The user can add an available product to the cart.
* [ ] The user can proceed to checkout, enter shipping details, and select Cash on Delivery.
* [ ] The user can place the order and see an order confirmation with a unique Order ID.
* [ ] The user can navigate to their account and see the order listed as `PENDING`.
* [ ] The system accurately reduced the product's inventory by the purchased amount.
* [ ] An administrator can log in.
* [ ] The administrator can view the newly placed order.
* [ ] The administrator can update the order status to `SHIPPED`.
* [ ] The administrator can create a new tea product and see it appear in the public catalog.

---

# 29. Definition of Done

A feature is considered "Done" when:

1. The requirement as stated in this document is fully implemented.
2. The UI handles the happy path and expected error states (e.g., out of stock, invalid login).
3. Backend business rules and validations are enforced securely.
4. Existing MVP functionality remains unbroken.
5. The feature operates correctly across desktop and mobile form factors.

---

# 30. Future Expansion Boundaries

To ensure the MVP remains stable while allowing for future growth:

* **Reviews/Ratings:** Will be attached to the Product entity later. MVP UI should leave space for future star ratings but not implement them.
* **Payment Gateway:** The checkout architecture must decouple the "Order Creation" from "Payment Processing" to allow a Stripe/Razorpay module to be inserted between Checkout and Confirmation in V2.
* **Filtering/Sorting:** Keep catalog queries simple for MVP; do not over-engineer the database indexes for advanced full-text search until V2.

---

# 31. Requirements Traceability

* **Goal:** Shopping Experience
* **Feature:** Cart Management
* **Requirement ID:** FR-CART-001, FR-CART-002
* **Acceptance Criteria:** Cart updates totals automatically; prevents adding more than available stock.






* **Goal:** Reliability & Security
* **Feature:** Secure Checkout
* **Requirement ID:** FR-CHKT-001, FR-CHKT-002
* **Acceptance Criteria:** Backend authoritative pricing; inventory deducted accurately on success.







---

# 32. Change Control

* **Scope Lockdown:** The MVP scope defined in Section 6 is locked.
* **No Feature Creep:** Do not add "nice-to-have" features (e.g., Wishlists, Email confirmations) without explicitly updating this document and changing the MVP boundary.
* **Conflict Resolution:** If a technical constraint discovered during architecture/development conflicts with a requirement here, this document must be explicitly updated to reflect the new agreed-upon behavior.
* **Silence is not consent:** Do not silently ignore requirements because they are difficult to implement. Surface the blocker.

---

# 33. Antigravity Usage Notes

**Instructions for Google Antigravity:**

* Treat this document as the absolute source of truth for **WHAT** the product is and **WHAT** features are in scope.
* Before implementing any product feature, verify its existence and scope within this document.
* **Do not invent missing product requirements.** If a feature is not listed in the MVP scope (Section 6) or FR Matrix (Section 26), it does not exist. Do not build it.
* **Do not promote future features.** E.g., Do not implement Stripe. Stick to Cash on Delivery.
* If technical implementation (defined in later docs) conflicts with business rules defined here (e.g., authoritative pricing), **the business rules here take absolute precedence.** Stop and surface the conflict.
* Do not casually modify this document. It represents the agreed-upon business contract.

---

# 34. Document Ownership

* **Document Name:** Product Requirements Document (PRD)
* **Document Purpose:** Define product scope, user experience, and business rules.
* **Status:** APPROVED FOR MVP
* **Authority Level:** HIGHEST (For Product Scope)
* **Last Updated:** [System Generated / Current Date]
* **Depends On:** None (Root Document)
* **Used By:** Architecture Document, Database Design Document, API Contracts, Development Agents (Google Antigravity).