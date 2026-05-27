"use client";

import { useEffect, useRef } from "react";
import { X, Pencil, Trash2, Calendar, Clock, Layers, Folder, FolderOpen, Zap } from "lucide-react";
import type { EquipmentGroupRecord } from "@/types/equipment-group";
import { LevelBadge, LEVEL_CFG } from "./level-badge";

interface EquipmentGroupDetailPanelProps {
  record: EquipmentGroupRecord | null;
  onClose: () => void;
  onEdit: (record: EquipmentGroupRecord) => void;
  onDelete: (record: EquipmentGroupRecord) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const LEVEL_ICONS = {
  1: Folder,
  2: FolderOpen,
  3: Layers,
  4: Zap,
} as const;

export function EquipmentGroupDetailPanel({
  record,
  onClose,
  onEdit,
  onDelete,
}: EquipmentGroupDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const isOpen = record !== null;

  const levels = record
    ? [
        { level: 1 as const, label: "Nhóm thiết bị", value: record.level1 },
        { level: 2 as const, label: "Loại thiết bị", value: record.level2 },
        { level: 3 as const, label: "Cấu hình", value: record.level3 },
        { level: 4 as const, label: "Công suất", value: record.level4 },
      ]
    : [];

  return (
    <>
      {/* Backdrop — subtle, just dims content slightly */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 39,
          background: "rgba(0,0,0,0.15)",
          backdropFilter: "blur(1px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.22s ease",
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          zIndex: 40,
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.24s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        {record && (
          <>
            {/* ── Header ── */}
            <div
              style={{
                padding: "16px 20px 14px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                flexShrink: 0,
                background: "var(--color-surface)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(233,34,39,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgb(233,34,39)",
                  flexShrink: 0,
                }}
              >
                <Layers size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    lineHeight: 1.3,
                    wordBreak: "break-word",
                  }}
                >
                  {record.level4}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    marginTop: 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={record.fullPath}
                >
                  {record.fullPath}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Đóng"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: "1px solid var(--color-border)",
                  background: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-2)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* ── Body ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {/* Hierarchy breadcrumb */}
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-text-muted)",
                    marginBottom: 10,
                  }}
                >
                  Đường dẫn phân cấp
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {levels.map(({ level, label, value }, i) => {
                    const cfg = LEVEL_CFG[level];
                    const Icon = LEVEL_ICONS[level];
                    const isLast = i === levels.length - 1;
                    return (
                      <div key={level} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Connector line */}
                        {i > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                            <div style={{ width: 1, height: 8, background: "var(--color-border)", marginBottom: 2 }} />
                          </div>
                        )}
                        {i === 0 && <div style={{ width: 20 }} />}

                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background: cfg.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: cfg.color,
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={13} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: isLast ? 700 : 500,
                              color: isLast ? cfg.color : "var(--color-text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {value}
                          </div>
                        </div>
                        <LevelBadge level={level} value={`L${level}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metadata */}
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-text-muted)",
                    marginBottom: 10,
                  }}
                >
                  Thông tin hệ thống
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <MetaRow
                    icon={<Calendar size={13} />}
                    label="Ngày tạo"
                    value={formatDate(record.createdAt)}
                  />
                  <MetaRow
                    icon={<Clock size={13} />}
                    label="Cập nhật lần cuối"
                    value={formatDateTime(record.updatedAt)}
                  />
                  <MetaRow
                    icon={<span style={{ fontFamily: "monospace", fontSize: 10 }}>ID</span>}
                    label="Mã nhận dạng"
                    value={record._id}
                    mono
                  />
                </div>
              </div>

              {/* Full path card */}
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(233,34,39,0.03)",
                  border: "1px solid rgba(233,34,39,0.15)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  lineHeight: 1.6,
                }}
              >
                <span style={{ fontWeight: 600, color: "rgb(233,34,39)" }}>Đường dẫn đầy đủ: </span>
                {record.fullPath}
              </div>
            </div>

            {/* ── Footer actions ── */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                gap: 8,
                flexShrink: 0,
                background: "var(--color-surface)",
              }}
            >
              <button
                onClick={() => onDelete(record)}
                style={{
                  height: 36,
                  padding: "0 16px",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.06)",
                  color: "#ef4444",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.06)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                }}
              >
                <Trash2 size={14} />
                Xoá
              </button>
              <button
                onClick={() => onEdit(record)}
                className="btn-brand"
                style={{ height: 36, flex: 1, justifyContent: "center" }}
              >
                <Pencil size={14} />
                Chỉnh sửa
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function MetaRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span
        style={{
          width: 28,
          height: 22,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-primary)",
            fontFamily: mono ? "monospace" : undefined,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={value}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
