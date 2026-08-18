```markdown
# 1. API Overview

This document defines the authoritative REST API contract for the **Steep & Sip** Tea E-Commerce Platform. It serves as the strict boundary between the Vanilla JavaScript frontend and the Java Spring Boot backend. 

- **Architecture:** Resource-oriented REST.
- **Data Format:** `application/json` for all request and response bodies.
- **Authentication:** Spring Security session-based authentication using HTTP-only `JSESSIONID` cookies.
- **Namespace:** All endpoints are prefixed with `/api`.
- **Versioning:** No explicit versioning (e.g., `/v1`) is used for this MVP. The scope is tightly controlled and appropriate for a student-level monolithic deployment.

# 2. API Design Principles

- **Server-Authoritative:** The backend is the absolute authority for pricing, cart totals, inventory availability, and user identity. The frontend must never send prices or user IDs to be trusted by the backend.
- **Direct Resource Representation:** Successful responses return the resource directly (no generic `{ "data": ... }` wrappers) to simplify frontend parsing.
- **Consistent Errors:** All client and server errors return a standardized JSON error object.
- **Idempotency:** `GET`, `PUT`, and `DELETE` requests are idempotent.
- **DTO Isolation:** Database entities (from `03_DATABASE_DESIGN.md`) are never returned directly. DTOs are used to omit sensitive fields (e.g., password hashes).

# 3. Base URL and Environment

- **Development:** `http://localhost:8080`
- **Namespace:** `/api`
- **Production:** `[PRODUCTION_API_BASE_URL]/api`

*Frontend Integration Rule:* The Vanilla JavaScript frontend should use relative paths (e.g., `fetch('/api/products')`) so it works agnostically across local development and production environments, provided both are served from the same origin or routed via a proxy.

# 4. Authentication Model

The API relies on **Spring Security Session-Based Authentication**.
1. **Login:** The client POSTs credentials to `/api/auth/login`. 
2. **Session Cookie:** On success, the server responds with a `Set-Cookie: JSESSIONID=...; HttpOnly; SameSite=Lax` header.
3. **Subsequent Requests:** The browser automatically includes the `JSESSIONID` cookie in subsequent `fetch()` requests.
4. **Logout:** A POST to `/api/auth/logout` invalidates the session on the server and clears the cookie.
5. **Identity:** The server identifies the user by extracting the session context. Request payloads must *never* include a `userId` field to assert identity.

# 5. Authorization Model

| Resource / Operation | Public | Authenticated Customer | Admin |
|---|---|---|---|
| Browse products / categories | ✓ | ✓ | ✓ |
| Product details | ✓ | ✓ | ✓ |
| Register / Login | ✓ | — | — |
| Logout / Session Check | — | ✓ | ✓ |
| Manage own Cart | — | ✓ | — |
| Checkout | — | ✓ | — |
| View own Orders | — | ✓ | — |
| Manage Products (CRUD) | — | — | ✓ |
| Manage all Orders | — | — | ✓ |

# 6. API Resource Inventory

| Resource | Purpose | MVP / Future |
|---|---|---|
| `auth` | Registration, login, logout, session verification. | MVP |
| `categories` | Read-only category list for UI dropdowns/filters. | MVP |
| `products` | Public product catalog. | MVP |
| `cart` | Current user's shopping cart and items. | MVP |
| `orders` | Customer order creation and history. | MVP |
| `admin/products` | Admin product management. | MVP |
| `admin/orders` | Admin order fulfillment. | MVP |

# 7. Endpoint Naming Conventions

- **Nouns over Verbs:** Use `/api/products`, not `/api/getProducts`.
- **Plurals:** Resource collections are pluralized (e.g., `/api/orders`).
- **Path Parameters:** Specific resource identification (e.g., `/api/products/{id}`).
- **Admin Namespace:** Administrative endpoints are isolated under `/api/admin/...`.
- **Actions:** Actions modifying state without a clear resource map use verbs (e.g., `/api/auth/login`).

# 8. Standard HTTP Methods

