import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../utils/api";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 max-w-sm w-full text-center">
        {status === "loading" && <><span className="text-5xl block mb-4 animate-spin-slow">⏳</span><p className="text-[var(--text)]">Verifying your email...</p></>}
        {status === "success" && <>
          <span className="text-6xl block mb-4">✅</span>
          <h2 className="font-display font-bold text-2xl text-[var(--text)] mb-2">Email Verified!</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">Your account is now active. Welcome to MultiShop!</p>
          <Link to="/login" className="btn-primary w-full justify-center">Sign In →</Link>
        </>}
        {status === "error" && <>
          <span className="text-6xl block mb-4">❌</span>
          <h2 className="font-display font-bold text-2xl text-[var(--text)] mb-2">Verification Failed</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">This link may be invalid or expired. Please register again.</p>
          <Link to="/register" className="btn-primary w-full justify-center">Register Again</Link>
        </>}
      </motion.div>
    </div>
  );
}
