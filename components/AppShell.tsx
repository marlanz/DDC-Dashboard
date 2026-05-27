"use client";

import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import { useSidebarStore } from "@/lib/store/useSidebarStore";

interface AppShellProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: AppShellProps) {
  const { darkMode, setDarkMode, hydrated } = useSidebarStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!hydrated) return null;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "var(--color-background)",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Global header */}
        <TopHeader
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
        />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            background: "var(--color-background)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
