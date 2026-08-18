```markdown
# 1. Security Overview

This document serves as the authoritative source of truth for the security architecture of the **Steep & Sip** Tea E-Commerce Platform. It defines the rules for authentication, authorization, session management, and data protection.

### Application Security Objectives
The primary objective is to build a robust, secure B2C e-commerce platform that protects customer data, guarantees transactional integrity, and prevents unauthorized administrative actions. 

### Threat Model (Practical Level)
The platform assumes the internet is hostile. The primary threat actors are unauthenticated attackers attempting to steal data, authenticated users attempting to manipulate prices or view other users' orders, and automated bots attempting brute-force attacks.

### Security Philosophy
- **The browser is an untrusted client.** 
- **The backend is the authoritative security boundary.**
- Hiding a button in the UI is a UX decision, not a security control.
- Security controls must be implemented server-side, closest to the data they protect.

# 2. Security Goals

1. **Protect user credentials:** Never store plaintext passwords; use industry-standard hashing.
2. **Prevent unauthorized access:** Ensure all private endpoints require a valid session.
3. **Protect customer data:** Guarantee a customer can only view their own cart, orders, and profile.
4. **Protect admin functionality:** Restrict product and order management strictly to authenticated administrators.
5. **Protect inventory and pricing:** Prevent malicious clients from altering final checkout totals or bypassing stock limits.
6. **Prevent session abuse:** Secure cookies and implement CSRF protection.
7. **Prevent common web vulnerabilities:** Mitigate XSS, SQLi, and IDOR globally.
8. **Maintain secure error behavior:** Never leak stack traces, database schemas, or internal server states to the client.

# 3. Security Architecture

The security architecture operates as a series of defensive layers within the Spring Boot monolith.

```text
Browser (Untrusted Client)
   ↓
HTTP Request (Validates CORS & CSRF)
   ↓
Spring Security Filter Chain (Extracts JSESSIONID)
   ↓
Authentication Context (Identifies Principal)
   ↓
Role Authorization (e.g., @PreAuthorize("hasRole('ADMIN')"))
   ↓
REST Controller (Maps JSON, applies @Valid limits)
   ↓
Service Layer (Object-Level Authorization / IDOR Checks)
   ↓
Repository (Parameterized Queries preventing SQLi)
   ↓
MySQL Database (Data at Rest)

