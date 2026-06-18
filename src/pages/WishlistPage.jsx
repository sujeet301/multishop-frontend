import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchWishlist, toggleWishlist } from "../store/slices/wishlistSlice";
import { addToCart } from "../store/slices/cartSlice";
import { formatPrice } from "../utils/helpers";
import StarRating from "../components/common/StarRating";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.wishlist);
  const { token } = useSelector((s) => s.auth);

  useEffect(() => { if (token) dispatch(fetchWishlist()); }, [token]);

  if (!token) return (
    <div className="container-custom py-20 text-center">
      <span className="text-6xl mb-4 block">❤️</span>
      <h2 className="font-display font-bold text-2xl mb-3">Login to see your wishlist</h2>
      <Link to="/login" className="btn-primary">Login</Link>
    </div>
  );

  return (
    <div className="container-custom py-8">
      <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-6">My Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-7xl mb-4 block animate-float">💝</span>
          <h3 className="font-bold text-xl text-[var(--text)]">Your wishlist is empty</h3>
          <p className="text-[var(--text-muted)] mt-2 mb-6">Save items you love for later!</p>
          <Link to="/products" className="btn-primary">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product, i) => (
            <motion.div key={product._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card overflow-hidden group">
              <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
                <Link to={`/products/${product._id}`}>
                  <img src={product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
                <button onClick={() => dispatch(toggleWishlist(product._id))} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md hover:scale-110 transition-transform">❤️</button>
              </div>
              <div className="p-3">
                <Link to={`/products/${product._id}`} className="text-sm font-semibold text-[var(--text)] hover:text-primary-600 line-clamp-2 block">{product.name}</Link>
                <div className="flex items-center gap-1 mt-1"><StarRating rating={product.ratings || 0} size="xs" /><span className="text-[10px] text-[var(--text-muted)]">({product.numReviews})</span></div>
                <p className="font-bold text-[var(--text)] mt-2">{formatPrice(product.discountPrice > 0 ? product.discountPrice : product.price)}</p>
                <button onClick={() => dispatch(addToCart({ productId: product._id, quantity: 1 }))} disabled={product.stock === 0}
                  className="btn-primary w-full text-sm py-2 mt-3 disabled:opacity-50">
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
