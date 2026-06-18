import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchProduct } from "../store/slices/productSlice";
import { addToCart } from "../store/slices/cartSlice";
import { toggleWishlist } from "../store/slices/wishlistSlice";
import { formatPrice, getDiscountPercent, formatDate } from "../utils/helpers";
import StarRating from "../components/common/StarRating";
import ProductCard from "../components/product/ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, related, productLoading } = useSelector((s) => s.products);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState("description");

  useEffect(() => { dispatch(fetchProduct(id)); window.scrollTo(0, 0); }, [id]);

  if (productLoading) return (
    <div className="container-custom py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-6 rounded" style={{ width: `${80 - i * 10}%` }} />)}
        </div>
      </div>
    </div>
  );

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
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <span className="text-[var(--text)] truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <motion.div layoutId={`product-img-${product._id}`}
            className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 mb-3">
            <motion.img src={product.images?.[imgIdx]?.url || "https://via.placeholder.com/600"} alt={product.name}
              key={imgIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="w-full h-full object-cover" />
          </motion.div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === imgIdx ? "border-primary-500 scale-95" : "border-transparent hover:border-gray-300"}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {product.seller?.shopName && (
            <Link to={`/sellers/${product.seller._id}`} className="text-sm text-primary-600 hover:underline font-medium">
              🏪 {product.seller.shopName}
            </Link>
          )}
          <h1 className="font-display font-bold text-2xl md:text-3xl text-[var(--text)] leading-snug">{product.name}</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating rating={product.ratings || 0} size="md" />
              <span className="text-sm text-[var(--text-muted)]">({product.numReviews || 0} reviews)</span>
            </div>
            <span className="text-sm text-[var(--text-muted)]">|</span>
            <span className="text-sm text-[var(--text-muted)]">{product.sold || 0} sold</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 py-2">
            <span className="text-3xl font-bold text-[var(--text)]">{formatPrice(effectivePrice)}</span>
            {discount > 0 && <>
              <span className="text-gray-400 line-through text-lg">{formatPrice(product.price)}</span>
              <span className="badge bg-green-100 text-green-700 text-sm">{discount}% OFF</span>
            </>}
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            <span>{product.stock > 0 ? "✓" : "✗"}</span>
            <span>{product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}</span>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(t => <span key={t} className="badge-primary text-xs">{t}</span>)}
            </div>
          )}

          {/* Variants */}
          {product.variants?.map(v => (
            <div key={v.name}>
              <p className="text-sm font-semibold text-[var(--text)] mb-2">{v.name}:</p>
              <div className="flex flex-wrap gap-2">
                {v.options.map(opt => (
                  <button key={opt.value}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm hover:border-primary-500 hover:text-primary-600 transition-colors">
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Qty + Actions */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl px-3 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">−</button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">+</button>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Max {product.stock}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={adding || product.stock === 0}
              className="btn-primary flex-1 py-3 disabled:opacity-50">
              {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart 🛒"}
            </button>
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={() => dispatch(toggleWishlist(product._id))}
              className={`btn-icon w-12 h-12 border-2 rounded-xl text-xl ${isWishlisted ? "border-red-400 bg-red-50 dark:bg-red-900/20" : "border-[var(--border)]"}`}>
              {isWishlisted ? "❤️" : "🤍"}
            </motion.button>
          </div>

          {/* Return & GST info */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)]">
            {[
              { icon: "↩️", label: `${product.returnDays || 7}-day returns` },
              { icon: "🔒", label: "Secure payment" },
              { icon: "🚚", label: "Free delivery ₹500+" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1">
                <span className="text-xl">{icon}</span>
                <span className="text-xs text-[var(--text-muted)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden mb-12">
        <div className="flex border-b border-[var(--border)]">
          {["description", "specifications", "reviews"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-4 text-sm font-semibold capitalize transition-colors ${tab === t ? "border-b-2 border-primary-500 text-primary-600" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === "description" && (
            <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{product.description}</p>
          )}
          {tab === "specifications" && (
            <div className="grid sm:grid-cols-2 gap-2">
              {product.specifications?.length > 0 ? product.specifications.map(({ key, value }) => (
                <div key={key} className="flex gap-3 py-2 border-b border-[var(--border)]">
                  <span className="text-sm font-medium text-[var(--text)] min-w-24">{key}</span>
                  <span className="text-sm text-[var(--text-muted)]">{value}</span>
                </div>
              )) : <p className="text-sm text-[var(--text-muted)]">No specifications listed.</p>}
            </div>
          )}
          {tab === "reviews" && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-[var(--text)]">{product.ratings?.toFixed(1) || "0.0"}</p>
                  <StarRating rating={product.ratings || 0} size="lg" />
                  <p className="text-sm text-[var(--text-muted)] mt-1">{product.numReviews || 0} reviews</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)]">Purchase the product to leave a review.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--text)] mb-5">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
