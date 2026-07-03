"use client";

import React from "react";
import {
  X,
  Pencil,
  Trash2,
  Download,
  ClipboardList,
  MapPin,
  Factory,
  Cpu,
  Wrench,
  Tag,
  Calendar,
  Globe,
  FileText,
  Activity,
} from "lucide-react";
import type { Equipment } from "@/types/equipment";
import { getStatusMeta } from "@/lib/constants/equipment-status";


function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!value && value !== 0) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr",
        gap: "8px",
        padding: "5px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          paddingTop: "1px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          color: "var(--color-text-primary)",
          wordBreak: "break-word",
        }}
      >
        {String(value)}
      </span>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          marginBottom: "10px",
        }}
      >
        <span style={{ color: "rgb(233,34,39)", display: "flex" }}>{icon}</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: "12px",
            color: "var(--color-text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "8px 12px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function EquipmentDetailPanel({
  equipment,
  onClose,
}: {
  equipment: Equipment | null;
  onClose: () => void;
}) {
  if (!equipment) return null;
  const status = equipment.status ?? "active";
  const statusMeta = getStatusMeta(status);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 200,
          animation: "fadeIn 0.18s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "480px",
          height: "100vh",
          background: "var(--color-surface)",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-6px 0 30px rgba(0,0,0,0.15)",
          animation: "slideIn 0.22s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border)",
            background:
              "linear-gradient(135deg, rgba(233,34,39,0.04), transparent)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "monospace",
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    padding: "2px 7px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {equipment.equipmentCode}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    background: statusMeta.bg,
                    color: statusMeta.color,
                    border: `1px solid ${statusMeta.color}30`,
                  }}
                >
                  ● {statusMeta.translate}
                </span>
              </div>
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: "16px",
                  color: "var(--color-text-primary)",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {equipment.equipmentName}
              </h2>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  marginTop: "4px",
                }}
              >
                {equipment.equipmentGroup.level2} ·{" "}
                {equipment.organization.factory}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "7px",
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
                e.currentTarget.style.background = "rgba(233,34,39,0.06)";
                e.currentTarget.style.borderColor = "rgb(233,34,39)";
                e.currentTarget.style.color = "rgb(233,34,39)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-muted)";
              }}
            >
              <X size={15} />
            </button>
          </div>
          {/* Quick actions */}
          <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
            <button
              style={{
                fontSize: "14px",
                flex: 1,
                justifyContent: "center",
                background: "rgb(233, 34, 39)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0 16px",
                height: "36px",
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: " 6px",
              }}
            >
              <Pencil size={12} /> Chỉnh sửa
            </button>
            {/* <button
              className="btn-ghost"
              style={{
                height: "30px",
                fontSize: "12px",
                flex: 1,
                justifyContent: "center",
              }}
            >
              <ClipboardList size={12} /> Maintenance
            </button> */}
            <button
              className="btn-ghost"
              style={{ height: "30px", fontSize: "12px", padding: "0 10px" }}
              title="Download PDF"
            >
              <Download size={12} />
            </button>
            <button
              className="btn-ghost"
              style={{
                height: "30px",
                fontSize: "12px",
                padding: "0 10px",
                color: "#ef4444",
                borderColor: "rgba(239,68,68,0.3)",
              }}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {/* General Info */}
          <Section icon={<Tag size={14} />} title="Thông tin chung">
            <InfoRow label="Mã MMTB" value={equipment.equipmentCode} />
            <InfoRow label="Tên MMTB" value={equipment.equipmentName} />
            <InfoRow label="Trạng thái" value={statusMeta.translate} />
            <InfoRow label="Xưởng" value={equipment.installationLocation} />
            {equipment.note && <InfoRow label="Notes" value={equipment.note} />}
          </Section>

          {/* Equipment Hierarchy */}
          <Section icon={<Cpu size={14} />} title="Nhóm máy móc thiết bị">
            <InfoRow
              label="Nhóm thiết bị"
              value={equipment.equipmentGroup.level1}
            />
            <InfoRow
              label="Loại thiết "
              value={equipment.equipmentGroup.level2}
            />
            <InfoRow label="Cấu hình" value={equipment.equipmentGroup.level3} />
            <InfoRow
              label="Công suất"
              value={equipment.equipmentGroup.level4}
            />
          </Section>

          {/* Organization */}
          <Section icon={<Factory size={14} />} title="Nhóm đơn vị sử dụng ">
            <InfoRow
              label="Pháp nhân"
              value={equipment.organization.legalEntity}
            />
            <InfoRow label="Nhà máy" value={equipment.organization.factory} />
            <InfoRow label="Xưởng" value={equipment.organization.workshop} />
            <InfoRow label="Layout" value={equipment.organization.layout} />
            <InfoRow
              label="Tổ/Work Center"
              value={equipment.organization.workCenter}
            />
            {equipment.organization.area && (
              <InfoRow label="Area" value={equipment.organization.area} />
            )}
          </Section>

          {/* Manufacturer */}
          <Section icon={<Wrench size={14} />} title="Nhóm nhà sản xuất">
            <InfoRow label="Hãng" value={equipment.manufacturer.brand} />
            <InfoRow label="Model" value={equipment.manufacturer.model} />
            <InfoRow label="Quốc gia" value={equipment.manufacturer.country} />
            <InfoRow
              label="Năm sản xuất"
              value={equipment.manufacturer.produceYear}
            />
          </Section>

          {/* Specification */}
          <Section icon={<FileText size={14} />} title="Đặc tính kỹ thuật">
            <div
              style={{
                fontSize: "13px",
                color: "var(--color-text-primary)",
                lineHeight: 1.6,
                padding: "4px 0",
              }}
            >
              {equipment.specification || "Không có đặc tính kỹ thuật."}
            </div>
          </Section>

          {/* Note */}
          <Section icon={<FileText size={14} />} title="Ghi chú MMTB">
            <div
              style={{
                fontSize: "13px",
                color: "var(--color-text-primary)",
                lineHeight: 1.6,
                padding: "4px 0",
              }}
            >
              {equipment.note || "Không có ghi chú nào"}
            </div>
          </Section>

          {/* Maintenance Timeline */}
          {/* <Section icon={<Calendar size={14} />} title="Maintenance Timeline">
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {MAINTENANCE_TIMELINE.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "8px 0",
                    borderBottom:
                      i < MAINTENANCE_TIMELINE.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "rgb(233,34,39)",
                        marginTop: 4,
                      }}
                    />
                    {i < MAINTENANCE_TIMELINE.length - 1 && (
                      <div
                        style={{
                          width: 1,
                          flex: 1,
                          background: "var(--color-border)",
                          marginTop: 2,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {m.action}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {m.date} · {m.tech} ·{" "}
                      <span style={{ color: "#10b981" }}>{m.result}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section> */}

          {/* Recent Activities */}
          {/* <Section icon={<Activity size={14} />} title="Ghi chú gần đây">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {ACTIVITIES.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    fontSize: "12px",
                    padding: "4px 0",
                    borderBottom:
                      i < ACTIVITIES.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: "var(--color-text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {a.event}
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-muted)",
                        marginLeft: 6,
                      }}
                    >
                      by {a.user}
                    </span>
                  </div>
                  <span
                    style={{
                      color: "var(--color-text-muted)",
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </Section> */}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}
