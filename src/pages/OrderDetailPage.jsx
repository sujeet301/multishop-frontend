import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrder } from "../store/slices/orderSlice";
import { formatPrice, formatDate, getStatusColor } from "../utils/helpers";

const steps = ["pending","processing","shipped","out_for_delivery","delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id]);

  if (!order) return <div className="container-custom py-8"><div className="skeleton h-96 rounded-2xl" /></div>;

  const currentStep = steps.indexOf(order.overallStatus);

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="text-[var(--text-muted)] hover:text-primary-600">← My Orders</Link>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="font-semibold text-[var(--text)]">{order.orderNumber}</span>
      </div>

      {/* Status tracker */}
      <div className="card p-6 mb-6">
        <h2 className="font-display font-bold text-lg text-[var(--text)] mb-6">Order Status</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
          <div className="absolute left-0 top-4 h-0.5 bg-primary-500 z-0 transition-all duration-700"
            style={{ width: currentStep >= 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : "0%" }} />
          {steps.map((s, i) => {
            const done = i <= currentStep;
            const labels = { pending:"Pending", processing:"Processing", shipped:"Shipped", out_for_delivery:"Out for Delivery", delivered:"Delivered" };
            return (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? "bg-primary-500 text-white shadow-md shadow-primary-200" : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] font-medium text-center max-w-16 ${done ? "text-primary-600 dark:text-primary-400" : "text-[var(--text-muted)]"}`}>{labels[s]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="card p-5">
          <h3 className="font-semibold text-base text-[var(--text)] mb-4">Items ({order.items?.length})</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item._id} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] line-clamp-2">{item.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
                  <span className={`${getStatusColor(item.status)} text-xs mt-1`}>{item.status}</span>
                </div>
                <p className="text-sm font-bold text-[var(--text)]">{formatPrice(item.discountPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Delivery Address</h3>
            <div className="text-sm text-[var(--text-muted)] space-y-1">
              <p className="font-medium text-[var(--text)]">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}</p>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Payment Summary</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[var(--text-muted)]"><span>Subtotal</span><span>{formatPrice(order.pricing?.subtotal)}</span></div>
              {order.pricing?.discount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-{formatPrice(order.pricing.discount)}</span></div>}
              <div className="flex justify-between text-[var(--text-muted)]"><span>Shipping</span><span>{order.pricing?.shipping === 0 ? "FREE" : formatPrice(order.pricing?.shipping)}</span></div>
              <div className="flex justify-between font-bold text-[var(--text)] border-t border-[var(--border)] pt-2"><span>Total</span><span>{formatPrice(order.pricing?.total)}</span></div>
              <div className="flex justify-between text-xs text-[var(--text-muted)]"><span>Payment</span><span className="uppercase font-medium">{order.paymentMethod}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[var(--text-muted)]">Status</span><span className={order.paymentStatus === "paid" ? "text-green-500 font-medium" : "text-amber-500 font-medium"}>{order.paymentStatus}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
