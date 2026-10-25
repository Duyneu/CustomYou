"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStep2FA = searchParams.get("step") === "2fa";

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FA, setShow2FA] = useState(hasStep2FA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
          setShow2FA(true);
          setError("Tài khoản đã kích hoạt 2FA. Vui lòng nhập mã 6 số từ Google Authenticator.");
        } else {
          setError(res.error);
        }
        setLoading(false);
        return;
      }

      if (res?.ok) {
        // Sử dụng window.location.href để điều hướng tải lại toàn bộ phiên và cookie NextAuth
        window.location.href = "/dashboard";
      } else {
        setError("Không thể đăng nhập, vui lòng kiểm tra lại thông tin.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Đã xảy ra lỗi kết nối, vui lòng thử lại.");
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
          Bảng điều khiển cá nhân hóa độc quyền cho chủ nhân.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Địa chỉ email
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Mật khẩu
          </label>
          <Input
            type="password"
            required
            autoFocus={!hasStep2FA}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {/* Ô nhập mã 2FA (hiển thị khi tài khoản bật 2FA hoặc người dùng mở) */}
        {show2FA && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Mã xác thực 2FA (Google Authenticator)
              </label>
            </div>
            <Input
              type="text"
              autoFocus={hasStep2FA}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="123456"
              className="text-center tracking-widest font-mono text-sm"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-2 h-9"
        >
          {loading ? "Đang xác thực..." : "Tiếp tục vào bảng điều khiển"}
          <ArrowRight className="w-3.5 h-3.5 ml-2" />
        </Button>

        {/* Nút bật/tắt ô 2FA thủ công */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShow2FA(!show2FA)}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {show2FA ? "Ẩn ô mã 2FA" : "Nhập thêm mã xác thực 2FA?"}
          </button>
        </div>
      </form>

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
