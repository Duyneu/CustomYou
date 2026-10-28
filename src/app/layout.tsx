import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { DomGuard } from "@/components/providers/dom-guard";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "CUSTOM YOU — Personalization Platform",
  description: "Bảng điều khiển cá nhân hóa: Quản lý học tập, công việc, theo dõi chi tiêu và thói quen.",
  other: {
    google: "notranslate",
  },
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
    <html lang="vi" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider defaultTheme="dark">
            <DomGuard />
            <div className="min-h-screen bg-background text-foreground antialiased">
              {children}
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