- **GET:** Retrieve a resource or collection. (Safe, Idempotent)
- **POST:** Create a new resource or execute an action (e.g., Login, Checkout). (Not Idempotent)
- **PUT:** Fully update a resource (e.g., updating cart item quantity, admin updating a product). (Idempotent)
- **DELETE:** Remove a resource. (Idempotent)
- *(Note: `PATCH` is omitted for MVP simplicity; `PUT` handles updates).*

# 9. Standard HTTP Status Codes

| Code | Status | Usage |
|---|---|---|
| **200** | `OK` | Successful `GET`, `PUT`, or login action. |
| **201** | `Created` | Successful `POST` creating a resource (Registration, Add to Cart, Checkout). |
| **204** | `No Content` | Successful `DELETE` or `POST` logout. No body returned. |
| **400** | `Bad Request` | Validation failure (e.g., invalid email, quantity exceeds stock). |
| **401** | `Unauthorized` | Missing or invalid session cookie, or failed login. |
| **403** | `Forbidden` | Authenticated, but lacks required role (e.g., Customer accessing Admin API). |
| **404** | `Not Found` | Resource ID does not exist or does not belong to the user. |
| **409** | `Conflict` | Business rule conflict (e.g., Email already registered). |
| **500** | `Internal Server Error` | Unhandled backend exception. |

# 10. Standard Response Conventions

Successful responses return the JSON resource directly. 
Collections return a JSON Array `[]`. Single resources return a JSON Object `{}`.

# 11. Standard Error Response

All client (`4xx`) and server (`5xx`) errors return a consistent error object:

```json
{
  "timestamp": "2026-08-17T16:45:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Requested quantity exceeds available stock.",
  "path": "/api/cart/items"
}

```

# 12. Validation Conventions

* **Backend is Authoritative:** Frontend validation is strictly for UX. The backend `@Valid` and business logic enforce the final rules.
* **Required Fields:** Missing required fields yield a `400 Bad Request`.
* **Numbers:** Quantities must be > 0. Prices must be >= 0.
* **Business Validation:** If an order requests more stock than available, the service returns a `400 Bad Request` with an explicit message.

---

# 13. API Endpoint Specification

# 14. Authentication Endpoints

### Register

* **Method & Path:** `POST /api/auth/register`
* **Actor:** Public
* **Request Body:** `RegisterRequest` (fullName, email, password)
* **Success:** `201 Created` - Returns `UserResponse`
* **Errors:** `400 Bad Request` (Invalid input), `409 Conflict` (Email exists).

### Login

* **Method & Path:** `POST /api/auth/login`
* **Actor:** Public
* **Request Body:** `LoginRequest` (email, password)
* **Success:** `200 OK` - Returns `UserResponse`, sets `JSESSIONID` cookie.
* **Errors:** `401 Unauthorized` (Bad credentials).

### Logout

* **Method & Path:** `POST /api/auth/logout`
* **Actor:** Authenticated
* **Success:** `204 No Content` - Invalidates session.

### Get Current User

* **Method & Path:** `GET /api/auth/me`
* **Actor:** Authenticated (Customer or Admin)
* **Purpose:** Used by frontend on page load to hydrate UI state (navbar).
* **Success:** `200 OK` - Returns `UserResponse` based on session.
* **Errors:** `401 Unauthorized` (Not logged in).

---

# 15. Product Endpoints

### List Active Products

* **Method & Path:** `GET /api/products`
* **Actor:** Public
* **Query Params:** `categoryId` (optional filter).
* **Success:** `200 OK` - Returns `List<ProductResponse>`. Only returns products where `isActive = true`.

### Get Product Details

* **Method & Path:** `GET /api/products/{id}`
* **Actor:** Public
* **Success:** `200 OK` - Returns `ProductResponse`.
* **Errors:** `404 Not Found`.

### List Categories

* **Method & Path:** `GET /api/categories`
* **Actor:** Public
* **Purpose:** Populate UI filters.
* **Success:** `200 OK` - Returns `List<CategoryResponse>`.

---

# 16. Cart Endpoints

*Note: The cart is inherently tied to the session. No `cartId` is passed in the URL.*

### Get Current Cart

* **Method & Path:** `GET /api/cart`
* **Actor:** Authenticated Customer
* **Success:** `200 OK` - Returns `CartResponse` (includes `items` and calculated `cartTotal`).

### Add Item to Cart

