import { Download, Sun, Moon, ChevronDown, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import Image from "next/image";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface TopHeaderProps {
  darkMode?: boolean;
  onToggleDark?: () => void;
  onSearchChange?: (v: string) => void;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Bảng thống kê thiết bị",
  "/equipments": "Danh sách thiết bị",
  "/factories": "Quản lý nhà máy",
  "/equipment-groups": "Quản lý nhóm thiết bị",
  "/maintenance": "Maintenance Schedule",
  "/reports": "Reports & Analytics",
  "/import": "Import Excel",
  "/settings": "System Settings",
};

export default function TopHeader({ darkMode, onToggleDark }: TopHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const path = usePathname();

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
          Xuất file báo cáo
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild className="py-4">
          <Button variant="outline" className="bg-white gap-3">
            <div className="flex items-center gap-2">
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
            </div>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Email</DropdownMenuLabel>
            <DropdownMenuItem>{user?.email}</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Chức vụ tài khoản</DropdownMenuLabel>
            <DropdownMenuItem>Admin</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onSelect={async (event) => {
                event.preventDefault();
                clearUser();

                try {
                  const { error } = await authClient.signOut();
                  if (error) {
                    console.error("Sign out failed:", error);
                  }
                } catch (error) {
                  console.error("Sign out failed:", error);
                }

                // Full navigation clears Better Auth client cache and re-runs proxy.
                window.location.assign("/login");
              }}
            >
              <LogOut />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
