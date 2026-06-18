import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toggleDarkMode, toggleCart, toggleSearch } from "../../store/slices/uiSlice";
import { logout } from "../../store/slices/authSlice";
import { fetchNotifications, markRead } from "../../store/slices/notificationSlice";
import { formatRelativeTime } from "../../utils/helpers";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "Flash Sale 🔥", to: "/products?isFlashSale=true" },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userRef = useRef(null);
  const notifRef = useRef(null);

  const { user, token } = useSelector((s) => s.auth);
  const { darkMode } = useSelector((s) => s.ui);
  const cartCount = useSelector((s) => s.cart.count);
  const wishlistCount = useSelector((s) => s.wishlist.items.length);
  const { items: notifs, unreadCount } = useSelector((s) => s.notifications);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (token) dispatch(fetchNotifications());
  }, [token]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { dispatch(logout()); setUserDropOpen(false); navigate("/"); };
  const handleMarkAllRead = () => dispatch(markRead("all"));

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "?");

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-md border-b border-gray-100 dark:border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-4">
            <motion.span
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="text-2xl"
            >🛍️</motion.span>
            <span className="font-display font-bold text-xl text-gradient">MultiShop</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button onClick={() => dispatch(toggleSearch())} className="btn-icon" aria-label="Search">
              <SearchIcon />
            </button>

            {/* Dark mode */}
            <button onClick={() => dispatch(toggleDarkMode())} className="btn-icon" aria-label="Toggle theme">
              <motion.span animate={{ rotate: darkMode ? 360 : 0 }} transition={{ duration: 0.5 }}>
                {darkMode ? "☀️" : "🌙"}
              </motion.span>
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="btn-icon relative" aria-label="Wishlist">
              <HeartIcon />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={() => dispatch(toggleCart())} className="btn-icon relative" aria-label="Cart">
              <CartIcon />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Notifications */}
            {token && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="btn-icon relative"
                  aria-label="Notifications"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="dropdown right-0 w-80 max-h-96 overflow-y-auto"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-primary-500 hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifs.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications yet</div>
                      ) : (
                        notifs.slice(0, 10).map((n) => (
                          <div
                            key={n._id}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-[var(--border)] last:border-0 transition-colors ${
                              !n.isRead ? "bg-primary-50/50 dark:bg-primary-900/20" : ""
                            }`}
                          >
                            <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{n.title}</p>
                            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User / Auth */}
            {token && user ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserDropOpen(!userDropOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <img
                    src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-200"
                  />
                  <span className="hidden sm:block text-sm font-medium truncate max-w-24">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${userDropOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {userDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="dropdown right-0 w-52 py-2"
                    >
                      <div className="px-4 py-2 border-b border-[var(--border)]">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                      </div>
                      {[
                        { label: "My Profile", to: "/profile", icon: "👤" },
                        { label: "My Orders", to: "/orders", icon: "📦" },
                        { label: "Wishlist", to: "/wishlist", icon: "❤️" },
                        ...(user.role === "seller" || user.role === "admin" ? [{ label: "Seller Dashboard", to: "/seller/dashboard", icon: "🏪" }] : []),
                        ...(user.role === "admin" ? [{ label: "Admin Panel", to: "/admin/dashboard", icon: "👑" }] : []),
                      ].map(({ label, to, icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setUserDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors"
                        >
                          <span>{icon}</span> {label}
                        </Link>
                      ))}
                      <div className="border-t border-[var(--border)] mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <span>🚪</span> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost btn-sm text-sm">Login</Link>
                <Link to="/register" className="btn-primary btn-sm text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-icon"
              aria-label="Menu"
            >
              <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="container-custom py-4 flex flex-col gap-1">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors"
                >
                  {label}
                </Link>
              ))}
              {!token && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-outline flex-1 text-sm text-center py-2">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-sm text-center py-2">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Icon components
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const CartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
