import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  const load = async () => {
    setLoading(true);
    try { const r = await api.get(`/admin/sellers?status=${tab}&limit=50`); setSellers(r.data.data||[]); }
    catch { toast.error("Failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const updateStatus = async (id, status, reason = "") => {
    try {
      await api.put(`/admin/sellers/${id}/status`, { status, reason });
      toast.success(`Seller ${status}!`);
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-6">Seller Management 🏪</h1>
      <div className="flex gap-2 mb-5">
        {["pending","approved","rejected","suspended"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab===t?"bg-primary-500 text-white shadow":"hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-muted)]"}`}>
            {t}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]"><span className="text-5xl block mb-3">🏪</span>No {tab} sellers</div>
      ) : (
        <div className="space-y-4">
          {sellers.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 flex items-center justify-center text-xl">🏪</div>
                  <div>
                    <p className="font-bold text-[var(--text)]">{s.shopName}</p>
                    <p className="text-sm text-[var(--text-muted)]">{s.user?.name} · {s.user?.email}</p>
                    <p className="text-xs text-[var(--text-muted)] capitalize">{s.businessType} · {s.address?.city}, {s.address?.state}</p>
                  </div>
                </div>
                {tab === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(s._id,"approved")} className="bg-green-100 text-green-700 hover:bg-green-200 text-sm px-4 py-2 rounded-xl font-semibold transition-colors">✓ Approve</button>
                    <button onClick={() => { const r = prompt("Rejection reason:"); if(r!==null) updateStatus(s._id,"rejected",r); }}
                      className="bg-red-100 text-red-600 hover:bg-red-200 text-sm px-4 py-2 rounded-xl font-semibold transition-colors">✕ Reject</button>
                  </div>
                )}
                {tab === "approved" && (
                  <button onClick={() => updateStatus(s._id,"suspended")} className="bg-amber-100 text-amber-700 hover:bg-amber-200 text-sm px-4 py-2 rounded-xl font-semibold">Suspend</button>
                )}
                {tab === "suspended" && (
                  <button onClick={() => updateStatus(s._id,"approved")} className="bg-green-100 text-green-700 hover:bg-green-200 text-sm px-4 py-2 rounded-xl font-semibold">Re-approve</button>
                )}
              </div>
              {s.shopDescription && <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2">{s.shopDescription}</p>}
              {s.rejectionReason && <p className="text-xs text-red-500 mt-2">Reason: {s.rejectionReason}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
