import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { updateUser } from "../store/slices/authSlice";
import api from "../utils/api";
import toast from "react-hot-toast";

const tabs = ["Profile", "Addresses", "Security"];

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [tab, setTab] = useState("Profile");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [addrForm, setAddrForm] = useState({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
  const [showAddrForm, setShowAddrForm] = useState(false);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/profile", form);
      dispatch(updateUser(res.data.data));
      toast.success("Profile updated!");
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    try {
      await api.put("/users/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    setSaving(false);
  };

  const handleAddAddress = async () => {
    setSaving(true);
    try {
      await api.post("/users/addresses", addrForm);
      toast.success("Address added!");
      setShowAddrForm(false);
      setAddrForm({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    setSaving(false);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.success("Address deleted.");
    } catch (e) { toast.error("Failed"); }
  };

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <img src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=6366f1&color=fff&size=128`}
            alt={user?.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-100 dark:ring-primary-900" />
          <span className="absolute bottom-0 right-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs text-white shadow">✏️</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text)]">{user?.name}</h1>
          <p className="text-[var(--text-muted)] text-sm">{user?.email}</p>
          <span className="badge-primary text-xs mt-1 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${tab === t ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
            {t}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {/* Profile Tab */}
        {tab === "Profile" && (
          <div className="card p-6 max-w-lg">
            <h2 className="font-display font-bold text-lg text-[var(--text)] mb-5">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input className="input bg-gray-50 dark:bg-gray-800" value={user?.email} disabled />
                <p className="text-xs text-[var(--text-muted)] mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="input-label">Phone Number</label>
                <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="input-label">Account Type</label>
                <input className="input bg-gray-50 dark:bg-gray-800 capitalize" value={user?.role} disabled />
              </div>
            </div>
            <button onClick={handleProfileSave} disabled={saving} className="btn-primary mt-6 px-8 py-2.5 disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Addresses Tab */}
        {tab === "Addresses" && (
          <div className="max-w-2xl space-y-4">
            {user?.addresses?.length > 0 ? user.addresses.map((addr) => (
              <div key={addr._id} className="card p-5 flex gap-4">
                <span className="text-2xl mt-0.5">{addr.isDefault ? "🏠" : "📍"}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-[var(--text)]">{addr.fullName}</p>
                    {addr.isDefault && <span className="badge-primary text-xs">Default</span>}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{addr.phone}</p>
                  <p className="text-sm text-[var(--text-muted)]">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                  <p className="text-sm text-[var(--text-muted)]">{addr.city}, {addr.state} – {addr.pincode}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-400 hover:text-red-600 text-sm self-start">🗑️</button>
              </div>
            )) : <p className="text-[var(--text-muted)] text-sm">No saved addresses yet.</p>}

            {showAddrForm ? (
              <div className="card p-5">
                <h3 className="font-semibold text-base text-[var(--text)] mb-4">New Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[["fullName","Full Name *",false],["phone","Phone *",false],["addressLine1","Address Line 1 *",true],["addressLine2","Address Line 2",true],["city","City *",false],["state","State *",false],["pincode","Pincode *",false],["country","Country",false]].map(([k,l,full]) => (
                    <div key={k} className={full ? "col-span-2" : ""}>
                      <label className="input-label">{l}</label>
                      <input className="input text-sm" placeholder={l.replace(" *","")} value={addrForm[k]} onChange={e => setAddrForm({...addrForm,[k]:e.target.value})} />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm({...addrForm,isDefault:e.target.checked})} className="accent-primary-500" />
                      <span className="text-sm text-[var(--text)]">Set as default address</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleAddAddress} disabled={saving} className="btn-primary text-sm px-6 py-2 disabled:opacity-50">{saving?"Saving...":"Save Address"}</button>
                  <button onClick={() => setShowAddrForm(false)} className="btn-ghost text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddrForm(true)} className="btn-outline text-sm px-5 py-2.5">+ Add New Address</button>
            )}
          </div>
        )}

        {/* Security Tab */}
        {tab === "Security" && (
          <div className="card p-6 max-w-lg">
            <h2 className="font-display font-bold text-lg text-[var(--text)] mb-5">Change Password</h2>
            {user?.authProvider === "google" ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-600 dark:text-blue-400">
                Your account uses Google Sign-In. Password change is not available.
              </div>
            ) : (
              <div className="space-y-4">
                {[["currentPassword","Current Password"],["newPassword","New Password"],["confirmPassword","Confirm New Password"]].map(([k,l]) => (
                  <div key={k}>
                    <label className="input-label">{l}</label>
                    <input type="password" className="input" placeholder="••••••••" value={pwForm[k]} onChange={e => setPwForm({...pwForm,[k]:e.target.value})} />
                  </div>
                ))}
                <button onClick={handlePasswordChange} disabled={saving} className="btn-primary px-8 py-2.5 disabled:opacity-50">
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
