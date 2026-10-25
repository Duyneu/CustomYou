"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        setError(data.error || "Mã xác thực không chính xác");
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
      setError("Lỗi kết nối khi kiểm tra xác thực hai lớp.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="space-y-1 mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Đăng nhập MyHub
        </h1>
        <p className="text-xs text-muted-foreground">
          Không gian quản lý cá nhân và dữ liệu tài chính độc lập.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 ? (
        /* Bước 1: Tài khoản & Mật khẩu */
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Địa chỉ email
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@myhub.local"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Mật khẩu
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-9"
          >
            {loading ? "Đang xác thực..." : "Tiếp tục vào bảng điều khiển"}
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>

          {/* Tài khoản mẫu */}
          <div className="pt-4 border-t border-border text-center space-y-1">
            <div className="text-xs text-muted-foreground">
              Tài khoản mẫu mặc định
            </div>
            <div className="text-xs font-mono text-foreground">
              admin@myhub.local / MyHub@2026!
            </div>
          </div>
        </form>
      ) : (
        /* Bước 2: Xác thực 2FA TOTP */
        <form onSubmit={handleTwoFactorVerify} className="space-y-4">
          <div className="text-xs text-muted-foreground">
            Nhập mã gồm 6 chữ số từ ứng dụng Google Authenticator hoặc mã dự phòng đã lưu.
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Mã xác thực
            </label>
            <Input
              type="text"
              required
              autoFocus
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="123456"
              className="text-center tracking-widest font-mono"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Quay lại
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Đang kiểm tra..." : "Xác nhận mã"}
            </Button>
          </div>
        </form>
      )}

      {/* Footer Security Notice */}
      <div className="mt-6 pt-3 border-t border-border text-center text-xs text-muted-foreground">
        Mã hóa AES-256-GCM theo Nghị định 13/2023/NĐ-CP
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense fallback={<div className="text-xs text-muted-foreground">Đang tải biểu mẫu...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
