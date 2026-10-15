# Streia ShopKart — Luxury Full-Stack E-Commerce Platform

A production-grade, full-stack e-commerce web application engineered with **React 19**, **Vite**, **Express**, **MongoDB Atlas**, and authentic **Razorpay Payment Gateway** integration with cryptographic HMAC-SHA256 signature verification.

---

## 🌟 Features

### 🛍️ Shopping & Catalog
- **Curated Catalog**: Luxury fashion, electronics, spring apparel, and horology.
- **Instant Search & Filters**: Live client & server search, category filtering, and price sorting (low to high, high to low).
- **Product Details**: High-resolution imagery, real-time inventory counter, product specs, and trust guarantees.

### 💖 Wishlist & Cart
- **Persistent Wishlist**: One-click bookmarking synced directly to the authenticated user's MongoDB profile.
- **Dynamic Cart**: Real-time quantity adjustments, stock availability enforcement, price calculations, and subtotal aggregation.

### 🔐 Authentication & Profile
- **Secure JWT Authentication**: HTTP-only secure cookies with bcrypt password hashing.
- **Executive Customer Dashboard**: Order statistics, total spend counter, registered address overview, and password management.

### 💳 Authentic Razorpay Payment Gateway
- **Official Checkout Popup**: Integrated directly with Razorpay Checkout SDK.
- **Omnichannel Payments**: Supports Instant UPI (Google Pay, PhonePe, Paytm, QR Code), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking (50+ banks), and Digital Wallets.
- **Cryptographic Verification**: Server-side HMAC-SHA256 signature verification using Node.js `crypto` before fulfilling orders.
- **Atomic Inventory Updates**: Real-time stock decrement upon confirmed payment.
- **Detailed Order Confirmation**: Official receipt view with Gateway Order ID, Payment ID, verification badge, and status tracking.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, Vite, Lucide React Icons |
| **Styling** | Modern Vanilla CSS Design System (Custom variables, responsive layouts, micro-animations) |
| **Backend** | Node.js, Express.js (REST API architecture) |
| **Database** | MongoDB Atlas (Mongoose ODM) with In-Memory fallback |
| **Payment Gateway** | Razorpay Node.js SDK & Razorpay Web Checkout SDK |
| **Security** | JWT (JSON Web Tokens), Bcrypt, Crypto HMAC-SHA256, CORS with credentials |

---

## 📁 Repository Structure

```text
Lab Project/
├── .gitignore                     # Global root gitignore (blocks .env, node_modules, dist)
├── README.md                      # Comprehensive project documentation
├── TEST_DATA.md                   # Ready-to-use Postman test data
│
├── backend/                       # Express REST API Server
│   ├── .gitignore                 # Backend-specific ignore rules
│   ├── index.js                   # Server entry point & database connection
│   ├── package.json
│   ├── config/
│   │   └── razorpay.js            # Razorpay SDK initialization & key manager
│   ├── controllers/
│   │   ├── customer.controller.js # Auth, registration, login & profile
│   │   ├── product.controller.js  # Catalog search, filtering & creation
│   │   ├── cart.controller.js     # Cart additions, quantity updates & removal
│   │   ├── wishlist.controller.js # Wishlist toggling & retrieval
│   │   └── order.controller.js    # Razorpay order generation & HMAC-SHA256 verification
│   ├── middlewares/
│   │   └── auth.middleware.js     # JWT token authentication & route protection
│   ├── models/
│   │   ├── customer.model.js      # Customer user schema & password hashing
│   │   ├── product.model.js       # Product schema with category & stock
│   │   └── order.model.js         # Order schema with items snapshot & Razorpay metadata
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── wishlist.routes.js
│   │   └── order.routes.js
│   └── utils/
│       ├── generateToken.js       # JWT cookie generation
│       └── seedData.js            # Default luxury product catalog data
│
└── frontend/                      # React 19 + Vite Single Page Application
    ├── index.html                 # HTML entry with fonts & Razorpay Checkout script
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   └── favicon.svg
    └── src/
        ├── main.jsx               # React DOM entry point
        ├── App.jsx                # Router config & CartProvider wrapper
        ├── index.css              # Core luxury design system tokens
        ├── components/
        │   ├── Navbar.jsx         # Executive navigation bar with live cart/wishlist counters
        │   ├── Footer.jsx         # Brand footer with quick navigation links
        │   ├── ProductCard.jsx    # Catalog card with quick-cart & wishlist toggle
        │   ├── CartItem.jsx       # Item row with quantity controls
        │   ├── WishlistCard.jsx   # Wishlist preview card
        │   └── SearchBar.jsx      # Live catalog search bar
        ├── context/
        │   └── CartContext.jsx    # Global cart state provider & hook
        ├── pages/
        │   ├── Home.jsx           # Luxury landing page with hero banner & featured collections
        │   ├── Products.jsx       # Catalog view with category filters & sorting
        │   ├── ProductDetails.jsx # Detailed single-product view
        │   ├── Wishlist.jsx       # User saved items management
        │   ├── Cart.jsx           # Shopping bag overview & subtotal summary
        │   ├── Checkout.jsx       # Executive delivery form & Razorpay popup launcher
        │   ├── Orders.jsx         # Customer order history & tracking
        │   ├── OrderSuccess.jsx   # Verified order placed receipt screen
        │   ├── Dashboard.jsx      # Customer profile overview & stats
        │   ├── Login.jsx          # Secure customer login
        │   └── Register.jsx       # New customer onboarding
        └── services/
            └── api.js             # Axios client with credentials & error interceptor
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- Database connection string & Payment gateway credentials

---

### 2. Backend Setup

1. Open your terminal and navigate to `backend`:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your local environment variables in `backend/.env` (ensure `.env` remains strictly git-ignored).

4. Start the backend API server:
   ```bash
   npm start
   ```
   *The server will start on `http://localhost:8000` and automatically seed sample products if the database is empty.*

