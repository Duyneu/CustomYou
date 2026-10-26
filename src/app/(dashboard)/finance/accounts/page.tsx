"use client";

import React, { useState, useEffect } from "react";
import { Plus, Wallet, Building2, CreditCard, Banknote, Shield, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/formatters";

interface AccountItem {
  id: string;
  name: string;
  type: "BANK" | "CASH" | "E_WALLET" | "CREDIT_CARD" | "INVESTMENT";
  bankCode?: string | null;
  accountNumberMasked?: string | null;
  balance: string;
  currency: string;
  isExcludedFromTotal: boolean;
  isActive: boolean;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"BANK" | "CASH" | "E_WALLET" | "CREDIT_CARD">("BANK");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/finance/accounts");
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/finance/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          bankCode: type === "BANK" ? bankCode : null,
          accountNumber: accountNumber || null,
          initialBalance: parseInt(initialBalance.replace(/\D/g, "") || "0", 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tạo tài khoản");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setName("");
      setBankCode("");
      setAccountNumber("");
      setInitialBalance("0");
      fetchAccounts();
    } catch (err: any) {
      setError("Đã xảy ra lỗi khi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hoặc lưu trữ tài khoản này?")) return;

    try {
      const res = await fetch(`/api/finance/accounts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAccounts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalBalance = accounts
    .filter((a) => !a.isExcludedFromTotal)
    .reduce((sum, a) => sum + BigInt(a.balance || 0), 0n);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Ví và tài khoản ngân hàng
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý các nguồn tiền cá nhân. Số tài khoản được che dấu bảo mật theo chuẩn Nghị định 13/2023/NĐ-CP.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Thêm tài khoản
        </Button>
      </div>

      {/* Tổng tài sản tóm tắt */}
      <div className="p-5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground block">Tổng số dư khả dụng</span>
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatVND(totalBalance.toString())}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div>
            Số tài khoản: <span className="font-mono text-foreground font-medium">{accounts.length}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Mã hóa AES-256</span>
          </div>
        </div>
      </div>

      {/* Danh sách tài khoản */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-xs font-medium text-muted-foreground flex justify-between items-center">
          <span>Tên và nguồn tiền</span>
          <span>Số dư khả dụng</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Đang tải dữ liệu...</div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Chưa có tài khoản nào. Nhấn "Thêm tài khoản" để bắt đầu theo dõi.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {accounts.map((acc) => (
              <div key={acc.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground shrink-0">
                    {acc.type === "BANK" && <Building2 className="w-4 h-4" />}
                    {acc.type === "E_WALLET" && <CreditCard className="w-4 h-4" />}
                    {acc.type === "CASH" && <Banknote className="w-4 h-4" />}
                    {acc.type === "CREDIT_CARD" && <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground flex items-center gap-2">
                      <span>{acc.name}</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                        {acc.type === "BANK" ? "Ngân hàng" : acc.type === "E_WALLET" ? "Ví điện tử" : "Tiền mặt"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {acc.bankCode ? `${acc.bankCode} / ` : ""}
                      {acc.accountNumberMasked || "Tiền mặt trực tiếp"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold font-mono text-foreground">
                      {formatVND(acc.balance)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">VND</div>
                  </div>

                  <button
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="p-1.5 rounded text-muted-foreground hover:text-red-600 transition-colors"
                    title="Xóa tài khoản"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Thêm tài khoản */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Thêm nguồn tiền mới</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Loại nguồn tiền</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("BANK")}
                    className={`py-2 px-3 text-xs rounded-md border font-medium ${
                      type === "BANK" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Ngân hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("E_WALLET")}
                    className={`py-2 px-3 text-xs rounded-md border font-medium ${
                      type === "E_WALLET" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Ví điện tử
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("CASH")}
                    className={`py-2 px-3 text-xs rounded-md border font-medium ${
                      type === "CASH" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Tiền mặt
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tên gọi gợi nhớ</label>
                <Input
                  required
                  placeholder="Ví dụ: VCB Lương, MoMo ăn uống"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {type === "BANK" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Mã ngân hàng</label>
                    <Input
                      placeholder="VCB, TCB, MB, ACB..."
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Số tài khoản</label>
                    <Input
                      placeholder="•••• 1234"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Số dư ban đầu (VND)</label>
                <Input
                  type="text"
                  placeholder="0"
                  className="font-mono"
                  value={initialBalance}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setInitialBalance(raw ? new Intl.NumberFormat("vi-VN").format(parseInt(raw, 10)) : "0");
                  }}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Đang lưu..." : "Xác nhận tạo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
