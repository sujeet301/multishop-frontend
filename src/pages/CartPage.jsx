import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCart, updateCartItem, removeFromCart, saveForLater, clearCart, setCoupon } from "../store/slices/cartSlice";
import { formatPrice } from "../utils/helpers";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, shipping, couponApplied, loading } = useSelector((s) => s.cart);
  const { token } = useSelector((s) => s.auth);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const activeItems = items.filter((i) => !i.savedForLater);
  const savedItems = items.filter((i) => i.savedForLater);
  const discount = couponApplied?.discount || 0;
  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await api.post("/coupons/validate", { code: couponCode, cartTotal: subtotal });
      dispatch(setCoupon(res.data.data.coupon));
      toast.success(`Coupon applied! You save ${formatPrice(res.data.data.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (!token) return (
    <div className="container-custom py-20 text-center">
      <span className="text-6xl mb-4 block animate-float">🛒</span>
      <h2 className="font-display font-bold text-2xl mb-3">Please login to view your cart</h2>
      <Link to="/login" className="btn-primary">Login</Link>
    </div>
  );

  if (loading) return (
    <div className="container-custom py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );

  if (activeItems.length === 0 && savedItems.length === 0) return (
    <div className="container-custom py-20 text-center">
      <span className="text-7xl mb-4 block animate-float">🛒</span>
      <h2 className="font-display font-bold text-2xl mb-2">Your cart is empty</h2>
      <p className="text-[var(--text-muted)] mb-6">Looks like you haven't added anything yet.</p>
      <Link to="/products" className="btn-primary btn-lg">Start Shopping →</Link>
    </div>
  );

  return (
    <div className="container-custom py-8">
      <h1 className="font-display font-bold text-2xl md:text-3xl text-[var(--text)] mb-6">
        Shopping Cart <span className="text-[var(--text-muted)] font-normal text-lg">({activeItems.length} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {activeItems.map((item) => (
              <motion.div key={item._id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                className="card p-4 flex gap-4">
                <img src={item.product?.images?.[0]?.url || "https://via.placeholder.com/100"}
                  alt={item.product?.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product?._id}`}
                    className="font-semibold text-sm text-[var(--text)] hover:text-primary-600 line-clamp-2 block">
                    {item.product?.name}
                  </Link>
                  {item.variant?.value && <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.variant.name}: {item.variant.value}</p>}
                  <p className="font-bold text-primary-600 mt-1">{formatPrice(item.effectivePrice || item.product?.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 border border-[var(--border)] rounded-xl px-2 py-1">
                      <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                        className="w-6 h-6 flex items-center justify-center font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">−</button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                        className="w-6 h-6 flex items-center justify-center font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">+</button>
                    </div>
                    <button onClick={() => dispatch(saveForLater(item._id))} className="text-xs text-primary-500 hover:underline">Save for later</button>
                    <button onClick={() => dispatch(removeFromCart(item._id))} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-[var(--text)]">{formatPrice((item.effectivePrice || item.product?.price) * item.quantity)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Saved for later */}
          {savedItems.length > 0 && (
            <div>
              <h3 className="font-semibold text-base text-[var(--text)] mb-3">Saved for Later ({savedItems.length})</h3>
              {savedItems.map((item) => (
                <motion.div key={item._id} layout className="card p-4 flex gap-4 opacity-70">
                  <img src={item.product?.images?.[0]?.url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.product?.name}</p>
                    <p className="font-bold text-primary-600 text-sm mt-1">{formatPrice(item.product?.price)}</p>
                    <button onClick={() => dispatch(saveForLater(item._id))} className="text-xs text-primary-500 hover:underline mt-1">Move to Cart</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={() => dispatch(clearCart())} className="text-sm text-red-500 hover:underline">Clear Cart</button>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">🎟️ Apply Coupon</h3>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
                <span className="text-sm text-green-600 font-medium">✓ {couponApplied.code}</span>
                <button onClick={() => dispatch(setCoupon(null))} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code" className="input text-sm py-2 flex-1" />
                <button onClick={handleApplyCoupon} disabled={applyingCoupon}
                  className="btn-primary text-sm px-4 py-2 disabled:opacity-50">Apply</button>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-base text-[var(--text)] mb-4">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-[var(--text-muted)]"><span>Subtotal ({activeItems.length} items)</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-500 font-medium"><span>Coupon Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-[var(--text-muted)]"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-500 font-medium">FREE</span> : formatPrice(shipping)}</span></div>
              {subtotal < 500 && shipping > 0 && <p className="text-xs text-amber-500">Add {formatPrice(500 - subtotal)} more for free shipping!</p>}
              <div className="border-t border-[var(--border)] pt-2.5 mt-2.5 flex justify-between font-bold text-base text-[var(--text)]">
                <span>Total</span><span className="text-gradient">{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={() => navigate("/checkout")} className="btn-primary w-full justify-center py-3 mt-5">
              Proceed to Checkout →
            </button>
            <Link to="/products" className="block text-center text-sm text-[var(--text-muted)] hover:text-primary-600 mt-3">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
