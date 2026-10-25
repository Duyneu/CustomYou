"use client";

import React, { useState, useEffect } from "react";
import { Plus, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Trash2, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatVND, formatDateVN } from "@/lib/formatters";

interface TransactionItem {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: string;
  date: string;
  note?: string | null;
  source: "MANUAL" | "WEBHOOK" | "CSV_IMPORT";
  account: { id: string; name: string; bankCode?: string | null; type: string };
  category?: { id: string; name: string; color?: string | null } | null;
}

interface AccountOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
  type: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterType, setFilterType] = useState<string>("");
  const [filterAccount, setFilterAccount] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [txType, setTxType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [accountId, setAccountId] = useState("");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (filterType) queryParams.set("type", filterType);
      if (filterAccount) queryParams.set("accountId", filterAccount);
      if (filterCategory) queryParams.set("categoryId", filterCategory);
      if (search) queryParams.set("search", search);

      const [txRes, accRes, catRes] = await Promise.all([
        fetch(`/api/finance/transactions?${queryParams.toString()}`),
        fetch("/api/finance/accounts"),
        fetch("/api/finance/categories"),
      ]);

      const txData = await txRes.json();
      const accData = await accRes.json();
      const catData = await catRes.json();

      if (txRes.ok) {
        setTransactions(txData.transactions || []);
        setTotal(txData.pagination?.total || 0);
        setTotalPages(txData.pagination?.totalPages || 1);
      }
      if (accRes.ok) {
        setAccounts(accData.accounts || []);
        if (!accountId && accData.accounts?.length > 0) {
          setAccountId(accData.accounts[0].id);
        }
      }
      if (catRes.ok) {
        setCategories(catData.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filterType, filterAccount, filterCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const rawAmount = parseInt(amount.replace(/\D/g, "") || "0", 10);
      if (rawAmount <= 0) {
        setError("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          targetAccountId: txType === "TRANSFER" ? targetAccountId : null,
          categoryId: txType !== "TRANSFER" && categoryId ? categoryId : null,
          amount: rawAmount,
          type: txType,
          date: new Date(date).toISOString(),
          note: note.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tạo giao dịch");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setAmount("");
      setNote("");
      setCategoryId("");
      fetchData();
    } catch (err) {
      setError("Đã xảy ra lỗi khi tạo giao dịch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này? Số dư tài khoản sẽ được hoàn tác.")) return;

    try {
      const res = await fetch(`/api/finance/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Lịch sử giao dịch
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ghi nhận thu chi, chuyển khoản nội bộ và tự động phân loại bằng luật từ khóa.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Ghi giao dịch
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-lg border border-border bg-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm nội dung (Grab, Highlands, Lương...)"
              className="pl-8 text-xs h-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="h-8 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
          >
            <option value="">Tất cả loại giao dịch</option>
            <option value="EXPENSE">Khoản chi</option>
            <option value="INCOME">Khoản thu</option>
            <option value="TRANSFER">Chuyển khoản</option>
          </select>

          <select
            value={filterAccount}
            onChange={(e) => { setFilterAccount(e.target.value); setPage(1); }}
            className="h-8 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
          >
            <option value="">Tất cả tài khoản</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="h-8 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <Button type="submit" variant="secondary" size="sm" className="h-8 text-xs">
            Lọc
          </Button>
        </form>
      </div>

      {/* Transaction List */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground grid grid-cols-12 gap-2">
          <span className="col-span-2">Ngày</span>
          <span className="col-span-3">Nội dung & Danh mục</span>
          <span className="col-span-3">Nguồn tiền</span>
          <span className="col-span-3 text-right">Số tiền</span>
          <span className="col-span-1 text-center">Thao tác</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Đang tải danh sách giao dịch...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Chưa tìm thấy giao dịch nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-muted/30 transition-colors text-xs"
              >
                {/* Ngày */}
                <div className="col-span-2 font-mono text-muted-foreground">
                  {formatDateVN(tx.date)}
                </div>

                {/* Nội dung & Danh mục */}
                <div className="col-span-3 min-w-0 pr-2">
                  <div className="font-medium text-foreground truncate">
                    {tx.note || (tx.type === "TRANSFER" ? "Chuyển khoản nội bộ" : "Giao dịch không tên")}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    {tx.category ? (
                      <span className="truncate">{tx.category.name}</span>
                    ) : (
                      <span className="italic">Chưa phân loại</span>
                    )}
                    {tx.source === "WEBHOOK" && (
                      <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                        Webhook
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Nguồn tiền */}
                <div className="col-span-3 text-muted-foreground truncate">
                  {tx.type === "TRANSFER" ? (
                    <div className="flex items-center gap-1">
                      <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                      <span>{tx.account.name}</span>
                    </div>
                  ) : (
                    <span>{tx.account.name}</span>
                  )}
                </div>

                {/* Số tiền */}
                <div className="col-span-3 text-right font-mono font-medium">
                  {tx.type === "EXPENSE" && (
                    <span className="text-foreground">
                      -{formatVND(tx.amount)}
                    </span>
                  )}
                  {tx.type === "INCOME" && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{formatVND(tx.amount)}
                    </span>
                  )}
                  {tx.type === "TRANSFER" && (
                    <span className="text-muted-foreground">
                      {formatVND(tx.amount)}
                    </span>
                  )}
                </div>

                {/* Thao tác */}
                <div className="col-span-1 text-center">
                  <button
                    onClick={() => handleDeleteTransaction(tx.id)}
                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Xóa giao dịch"
                  >
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Tổng số <span className="font-mono text-foreground">{total}</span> giao dịch
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-7 text-xs"
              >
                Trang trước
              </Button>
              <span className="font-mono">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="h-7 text-xs"
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm giao dịch */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Ghi nhận giao dịch mới</h2>
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

            <form onSubmit={handleCreateTransaction} className="space-y-3.5">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType("EXPENSE")}
                  className={`py-2 px-3 text-xs rounded-md border font-medium ${
                    txType === "EXPENSE" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Khoản chi
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("INCOME")}
                  className={`py-2 px-3 text-xs rounded-md border font-medium ${
                    txType === "INCOME" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Khoản thu
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("TRANSFER")}
                  className={`py-2 px-3 text-xs rounded-md border font-medium ${
                    txType === "TRANSFER" ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Chuyển khoản
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Số tiền (VND)</label>
                <Input
                  required
                  placeholder="0"
                  className="font-mono text-base font-semibold"
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setAmount(raw ? new Intl.NumberFormat("vi-VN").format(parseInt(raw, 10)) : "");
                  }}
                />
              </div>

              {/* Accounts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    {txType === "TRANSFER" ? "Tài khoản nguồn" : "Tài khoản / Ví"}
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full h-9 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
                    required
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {txType === "TRANSFER" ? (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Tài khoản đích</label>
                    <select
                      value={targetAccountId}
                      onChange={(e) => setTargetAccountId(e.target.value)}
                      className="w-full h-9 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
                      required
                    >
                      <option value="">Chọn tài khoản đích</option>
                      {accounts.filter((a) => a.id !== accountId).map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Danh mục (hoặc tự động nhận diện)</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-9 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="">Tự động áp dụng luật quy tắc</option>
                      {categories
                        .filter((c) => c.type === txType)
                        .map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Date & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Ngày giao dịch</label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Nội dung ghi chú</label>
                  <Input
                    placeholder="VD: Grab Car, Cà phê Highlands..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
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
