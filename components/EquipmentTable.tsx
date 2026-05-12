"use client";

import { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { Equipment, EquipmentStatus } from "@/types/equipment";

const STATUS_MAP: Record<EquipmentStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "badge-active" },
  maintenance: { label: "Maintenance", cls: "badge-maintenance" },
  inactive: { label: "Inactive", cls: "badge-inactive" },
  inspection: { label: "Inspection", cls: "badge-inspection" },
};

type SortKey =
  | keyof Equipment
  | "factory"
  | "workCenter"
  | "brand"
  | "produceYear"
  | "group2";
type SortDir = "asc" | "desc" | null;

function SortIcon({ dir }: { dir: SortDir }) {
  if (!dir) return <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />;
  if (dir === "asc") return <ChevronUp size={13} />;
  return <ChevronDown size={13} />;
}

interface ColDef {
  key: SortKey;
  label: string;
  width?: number;
  render: (row: Equipment) => React.ReactNode;
}

const COLUMNS: ColDef[] = [
  {
    key: "equipmentName",
    label: "Equipment Name",
    width: 180,
    render: (r) => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 600, fontSize: "13px" }}>
          {r.equipmentName}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "var(--color-text-muted)",
            fontFamily: "monospace",
          }}
        >
          {r.equipmentCode}
        </span>
      </div>
    ),
  },
  {
    key: "group2",
    label: "Equipment Group",
    width: 160,
    render: (r) => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "12px" }}>{r.equipmentGroup.level2}</span>
        <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
          {r.equipmentGroup.level3}
        </span>
      </div>
    ),
  },
  {
    key: "factory",
    label: "Factory",
    width: 110,
    render: (r) => (
      <span style={{ fontSize: "12px" }}>{r.organization.factory}</span>
    ),
  },
  {
    key: "workCenter",
    label: "Work Center",
    width: 120,
    render: (r) => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "12px" }}>{r.organization.workCenter}</span>
        <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
          {r.organization.workshop}
        </span>
      </div>
    ),
  },
  {
    key: "brand",
    label: "Manufacturer",
    width: 130,
    render: (r) => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 500, fontSize: "12px" }}>
          {r.manufacturer.brand}
        </span>
        <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
          {r.manufacturer.model}
        </span>
      </div>
    ),
  },
  {
    key: "produceYear",
    label: "Year",
    width: 70,
    render: (r) => (
      <span
        style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 600 }}
      >
        {r.manufacturer.produceYear}
      </span>
    ),
  },
  {
    key: "installationLocation",
    label: "Location",
    width: 90,
    render: (r) => (
      <span style={{ fontSize: "12px" }}>{r.installationLocation}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    width: 120,
    render: (r) => {
      const s = r.status || "active";
      const info = STATUS_MAP[s];
      return <span className={`badge ${info.cls}`}>{info.label}</span>;
    },
  },
];

function getVal(row: Equipment, key: SortKey): string | number {
  switch (key) {
    case "factory":
      return row.organization.factory;
    case "workCenter":
      return row.organization.workCenter;
    case "brand":
      return row.manufacturer.brand;
    case "produceYear":
      return row.manufacturer.produceYear;
    case "group2":
      return row.equipmentGroup.level2;
    default:
      return "";
  }
}

const PAGE_SIZES = [10, 20, 50];

interface EquipmentTableProps {
  data: Equipment[];
  searchValue?: string;
  onRowClick: (row: Equipment) => void;
}

