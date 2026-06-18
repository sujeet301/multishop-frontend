import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";

// ─── Reusable OTP Input ───────────────────────────────────────
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
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0,1,2,3,4,5].map(i => (
        <motion.input key={i}
          ref={el => (inputs.current[i] = el)}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ""} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          whileFocus={{ scale: 1.05 }}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
            bg-white dark:bg-gray-800 text-[var(--text)]
            ${digits[i] ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30" : "border-[var(--border)]"}
            focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800
            disabled:opacity-50`} />
      ))}
    </div>
  );
}

function CountdownTimer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    if (seconds <= 0) return;
    const iv = setInterval(() => {
      setLeft(p => { if (p <= 1) { clearInterval(iv); onExpire?.(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(iv);
  }, [seconds]);
  if (left <= 0) return null;
  const m = Math.floor(left / 60), s = left % 60;
  return <span className="font-mono font-bold text-primary-600">{m > 0 ? `${m}:${s.toString().padStart(2,"0")}` : `${s}s`}</span>;
}

// ─── Steps: email → otp → new password ───────────────────────
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newpassword
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [pwForm, setPwForm] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password/send-otp", { email });
      setStep(2);
      setCanResend(false);
      toast.success(`OTP sent to ${email} ✉️`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setOtpError("Please enter the complete 6-digit OTP"); return; }
    setOtpError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password/verify-otp", { email, otp });
      setResetToken(res.data.data.resetToken);
      setStep(3);
      toast.success("OTP verified! Set your new password.");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP";
      setOtpError(msg);
      setOtp("");
      toast.error(msg);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/forgot-password/resend-otp", { email });
      setOtp(""); setOtpError(""); setCanResend(false);
      toast.success("New OTP sent!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    setResending(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) { toast.error("Passwords don't match"); return; }
    if (pwForm.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.put("/auth/reset-password", { resetToken, password: pwForm.password });
      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to reset password"); }
    setLoading(false);
  };

  useEffect(() => { if (otp.length === 6 && step === 2) handleVerifyOTP(); }, [otp]);

  const stepLabels = ["Email", "OTP", "New Password"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8">

        {/* Step dots */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {stepLabels.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step > i + 1 ? "bg-green-500 text-white" :
                  step === i + 1 ? "bg-primary-500 text-white shadow-md shadow-primary-200" :
                  "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] font-medium ${step === i+1 ? "text-primary-600 dark:text-primary-400" : "text-[var(--text-muted)]"}`}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 mb-4 transition-colors duration-300 ${step > i + 1 ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Remaining code exactly as in your file */}
      </motion.div>
    </div>
  );
}