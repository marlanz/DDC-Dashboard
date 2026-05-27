"use client";

import { useMemo, useState, useCallback, memo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Layers,
  FolderOpen,
  Folder,
  Zap,
} from "lucide-react";
import type { EquipmentGroupRecord } from "@/types/equipment-group";
import { LevelBadge, LEVEL_CFG, type LevelNumber } from "./level-badge";

// ---------------------------------------------------------------------------
// Tree data model
// ---------------------------------------------------------------------------

export interface TreeNode {
  id: string;
  label: string;
  level: LevelNumber;
  children: TreeNode[];
  /** Leaf nodes carry the original record */
  record?: EquipmentGroupRecord;
  /** Total number of L4 leaves under this node */
  leafCount: number;
}

function buildTree(records: EquipmentGroupRecord[]): TreeNode[] {
  const l1Map = new Map<string, TreeNode>();

  for (const rec of records) {
    // ── L1 ──
    if (!l1Map.has(rec.level1)) {
      l1Map.set(rec.level1, {
        id: rec.level1,
        label: rec.level1,
        level: 1,
        children: [],
        leafCount: 0,
      });
    }
    const n1 = l1Map.get(rec.level1)!;

    // ── L2 ──
    const l2Key = `${rec.level1}|${rec.level2}`;
    let n2 = n1.children.find((c) => c.id === l2Key);
    if (!n2) {
      n2 = { id: l2Key, label: rec.level2, level: 2, children: [], leafCount: 0 };
      n1.children.push(n2);
    }

    // ── L3 ──
    const l3Key = `${rec.level1}|${rec.level2}|${rec.level3}`;
    let n3 = n2.children.find((c) => c.id === l3Key);
    if (!n3) {
      n3 = { id: l3Key, label: rec.level3, level: 3, children: [], leafCount: 0 };
      n2.children.push(n3);
    }

    // ── L4 (leaf) ──
    const l4Key = `${rec.level1}|${rec.level2}|${rec.level3}|${rec.level4}`;
    let n4 = n3.children.find((c) => c.id === l4Key);
    if (!n4) {
      n4 = {
        id: l4Key,
        label: rec.level4,
        level: 4,
        children: [],
        record: rec,
        leafCount: 1,
      };
      n3.children.push(n4);
    }
  }

  // Roll-up leaf counts
  function rollup(node: TreeNode): number {
    if (node.children.length === 0) return node.leafCount;
    node.leafCount = node.children.reduce((s, c) => s + rollup(c), 0);
    return node.leafCount;
  }
  const roots = Array.from(l1Map.values());
  roots.forEach(rollup);
  return roots;
}

/** Returns node ids that match the search, plus all their ancestor ids */
function getMatchedIds(nodes: TreeNode[], q: string): Set<string> {
  const lower = q.toLowerCase();
  const matched = new Set<string>();

  function walk(node: TreeNode, ancestors: string[]): boolean {
    const selfMatch = node.label.toLowerCase().includes(lower);
    const childMatch = node.children.some((c) => walk(c, [...ancestors, node.id]));
    if (selfMatch || childMatch) {
      matched.add(node.id);
      ancestors.forEach((a) => matched.add(a));
    }
    return selfMatch || childMatch;
  }

  nodes.forEach((n) => walk(n, []));
  return matched;
}

// ---------------------------------------------------------------------------
// Highlight helper
// ---------------------------------------------------------------------------

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "rgba(233,34,39,0.18)",
          color: "rgb(233,34,39)",
          borderRadius: 2,
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

interface RowProps {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  selected: string | null;
  searchQuery: string;
  matchedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (node: TreeNode) => void;
  onEdit: (record: EquipmentGroupRecord) => void;
  onDelete: (record: EquipmentGroupRecord) => void;
  isLast: boolean;
  parentLines: boolean[];
}

const LEVEL_ICONS = {
  1: Folder,
  2: FolderOpen,
  3: Layers,
  4: Zap,
} as const;

const ROW_HEIGHT = 38;

