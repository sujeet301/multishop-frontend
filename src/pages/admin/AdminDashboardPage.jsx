import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { formatPrice, formatDate } from "../../utils/helpers";

const StatCard = ({ icon, label, value, sub, color, delay, to }) => (
  <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay }}
    className="card p-5 hover:shadow-card-hover transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium mb-1">{label}</p>
        <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-gray-50 dark:bg-gray-800`}>{icon}</div>
    </div>
    {to && <Link to={to} className="block text-xs text-primary-500 hover:underline mt-3">View all →</Link>}
  </motion.div>
);

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      <div className="grid lg:grid-cols-3 gap-4">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
    </div>
  );

  const s = data?.stats || {};
  const monthly = data?.monthlyRevenue || [];
  const maxRev = Math.max(...monthly.map(m => m.revenue), 1);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text)]">Admin Dashboard 👑</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Platform overview & insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon="👥" label="Total Users" value={s.totalUsers?.toLocaleString()||0} color="text-blue-600 dark:text-blue-400" delay={0} to="/admin/users" />
        <StatCard icon="🏪" label="Active Sellers" value={s.totalSellers?.toLocaleString()||0} color="text-purple-600 dark:text-purple-400" delay={0.05} to="/admin/sellers" />
        <StatCard icon="📦" label="Products" value={s.totalProducts?.toLocaleString()||0} color="text-amber-600 dark:text-amber-400" delay={0.1} to="/admin/products" />
        <StatCard icon="🛒" label="Total Orders" value={s.totalOrders?.toLocaleString()||0} color="text-green-600 dark:text-green-400" delay={0.15} to="/admin/orders" />
        <StatCard icon="💰" label="Revenue" value={formatPrice(s.totalRevenue||0)} sub={`${10}% commission`} color="text-primary-600 dark:text-primary-400" delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-display font-bold text-base text-[var(--text)] mb-4">Monthly Revenue</h2>
          {monthly.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">No revenue data yet</div>
          ) : (
            <div className="flex items-end gap-1.5 h-48 overflow-x-auto pb-2">
              {monthly.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-7">
                  <span className="text-[9px] text-[var(--text-muted)]">{formatPrice(m.revenue).replace("₹","₹")}</span>
                  <motion.div initial={{ height:0 }} animate={{ height:`${Math.max(4,(m.revenue/maxRev)*160)}px` }}
                    transition={{ delay:i*0.04, duration:0.5 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400" />
                  <span className="text-[9px] text-[var(--text-muted)]">{months[(m._id?.month||1)-1]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-base text-[var(--text)] mb-4">Top Products</h2>
          <div className="space-y-3">
            {(data?.topProducts||[]).map((p,i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--text-muted)] w-5">{i+1}</span>
                <img src={p.images?.[0]?.url||"https://via.placeholder.com/40"} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text)] truncate">{p.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{p.sold} sold</p>
                </div>
                <span className="text-xs font-bold text-primary-600">{formatPrice(p.price)}</span>
              </div>
            ))}
            {!(data?.topProducts?.length) && <p className="text-sm text-[var(--text-muted)] text-center py-6">No products yet</p>}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-base text-[var(--text)]">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-primary-500 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Order #","Customer","Items","Total","Status","Date"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders||[]).map(o => (
                <tr key={o._id} className="border-b border-[var(--border)] last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="py-3 px-3 font-mono text-xs text-primary-600">{o.orderNumber}</td>
                  <td className="py-3 px-3 text-[var(--text)]">{o.user?.name||"N/A"}</td>
                  <td className="py-3 px-3 text-[var(--text-muted)]">{o.items?.length||0}</td>
                  <td className="py-3 px-3 font-semibold text-[var(--text)]">{formatPrice(o.pricing?.total)}</td>
                  <td className="py-3 px-3"><span className={`badge text-[10px] capitalize ${o.overallStatus==="delivered"?"badge-success":o.overallStatus==="cancelled"?"badge-danger":"badge-primary"}`}>{o.overallStatus?.replace(/_/g," ")}</span></td>
                  <td className="py-3 px-3 text-xs text-[var(--text-muted)]">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
              {!(data?.recentOrders?.length) && <tr><td colSpan={6} className="py-8 text-center text-[var(--text-muted)] text-sm">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
