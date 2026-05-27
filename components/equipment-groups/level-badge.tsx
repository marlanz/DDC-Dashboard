"use client";

// ---------------------------------------------------------------------------
// LevelBadge — colour-coded pill that matches LEVEL_CFG in equipment-group-table
// ---------------------------------------------------------------------------

export const LEVEL_CFG = {
  1: {
    bg: "rgba(233,34,39,0.08)",
    color: "rgb(233,34,39)",
    border: "rgba(233,34,39,0.2)",
    label: "Nhóm",
    short: "L1",
  },
  2: {
    bg: "rgba(59,130,246,0.08)",
    color: "#2563eb",
    border: "rgba(59,130,246,0.2)",
    label: "Loại",
    short: "L2",
  },
  3: {
    bg: "rgba(16,185,129,0.08)",
    color: "#059669",
    border: "rgba(16,185,129,0.2)",
    label: "Cấu hình",
    short: "L3",
  },
  4: {
    bg: "rgba(139,92,246,0.08)",
    color: "#7c3aed",
    border: "rgba(139,92,246,0.2)",
    label: "Công suất",
    short: "L4",
  },
} as const;

export type LevelNumber = keyof typeof LEVEL_CFG;

interface LevelBadgeProps {
  level: LevelNumber;
  value: string;
  maxWidth?: number;
  showLevelTag?: boolean;
}

export function LevelBadge({
  level,
  value,
  maxWidth = 160,
  showLevelTag = false,
}: LevelBadgeProps) {
  const cfg = LEVEL_CFG[level];
  return (
    <span
      title={value}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 9999,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
        maxWidth,
        overflow: "hidden",
        textOverflow: "ellipsis",
        flexShrink: 0,
      }}
    >
      {showLevelTag && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            opacity: 0.7,
            letterSpacing: "0.03em",
          }}
        >
          {cfg.short}
        </span>
      )}
      {value}
    </span>
  );
}

/** Small square indicator used in tree connectors */
export function LevelDot({ level }: { level: LevelNumber }) {
  const cfg = LEVEL_CFG[level];
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: 2,
        background: cfg.color,
        flexShrink: 0,
        opacity: 0.85,
      }}
    />
  );
}
