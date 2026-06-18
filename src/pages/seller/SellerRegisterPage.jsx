import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function SellerRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    shopName: "", shopDescription: "", businessType: "individual",
    gstNumber: "", panNumber: "",
    address: { addressLine1: "", city: "", state: "", pincode: "", country: "India" },
    bankDetails: { accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "" },
  });

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const updateNested = (parent, field, val) => setForm(f => ({ ...f, [parent]: { ...f[parent], [field]: val } }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/sellers/register", form);
      toast.success("Application submitted! We'll review it within 24 hours.");
      navigate("/profile");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-6xl block mb-3">🏪</span>
          <h1 className="font-display font-bold text-3xl text-[var(--text)]">Become a Seller</h1>
          <p className="text-[var(--text-muted)] mt-2">Fill out the form below to apply for a seller account.</p>
        </motion.div>

        {/* Step indicators */}
        <div className="flex justify-center gap-4 mb-8">
          {[{n:1,l:"Shop Info"},{n:2,l:"Business"},{n:3,l:"Bank"}].map(({n,l}) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? "bg-primary-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>{n}</div>
              <span className={`text-sm hidden sm:block ${step >= n ? "text-primary-600 dark:text-primary-400 font-medium" : "text-[var(--text-muted)]"}`}>{l}</span>
            </div>
          ))}
        </div>

        <div className="card p-6">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-display font-bold text-lg text-[var(--text)]">Shop Information</h2>
              <div>
                <label className="input-label">Shop Name *</label>
                <input className="input" placeholder="My Awesome Store" value={form.shopName} onChange={e => update("shopName", e.target.value)} />
              </div>
              <div>
                <label className="input-label">Shop Description</label>
                <textarea className="input resize-none h-24" placeholder="Tell customers about your shop..." value={form.shopDescription} onChange={e => update("shopDescription", e.target.value)} />
              </div>
              <div>
                <label className="input-label">Business Type</label>
                <select className="input" value={form.businessType} onChange={e => update("businessType", e.target.value)}>
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Address Line 1 *</label>
                  <input className="input" placeholder="Street address" value={form.address.addressLine1} onChange={e => updateNested("address","addressLine1",e.target.value)} />
                </div>
                <div>
                  <label className="input-label">City *</label>
                  <input className="input" placeholder="City" value={form.address.city} onChange={e => updateNested("address","city",e.target.value)} />
                </div>
                <div>
                  <label className="input-label">State *</label>
                  <input className="input" placeholder="State" value={form.address.state} onChange={e => updateNested("address","state",e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Pincode *</label>
                  <input className="input" placeholder="400001" value={form.address.pincode} onChange={e => updateNested("address","pincode",e.target.value)} />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!form.shopName || !form.address.city}
                className="btn-primary w-full py-3 disabled:opacity-50">Next →</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-display font-bold text-lg text-[var(--text)]">Business Details</h2>
              <div>
                <label className="input-label">GST Number</label>
                <input className="input" placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={e => update("gstNumber", e.target.value)} />
              </div>
              <div>
                <label className="input-label">PAN Number</label>
                <input className="input" placeholder="AAAAA0000A" value={form.panNumber} onChange={e => update("panNumber", e.target.value)} />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
                💡 GST and PAN are required for businesses above ₹40 lakh turnover. You can update later.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline px-6 py-3">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Next →</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-display font-bold text-lg text-[var(--text)]">Bank Details</h2>
              {[["accountHolderName","Account Holder Name"],["accountNumber","Account Number"],["ifscCode","IFSC Code"],["bankName","Bank Name"]].map(([k,l]) => (
                <div key={k}>
                  <label className="input-label">{l}</label>
                  <input className="input" placeholder={l} value={form.bankDetails[k]} onChange={e => updateNested("bankDetails", k, e.target.value)} />
                </div>
              ))}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-600 dark:text-blue-400">
                🔒 Bank details are encrypted and used only for payouts. We never share this information.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline px-6 py-3">← Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-50">
                  {loading ? "Submitting..." : "Submit Application 🚀"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
