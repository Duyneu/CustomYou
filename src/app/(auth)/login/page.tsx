"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  X,
  Mail,
  Lock,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  LogIn,
} from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("admin@example.com");
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

    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
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
        email: email.trim(),
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
        className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#07152c]/75 backdrop-blur-[20px] border border-white/20 text-white font-medium shadow-2xl hover:bg-[#132f57] transition-all duration-200"
      >
        <LogIn className="w-4 h-4 text-white" />
        <span>Đăng nhập Custom You</span>
      </button>
    );
  }

  return (
    <div
      className={`relative w-[400px] max-w-[90%] p-8 sm:p-10 rounded-[20px] bg-[#07152c]/65 backdrop-blur-[20px] border border-white/20 shadow-[0_20px_45px_rgba(0,0,0,0.5),0_6px_18px_rgba(0,0,0,0.35)] text-white transition-all ${
        isClosing ? "animate-card-exit" : "animate-card-entry"
      }`}
    >
      {/* Top-Right X Close Button */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Đóng bảng đăng nhập"
        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200 hover:rotate-90"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Brand Emblem & Centered Title */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/25 mb-2.5 bg-[#180733] shadow-md">
          <Image
            src="/logo-mark.png"
            alt="Custom You"
            width={48}
            height={48}
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {isTwoFactorStep ? "Xác thực 2FA" : "Login"}
        </h1>
        <p className="text-[11px] text-white/60 mt-1 uppercase tracking-wider font-medium">
          {isTwoFactorStep
            ? "Google Authenticator"
            : "Personalization Platform"}
        </p>
      </div>

      {/* Validation / Error Notice */}
      {error && (
        <div className="mb-4 p-2.5 rounded-lg border border-red-400/40 bg-red-900/30 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isTwoFactorStep ? (
          <>
            {/* 2. Email Field: Transparent background, bottom border, small label, icon on right */}
            <div className="space-y-1 group">
              <label className="text-xs font-medium text-white/70 group-focus-within:text-white transition-colors">
                Email
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-transparent border-0 border-b-2 border-white/40 focus:border-white focus:outline-none focus:ring-0 text-white text-sm py-2 pr-8 placeholder:text-white/30 transition-colors"
                />
                <Mail className="w-4 h-4 absolute right-1 text-white/60 group-focus-within:text-white pointer-events-none transition-colors" />
              </div>
            </div>

            {/* 3. Password Field: Same style with Lock icon */}
            <div className="space-y-1 group">
              <label className="text-xs font-medium text-white/70 group-focus-within:text-white transition-colors">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-0 border-b-2 border-white/40 focus:border-white focus:outline-none focus:ring-0 text-white text-sm py-2 pr-8 placeholder:text-white/30 transition-colors"
                />
                <Lock className="w-4 h-4 absolute right-1 text-white/60 group-focus-within:text-white pointer-events-none transition-colors" />
              </div>
            </div>

            {/* 4. Remember Me Checkbox & Forgot Password Link */}
            <div className="flex items-center justify-between text-xs text-white/75 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/40 bg-transparent text-[#091c36] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-white"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Mật khẩu tài khoản chủ nhân đã được mã hóa trong cơ sở dữ liệu.");
                }}
                className="hover:text-white hover:underline transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {/* 5. Full-width Login Button: Dark navy background, white text, rounded corners */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-full bg-[#091c36] hover:bg-[#132f57] border border-white/20 text-white text-sm font-semibold shadow-md hover:shadow-lg active:scale-[0.985] disabled:opacity-60 transition-all duration-200"
            >
              {loading ? "Đang đăng nhập..." : "Login"}
            </button>

            {/* 6. Centered Small Text: Don't have an account? Register */}
            <p className="text-center text-xs text-white/70 pt-1">
              Don’t have an account?{" "}
              <a
                href="#register"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Hệ thống chỉ dành cho một chủ nhân duy nhất (admin@example.com).");
                }}
                className="font-bold text-white hover:underline ml-1"
              >
                Register
              </a>
            </p>
          </>
        ) : (
          /* 2FA Step for Owner Security */
          <>
            <div className="p-3 rounded-lg bg-black/20 border border-white/20 text-xs space-y-1">
              <div className="text-white/60">Tài khoản chủ nhân:</div>
              <div className="font-medium font-mono text-white">{email}</div>
            </div>

            <div className="space-y-1.5 group">
              <label className="text-xs font-medium text-white/80 group-focus-within:text-white">
                Mã xác thực 6 chữ số
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={9}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-transparent border-0 border-b-2 border-white/40 focus:border-white focus:outline-none focus:ring-0 text-white text-center font-mono tracking-widest text-lg py-2 transition-colors"
                />
                <ShieldCheck className="w-4 h-4 absolute right-1 text-white/60 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !twoFactorCode.trim()}
              className="w-full py-3 px-4 mt-2 rounded-full bg-[#091c36] hover:bg-[#132f57] border border-white/20 text-white text-sm font-semibold shadow-md hover:shadow-lg active:scale-[0.985] disabled:opacity-60 transition-all duration-200"
            >
              {loading ? "Đang kiểm tra mã..." : "Xác nhận & Đăng nhập"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsTwoFactorStep(false);
                setTwoFactorCode("");
                setError(null);
              }}
              className="w-full py-2 text-xs text-white/60 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại bước trước
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#040d1a] bg-[url('/mountains.svg')] bg-cover bg-center bg-no-repeat overflow-x-clip selection:bg-purple-600 selection:text-white">
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
