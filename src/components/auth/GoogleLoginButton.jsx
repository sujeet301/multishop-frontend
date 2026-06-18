import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function GoogleLoginButton({ label = "Continue with Google", onSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes("your_google_client_id")) {
      console.warn("⚠️ REACT_APP_GOOGLE_CLIENT_ID not set in .env");
      return;
    }

    const existing = document.getElementById("google-gsi-script");
    if (existing && window.google?.accounts) { setup(); setScriptReady(true); return; }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => { setScriptReady(true); setup(); };
    document.head.appendChild(script);

    return () => { window.google?.accounts?.id?.cancel(); };
  }, []);

  const setup = () => {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCallback,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    if (buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard", shape: "rectangular", theme: "outline",
        size: "large", text: "continue_with", width: buttonRef.current.offsetWidth || 360,
      });
    }
  };

  const handleCallback = async (response) => {
    if (!response.credential) { toast.error("Google sign-in cancelled."); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/google", { credential: response.credential });
      localStorage.setItem("ms_token", res.data.token);
      dispatch({ type: "auth/loadUser/fulfilled", payload: res.data });
      toast.success("Logged in with Google! 🎉");
      if (onSuccess) onSuccess(res.data);
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Google login failed.");
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="w-full h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3 bg-white dark:bg-gray-800">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full" />
      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Signing in...</span>
    </div>
  );

  return (
    <div className="w-full">
      {/* Google renders its button inside this div */}
      <div ref={buttonRef} className="w-full rounded-xl overflow-hidden" style={{ minHeight: 44 }} />

      {/* Shown if script hasn't loaded yet */}
      {!scriptReady && (
        <motion.button whileTap={{ scale: 0.98 }}
          onClick={() => window.google?.accounts?.id?.prompt()}
          className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <GoogleIcon />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
        </motion.button>
      )}

      {/* Config warning in development */}
      {!process.env.REACT_APP_GOOGLE_CLIENT_ID?.includes("apps.googleusercontent.com") && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
          ⚠️ Set <code className="font-mono">REACT_APP_GOOGLE_CLIENT_ID</code> in <code className="font-mono">.env</code> to enable Google Sign-In
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}