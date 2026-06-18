import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchMyOrders } from "../store/slices/orderSlice";
import { formatPrice, formatDate, getStatusColor } from "../utils/helpers";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, []);

  if (loading) return (
    <div className="container-custom py-8 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="container-custom py-8 max-w-4xl">
      <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">📦</span>
          <h3 className="font-bold text-xl text-[var(--text)]">No orders yet</h3>
          <p className="text-[var(--text-muted)] mt-2 mb-6">Time to start shopping!</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-bold text-[var(--text)]">#{order.orderNumber}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={getStatusColor(order.overallStatus)}>{order.overallStatus?.replace(/_/g, " ")}</span>
                  <span className="font-bold text-[var(--text)]">{formatPrice(order.pricing?.total)}</span>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {order.items?.slice(0, 4).map((item) => (
                  <img key={item._id} src={item.image || "https://via.placeholder.com/60"}
                    alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-800" />
                ))}
                {order.items?.length > 4 && (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <Link to={`/orders/${order._id}`} className="btn-outline text-sm px-4 py-2">View Details</Link>
                {["pending","processing"].includes(order.overallStatus) && (
                  <button className="text-sm text-red-500 hover:underline">Cancel</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
