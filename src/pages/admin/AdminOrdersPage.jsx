import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { formatPrice, formatDate, getStatusColor } from "../../utils/helpers";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(status && { status }), limit: 50 });
      const res = await api.get(`/orders/admin/all?${q}`);
      setOrders(res.data.data || []);
    } catch { toast.error("Failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [status]);

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-6">Order Management 🛒</h1>
      <select value={status} onChange={e => setStatus(e.target.value)} className="input w-auto text-sm py-2 mb-5">
        <option value="">All Orders</option>
        {["pending","processing","shipped","delivered","cancelled"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
      </select>
      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_,i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>{["Order #","Customer","Items","Total","Payment","Status","Date"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-muted)] uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <motion.tr key={o._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.02 }}
                    className="border-t border-[var(--border)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-primary-600">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-[var(--text)]">{o.user?.name||"N/A"}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">{o.items?.length}</td>
                    <td className="py-3 px-4 font-semibold text-[var(--text)]">{formatPrice(o.pricing?.total)}</td>
                    <td className="py-3 px-4"><span className={`badge text-[10px] ${o.paymentStatus==="paid"?"badge-success":o.paymentStatus==="failed"?"badge-danger":"badge-warning"}`}>{o.paymentStatus}</span></td>
                    <td className="py-3 px-4"><span className={`badge text-[10px] capitalize ${getStatusColor(o.overallStatus)}`}>{o.overallStatus?.replace(/_/g," ")}</span></td>
                    <td className="py-3 px-4 text-xs text-[var(--text-muted)]">{formatDate(o.createdAt)}</td>
                  </motion.tr>
                ))}
                {!orders.length && <tr><td colSpan={7} className="py-10 text-center text-[var(--text-muted)]">No orders found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
