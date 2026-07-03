"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Layers,
} from "lucide-react";
import type { EquipmentGroupRecord } from "@/types/equipment-group";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function SortIcon({ state }: { state: "asc" | "desc" | false }) {
  if (state === "asc") return <ChevronUp size={12} />;
  if (state === "desc") return <ChevronDown size={12} />;
  return <ChevronsUpDown size={12} style={{ opacity: 0.4 }} />;
}

// Custom styled checkbox that supports indeterminate state
function SelectCheckbox({
  checked,
  indeterminate,
  onChange,
  title,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate ?? false;
  }, [indeterminate]);

  const isActive = checked || indeterminate;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={title}
    >
      <div
        style={{
          width: 15,
          height: 15,
          border: `2px solid ${isActive ? "rgb(233,34,39)" : "var(--color-border)"}`,
          borderRadius: 3,
          background: isActive ? "rgb(233,34,39)" : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.12s",
          flexShrink: 0,
          position: "relative",
        }}
        onClick={() => ref.current?.click()}
      >
        {indeterminate && !checked ? (
          <span
            style={{
              color: "white",
              fontSize: 9,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            —
          </span>
        ) : checked ? (
          <span
            style={{
              color: "white",
              fontSize: 9,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            ✓
          </span>
        ) : null}
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

const PAGE_SIZES = [10, 20, 50, 100];

const LEVEL_CFG: Record<number, { bg: string; color: string; border: string }> =
  {
    1: {
      bg: "rgba(233,34,39,0.08)",
      color: "rgb(233,34,39)",
      border: "rgba(233,34,39,0.2)",
    },
    2: {
      bg: "rgba(59,130,246,0.08)",
      color: "#2563eb",
      border: "rgba(59,130,246,0.2)",
    },
    3: {
      bg: "rgba(16,185,129,0.08)",
      color: "#059669",
      border: "rgba(16,185,129,0.2)",
    },
    4: {
      bg: "rgba(139,92,246,0.08)",
      color: "#7c3aed",
      border: "rgba(139,92,246,0.2)",
    },
  };

function LevelBadge({ level, value }: { level: number; value: string }) {
  const cfg = LEVEL_CFG[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 9999,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
        maxWidth: 160,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={value}
    >
      {value}
    </span>
  );
}

function buildPageNums(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EquipmentGroupTableProps {
  data: EquipmentGroupRecord[];
  isLoading?: boolean;
  /** Controlled search term — owned by the page client, passed through the toolbar */
  globalFilter: string;
  onEdit: (group: EquipmentGroupRecord) => void;
  onDelete: (group: EquipmentGroupRecord) => void;
  /** Bubbles the live filtered count up to the parent for the results bar */
  onFilteredCountChange?: (count: number) => void;
  /** Bubbles the selected rows up to the parent for bulk actions */
  onSelectionChange?: (selectedRows: EquipmentGroupRecord[]) => void;
}

export function EquipmentGroupTable({
  data,
  isLoading,
  globalFilter,
  onEdit,
  onDelete,
  onFilteredCountChange,
  onSelectionChange,
}: EquipmentGroupTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [globalFilter]);

  // Clear selection when data changes (e.g. after delete)
  useEffect(() => {
    setRowSelection({});
  }, [data]);

  // ── Column definitions ────────────────────────────────────────────
  const columns = useMemo<ColumnDef<EquipmentGroupRecord>[]>(
    () => [
      // ── Select checkbox column ──────────────────────────────────
      {
        id: "select",
        size: 44,
        enableSorting: false,
        header: ({ table }) => (
          <SelectCheckbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            title={
              table.getIsAllPageRowsSelected()
                ? "Bỏ chọn tất cả"
                : "Chọn tất cả trang này"
            }
          />
        ),
        cell: ({ row }) => (
          <SelectCheckbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
            title={row.getIsSelected() ? "Bỏ chọn" : "Chọn hàng này"}
          />
        ),
      },
      // ── Index ───────────────────────────────────────────────────
      {
        id: "index",
        header: "#",
        size: 44,
        enableSorting: false,
        cell: ({ row, table }) => {
          const idx =
            table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
            row.index +
            1;
          return (
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                fontFamily: "monospace",
              }}
            >
              {idx}
            </span>
          );
        },
      },
      {
        accessorKey: "level1",
        header: "Nhóm (L1)",
        size: 180,
        cell: ({ getValue }) => (
          <LevelBadge level={1} value={getValue<string>()} />
        ),
      },
      {
        accessorKey: "level2",
        header: "Loại (L2)",
        size: 160,
        cell: ({ getValue }) => (
          <LevelBadge level={2} value={getValue<string>()} />
        ),
      },
      {
        accessorKey: "level3",
        header: "Cấu hình (L3)",
        size: 150,
        cell: ({ getValue }) => (
          <LevelBadge level={3} value={getValue<string>()} />
        ),
      },
      {
        accessorKey: "level4",
        header: "Công suất (L4)",
        size: 110,
        cell: ({ getValue }) => (
          <LevelBadge level={4} value={getValue<string>()} />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        size: 110,
        cell: ({ getValue }) => (
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 90,
        enableSorting: false,
        cell: ({ row }) => (
          <div
            style={{ display: "flex", gap: 4, justifyContent: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Edit"
              onClick={() => onEdit(row.original)}
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
                e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                e.currentTarget.style.color = "#2563eb";
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "var(--color-text-muted)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <Pencil size={12} />
            </button>
            <button
              aria-label="Delete"
              onClick={() => onDelete(row.original)}
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
                e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "var(--color-text-muted)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  // ── Table instance ────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: () => {}, // controlled externally — no-op setter
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row._id,
  });

  // Bubble filtered count up for the results bar in page-client
  const filteredCount = table.getFilteredRowModel().rows.length;
  useEffect(() => {
    onFilteredCountChange?.(filteredCount);
  }, [filteredCount, onFilteredCountChange]);

  // Bubble selected rows up to the parent for bulk-delete button
  useEffect(() => {
    const selectedIds = Object.keys(rowSelection).filter(
      (k) => rowSelection[k],
    );
    const selectedRows = data.filter((r) => selectedIds.includes(r._id));
    onSelectionChange?.(selectedRows);
  }, [rowSelection, data, onSelectionChange]);

  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pageNums = buildPageNums(pageIndex + 1, pageCount);
  const rowFrom = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const rowTo = Math.min((pageIndex + 1) * pageSize, filteredCount);

  const selectedCount = Object.keys(rowSelection).filter(
    (k) => rowSelection[k],
  ).length;

  // ── Render ────────────────────────────────────────────────────────
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
      {/* ── Table scroll area — only this overflows ── */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: 13,
          }}
        >
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const isCenter =
                    header.id === "select" ||
                    header.id === "index" ||
                    header.id === "actions";
                  return (
                    <th
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        padding:
                          header.id === "select" ? "9px 6px" : "9px 12px",
                        background: "var(--color-surface-2)",
                        borderBottom: "2px solid var(--color-border)",
                        textAlign: isCenter ? "center" : "left",
                        position: "sticky",
                        top: 0,
                        zIndex: 5,
                        whiteSpace: "nowrap",
                        cursor: header.column.getCanSort()
                          ? "pointer"
                          : "default",
                        userSelect: "none",
                      }}
                      onClick={
                        header.id === "select"
                          ? undefined
                          : header.column.getToggleSortingHandler()
                      }
                    >
                      {header.id === "select" ? (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--color-text-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            justifyContent: isCenter ? "center" : "flex-start",
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanSort() && (
                            <SortIcon state={header.column.getIsSorted()} />
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        className="skeleton"
                        style={{
                          height: 16,
                          borderRadius: 4,
                          width: j === 0 ? 15 : j === 1 ? 28 : "80%",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
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
                      gap: 10,
                    }}
                  >
                    <Layers size={36} style={{ opacity: 0.2 }} />
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {globalFilter
                        ? "Không tìm thấy kết quả"
                        : "Chưa có nhóm thiết bị nào"}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {globalFilter
                        ? "Thử thay đổi từ khoá tìm kiếm"
                        : 'Nhấn "Thêm nhóm" để thêm nhóm đầu tiên'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    style={{
                      transition: "background 0.1s",
                      background: isSelected
                        ? "rgba(233,34,39,0.04)"
                        : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.background = "var(--color-surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.background = "";
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isCenter =
                        cell.column.id === "select" ||
                        cell.column.id === "index" ||
                        cell.column.id === "actions";
                      return (
                        <td
                          key={cell.id}
                          style={{
                            padding:
                              cell.column.id === "select"
                                ? "9px 6px"
                                : "9px 12px",
                            borderBottom: "1px solid var(--color-border)",
                            verticalAlign: "middle",
                            textAlign: isCenter ? "center" : "left",
                          }}
                          onClick={
                            cell.column.id === "select"
                              ? (e) => e.stopPropagation()
                              : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination — fixed at bottom, never scrolls ── */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "space-between",
          flexShrink: 0,
          background: "var(--color-surface)",
        }}
      >
        {/* Left: row range info + optional selection badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            Đang hiện{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {rowFrom}–{rowTo}
            </strong>{" "}
            trên{" "}
            <strong style={{ color: "rgb(233,34,39)" }}>{filteredCount}</strong>
            {filteredCount !== data.length && (
              <span style={{ color: "var(--color-text-muted)" }}>
                {" "}
                (lọc từ {data.length})
              </span>
            )}
          </span>

          {/* Selection badge */}
          {selectedCount > 0 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 10px",
                borderRadius: 9999,
                background: "rgba(233,34,39,0.08)",
                color: "rgb(233,34,39)",
                border: "1px solid rgba(233,34,39,0.2)",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ fontSize: 10 }}>✓</span>
              {selectedCount} đã chọn
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Hiện</span>
            <select
              value={pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "3px 6px",
                fontSize: 12,
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.12s",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgb(233,34,39)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border)")
              }
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn-ghost"
              style={{
                height: 30,
                padding: "0 8px",
                opacity: !table.getCanPreviousPage() ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={14} />
            </button>

            {pageNums.map((p, i) =>
              p === "…" ? (
                <span
                  key={`e-${i}`}
                  style={{
                    padding: "0 4px",
                    color: "var(--color-text-muted)",
                    fontSize: 13,
                  }}
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => table.setPageIndex(Number(p) - 1)}
                  style={{
                    width: 30,
                    height: 30,
                    border: `1px solid ${pageIndex + 1 === p ? "rgb(233,34,39)" : "var(--color-border)"}`,
                    borderRadius: 6,
                    background:
                      pageIndex + 1 === p ? "rgb(233,34,39)" : "transparent",
                    color:
                      pageIndex + 1 === p
                        ? "white"
                        : "var(--color-text-secondary)",
                    fontSize: 13,
                    fontWeight: pageIndex + 1 === p ? 700 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {p}
                </button>
              ),
            )}

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn-ghost"
              style={{
                height: 30,
                padding: "0 8px",
                opacity: !table.getCanNextPage() ? 0.4 : 1,
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
