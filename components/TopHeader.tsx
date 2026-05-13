"use client";

import { useState } from "react";
import { Download, Sun, Moon, ChevronDown, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import Image from "next/image";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { authClient } from "@/lib/auth-client";

interface TopHeaderProps {
  darkMode?: boolean;
  onToggleDark?: () => void;
  onSearchChange?: (v: string) => void;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/equipments": "Equipment Registry",
  "/factories": "Factory Management",
  "/workcenters": "Work Centers",
  "/maintenance": "Maintenance Schedule",
  "/reports": "Reports & Analytics",
  "/import": "Import Excel",
  "/settings": "System Settings",
};

export default function TopHeader({ darkMode, onToggleDark }: TopHeaderProps) {
  // Removed unused notifOpen state
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const path = usePathname();
  const router = useRouter();

  const avatar = user?.image;

  return (
    <header
      style={{
        height: "56px",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: "12px",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Page title */}
      <div style={{ flex: "0 0 auto" }}>
        <h1
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          {PAGE_TITLES[path]}
        </h1>
      </div>

      <div style={{ flex: 1 }} />

      {/* Export button */}
      {path === "/dashboard" && (
        <button
          className="btn-brand"
          style={{ height: "34px", fontSize: "13px" }}
        >
          <Download size={14} />
          Export Report
        </button>
      )}

      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        className="btn-ghost"
        style={{ height: "34px", padding: "0 10px" }}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications */}
      {/* <div style={{ position: "relative" }}>
        <button
          className="btn-ghost"
          style={{ height: "34px", padding: "0 10px", position: "relative" }}
          onClick={() => setNotifOpen(!notifOpen)}
          title="Notifications"
        >
          <Bell size={16} />
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              background: "rgb(233,34,39)",
              borderRadius: "50%",
              border: "2px solid var(--color-surface)",
            }}
          />
        </button>
      </div> */}

      {/* User avatar */}
      <button
        className="btn-ghost"
        style={{ height: "34px", padding: "0 10px", gap: "8px" }}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {avatar && (
          <Image
            src={avatar}
            alt={user.name || "User avatar"}
            width={26}
            height={26}
            className="rounded-full shrink-0"
          />
        )}
        <span style={{ fontSize: "13px", fontWeight: 500 }}>
          {user?.name ?? user?.email}
        </span>
        <ChevronDown size={13} />
      </button>

      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "150px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {/* <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--color-border)",
              fontWeight: 600,
              fontSize: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Notifications</span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "rgb(233,34,39)",
              }}
            >
              3 new
            </span> */}
          {/* </div> */}

          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              cursor: "pointer",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-surface-2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={async () => {
              await authClient.signOut();
              clearUser();
              router.push("/login");
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <LogOut size={14} color="rgb(233,34,39)" strokeWidth={2.5} />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "rgb(233,34,39)",
                }}
              >
                Đăng xuất
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