---

### 3. Frontend Setup

1. Open a new terminal window and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🔒 Security Best Practices

1. **Zero Secret Exposure**: All `.env` files, credentials, and sensitive configurations are strictly ignored by `.gitignore` and never committed to version control.
2. **Cryptographic Payment Validation**: Razorpay payment signatures are validated using server-side HMAC-SHA256 (`crypto.createHmac('sha256', secretKey)`), guaranteeing payment integrity and preventing tampering.
3. **HTTP-Only Cookies**: JWT authentication tokens are transmitted via secure `httpOnly` cookies to protect against XSS credential theft.
4. **CORS Hardening**: Strict origin whitelist configured for trusted frontend development and production URLs.

---

## 📡 API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/customers/register` | Public | Register new customer account |
| `POST` | `/customers/login` | Public | Authenticate customer & set JWT cookie |
| `GET` | `/customers/me` | Protected | Get authenticated customer profile |
| `POST` | `/customers/logout` | Protected | Clear authentication session |
| `PATCH` | `/customers/change-password` | Protected | Update customer account password |
| `GET` | `/products` | Public | Fetch catalog with search, category & sort |
| `GET` | `/products/:id` | Public | Fetch single product by MongoDB ID |
| `POST` | `/products` | Public | Add new product to catalog |
| `GET` | `/cart` | Protected | Fetch user's active shopping cart |
| `POST` | `/cart/:productId` | Protected | Add product to shopping cart |
| `PATCH` | `/cart/:productId` | Protected | Update cart item quantity |
| `DELETE` | `/cart/:productId` | Protected | Remove item from cart |
| `GET` | `/wishlist` | Protected | Fetch user's saved wishlist items |
| `PATCH` | `/wishlist/:productId/toggle` | Protected | Toggle product in/out of wishlist |
| `GET` | `/orders/payment-config` | Public | Fetch active Razorpay public Key ID |
| `POST` | `/orders/create-payment-order` | Protected | Generate trusted Razorpay order |
| `POST` | `/orders/verify-payment` | Protected | Verify HMAC-SHA256 signature & mark PAID |
| `GET` | `/orders` | Protected | Retrieve authenticated user's order history |
| `GET` | `/orders/:id` | Protected | Get detailed order confirmation & tracking |

---

## 🌐 Deployment Instructions

### Deploying the Backend (Render / Railway)
1. Push repository to GitHub (ensure `.env` is ignored).
2. Create a new **Web Service** on your chosen cloud provider.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Configure your environment variables in your cloud hosting provider dashboard.

### Deploying the Frontend (Vercel / Netlify)
1. Create a new project on Vercel or Netlify.
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. If using a custom backend URL in production, configure your API endpoint in `frontend/src/services/api.js`.

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
