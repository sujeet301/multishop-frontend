import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { formatPrice } from "../../utils/helpers";

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--text-muted)] mb-1">{label}</p>
        <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color.replace("text-","bg-").replace("-600","-100").replace("-400","-100")} dark:bg-opacity-20`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function SellerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/sellers/dashboard").then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  const stats = data?.stats || {};
  const monthly = data?.monthlySales || [];
  const top = data?.topProducts || [];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const maxRev = Math.max(...monthly.map(m => m.revenue), 1);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text)]">Seller Dashboard 📊</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📦" label="Total Products" value={stats.totalProducts || 0} color="text-blue-600 dark:text-blue-400" delay={0} />
        <StatCard icon="🛒" label="Total Orders" value={stats.totalOrders || 0} color="text-purple-600 dark:text-purple-400" delay={0.05} />
        <StatCard icon="💰" label="Total Revenue" value={formatPrice(stats.totalRevenue || 0)} color="text-green-600 dark:text-green-400" delay={0.1} />
        <StatCard icon="⭐" label="Avg Rating" value={`${(stats.rating || 0).toFixed(1)}/5`} color="text-amber-600 dark:text-amber-400" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly sales chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-display font-bold text-base text-[var(--text)] mb-4">Monthly Revenue</h2>
          {monthly.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">No sales data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-48 overflow-x-auto pb-2">
              {monthly.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-8">
                  <span className="text-xs text-[var(--text-muted)] font-medium">{formatPrice(m.revenue).replace("₹","")}</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4,(m.revenue/maxRev)*160)}px` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 min-h-1" />
                  <span className="text-[10px] text-[var(--text-muted)]">{months[(m._id?.month || 1) - 1]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base text-[var(--text)]">Top Products</h2>
            <Link to="/seller/products" className="text-xs text-primary-500 hover:underline">View all</Link>
          </div>
          {top.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">
              <span className="text-3xl block mb-2">📦</span>No products yet.
              <Link to="/seller/products" className="block text-primary-500 hover:underline mt-2 text-xs">Add your first product</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {top.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[var(--text-muted)] w-5">{i+1}</span>
                  <img src={p.images?.[0]?.url} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 dark:bg-gray-800" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text)] truncate">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{p.sold} sold · ⭐ {p.ratings?.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "➕", label: "Add Product", to: "/seller/products", color: "from-blue-500 to-cyan-500" },
          { icon: "📋", label: "View Orders", to: "/seller/orders", color: "from-purple-500 to-violet-500" },
          { icon: "📈", label: "Analytics", to: "/seller/analytics", color: "from-green-500 to-emerald-500" },
          { icon: "🏪", label: "Edit Shop", to: "/seller/profile", color: "from-orange-500 to-amber-500" },
        ].map(({ icon, label, to, color }) => (
          <Link key={to} to={to}
            className={`card p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow bg-gradient-to-br ${color} text-white`}>
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
