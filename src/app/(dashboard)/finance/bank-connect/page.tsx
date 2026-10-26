"use client";

import React, { useState, useEffect } from "react";
import { Building2, QrCode, Shield, Copy, Check, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateVietQrUrl } from "@/lib/bank-providers/vietqr";
import { formatVND } from "@/lib/formatters";

interface AccountItem {
  id: string;
  name: string;
  type: string;
  bankCode?: string | null;
  accountNumberMasked?: string | null;
}

export default function BankConnectPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [selectedAccId, setSelectedAccId] = useState("");
  const [qrAmount, setQrAmount] = useState("50000");
  const [qrNote, setQrNote] = useState("MyHub chuyen khoan");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Webhook Test simulation state
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/finance/accounts")
      .then((res) => res.json())
      .then((data) => {
        const bankAccs = (data.accounts || []).filter((a: any) => a.type === "BANK");
        setAccounts(bankAccs);
        if (bankAccs.length > 0) {
          setSelectedAccId(bankAccs[0].id);
        }
      });
  }, []);

  const selectedAccount = accounts.find((a) => a.id === selectedAccId);

  const qrImageUrl = selectedAccount
    ? generateVietQrUrl({
        bankCode: selectedAccount.bankCode || "VCB",
        accountNumber: "1028475938", // Fallback test
        accountName: "NGUYEN VAN A",
        amount: parseInt(qrAmount.replace(/\D/g, "") || "0", 10),
        description: qrNote,
        template: "compact2",
      })
    : "";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    setSimResult(null);

    try {
      const res = await fetch("/api/webhooks/bank/sepay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer REDACTED_SECRET",
        },
        body: JSON.stringify({
          id: `SIM_${Date.now()}`,
          gateway: selectedAccount?.bankCode || "VCB",
          transactionDate: new Date().toISOString(),
          accountNumber: "1028475938",
          transferType: "in",
          transferAmount: 250000,
          content: "Thanh toan hoa don Grab test webhook",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSimResult(`Mô phỏng thành công: Đã ghi nhận giao dịch +250.000 ₫ và tự động phân loại!`);
      } else {
        setSimResult(`Lỗi: ${data.error || "Không thể thực hiện"}`);
      }
    } catch (err: any) {
      setSimResult(`Lỗi kết nối: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Kết nối ngân hàng & VietQR
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Kiến trúc Adapter tích hợp qua Webhook (Casso/SePay) và tạo mã QR chuyển khoản chuẩn Napas 247.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Cấu hình Webhook Adapter */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Webhook endpoints */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h2 className="text-sm font-semibold text-foreground">
                  Webhook Endpoints tự động
                </h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                Idempotent & HMAC
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Cung cấp các endpoint này cho tài khoản Casso.vn hoặc SePay.vn của bạn. Hệ thống sẽ nhận biến động số dư theo thời gian thực và tự động khớp danh mục.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>SePay Webhook URL</span>
                  <button
                    onClick={() => copyToClipboard("/api/webhooks/bank/sepay", "sepay")}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {copiedUrl === "sepay" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl === "sepay" ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/5 dark:bg-white/[0.04] font-mono text-xs text-foreground select-all border border-purple-500/15 dark:border-white/10">
                  https://your-domain.vercel.app/api/webhooks/bank/sepay
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Casso Webhook URL</span>
                  <button
                    onClick={() => copyToClipboard("/api/webhooks/bank/casso", "casso")}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {copiedUrl === "casso" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl === "casso" ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/5 dark:bg-white/[0.04] font-mono text-xs text-foreground select-all border border-purple-500/15 dark:border-white/10">
                  https://your-domain.vercel.app/api/webhooks/bank/casso
                </div>
              </div>
            </div>

            {/* Test Simulation Button */}
            <div className="pt-3 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground font-medium">
                Kiểm tra giả lập Webhook tới hệ thống:
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateWebhook}
                disabled={simulating}
                className="gap-1.5 h-8 text-xs shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                {simulating ? "Đang gửi..." : "Gửi thử nghiệm (+250k)"}
              </Button>
            </div>

            {simResult && (
              <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-white/[0.05] border border-purple-500/20 dark:border-white/15 text-xs font-mono text-foreground">
                {simResult}
              </div>
            )}
          </div>

          {/* Chính sách bảo mật tài khoản */}
          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tiêu chuẩn bảo mật và quyền riêng tư</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              MyHub tuân thủ nguyên tắc không lưu trữ mật khẩu, tên đăng nhập hoặc mã OTP ngân hàng. Dữ liệu chỉ được tiếp nhận một chiều qua Webhook đối soát hoặc file sao kê của chính bạn.
            </p>
          </div>
        </div>

        {/* Cột phải: Trình tạo mã VietQR */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h2 className="text-sm font-semibold text-foreground">
                  Tạo mã VietQR nhận tiền
                </h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                Napas 247
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tài khoản nhận</label>
                <select
                  value={selectedAccId}
                  onChange={(e) => setSelectedAccId(e.target.value)}
                  className="w-full h-8 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.bankCode || "VCB"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Số tiền yêu cầu (VND)</label>
                <Input
                  className="font-mono text-xs h-8"
                  value={qrAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setQrAmount(raw ? new Intl.NumberFormat("vi-VN").format(parseInt(raw, 10)) : "");
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Nội dung chuyển khoản</label>
                <Input
                  className="text-xs h-8"
                  value={qrNote}
                  onChange={(e) => setQrNote(e.target.value)}
                />
              </div>
            </div>

            {/* QR Preview Box */}
            <div className="p-4 rounded-lg border border-border bg-muted/20 flex flex-col items-center justify-center space-y-3">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="VietQR Transfer"
                  className="w-48 h-auto rounded-lg border border-border bg-white p-2"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                  Chưa có tài khoản ngân hàng để tạo QR
                </div>
              )}
              <div className="text-center">
                <div className="text-xs font-mono font-medium text-foreground">
                  {formatVND(qrAmount.replace(/\D/g, "") || "0")}
                </div>
                <div className="text-[11px] text-muted-foreground">{qrNote}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
