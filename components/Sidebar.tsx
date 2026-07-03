"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Droplet,
  Factory,
  FileText,
  HdmiPort,
  Layers,
  LayoutDashboard,
  LayoutDashboardIcon,
  PanelsTopLeft,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSidebarStore } from "@/lib/store/useSidebarStore";
import Image from "next/image";

type SidebarLinkItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type SidebarGroupItem = {
  id: MenuItem;
  title: string;
  icon: LucideIcon;
  children: SidebarLinkItem[];
};

type MenuItem = "statistics" | "factoryreport" | "eqreport";

export const menuGroups: SidebarGroupItem[] = [
  {
    id: "statistics",
    title: "Bảng thống kê",
    icon: LayoutDashboardIcon,
    children: [
      { href: "dashboard", label: "Thống kê MMTB", icon: Cpu },
      { href: "iot-realtime", label: "IOT thời gian thực", icon: HdmiPort },
    ],
  },
  {
    id: "factoryreport",
    title: "Báo cáo nhà máy",
    icon: Factory,
    children: [
      { href: "electricity", label: "Báo cáo chi phí điện", icon: Zap },
      { href: "maintenance", label: "Báo cáo bảo trì", icon: Wrench },
      {
        href: "water",
        label: "Báo cáo chi phí nước",
        icon: Droplet,
      },
    ],
  },
  {
    id: "eqreport",
    title: "Báo cáo MMTB",
    icon: FileText,
    children: [
      { href: "overall", label: "Tổng quan", icon: PanelsTopLeft },
      { href: "equipments", label: "Danh sách thiết bị", icon: Cpu },
      { href: "equipment-groups", label: "Nhóm thiết bị", icon: Layers },
    ],
  },
];

const isActivePath = (
  currentPathname: string,
  href: string,
  parent: string,
) => {
  const targetPath = `/${parent}/${href}`;

  return (
    currentPathname === targetPath ||
    currentPathname.startsWith(`${targetPath}/`)
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, hydrated } = useSidebarStore();
  const [expandedGroups, setExpandedGroups] = useState<
    Record<MenuItem, boolean>
  >({
    factoryreport: true,
    eqreport: true,
    statistics: true,
  });

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
      <div
        style={{
          minHeight: "72px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: collapsed ? "8px 5px 8px 5px" : "12px 16px 8px 16px",
          borderBottom: "1px solid var(--color-border)",
          gap: "4px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: collapsed ? "60px" : "100px",
            height: collapsed ? "20px" : "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Image
            src={"/logo-01.png"}
            alt="logo"
            width={collapsed ? 60 : 100}
            height={collapsed ? 20 : 40}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </div>
        {!collapsed && (
          <div
            style={{
              fontWeight: 700,
              fontSize: "14px",
              color: "var(--color-text-primary)",
              textAlign: "center",
              marginTop: "2px",
              lineHeight: 1.2,
              padding: "5px 2px",
              wordBreak: "break-word",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            Hệ thống Báo cáo và Quản lí thiết bị Cơ khí DDC
          </div>
        )}
      </div>

      <nav
        style={{
          flex: 1,
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {menuGroups.map((group) => {
          const Icon = group.icon;
          const hasActiveChild = group.children.some((child) =>
            isActivePath(pathname, child.href, group.id),
          );
          const isExpanded =
            (expandedGroups[group.id] ?? false) || hasActiveChild;

          return (
            <div key={group.id}>
              <button
                type="button"
                className={`sidebar-item sidebar-group-button${hasActiveChild ? " active" : ""}`}
                onClick={() =>
                  setExpandedGroups((previous) => ({
                    ...previous,
                    [group.id]: !previous[group.id],
                  }))
                }
                style={{
                  justifyContent: collapsed ? "center" : "space-between",
                  padding: collapsed ? "8px" : "8px 12px",
                  width: "100%",
                  border: "none",
                  background: "transparent",
                }}
                title={collapsed ? group.title : undefined}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Icon
                    size={18}
                    strokeWidth={hasActiveChild ? 2.5 : 2}
                    className="icon"
                  />
                  {!collapsed && <span>{group.title}</span>}
                </span>
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`sidebar-group-chevron${isExpanded ? " expanded" : ""}`}
                  />
                )}
              </button>

              {!collapsed && (
                <div
                  className={`sidebar-group-content${isExpanded ? " expanded" : ""}`}
                >
                  <div className="sidebar-group-content-inner">
                    {group.children.map((item) => {
                      const ChildIcon = item.icon;
                      const isActive = isActivePath(
                        pathname,
                        item.href,
                        group.id,
                      );

                      return (
                        <Link
                          key={item.href}
                          href={`/${group.id}/${item.href}`}
                          className={`sidebar-item sidebar-child-item${isActive ? " active" : ""}`}
                          style={{
                            justifyContent: "flex-start",
                            padding: "7px 10px 7px 14px",
                            marginLeft: "8px",
                          }}
                        >
                          <ChildIcon
                            size={16}
                            strokeWidth={isActive ? 2.5 : 2}
                            className="icon"
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

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
