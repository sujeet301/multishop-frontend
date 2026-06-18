import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { formatPrice } from "../../utils/helpers";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(search && { keyword: search }), limit: 50 });
      const res = await api.get(`/products?${q}`);
      setProducts(res.data.data || []);
    } catch { toast.error("Failed"); }
    setLoading(false);
  };

  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await api.delete(`/products/${id}`); toast.success("Deleted."); load(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-6">Product Management 📦</h1>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input max-w-sm text-sm py-2 mb-5" />
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_,i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.03 }} className="card overflow-hidden">
              <div className="aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
                <img src={p.images?.[0]?.url||"https://via.placeholder.com/200"} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-[var(--text)] line-clamp-2">{p.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{p.seller?.shopName||"Unknown seller"}</p>
                <p className="font-bold text-primary-600 text-sm mt-1">{formatPrice(p.discountPrice>0?p.discountPrice:p.price)}</p>
                <p className="text-xs text-[var(--text-muted)]">Stock: {p.stock} · Sold: {p.sold}</p>
                <button onClick={() => handleDelete(p._id)} className="mt-2 w-full bg-red-100 text-red-600 hover:bg-red-200 text-xs py-1.5 rounded-lg font-medium transition-colors">Delete</button>
              </div>
            </motion.div>
          ))}
          {!products.length && <div className="col-span-4 text-center py-16 text-[var(--text-muted)]"><span className="text-5xl block mb-2">📦</span>No products found</div>}
        </div>
      )}
    </div>
  );
}
