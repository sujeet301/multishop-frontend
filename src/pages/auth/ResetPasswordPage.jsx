import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: form.password });
      toast.success("Password reset! Please login.");
      navigate("/login");
    } catch (err) { toast.error(err.response?.data?.message || "Invalid or expired link"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">🔐</span>
          <h2 className="font-display font-bold text-2xl text-[var(--text)]">Reset Password</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Enter your new password below.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">New Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={e => setForm({...form,password:e.target.value})} className="input" placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="input-label">Confirm Password</label>
            <input type="password" required value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})} className="input" placeholder="Repeat password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <Link to="/login" className="block text-center text-sm text-primary-500 hover:underline mt-4">← Back to Login</Link>
      </motion.div>
    </div>
  );
}
