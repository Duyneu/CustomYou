import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "CUSTOM YOU — Personalization Platform",
  description: "Bảng điều khiển cá nhân hóa: Quản lý tài chính, ngân sách, năng suất và kết nối ngân hàng an toàn.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider defaultTheme="dark">
            <div className="min-h-screen bg-background text-foreground antialiased">
              {children}
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
