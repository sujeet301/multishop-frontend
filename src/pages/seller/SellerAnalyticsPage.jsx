import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { formatPrice } from "../../utils/helpers";

export default function SellerAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/seller").then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="font-display font-bold text-2xl text-[var(--text)]">Analytics 📈</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-display font-bold text-base text-[var(--text)] mb-4">Best Selling Products</h2>
          <div className="space-y-3">
            {(data?.bestSelling || []).map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--text-muted)] w-5">{i+1}</span>
                <img src={p.images?.[0]?.url} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text)] truncate">{p.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{p.sold} sold · {p.views} views</p>
                </div>
                <span className="text-xs font-bold text-primary-600">{formatPrice(p.price)}</span>
              </div>
            ))}
            {!data?.bestSelling?.length && <p className="text-sm text-[var(--text-muted)] text-center py-4">No data yet</p>}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-display font-bold text-base text-[var(--text)] mb-4">Revenue by Product</h2>
          <div className="space-y-3">
            {(data?.revenueByProduct || []).map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--text-muted)] w-5">{i+1}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[var(--text)] truncate">{p.name}</p>
                  <div className="mt-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100,(p.revenue/((data?.revenueByProduct?.[0]?.revenue)||1))*100)}%` }}
                      transition={{ delay: i*0.1, duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
                  </div>
                </div>
                <span className="text-xs font-bold text-green-600">{formatPrice(p.revenue)}</span>
              </div>
            ))}
            {!data?.revenueByProduct?.length && <p className="text-sm text-[var(--text-muted)] text-center py-4">No data yet</p>}
          </div>
        </div>
      </div>
      <div className="card p-5">
        <h2 className="font-display font-bold text-base text-[var(--text)] mb-4">Conversion Rates</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(data?.conversionData || []).slice(0,8).map(p => (
            <div key={p._id} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-lg font-bold text-[var(--text)]">{p.conversionRate?.toFixed(1)}%</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{p.name}</p>
            </div>
          ))}
          {!data?.conversionData?.length && <p className="text-sm text-[var(--text-muted)] col-span-4 text-center py-4">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
