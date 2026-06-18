import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const links = {
  Shop: [
    { label: "All Products", to: "/products" },
    { label: "Flash Sale ⚡", to: "/products?isFlashSale=true" },
    { label: "Featured", to: "/products?isFeatured=true" },
    { label: "New Arrivals", to: "/products?sort=newest" },
  ],
  Account: [
    { label: "My Profile", to: "/profile" },
    { label: "My Orders", to: "/orders" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Cart", to: "/cart" },
  ],
  Sell: [
    { label: "Become a Seller", to: "/seller/register" },
    { label: "Seller Dashboard", to: "/seller/dashboard" },
    { label: "Seller Analytics", to: "/seller/analytics" },
  ],
  Support: [
    { label: "Help Center", to: "#" },
    { label: "Return Policy", to: "#" },
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Service", to: "#" },
  ],
};

const socials = [
  { icon: "𝕏", label: "Twitter", href: "#" },
  { icon: "f", label: "Facebook", href: "#" },
  { icon: "in", label: "Instagram", href: "#" },
  { icon: "▶", label: "YouTube", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto" style={{ background: "var(--bg-card)" }}>
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛍️</span>
              <span className="font-display font-bold text-xl text-gradient">MultiShop</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">
              Your one-stop destination for the best products from verified sellers across India.
            </p>
            <div className="flex gap-2">
              {socials.map(({ icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/40 dark:hover:text-primary-400 transition-colors"
                >
                  {icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="font-display font-semibold text-sm text-[var(--text)] mb-4 uppercase tracking-wide">{section}</h3>
              <ul className="space-y-2.5">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-[var(--text-muted)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment icons */}
        <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} MultiShop. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">We accept:</span>
            {["💳 Visa", "💳 Mastercard", "🏦 Razorpay", "💸 UPI", "💵 COD"].map((p) => (
              <span key={p} className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
