import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import { loadUser } from "./store/slices/authSlice";
import { setDarkMode } from "./store/slices/uiSlice";
import { fetchCart } from "./store/slices/cartSlice";
import { fetchWishlist } from "./store/slices/wishlistSlice";
import { connectSocket, disconnectSocket } from "./utils/socket";
import { addNotification } from "./store/slices/notificationSlice";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import SellerLayout from "./components/layout/SellerLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

// Seller Pages
import SellerRegisterPage from "./pages/seller/SellerRegisterPage";
import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import SellerProductsPage from "./pages/seller/SellerProductsPage";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage";
import SellerAnalyticsPage from "./pages/seller/SellerAnalyticsPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSellersPage from "./pages/admin/AdminSellersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminBannersPage from "./pages/admin/AdminBannersPage";
import AdminCouponsPage from "./pages/admin/AdminCouponsPage";

// Guards
const PrivateRoute = ({ children }) => {
  const { token, initialized } = useSelector((s) => s.auth);
  if (!initialized) return <PageLoader />;
  return token ? children : <Navigate to="/login" replace />;
};

const SellerRoute = ({ children }) => {
  const { user, token, initialized } = useSelector((s) => s.auth);
  if (!initialized) return <PageLoader />;
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "seller" && user?.role !== "admin") return <Navigate to="/seller/register" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, token, initialized } = useSelector((s) => s.auth);
  if (!initialized) return <PageLoader />;
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);
  return token ? <Navigate to="/" replace /> : children;
};

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg)]">
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="text-4xl"
    >
      🛍️
    </motion.div>
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const PageWrapper = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

export default function App() {
  const dispatch = useDispatch();
  const { user, token, darkMode } = useSelector((s) => ({ ...s.auth, darkMode: s.ui.darkMode }));

  // Initialize theme
  useEffect(() => {
    dispatch(setDarkMode(darkMode));
  }, []);

  // Load user on mount
  useEffect(() => {
    if (token) {
      dispatch(loadUser());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    } else {
      dispatch({ type: "auth/loadUser/rejected" });
    }
  }, [token]);

  // Socket.IO for real-time notifications
  useEffect(() => {
    if (user?._id) {
      const socket = connectSocket(user._id);
      socket.on("notification", (notif) => {
        dispatch(addNotification(notif));
        import("react-hot-toast").then(({ default: toast }) => {
          toast(notif.message, { icon: "🔔", duration: 4000 });
        });
      });
      return () => disconnectSocket();
    }
  }, [user?._id]);

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* ─── Public / Main ─── */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/products" element={<PageWrapper><ProductsPage /></PageWrapper>} />
            <Route path="/products/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
            <Route path="/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
            <Route path="/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
            <Route path="/checkout" element={<PrivateRoute><PageWrapper><CheckoutPage /></PageWrapper></PrivateRoute>} />
            <Route path="/order-success/:id" element={<PrivateRoute><PageWrapper><OrderSuccessPage /></PageWrapper></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><PageWrapper><OrdersPage /></PageWrapper></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><PageWrapper><OrderDetailPage /></PageWrapper></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><PageWrapper><ProfilePage /></PageWrapper></PrivateRoute>} />
          </Route>

          {/* ─── Auth ─── */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ─── Seller ─── */}
          <Route path="/seller/register" element={<PrivateRoute><SellerRegisterPage /></PrivateRoute>} />
          <Route element={<SellerRoute><SellerLayout /></SellerRoute>}>
            <Route path="/seller/dashboard" element={<PageWrapper><SellerDashboardPage /></PageWrapper>} />
            <Route path="/seller/products" element={<PageWrapper><SellerProductsPage /></PageWrapper>} />
            <Route path="/seller/orders" element={<PageWrapper><SellerOrdersPage /></PageWrapper>} />
            <Route path="/seller/analytics" element={<PageWrapper><SellerAnalyticsPage /></PageWrapper>} />
          </Route>

          {/* ─── Admin ─── */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboardPage /></PageWrapper>} />
            <Route path="/admin/users" element={<PageWrapper><AdminUsersPage /></PageWrapper>} />
            <Route path="/admin/sellers" element={<PageWrapper><AdminSellersPage /></PageWrapper>} />
            <Route path="/admin/products" element={<PageWrapper><AdminProductsPage /></PageWrapper>} />
            <Route path="/admin/orders" element={<PageWrapper><AdminOrdersPage /></PageWrapper>} />
            <Route path="/admin/categories" element={<PageWrapper><AdminCategoriesPage /></PageWrapper>} />
            <Route path="/admin/banners" element={<PageWrapper><AdminBannersPage /></PageWrapper>} />
            <Route path="/admin/coupons" element={<PageWrapper><AdminCouponsPage /></PageWrapper>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}