export default function EquipmentTable({
  data,
  searchValue,
  onRowClick,
}: EquipmentTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (!searchValue) return data;
    const q = searchValue.toLowerCase();
    return data.filter(
      (r) =>
        r.equipmentName.toLowerCase().includes(q) ||
        r.equipmentCode.toLowerCase().includes(q) ||
        r.organization.factory.toLowerCase().includes(q) ||
        r.manufacturer.brand.toLowerCase().includes(q) ||
        r.equipmentGroup.level2.toLowerCase().includes(q),
    );
  }, [data, searchValue]);

  const sorted = useMemo(() => {
    if (!sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = getVal(a, sortKey);
      const bv = getVal(b, sortKey);
      const cmp =
        typeof av === "number"
          ? av - (bv as number)
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === pageData.length) setSelected(new Set());
    else setSelected(new Set(pageData.map((r) => r.equipmentCode)));
  };

  return (
    <div
      className="card"
      style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Table Header Bar */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "15px" }}>
          Equipment Registry
        </div>
        <span
          style={{
            fontSize: "12px",
            background: "rgba(233,34,39,0.1)",
            color: "rgb(233,34,39)",
            padding: "2px 8px",
            borderRadius: "9999px",
            fontWeight: 600,
          }}
        >
          {sorted.length} records
        </span>
        {selected.size > 0 && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--color-text-secondary)",
              marginLeft: "4px",
            }}
          >
            {selected.size} selected
          </span>
        )}
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              padding: "2px 6px",
              fontSize: "13px",
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", flex: 1 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    border: `2px solid ${selected.size === pageData.length && pageData.length > 0 ? "rgb(233,34,39)" : "var(--color-border)"}`,
                    borderRadius: "3px",
                    background:
                      selected.size === pageData.length && pageData.length > 0
                        ? "rgb(233,34,39)"
                        : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    transition: "all 0.15s",
                  }}
                  onClick={toggleAll}
                >
                  {selected.size === pageData.length && pageData.length > 0 && (
                    <span
                      style={{
                        color: "white",
                        fontSize: "9px",
                        fontWeight: 800,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, cursor: "pointer" }}
                  onClick={() => handleSort(col.key)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {col.label}
                    <SortIcon dir={sortKey === col.key ? sortDir : null} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Search size={32} style={{ opacity: 0.3 }} />
                    <span style={{ fontWeight: 600 }}>No equipment found</span>
                    <span style={{ fontSize: "13px" }}>
                      Try adjusting your filters or search query
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((row) => {
                const isSelected = selected.has(row.equipmentCode);
                const isExpanded = expanded === row.equipmentCode;
                return [
                  <tr
                    key={row.equipmentCode}
                    className={isSelected ? "selected" : ""}
                    onClick={() => onRowClick(row)}
                    style={{ position: "relative" }}
                  >
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(row.equipmentCode, e);
                      }}
                    >
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          border: `2px solid ${isSelected ? "rgb(233,34,39)" : "var(--color-border)"}`,
                          borderRadius: "3px",
                          background: isSelected
                            ? "rgb(233,34,39)"
                            : "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          transition: "all 0.15s",
                        }}
                      >
                        {isSelected && (
                          <span
                            style={{
                              color: "white",
                              fontSize: "9px",
                              fontWeight: 800,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </td>
                    {COLUMNS.map((col) => (
                      <td key={col.key}>{col.render(row)}</td>
                    ))}
                  </tr>,
                ];
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
        >
          Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}–
          {Math.min(page * pageSize, sorted.length)} of {sorted.length}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost"
            style={{
              height: "30px",
              padding: "0 8px",
              opacity: page === 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let p = i + 1;
            if (totalPages > 7) {
              if (page <= 4) p = i + 1;
              else if (page >= totalPages - 3) p = totalPages - 6 + i;
              else p = page - 3 + i;
            }
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: "30px",
                  height: "30px",
                  border: `1px solid ${page === p ? "rgb(233,34,39)" : "var(--color-border)"}`,
                  borderRadius: "6px",
                  background: page === p ? "rgb(233,34,39)" : "transparent",
                  color: page === p ? "white" : "var(--color-text-secondary)",
                  fontSize: "13px",
                  fontWeight: page === p ? 700 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost"
            style={{
              height: "30px",
              padding: "0 8px",
              opacity: page === totalPages ? 0.4 : 1,
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
