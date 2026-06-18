import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:"", description:"", icon:"", order:0 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get("/categories"); setCats(r.data.data||[]); }
    catch { toast.error("Failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      await api.post("/categories", form);
      toast.success("Category created!");
      setShowModal(false);
      setForm({ name:"", description:"", icon:"", order:0 });
      load();
    } catch (err) { toast.error(err.response?.data?.message||"Failed"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try { await api.delete(`/categories/${id}`); toast.success("Deleted."); load(); }
    catch { toast.error("Failed"); }
  };

  const handleToggle = async (id, isActive) => {
    try { await api.put(`/categories/${id}`, { isActive: !isActive }); load(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-[var(--text)]">Categories 🏷️</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Category</button>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cats.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
              className={`card p-4 ${!c.isActive?"opacity-50":""}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{c.icon||"📁"}</span>
                <p className="font-semibold text-[var(--text)]">{c.name}</p>
              </div>
              {c.description && <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">{c.description}</p>}
              <p className="text-xs text-[var(--text-muted)]">{c.productCount||0} products</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleToggle(c._id, c.isActive)}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium ${c.isActive?"bg-amber-100 text-amber-700 hover:bg-amber-200":"bg-green-100 text-green-700 hover:bg-green-200"}`}>
                  {c.isActive?"Hide":"Show"}
                </button>
                <button onClick={() => handleDelete(c._id)} className="text-xs px-2 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg">🗑️</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}
              onClick={e => e.stopPropagation()} className="card w-full max-w-md p-6">
              <h2 className="font-display font-bold text-lg text-[var(--text)] mb-4">New Category</h2>
              <div className="space-y-3">
                <div><label className="input-label">Name *</label><input className="input" placeholder="Electronics" value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
                <div><label className="input-label">Icon (emoji)</label><input className="input" placeholder="💻" value={form.icon} onChange={e => setForm({...form,icon:e.target.value})} /></div>
                <div><label className="input-label">Description</label><input className="input" placeholder="Category description" value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></div>
                <div><label className="input-label">Display Order</label><input type="number" className="input" value={form.order} onChange={e => setForm({...form,order:+e.target.value})} /></div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="btn-outline px-5 py-2.5">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5">{saving?"Saving...":"Create Category"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