* **Method & Path:** `POST /api/cart/items`
* **Actor:** Authenticated Customer
* **Request Body:** `AddCartItemRequest` (productId, quantity)
* **Business Rule:** If product exists in cart, increments quantity. Must validate against `stockQuantity`.
* **Success:** `201 Created` - Returns updated `CartResponse`.
* **Errors:** `400 Bad Request` (Insufficient stock), `404 Not Found` (Product invalid).

### Update Cart Item Quantity

* **Method & Path:** `PUT /api/cart/items/{cartItemId}`
* **Actor:** Authenticated Customer
* **Request Body:** `UpdateCartItemRequest` (quantity)
* **Success:** `200 OK` - Returns updated `CartResponse`.
* **Errors:** `400 Bad Request`, `404 Not Found` (Item doesn't belong to this user's cart).

### Remove Cart Item

* **Method & Path:** `DELETE /api/cart/items/{cartItemId}`
* **Actor:** Authenticated Customer
* **Success:** `200 OK` - Returns updated `CartResponse`.

---

# 17. Checkout / Order Creation Endpoint

### Place Order

* **Method & Path:** `POST /api/orders`
* **Actor:** Authenticated Customer
* **Purpose:** Converts the active Cart into a finalized Order.
* **Request Body:** `CreateOrderRequest` (shippingAddress, paymentMethod)
* **Server Authority:** The server identifies the user, fetches their cart, checks real-time inventory, calculates the total price based on current DB prices, deducts inventory, creates the order, and clears the cart.
* **Success:** `201 Created` - Returns `OrderResponse`.
* **Errors:**
* `400 Bad Request` (Cart is empty).
* `400 Bad Request` (Insufficient stock for one or more items).



---

# 18. Customer Order Endpoints

### List My Orders

* **Method & Path:** `GET /api/orders`
* **Actor:** Authenticated Customer
* **Success:** `200 OK` - Returns `List<OrderSummaryResponse>`.

### Get Order Details

* **Method & Path:** `GET /api/orders/{id}`
* **Actor:** Authenticated Customer
* **Security Rule:** Returns `404 Not Found` if the order ID exists but belongs to a different user, preventing IDOR information disclosure.
* **Success:** `200 OK` - Returns `OrderResponse`.

---

# 19. Admin Product Endpoints

### Create Product

* **Method & Path:** `POST /api/admin/products`
* **Actor:** Admin
* **Request Body:** `ProductRequest`
* **Success:** `201 Created` - Returns `ProductResponse`.

### Update Product

* **Method & Path:** `PUT /api/admin/products/{id}`
* **Actor:** Admin
* **Request Body:** `ProductRequest`
* **Success:** `200 OK` - Returns `ProductResponse`.

### Delete (Soft Delete) Product

* **Method & Path:** `DELETE /api/admin/products/{id}`
* **Actor:** Admin
* **Business Rule:** Sets `isActive = false` in the database to preserve historical order references.
* **Success:** `204 No Content`.

---

# 20. Admin Order Endpoints

### List All Orders

* **Method & Path:** `GET /api/admin/orders`
* **Actor:** Admin
* **Success:** `200 OK` - Returns `List<AdminOrderSummaryResponse>`.

### Get Order Details (Admin)

* **Method & Path:** `GET /api/admin/orders/{id}`
* **Actor:** Admin
* **Success:** `200 OK` - Returns `OrderResponse` (includes user details).

### Update Order Status

* **Method & Path:** `PUT /api/admin/orders/{id}/status`
* **Actor:** Admin
* **Request Body:** `UpdateOrderStatusRequest` (status)
* **Validation:** Status must be one of: `PENDING`, `SHIPPED`, `DELIVERED`.
* **Success:** `200 OK` - Returns updated `OrderResponse`.

---

# 21. Category Endpoints

*MVP relies strictly on `GET /api/categories`. Admin category management (POST/PUT/DELETE) is deferred to Version 2 to keep the MVP scope achievable.*

---

# 22. Future API Surface

| Future Feature | Potential API Area | Status |
| --- | --- | --- |
| Product Reviews | `/api/products/{id}/reviews` | Future |
| Wishlists | `/api/wishlists` | Future |
| Payments (Stripe) | `/api/payments/intent` | Future |
| Admin Categories | `/api/admin/categories` | Future |

