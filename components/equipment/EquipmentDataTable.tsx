"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import type { Equipment, EquipmentStatus } from "@/types/equipment";

const STATUS_CFG: Record<EquipmentStatus, { label: string; color: string; bg: string; border: string }> = {
  active:      { label: "Active",      color: "#059669", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)"  },
  maintenance: { label: "Maintenance", color: "#d97706", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)"  },
  inspection:  { label: "Inspection",  color: "#2563eb", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.25)"  },
  inactive:    { label: "Inactive",    color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.25)" },
};

type SortKey = "no" | "equipmentCode" | "equipmentName" | "factory" | "workshop" | "group2" | "brand" | "model" | "produceYear" | "status" | "installationLocation";
type SortDir = "asc" | "desc";

function SortBtn({ col, sortKey, sortDir, onClick }: { col: SortKey; sortKey: SortKey; sortDir: SortDir; onClick: () => void }) {
  const active = sortKey === col;
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: active ? "rgb(233,34,39)" : "var(--color-text-muted)", display: "inline-flex" }}>
      {!active ? <ChevronsUpDown size={12} /> : sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </button>
  );
}

function getVal(r: Equipment, k: SortKey): string | number {
  switch (k) {
    case "factory": return r.organization.factory;
    case "workshop": return r.organization.workshop;
    case "group2": return r.equipmentGroup.level2;
    case "brand": return r.manufacturer.brand;
    case "model": return r.manufacturer.model;
    case "produceYear": return r.manufacturer.produceYear;
    case "status": return r.status ?? "active";
    default: return "";
  }
}

const PAGE_SIZES = [10, 20, 50, 100];

interface Props {
  data: Equipment[];
  density: "compact" | "normal" | "comfortable";
  onRowClick: (r: Equipment) => void;
  selectedCodes: Set<string>;
  onSelectionChange: (codes: Set<string>) => void;
}

