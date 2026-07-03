"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, RotateCcw, Check } from "lucide-react";
import type { EquipmentFilters } from "@/types/equipment";

export type { EquipmentFilters };

export const EMPTY_FILTERS: EquipmentFilters = {
  factories: [],
  workshops: [],
  workCenters: [],
  layouts: [],
  group1s: [],
  group2s: [],
  brands: [],
  countries: [],
  produceYears: [],
  statuses: [],
};

interface FilterOptions {
  factories: string[];
  workshops: string[];
  workCenters: string[];
  layouts: string[];
  group1s: string[];
  group2s: string[];
  brands: string[];
  countries: string[];
  produceYears: string[];
}

interface EquipmentFilterPanelProps {
  open: boolean;
  options: FilterOptions;
  filters: EquipmentFilters;
  onFiltersChange: (f: EquipmentFilters) => void;
  onClose: () => void;
  resultCount: number;
}

const STATUS_OPTS = [
  { value: "Hoạt động", label: "Active", color: "#10b981" },
  { value: "Bảo trì", label: "Maintenance", color: "#f59e0b" },
  // { value: "inspection",  label: "Inspection",  color: "#3b82f6" },
  { value: "Đã bán", label: "Inactive", color: "#6b7280" },
];

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--color-border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {title}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && <div style={{ padding: "0 12px 12px" }}>{children}</div>}
    </div>
  );
}

function CheckGroup({
  options,
  selected,
  onChange,
  colorMap,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  colorMap?: Record<string, string>;
}) {
  const toggle = (v: string) =>
    selected.includes(v)
      ? onChange(selected.filter((s) => s !== v))
      : onChange([...selected, v]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        maxHeight: "160px",
        overflowY: "auto",
      }}
    >
      {options.map((opt) => {
        const checked = selected.includes(opt);
        const color = colorMap?.[opt];
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 6px",
              borderRadius: "5px",
              border: "none",
              background: checked ? "rgba(233,34,39,0.06)" : "transparent",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "background 0.1s",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                flexShrink: 0,
                borderRadius: "3px",
                border: `2px solid ${checked ? "rgb(233,34,39)" : "var(--color-border)"}`,
                background: checked ? "rgb(233,34,39)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {checked && <Check size={9} color="white" strokeWidth={3} />}
            </div>
            {color && (
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-text-primary)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function EquipmentFilterPanel({
  open,
  options,
  filters,
  onFiltersChange,
  onClose,
  resultCount,
}: EquipmentFilterPanelProps) {
  const activeCount = Object.values(filters).flat().length;

  const set = <K extends keyof EquipmentFilters>(key: K, val: string[]) =>
    onFiltersChange({ ...filters, [key]: val });

  const statusColorMap = Object.fromEntries(
    STATUS_OPTS.map((s) => [s.value, s.color]),
  );

  if (!open) return null;

  return (
    <div
      style={{
        width: "240px",
        minWidth: "240px",
        borderRight: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: "13px" }}>
            Tùy chỉnh bộ lọc
          </span>
          {activeCount > 0 && (
            <span
              style={{
                marginLeft: "6px",
                background: "rgb(233,34,39)",
                color: "white",
                borderRadius: "9999px",
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 5px",
              }}
            >
              {activeCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {activeCount > 0 && (
            <button
              onClick={() => onFiltersChange({ ...EMPTY_FILTERS })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 7px",
                border: "1px solid var(--color-border)",
                borderRadius: "5px",
                background: "none",
                cursor: "pointer",
                fontSize: "11px",
                color: "var(--color-text-secondary)",
              }}
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              width: "26px",
              height: "26px",
              border: "1px solid var(--color-border)",
              borderRadius: "5px",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
            }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Scrollable filters */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Status */}
        <Section title="TRẠNG THÁI">
          <CheckGroup
            options={STATUS_OPTS.map((s) => s.value)}
            selected={filters.statuses}
            onChange={(v) => set("statuses", v)}
            colorMap={statusColorMap}
          />
        </Section>

        {/* Factory */}
        <Section title="NHÀ MÁY">
          <CheckGroup
            options={options.factories}
            selected={filters.factories}
            onChange={(v) => set("factories", v)}
          />
        </Section>

        {/* Workshop */}
        <Section title="XƯỞNG" defaultOpen={false}>
          <CheckGroup
            options={options.workshops}
            selected={filters.workshops}
            onChange={(v) => set("workshops", v)}
          />
        </Section>

        {/* Work Center */}
        <Section title="TỔ/Work Center" defaultOpen={false}>
          <CheckGroup
            options={options.workCenters}
            selected={filters.workCenters}
            onChange={(v) => set("workCenters", v)}
          />
        </Section>

        {/* Equipment Group L1 */}
        <Section title="NHÓM THIẾT BỊ" defaultOpen={false}>
          <CheckGroup
            options={options.group1s}
            selected={filters.group1s}
            onChange={(v) => set("group1s", v)}
          />
        </Section>

        {/* Equipment Group L2 */}
        {options.group2s.length > 0 && (
          <Section title="NHÓM MỞ RỘNG" defaultOpen={false}>
            <CheckGroup
              options={options.group2s}
              selected={filters.group2s}
              onChange={(v) => set("group2s", v)}
            />
          </Section>
        )}

        {/* Brand */}
        <Section title="HÃNG SẢN XUẤT" defaultOpen={false}>
          <CheckGroup
            options={options.brands}
            selected={filters.brands}
            onChange={(v) => set("brands", v)}
          />
        </Section>

        {/* Country */}
        <Section title="QUỐC GIA" defaultOpen={false}>
          <CheckGroup
            options={options.countries}
            selected={filters.countries}
            onChange={(v) => set("countries", v)}
          />
        </Section>

        {/* Produce Year */}
        <Section title="NĂM SẢN XUẤT" defaultOpen={false}>
          <CheckGroup
            options={options.produceYears}
            selected={filters.produceYears}
            onChange={(v) => set("produceYears", v)}
          />
        </Section>
      </div>

      {/* Footer result count */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--color-border)",
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 600, color: "rgb(233,34,39)" }}>
          {resultCount}
        </span>{" "}
        records match
      </div>
    </div>
  );
}
