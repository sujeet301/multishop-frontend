import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrder } from "../store/slices/orderSlice";
import { motion } from "framer-motion";
import { formatPrice, formatDate } from "../utils/helpers";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id]);

  return (
    <div className="container-custom py-16 max-w-xl text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-5xl mx-auto mb-6">
        ✅
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="font-display font-bold text-3xl text-[var(--text)] mb-2">Order Placed! 🎉</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-[var(--text-muted)] mb-6">
        Thank you for shopping with MultiShop. Your order has been received and is being processed.
      </motion.p>
      {order && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card p-5 text-left mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[var(--text-muted)]">Order Number</span>
            <span className="font-bold text-[var(--text)]">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[var(--text-muted)]">Total Amount</span>
            <span className="font-bold text-primary-600">{formatPrice(order.pricing?.total)}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[var(--text-muted)]">Payment Method</span>
            <span className="font-semibold text-[var(--text)] capitalize">{order.paymentMethod?.toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-muted)]">Estimated Delivery</span>
            <span className="font-semibold text-[var(--text)]">5–7 Business Days</span>
          </div>
        </motion.div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/orders/${id}`} className="btn-primary">Track Order →</Link>
        <Link to="/products" className="btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}