export default function EquipmentDataTable({ data, density, onRowClick, selectedCodes, onSelectionChange }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const rowPad = density === "compact" ? "6px 12px" : density === "comfortable" ? "14px 12px" : "10px 12px";
  const fontSize = density === "compact" ? "12px" : "13px";

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = getVal(a, sortKey), bv = getVal(b, sortKey);
      const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv), "vi");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  const allPageSelected = pageData.length > 0 && pageData.every((r) => selectedCodes.has(r.equipmentCode));

  const toggleAll = () => {
    const next = new Set(selectedCodes);
    if (allPageSelected) pageData.forEach((r) => next.delete(r.equipmentCode));
    else pageData.forEach((r) => next.add(r.equipmentCode));
    onSelectionChange(next);
  };

  const toggleRow = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedCodes);
    next.has(code) ? next.delete(code) : next.add(code);
    onSelectionChange(next);
  };

  const Th = ({ col, label, width }: { col: SortKey; label: string; width?: number }) => (
    <th style={{ width, padding: "9px 12px", background: "var(--color-surface-2)", borderBottom: "2px solid var(--color-border)", textAlign: "left", position: "sticky", top: 0, zIndex: 5, whiteSpace: "nowrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
        <SortBtn col={col} sortKey={sortKey} sortDir={sortDir} onClick={() => handleSort(col)} />
      </div>
    </th>
  );

  const Checkbox = ({ checked, indeterminate, onClick }: { checked: boolean; indeterminate?: boolean; onClick: (e: React.MouseEvent) => void }) => (
    <div
      onClick={onClick}
      style={{
        width: "14px", height: "14px", border: `2px solid ${checked || indeterminate ? "rgb(233,34,39)" : "var(--color-border)"}`,
        borderRadius: "3px", background: checked ? "rgb(233,34,39)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        flexShrink: 0, margin: "0 auto", transition: "all 0.12s",
      }}
    >
      {checked && <ChevronUp size={9} color="white" strokeWidth={3} style={{ transform: "rotate(45deg) translateX(1px) translateY(1px)" }} />}
      {!checked && indeterminate && <div style={{ width: "6px", height: "2px", background: "rgb(233,34,39)", borderRadius: "1px" }} />}
    </div>
  );

  const pageNums = (() => {
    const nums: number[] = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) nums.push(i);
    }
    return nums;
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", background: "var(--color-surface)" }}>
      {/* Table wrapper */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize }}>
          <thead>
            <tr>
              <th style={{ width: 40, padding: "9px 12px", background: "var(--color-surface-2)", borderBottom: "2px solid var(--color-border)", position: "sticky", top: 0, zIndex: 5, textAlign: "center" }}>
                <Checkbox
                  checked={allPageSelected}
                  indeterminate={!allPageSelected && pageData.some((r) => selectedCodes.has(r.equipmentCode))}
                  onClick={(e) => { e.stopPropagation(); toggleAll(); }}
                />
              </th>
              <th style={{ width: 40, padding: "9px 8px", background: "var(--color-surface-2)", borderBottom: "2px solid var(--color-border)", position: "sticky", top: 0, zIndex: 5, fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textAlign: "center" }}>#</th>
              <Th col="equipmentCode" label="Code" width={120} />
              <Th col="equipmentName" label="Equipment Name" width={200} />
              <Th col="factory" label="Factory" width={110} />
              <Th col="workshop" label="Workshop" width={90} />
              <Th col="group2" label="Equipment Group" width={160} />
              <Th col="brand" label="Brand" width={120} />
              <Th col="model" label="Model" width={100} />
              <Th col="produceYear" label="Year" width={70} />
              <Th col="status" label="Status" width={120} />
              <Th col="installationLocation" label="Location" width={90} />
              <th style={{ width: 90, padding: "9px 12px", background: "var(--color-surface-2)", borderBottom: "2px solid var(--color-border)", position: "sticky", top: 0, zIndex: 5, textAlign: "center", fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ padding: "60px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "32px", opacity: 0.3 }}>📋</div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-secondary)" }}>No equipment found</div>
                    <div style={{ fontSize: "13px" }}>Try adjusting your search or filter criteria</div>
                  </div>
                </td>
              </tr>
            ) : pageData.map((row) => {
              const selected = selectedCodes.has(row.equipmentCode);
              const hovered = hoveredRow === row.equipmentCode;
              const status = row.status ?? "active";
              const sCfg = STATUS_CFG[status];

              return (
                <tr
                  key={row.equipmentCode}
                  onClick={() => onRowClick(row)}
                  onMouseEnter={() => setHoveredRow(row.equipmentCode)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    cursor: "pointer",
                    background: selected ? "rgba(233,34,39,0.04)" : hovered ? "var(--color-surface-2)" : "var(--color-surface)",
                    borderLeft: selected ? "2px solid rgb(233,34,39)" : "2px solid transparent",
                    transition: "background 0.1s, border-color 0.1s",
                  }}
                >
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", textAlign: "center" }}
                    onClick={(e) => toggleRow(row.equipmentCode, e)}>
                    <Checkbox checked={selected} onClick={(e) => toggleRow(row.equipmentCode, e)} />
                  </td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", textAlign: "center", color: "var(--color-text-muted)", fontSize: "11px" }}>
                    {row.no}
                  </td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "4px", padding: "1px 5px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                      {row.equipmentCode}
                    </span>
                  </td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", maxWidth: 200 }}>
                    <div style={{ fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.equipmentName}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "1px" }}>{row.equipmentGroup.level3}</div>
                  </td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap", color: "var(--color-text-primary)" }}>{row.organization.factory}</td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap", color: "var(--color-text-secondary)" }}>{row.organization.workshop}</td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", maxWidth: 160 }}>
                    <div style={{ fontSize, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.equipmentGroup.level2}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{row.equipmentGroup.level1.replace(/^\d+\.\s*/, "")}</div>
                  </td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{row.manufacturer.brand}</td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{row.manufacturer.model}</td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", fontFamily: "monospace", fontWeight: 700, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{row.manufacturer.produceYear}</td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px",
                      background: sCfg.bg, color: sCfg.color, border: `1px solid ${sCfg.border}`,
                      whiteSpace: "nowrap",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: sCfg.color, flexShrink: 0 }} />
                      {sCfg.label}
                    </span>
                  </td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{row.installationLocation}</td>
                  <td style={{ padding: rowPad, borderBottom: "1px solid var(--color-border)" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                      <button onClick={() => onRowClick(row)} style={{ width: 26, height: 26, borderRadius: 5, border: "1px solid var(--color-border)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", transition: "all 0.12s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(233,34,39,0.08)"; e.currentTarget.style.color = "rgb(233,34,39)"; e.currentTarget.style.borderColor = "rgb(233,34,39)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}>
                        <Eye size={13} />
                      </button>
                      <button style={{ width: 26, height: 26, borderRadius: 5, border: "1px solid var(--color-border)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", transition: "all 0.12s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.borderColor = "#2563eb"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}>
                        <Pencil size={13} />
                      </button>
                      <button style={{ width: 26, height: 26, borderRadius: 5, border: "1px solid var(--color-border)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", transition: "all 0.12s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "8px", background: "var(--color-surface-2)", flexShrink: 0 }}>
        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
          Showing <strong>{Math.min((page - 1) * pageSize + 1, sorted.length)}</strong>–<strong>{Math.min(page * pageSize, sorted.length)}</strong> of <strong style={{ color: "rgb(233,34,39)" }}>{sorted.length}</strong>
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Rows:</span>
        <select value={pageSize} onChange={(e) => { setPageSize(+e.target.value); setPage(1); }}
          style={{ height: "28px", border: "1px solid var(--color-border)", borderRadius: "5px", fontSize: "12px", background: "var(--color-surface)", color: "var(--color-text-primary)", padding: "0 6px", cursor: "pointer" }}>
          {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => setPage(1)} disabled={page === 1} style={{ height: "28px", padding: "0 8px", border: "1px solid var(--color-border)", borderRadius: "5px", background: "var(--color-surface)", fontSize: "12px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, color: "var(--color-text-secondary)" }}>«</button>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ height: "28px", padding: "0 8px", border: "1px solid var(--color-border)", borderRadius: "5px", background: "var(--color-surface)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, color: "var(--color-text-secondary)" }}>
          <ChevronLeft size={13} />
        </button>
        {pageNums.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && pageNums[i - 1] !== p - 1 && <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>…</span>}
            <button onClick={() => setPage(p)} style={{ height: "28px", minWidth: "28px", padding: "0 6px", border: `1px solid ${page === p ? "rgb(233,34,39)" : "var(--color-border)"}`, borderRadius: "5px", background: page === p ? "rgb(233,34,39)" : "var(--color-surface)", color: page === p ? "white" : "var(--color-text-secondary)", fontSize: "12px", fontWeight: page === p ? 700 : 400, cursor: "pointer", transition: "all 0.12s" }}>
              {p}
            </button>
          </React.Fragment>
        ))}
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ height: "28px", padding: "0 8px", border: "1px solid var(--color-border)", borderRadius: "5px", background: "var(--color-surface)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, color: "var(--color-text-secondary)" }}>
          <ChevronRight size={13} />
        </button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ height: "28px", padding: "0 8px", border: "1px solid var(--color-border)", borderRadius: "5px", background: "var(--color-surface)", fontSize: "12px", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, color: "var(--color-text-secondary)" }}>»</button>
      </div>
    </div>
  );
}