```

# 4. Trust Boundaries

* **Browser → Backend:** This is the primary trust boundary. All data crossing this boundary (JSON payloads, headers, path variables) must be treated as hostile and explicitly validated.
* **Backend → Database:** Highly trusted. The application controls this connection. However, queries must still be parameterized to prevent injection from data that originated at the browser boundary.
* **Authenticated User → Private Resources:** Crossing this boundary requires server-side validation that the authenticated user explicitly owns the requested resource.
* **Customer → Admin Resources:** Crossing this boundary requires strict Role-Based Access Control (RBAC).

# 5. Authentication Architecture

The application relies on **Spring Security + Session-Based Authentication**.

1. The user submits their email and plaintext password via `POST /api/auth/login`.
2. Spring Security intercepts the request and retrieves the user record from the database.
3. Spring Security verifies the provided password against the stored BCrypt hash.
4. Upon success, Spring Security establishes a server-side session context.
5. The server responds with a `Set-Cookie: JSESSIONID=...` header.
6. The browser automatically attaches this cookie to all subsequent requests.
7. For every subsequent request, the Spring Security Filter Chain reconstructs the authenticated `Principal` from the session storage before the request reaches the Controller.
8. `POST /api/auth/logout` destroys the server-side session and instructs the browser to clear the cookie.

# 6. Registration Security

* **Required Fields:** `fullName`, `email`, `password`.
* **Email Validation:** Must conform to standard email regex. Emails are case-insensitive for authentication purposes but stored exactly as provided (or normalized).
* **Duplicate Email Handling:** If an email is already registered, the API must return a `409 Conflict`. *(Note: Returning 409 reveals that an email is registered. In a highly secure app, we might return 200 and send an email, but for this e-commerce MVP without email functionality, 409 is the acceptable tradeoff for UX).*
* **Password Requirements:** Minimum 6 characters. Must be hashed before persistence.
* **Response Behavior:** The API must return the created user object (DTO) but **must entirely omit the password or password hash**.

# 7. Password Security

* **Hashing Algorithm:** **BCrypt**.
* **Cost Factor:** Use the Spring Security default (currently strength 10), which balances security with server CPU load during logins.
* **Salt Handling:** BCrypt handles salting internally; no manual salt generation or separate salt columns are required.
* **Storage:** Stored in the `users.password_hash` column.
* **Exposure:** The password hash must *never* be mapped to a response DTO, logged to console, or returned in an API error.

# 8. Login Security

* **Credential Validation:** Handled by Spring's `DaoAuthenticationProvider`.
* **Invalid Credential Behavior:** Returns `401 Unauthorized` with a generic message ("Invalid email or password"). Do not specify whether the email or the password was the incorrect element, to prevent user enumeration.
* **Brute-Force Considerations:** Standard Spring Security delays password verification appropriately due to BCrypt's inherent slowness. Complex rate-limiting or account lockouts are deferred from the MVP scope to maintain simplicity.

# 9. Logout Security

* **Session Invalidation:** `POST /api/auth/logout` must call `request.getSession().invalidate()` (handled automatically by Spring Security's default logout handler).
* **Client-Side Cleanup:** The server returns a `Set-Cookie` header to immediately expire the `JSESSIONID` cookie in the browser.
* **Subsequent Requests:** Once logged out, any request requiring authentication will immediately return `401 Unauthorized`.

# 10. Session Management

* **Identifier:** `JSESSIONID`.
* **Server-Side State:** Sessions are stored in the server's memory (embedded Tomcat default).
* **Cookie Security Attributes (Required Properties):**
* `HttpOnly: true` (Prevents JavaScript `document.cookie` from reading the session ID, mitigating XSS session theft).
* `SameSite: Lax` (Protects against CSRF while allowing smooth navigation).


* **Environment-Dependent Configuration:**
* `Secure: true` (Must be enabled in Production when HTTPS is active. May be `false` during local `localhost` HTTP development).



# 11. Session Fixation Protection

Spring Security's default session fixation protection must remain enabled. When a user authenticates, Spring Security must create a completely new session ID and migrate the attributes from the old session, ensuring that an attacker who forces a pre-login session ID onto a victim cannot hijack the post-login session.

# 12. CSRF Protection

Because the application uses **Session-Based Authentication**, CSRF (Cross-Site Request Forgery) protection is **mandatory** for all state-changing requests (`POST`, `PUT`, `DELETE`).

* **Strategy:** Use Spring Security's CookieCsrfTokenRepository.
* **Behavior:** The server sets an `XSRF-TOKEN` cookie (readable by JS). The frontend Vanilla JS `api.js` client must read this cookie and attach it as the `X-XSRF-TOKEN` header on all non-GET requests.
* **Failure:** Missing or invalid CSRF tokens will cause Spring Security to reject the request with `403 Forbidden` before it reaches the Controller.

# 13. Authentication vs Authorization

* **Authentication (Who are you?):** "You have provided a valid email and password, therefore you are User #45."
* **Authorization (What can you do?):** "You are User #45, you possess the `CUSTOMER` role, and therefore you are allowed to POST to `/api/orders`."

# 14. Role-Based Access Control

The application implements a strict two-role model mapped to Spring Security GrantedAuthorities: `ROLE_USER` and `ROLE_ADMIN`.

| Resource | Anonymous | ROLE_USER | ROLE_ADMIN |
| --- | --- | --- | --- |
| `POST /api/auth/login` | ✓ | — | — |
| `GET /api/products` | ✓ | ✓ | ✓ |
| `GET /api/cart` | — | ✓ | — |
| `POST /api/orders` | — | ✓ | — |
| `GET /api/orders` | — | ✓ | — |
| `POST /api/admin/products` | — | — | ✓ |
| `PUT /api/admin/orders/...` | — | — | ✓ |

# 15. Endpoint Authorization

| API Area | Authentication | Required Role | Ownership Check |
| --- | --- | --- | --- |
| `/api/auth/register` | No | — | — |
| `/api/auth/login` | No | — | — |
| `/api/products/**` | No | — | — |
| `/api/categories` | No | — | — |
| `/api/cart/**` | Yes | ROLE_USER | Inherently tied to Session |
| `/api/orders` (GET, POST) | Yes | ROLE_USER | Must check current user |
| `/api/orders/{id}` | Yes | ROLE_USER | Order must belong to Session User |
| `/api/admin/**` | Yes | ROLE_ADMIN | — |

# 16. Ownership and IDOR Prevention

**Insecure Direct Object Reference (IDOR)** prevention is the most critical business-logic security requirement.

* **Never trust client-supplied IDs for authorization.** A payload containing `{"userId": 1}` is meaningless for determining authorization. The server must extract the `userId` from the authenticated Spring Security `Principal`.
* **Object-Level Checks:** When a customer calls `GET /api/orders/123`, the `OrderService` must verify:
`if (!order.getUser().getId().equals(authenticatedUserId)) { throw new AccessDeniedException(); }`
* **Blind Updates:** A customer cannot update `cart_items/99` unless `cartItem 99` belongs to the cart owned by the authenticated user.

# 17. Customer Data Isolation

* A customer's session strictly bounds their data access.
* A customer interacting with the `/api/cart` endpoints implicitly interacts *only* with the Cart entity tied to their `userId` in the database.
* A customer cannot query another user's profile, cart, or order history. Attempting to do so via URL manipulation must result in a `404 Not Found` (preferred over 403 to prevent exposing the existence of other users' data).

# 18. Administrative Security

* **Strict Path Protection:** All endpoints prefixed with `/api/admin/**` must be protected by `@PreAuthorize("hasRole('ADMIN')")` or equivalent Spring Security HttpSecurity configurations.
* **No Client Reliance:** Hiding the "Admin Dashboard" button in HTML is irrelevant. If a `ROLE_USER` attempts to manually navigate to or `fetch()` an admin endpoint, the server must reject it with `403 Forbidden`.

# 19. Object-Level Authorization

Role checks are insufficient for customer data.

1. **Authentication:** User provides valid cookie.
2. **Role Authorization:** System confirms user has `ROLE_USER` and can access `/api/orders/{id}`.
3. **Object Authorization:** System fetches Order `{id}` from DB and confirms `order.userId == session.userId`.
4. **Business Rule:** System confirms the order can be viewed.

# 20. Input Validation Security

* **Server-Side Enforcement:** Validation must be enforced using standard `jakarta.validation` annotations (e.g., `@NotBlank`, `@Email`, `@Min(1)`) on Request DTOs.
* **Constraints:**
* Quantities must strictly be `> 0`.
* Prices (Admin) must be `>= 0`.
* Order status updates must strictly map to defined Enums/Strings (`PENDING`, `SHIPPED`, `DELIVERED`).


* If validation fails, the Controller must throw a `MethodArgumentNotValidException` to be caught by the global error handler, returning a `400 Bad Request`.

# 21. SQL Injection Prevention

* **Rule:** Never construct SQL queries using string concatenation.
* **Implementation:** All database access must occur through Spring Data JPA repositories. JPA inherently utilizes JDBC Parameterized Queries, safely escaping user input before it reaches the MySQL engine. Custom `@Query` annotations must use named parameters (e.g., `:email`), never string concatenation.

# 22. XSS Prevention

* **Backend:** The REST API treats all strings as data, not executable code. It relies on the frontend to render it safely.
* **Frontend (Vanilla JS):** When injecting data retrieved from the API into the DOM (e.g., a product name or description), the JavaScript must use `element.textContent = data.name;` rather than `element.innerHTML = data.name;`.
* Only explicitly trusted, sanitized content (if Rich Text formatting is added later) may bypass this rule.

# 23. Output Encoding

Because the application utilizes a JSON REST API consumed by JavaScript, standard JSON serialization (via Jackson) inherently handles character escaping for transport. The responsibility for HTML encoding falls strictly to the Vanilla JS DOM manipulation APIs (`textContent`).

# 24. Sensitive Data Protection

The following data must **never** be exposed in API responses, logs, or exceptions:

* `password_hash`
* `JSESSIONID` strings (in logs)
* Database connection strings or credentials.
* Server stack traces (e.g., NullPointerExceptions must be swallowed and replaced with a generic 500 error message).

# 25. Browser Storage Security

Because the application uses Statefull Server-Side Sessions:

* **Rule:** Do NOT store authentication state, session identifiers, or JWTs (which are not used) in `localStorage` or `sessionStorage`.
* **Reasoning:** `localStorage` is accessible to any JavaScript running on the page, making it highly vulnerable to XSS attacks. The `JSESSIONID` cookie, protected by `HttpOnly`, is immune to this attack vector.

# 26. Cookie Security

The `JSESSIONID` cookie configuration is the linchpin of the authentication model.

**Security Requirements:**

* `HttpOnly: true`
* `SameSite: Lax`

**Deployment-Dependent Configuration:**

* `Secure`: Must be `true` in production (requires HTTPS). Can be `false` during local development over HTTP.

# 27. CORS Security

* **Rule:** Cross-Origin Resource Sharing (CORS) must be configured securely.
* **Wildcards:** `Allowed-Origins: *` combined with `Allow-Credentials: true` is an invalid and highly insecure configuration.
* **Implementation:** If the frontend and backend run on different ports during development (e.g., `Live Server` on 5500, `Tomcat` on 8080), Spring Security must explicitly allow the specific frontend origin (`http://localhost:5500`) and set `Allow-Credentials: true` to permit the session cookie to cross ports.

# 28. Error Handling Security

All exceptions must be caught by a centralized `@ControllerAdvice`.

* **Client Errors:** Return actionable messages (e.g., "Email is required").
* **Server Errors:** Return generic messages (e.g., "An unexpected error occurred").
* **Rule:** Stack traces and framework internals must be completely stripped from the production JSON response.

# 29. Authentication Error Handling

* **Invalid Login:** `401 Unauthorized` (Generic message).
* **Unauthenticated Request:** `401 Unauthorized`.
* **CSRF Failure:** `403 Forbidden` (Spring Security default).
* The frontend `api.js` wrapper must intercept `401` responses and automatically redirect the user to `/login.html`.

# 30. Authorization Error Handling

* **Insufficient Role (Customer hitting Admin API):** `403 Forbidden`.
* **Failed Ownership Check (IDOR attempt):** If a customer requests `/api/orders/999` and it belongs to someone else, return **`404 Not Found`**. Returning `403` proves the order exists, leaking business intelligence. `404` safely obscures existence.

# 31. Business Logic Security

These rules MUST be enforced by the backend Service layer:

* **Pricing:** The client cannot dictate the final price of a product or an order.
* **Inventory:** The client cannot purchase more stock than is available in the database.
* **Order Status:** A customer cannot invoke the endpoint that changes an order's fulfillment status.
* **Admin Bypass:** Administrative endpoints cannot be accessed by modifying request payloads.

# 32. Checkout Security

The checkout flow is the most sensitive business operation.

**The client must NOT control:**

* User identity (Server reads session).
* Product prices (Server reads from DB).
* Final order total (Server calculates).
* Stock levels.

**Transactional Integrity:**
Checkout is an atomic `@Transactional` operation. If validating stock, capturing prices, creating the order, or deducting inventory fails at any point, the entire operation must roll back, ensuring money/stock is never out of sync.

# 33. Order Security

* **Order Integrity:** Once an order is placed, the `order_items` must capture a permanent snapshot of the `price_at_purchase`. Changes to the `products` catalog price must never propagate to historical orders.
* **Visibility:** Customers may only view orders tied to their exact `userId`. Admins may view all orders.

# 34. Product Management Security

* Only authenticated administrators may create, update, or soft-delete products.
* Products cannot be hard-deleted if they are tied to historical orders; they must be marked inactive (soft-deleted) to preserve data integrity.

# 35. Mass Assignment / Over-Posting Protection

* **Rule:** The API must use strict Request DTOs.
* **Reasoning:** If the Controller binds the raw `User` entity to the incoming JSON, a malicious user could send `{"role": "ROLE_ADMIN"}` during registration and gain admin rights.
* By using a `RegisterRequest` DTO that only contains `fullName`, `email`, and `password`, the `role` field is completely insulated from client manipulation.

# 36. Security Headers

Spring Security automatically applies a baseline of secure HTTP response headers. These should remain enabled:

* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `X-XSS-Protection: 1; mode=block`
* `Cache-Control: no-cache, no-store, max-age=0, must-revalidate` (for authenticated APIs)
* `Strict-Transport-Security` (in HTTPS production environments).

# 37. HTTPS / Transport Security

* Production traffic MUST be served over HTTPS.
* Passing BCrypt hashes or plaintext passwords over unencrypted HTTP exposes the application to catastrophic credential theft via network sniffing.

# 38. Secrets Management

* **Rule:** Secrets (Database passwords, API keys) must NEVER be committed to Git.
* **Implementation:** Use environment variables. In `application.properties`, configure data sources as `spring.datasource.password=${DB_PASSWORD}`. Supply the actual password via the deployment environment's secrets manager.

# 39. Logging Security

* Log significant security events (Successful logins, failed logins, checkout completions).
* **MUST NOT LOG:** User passwords, `JSESSIONID` cookies, full credit card numbers (if added later), or PII without necessity.

# 40. Dependency Security

* The project relies on Maven.
* **Rule:** Minimize external dependencies. Only include libraries strictly required for the MVP. Do not introduce massive frameworks (like Apache Struts or unused XML parsers) that widen the attack surface unnecessarily.

# 41. Security Testing Strategy

The API must pass the following manual/automated tests (via Postman):

* **Auth:** Attempt login with wrong password -> expect `401`.
* **IDOR:** Log in as User A. Call `GET /api/orders/{user_b_order_id}` -> expect `404`.
* **RBAC:** Log in as Customer. Call `POST /api/admin/products` -> expect `403`.
* **Business Logic:** Attempt to checkout with 50 units when stock is 5 -> expect `400`.
* **Mass Assignment:** Send `{"role": "ROLE_ADMIN"}` during registration -> verify user is created as `ROLE_USER`.

# 42. Security Acceptance Criteria

* [ ] Passwords are never stored in plaintext.
* [ ] Password hashes never appear in API JSON responses.
* [ ] Unauthenticated users are rejected from `/api/cart`, `/api/orders`, and `/api/admin`.
* [ ] Customers are rejected from `/api/admin`.
* [ ] IDOR protections are implemented on Carts and Orders.
* [ ] Order totals and pricing are calculated exclusively on the backend.
* [ ] CSRF protection is active for non-GET requests.
* [ ] Vanilla JS uses `textContent` to prevent XSS.
* [ ] Global exception handler prevents stack trace leakage.

# 43. Threat Model

| Asset | Attack | Security Control | Residual Risk |
| --- | --- | --- | --- |
| Customer Account | Brute-force password guessing | BCrypt hashing slows attacks. | Low (High effort required). |
| Customer Orders | IDOR (guessing Order IDs) | Object-level ownership validation. | None. |
| Admin Dashboard | Unauthorized access | Spring Security Role checks. | None. |
| Product Prices | Client-side manipulation | Server authoritative pricing logic. | None. |
| Database | SQL Injection | JPA Parameterized Queries. | None. |

# 44. Security Risk Register

| Risk | Likelihood | Impact | Mitigation | MVP Status |
| --- | --- | --- | --- | --- |
| IDOR on Orders | Low | High | Strict `order.userId == session.userId` checks in Service layer. | Addressed |
| XSS via Product Desc | Medium | High | Use `textContent` in JS DOM rendering. | Addressed |
| CSRF on Checkout | Medium | High | Spring Security CSRF Tokens. | Addressed |
| Price Manipulation | Low | High | Ignore client prices; use DB prices during Checkout transaction. | Addressed |

# 45. Security vs Usability Tradeoffs

* **Session vs JWT:** Sessions are chosen over JWTs because they inherently solve token revocation and avoid the XSS risks associated with storing JWTs in `localStorage`. The tradeoff is memory usage on the Tomcat server, which is negligible for this MVP.
* **No Email Verification:** To keep the MVP achievable, accounts are active immediately upon registration. The tradeoff is the potential for fake accounts.

# 46. Future Security Enhancements

*The following are explicitly deferred from the MVP scope:*

* Password Reset via secure email tokens.
* Account Lockout after N failed login attempts.
* Multi-Factor Authentication (MFA) for Admins.
* Integration with external Payment Gateways (Stripe), which shifts PCI compliance liability off the application.

# 47. Security Invariants

**Google Antigravity MUST NEVER violate these rules:**

1. **Never store plaintext passwords.**
2. **Never expose password hashes in API responses.**
3. **Never trust client-supplied user identity (`userId`) for authorization or data retrieval.**
4. **Never trust client-supplied prices or final order totals.**
5. **Never trust client-supplied stock availability.**
6. **Never allow customers to access another customer's private resources.**
7. **Never allow customers to access admin endpoints.**
8. **Never rely on frontend HTML/JS restrictions as actual authorization.**
9. **Never store authentication state in `localStorage` for this session-based architecture.**
10. **Never disable CSRF protection.**
11. **Never expose Java stack traces in production API JSON responses.**
12. **Never commit secrets (DB passwords) to version control.**
13. **Never bypass Service-layer security checks for convenience.**

# 48. Security Documentation Ownership

| Concern | Authoritative Document |
| --- | --- |
| Product scope | `01_PRODUCT_REQUIREMENTS.md` |
| Technical architecture | `02_ARCHITECTURE.md` |
| Database design | `03_DATABASE_DESIGN.md` |
| API contracts | `04_API_CONTRACTS.md` |
| **Security/Auth** | **`05_SECURITY_AND_AUTH.md`** |
| Implementation state | `06_IMPLEMENTATION_STATUS.md` |
| AI-agent operational rules | `AGENTS.md` |

# 49. Antigravity Security Development Rules

* **Source of Truth:** Treat this document as the absolute authority on application security.
* **No Inventions:** Do not invent authentication mechanisms (e.g., JWT) that contradict this document's mandate for Sessions.
* **Authorization Enforcement:** When writing Service layer methods, explicitly write the Java code that verifies resource ownership against the authenticated user.
* **Conflict Resolution:** If a requested feature seems to require violating a Security Invariant (Section 47), stop and surface the conflict. Do not silently weaken security.

# 50. Open Security Decisions

**No significant unresolved security decisions identified.**
The session-based model, combined with strict server-side authority for pricing and ownership, perfectly secures the established MVP scope.

# 51. Final Security Summary

* **Auth Model:** Spring Security Stateful Sessions (`JSESSIONID`).
* **Passwords:** Hashed with BCrypt.
* **Roles:** `ROLE_USER` and `ROLE_ADMIN`.
* **Ownership:** Enforced server-side. Clients cannot view other clients' data.
* **CSRF:** Enabled via tokens.
* **XSS:** Mitigated via Vanilla JS `textContent`.
* **SQLi:** Prevented via Spring Data JPA.
* **Checkout:** Server is absolute authority on pricing, inventory, and totals.
* **Secrets:** Handled via Environment Variables.
* **Invariants:** Server trusts no client data regarding price, stock, or identity.

# 52. Document Metadata

* **Document Name:** Security, Authentication, and Authorization Document
* **Purpose:** Authoritative definition of all security controls, trust boundaries, and authorization logic.
* **Status:** APPROVED FOR MVP
* **Authority Level:** HIGHEST (For Security Implementations)
* **Dependencies:** `01_PRODUCT_REQUIREMENTS.md`, `02_ARCHITECTURE.md`, `03_DATABASE_DESIGN.md`, `04_API_CONTRACTS.md`
* **Consumers:** Backend Developers, API Testers, Google Antigravity.
* **Update Policy:** Must be updated and reviewed before implementing any new role, authentication mechanism, or payment integration.

```

```