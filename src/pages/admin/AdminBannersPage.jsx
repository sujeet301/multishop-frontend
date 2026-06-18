import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:"", subtitle:"", link:"", position:"hero", order:0 });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get("/banners"); setBanners(r.data.data||[]); }
    catch { toast.error("Failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title || !image) { toast.error("Title and image are required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      fd.append("image", image);
      await api.post("/banners", fd, { headers: { "Content-Type":"multipart/form-data" } });
      toast.success("Banner created!");
      setShowModal(false);
      setForm({ title:"", subtitle:"", link:"", position:"hero", order:0 });
      setImage(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message||"Failed"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete banner?")) return;
    try { await api.delete(`/banners/${id}`); toast.success("Deleted."); load(); }
    catch { toast.error("Failed"); }
  };

  const toggleActive = async (id, active) => {
    try { await api.put(`/banners/${id}`, { isActive: !active }); load(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-[var(--text)]">Banners 🖼️</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Banner</button>
      </div>
      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-4">
          {banners.map((b, i) => (
            <motion.div key={b._id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
              className={`card overflow-hidden flex gap-4 p-0 ${!b.isActive?"opacity-50":""}`}>
              <img src={b.image?.url} alt={b.title} className="w-48 h-28 object-cover flex-shrink-0" />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[var(--text)]">{b.title}</p>
                    {b.subtitle && <p className="text-sm text-[var(--text-muted)]">{b.subtitle}</p>}
                    <div className="flex gap-2 mt-1">
                      <span className="badge badge-primary text-xs capitalize">{b.position}</span>
                      <span className={`badge text-xs ${b.isActive?"badge-success":"badge-danger"}`}>{b.isActive?"Active":"Hidden"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(b._id, b.isActive)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium ${b.isActive?"bg-amber-100 text-amber-700":"bg-green-100 text-green-700"}`}>
                      {b.isActive?"Hide":"Show"}
                    </button>
                    <button onClick={() => handleDelete(b._id)} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg font-medium">Delete</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {!banners.length && <div className="text-center py-16 text-[var(--text-muted)]"><span className="text-5xl block mb-2">🖼️</span>No banners yet</div>}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setShowModal(false)} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}
              onClick={e => e.stopPropagation()} className="card w-full max-w-md p-6">
              <h2 className="font-display font-bold text-lg text-[var(--text)] mb-4">New Banner</h2>
              <div className="space-y-3">
                <div><label className="input-label">Title *</label><input className="input" placeholder="Summer Sale" value={form.title} onChange={e => setForm({...form,title:e.target.value})} /></div>
                <div><label className="input-label">Subtitle</label><input className="input" placeholder="Up to 50% off" value={form.subtitle} onChange={e => setForm({...form,subtitle:e.target.value})} /></div>
                <div><label className="input-label">Link URL</label><input className="input" placeholder="/products?isFlashSale=true" value={form.link} onChange={e => setForm({...form,link:e.target.value})} /></div>
                <div>
                  <label className="input-label">Position</label>
                  <select className="input" value={form.position} onChange={e => setForm({...form,position:e.target.value})}>
                    {["hero","middle","bottom","popup"].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Banner Image *</label>
                  <label className="flex items-center justify-center h-20 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
                    <span className="text-sm text-[var(--text-muted)]">{image ? image.name : "Click to upload image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="btn-outline px-5 py-2.5">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5">{saving?"Saving...":"Create Banner"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
