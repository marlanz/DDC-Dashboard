"use client";

import { useRef, useState, useEffect } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  FileSpreadsheet,
  ChevronDown,
  LayoutList,
  GitBranch,
  Trash2,
  X,
} from "lucide-react";

export type ViewMode = "tree" | "flat";

interface EquipmentGroupToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  onAddGroup: () => void;
  onRefresh?: () => void;
  onImportExcel?: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedCount?: number;
  onDeleteSelected?: () => void;
  onClearSelection?: () => void;
}

export function EquipmentGroupTreeToolbar({
  search,
  onSearchChange,
  onAddGroup,
  onRefresh,
  onImportExcel,
  viewMode,
  onViewModeChange,
  selectedCount = 0,
  onDeleteSelected,
  onClearSelection,
}: EquipmentGroupToolbarProps) {
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const importMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!importMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        importMenuRef.current &&
        !importMenuRef.current.contains(e.target as Node)
      ) {
        setImportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [importMenuOpen]);

  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "nowrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm nhóm, loại, cấu hình, công suất..."
            style={{
              width: "100%",
              height: 34,
              paddingLeft: 32,
              paddingRight: search ? 30 : 10,
              border: "1px solid var(--color-border)",
              borderRadius: 7,
              fontSize: 13,
              background: "var(--color-surface-2)",
              color: "var(--color-text-primary)",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgb(233,34,39)";
              e.target.style.boxShadow = "0 0 0 3px rgba(233,34,39,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                fontSize: 16,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* View mode toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: 2,
            gap: 2,
            flexShrink: 0,
          }}
        >
          {(
            [
              { mode: "tree" as ViewMode, Icon: GitBranch, label: "Cây" },
              { mode: "flat" as ViewMode, Icon: LayoutList, label: "Bảng" },
            ] as const
          ).map(({ mode, Icon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              title={label}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 500,
                background:
                  viewMode === mode ? "var(--color-surface)" : "transparent",
                color:
                  viewMode === mode
                    ? "rgb(233,34,39)"
                    : "var(--color-text-secondary)",
                boxShadow:
                  viewMode === mode
                    ? "0 1px 3px rgba(0,0,0,0.08)"
                    : "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          className="btn-ghost"
          style={{ height: 34, padding: "0 10px", flexShrink: 0 }}
          title="Tải lại dữ liệu"
          onClick={onRefresh}
        >
          <RefreshCw size={14} />
          Tải lại
        </button>

        {/* Import */}
        <div ref={importMenuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            id="group-toolbar-import-btn"
            className="btn-ghost"
            onClick={() => setImportMenuOpen((o) => !o)}
            style={{ height: 34, gap: 5 }}
            aria-haspopup="menu"
            aria-expanded={importMenuOpen}
          >
            <FileSpreadsheet size={14} />
            Nhập
            <ChevronDown
              size={12}
              style={{
                transition: "transform 0.15s",
                transform: importMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                opacity: 0.6,
              }}
            />
          </button>

          {importMenuOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                minWidth: 190,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
                zIndex: 200,
                overflow: "hidden",
                animation: "dropdownIn 0.15s ease",
              }}
            >
              <button
                role="menuitem"
                onClick={() => {
                  setImportMenuOpen(false);
                  onImportExcel?.();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--color-text-primary)",
                  fontWeight: 500,
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-surface-2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "rgba(34,197,94,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileSpreadsheet size={14} style={{ color: "#22c55e" }} />
                </span>
                <div>
                  <div>Nhập với Excel</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 400 }}>
                    Chấp nhận file .xlsx, .xls
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Export */}
        <button className="btn-ghost" style={{ height: 34, flexShrink: 0 }}>
          <Download size={14} />
          Xuất
        </button>

        {/* Add */}
        <button
          id="group-toolbar-add-btn"
          className="btn-brand"
          onClick={onAddGroup}
          style={{ height: 34, flexShrink: 0, fontWeight: 600 }}
        >
          <Plus size={14} />
          Thêm nhóm
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div
          style={{
            padding: "7px 20px",
            background: "rgba(233,34,39,0.05)",
            borderTop: "1px solid rgba(233,34,39,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "slideDown 0.18s ease",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgb(233,34,39)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgb(233,34,39)",
                color: "white",
                fontSize: 11,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
              }}
            >
              {selectedCount}
            </span>
            nhóm đã chọn
          </span>

          <div style={{ flex: 1 }} />

          <button
            onClick={onClearSelection}
            className="btn-ghost"
            style={{ height: 30, padding: "0 10px", fontSize: 12, gap: 5 }}
          >
            <X size={12} />
            Bỏ chọn
          </button>
          <button
            id="group-toolbar-bulk-delete-btn"
            onClick={onDeleteSelected}
            style={{
              height: 30,
              padding: "0 14px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.15s, transform 0.1s",
              boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Trash2 size={13} />
            Xoá {selectedCount} nhóm
          </button>
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