---

# 23. Request DTO Specifications

| DTO | Used By | Fields | Required | Validation |
| --- | --- | --- | --- | --- |
| `RegisterRequest` | POST /auth/register | `fullName`, `email`, `password` | All | email format, password min 6 chars |
| `LoginRequest` | POST /auth/login | `email`, `password` | All | email format |
| `AddCartItemRequest` | POST /cart/items | `productId`, `quantity` | All | quantity > 0 |
| `UpdateCartItemRequest` | PUT /cart/items/{id} | `quantity` | All | quantity > 0 |
| `CreateOrderRequest` | POST /orders | `shippingAddress`, `paymentMethod` | All | paymentMethod == 'COD' |
| `ProductRequest` | POST/PUT /admin/products | `categoryId`, `name`, `description`, `price`, `stockQuantity`, `imageUrl` | All except image | price >= 0, stock >= 0 |
| `UpdateOrderStatusRequest` | PUT /admin/orders/{id}/status | `status` | All | Enum validation |

*Notice: No Request DTO includes `totalPrice` or `userId`. These are inferred by the server.*

---

# 24. Response DTO Specifications

| DTO | Purpose | Fields Included | Excluded |
| --- | --- | --- | --- |
| `UserResponse` | Identity payload | `id`, `fullName`, `email`, `role`, `createdAt` | `passwordHash` |
| `CategoryResponse` | Dropdown data | `id`, `name`, `description` | - |
| `ProductResponse` | Catalog display | `id`, `categoryId`, `categoryName`, `name`, `description`, `price`, `stockQuantity`, `imageUrl`, `isActive` | - |
| `CartItemResponse` | Cart line items | `id` (cartItemId), `productId`, `productName`, `imageUrl`, `unitPrice`, `quantity`, `lineTotal` | - |
| `CartResponse` | Full cart view | `id`, `items` (List of CartItemResponse), `cartTotal` | - |
| `OrderItemResponse` | Past purchases | `id`, `productId`, `productName`, `quantity`, `priceAtPurchase`, `lineTotal` | - |
| `OrderResponse` | Order details | `id`, `status`, `totalAmount`, `shippingAddress`, `paymentMethod`, `createdAt`, `items` (List of OrderItemResponse) | - |
| `AdminOrderSummaryResponse` | Admin dashboard | `id`, `userEmail`, `totalAmount`, `status`, `createdAt` | `items` |

---

# 25. JSON Contract Examples

### Login Request

```json
{
  "email": "customer@steepandsip.com",
  "password": "securepassword"
}

```

### User Response (Login Success / Me)

```json
{
  "id": 1,
  "fullName": "Jane Doe",
  "email": "customer@steepandsip.com",
  "role": "ROLE_USER",
  "createdAt": "2026-08-10T10:00:00Z"
}

```

### Cart Response

```json
{
  "id": 1,
  "items": [
    {
      "id": 45,
      "productId": 2,
      "productName": "Assam CTC",
      "imageUrl": "/images/assam.jpg",
      "unitPrice": 500.00,
      "quantity": 2,
      "lineTotal": 1000.00
    }
  ],
  "cartTotal": 1000.00
}

```

### Create Order Request

```json
{
  "shippingAddress": "123 Tea Lane, Mumbai, MH, 400001",
  "paymentMethod": "COD"
}

```

### Order Response

```json
{
  "id": 1001,
  "status": "PENDING",
  "totalAmount": 1000.00,
  "shippingAddress": "123 Tea Lane, Mumbai, MH, 400001",
  "paymentMethod": "COD",
  "createdAt": "2026-08-17T16:50:00Z",
  "items": [
    {
      "id": 2005,
      "productId": 2,
      "productName": "Assam CTC",
      "quantity": 2,
      "priceAtPurchase": 500.00,
      "lineTotal": 1000.00
    }
  ]
}

```

---

# 26. Authentication Request Behavior

* **Session Handling:** Spring Security creates a session on login. The browser automatically manages the `JSESSIONID` cookie.
* **Frontend Check:** On full page reload, the frontend should eagerly call `GET /api/auth/me`.
* If `200 OK`, render the authenticated state (User/Admin).
* If `401 Unauthorized`, render the public state (Login/Register buttons).


