import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[var(--bg)]">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-[120px] leading-none mb-4 select-none">
        🛍️
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="font-display font-extrabold text-6xl text-gradient mb-2">404</motion.h1>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-[var(--text)] mb-2">Page Not Found</motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-[var(--text-muted)] mb-8 max-w-md">
        Looks like this page went out of stock! Let's get you back to shopping.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="btn-primary btn-lg">🏠 Back to Home</Link>
        <Link to="/products" className="btn-outline btn-lg">Browse Products</Link>
      </motion.div>
    </div>
  );
}
