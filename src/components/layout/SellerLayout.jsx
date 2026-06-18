import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../store/slices/authSlice";
import { toggleDarkMode } from "../../store/slices/uiSlice";

const navItems = [
  { label: "Dashboard", to: "/seller/dashboard", icon: "📊" },
  { label: "Products", to: "/seller/products", icon: "📦" },
  { label: "Orders", to: "/seller/orders", icon: "🛒" },
  { label: "Analytics", to: "/seller/analytics", icon: "📈" },
];

export default function SellerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { darkMode } = useSelector((s) => s.ui);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { dispatch(logout()); navigate("/"); };

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full z-40 flex flex-col border-r border-[var(--border)] overflow-hidden"
        style={{ background: "var(--bg-card)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border)]">
          <span className="text-2xl flex-shrink-0">🏪</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-display font-bold text-sm text-gradient leading-tight">Seller Panel</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[140px]">{user?.name}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(({ label, to, icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={active ? "nav-item-active" : "nav-item-inactive"}
                title={collapsed ? label : undefined}
              >
                <span className="text-lg flex-shrink-0">{icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium whitespace-nowrap">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 py-4 border-t border-[var(--border)] space-y-1">
          <button onClick={() => dispatch(toggleDarkMode())}
            className="nav-item-inactive w-full" title={collapsed ? "Toggle theme" : undefined}>
            <span className="text-lg">{darkMode ? "☀️" : "🌙"}</span>
            <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">Theme</motion.span>}</AnimatePresence>
          </button>
          <Link to="/" className="nav-item-inactive" title={collapsed ? "Back to shop" : undefined}>
            <span className="text-lg">🛍️</span>
            <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">Back to Shop</motion.span>}</AnimatePresence>
          </Link>
          <button onClick={handleLogout} className="nav-item-inactive w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500" title={collapsed ? "Logout" : undefined}>
            <span className="text-lg">🚪</span>
            <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">Logout</motion.span>}</AnimatePresence>
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors z-10">
          {collapsed ? "›" : "‹"}
        </button>
      </motion.aside>

      {/* Main */}
      <motion.main animate={{ marginLeft: collapsed ? 72 : 240 }} transition={{ duration: 0.25 }} className="flex-1 min-h-screen">
        <Outlet />
      </motion.main>
    </div>
  );
}