* **Unauthorized Interception:** Any API response returning `401 Unauthorized` should trigger frontend JavaScript to automatically redirect the user to `/login.html`.

# 27. CORS and Browser Integration

* **Development:** The frontend (e.g., Live Server) and backend (Tomcat `8080`) may run on different ports. Spring Boot must be configured to allow CORS requests from the frontend origin, explicitly exposing `Allow-Credentials: true` to permit the `JSESSIONID` cookie transfer across ports.
* **Fetch API requirement:** All JavaScript `fetch()` calls requiring authentication MUST include `{ credentials: 'include' }` in their configuration object.

# 28. Pagination and Query Parameters

* **MVP Pagination:** MVP does not require pagination. Product and Order volumes for a B.C.A student demo will remain small enough that returning flat JSON Arrays is performant and acceptable.
* **Filtering:** `GET /api/products?categoryId=X` is the only supported query parameter.

# 29. API Idempotency and Duplicate Requests

* **Checkout Risk:** The `POST /api/orders` endpoint is not idempotent. If a user double-clicks the "Place Order" button rapidly, it could create two orders.
* **Application Mitigation:** The Frontend JavaScript MUST disable the checkout button and show a loading spinner immediately upon clicking. The Backend cart-clearing transaction inherently minimizes this risk (the second request will hit an empty cart and return a `400`). A formal Idempotency-Key header is overkill for this MVP.

# 30. API Security Boundaries

* **Input Validation:** Enforced strictly via Spring `@Valid`.
* **Ownership Checks:** Endpoints like `GET /api/orders/{id}` must verify `order.getUser().getId().equals(sessionUser.getId())`.
* **Server-Authoritative Fields:** No REST client can dictate their own `totalAmount` or `price`.
* **Sensitive Data:** Password hashes are strictly omitted from `UserResponse`.

# 31. API Error Catalog

| Error Code / Label | HTTP Status | Meaning |
| --- | --- | --- |
| `VALIDATION_FAILED` | `400 Bad Request` | Form input failed constraints (e.g., empty address). |
| `INSUFFICIENT_STOCK` | `400 Bad Request` | Cart quantity requested exceeds available DB stock. |
| `CART_EMPTY` | `400 Bad Request` | User attempted checkout with zero items. |
| `BAD_CREDENTIALS` | `401 Unauthorized` | Invalid email or password during login. |
| `UNAUTHORIZED` | `401 Unauthorized` | Attempted to access a protected endpoint without a valid session. |
| `ACCESS_DENIED` | `403 Forbidden` | Customer attempted to access an `/api/admin` endpoint. |
| `RESOURCE_NOT_FOUND` | `404 Not Found` | Product ID, Cart Item ID, or Order ID does not exist or does not belong to the user. |
| `CONFLICT` | `409 Conflict` | Registration attempted with an email already in use. |

---

# 32. API-to-Database Traceability

| API Area | Database Entities |
| --- | --- |
| Authentication | `users` |
| Products / Categories | `products`, `categories` |
| Cart | `carts`, `cart_items`, `products` |
| Orders | `orders`, `order_items`, `products`, `users`, `carts`, `cart_items` |
| Admin Products | `products`, `categories` |
| Admin Orders | `orders`, `order_items`, `users` |

# 33. API-to-Product Traceability

| Product Requirement | API Endpoint(s) |
| --- | --- |
| Customer registration | `POST /api/auth/register` |
| Product browsing & Details | `GET /api/products`, `GET /api/products/{id}` |
| Add to Cart / Update Quantity | `POST /api/cart/items`, `PUT /api/cart/items/{id}` |
| Checkout & Place Order | `POST /api/orders` |
| Order history | `GET /api/orders`, `GET /api/orders/{id}` |
| Admin product management | `POST`, `PUT`, `DELETE /api/admin/products/{id}` |
| Admin order status updates | `PUT /api/admin/orders/{id}/status` |

---

# 34. Frontend Integration Rules

