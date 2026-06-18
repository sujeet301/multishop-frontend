import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setQuickView } from "../../store/slices/uiSlice";
import { addToCart } from "../../store/slices/cartSlice";
import { toggleWishlist } from "../../store/slices/wishlistSlice";
import { formatPrice, getDiscountPercent } from "../../utils/helpers";
import StarRating from "../common/StarRating";

export default function QuickViewModal() {
  const dispatch = useDispatch();
  const product = useSelector((s) => s.ui.quickViewProduct);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const isWishlisted = wishlistItems.some((i) => (i._id || i) === product._id);
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = getDiscountPercent(product.price, product.discountPrice);

  const handleAdd = async () => {
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity: qty }));
    setAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => dispatch(setQuickView(null))}
      className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-display font-bold text-lg">Quick View</h2>
          <button onClick={() => dispatch(setQuickView(null))} className="btn-icon text-gray-500 hover:text-gray-900 dark:hover:text-white">✕</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 mb-3">
              <img src={product.images?.[imgIdx]?.url || "https://via.placeholder.com/400"} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${i === imgIdx ? "border-primary-500" : "border-transparent"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            {product.seller?.shopName && <p className="text-xs text-[var(--text-muted)]">by {product.seller.shopName}</p>}
            <h3 className="font-display font-bold text-xl text-[var(--text)] leading-snug">{product.name}</h3>

            <div className="flex items-center gap-3">
              <StarRating rating={product.ratings || 0} size="sm" />
              <span className="text-sm text-[var(--text-muted)]">({product.numReviews || 0} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[var(--text)]">{formatPrice(effectivePrice)}</span>
              {discount > 0 && <>
                <span className="text-gray-400 line-through text-sm">{formatPrice(product.price)}</span>
                <span className="badge bg-green-100 text-green-700">-{discount}%</span>
              </>}
            </div>

            {product.shortDescription && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{product.shortDescription}</p>}

            <div className="flex items-center gap-2 text-sm">
              <span className={product.stock > 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : "✗ Out of Stock"}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--text)]">Qty:</span>
                <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl px-3 py-1.5">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold">−</button>
                  <span className="w-6 text-center font-semibold text-sm">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold">+</button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={handleAdd} disabled={adding || product.stock === 0} className="btn-primary flex-1 py-3 disabled:opacity-50">
                {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart 🛒"}
              </button>
              <button onClick={() => dispatch(toggleWishlist(product._id))}
                className={`btn-icon w-12 h-12 border-2 rounded-xl ${isWishlisted ? "border-red-400 text-red-500 bg-red-50 dark:bg-red-900/20" : "border-[var(--border)]"}`}>
                {isWishlisted ? "❤️" : "🤍"}
              </button>
            </div>

            <Link to={`/products/${product._id}`} onClick={() => dispatch(setQuickView(null))}
              className="block text-center text-sm text-primary-600 hover:underline mt-2">
              View Full Details →
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
