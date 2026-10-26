"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, KeyRound, QrCode, AlertCircle, Check, Copy, RefreshCw, PowerOff } from "lucide-react";
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
  const [copiedKey, setCopiedKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra trạng thái 2FA khi mở trang
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/auth/2fa/setup");
        if (res.ok) {
          const data = await res.json();
          if (data.enabled) {
            setSetupStep("ENABLED");
          } else {
            setSetupStep("IDLE");
          }
        }
      } catch (e) {
        // bỏ qua lỗi kiểm tra ban đầu
      }
    }
    checkStatus();
  }, []);

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
      setVerifyCode("");
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

  const handleDisable2FA = async () => {
    if (!confirm("Bạn có chắc chắn muốn tắt xác thực 2 lớp?")) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tắt 2FA");
        setLoading(false);
        return;
      }

      setSetupStep("IDLE");
      setQrCodeUrl(null);
      setSecretKey(null);
      setBackupCodes([]);
    } catch (e) {
      setError("Lỗi kết nối khi tắt 2FA");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
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
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Xác thực hai lớp (TOTP Authenticator)
              </h2>
              <p className="text-[11px] text-muted-foreground">Bảo vệ tài khoản với thuật toán RFC 6238</p>
            </div>
          </div>
          <Badge variant={setupStep === "ENABLED" ? "success" : "outline"} className="text-xs font-mono">
            {setupStep === "ENABLED" ? "Đã kích hoạt" : "Chưa bật"}
          </Badge>
        </div>

        {setupStep === "IDLE" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Khi bật xác thực 2 lớp, mỗi lần đăng nhập vào MyHub ngoài mật khẩu bạn sẽ cần nhập thêm mã số 6 chữ số từ ứng dụng trên điện thoại (Google Authenticator, Apple Passwords, hoặc 1Password).
            </p>
            <Button onClick={handleStartSetup} disabled={loading} size="sm" className="h-8 text-xs">
              {loading ? "Đang tạo mã..." : "Thiết lập xác thực 2 lớp ngay"}
            </Button>
          </div>
        )}

        {setupStep === "SCAN" && qrCodeUrl && (
          <div className="space-y-4 pt-1">
            <p className="text-xs text-muted-foreground">
              Bước 1: Mở ứng dụng Authenticator trên điện thoại và quét mã QR bên dưới, hoặc nhập khóa thủ công.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-purple-500/[0.04] dark:bg-white/[0.03] border border-border/70">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 rounded-lg bg-white p-2 border border-border/60 shadow-sm" />
              <div className="space-y-3 text-xs w-full">
                <div>
                  <span className="text-muted-foreground block mb-1">Khóa bí mật thủ công:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-foreground text-xs select-all bg-purple-500/10 dark:bg-white/10 px-2.5 py-1 rounded-md border border-purple-500/20 dark:border-white/15">
                      {secretKey}
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={copySecret} className="h-7 px-2.5 text-[11px]">
                      {copiedKey ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiedKey ? "Đã chép" : "Sao chép"}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block">Tài khoản:</span>
                  <span className="font-mono text-foreground font-medium">admin@example.com</span>
                </div>
              </div>
            </div>

            {/* Bước 2: Nhập mã xác nhận */}
            <form onSubmit={handleVerify2FA} className="space-y-3 max-w-sm pt-1">
              <label className="text-xs font-medium text-foreground">
                Bước 2: Nhập mã 6 chữ số hiển thị trên ứng dụng để kích hoạt
              </label>
              <div className="flex gap-2">
                <Input
                  required
                  placeholder="123456"
                  maxLength={6}
                  className="font-mono tracking-widest text-center text-sm h-9"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                />
                <Button type="submit" size="sm" disabled={loading} className="h-9 text-xs shrink-0">
                  {loading ? "Kiểm tra..." : "Xác nhận & Bật"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSetupStep("IDLE")}
                  className="h-9 text-xs shrink-0 text-muted-foreground"
                >
                  Hủy
                </Button>
              </div>
            </form>

            {/* Mã dự phòng */}
            {backupCodes.length > 0 && (
              <div className="p-4 rounded-xl bg-purple-500/[0.04] dark:bg-white/[0.03] border border-border/70 space-y-2">
                <span className="text-xs font-semibold text-foreground">Mã dự phòng khẩn cấp:</span>
                <p className="text-[11px] text-muted-foreground">
                  Lưu các mã này ở nơi an toàn. Mỗi mã chỉ dùng được 1 lần nếu mất thiết bị:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs text-foreground">
                  {backupCodes.map((c, i) => (
                    <div key={i} className="p-1.5 rounded-lg bg-card border border-border/70 text-center font-medium shadow-xs">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {setupStep === "ENABLED" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Xác thực 2 lớp (TOTP RFC 6238) đã được kích hoạt và đang bảo vệ tài khoản của bạn.</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button onClick={handleStartSetup} disabled={loading} variant="outline" size="sm" className="h-8 text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Thiết lập lại mã 2FA mới
              </Button>
              <Button onClick={handleDisable2FA} disabled={loading} variant="ghost" size="sm" className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 dark:hover:bg-red-500/20">
                <PowerOff className="w-3.5 h-3.5 mr-1.5" />
                Tắt xác thực 2 lớp
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
