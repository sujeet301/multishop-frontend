# MultiShop Frontend 🛍️

React + Redux Toolkit + Tailwind CSS frontend for the MultiShop e-commerce platform.

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env      # Add your env values
npm start                  # Runs on http://localhost:3000
```

## Project Structure

```
src/
├── App.jsx                        # Router + guards
├── index.js / index.css           # Entry + global styles
├── store/
│   ├── index.js                   # Redux store
│   └── slices/                    # authSlice, cartSlice, wishlistSlice,
│                                  # productSlice, orderSlice, uiSlice, notificationSlice
├── utils/
│   ├── api.js                     # Axios instance with interceptors
│   ├── helpers.js                 # formatPrice, formatDate, etc.
│   └── socket.js                  # Socket.IO connection
├── components/
│   ├── layout/                    # Navbar, Footer, MainLayout, SellerLayout, AdminLayout
│   ├── home/                      # HeroSlider
│   ├── product/                   # ProductCard, QuickViewModal
│   ├── cart/                      # CartDrawer
│   └── common/                    # StarRating, SearchOverlay
└── pages/
    ├── HomePage.jsx
    ├── ProductsPage.jsx            # Search, filter, sort, paginate
    ├── ProductDetailPage.jsx
    ├── CartPage.jsx
    ├── CheckoutPage.jsx            # 3-step: address → payment → review
    ├── OrderSuccessPage.jsx
    ├── OrdersPage.jsx
    ├── OrderDetailPage.jsx         # Live status tracker
    ├── WishlistPage.jsx
    ├── ProfilePage.jsx             # Profile, addresses, security tabs
    ├── NotFoundPage.jsx
    ├── auth/
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── ForgotPasswordPage.jsx
    │   ├── ResetPasswordPage.jsx
    │   └── VerifyEmailPage.jsx
    ├── seller/
    │   ├── SellerRegisterPage.jsx  # 3-step seller application
    │   ├── SellerDashboardPage.jsx # Stats + revenue chart
    │   ├── SellerProductsPage.jsx  # CRUD + flash sale toggle
    │   ├── SellerOrdersPage.jsx    # Status update per item
    │   └── SellerAnalyticsPage.jsx # Best sellers, revenue, conversion
    └── admin/
        ├── AdminDashboardPage.jsx
        ├── AdminUsersPage.jsx      # Block/unblock/delete
        ├── AdminSellersPage.jsx    # Approve/reject/suspend
        ├── AdminProductsPage.jsx
        ├── AdminOrdersPage.jsx
        ├── AdminCategoriesPage.jsx
        ├── AdminBannersPage.jsx
        └── AdminCouponsPage.jsx
```

## Features
- 🌙 Dark / Light mode with localStorage persistence
- 🛒 Slide-in cart drawer with live item count
- 🔍 Full-screen search overlay with suggestions
- 🔔 Real-time notifications via Socket.IO
- ❤️ Animated wishlist with heart pop effect
- 👁️ Quick-view product modal
- 📊 Seller bar charts (pure CSS, no extra lib)
- 🎟️ Coupon validation at checkout
- 💳 Razorpay & Stripe payment flows
- 📱 Fully responsive (mobile-first)
- ✨ Framer Motion page transitions & micro-interactions

## Env Variables

| Key | Description |
|-----|-------------|
| REACT_APP_API_URL | Backend API base URL |
| REACT_APP_SOCKET_URL | Socket.IO server URL |
| REACT_APP_GOOGLE_CLIENT_ID | Google OAuth client ID |
