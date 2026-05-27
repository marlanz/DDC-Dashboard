"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Cpu, Layers, Network, Box } from "lucide-react";

import { EquipmentGroupTreeToolbar, type ViewMode } from "@/components/equipment-groups/equipment-group-toolbar";
import { EquipmentGroupTreeTable, type TreeNode } from "@/components/equipment-groups/equipment-group-tree-table";
import { EquipmentGroupDetailPanel } from "@/components/equipment-groups/equipment-group-detail-panel";
import { EquipmentGroupTable } from "./equipment-group-table";
import { EquipmentGroupDialog } from "./equipment-group-dialog";
import { DeleteEquipmentGroupDialog } from "./delete-equipment-group-dialog";
import type { EquipmentGroupRecord } from "@/types/equipment-group";
import type { ApiErrorResponse } from "@/lib/equipment-groups/api-types";

// ╔══════════════════════════════════════════════════════════════════╗
// ║  ⭐  MOCK DATA BLOCK — swap this out for live data in 2 steps   ║
// ║                                                                  ║
// ║  STEP 1: Delete the two lines below (import + mock assignment)   ║
// ║  STEP 2: Uncomment the `useEquipmentGroups` lines (search ⭐)   ║
// ╚══════════════════════════════════════════════════════════════════╝
import { MOCK_EQUIPMENT_GROUPS } from "@/lib/equipment-groups/mock-data"; // ⭐ DELETE
// import { useEquipmentGroups, useInvalidateEquipmentGroups } from "@/lib/equipment-groups/queries/use-equipment-groups"; // ⭐ UNCOMMENT

// ---------------------------------------------------------------------------
// KPI strip — mirrors EquipmentKpiRow style exactly
// ---------------------------------------------------------------------------

