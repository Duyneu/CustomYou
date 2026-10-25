"use client";

import React, { useState, useEffect } from "react";
import { Plus, Scale, ArrowDownRight, ArrowUpRight, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatDateVN } from "@/lib/formatters";

interface DebtItem {
  id: string;
  type: "BORROWED" | "LENT";
  counterpartyName: string;
  totalAmount: string;
  paidAmount: string;
  dueDate?: string | null;
  status: "ACTIVE" | "SETTLED" | "OVERDUE";
  note?: string | null;
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [type, setType] = useState<"BORROWED" | "LENT">("LENT");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = async () => {
    try {
      const res = await fetch("/api/finance/debts");
      const data = await res.json();
      if (res.ok) setDebts(data.debts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const rawAmt = parseInt(totalAmount.replace(/\D/g, "") || "0", 10);
      const res = await fetch("/api/finance/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          counterpartyName,
          totalAmount: rawAmt,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tạo khoản nợ");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setCounterpartyName("");
      setTotalAmount("");
      setNote("");
      fetchDebts();
    } catch (err: any) {
      setError(err.message || "Lỗi tạo khoản nợ");
    } finally {
      setSubmitting(false);
    }
  };

  const totalLent = debts
    .filter((d) => d.type === "LENT" && d.status === "ACTIVE")
    .reduce((sum, d) => sum + (BigInt(d.totalAmount) - BigInt(d.paidAmount)), 0n);

  const totalBorrowed = debts
    .filter((d) => d.type === "BORROWED" && d.status === "ACTIVE")
    .reduce((sum, d) => sum + (BigInt(d.totalAmount) - BigInt(d.paidAmount)), 0n);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Sổ ghi nợ & cho vay
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi ai nợ bạn và các khoản bạn cần thanh toán với hạn trả rõ ràng.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Ghi nhận khoản nợ
        </Button>
      </div>

      {/* Tóm tắt 2 bên */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card space-y-1">
          <span className="text-xs text-muted-foreground">Người khác nợ bạn (Cần thu)</span>
          <div className="text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">
            {formatVND(totalLent.toString())}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card space-y-1">
          <span className="text-xs text-muted-foreground">Bạn nợ người khác (Cần trả)</span>
          <div className="text-2xl font-semibold font-mono text-foreground">
            {formatVND(totalBorrowed.toString())}
          </div>
        </div>
      </div>

      {/* Danh sách khoản nợ */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground grid grid-cols-12 gap-2">
          <span className="col-span-4">Đối tác & Ghi chú</span>
          <span className="col-span-3">Hạn thanh toán</span>
          <span className="col-span-3 text-right">Số tiền còn lại</span>
          <span className="col-span-2 text-right">Trạng thái</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Đang tải danh sách nợ...</div>
        ) : debts.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Không có khoản nợ hoặc cho vay nào cần theo dõi.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {debts.map((debt) => {
              const remaining = BigInt(debt.totalAmount) - BigInt(debt.paidAmount);
              return (
                <div
                  key={debt.id}
                  className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-muted/20 transition-colors text-xs"
                >
                  <div className="col-span-4 min-w-0">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{debt.counterpartyName}</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                        {debt.type === "LENT" ? "Cho vay" : "Đi vay"}
                      </Badge>
                    </div>
                    {debt.note && (
                      <div className="text-muted-foreground truncate mt-0.5">{debt.note}</div>
                    )}
                  </div>

                  <div className="col-span-3 font-mono text-muted-foreground">
                    {debt.dueDate ? formatDateVN(debt.dueDate) : "Không có hạn"}
                  </div>

                  <div className="col-span-3 text-right font-mono font-semibold text-foreground">
                    {formatVND(remaining.toString())}
                  </div>

                  <div className="col-span-2 text-right">
                    <Badge variant={debt.status === "ACTIVE" ? "outline" : "success"} className="text-[10px]">
                      {debt.status === "ACTIVE" ? "Đang mở" : "Đã tất toán"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Thêm khoản nợ / cho vay</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateDebt} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("LENT")}
                  className={`py-2 px-3 text-xs rounded-md border font-medium ${
                    type === "LENT" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Cho người khác vay
                </button>
                <button
                  type="button"
                  onClick={() => setType("BORROWED")}
                  className={`py-2 px-3 text-xs rounded-md border font-medium ${
                    type === "BORROWED" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Tôi vay người khác
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tên đối tác (Người vay / Chủ nợ)</label>
                <Input
                  required
                  placeholder="VD: Anh Nam, Bạn Trang..."
                  value={counterpartyName}
                  onChange={(e) => setCounterpartyName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Số tiền (VND)</label>
                <Input
                  required
                  placeholder="0"
                  className="font-mono text-base font-semibold"
                  value={totalAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setTotalAmount(raw ? new Intl.NumberFormat("vi-VN").format(parseInt(raw, 10)) : "");
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Hạn trả nợ (Tùy chọn)</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Ghi chú</label>
                <Input
                  placeholder="Lý do vay, thỏa thuận..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Đang lưu..." : "Xác nhận ghi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
