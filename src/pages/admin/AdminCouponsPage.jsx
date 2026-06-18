import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { formatDate, formatPrice } from "../../utils/helpers";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code:"", discountType:"percentage", discountValue:"", maxDiscount:"", minOrderAmount:"", maxUsage:"", endDate:"" });

  const load = async () => {
    setLoading(true);
    try { const r = await api.get("/coupons"); setCoupons(r.data.data||[]); }
    catch { toast.error("Failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.discountValue || !form.endDate) { toast.error("Fill required fields"); return; }
    setSaving(true);
    try {
      await api.post("/coupons", form);
      toast.success("Coupon created!");
      setShowModal(false);
      setForm({ code:"", discountType:"percentage", discountValue:"", maxDiscount:"", minOrderAmount:"", maxUsage:"", endDate:"" });
      load();
    } catch (err) { toast.error(err.response?.data?.message||"Failed"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete coupon?")) return;
    try { await api.delete(`/coupons/${id}`); toast.success("Deleted."); load(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-[var(--text)]">Coupons 🎟️</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Create Coupon</button>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-xl">🎟️</div>
                  <div>
                    <p className="font-mono font-bold text-[var(--text)] text-sm">{c.code}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {c.discountType === "percentage" ? `${c.discountValue}% off` : formatPrice(c.discountValue)} · 
                      Min: {formatPrice(c.minOrderAmount||0)} · 
                      Used: {c.usedCount}/{c.maxUsage||"∞"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`badge text-xs ${new Date(c.endDate) > new Date() && c.isActive ? "badge-success":"badge-danger"}`}>
                      {new Date(c.endDate) > new Date() && c.isActive ? "Active" : "Expired"}
                    </span>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Expires: {formatDate(c.endDate)}</p>
                  </div>
                  <button onClick={() => handleDelete(c._id)} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium">Delete</button>
                </div>
              </div>
            </motion.div>
          ))}
          {!coupons.length && <div className="text-center py-16 text-[var(--text-muted)]"><span className="text-5xl block mb-2">🎟️</span>No coupons yet</div>}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setShowModal(false)} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}
              onClick={e => e.stopPropagation()} className="card w-full max-w-md p-6">
              <h2 className="font-display font-bold text-lg text-[var(--text)] mb-4">Create Coupon</h2>
              <div className="space-y-3">
                <div><label className="input-label">Coupon Code *</label><input className="input uppercase" placeholder="SAVE20" value={form.code} onChange={e => setForm({...form,code:e.target.value.toUpperCase()})} /></div>
                <div>
                  <label className="input-label">Discount Type</label>
                  <select className="input" value={form.discountType} onChange={e => setForm({...form,discountType:e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="input-label">Discount Value *</label><input type="number" className="input" placeholder={form.discountType==="percentage"?"20":"200"} value={form.discountValue} onChange={e => setForm({...form,discountValue:e.target.value})} /></div>
                  {form.discountType==="percentage" && <div><label className="input-label">Max Discount (₹)</label><input type="number" className="input" placeholder="500" value={form.maxDiscount} onChange={e => setForm({...form,maxDiscount:e.target.value})} /></div>}
                  <div><label className="input-label">Min Order (₹)</label><input type="number" className="input" placeholder="500" value={form.minOrderAmount} onChange={e => setForm({...form,minOrderAmount:e.target.value})} /></div>
                  <div><label className="input-label">Max Usage</label><input type="number" className="input" placeholder="100 (0=unlimited)" value={form.maxUsage} onChange={e => setForm({...form,maxUsage:e.target.value})} /></div>
                </div>
                <div><label className="input-label">Expiry Date *</label><input type="datetime-local" className="input" value={form.endDate} onChange={e => setForm({...form,endDate:e.target.value})} /></div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="btn-outline px-5 py-2.5">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5">{saving?"Saving...":"Create Coupon"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