const TreeRow = memo(function TreeRow({
  node,
  depth,
  expanded,
  selected,
  searchQuery,
  matchedIds,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  isLast,
  parentLines,
}: RowProps) {
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;
  const isLeaf = node.children.length === 0;
  const cfg = LEVEL_CFG[node.level];
  const Icon = LEVEL_ICONS[node.level];
  const isFiltered = searchQuery.length > 0;
  const isVisible = !isFiltered || matchedIds.has(node.id);

  if (!isVisible) return null;

  const indentPx = depth * 20;

  const handleRowClick = useCallback(() => {
    if (isLeaf) {
      onSelect(node);
    } else {
      onToggle(node.id);
    }
  }, [isLeaf, node, onSelect, onToggle]);

  return (
    <>
      <tr
        onClick={handleRowClick}
        style={{
          height: ROW_HEIGHT,
          background: isSelected
            ? "rgba(233,34,39,0.05)"
            : undefined,
          transition: "background 0.1s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          if (!isSelected)
            (e.currentTarget as HTMLTableRowElement).style.background =
              "var(--color-surface-2)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected)
            (e.currentTarget as HTMLTableRowElement).style.background = "";
        }}
      >
        {/* ── Tree cell ── */}
        <td
          style={{
            padding: "0 12px 0 0",
            borderBottom: "1px solid var(--color-border)",
            verticalAlign: "middle",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              paddingLeft: indentPx,
              minWidth: 0,
            }}
          >
            {/* Guide lines */}
            {parentLines.map((showLine, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  width: 20,
                  flexShrink: 0,
                  alignSelf: "stretch",
                  position: "relative",
                }}
              >
                {showLine && (
                  <span
                    style={{
                      position: "absolute",
                      left: 9,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: "var(--color-border)",
                    }}
                  />
                )}
              </span>
            ))}

            {/* Connector */}
            {depth > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  width: 20,
                  flexShrink: 0,
                  alignSelf: "stretch",
                  position: "relative",
                }}
              >
                {/* vertical part */}
                {!isLast && (
                  <span
                    style={{
                      position: "absolute",
                      left: 9,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: "var(--color-border)",
                    }}
                  />
                )}
                {/* elbow */}
                <span
                  style={{
                    position: "absolute",
                    left: 9,
                    top: 0,
                    height: "50%",
                    width: 1,
                    background: "var(--color-border)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 9,
                    top: "50%",
                    width: 11,
                    height: 1,
                    background: "var(--color-border)",
                  }}
                />
              </span>
            )}

            {/* Expand/collapse chevron */}
            <span
              style={{
                width: 20,
                height: 20,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: isLeaf ? "transparent" : "var(--color-text-muted)",
                transition: "transform 0.18s, color 0.12s",
                transform:
                  !isLeaf && isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                marginRight: 2,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLeaf) onToggle(node.id);
              }}
            >
              {!isLeaf && <ChevronDown size={13} />}
            </span>

            {/* Level icon */}
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: cfg.bg,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: cfg.color,
                flexShrink: 0,
                marginRight: 8,
              }}
            >
              <Icon size={13} />
            </span>

            {/* Label */}
            <span
              style={{
                fontSize: 13,
                fontWeight: isLeaf ? 400 : 600,
                color: isLeaf
                  ? "var(--color-text-primary)"
                  : "var(--color-text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              <Highlight text={node.label} query={searchQuery} />
            </span>
          </div>
        </td>

        {/* ── Level badge ── */}
        <td
          style={{
            padding: "0 12px",
            borderBottom: "1px solid var(--color-border)",
            verticalAlign: "middle",
            whiteSpace: "nowrap",
          }}
        >
          <LevelBadge level={node.level} value={cfg.label} showLevelTag />
        </td>

        {/* ── Count ── */}
        <td
          style={{
            padding: "0 12px",
            borderBottom: "1px solid var(--color-border)",
            verticalAlign: "middle",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {isLeaf ? (
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                fontFamily: "monospace",
              }}
            >
              —
            </span>
          ) : (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 9999,
                background: "rgba(107,114,128,0.08)",
                color: "var(--color-text-secondary)",
                border: "1px solid rgba(107,114,128,0.15)",
              }}
            >
              {node.leafCount}
            </span>
          )}
        </td>

        {/* ── Actions ── */}
        <td
          style={{
            padding: "0 12px",
            borderBottom: "1px solid var(--color-border)",
            verticalAlign: "middle",
            whiteSpace: "nowrap",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isLeaf && node.record ? (
            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
              <ActionBtn
                icon={<Pencil size={12} />}
                hoverColor="#2563eb"
                hoverBg="rgba(59,130,246,0.08)"
                hoverBorder="rgba(59,130,246,0.4)"
                title="Chỉnh sửa"
                onClick={() => onEdit(node.record!)}
              />
              <ActionBtn
                icon={<Trash2 size={12} />}
                hoverColor="#ef4444"
                hoverBg="rgba(239,68,68,0.08)"
                hoverBorder="rgba(239,68,68,0.4)"
                title="Xoá"
                onClick={() => onDelete(node.record!)}
              />
            </div>
          ) : (
            <span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "flex", justifyContent: "center" }}>
              —
            </span>
          )}
        </td>
      </tr>

      {/* ── Children (if expanded or search active) ── */}
      {(isExpanded || isFiltered) &&
        !isLeaf &&
        node.children.map((child, i) => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            selected={selected}
            searchQuery={searchQuery}
            matchedIds={matchedIds}
            onToggle={onToggle}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            isLast={i === node.children.length - 1}
            parentLines={[
              ...parentLines,
              depth > 0 ? !isLast : false,
            ]}
          />
        ))}
    </>
  );
});

