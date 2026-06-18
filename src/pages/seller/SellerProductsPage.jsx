import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { formatPrice } from "../../utils/helpers";

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", discountPrice: "", stock: "", brand: "", gstRate: 18 });
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");

  useEffect(() => {
    loadProducts();
    api.get("/categories").then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products?limit=50");
      setProducts(res.data.data || []);
    } catch { toast.error("Failed to load products"); }
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "", discountPrice: "", stock: "", brand: "", gstRate: 18 });
    setImages([]);
    setSelectedCat("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice || "", stock: p.stock, brand: p.brand || "", gstRate: p.gstRate || 18 });
    setSelectedCat(p.category?._id || "");
    setImages([]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock || !selectedCat) { toast.error("Fill required fields"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
      fd.append("category", selectedCat);
      images.forEach(img => fd.append("images", img));

      if (editing) {
        await api.put(`/products/${editing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product updated!");
      } else {
        if (images.length === 0) { toast.error("Add at least one image"); setSaving(false); return; }
        await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product created!");
      }
      setShowModal(false);
      loadProducts();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted.");
      setProducts(products.filter(p => p._id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const handleToggleFlashSale = async (p) => {
    try {
      await api.put(`/products/${p._id}/flash-sale`, { isFlashSale: !p.isFlashSale, flashSalePrice: p.discountPrice || p.price * 0.8, flashSaleEnd: new Date(Date.now() + 24*60*60*1000).toISOString() });
      toast.success(`Flash sale ${!p.isFlashSale ? "activated" : "deactivated"}!`);
      loadProducts();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text)]">My Products 📦</h1>
          <p className="text-[var(--text-muted)] text-sm">{products.length} products in your store</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Product</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_,i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">📦</span>
          <h3 className="font-bold text-xl text-[var(--text)]">No products yet</h3>
          <button onClick={openAdd} className="btn-primary mt-4">Add Your First Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.04 }} className="card overflow-hidden">
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-800">
                <img src={p.images?.[0]?.url || "https://via.placeholder.com/200"} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {p.isFlashSale && <span className="badge bg-red-500 text-white text-[10px] animate-pulse">⚡ Flash</span>}
                  {p.stock === 0 && <span className="badge bg-gray-600 text-white text-[10px]">Out of Stock</span>}
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-[var(--text)] line-clamp-2 leading-snug">{p.name}</p>
                <p className="font-bold text-primary-600 text-sm mt-1">{formatPrice(p.discountPrice > 0 ? p.discountPrice : p.price)}</p>
                <p className="text-xs text-[var(--text-muted)]">Stock: {p.stock} · Sold: {p.sold}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 btn-outline text-xs py-1.5">Edit</button>
                  <button onClick={() => handleToggleFlashSale(p)} className={`flex-1 text-xs py-1.5 rounded-xl font-semibold transition-colors ${p.isFlashSale ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-amber-100 text-amber-600 hover:bg-amber-200"}`}>
                    {p.isFlashSale ? "Stop Sale" : "⚡ Flash"}
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-600 px-2 text-sm">🗑️</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <h2 className="font-display font-bold text-lg text-[var(--text)]">{editing ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={() => setShowModal(false)} className="btn-icon text-gray-500">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="input-label">Product Name *</label>
                  <input className="input" placeholder="e.g. Premium Wireless Headphones" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Description *</label>
                  <textarea className="input resize-none h-24" placeholder="Detailed product description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Price (₹) *</label>
                    <input type="number" className="input" placeholder="999" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">Discount Price (₹)</label>
                    <input type="number" className="input" placeholder="799" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">Stock *</label>
                    <input type="number" className="input" placeholder="100" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">Brand</label>
                    <input className="input" placeholder="Samsung, Nike..." value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Category *</label>
                    <select className="input" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">GST Rate (%)</label>
                    <select className="input" value={form.gstRate} onChange={e => setForm({...form, gstRate: e.target.value})}>
                      {[0,5,12,18,28].map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Product Images {!editing && "*"}</label>
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                    <span className="text-3xl mb-1">📷</span>
                    <span className="text-sm text-[var(--text-muted)]">Click to upload images (max 6)</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => setImages(Array.from(e.target.files).slice(0,6))} />
                  </label>
                  {images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover rounded-lg" />
                          <button onClick={() => setImages(images.filter((_,j)=>j!==i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="btn-outline px-6 py-2.5">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5 disabled:opacity-50">
                    {saving ? "Saving..." : editing ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
