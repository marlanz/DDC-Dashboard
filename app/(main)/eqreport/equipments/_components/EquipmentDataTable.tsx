"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Equipment, EquipmentFilters } from "@/types/equipment";
import { getEquipmentDocumentId } from "@/lib/equipment/equipmentRowId";
import { getStatusMeta } from "@/lib/constants/equipment-status";
import StatusBadge from "@/components/equipment/StatusBadge";


type SortKey =
  | "no"
  | "equipmentCode"
  | "equipmentName"
  | "factory"
  | "workshop"
  | "group2"
  | "brand"
  | "model"
  | "produceYear"
  | "status"
  | "installationLocation";
type SortDir = "asc" | "desc";

function SortBtn({
  col,
  sortKey,
  sortDir,
  onClick,
}: {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onClick: () => void;
}) {
  const active = sortKey === col;
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0 2px",
        color: active ? "rgb(233,34,39)" : "var(--color-text-muted)",
        display: "inline-flex",
      }}
    >
      {!active ? (
        <ChevronsUpDown size={12} />
      ) : sortDir === "asc" ? (
        <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} />
      )}
    </button>
  );
}

function getVal(r: Equipment, k: SortKey): string | number {
  switch (k) {
    case "factory":
      return r.organization.factory;
    case "workshop":
      return r.organization.workshop;
    case "group2":
      return r.equipmentGroup.level2;
    case "brand":
      return r.manufacturer.brand;
    case "model":
      return r.manufacturer.model;
    case "produceYear":
      return r.manufacturer.produceYear ?? "";
    case "status":
      return r.status ?? "active";
    default:
      return "";
  }
}

const PAGE_SIZES = [10, 20, 50, 100];

function CustomTblRow({
  col,
  label,
  width,
  sortKey,
  sortDir,
  handleSort,
}: {
  col: SortKey;
  label: string;
  width?: number;
  sortKey: SortKey;
  sortDir: SortDir;
  handleSort: (key: SortKey) => void;
}) {
  return (
    <th
      style={{
        width,
        padding: "9px 12px",
        background: "var(--color-surface-2)",
        borderBottom: "2px solid var(--color-border)",
        textAlign: "left",
        position: "sticky",
        top: 0,
        zIndex: 5,
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          fontSize: "11px",
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
        <SortBtn
          col={col}
          sortKey={sortKey}
          sortDir={sortDir}
          onClick={() => handleSort(col)}
        />
      </div>
    </th>
  );
}

function CustomCheckbox({
  checked,
  indeterminate,
  disabled,
  onClick,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width: "14px",
        height: "14px",
        border: `2px solid ${checked || indeterminate ? "rgb(233,34,39)" : "var(--color-border)"}`,
        borderRadius: "3px",
        background: checked ? "rgb(233,34,39)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
        margin: "0 auto",
        transition: "all 0.12s",
        opacity: disabled ? 0.35 : 1,
      }}
    >
      {checked && (
        <ChevronUp
          size={9}
          color="white"
          strokeWidth={3}
          style={{ transform: "rotate(45deg) translateX(1px) translateY(1px)" }}
        />
      )}
      {!checked && indeterminate && (
        <div
          style={{
            width: "6px",
            height: "2px",
            background: "rgb(233,34,39)",
            borderRadius: "1px",
          }}
        />
      )}
    </div>
  );
}

interface Props {
  data: Equipment[];
  density: "compact" | "normal" | "comfortable";
  onRowClick: (r: Equipment) => void;
  /** MongoDB document ids (`_id`), not equipment codes. */
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  searchQuery?: string;
  filters?: EquipmentFilters;
}