1. **Centralized Client:** Create an `api.js` utility in the frontend to wrap all `fetch()` calls.
2. **Credentials:** `api.js` must inject `{ credentials: 'include', headers: {'Content-Type': 'application/json'} }`.
3. **Error Handling:** `api.js` must universally catch `401` status codes and redirect to `/login.html`.
4. **State Derivation:** Cart totals should be read from the `cartTotal` field returned by the API, rather than recalculated manually in JS to avoid rounding discrepancies.

# 35. API Testing Strategy

* **Postman Collection:** A collection should be created simulating the exact flows.
* **Authentication Flow Test:** Register -> Login -> Call protected endpoint -> Logout -> Call protected endpoint (expect 401).
* **Checkout Flow Test:** Add item -> Checkout -> Verify 201 -> Verify cart is empty -> Verify stock is decremented.
* **IDOR Test:** Log in as User A. Attempt to `GET /api/orders/2` (which belongs to User B). Expect `404`.

# 36. API Change Management

* The API is an explicit contract. Do not change JSON property names (e.g., `imageUrl` to `image`) in the backend without simultaneously updating the frontend parsing logic.
* If a database column is added (e.g., `products.weight`), this document must be updated to include it in the `ProductResponse` DTO before implementation.

---

# 37. Antigravity API Development Rules

* **Do not invent endpoints.** Only implement the endpoints documented in Section 13-20.
* **DTO Adherence.** Strictly create matching Java record/class files for the Request/Response DTOs defined here. Do not expose `@Entity` objects from Controllers.
* **Trust Nothing.** Validate all input. Never map a client-supplied `price` to a database write.
* **Update on Modification.** If an approved change modifies a payload, update this document first to maintain the SSOT (Single Source of Truth).

# 38. Open API Decisions

**No significant unresolved API decisions identified.**
The contract strictly bounds the MVP scope, maintains server authority, and establishes a secure, standard REST layout suitable for vanilla JS consumption.

---

# 39. Final MVP API Summary

| Method | Endpoint | Actor | Auth | Purpose |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | No | Create new customer account |
| `POST` | `/api/auth/login` | Public | No | Authenticate and create session |
| `POST` | `/api/auth/logout` | Auth | Yes | Invalidate session |
| `GET` | `/api/auth/me` | Auth | Yes | Get currently logged in user |
| `GET` | `/api/categories` | Public | No | List categories |
| `GET` | `/api/products` | Public | No | List active products |
| `GET` | `/api/products/{id}` | Public | No | Get product details |
| `GET` | `/api/cart` | Customer | Yes | Get active cart contents |
| `POST` | `/api/cart/items` | Customer | Yes | Add/increment product in cart |
| `PUT` | `/api/cart/items/{id}` | Customer | Yes | Explicitly update cart item quantity |
| `DELETE` | `/api/cart/items/{id}` | Customer | Yes | Remove item from cart |
| `POST` | `/api/orders` | Customer | Yes | Checkout and finalize order |
| `GET` | `/api/orders` | Customer | Yes | List user's past orders |
| `GET` | `/api/orders/{id}` | Customer | Yes | View details of a specific order |
| `POST` | `/api/admin/products` | Admin | Yes | Create a new product |
| `PUT` | `/api/admin/products/{id}` | Admin | Yes | Update an existing product |
| `DELETE` | `/api/admin/products/{id}` | Admin | Yes | Soft-delete a product |
| `GET` | `/api/admin/orders` | Admin | Yes | List all orders |
| `GET` | `/api/admin/orders/{id}` | Admin | Yes | View customer order details |
| `PUT` | `/api/admin/orders/{id}/status` | Admin | Yes | Transition order fulfillment status |

---

# 40. Document Metadata

* **Document Name:** REST API Contracts
* **Purpose:** Authoritative definition of HTTP communication between frontend and backend.
* **Status:** APPROVED FOR MVP
* **Authority Level:** HIGHEST (For API layer communication)
* **Dependencies:** `01_PRODUCT_REQUIREMENTS.md`, `02_ARCHITECTURE.md`, `03_DATABASE_DESIGN.md`
* **Consumers:** Backend Controllers, Frontend JS, API Testers, Google Antigravity.
* **Update Policy:** Must be updated before any payload structure or endpoint URL is modified.

```

```