/**
 * @file equipment-status.ts
 * @description Centralized equipment status configuration — single source of truth.
 *
 * To add a new status:
 *   1. Add an entry to EQUIPMENT_STATUSES below.
 *   2. Everything else (filters, badges, charts, tables, KPI cards) updates automatically.
 */

// ---------------------------------------------------------------------------
// Core configuration
// ---------------------------------------------------------------------------

export const EQUIPMENT_STATUSES = {
  active: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    translate: "Đang hoạt động",
    badgeCls: "badge-active",
  },
  maintenance: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    translate: "Đang bảo trì",
    badgeCls: "badge-maintenance",
  },
  inactive: {
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
    translate: "Ngưng hoạt động",
    badgeCls: "badge-inactive",
  },
  sold: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    translate: "Đã thanh lý",
    badgeCls: "badge-sold",
  },
  "pending-investment": {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    translate: "Dự kiến đầu tư",
    badgeCls: "badge-pending",
  },
} as const;

// ---------------------------------------------------------------------------
// Derived types
// ---------------------------------------------------------------------------

export type EquipmentStatus = keyof typeof EQUIPMENT_STATUSES;

/** Loose interface so helpers like getStatusMeta() can return a safe fallback. */
export interface EquipmentStatusMeta {
  color: string;
  bg: string;
  translate: string;
  badgeCls: string;
}

// ---------------------------------------------------------------------------
// Derived collections
// ---------------------------------------------------------------------------

/**
 * Ready-to-use option list for filter dropdowns and select inputs.
 * Generated automatically — do NOT maintain manually.
 */
export const EQUIPMENT_STATUS_OPTIONS: {
  value: EquipmentStatus;
  label: string;
}[] = (Object.keys(EQUIPMENT_STATUSES) as EquipmentStatus[]).map((key) => ({
  value: key,
  label: EQUIPMENT_STATUSES[key].translate,
}));

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

const FALLBACK: EquipmentStatusMeta = {
  color: "#6b7280",
  bg: "rgba(107,114,128,0.1)",
  translate: "Không xác định",
  badgeCls: "badge-inactive",
};

/** Returns true if the given string is a valid EquipmentStatus key. */
export function isValidStatus(status: string): status is EquipmentStatus {
  return Object.prototype.hasOwnProperty.call(EQUIPMENT_STATUSES, status);
}

/** Returns the full metadata object for a status, or a safe fallback. */
export function getStatusMeta(status: string): EquipmentStatusMeta {
  if (isValidStatus(status)) return EQUIPMENT_STATUSES[status];
  return FALLBACK;
}

/** Returns the hex color for a status. */
export function getStatusColor(status: string): string {
  return getStatusMeta(status).color;
}

/** Returns the background color (rgba) for a status badge. */
export function getStatusBg(status: string): string {
  return getStatusMeta(status).bg;
}

/** Returns the Vietnamese display label for a status. */
export function getStatusLabel(status: string): string {
  return getStatusMeta(status).translate;
}

/** Returns the CSS badge class name for a status. */
export function getStatusBadgeCls(status: string): string {
  return getStatusMeta(status).badgeCls;
}
