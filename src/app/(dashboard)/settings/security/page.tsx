"use client";

import React, { useState } from "react";
import { ShieldCheck, KeyRound, QrCode, AlertCircle, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SecuritySettingsPage() {
  const [setupStep, setSetupStep] = useState<"IDLE" | "SCAN" | "ENABLED">("IDLE");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể khởi tạo 2FA");
        setLoading(false);
        return;
      }

      setQrCodeUrl(data.qrCode);
      setSecretKey(data.secret);
      setBackupCodes(data.backupCodes || []);
      setSetupStep("SCAN");
    } catch (e) {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Mã 2FA không chính xác");
        setLoading(false);
        return;
      }

      setSetupStep("ENABLED");
    } catch (e) {
      setError("Lỗi kết nối xác thực");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Bảo mật tài khoản & Xác thực 2 lớp (2FA)
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tăng cường bảo vệ tài khoản cá nhân bằng chuẩn TOTP RFC 6238 (Google Authenticator / 1Password).
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2FA Card */}
      <div className="p-5 rounded-lg border border-border bg-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground">
              Xác thực hai lớp (TOTP Authenticator)
            </h2>
          </div>
          <Badge variant={setupStep === "ENABLED" ? "success" : "outline"} className="text-xs font-mono">
            {setupStep === "ENABLED" ? "Đã kích hoạt" : "Chưa bật"}
          </Badge>
        </div>

        {setupStep === "IDLE" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Khi bật xác thực 2 lớp, mỗi lần đăng nhập vào MyHub ngoài mật khẩu bạn sẽ cần nhập thêm mã số 6 chữ số từ ứng dụng trên điện thoại.
            </p>
            <Button onClick={handleStartSetup} disabled={loading} size="sm" className="h-8 text-xs">
              {loading ? "Đang tạo mã..." : "Thiết lập xác thực 2 lớp ngay"}
            </Button>
          </div>
        )}

        {setupStep === "SCAN" && qrCodeUrl && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Bước 1: Mở ứng dụng Google Authenticator trên điện thoại và quét mã QR bên dưới, hoặc nhập khóa thủ công.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-muted/20 border border-border">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 rounded bg-white p-2 border border-border" />
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Khóa bí mật thủ công:</span>
                  <span className="font-mono font-medium text-foreground text-sm select-all">{secretKey}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Tài khoản:</span>
                  <span className="font-mono text-foreground">admin@example.com</span>
                </div>
              </div>
            </div>

            {/* Bước 2: Nhập mã xác nhận */}
            <form onSubmit={handleVerify2FA} className="space-y-3 max-w-sm">
              <label className="text-xs font-medium text-foreground">
                Bước 2: Nhập mã 6 chữ số hiển thị trên ứng dụng để kích hoạt
              </label>
              <div className="flex gap-2">
                <Input
                  required
                  placeholder="123456"
                  maxLength={6}
                  className="font-mono tracking-widest text-center text-sm h-8"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                />
                <Button type="submit" size="sm" disabled={loading} className="h-8 text-xs shrink-0">
                  {loading ? "Kiểm tra..." : "Xác nhận & Bật"}
                </Button>
              </div>
            </form>

            {/* Mã dự phòng */}
            {backupCodes.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                <span className="text-xs font-semibold text-foreground">Mã dự phòng khẩn cấp:</span>
                <p className="text-[11px] text-muted-foreground">
                  Lưu các mã này ở nơi an toàn. Mỗi mã chỉ dùng được 1 lần nếu mất điện thoại:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs text-foreground">
                  {backupCodes.map((c, i) => (
                    <div key={i} className="p-1 rounded bg-background border border-border text-center">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {setupStep === "ENABLED" && (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Xác thực 2 lớp đã được bật thành công cho tài khoản của bạn.</span>
          </div>
        )}
      </div>
    </div>
  );
}
