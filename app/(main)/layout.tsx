import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import ThemProvider from "@/components/AppShell";
import AuthProvider from "@/components/AuthProvider";
import { AppToaster } from "@/components/providers/app-toaster";
import ThemeProvider from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Equipment Management Dashboard | EMS",
  description:
    "Enterprise Equipment Management System — Monitor, manage, and analyze manufacturing equipment across all factories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full antialiased">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
          <AppToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