// ---------------------------------------------------------------------------
// Action button helper
// ---------------------------------------------------------------------------

function ActionBtn({
  icon,
  hoverColor,
  hoverBg,
  hoverBorder,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  hoverColor: string;
  hoverBg: string;
  hoverBorder: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={title}
      title={title}
      onClick={onClick}
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
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.color = hoverColor;
        e.currentTarget.style.borderColor = hoverBorder;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
        e.currentTarget.style.color = "var(--color-text-muted)";
        e.currentTarget.style.borderColor = "var(--color-border)";
      }}
    >
      {icon}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface EquipmentGroupTreeTableProps {
  data: EquipmentGroupRecord[];
  isLoading?: boolean;
  globalFilter: string;
  selectedNodeId: string | null;
  onNodeSelect: (node: TreeNode | null) => void;
  onEdit: (record: EquipmentGroupRecord) => void;
  onDelete: (record: EquipmentGroupRecord) => void;
}

export function EquipmentGroupTreeTable({
  data,
  isLoading,
  globalFilter,
  selectedNodeId,
  onNodeSelect,
  onEdit,
  onDelete,
}: EquipmentGroupTreeTableProps) {
  const tree = useMemo(() => buildTree(data), [data]);

  // Default: expand all L1 nodes
  const defaultExpanded = useMemo(
    () => new Set(tree.map((n) => n.id)),
    [tree],
  );
  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);

  const matchedIds = useMemo(
    () => (globalFilter ? getMatchedIds(tree, globalFilter) : new Set<string>()),
    [tree, globalFilter],
  );

  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (node: TreeNode) => {
      onNodeSelect(selectedNodeId === node.id ? null : node);
    },
    [selectedNodeId, onNodeSelect],
  );

  const handleExpandAll = () => {
    const ids = new Set<string>();
    function collect(nodes: TreeNode[]) {
      nodes.forEach((n) => {
        if (n.children.length > 0) {
          ids.add(n.id);
          collect(n.children);
        }
      });
    }
    collect(tree);
    setExpanded(ids);
  };

  const handleCollapseAll = () => setExpanded(new Set());

  if (isLoading) {
    return <TreeSkeleton />;
  }

  if (tree.length === 0) {
    return <EmptyState filtered={!!globalFilter} />;
  }

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
      {/* Sub-toolbar: expand/collapse all */}
      <div
        style={{
          padding: "5px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 500 }}>
          Cây nhóm:
        </span>
        <button
          onClick={handleExpandAll}
          style={{
            fontSize: 11,
            color: "var(--color-text-secondary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            transition: "color 0.12s, background 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgb(233,34,39)";
            e.currentTarget.style.background = "rgba(233,34,39,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-secondary)";
            e.currentTarget.style.background = "none";
          }}
        >
          <ChevronDown size={10} />
          Mở rộng tất cả
        </button>
        <button
          onClick={handleCollapseAll}
          style={{
            fontSize: 11,
            color: "var(--color-text-secondary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            transition: "color 0.12s, background 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgb(233,34,39)";
            e.currentTarget.style.background = "rgba(233,34,39,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-secondary)";
            e.currentTarget.style.background = "none";
          }}
        >
          <ChevronRight size={10} />
          Thu gọn tất cả
        </button>

        {globalFilter && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: "rgb(233,34,39)",
              fontWeight: 600,
              background: "rgba(233,34,39,0.08)",
              border: "1px solid rgba(233,34,39,0.2)",
              borderRadius: 9999,
              padding: "1px 8px",
            }}
          >
            {matchedIds.size} kết quả khớp
          </span>
        )}
      </div>

      {/* Table scroll area */}
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
            <tr>
              <th
                style={{
                  padding: "9px 12px",
                  background: "var(--color-surface-2)",
                  borderBottom: "2px solid var(--color-border)",
                  textAlign: "left",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Tên nhóm / Phân cấp
              </th>
              <th
                style={{
                  padding: "9px 12px",
                  background: "var(--color-surface-2)",
                  borderBottom: "2px solid var(--color-border)",
                  textAlign: "left",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  width: 130,
                }}
              >
                Cấp bậc
              </th>
              <th
                style={{
                  padding: "9px 12px",
                  background: "var(--color-surface-2)",
                  borderBottom: "2px solid var(--color-border)",
                  textAlign: "center",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  width: 90,
                }}
              >
                Số lượng
              </th>
              <th
                style={{
                  padding: "9px 12px",
                  background: "var(--color-surface-2)",
                  borderBottom: "2px solid var(--color-border)",
                  textAlign: "center",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  width: 90,
                }}
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {tree.map((node, i) => (
              <TreeRow
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                selected={selectedNodeId}
                searchQuery={globalFilter}
                matchedIds={matchedIds}
                onToggle={handleToggle}
                onSelect={handleSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                isLast={i === tree.length - 1}
                parentLines={[]}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          background: "var(--color-surface)",
          fontSize: 12,
          color: "var(--color-text-secondary)",
        }}
      >
        <span>
          <strong style={{ color: "var(--color-text-primary)" }}>{tree.length}</strong> nhóm L1 ·{" "}
          <strong style={{ color: "rgb(233,34,39)" }}>{data.length}</strong> mục L4
        </span>
        <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>
          Nhấp vào mục L4 để xem chi tiết
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TreeSkeleton() {
  const rows = [0, 1, 2, 1, 2, 2, 1, 2, 2, 2]; // depth hints
  return (
    <div style={{ flex: 1, overflow: "hidden", background: "var(--color-surface)" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <tbody>
          {rows.map((depth, i) => (
            <tr key={i} style={{ height: 38 }}>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: depth * 20 }}>
                  <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 14, width: `${60 + Math.random() * 120}px`, borderRadius: 4 }} />
                </div>
              </td>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)" }}>
                <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 9999 }} />
              </td>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)", textAlign: "center" }}>
                <div className="skeleton" style={{ height: 20, width: 40, borderRadius: 9999, margin: "0 auto" }} />
              </td>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                  <div className="skeleton" style={{ width: 26, height: 26, borderRadius: 5 }} />
                  <div className="skeleton" style={{ width: 26, height: 26, borderRadius: 5 }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 40,
        color: "var(--color-text-muted)",
      }}
    >
      <Layers size={40} style={{ opacity: 0.2 }} />
      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-secondary)" }}>
        {filtered ? "Không tìm thấy kết quả" : "Chưa có nhóm thiết bị nào"}
      </div>
      <div style={{ fontSize: 13 }}>
        {filtered
          ? "Thử thay đổi từ khoá tìm kiếm"
          : 'Nhấn "Thêm nhóm" để thêm nhóm đầu tiên'}
      </div>
    </div>
  );
}
