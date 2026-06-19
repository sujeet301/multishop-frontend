import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";

// ─── Shared sub-components ────────────────────────────────────

function Spinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
    />
  );
}

function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = value.split("");

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    onChange(next.join(""));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft"  && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          whileFocus={{ scale: 1.06 }}
          className={`
            w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800
            ${digits[i]
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
              : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"}
          `}
        />
      ))}
    </div>
  );
}

function CountdownTimer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
    if (!seconds) return;
    const iv = setInterval(() => {
      setLeft((p) => {
        if (p <= 1) { clearInterval(iv); onExpire?.(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [seconds]);

  if (!left) return null;
  const m = Math.floor(left / 60);
  const s = left % 60;
  return (
    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
      {m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`}
    </span>
  );
}

// ─── Step indicator ───────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Email", "OTP", "New Password"];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step > i + 1
                  ? "bg-green-500 text-white"
                  : step === i + 1
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span
              className={`text-[10px] font-semibold ${
                step === i + 1
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {label}
            </span>
          </div>
          {i < 2 && (
            <div
              className={`flex-1 h-0.5 mb-4 rounded-full transition-all duration-500 ${
                step > i + 1 ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step,       setStep]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [email,      setEmail]      = useState("");
  const [otp,        setOtp]        = useState("");
  const [otpError,   setOtpError]   = useState("");
  const [resetToken, setResetToken] = useState("");
  const [canResend,  setCanResend]  = useState(false);
  const [resending,  setResending]  = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [showCfm,    setShowCfm]    = useState(false);
  const [pwForm,     setPwForm]     = useState({ password: "", confirm: "" });

  // ── STEP 1: send OTP ────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password/send-otp", { email });
      setStep(2);
      setCanResend(false);
      setOtp("");
      setOtpError("");
      toast.success(`OTP sent to ${email} ✉️`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Try again.");
    }
    setLoading(false);
  };

  // ── STEP 2: verify OTP ──────────────────────────────────────
  const handleVerifyOTP = async (code) => {
    const c = code || otp;
    if (c.length !== 6) { setOtpError("Please enter the complete 6-digit OTP."); return; }
    setOtpError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password/verify-otp", { email, otp: c });
      setResetToken(res.data.data.resetToken);
      setStep(3);
      toast.success("OTP verified! Now set your new password.");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP.";
      setOtpError(msg);
      setOtp("");
      toast.error(msg);
    }
    setLoading(false);
  };

  // ── STEP 2: resend OTP ──────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/forgot-password/resend-otp", { email });
      setOtp("");
      setOtpError("");
      setCanResend(false);
      toast.success("New OTP sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend.");
    }
    setResending(false);
  };

  // ── STEP 3: reset password ───────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (pwForm.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (pwForm.password !== pwForm.confirm) { toast.error("Passwords don't match."); return; }
    setLoading(true);
    try {
      await api.put("/auth/reset-password", { resetToken, password: pwForm.password });
      toast.success("Password reset! Please login with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    }
    setLoading(false);
  };

  // Auto-submit when all 6 OTP digits entered
  useEffect(() => {
    if (otp.length === 6 && step === 2 && !loading) {
      handleVerifyOTP(otp);
    }
  }, [otp]);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8"
      >
        {/* Step bar */}
        <StepBar step={step} />

        <AnimatePresence mode="wait">

          {/* ══════ STEP 1 — Email ══════ */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-7">
                <span className="text-6xl block mb-3">🔒</span>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Forgot Password?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Enter your registered email and we'll send a 6-digit OTP.
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !email}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md transition-all"
                  style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
                >
                  {loading ? <><Spinner /> Sending OTP...</> : "Send OTP →"}
                </motion.button>
              </form>

              <Link
                to="/login"
                className="block text-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mt-6 transition-colors"
              >
                ← Back to Login
              </Link>
            </motion.div>
          )}

          {/* ══════ STEP 2 — OTP ══════ */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-7">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center text-4xl"
                  style={{ background: "linear-gradient(135deg,#e0e7ff,#c7d2fe)" }}
                >
                  📧
                </motion.div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Enter OTP</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  We sent a 6-digit code to
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
                    {email}
                  </span>
                  <button
                    onClick={() => { setStep(1); setOtp(""); setOtpError(""); }}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline transition"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <OTPInput value={otp} onChange={setOtp} disabled={loading} />

                <AnimatePresence>
                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3"
                    >
                      <span className="flex-shrink-0">⚠️</span>
                      <p className="text-sm text-red-600 dark:text-red-400">{otpError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={() => handleVerifyOTP()}
                  disabled={loading || otp.length !== 6}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md transition-all"
                  style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
                >
                  {loading ? <><Spinner /> Verifying...</> : "Verify OTP ✓"}
                </motion.button>

                {/* Resend */}
                <div className="text-center space-y-2">
                  {!canResend ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Resend OTP in{" "}
                      <CountdownTimer seconds={60} onExpire={() => setCanResend(true)} />
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resending}
                      className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 transition"
                    >
                      {resending ? "Sending..." : "🔁 Resend OTP"}
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    ⏱️ OTP expires in <strong>10 minutes</strong> · Check your spam folder if not received
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════ STEP 3 — New Password ══════ */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-7">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center text-4xl"
                  style={{ background: "linear-gradient(135deg,#dcfce7,#bbf7d0)" }}
                >
                  🔐
                </motion.div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Set New Password</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Choose a strong password for your account.
                </p>
              </div>

              {/* Verified badge */}
              <div className="mb-5 flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5">
                <span className="text-green-500">✅</span>
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                  OTP verified for <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      minLength={6}
                      autoFocus
                      value={pwForm.password}
                      onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-base transition"
                    >
                      {showPw ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCfm ? "text" : "password"}
                      required
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      placeholder="Repeat your password"
                      className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm placeholder:text-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition ${
                        pwForm.confirm && pwForm.password !== pwForm.confirm
                          ? "border-red-400 focus:ring-red-300"
                          : "border-gray-200 dark:border-gray-700 focus:ring-indigo-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCfm(!showCfm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-base transition"
                    >
                      {showCfm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {pwForm.confirm && pwForm.password !== pwForm.confirm && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">⚠️ Passwords don't match</p>
                  )}
                  {pwForm.confirm && pwForm.password === pwForm.confirm && pwForm.confirm.length >= 6 && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">✓ Passwords match</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={
                    loading ||
                    !pwForm.password ||
                    !pwForm.confirm ||
                    pwForm.password !== pwForm.confirm
                  }
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md transition-all"
                  style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
                >
                  {loading ? <><Spinner /> Resetting...</> : "Reset Password 🔒"}
                </motion.button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
