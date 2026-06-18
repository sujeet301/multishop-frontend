import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { login, googleLogin } from "../../store/slices/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (result.type.endsWith("/fulfilled")) navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        {["✨","🛒","💎","🎁","⚡","🌟"].map((e, i) => (
          <motion.span key={i} className="absolute text-3xl opacity-30 select-none"
            style={{ top: `${10 + i * 14}%`, left: `${5 + (i % 3) * 30}%` }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}>
            {e}
          </motion.span>
        ))}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 text-center text-white">
          <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl block mb-6">🛍️</motion.span>
          <h1 className="font-display font-extrabold text-4xl mb-3">MultiShop</h1>
          <p className="text-white/80 text-lg max-w-xs">Your one-stop destination for the best products from verified sellers.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["Free Delivery","Easy Returns","Secure Payments"].map(f => (
              <span key={f} className="bg-white/20 backdrop-blur-sm text-sm px-4 py-1.5 rounded-full border border-white/30">{f}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🛍️</span>
            <h1 className="font-display font-bold text-2xl text-gradient mt-2">MultiShop</h1>
          </div>
          <h2 className="font-display font-bold text-2xl text-[var(--text)] mb-1">Welcome back!</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="input" placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="input-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-500 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />Signing in...</span> : "Sign In →"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
            <div className="relative flex justify-center text-xs text-[var(--text-muted)] bg-[var(--bg)] px-3">or continue with</div>
          </div>

          <button onClick={() => {/* Google OAuth - needs Google Sign-In script */}}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border-2 border-[var(--border)] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-medium text-[var(--text)]">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
