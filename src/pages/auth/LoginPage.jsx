import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { login } from "../../store/slices/authSlice";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

function Spinner() {
  return (
    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
  );
}

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
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* ── Left decorative panel ──────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#6366f1 0%,#4f46e5 40%,#7c3aed 100%)" }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-16 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-16 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        {["✨","🛒","💎","🎁","⚡","🌟","🛍️","💜"].map((e, i) => (
          <motion.span key={i} className="absolute text-3xl opacity-20 select-none pointer-events-none"
            style={{ top: `${8 + i * 11}%`, left: `${5 + (i % 3) * 32}%` }}
            animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}>
            {e}
          </motion.span>
        ))}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="relative z-10 text-center text-white px-8">
          <motion.span className="text-8xl block mb-6"
            animate={{ rotate: [0,-8,8,0] }} transition={{ duration: 3, repeat: Infinity }}>🛍️</motion.span>
          <h1 className="font-extrabold text-4xl tracking-tight mb-3">MultiShop</h1>
          <p className="text-white/80 text-lg max-w-xs leading-relaxed">
            Your one-stop destination for the best products from verified sellers.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["Free Delivery","Easy Returns","Secure Payments","24/7 Support"].map(f => (
              <span key={f} className="bg-white/15 backdrop-blur-sm text-sm px-4 py-1.5 rounded-full border border-white/25 font-medium">{f}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right: Login form ──────────────────────────────── */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6 sm:p-10">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🛍️</span>
            <h1 className="font-extrabold text-2xl mt-2"
              style={{ background: "linear-gradient(135deg,#6366f1,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              MultiShop
            </h1>
          </div>

          <h2 className="font-extrabold text-2xl text-gray-900 dark:text-white mb-1">Welcome back!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to continue shopping</p>

          {/* ── Google Sign-In ─────────────────────────────── */}
          <GoogleLoginButton label="Continue with Google" />

          {/* ── Divider ────────────────────────────────────── */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 dark:bg-gray-950 px-3 text-xs text-gray-400 font-medium">
                or sign in with email
              </span>
            </div>
          </div>

          {/* ── Email/Password Form ─────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input type="email" required value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-400 transition"
                placeholder="you@example.com" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-400 transition"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-base transition">
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:shadow-lg transition-all"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
              {loading ? <><Spinner /> Signing in...</> : "Sign In →"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Create one →
            </Link>
          </p>

         
        </motion.div>
      </div>
    </div>
  );
}
