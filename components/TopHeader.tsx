"use client";

import { useState } from "react";
import { Search, Bell, Download, Sun, Moon, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/lib/store/useSidebarStore";

interface TopHeaderProps {
  darkMode?: boolean;
  onToggleDark?: () => void;
  searchValue?: string;
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

export default function TopHeader({
  darkMode,
  onToggleDark,
  searchValue,
}: TopHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const path = usePathname();

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

      {/* Search */}
      <div
        style={{
          flex: 1,
          maxWidth: "380px",
          marginLeft: "16px",
          position: "relative",
        }}
      >
        <Search
          size={15}
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-muted)",
          }}
        />
        <input
          type="text"
          value={searchValue}
          // onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search equipment, factory, code..."
          style={{
            width: "100%",
            height: "34px",
            paddingLeft: "32px",
            paddingRight: "12px",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "13px",
            background: "var(--color-surface-2)",
            color: "var(--color-text-primary)",
            outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgb(233,34,39)";
            e.target.style.boxShadow = "0 0 0 3px rgba(233,34,39,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Export button */}
      <button
        className="btn-brand"
        style={{ height: "34px", fontSize: "13px" }}
      >
        <Download size={14} />
        Export Report
      </button>

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
      <div style={{ position: "relative" }}>
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
        {notifOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "300px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 100,
              overflow: "hidden",
            }}
          >
            <div
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
              </span>
            </div>
            {[
              {
                title: "Maintenance Due",
                desc: "Cẩu trục 15T — B20101029 needs review",
                time: "2h ago",
                type: "warning",
              },
              {
                title: "Inspection Alert",
                desc: "Robot hàn spot MA2010 inspection pending",
                time: "5h ago",
                type: "info",
              },
              {
                title: "Equipment Offline",
                desc: "Máy nén khí GA55+ is inactive",
                time: "1d ago",
                type: "error",
              },
            ].map((n, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 16px",
                  borderBottom:
                    i < 2 ? "1px solid var(--color-border)" : "none",
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
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>
                    {n.title}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {n.time}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {n.desc}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      <button
        className="btn-ghost"
        style={{ height: "34px", padding: "0 10px", gap: "8px" }}
      >
        <div
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgb(233,34,39), #ff6b6b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "11px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          AD
        </div>
        <span style={{ fontSize: "13px", fontWeight: 500 }}>Admin</span>
        <ChevronDown size={13} />
      </button>
    </header>
  );
}
