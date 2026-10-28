import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== "undefined") {
                const origRemove = Node.prototype.removeChild;
                Node.prototype.removeChild = function(child) {
                  if (child.parentNode !== this) {
                    if (child.parentNode) return child.parentNode.removeChild(child);
                    return child;
                  }
                  return origRemove.call(this, child);
                };
                const origInsert = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function(newNode, refNode) {
                  if (refNode && refNode.parentNode !== this) {
                    if (refNode.parentNode) return refNode.parentNode.insertBefore(newNode, refNode);
                    return newNode;
                  }
                  return origInsert.call(this, newNode, refNode);
                };
              }
            `,
          }}
        />
      </head>
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
