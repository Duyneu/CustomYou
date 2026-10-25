"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/antigravity/glass-card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = searchParams.get("step") === "2fa" ? 2 : 1;

  const [step, setStep] = useState<1 | 2>(initialStep as 1 | 2);
  const [email, setEmail] = useState("admin@myhub.local");
  const [password, setPassword] = useState("MyHub@2026!");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();

      if (sessionData?.user?.twoFactorEnabled && !sessionData?.user?.twoFactorVerified) {
        setStep(2);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("Đã xảy ra lỗi kết nối, vui lòng thử lại.");
      setLoading(false);
    }
  };

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Mã xác thực không đúng");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError("Lỗi kết nối khi kiểm tra 2FA.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <GlassCard enableTilt glow className="p-8 backdrop-blur-2xl border-white/10 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Đăng nhập MyHub
          </h1>
          <p className="text-xs text-zinc-400">
            Không gian số hóa cá nhân & tài chính độc lập
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          /* Bước 1: Email & Password */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Email tài khoản
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@myhub.local"
                  className="pl-10 bg-zinc-900/60 border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-zinc-900/60 border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-11 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/25"
            >
              {loading ? "Đang xác thực..." : "Tiếp tục vào Dashboard"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Gợi ý tài khoản demo */}
            <div className="pt-4 border-t border-zinc-800/80 text-center">
              <p className="text-[11px] text-zinc-400 mb-2">
                Tài khoản khởi tạo mặc định:
              </p>
              <div className="text-[11px] font-mono text-emerald-400 bg-zinc-900/80 py-1.5 px-3 rounded-lg border border-zinc-800 inline-block">
                admin@myhub.local / MyHub@2026!
              </div>
            </div>
          </form>
        ) : (
          /* Bước 2: Xác thực 2FA TOTP */
          <form onSubmit={handleTwoFactorVerify} className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>
                Tài khoản đã kích hoạt bảo vệ hai lớp (2FA). Vui lòng nhập mã từ ứng dụng Google Authenticator hoặc mã dự phòng.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Mã OTP (6 chữ số) hoặc Mã dự phòng
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <Input
                  type="text"
                  required
                  autoFocus
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456 hoặc XXXX-XXXX"
                  className="pl-10 text-center tracking-widest font-mono text-base bg-zinc-900/60 border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 border-zinc-800 text-zinc-400 hover:text-white"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/25"
              >
                {loading ? "Đang kiểm tra..." : "Xác nhận 2FA"}
              </Button>
            </div>
          </form>
        )}

        {/* Footer Security Badge */}
        <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>Mã hóa AES-256-GCM • Chuẩn Nghị định 13/2023/NĐ-CP</span>
        </div>
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-tr from-slate-950 via-zinc-950 to-slate-900">
      {/* Decorative Spatial Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-white text-sm">Đang tải biểu mẫu đăng nhập...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
