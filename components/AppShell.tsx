"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [darkMode, setDarkMode] = useState(false);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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
          onToggleDark={() => setDarkMode((d) => !d)}
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
