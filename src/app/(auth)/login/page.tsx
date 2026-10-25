"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
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
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      if (res?.ok) {
        // Tải lại toàn bộ trang vào dashboard và làm mới phiên làm việc
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
            autoFocus
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
      </form>

      {/* Footer Security Notice */}
      <div className="mt-6 pt-3 border-t border-border text-center text-xs text-muted-foreground">
        Bảo mật độc quyền theo Nghị định 13/2023/NĐ-CP
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
