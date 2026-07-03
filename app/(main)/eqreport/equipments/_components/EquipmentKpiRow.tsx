"use client";

import React from "react";
import {
  Cpu,
  CheckCircle2,
  Search,
  AlertTriangle,
  HandCoins,
} from "lucide-react";
import type { Equipment } from "@/types/equipment";

interface EquipmentKpiRowProps {
  data: Equipment[];
}

const STATUSES = [
  {
    key: "active",
    label: "Đang hoạt động",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    Icon: CheckCircle2,
  },
  {
    key: "pending-investment",
    label: "Dự kiến đầu tư ",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    Icon: HandCoins,
  },
  // {
  //   key: "sold",
  //   label: "Đã thanh lý",
  //   color: "#3b82f6",
  //   bg: "rgba(59,130,246,0.08)",
  //   border: "rgba(59,130,246,0.2)",
  //   Icon: Search,
  // },
  {
    key: "inactive",
    label: "Ngưng sử dụng",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.2)",
    Icon: AlertTriangle,
  },
  {
    key: "inactives",
    label: "Ngưng sử dụng",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.2)",
    Icon: AlertTriangle,
  },
];

export default function EquipmentKpiRow({ data }: EquipmentKpiRowProps) {
  const counts = {
    active: data.filter((d) => (d.status ?? "active") === "active").length,
    "pending-investment": data.filter((d) => d.status === "pending-investment")
      .length,
    sold: data.filter((d) => d.status === "sold").length,
    inactive: data.filter((d) => d.status === "inactive").length,
  };
  const total = data.length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr repeat(4, 1fr)",
        gap: "12px",
        padding: "14px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      {/* Total card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 14px",
          border: "1px solid rgba(233,34,39,0.2)",
          borderLeft: "3px solid rgb(233,34,39)",
          borderRadius: "8px",
          background: "rgba(233,34,39,0.04)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(233,34,39,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgb(233,34,39)",
            flexShrink: 0,
          }}
        >
          <Cpu size={18} />
        </div>
        <div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "rgb(233,34,39)",
              lineHeight: 1,
            }}
          >
            {total}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--color-text-muted)",
              marginTop: "2px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Tổng thiết bị
          </div>
        </div>
        {/* Mini bar breakdown */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            marginLeft: "auto",
          }}
        >
          {STATUSES.map((s) => (
            <div
              key={s.key}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <div
                style={{
                  height: "4px",
                  borderRadius: "2px",
                  background: s.color,
                  width: `${total ? (counts[s.key as keyof typeof counts] / total) * 100 : 0}%`,
                  minWidth:
                    counts[s.key as keyof typeof counts] > 0 ? "4px" : "0",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Status cards */}
      {STATUSES.map((s) => {
        const eqStatusCount = data.filter((d) => d.status === s.key).length;
        const pct = (eqStatusCount / total) * 100;
        const displayPct = pct.toFixed(1);
        // console.log(`${s.key}: `, eqStatusCount, total, pct);

        return (
          <div
            key={s.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              border: `1px solid ${s.border}`,
              borderLeft: `3px solid ${s.color}`,
              borderRadius: "8px",
              background: s.bg,
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "7px",
                background: s.bg,
                border: `1px solid ${s.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s.color,
                flexShrink: 0,
              }}
            >
              <s.Icon size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                }}
              >
                {eqStatusCount}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  marginTop: "2px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {s.label}
              </div>
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: s.color,
                background: `${s.bg}`,
                border: `1px solid ${s.border}`,
                borderRadius: "4px",
                padding: "2px 6px",
                flexShrink: 0,
              }}
            >
              {displayPct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
