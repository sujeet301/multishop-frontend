import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { toggleWishlist } from "../../store/slices/wishlistSlice";
import { setQuickView } from "../../store/slices/uiSlice";
import { formatPrice, getDiscountPercent } from "../../utils/helpers";
import StarRating from "../common/StarRating";

export default function ProductCard({ product, variant = "default" }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const { user } = useSelector((s) => s.auth);
  const [hovered, setHovered] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const isWishlisted = wishlistItems.some((i) => (i._id || i) === product._id);
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = getDiscountPercent(product.price, product.discountPrice);
  const isOutOfStock = product.stock === 0;
  const isFlashSale = product.isFlashSale && new Date(product.flashSaleEnd) > new Date();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setAddingCart(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    setAddingCart(false);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    dispatch(toggleWishlist(product._id));
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(setQuickView(product));
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="card relative group overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-gray-50 dark:bg-gray-800">
        <Link to={`/products/${product._id}`}>
          <motion.img
            src={product.images?.[0]?.url || "https://via.placeholder.com/400x400?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500"
            animate={{ scale: hovered ? 1.08 : 1 }}
          />

          {/* Overlay on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20"
              />
            )}
          </AnimatePresence>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isFlashSale && (
            <span className="badge bg-red-500 text-white animate-pulse text-[10px]">⚡ Flash Sale</span>
          )}
          {!isFlashSale && discount > 0 && (
            <span className="badge bg-green-500 text-white text-[10px]">-{discount}%</span>
          )}
          {isOutOfStock && (
            <span className="badge bg-gray-600 text-white text-[10px]">Out of Stock</span>
          )}
          {product.isFeatured && !isOutOfStock && !isFlashSale && discount === 0 && (
            <span className="badge-primary text-[10px]">Featured</span>
          )}
        </div>

        {/* Actions on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute top-2 right-2 flex flex-col gap-2"
            >
              {/* Wishlist */}
              <motion.button
                animate={heartAnim ? { scale: [1, 1.5, 1] } : {}}
                onClick={handleWishlist}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isWishlisted
                    ? "bg-red-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 hover:bg-red-50 hover:text-red-500"
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.button>

              {/* Quick View */}
              <button
                onClick={handleQuickView}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-gray-600 hover:bg-primary-50 hover:text-primary-500 flex items-center justify-center shadow-lg transition-colors"
                title="Quick view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add to cart button — slides up on hover */}
        <AnimatePresence>
          {hovered && !isOutOfStock && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 p-2"
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={addingCart}
                className="w-full btn-primary text-sm py-2 rounded-xl"
              >
                {addingCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    />
                    Adding...
                  </span>
                ) : (
                  "Add to Cart 🛒"
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Seller */}
        {product.seller?.shopName && (
          <p className="text-[11px] text-[var(--text-muted)] mb-1 truncate">{product.seller.shopName}</p>
        )}

        {/* Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-semibold text-[var(--text)] line-clamp-2 hover:text-primary-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <StarRating rating={product.ratings || 0} size="xs" />
          <span className="text-[11px] text-[var(--text-muted)]">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="price-main text-base">
            {formatPrice(effectivePrice)}
          </span>
          {discount > 0 && (
            <span className="price-original text-xs">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
