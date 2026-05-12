"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  Factory,
  GitBranch,
  Wrench,
  BarChart3,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useSidebarStore } from "@/lib/store/useSidebarStore";

const navItems = [
  { href: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "equipments", label: "Equipment", icon: Cpu },
  { href: "factories", label: "Factories", icon: Factory },
  { href: "workcenters", label: "Work Centers", icon: GitBranch },
  { href: "maintenance", label: "Maintenance", icon: Wrench },
  { href: "reports", label: "Reports", icon: BarChart3 },
  { href: "import", label: "Import Excel", icon: FileSpreadsheet },
  { href: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, hydrated } = useSidebarStore();

  if (!hydrated) return null;

  return (
    <aside
      style={{
        width: collapsed ? "64px" : "220px",
        minWidth: collapsed ? "64px" : "220px",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease, min-width 0.25s ease",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "56px",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 20px" : "0 16px",
          borderBottom: "1px solid var(--color-border)",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            background: "rgb(233,34,39)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Zap size={16} color="white" strokeWidth={2.5} />
        </div>

        {!collapsed && (
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "15px",
                color: "var(--color-text-primary)",
              }}
            >
              EMS Pro
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "var(--color-text-muted)",
              }}
            >
              v2.4.1
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          const formattedPathname = `/${item.href}`;

          const isActive = pathname === formattedPathname;

          return (
            <Link
              key={item.href}
              href={`/${item.href}`}
              className={`sidebar-item${isActive ? " active" : ""}`}
              style={{
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "8px" : "8px 12px",
              }}
              title={collapsed ? item.label : undefined}
              // onClick={() => setPage(PAGE_TITLES[item.href])}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className="icon"
              />

              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: "12px 8px",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
          gap: "6px",
        }}
      >
        {collapsed ? (
          <ChevronRight size={16} />
        ) : (
          <>
            <ChevronLeft size={16} />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Collapse
            </span>
          </>
        )}
      </button>
    </aside>
  );
}
