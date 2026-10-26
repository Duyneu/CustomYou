"use client";

import React, { useState } from "react";
import { Shield, Download, Trash2, AlertTriangle, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PrivacySettingsPage() {
  const [downloading, setDownloading] = useState(false);
  const [purgePassword, setPurgePassword] = useState("");
  const [purging, setPurging] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);

  const handleExportData = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/user/export-data");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `myhub_personal_data_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePurgeData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("HÀNH ĐỘNG NÀY KHÔNG THỂ HOÀN TÁC! Toàn bộ lịch sử giao dịch, tài khoản và ghi chú sẽ bị xóa sạch. Bạn có chắc chắn không?")) {
      return;
    }

    setPurging(true);
    setPurgeError(null);
    setPurgeSuccess(null);

    try {
      const res = await fetch("/api/user/purge-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: purgePassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPurgeError(data.error || "Không thể xóa dữ liệu");
      } else {
        setPurgeSuccess(data.message || "Toàn bộ dữ liệu đã được dọn sạch.");
        setPurgePassword("");
      }
    } catch (err: any) {
      setPurgeError(err.message || "Lỗi kết nối");
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Quyền riêng tư & Bảo vệ dữ liệu cá nhân
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Thực hiện quyền kiểm soát dữ liệu độc lập theo tinh thần Nghị định 13/2023/NĐ-CP của Chính phủ.
        </p>
      </div>

      {/* Thông tin chính sách bảo mật */}
      <div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Cam kết quyền riêng tư dữ liệu
            </h2>
            <p className="text-[11px] text-muted-foreground">Bảo vệ thông tin cá nhân và dữ liệu số</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
          MyHub được thiết kế theo mô hình single-user cá nhân độc lập. Mọi dữ liệu tài chính, số tài khoản ngân hàng đều được mã hóa bằng thuật toán chuẩn công nghiệp AES-256-GCM. Không có bên thứ ba nào có quyền truy cập vào thông tin của bạn.
        </p>
      </div>

      {/* Xuất dữ liệu cá nhân */}
      <div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Xuất toàn bộ dữ liệu cá nhân (Data Portability)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tải về toàn bộ lịch sử tài chính, tài khoản, việc cần làm và ghi chú dưới định dạng JSON có cấu trúc.
            </p>
          </div>

          <Button
            onClick={handleExportData}
            disabled={downloading}
            size="sm"
            className="gap-1.5 h-9 text-xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Đang trích xuất..." : "Tải file dữ liệu JSON"}
          </Button>
        </div>
      </div>

      {/* Xóa toàn bộ dữ liệu */}
      <div className="p-6 rounded-2xl glass-card border-red-500/30 dark:border-red-500/25 space-y-4">
        <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              Vùng nguy hiểm: Xóa toàn bộ dữ liệu (Right to be Forgotten)
            </h3>
            <p className="text-[11px] text-muted-foreground">Thao tác này sẽ xóa vĩnh viễn và không thể khôi phục</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Thực hiện quyền được quên lãng và xóa sạch vĩnh viễn toàn bộ các bản ghi tài chính, giao dịch, ngân sách, thói quen và ghi chú khỏi cơ sở dữ liệu. Thao tác này là không thể hoàn tác.
        </p>

        {purgeError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
            {purgeError}
          </div>
        )}

        {purgeSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{purgeSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePurgeData} className="flex flex-col sm:flex-row gap-3 pt-2">
          <Input
            type="password"
            placeholder="Nhập mật khẩu tài khoản để xác nhận xóa..."
            required
            value={purgePassword}
            onChange={(e) => setPurgePassword(e.target.value)}
            className="h-9 text-xs max-w-sm"
          />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={purging}
            className="h-9 text-xs gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {purging ? "Đang xử lý xóa..." : "Xác nhận xóa vĩnh viễn"}
          </Button>
        </form>
      </div>
    </div>
  );
}
