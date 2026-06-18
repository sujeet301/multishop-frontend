import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts } from "../store/slices/productSlice";
import ProductCard from "../components/product/ProductCard";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Selling", value: "best_selling" },
  { label: "Top Rated", value: "top_rated" },
];

const ratings = [4, 3, 2, 1];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, loading, total, totalPages, currentPage, filters } = useSelector((s) => s.products);
  const [showFilters, setShowFilters] = useState(false);

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minRating = searchParams.get("minRating") || "";
  const inStock = searchParams.get("inStock") || "";
  const isFlashSale = searchParams.get("isFlashSale") || "";
  const isFeatured = searchParams.get("isFeatured") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    setSearchParams(p);
  };

  const clearFilters = () => {
    const p = new URLSearchParams();
    if (keyword) p.set("keyword", keyword);
    setSearchParams(p);
  };

  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.minRating = minRating;
    if (inStock) params.inStock = inStock;
    if (isFlashSale) params.isFlashSale = isFlashSale;
    if (isFeatured) params.isFeatured = isFeatured;
    params.page = page;
    params.limit = 16;
    dispatch(fetchProducts(params));
  }, [searchParams]);

  const Skeleton = () => (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="skeleton h-5 rounded w-1/3" />
      </div>
    </div>
  );

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-base">Filters</h3>
        <button onClick={clearFilters} className="text-xs text-primary-500 hover:underline">Clear all</button>
      </div>

      {/* Price */}
      <div>
        <p className="font-semibold text-sm text-[var(--text)] mb-3">Price Range</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Min ₹" value={minPrice}
            onChange={e => updateParam("minPrice", e.target.value)}
            className="input text-sm py-2 px-3" />
          <input type="number" placeholder="Max ₹" value={maxPrice}
            onChange={e => updateParam("maxPrice", e.target.value)}
            className="input text-sm py-2 px-3" />
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="font-semibold text-sm text-[var(--text)] mb-3">Min Rating</p>
        <div className="space-y-2">
          {ratings.map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="rating" checked={minRating === String(r)} onChange={() => updateParam("minRating", r)}
                className="accent-primary-500" />
              <span className="text-amber-400 text-sm">{"★".repeat(r)}{"☆".repeat(5 - r)}</span>
              <span className="text-xs text-[var(--text-muted)]">& up</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="font-semibold text-sm text-[var(--text)] mb-3">Availability</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={inStock === "true"} onChange={e => updateParam("inStock", e.target.checked ? "true" : "")}
            className="accent-primary-500 rounded" />
          <span className="text-sm text-[var(--text)]">In Stock Only</span>
        </label>
      </div>

      {/* Special */}
      <div>
        <p className="font-semibold text-sm text-[var(--text)] mb-3">Special</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isFlashSale === "true"} onChange={e => updateParam("isFlashSale", e.target.checked ? "true" : "")} className="accent-primary-500 rounded" />
            <span className="text-sm text-[var(--text)]">⚡ Flash Sale</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isFeatured === "true"} onChange={e => updateParam("isFeatured", e.target.checked ? "true" : "")} className="accent-primary-500 rounded" />
            <span className="text-sm text-[var(--text)]">⭐ Featured</span>
          </label>
        </div>
      </div>

      {/* Brands */}
      {filters.brands?.length > 0 && (
        <div>
          <p className="font-semibold text-sm text-[var(--text)] mb-3">Brand</p>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
            {filters.brands.map(b => (
              <label key={b} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-primary-500 rounded" />
                <span className="text-sm text-[var(--text)]">{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text)]">
            {keyword ? `Results for "${keyword}"` : category ? `${category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}` : isFlashSale ? "⚡ Flash Sale" : isFeatured ? "⭐ Featured Products" : "All Products"}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-outline text-sm px-4 py-2">
            {showFilters ? "Hide" : "Filters"} ⚙️
          </button>
          <select value={sort} onChange={e => updateParam("sort", e.target.value)}
            className="input text-sm py-2 pl-3 pr-8 w-auto cursor-pointer">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 md:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute inset-0 bg-black/40" />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                onClick={e => e.stopPropagation()}
                className="absolute left-0 top-0 h-full w-72 p-5 overflow-y-auto"
                style={{ background: "var(--bg-card)" }}>
                <FilterSidebar />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(16)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4">🔍</span>
              <h3 className="font-display font-bold text-xl text-[var(--text)]">No products found</h3>
              <p className="text-[var(--text-muted)] text-sm mt-2">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="btn-primary mt-6 text-sm">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => updateParam("page", page - 1)} disabled={page === 1}
                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => updateParam("page", p)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === page ? "bg-primary-500 text-white shadow-md" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text)]"}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => updateParam("page", page + 1)} disabled={page === totalPages}
                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
