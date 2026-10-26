"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import {
  X,
  User,
  Lock,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  LogIn,
} from "lucide-react";

function LoginForm() {
  const [username, setUsername] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Card close & reopen states
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosed(true);
      setIsClosing(false);
    }, 400);
  };

  const handleReopen = () => {
    setIsClosed(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Vui lòng nhập Username hoặc Email.");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: username.trim(),
        password: password,
        code: twoFactorCode.trim() || undefined,
      });

      if (res?.error) {
        if (res.error === "2FA_REQUIRED") {
          setIsTwoFactorStep(true);
          setError(null);
        } else {
          setError(res.error);
        }
        setLoading(false);
        return;
      }

      if (res?.ok) {
        window.location.href = "/dashboard";
      } else {
        setError("Không thể đăng nhập, vui lòng kiểm tra lại mật khẩu.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Đã xảy ra lỗi kết nối, vui lòng thử lại.");
      setLoading(false);
    }
  };

  if (isClosed) {
    return (
      <button
        type="button"
        onClick={handleReopen}
        className="relative z-10 flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/[0.08] backdrop-blur-[24px] backdrop-saturate-[190%] border border-white/30 border-t-white/50 text-white font-medium shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:bg-white/[0.15] hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <LogIn className="w-4 h-4 text-purple-300" />
        <span>Đăng nhập Custom You</span>
      </button>
    );
  }

  return (
    <div className="relative w-[400px] max-w-[90%] flex items-center justify-center">
      {/* Ambient Chromatic Glow Orbs Behind Glass (Crucial for Glassmorphism Refraction) */}
      <div
        className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-500 opacity-55 blur-[70px] pointer-events-none animate-pulse"
        style={{ animationDuration: "6s" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-14 -right-12 w-64 h-64 rounded-full bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-800 opacity-45 blur-[75px] pointer-events-none animate-pulse"
        style={{ animationDuration: "8s" }}
        aria-hidden="true"
      />

      {/* Authentic Frosted Glassmorphism Card */}
      <div
        className={`relative z-10 w-full p-8 sm:p-10 rounded-[24px] text-white transition-all duration-300 ${
          isClosing ? "animate-card-exit" : "animate-card-entry"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(255, 255, 255, 0.03) 100%), rgba(16, 7, 34, 0.38)",
          backdropFilter: "blur(28px) saturate(190%)",
          WebkitBackdropFilter: "blur(28px) saturate(190%)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          borderTop: "1px solid rgba(255, 255, 255, 0.42)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "inset 0 1px 1px 0 rgba(255, 255, 255, 0.42), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.4), 0 25px 50px -10px rgba(0, 0, 0, 0.7), 0 0 35px rgba(168, 85, 247, 0.22)",
        }}
      >
        {/* Top-Right X Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng bảng đăng nhập"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.18] border border-white/10 hover:border-white/30 transition-all duration-200 hover:rotate-90"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Logo & Centered Title */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/30 border-t-white/50 mb-2.5 bg-[#180733]/80 shadow-[0_4px_15px_rgba(168,85,247,0.35)]">
            <Image
              src="/logo-mark.png"
              alt="Custom You"
              width={48}
              height={48}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            {isTwoFactorStep ? "Xác thực 2FA" : "Login"}
          </h1>
          <p className="text-[11px] text-purple-200/80 mt-1 uppercase tracking-wider font-medium drop-shadow">
            {isTwoFactorStep
              ? "Google Authenticator"
              : "Personalization Platform"}
          </p>
        </div>

        {/* Validation / Error Notice */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg border border-red-400/40 bg-red-950/50 backdrop-blur-md text-red-200 text-xs flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form (Structured according to the tutorial screenshot) */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {!isTwoFactorStep ? (
            <>
              {/* 1. Input Box: Username with Glass Underline Effect */}
              <div className="relative w-full h-12 mb-6 border-b-2 border-white/25 focus-within:border-purple-400 transition-colors group">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full h-full bg-transparent border-0 text-white placeholder:text-white/40 pr-9 focus:outline-none focus:ring-0 text-sm drop-shadow-sm"
                />
                <User className="w-5 h-5 absolute right-1 top-1/2 -translate-y-1/2 text-white/70 group-focus-within:text-purple-300 pointer-events-none transition-colors drop-shadow" />
              </div>

              {/* 2. Input Box: Password */}
              <div className="relative w-full h-12 mb-6 border-b-2 border-white/25 focus-within:border-purple-400 transition-colors group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-full bg-transparent border-0 text-white placeholder:text-white/40 pr-9 focus:outline-none focus:ring-0 text-sm drop-shadow-sm"
                />
                <Lock className="w-5 h-5 absolute right-1 top-1/2 -translate-y-1/2 text-white/70 group-focus-within:text-purple-300 pointer-events-none transition-colors drop-shadow" />
              </div>

              {/* 3. Remember-Forgot Box */}
              <div className="flex items-center justify-between text-xs text-white/85 mb-6">
                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/40 bg-white/[0.08] text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-purple-500"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Mật khẩu tài khoản chủ nhân đã được mã hóa an toàn.");
                  }}
                  className="text-purple-300 hover:text-white hover:underline transition-colors drop-shadow-sm"
                >
                  Forgot password?
                </a>
              </div>

              {/* 4. Login Button with Glass Specular Rim and Glowing Violet Depth */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-purple-500 active:scale-[0.985] text-white text-sm font-semibold shadow-[0_4px_22px_rgba(168,85,247,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/25 disabled:opacity-60 transition-all duration-200 cursor-pointer"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* 5. Register Row */}
              <p className="text-center text-xs text-white/75 mt-5">
                Don’t have an account?{" "}
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Hệ thống chỉ dành riêng cho một chủ nhân (admin@example.com).");
                  }}
                  className="font-bold text-purple-300 hover:text-white hover:underline ml-1"
                >
                  Register
                </a>
              </p>
            </>
          ) : (
            /* 2FA Step for Owner Security */
            <>
              <div className="p-3 rounded-xl bg-white/[0.06] border border-white/20 text-xs space-y-1 mb-4 backdrop-blur-md">
                <div className="text-white/70">Tài khoản chủ nhân:</div>
                <div className="font-medium font-mono text-purple-200">{username}</div>
              </div>

              <div className="relative w-full h-12 mb-6 border-b-2 border-white/25 focus-within:border-purple-400 transition-colors group">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={9}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  className="w-full h-full bg-transparent border-0 text-white text-center font-mono tracking-widest text-lg pr-9 focus:outline-none focus:ring-0"
                />
                <ShieldCheck className="w-5 h-5 absolute right-1 top-1/2 -translate-y-1/2 text-white/70 group-focus-within:text-purple-300 pointer-events-none transition-colors" />
              </div>

              <button
                type="submit"
                disabled={loading || !twoFactorCode.trim()}
                className="w-full h-11 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-sm font-semibold shadow-[0_4px_22px_rgba(168,85,247,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/25 active:scale-[0.985] disabled:opacity-60 transition-all duration-200 cursor-pointer"
              >
                {loading ? "Đang xác thực..." : "Xác nhận & Đăng nhập"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTwoFactorStep(false);
                  setTwoFactorCode("");
                  setError(null);
                }}
                className="w-full py-2.5 mt-2 text-xs text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại bước trước
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#070210] bg-[url('/mountains.svg')] bg-cover bg-center bg-no-repeat overflow-x-clip selection:bg-purple-600 selection:text-white">
      <Suspense
        fallback={
          <div className="text-xs text-white/60">Đang tải giao diện...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
