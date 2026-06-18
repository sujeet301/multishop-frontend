import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toggleCart } from "../../store/slices/uiSlice";
import { removeFromCart, updateCartItem } from "../../store/slices/cartSlice";
import { formatPrice } from "../../utils/helpers";

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { items, subtotal, shipping, couponApplied } = useSelector((s) => s.cart);
  const activeItems = items.filter((i) => !i.savedForLater);
  const discount = couponApplied?.discount || 0;
  const total = subtotal - discount + shipping;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => dispatch(toggleCart())}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-full max-w-md z-[70] flex flex-col shadow-2xl"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            🛒 Cart <span className="badge-primary ml-1">{activeItems.length}</span>
          </h2>
          <button onClick={() => dispatch(toggleCart())} className="btn-icon">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence>
            {activeItems.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-6xl mb-4 animate-float">🛒</span>
                <p className="font-semibold text-[var(--text)]">Your cart is empty</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">Add something to get started!</p>
                <Link to="/products" onClick={() => dispatch(toggleCart())} className="btn-primary mt-6 text-sm">Browse Products</Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {activeItems.map((item) => (
                  <motion.div
                    key={item._id} layout
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 pb-4 border-b border-[var(--border)] last:border-0"
                  >
                    <img
                      src={item.product?.images?.[0]?.url || "https://via.placeholder.com/80"}
                      alt={item.product?.name || "Product"}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] line-clamp-2 leading-snug">
                        {item.product?.name || "Product"}
                      </p>
                      <p className="text-primary-600 dark:text-primary-400 font-bold text-sm mt-1">
                        {formatPrice(item.effectivePrice || item.product?.discountPrice || item.product?.price || 0)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                          className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold"
                        >−</button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                          className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold"
                        >+</button>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="text-gray-400 hover:text-red-500 transition-colors self-start text-sm mt-1 flex-shrink-0"
                    >✕</button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {activeItems.length > 0 && (
          <div className="border-t border-[var(--border)] px-5 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-500 font-medium">
                  <span>Coupon discount</span><span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-500 font-medium">FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-[var(--text)] pt-2 border-t border-[var(--border)] mt-1">
                <span>Total</span><span className="text-gradient">{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              onClick={() => dispatch(toggleCart())}
              className="btn-primary w-full justify-center py-3"
            >
              Checkout →
            </Link>
            <Link
              to="/cart"
              onClick={() => dispatch(toggleCart())}
              className="btn-ghost w-full justify-center text-sm text-[var(--text-muted)]"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </motion.aside>
    </>
  );
}