export default function EquipmentDataTable({
  data,
  density,
  onRowClick,
  selectedIds,
  onSelectionChange,
  searchQuery,
  filters,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Reset page to 1 when search query or filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters]);

  const rowPad =
    density === "compact"
      ? "6px 12px"
      : density === "comfortable"
        ? "14px 12px"
        : "10px 12px";
  const fontSize = density === "compact" ? "12px" : "13px";

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = getVal(a, sortKey),
        bv = getVal(b, sortKey);
      const cmp =
        typeof av === "number"
          ? av - (bv as number)
          : String(av).localeCompare(String(bv), "vi");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  // Clamp page to totalPages if it exceeds it (e.g., after filter changes or deletions)
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  const allPageSelected =
    pageData.length > 0 &&
    pageData.every((r) => {
      const id = getEquipmentDocumentId(r);
      return id != null && selectedIds.has(id);
    });

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allPageSelected) {
      pageData.forEach((r) => {
        const id = getEquipmentDocumentId(r);
        if (id) next.delete(id);
      });
    } else {
      pageData.forEach((r) => {
        const id = getEquipmentDocumentId(r);
        if (id) next.add(id);
      });
    }
    onSelectionChange(next);
  };

  const toggleRow = (id: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
  };

  const pageNums = useMemo(() => {
    const set = new Set<number>();
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      )
        set.add(i);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [page, totalPages]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        background: "var(--color-surface)",
      }}
    >
      {/* Table wrapper */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: 40,
                  padding: "9px 12px",
                  background: "var(--color-surface-2)",
                  borderBottom: "2px solid var(--color-border)",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                  textAlign: "center",
                }}
              >
                <CustomCheckbox
                  checked={allPageSelected}
                  indeterminate={
                    !allPageSelected &&
                    pageData.some((r) => {
                      const id = getEquipmentDocumentId(r);
                      return id != null && selectedIds.has(id);
                    })
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAll();
                  }}
                />
              </th>
              <th
                style={{
                  width: 40,
                  padding: "9px 8px",
                  background: "var(--color-surface-2)",
                  borderBottom: "2px solid var(--color-border)",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                #
              </th>
              <CustomTblRow
                col="equipmentCode"
                label="Mã MMTB"
                width={120}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <CustomTblRow
                col="equipmentName"
                label="Tên MMTB"
                width={200}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <CustomTblRow
                col="factory"
                label="Nhà máy"
                width={110}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <CustomTblRow
                col="workshop"
                label="Xưởng"
                width={90}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <CustomTblRow
                col="group2"
                label="Nhóm thiết bị"
                width={160}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <CustomTblRow
                col="brand"
                label="Hãng"
                width={120}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <CustomTblRow
                col="model"
                label="Model"
                width={100}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <CustomTblRow
                col="produceYear"
                label="Năm SX"
                width={40}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <CustomTblRow
                col="status"
                label="Trạng thái"
                width={120}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <CustomTblRow
                col="installationLocation"
                label="Khu vực lắp đặt"
                width={90}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
              />
              <th
                style={{
                  width: 90,
                  padding: "9px 12px",
                  background: "var(--color-surface-2)",
                  borderBottom: "2px solid var(--color-border)",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div style={{ fontSize: "32px", opacity: 0.3 }}>📋</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      No equipment found
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      Try adjusting your search or filter criteria
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => {
                const rowId = getEquipmentDocumentId(row);
                const selected = rowId != null && selectedIds.has(rowId);
                const hovered = rowId != null && hoveredRow === rowId;
                const status = row.status ?? "active";
                // Calculate display index for current row (1-based, continues across pages)
                const displayIndex = (page - 1) * pageSize + idx + 1;

                return (
                  <tr
                    key={rowId ?? `row-${displayIndex}`}
                    onClick={() => onRowClick(row)}
                    onMouseEnter={() => setHoveredRow(rowId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      cursor: "pointer",
                      background: selected
                        ? "rgba(233,34,39,0.04)"
                        : hovered
                          ? "var(--color-surface-2)"
                          : "var(--color-surface)",
                      borderLeft: selected
                        ? "2px solid rgb(233,34,39)"
                        : "2px solid transparent",
                      transition: "background 0.1s, border-color 0.1s",
                    }}
                  >
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        textAlign: "center",
                      }}
                      onClick={(e) => toggleRow(rowId, e)}
                    >
                      <CustomCheckbox
                        checked={selected}
                        disabled={!rowId}
                        onClick={(e) => toggleRow(rowId, e)}
                      />
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        textAlign: "center",
                        color: "var(--color-text-muted)",
                        fontSize: "11px",
                      }}
                    >
                      {displayIndex}
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "11px",
                          background: "var(--color-surface-2)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "4px",
                          padding: "1px 5px",
                          color: "var(--color-text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.equipmentCode === ""
                          ? "DỰ KIẾN ĐẦU TƯ"
                          : row.equipmentCode}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        maxWidth: 200,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.equipmentName}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--color-text-muted)",
                          marginTop: "1px",
                        }}
                      >
                        {row.equipmentGroup.level3}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        whiteSpace: "nowrap",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {row.organization.factory}
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        whiteSpace: "nowrap",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {row.organization.workshop}
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        maxWidth: 160,
                      }}
                    >
                      <div
                        style={{
                          fontSize,
                          color: "var(--color-text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.equipmentGroup.level2}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {row.equipmentGroup.level1.replace(/^\d+\.\s*/, "")}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.manufacturer.brand === ""
                        ? "-"
                        : row.manufacturer.brand}
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.manufacturer.model}
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.manufacturer.produceYear === 0
                        ? "-"
                        : row.manufacturer.produceYear}
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <StatusBadge status={status} />
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.installationLocation}
                    </td>
                    <td
                      style={{
                        padding: rowPad,
                        borderBottom: "1px solid var(--color-border)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => onRowClick(row)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 5,
                            border: "1px solid var(--color-border)",
                            background: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-text-muted)",
                            transition: "all 0.12s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(233,34,39,0.08)";
                            e.currentTarget.style.color = "rgb(233,34,39)";
                            e.currentTarget.style.borderColor =
                              "rgb(233,34,39)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.color =
                              "var(--color-text-muted)";
                            e.currentTarget.style.borderColor =
                              "var(--color-border)";
                          }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 5,
                            border: "1px solid var(--color-border)",
                            background: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-text-muted)",
                            transition: "all 0.12s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(59,130,246,0.08)";
                            e.currentTarget.style.color = "#2563eb";
                            e.currentTarget.style.borderColor = "#2563eb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.color =
                              "var(--color-text-muted)";
                            e.currentTarget.style.borderColor =
                              "var(--color-border)";
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 5,
                            border: "1px solid var(--color-border)",
                            background: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-text-muted)",
                            transition: "all 0.12s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(239,68,68,0.08)";
                            e.currentTarget.style.color = "#ef4444";
                            e.currentTarget.style.borderColor = "#ef4444";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.color =
                              "var(--color-text-muted)";
                            e.currentTarget.style.borderColor =
                              "var(--color-border)";
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "var(--color-surface-2)",
          flexShrink: 0,
        }}
      >
        <span
          style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
        >
          Showing{" "}
          <strong>{Math.min((page - 1) * pageSize + 1, sorted.length)}</strong>–
          <strong>{Math.min(page * pageSize, sorted.length)}</strong> of{" "}
          <strong style={{ color: "rgb(233,34,39)" }}>{sorted.length}</strong>
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
        >
          Rows:
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(+e.target.value);
            setPage(1);
          }}
          style={{
            height: "28px",
            border: "1px solid var(--color-border)",
            borderRadius: "5px",
            fontSize: "12px",
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            padding: "0 6px",
            cursor: "pointer",
          }}
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          style={{
            height: "28px",
            padding: "0 8px",
            border: "1px solid var(--color-border)",
            borderRadius: "5px",
            background: "var(--color-surface)",
            fontSize: "12px",
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.4 : 1,
            color: "var(--color-text-secondary)",
          }}
        >
          «
        </button>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            height: "28px",
            padding: "0 8px",
            border: "1px solid var(--color-border)",
            borderRadius: "5px",
            background: "var(--color-surface)",
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.4 : 1,
            color: "var(--color-text-secondary)",
          }}
        >
          <ChevronLeft size={13} />
        </button>
        {pageNums.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && pageNums[i - 1] !== p - 1 && (
              <span
                style={{ fontSize: "12px", color: "var(--color-text-muted)" }}
              >
                …
              </span>
            )}
            <button
              onClick={() => setPage(p)}
              style={{
                height: "28px",
                minWidth: "28px",
                padding: "0 6px",
                border: `1px solid ${page === p ? "rgb(233,34,39)" : "var(--color-border)"}`,
                borderRadius: "5px",
                background:
                  page === p ? "rgb(233,34,39)" : "var(--color-surface)",
                color: page === p ? "white" : "var(--color-text-secondary)",
                fontSize: "12px",
                fontWeight: page === p ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {p}
            </button>
          </React.Fragment>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{
            height: "28px",
            padding: "0 8px",
            border: "1px solid var(--color-border)",
            borderRadius: "5px",
            background: "var(--color-surface)",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            opacity: page === totalPages ? 0.4 : 1,
            color: "var(--color-text-secondary)",
          }}
        >
          <ChevronRight size={13} />
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          style={{
            height: "28px",
            padding: "0 8px",
            border: "1px solid var(--color-border)",
            borderRadius: "5px",
            background: "var(--color-surface)",
            fontSize: "12px",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            opacity: page === totalPages ? 0.4 : 1,
            color: "var(--color-text-secondary)",
          }}
        >
          »
        </button>
      </div>
    </div>
  );
}
