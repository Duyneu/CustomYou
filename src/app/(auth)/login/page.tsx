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

  // Mouse tracking for interactive Apple Glass Parallax & Elevation
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

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
        className="glass-reopen relative z-10 flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/[0.08] backdrop-blur-[24px] backdrop-saturate-[190%] border border-white/20 text-white font-medium shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:bg-white/[0.15] hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <LogIn className="w-4 h-4 text-purple-300" />
        <span>Đăng nhập Custom You</span>
      </button>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-[410px] max-w-[92%] flex items-center justify-center perspective-[1000px] group cursor-default"
    >
      {/* 
        Inline SVG Filter for 2026 Liquid Glass Refraction
        Bends background orbs and mountain light like optical curved glass
      */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <filter id="liquid-glass">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="3" result="noise">
            <animate attributeName="baseFrequency" dur="18s" values="0.008 0.012; 0.012 0.008; 0.008 0.012" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* 
        Ambient Chromatic Fluid Mesh Behind Glass (iPhone iOS 18 Glass Material)
        Physically bent and refracted through the liquid glass optical lens
      */}
      <div className="ambient-liquid-layer absolute inset-0 flex items-center justify-center pointer-events-none [filter:url(#liquid-glass)] z-0" aria-hidden="true">
        <div
          className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-500 transition-all duration-500 ease-out"
          style={{
            opacity: isHovered ? 0.78 : 0.45,
            transform: isHovered
              ? `scale(1.22) translate3d(${mousePos.x * 28}px, ${mousePos.y * 28 - 14}px, 0)`
              : "scale(1) translate3d(0, 0, 0)",
            filter: isHovered ? "blur(55px)" : "blur(75px)",
          }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-800 transition-all duration-500 ease-out"
          style={{
            opacity: isHovered ? 0.68 : 0.38,
            transform: isHovered
              ? `scale(1.2) translate3d(${mousePos.x * -24}px, ${mousePos.y * -24 + 12}px, 0)`
              : "scale(1) translate3d(0, 0, 0)",
            filter: isHovered ? "blur(58px)" : "blur(78px)",
          }}
        />
        <div
          className="absolute w-60 h-60 rounded-full bg-purple-500/35 transition-all duration-700 ease-out"
          style={{
            opacity: isHovered ? 0.6 : 0.22,
            transform: isHovered ? "scale(1.35)" : "scale(0.9)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* 
        Authentic Apple / iPhone Glassmorphism Card
        - Four Ingredients of Believable Glass (Frost, Translucency, Edge of Glass hairline, Depth)
        - Masked hairline rim highlight (.glass-panel::before)
        - Anti-banding noise overlay (.glass-panel::after)
        - Specular sweep glint (.glass-sweep-track)
        - Interactive tilt & lift on hover
      */}
      <div
        className={`glass-panel relative z-10 w-full p-8 sm:p-10 rounded-[28px] text-white transition-all duration-300 ease-out ${
          isClosing ? "animate-card-exit" : "animate-card-entry"
        }`}
        style={{
          background: isHovered
            ? "linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(168, 85, 247, 0.08) 45%, rgba(255, 255, 255, 0.02) 100%), rgba(22, 10, 44, 0.28)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(168, 85, 247, 0.06) 45%, rgba(255, 255, 255, 0.02) 100%), rgba(16, 7, 34, 0.22)",
          backdropFilter: "blur(32px) saturate(200%) brightness(106%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%) brightness(106%)",
          boxShadow: isHovered
            ? "0 35px 70px -15px rgba(0, 0, 0, 0.8), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.6), inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.45)"
            : "0 24px 48px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.35)",
          transform: isHovered
            ? `translate3d(0, -6px, 0) rotateX(${-mousePos.y * 3}deg) rotateY(${mousePos.x * 3}deg)`
            : "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)",
        }}
      >
        {/* Specular Sweep Glint */}
        <div className="glass-sweep-track" aria-hidden="true" />

        {/* Top-Right X Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng bảng đăng nhập"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/[0.08] hover:bg-white/[0.22] border border-white/15 hover:border-white/40 transition-all duration-200 hover:rotate-90 hover:scale-105 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Logo & Centered Title */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/30 border-t-white/60 mb-2.5 bg-[#180733]/85 shadow-[0_6px_20px_rgba(168,85,247,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <Image
              src="/logo-mark.png"
              alt="Custom You"
              width={48}
              height={48}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
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
          <div className="mb-4 p-2.5 rounded-xl border border-red-400/40 bg-red-950/50 backdrop-blur-md text-red-200 text-xs flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form (Structured according to the tutorial screenshot) */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {!isTwoFactorStep ? (
            <>
              {/* 1. Input Box: Username with Glass Underline Effect */}
              <div className="relative w-full h-12 mb-6 border-b-2 border-white/25 focus-within:border-purple-400 focus-within:shadow-[0_2px_12px_rgba(168,85,247,0.5)] transition-all duration-200 group">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full h-full bg-transparent border-0 text-white placeholder:text-white/40 pr-9 focus:outline-none focus:ring-0 text-sm drop-shadow-sm font-sans"
                />
                <User className="w-5 h-5 absolute right-1 top-1/2 -translate-y-1/2 text-white/70 group-focus-within:text-purple-300 pointer-events-none transition-colors drop-shadow" />
              </div>

              {/* 2. Input Box: Password */}
              <div className="relative w-full h-12 mb-6 border-b-2 border-white/25 focus-within:border-purple-400 focus-within:shadow-[0_2px_12px_rgba(168,85,247,0.5)] transition-all duration-200 group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-full bg-transparent border-0 text-white placeholder:text-white/40 pr-9 focus:outline-none focus:ring-0 text-sm drop-shadow-sm font-sans"
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
              <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/20 text-xs space-y-1 mb-4 backdrop-blur-md">
                <div className="text-white/70">Tài khoản chủ nhân:</div>
                <div className="font-medium font-mono text-purple-200">{username}</div>
              </div>

              <div className="relative w-full h-12 mb-6 border-b-2 border-white/25 focus-within:border-purple-400 focus-within:shadow-[0_2px_12px_rgba(168,85,247,0.5)] transition-all duration-200 group">
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
