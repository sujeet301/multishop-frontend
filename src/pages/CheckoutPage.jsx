import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { placeOrder } from "../store/slices/orderSlice";
import { formatPrice } from "../utils/helpers";
import api from "../utils/api";
import toast from "react-hot-toast";

const paymentMethods = [
  { id: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay when your order arrives" },
  { id: "razorpay", label: "Razorpay", icon: "💳", desc: "UPI, Cards, Net Banking" },
  { id: "stripe", label: "Stripe", icon: "💰", desc: "International cards" },
];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, shipping, couponApplied } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const { placing } = useSelector((s) => s.orders);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState(
    user?.addresses?.find((a) => a.isDefault) || {
      fullName: user?.name || "",
      phone: user?.phone || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    }
  );

  const activeItems = items.filter((i) => !i.savedForLater);
  const discount = couponApplied?.discount || 0;
  const total = subtotal - discount + shipping;

  const handlePlaceOrder = async () => {
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.pincode) {
      toast.error("Please fill all required address fields.");
      setStep(1);
      return;
    }

    const orderData = {
      items: activeItems.map((i) => ({ product: i.product?._id, quantity: i.quantity, variant: i.variant })),
      shippingAddress: address,
      paymentMethod,
      couponCode: couponApplied?.code,
    };

    if (paymentMethod === "cod") {
      const result = await dispatch(placeOrder(orderData));
      if (result.payload?.data?._id) {
        navigate(`/order-success/${result.payload.data._id}`);
      }
    } else if (paymentMethod === "razorpay") {
      const result = await dispatch(placeOrder(orderData));
      if (!result.payload?.data?._id) return;
      const orderId = result.payload.data._id;

      try {
        const keyRes = await api.get("/payments/razorpay/key");
        const orderRes = await api.post("/payments/razorpay/create-order", { orderId });
        const { razorpayOrderId, amount, currency } = orderRes.data.data;

        const options = {
          key: keyRes.data.key,
          amount,
          currency,
          name: "MultiShop",
          description: "Order Payment",
          order_id: razorpayOrderId,
          handler: async (response) => {
            await api.post("/payments/razorpay/verify", { ...response, orderId });
            navigate(`/order-success/${orderId}`);
          },
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme: { color: "#6366f1" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch {
        toast.error("Payment initialization failed.");
      }
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[{ n: 1, label: "Address" }, { n: 2, label: "Payment" }, { n: 3, label: "Review" }].map(({ n, label }) => (
        <React.Fragment key={n}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= n ? "bg-primary-500 text-white shadow-md" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>{n}</div>
            <span className={`text-sm font-medium hidden sm:block ${step >= n ? "text-primary-600 dark:text-primary-400" : "text-[var(--text-muted)]"}`}>{label}</span>
          </div>
          {n < 3 && <div className={`w-12 h-0.5 ${step > n ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="container-custom py-8 max-w-5xl">
      <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-6">Checkout</h1>
      <StepIndicator />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="font-display font-bold text-lg text-[var(--text)] mb-5">📍 Delivery Address</h2>

              {/* Saved addresses */}
              {user?.addresses?.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-medium text-[var(--text-muted)] mb-3">Saved addresses</p>
                  <div className="space-y-2">
                    {user.addresses.map((addr) => (
                      <label key={addr._id} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] cursor-pointer hover:border-primary-400 transition-colors">
                        <input type="radio" name="savedAddr" className="accent-primary-500 mt-1"
                          checked={address._id === addr._id}
                          onChange={() => setAddress(addr)} />
                        <div className="text-sm">
                          <p className="font-medium text-[var(--text)]">{addr.fullName} · {addr.phone}</p>
                          <p className="text-[var(--text-muted)]">{addr.addressLine1}, {addr.city}, {addr.state} – {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] my-3">Or enter a new address:</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "fullName", label: "Full Name *", full: false },
                  { key: "phone", label: "Phone *", full: false },
                  { key: "addressLine1", label: "Address Line 1 *", full: true },
                  { key: "addressLine2", label: "Address Line 2", full: true },
                  { key: "city", label: "City *", full: false },
                  { key: "state", label: "State *", full: false },
                  { key: "pincode", label: "Pincode *", full: false },
                  { key: "country", label: "Country", full: false },
                ].map(({ key, label, full }) => (
                  <div key={key} className={full ? "col-span-2" : ""}>
                    <label className="input-label">{label}</label>
                    <input value={address[key] || ""} onChange={e => setAddress({ ...address, [key]: e.target.value })}
                      className="input" placeholder={label.replace(" *", "")} />
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(2)} className="btn-primary w-full mt-6 py-3">Continue to Payment →</button>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="font-display font-bold text-lg text-[var(--text)] mb-5">💳 Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <label key={pm.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === pm.id ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-[var(--border)] hover:border-primary-300"}`}>
                    <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)} className="accent-primary-500" />
                    <span className="text-2xl">{pm.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-[var(--text)]">{pm.label}</p>
                      <p className="text-xs text-[var(--text-muted)]">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-outline px-6 py-3">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Review Order →</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="font-display font-bold text-lg text-[var(--text)] mb-5">📋 Review Order</h2>
              <div className="space-y-3 mb-5">
                {activeItems.map((item) => (
                  <div key={item._id} className="flex gap-3 pb-3 border-b border-[var(--border)]">
                    <img src={item.product?.images?.[0]?.url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[var(--text)]">{formatPrice((item.effectivePrice || item.product?.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-5 text-sm">
                <p className="font-semibold text-[var(--text)] mb-1">Delivering to:</p>
                <p className="text-[var(--text-muted)]">{address.fullName} · {address.phone}</p>
                <p className="text-[var(--text-muted)]">{address.addressLine1}, {address.city} – {address.pincode}</p>
                <p className="text-[var(--text-muted)] mt-1">Payment: {paymentMethods.find(p => p.id === paymentMethod)?.label}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline px-6 py-3">← Back</button>
                <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary flex-1 py-3 disabled:opacity-50">
                  {placing ? "Placing Order..." : `Place Order · ${formatPrice(total)}`}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-base text-[var(--text)] mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            {activeItems.map((i) => (
              <div key={i._id} className="flex justify-between text-[var(--text-muted)]">
                <span className="truncate max-w-[150px]">{i.product?.name} ×{i.quantity}</span>
                <span>{formatPrice((i.effectivePrice || i.product?.price) * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-[var(--border)] pt-3">
            <div className="flex justify-between text-[var(--text-muted)]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between text-[var(--text-muted)]"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-500">FREE</span> : formatPrice(shipping)}</span></div>
            <div className="flex justify-between font-bold text-base text-[var(--text)] pt-2 border-t border-[var(--border)]">
              <span>Total</span><span className="text-gradient">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
