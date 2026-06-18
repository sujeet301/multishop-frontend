import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { formatPrice, formatDate, getStatusColor } from "../../utils/helpers";

const statusOptions = ["pending","processing","shipped","out_for_delivery","delivered","cancelled"];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try { const res = await api.get("/orders/seller-orders"); setOrders(res.data.data || []); }
    catch { toast.error("Failed to load orders"); }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, itemId, status) => {
    setUpdatingId(itemId);
    try {
      await api.put(`/orders/${orderId}/items/${itemId}/status`, { status });
      toast.success("Status updated!");
      loadOrders();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    setUpdatingId(null);
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-6">My Orders 🛒</h1>
      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20"><span className="text-6xl block mb-4">📋</span><h3 className="font-bold text-xl text-[var(--text)]">No orders yet</h3></div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <p className="font-bold text-[var(--text)]">#{order.orderNumber}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(order.createdAt)} · {order.user?.name}</p>
                </div>
                <span className="font-bold text-primary-600">{formatPrice(order.pricing?.total)}</span>
              </div>
              <div className="space-y-3">
                {order.items?.map(item => (
                  <div key={item._id} className="flex flex-wrap items-center gap-3 pb-3 border-b border-[var(--border)] last:border-0">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{item.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity} · {formatPrice(item.discountPrice)}</p>
                    </div>
                    <span className={`${getStatusColor(item.status)} text-xs`}>{item.status?.replace(/_/g," ")}</span>
                    <select value={item.status} disabled={updatingId === item._id}
                      onChange={e => handleStatusUpdate(order._id, item._id, e.target.value)}
                      className="input text-xs py-1.5 pl-2 pr-6 w-auto cursor-pointer">
                      {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
