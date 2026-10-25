"use client";

import React, { useState, useEffect } from "react";
import { Upload, FileSpreadsheet, Check, AlertCircle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/formatters";

interface AccountOption {
  id: string;
  name: string;
}

interface ParsedPreviewRow {
  date: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string;
  externalTxId?: string;
}

export default function CsvImportPage() {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);

  // Column Mapping
  const [dateCol, setDateCol] = useState(0);
  const [amountCol, setAmountCol] = useState(1);
  const [noteCol, setNoteCol] = useState(2);
  const [txIdCol, setTxIdCol] = useState<number | -1>(-1);

  // Status
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/finance/accounts")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0) {
          setSelectedAccountId(data.accounts[0].id);
        }
      });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setImportResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      setFileContent(text);

      // Phân tách CSV đơn giản
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        setError("File CSV cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu.");
        return;
      }

      const parsedHeaders = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim());
      const rows = lines.slice(1).map((l) => l.split(",").map((c) => c.replace(/^["']|["']$/g, "").trim()));

      setHeaders(parsedHeaders);
      setRawRows(rows);

      // Tự động nhận diện cột thông minh theo tên tiêu đề
      parsedHeaders.forEach((h, idx) => {
        const lower = h.toLowerCase();
        if (lower.includes("ngày") || lower.includes("date") || lower.includes("time")) {
          setDateCol(idx);
        } else if (lower.includes("tiền") || lower.includes("amount") || lower.includes("số dư")) {
          setAmountCol(idx);
        } else if (lower.includes("nội dung") || lower.includes("mô tả") || lower.includes("desc") || lower.includes("note")) {
          setNoteCol(idx);
        } else if (lower.includes("mã") || lower.includes("id") || lower.includes("tid")) {
          setTxIdCol(idx);
        }
      });
    };
    reader.readAsText(file);
  };

  // Preview dòng
  const previewRows: ParsedPreviewRow[] = rawRows.slice(0, 5).map((row) => {
    const rawAmtStr = (row[amountCol] || "0").replace(/[^0-9.-]/g, "");
    const rawAmt = parseFloat(rawAmtStr) || 0;
    const isIncome = rawAmt > 0;
    const dateVal = row[dateCol] || new Date().toISOString().split("T")[0];
    const noteVal = row[noteCol] || "Giao dịch sao kê";
    const txIdVal = txIdCol >= 0 ? row[txIdCol] : undefined;

    return {
      date: dateVal,
      amount: Math.abs(rawAmt),
      type: isIncome ? "INCOME" : "EXPENSE",
      note: noteVal,
      externalTxId: txIdVal,
    };
  });

  const handleConfirmImport = async () => {
    if (!selectedAccountId) {
      setError("Vui lòng chọn tài khoản đích");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const allParsedRows: ParsedPreviewRow[] = rawRows.map((row) => {
        const rawAmtStr = (row[amountCol] || "0").replace(/[^0-9.-]/g, "");
        const rawAmt = parseFloat(rawAmtStr) || 0;
        return {
          date: row[dateCol] || new Date().toISOString().split("T")[0],
          amount: Math.abs(rawAmt),
          type: rawAmt > 0 ? "INCOME" : "EXPENSE",
          note: row[noteCol] || "Giao dịch sao kê",
          externalTxId: txIdCol >= 0 ? row[txIdCol] : undefined,
        };
      });

      const res = await fetch("/api/finance/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountId,
          rows: allParsedRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Nhập sao kê thất bại");
      } else {
        setImportResult(data.message || `Đã nhập thành công ${data.imported} giao dịch.`);
        setRawRows([]);
        setFileContent(null);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Nhập sao kê ngân hàng (CSV)
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tải lên sao kê xuất từ Vietcombank, Techcombank, MB Bank hoặc MoMo để đối soát và tự động phân loại.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {importResult && (
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{importResult}</span>
        </div>
      )}

      {/* Bước 1: Chọn tài khoản và tải file */}
      <div className="p-5 rounded-lg border border-border bg-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Tài khoản nhận giao dịch
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full h-8 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Chọn file sao kê định dạng .csv
            </label>
            <Input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="h-8 text-xs file:text-xs file:py-0 file:px-2"
            />
          </div>
        </div>
      </div>

      {/* Bước 2: Mapping cột & Preview nếu đã tải file */}
      {headers.length > 0 && rawRows.length > 0 && (
        <div className="space-y-6">
          {/* Mapping Columns Card */}
          <div className="p-5 rounded-lg border border-border bg-card space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <FileSpreadsheet className="w-4 h-4 text-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Khớp các cột dữ liệu (Column Mapping)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Cột ngày</label>
                <select
                  value={dateCol}
                  onChange={(e) => setDateCol(parseInt(e.target.value, 10))}
                  className="w-full h-8 text-xs px-2 rounded-md border border-input bg-background text-foreground"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Cột số tiền</label>
                <select
                  value={amountCol}
                  onChange={(e) => setAmountCol(parseInt(e.target.value, 10))}
                  className="w-full h-8 text-xs px-2 rounded-md border border-input bg-background text-foreground"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Cột nội dung/mô tả</label>
                <select
                  value={noteCol}
                  onChange={(e) => setNoteCol(parseInt(e.target.value, 10))}
                  className="w-full h-8 text-xs px-2 rounded-md border border-input bg-background text-foreground"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Mã GD (chống trùng)</label>
                <select
                  value={txIdCol}
                  onChange={(e) => setTxIdCol(parseInt(e.target.value, 10))}
                  className="w-full h-8 text-xs px-2 rounded-md border border-input bg-background text-foreground"
                >
                  <option value={-1}>Không có mã</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Xem trước {previewRows.length} trên tổng số {rawRows.length} dòng
              </span>
              <Button
                onClick={handleConfirmImport}
                disabled={importing}
                size="sm"
                className="h-8 text-xs gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {importing ? "Đang xử lý..." : `Xác nhận nhập ${rawRows.length} giao dịch`}
              </Button>
            </div>

            <div className="divide-y divide-border">
              {previewRows.map((row, idx) => (
                <div key={idx} className="px-4 py-2.5 grid grid-cols-12 gap-2 text-xs items-center">
                  <div className="col-span-2 font-mono text-muted-foreground">{row.date}</div>
                  <div className="col-span-6 font-medium text-foreground truncate">{row.note}</div>
                  <div className="col-span-4 text-right font-mono font-medium">
                    {row.type === "INCOME" ? (
                      <span className="text-emerald-600 dark:text-emerald-400">+{formatVND(row.amount)}</span>
                    ) : (
                      <span className="text-foreground">-{formatVND(row.amount)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