function GroupKpiStrip({
  groups,
  isLoading,
}: {
  groups: EquipmentGroupRecord[];
  isLoading: boolean;
}) {
  const totalGroups = groups.length;
  const uniqueL1 = new Set(groups.map((g) => g.level1)).size;
  const uniqueL2 = new Set(groups.map((g) => `${g.level1}|${g.level2}`)).size;
  const uniqueL3 = new Set(
    groups.map((g) => `${g.level1}|${g.level2}|${g.level3}`),
  ).size;

  const cards = [
    {
      label: "Tổng nhóm",
      value: totalGroups,
      color: "rgb(233,34,39)",
      bg: "rgba(233,34,39,0.04)",
      border: "rgba(233,34,39,0.2)",
      borderLeft: "3px solid rgb(233,34,39)",
      Icon: Cpu,
      iconBg: "rgba(233,34,39,0.1)",
    },
    {
      label: "Nhóm L1",
      value: uniqueL1,
      color: "#2563eb",
      bg: "rgba(59,130,246,0.04)",
      border: "rgba(59,130,246,0.2)",
      borderLeft: "3px solid #2563eb",
      Icon: Layers,
      iconBg: "rgba(59,130,246,0.1)",
    },
    {
      label: "Loại L2",
      value: uniqueL2,
      color: "#059669",
      bg: "rgba(16,185,129,0.04)",
      border: "rgba(16,185,129,0.2)",
      borderLeft: "3px solid #059669",
      Icon: Network,
      iconBg: "rgba(16,185,129,0.1)",
    },
    {
      label: "Cấu hình L3",
      value: uniqueL3,
      color: "#7c3aed",
      bg: "rgba(139,92,246,0.04)",
      border: "rgba(139,92,246,0.2)",
      borderLeft: "3px solid #7c3aed",
      Icon: Box,
      iconBg: "rgba(139,92,246,0.1)",
    },
  ] as const;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        padding: "14px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        flexShrink: 0,
      }}
    >
      {cards.map(
        ({ label, value, color, bg, border, borderLeft, Icon, iconBg }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              border: `1px solid ${border}`,
              borderLeft,
              borderRadius: 8,
              background: bg,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                flexShrink: 0,
              }}
            >
              <Icon size={17} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>
                {isLoading ? (
                  <div className="skeleton" style={{ height: 22, width: 36, borderRadius: 4 }} />
                ) : (
                  value
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page client — now supports Tree + Flat toggle
// ---------------------------------------------------------------------------

export function EquipmentGroupPageClient() {
  // ── Data ──────────────────────────────────────────────────────────
  // ⭐ REPLACE everything between the dashes with:
  //    const { data: groups = [], isLoading, isError, error, refetch } = useEquipmentGroups();
  //    const invalidate = useInvalidateEquipmentGroups();
  // ─────────────────────────────────────────────────────────────────
  const groups: EquipmentGroupRecord[] = MOCK_EQUIPMENT_GROUPS; // ⭐ DELETE
  const isLoading = false;
  const isError = false;
  const error: Error | null = null;
  const refetch = () => {};
  const invalidate = async () => {}; // ⭐ DELETE
  // ─────────────────────────────────────────────────────────────────

  // ── View toggle ───────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("tree");

  // ── Search ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Flat table filtered count ─────────────────────────────────────
  const [filteredCount, setFilteredCount] = useState(groups.length);

  // ── Tree selection (detail panel) ─────────────────────────────────
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // ── Flat table multi-select ───────────────────────────────────────
  const [selectedGroups, setSelectedGroups] = useState<EquipmentGroupRecord[]>([]);

  // ── Modal state ───────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EquipmentGroupRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EquipmentGroupRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleEdit = useCallback((record: EquipmentGroupRecord) => {
    setEditTarget(record);
    setSelectedNode(null);
  }, []);

  const handleDeleteRequest = useCallback((record: EquipmentGroupRecord) => {
    setDeleteTarget(record);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (group: EquipmentGroupRecord) => {
      try {
        const res = await fetch(`/api/equipment-groups/${group._id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err: ApiErrorResponse = await res.json();
          toast.error(err.error ?? "Xoá thất bại. Vui lòng thử lại.");
          return;
        }
        toast.success("Đã xoá nhóm thiết bị.");
        setDeleteOpen(false);
        setDeleteTarget(null);
        setSelectedNode(null);
        await invalidate();
        refetch();
      } catch {
        toast.error("Network error. Please try again.");
      }
    },
    [invalidate, refetch],
  );

  const handleMutationSuccess = useCallback(() => {
    invalidate();
    refetch();
  }, [invalidate, refetch]);

  const handleNodeSelect = useCallback((node: TreeNode | null) => {
    setSelectedNode(node);
  }, []);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "var(--color-background)",
      }}
    >
      {/* ── Toolbar ── */}
      <EquipmentGroupTreeToolbar
        search={search}
        onSearchChange={setSearch}
        onAddGroup={() => setCreateOpen(true)}
        onRefresh={refetch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={viewMode === "flat" ? selectedGroups.length : 0}
        onClearSelection={() => setSelectedGroups([])}
      />

      {/* ── Error banner ── */}
      {isError && (
        <div
          style={{
            padding: "10px 20px",
            background: "rgba(239,68,68,0.08)",
            borderBottom: "1px solid rgba(239,68,68,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "#ef4444",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 600 }}>⚠ Lỗi tải dữ liệu:</span>
          <span style={{ opacity: 0.85 }}>
            {(error as Error | null)?.message ?? "Unknown error"}
          </span>
          <button
            onClick={refetch}
            style={{
              marginLeft: "auto",
              padding: "4px 12px",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 6,
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── KPI strip ── */}
      <GroupKpiStrip groups={groups} isLoading={isLoading} />

      {/* ── Results count bar ── */}
      <div
        style={{
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          flexShrink: 0,
        }}
      >
        {isLoading ? (
          <div className="skeleton" style={{ height: 14, width: 180, borderRadius: 4 }} />
        ) : (
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {viewMode === "tree" ? (
              <>
                Đang hiển thị{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  cây phân cấp
                </strong>{" "}
                —{" "}
                <strong style={{ color: "rgb(233,34,39)" }}>{groups.length}</strong>{" "}
                mục L4 tổng cộng
              </>
            ) : (
              <>
                Showing{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  {filteredCount}
                </strong>{" "}
                of{" "}
                <strong style={{ color: "rgb(233,34,39)" }}>{groups.length}</strong>{" "}
                records
                {search && (
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {" "}— filtered by &ldquo;{search}&rdquo;
                  </span>
                )}
              </>
            )}
          </span>
        )}

        {/* View mode pill */}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 10px",
            borderRadius: 9999,
            background:
              viewMode === "tree"
                ? "rgba(233,34,39,0.08)"
                : "rgba(59,130,246,0.08)",
            color: viewMode === "tree" ? "rgb(233,34,39)" : "#2563eb",
            border:
              viewMode === "tree"
                ? "1px solid rgba(233,34,39,0.2)"
                : "1px solid rgba(59,130,246,0.2)",
          }}
        >
          {viewMode === "tree" ? "Chế độ cây" : "Chế độ bảng"}
        </span>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {viewMode === "tree" ? (
          <EquipmentGroupTreeTable
            data={groups}
            isLoading={isLoading}
            globalFilter={search}
            selectedNodeId={selectedNode?.id ?? null}
            onNodeSelect={handleNodeSelect}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        ) : (
          <EquipmentGroupTable
            data={groups}
            isLoading={isLoading}
            globalFilter={search}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onFilteredCountChange={setFilteredCount}
            onSelectionChange={setSelectedGroups}
          />
        )}
      </div>

      {/* ── Detail Panel (tree mode only) ── */}
      <EquipmentGroupDetailPanel
        record={selectedNode?.record ?? null}
        onClose={() => setSelectedNode(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* ── Dialogs ── */}
      <EquipmentGroupDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleMutationSuccess}
      />

      <EquipmentGroupDialog
        mode="edit"
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        editTarget={editTarget}
        onSuccess={handleMutationSuccess}
      />

      <DeleteEquipmentGroupDialog
        group={deleteTarget}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
