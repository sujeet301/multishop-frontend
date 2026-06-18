import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = value.split("");
  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits]; next[i] = val; onChange(next.join(""));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(p.length, 5)]?.focus();
  };
  return (
    <div className="flex gap-2 justify-center">
      {[0,1,2,3,4,5].map(i => (
        <motion.input key={i} ref={el => (inputs.current[i] = el)}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ""} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste}
          whileFocus={{ scale: 1.06 }}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            ${digits[i] ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-200 dark:border-gray-700"}
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800
            disabled:opacity-50 disabled:cursor-not-allowed`} />
      ))}
    </div>
  );
}

function CountdownTimer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    if (!seconds) return;
    const iv = setInterval(() => setLeft(p => { if (p <= 1) { clearInterval(iv); onExpire?.(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(iv);
  }, [seconds]);
  if (!left) return null;
  const m = Math.floor(left / 60), s = left % 60;
  return <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{m > 0 ? `${m}:${s.toString().padStart(2,"0")}` : `${s}s`}</span>;
}

function Spinner() {
  return <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />;
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = password.length >= 10 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const barColors = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];
  const txtColors = ["", "text-red-500", "text-amber-500", "text-yellow-500", "text-green-600"];
  return (
    <div className="mt-2">
      <div className="flex gap-1">{[1,2,3,4].map(i => (
        <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= score ? barColors[score] : "bg-gray-200 dark:bg-gray-700"}`} />
      ))}</div>
      <p className={`text-xs mt-1 font-medium ${txtColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.post("/auth/register/send-otp", form);
      setSentEmail(form.email); setStep(2); setCanResend(false);
      toast.success(`OTP sent to ${form.email} ✉️`);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to send OTP"); }
    setLoading(false);
  };

  const handleVerifyOTP = async (code) => {
    const c = code || otp;
    if (c.length !== 6) { setOtpError("Please enter the complete 6-digit OTP"); return; }
    setOtpError(""); setLoading(true);
    try {
      const res = await api.post("/auth/register/verify-otp", { email: sentEmail, otp: c });
      localStorage.setItem("ms_token", res.data.token);
      dispatch({ type: "auth/loadUser/fulfilled", payload: res.data });
      toast.success("Account created! Welcome to MultiShop 🎉");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP";
      setOtpError(msg); setOtp(""); toast.error(msg);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/register/resend-otp", { email: sentEmail });
      setOtp(""); setOtpError(""); setCanResend(false);
      toast.success("New OTP sent!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to resend"); }
    setResending(false);
  };

  useEffect(() => { if (otp.length === 6 && step === 2 && !loading) handleVerifyOTP(otp); }, [otp]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#f97316 0%,#6366f1 50%,#4338ca 100%)" }}>
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        {["🛍️","✨","🎁","💎","⚡","🌟"].map((emoji, i) => (
          <motion.span key={i} className="absolute text-4xl opacity-20 select-none"
            style={{ top:`${10+i*14}%`, left:`${8+(i%3)*28}%` }}
            animate={{ y:[0,-18,0], rotate:[0,12,0] }}
            transition={{ duration:3+i*0.5, repeat:Infinity, delay:i*0.4 }}>{emoji}</motion.span>
        ))}
        <motion.div initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7 }}
          className="relative z-10 text-center text-white px-8">
          <motion.span className="text-8xl block mb-6" animate={{ rotate:[0,-8,8,0] }} transition={{ duration:3,repeat:Infinity }}>🎉</motion.span>
          <h1 className="font-extrabold text-4xl mb-3 tracking-tight">Join MultiShop</h1>
          <p className="text-white/80 text-lg max-w-xs leading-relaxed mb-8">Discover thousands of products from verified sellers across India.</p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {["10M+ Products","50K+ Sellers","Free Returns","Secure Payments"].map(f => (
              <div key={f} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-sm border border-white/25 font-semibold">{f}</div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🛍️</span>
            <h1 className="font-extrabold text-2xl mt-2" style={{ background:"linear-gradient(135deg,#6366f1,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>MultiShop</h1>
          </div>

          <AnimatePresence mode="wait">

            {/* ════ STEP 1: Form ════ */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity:0,x:40 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-40 }} transition={{ duration:0.3 }}>
                <h2 className="font-extrabold text-2xl text-gray-900 dark:text-white mb-1">Create account</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Free forever · Takes less than a minute</p>

                {/* Google Sign-Up */}
                <GoogleLoginButton label="Sign up with Google" />

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
                  <div className="relative flex justify-center"><span className="bg-gray-50 dark:bg-gray-950 px-3 text-xs text-gray-400 font-medium">or sign up with email</span></div>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  {[
                    { key:"name",  label:"Full Name",       type:"text",     req:true,  ph:"John Doe" },
                    { key:"email", label:"Email Address",   type:"email",    req:true,  ph:"you@example.com" },
                    { key:"phone", label:"Phone (optional)",type:"tel",      req:false, ph:"+91 9876543210" },
                  ].map(({ key, label, type, req, ph }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {label} {req && <span className="text-red-400">*</span>}
                      </label>
                      <input type={type} required={req} value={form[key]}
                        onChange={e => setForm({...form,[key]:e.target.value})}
                        placeholder={ph} autoFocus={key === "name"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-400 transition" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input type={showPw?"text":"password"} required minLength={6}
                        value={form.password} onChange={e => setForm({...form,password:e.target.value})}
                        placeholder="Min 6 characters"
                        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-400 transition" />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition text-base">
                        {showPw ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                  </div>

                  <p className="text-xs text-gray-400">By continuing you agree to our <a href="#" className="text-indigo-500 hover:underline">Terms</a> and <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>.</p>

                  <motion.button type="submit" disabled={loading} whileTap={{ scale:0.98 }}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:shadow-lg transition-all"
                    style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                    {loading ? <><Spinner /> Sending OTP...</> : "Send OTP →"}
                  </motion.button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                  Already have an account?{" "}
                  <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign in →</Link>
                </p>
              </motion.div>
            )}

            {/* ════ STEP 2: OTP ════ */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity:0,x:40 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-40 }} transition={{ duration:0.3 }}>
                <div className="text-center mb-7">
                  <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring",stiffness:220,damping:14 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center text-4xl"
                    style={{ background:"linear-gradient(135deg,#e0e7ff,#c7d2fe)" }}>📧</motion.div>
                  <h2 className="font-extrabold text-2xl text-gray-900 dark:text-white mb-1">Check your email</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">We sent a 6-digit OTP to</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">{sentEmail}</span>
                    <button onClick={() => { setStep(1); setOtp(""); setOtpError(""); }}
                      className="text-xs text-gray-400 hover:text-gray-600 underline">Change</button>
                  </div>
                </div>

                <div className="space-y-5">
                  <OTPInput value={otp} onChange={setOtp} disabled={loading} />

                  <AnimatePresence>
                    {otpError && (
                      <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                        className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                        <span className="text-red-500 flex-shrink-0">⚠️</span>
                        <p className="text-sm text-red-600 dark:text-red-400">{otpError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button onClick={() => handleVerifyOTP()} disabled={loading || otp.length !== 6}
                    whileTap={{ scale:0.98 }}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
                    style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                    {loading ? <><Spinner /> Verifying...</> : "Verify & Create Account ✓"}
                  </motion.button>

                  <div className="text-center">
                    {!canResend ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Resend OTP in <CountdownTimer seconds={60} onExpire={() => setCanResend(true)} /></p>
                    ) : (
                      <button onClick={handleResend} disabled={resending}
                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50">
                        {resending ? "Sending..." : "🔁 Resend OTP"}
                      </button>
                    )}
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-amber-700 dark:text-amber-400">⏱️ OTP expires in <strong>10 minutes</strong> · Check spam if not received</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}