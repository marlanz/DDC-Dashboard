"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  FileSpreadsheet,
  Download,
  Plus,
  RefreshCw,
  FileJson,
  ChevronDown,
  TableIcon,
} from "lucide-react";

interface EquipmentToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  filterOpen: boolean;
  onToggleFilter: () => void;
  activeFiltersCount: number;
  density: "compact" | "normal" | "comfortable";
  onDensityChange: (d: "compact" | "normal" | "comfortable") => void;
  selectedCount: number;
  totalCount: number;
  onAddEquipment: () => void;
  onRefresh?: () => void;
  onImportJson?: () => void;
  onImportExcel?: () => void;
  onDeleteSelected?: () => void;
  isDeleting?: boolean;
}

export default function EquipmentToolbar({
  search,
  onSearchChange,
  filterOpen,
  onToggleFilter,
  activeFiltersCount,
  density,
  onDensityChange,
  selectedCount,
  onAddEquipment,
  onRefresh,
  onImportExcel,
  onDeleteSelected,
  isDeleting = false,
}: EquipmentToolbarProps) {
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const importMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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
      }}
    >
      {/* Breadcrumb row */}

      {/* Actions row */}
      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "nowrap",
        }}
      >
        {/* Filter toggle */}
        <button
          onClick={onToggleFilter}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 12px",
            height: "34px",
            border: `1px solid ${filterOpen || activeFiltersCount > 0 ? "rgb(233,34,39)" : "var(--color-border)"}`,
            borderRadius: "7px",
            background:
              filterOpen || activeFiltersCount > 0
                ? "rgba(233,34,39,0.06)"
                : "var(--color-surface)",
            color:
              filterOpen || activeFiltersCount > 0
                ? "rgb(233,34,39)"
                : "var(--color-text-secondary)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          <SlidersHorizontal size={14} />
          Bộ lọc
          {activeFiltersCount > 0 && (
            <span
              style={{
                background: "rgb(233,34,39)",
                color: "white",
                borderRadius: "9999px",
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 5px",
                lineHeight: 1.5,
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: "340px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "10px",
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
            placeholder="Tìm kiếm theo tên, mã MMTB, nhà máy, hãng sản xuất..."
            style={{
              width: "100%",
              height: "34px",
              paddingLeft: "32px",
              paddingRight: search ? "30px" : "10px",
              border: "1px solid var(--color-border)",
              borderRadius: "7px",
              fontSize: "13px",
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
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                fontSize: "16px",
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Density */}
        <div
          style={{
            display: "flex",
            border: "1px solid var(--color-border)",
            borderRadius: "7px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {(["compact", "normal", "comfortable"] as const).map((d, i) => (
            <button
              key={d}
              title={`${d.charAt(0).toUpperCase() + d.slice(1)} density`}
              onClick={() => onDensityChange(d)}
              style={{
                height: "34px",
                padding: "0 10px",
                border: "none",
                borderLeft: i > 0 ? "1px solid var(--color-border)" : "none",
                background:
                  density === d
                    ? "rgba(233,34,39,0.08)"
                    : "var(--color-surface)",
                color:
                  density === d ? "rgb(233,34,39)" : "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: density === d ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {d === "compact" ? "S" : d === "normal" ? "M" : "L"}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Bulk actions when rows selected */}
        {selectedCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 10px",
              height: "34px",
              background: "rgba(233,34,39,0.05)",
              border: "1px solid rgba(233,34,39,0.2)",
              borderRadius: "7px",
              fontSize: "12px",
              fontWeight: 500,
              color: "rgb(233,34,39)",
            }}
          >
            <span>{selectedCount} Đã chọn:</span>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
                fontSize: "12px",
                padding: "0 4px",
                fontWeight: 600,
              }}
            >
              Xuất dữ liệu
            </button>
            <span style={{ color: "rgba(233,34,39,0.4)" }}>|</span>
            <button
              type="button"
              onClick={onDeleteSelected}
              disabled={isDeleting || !onDeleteSelected}
              style={{
                background: "none",
                border: "none",
                cursor:
                  isDeleting || !onDeleteSelected ? "not-allowed" : "pointer",
                color: "#ef4444",
                fontSize: "12px",
                padding: "0 4px",
                fontWeight: 600,
                opacity: isDeleting || !onDeleteSelected ? 0.5 : 1,
              }}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        )}

        {/* Refresh */}
        <button
          className="btn-ghost"
          style={{ height: "34px", padding: "0 10px", flexShrink: 0 }}
          title="Refresh data"
          onClick={onRefresh}
        >
          <RefreshCw size={14} />
          Tải lại
        </button>

        {/* Import dropdown */}
        <div
          ref={importMenuRef}
          style={{ position: "relative", flexShrink: 0 }}
        >
          <button
            id="toolbar-import-btn"
            className="btn-ghost"
            onClick={() => setImportMenuOpen((o) => !o)}
            style={{ height: "34px", gap: "5px" }}
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
                minWidth: "190px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
                zIndex: 200,
                overflow: "hidden",
                animation: "dropdownIn 0.15s ease",
              }}
            >
              {/* Import JSON */}
              <button
                id="toolbar-import-json-btn"
                role="menuitem"
                // onClick={() => {
                //   setImportMenuOpen(false);
                //   onImportJson?.();
                // }}
                disabled={true}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
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
                    borderRadius: "7px",
                    background: "rgba(233,34,39,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileJson size={14} style={{ color: "rgb(233,34,39)" }} />
                </span>
                <div>
                  <div>Nhập với JSON</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      fontWeight: 400,
                    }}
                  >
                    Không được truy cập
                  </div>
                </div>
              </button>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "var(--color-border)",
                  margin: "0 10px",
                }}
              />

              {/* Import Excel */}
              <button
                id="toolbar-import-excel-btn"
                role="menuitem"
                onClick={() => {
                  setImportMenuOpen(false);
                  onImportExcel?.();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
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
                    borderRadius: "7px",
                    background: "rgba(34,197,94,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TableIcon size={14} style={{ color: "#22c55e" }} />
                </span>
                <div>
                  <div>Nhập với Excel</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      fontWeight: 400,
                    }}
                  >
                    Chấp nhận file .xlsx, .xls
                  </div>
                </div>
              </button>
            </div>
          )}

          <style>{`
            @keyframes dropdownIn {
              from { opacity: 0; transform: translateY(-6px) }
              to   { opacity: 1; transform: translateY(0) }
            }
          `}</style>
        </div>

        {/* Export */}
        <button className="btn-ghost" style={{ height: "34px", flexShrink: 0 }}>
          <Download size={14} />
          Xuất
        </button>

        {/* Add */}
        <button
          className="btn-brand"
          onClick={onAddEquipment}
          style={{ height: "34px", flexShrink: 0, fontWeight: 600 }}
        >
          <Plus size={14} />
          Thêm thiết bị
        </button>
      </div>
    </div>
  );
}
