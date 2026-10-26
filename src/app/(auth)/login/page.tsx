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
  Eye,
  EyeOff,
  Sparkles,
  Shield,
} from "lucide-react";

function LoginForm() {
  const [username, setUsername] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Card close & reopen states
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // High-performance direct DOM refs for 120 FPS buttery-smooth parallax (0 React re-renders)
  const cardRef = React.useRef<HTMLDivElement>(null);
  const orbsRef = React.useRef<HTMLDivElement>(null);
  const rafId = React.useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(0, -6px, 0) rotateX(${-y * 2.2}deg) rotateY(${x * 2.2}deg)`;
      }
      if (orbsRef.current) {
        orbsRef.current.style.transform = `translate3d(${x * 16}px, ${y * 16 - 8}px, 0)`;
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (cardRef.current) {
      cardRef.current.style.transform = "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)";
    }
    if (orbsRef.current) {
      orbsRef.current.style.transform = "translate3d(0, 0, 0)";
    }
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
      onMouseLeave={handleMouseLeave}
      className="relative w-[430px] max-w-[95%] flex items-center justify-center perspective-[1000px] group cursor-default"
    >
      {/* 
        High-Performance Hardware-Accelerated Ambient Chromatic Orbs
        Uses GPU composite-only properties (transform & opacity) with zero CPU filter overhead
      */}
      <div
        ref={orbsRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out will-change-transform z-0"
        aria-hidden="true"
      >
        <div
          className="absolute -top-16 -left-16 w-84 h-84 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-500 opacity-45 group-hover:opacity-75 group-hover:scale-110 transition-all duration-500 ease-out blur-[55px] will-change-transform"
        />
        <div
          className="absolute -bottom-16 -right-16 w-84 h-84 rounded-full bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-800 opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500 ease-out blur-[60px] will-change-transform"
        />
        <div
          className="absolute w-64 h-64 rounded-full bg-purple-500/25 opacity-30 group-hover:opacity-55 group-hover:scale-120 transition-all duration-700 ease-out blur-[50px] will-change-transform"
        />
      </div>

      {/* 
        Sculpted Apple macOS / iOS 18 Glass Card (Fluid, Organic, High-End Material)
        - Sculpted rounded-[32px] curvature with lit hairline rim
        - High-density optical translucency
        - Masked hairline rim highlight (.glass-panel::before)
        - Anti-banding noise overlay (.glass-panel::after)
        - Specular sweep glint (.glass-sweep-track)
      */}
      <div
        ref={cardRef}
        className={`glass-panel relative z-10 w-full p-7 sm:p-9 rounded-[32px] text-white transition-all duration-300 ease-out will-change-transform ${
          isClosing ? "animate-card-exit" : "animate-card-entry"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%), rgba(16, 7, 34, 0.38)",
          backdropFilter: "blur(28px) saturate(190%) brightness(106%)",
          WebkitBackdropFilter: "blur(28px) saturate(190%) brightness(106%)",
          boxShadow:
            "0 25px 55px -12px rgba(0, 0, 0, 0.75), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45), inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.35)",
          transform: "translateZ(0)",
        }}
      >
        {/* Specular Sweep Glint */}
        <div className="glass-sweep-track" aria-hidden="true" />

        {/* Top-Right X Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng bảng đăng nhập"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/[0.08] hover:bg-white/[0.22] border border-white/15 hover:border-white/40 transition-all duration-200 hover:rotate-90 hover:scale-105 z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header & Security Pill */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/30 border-t-white/60 mb-3 bg-[#180733]/90 shadow-[0_8px_24px_rgba(168,85,247,0.45),inset_0_1px_1px_rgba(255,255,255,0.45)] flex items-center justify-center transition-transform duration-200 hover:scale-105">
            <Image
              src="/logo-mark.png"
              alt="Custom You"
              width={56}
              height={56}
              className="object-cover w-full h-full"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/12 text-[11px] text-purple-200/90 font-mono shadow-xs mb-2">
            <Shield className="w-3 h-3 text-purple-400" />
            <span>Tài khoản độc lập · AES-256</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            {isTwoFactorStep ? "Xác thực hai bước" : "Chào mừng trở lại"}
          </h1>
          <p className="text-xs text-purple-200/80 mt-1 font-medium drop-shadow-xs">
            {isTwoFactorStep
              ? "Nhập mã bảo mật từ ứng dụng Google Authenticator"
              : "Đăng nhập để vào Bảng điều khiển Custom You"}
          </p>
        </div>

        {/* Validation / Error Notice */}
        {error && (
          <div className="mb-5 p-3 rounded-2xl border border-red-400/40 bg-red-950/60 backdrop-blur-md text-red-200 text-xs flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {/* Modern Fluid Glass Form (Replaces stiff wire underlines with frosted capsules) */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {!isTwoFactorStep ? (
            <>
              {/* 1. Username / Email Input Capsule */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/85 pl-1 block">
                  Tài khoản hoặc Email
                </label>
                <div className="relative flex items-center rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] focus-within:bg-white/[0.09] border border-white/15 focus-within:border-purple-400/80 transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] focus-within:shadow-[0_0_20px_rgba(168,85,247,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] group">
                  <div className="pl-3.5 pr-1 text-white/60 group-focus-within:text-purple-300 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-transparent px-2.5 py-3 text-sm text-white placeholder:text-white/35 outline-none font-sans drop-shadow-xs"
                  />
                </div>
              </div>

              {/* 2. Password Input Capsule with Eye Visibility Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-xs font-medium text-white/85">
                    Mật khẩu
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Mật khẩu tài khoản chủ nhân đã được mã hóa an toàn.");
                    }}
                    className="text-[11px] text-purple-300 hover:text-white hover:underline transition-colors"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative flex items-center rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] focus-within:bg-white/[0.09] border border-white/15 focus-within:border-purple-400/80 transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] focus-within:shadow-[0_0_20px_rgba(168,85,247,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] group">
                  <div className="pl-3.5 pr-1 text-white/60 group-focus-within:text-purple-300 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent px-2.5 py-3 text-sm text-white placeholder:text-white/35 outline-none font-sans drop-shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-3.5 text-white/50 hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 3. Remember Me Checkbox */}
              <div className="flex items-center pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-white/85 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-white/30 bg-white/[0.06] text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-purple-500"
                  />
                  <span>Duy trì đăng nhập trên thiết bị này</span>
                </label>
              </div>

              {/* 4. Login Button with Specular Edge and Tactile Press */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11.5 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-purple-500 active:scale-[0.985] text-white text-sm font-semibold shadow-[0_6px_22px_rgba(168,85,247,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 disabled:opacity-60 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Đang đăng nhập...</span>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* 5. Footer info */}
              <div className="pt-3 flex items-center justify-between text-[11px] text-white/60 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Máy chủ trực tuyến</span>
                </div>
                <span>Chủ nhân: admin@example.com</span>
              </div>
            </>
          ) : (
            /* 2FA Step for Owner Security */
            <>
              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/15 text-xs space-y-1 mb-2 backdrop-blur-md">
                <div className="text-white/70">Tài khoản chủ nhân:</div>
                <div className="font-medium font-mono text-purple-200">{username}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/85 pl-1 block text-center">
                  Mã 6 chữ số từ Google Authenticator
                </label>
                <div className="relative flex items-center rounded-2xl bg-white/[0.06] border border-white/20 focus-within:border-purple-400 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-200">
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={9}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="123 456"
                    className="w-full bg-transparent py-3 text-center font-mono tracking-widest text-xl text-white outline-none"
                  />
                  <div className="pr-3.5 text-purple-300 pointer-events-none">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !twoFactorCode.trim()}
                className="w-full h-11.5 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-sm font-semibold shadow-[0_6px_22px_rgba(168,85,247,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/25 active:scale-[0.985] disabled:opacity-60 transition-all duration-200 cursor-pointer mt-2"
              >
                {loading ? "Đang xác thực..." : "Xác nhận & Vào hệ thống"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTwoFactorStep(false);
                  setTwoFactorCode("");
                  setError(null);
                }}
                className="w-full py-2.5 text-xs text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 bg-[#070210] bg-[url('/mountains.svg')] bg-cover bg-center bg-no-repeat overflow-x-clip selection:bg-purple-600 selection:text-white">
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
