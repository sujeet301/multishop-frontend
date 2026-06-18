import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toggleSearch } from "../../store/slices/uiSlice";

const suggestions = ["iPhone 15", "Nike Shoes", "Wireless Earbuds", "Sofa Set", "Men's Jacket", "Skincare Kit"];

export default function SearchOverlay() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => { if (e.key === "Escape") dispatch(toggleSearch()); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(query.trim())}`);
      dispatch(toggleSearch());
    }
  };

  const handleSuggestion = (s) => {
    navigate(`/products?keyword=${encodeURIComponent(s)}`);
    dispatch(toggleSearch());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => dispatch(toggleSearch())}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
    >
      <motion.div
        initial={{ y: -20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -20, scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-2xl overflow-hidden"
      >
        <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands, categories..."
            className="flex-1 bg-transparent text-base outline-none text-[var(--text)] placeholder:text-gray-400"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 text-sm">
              Clear
            </button>
          )}
          <button type="submit" className="btn-primary text-sm px-4 py-2">Search</button>
        </form>

        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="text-sm px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-4">Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd> to close</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
