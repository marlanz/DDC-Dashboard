const HEADER_WIDTHS = [14, 30, 110, 200, 110, 90, 160, 120, 100, 70, 120] as const;

const ROW_CELL_WIDTHS: { w: number; flex: number | false; pill?: boolean }[] = [
  { w: 14, flex: false },
  { w: 30, flex: false },
  { w: 110, flex: false },
  { w: 0, flex: 2 },
  { w: 110, flex: false },
  { w: 90, flex: false },
  { w: 0, flex: 1 },
  { w: 120, flex: false },
  { w: 100, flex: false },
  { w: 50, flex: false },
  { w: 70, flex: false, pill: true },
];

interface EquipmentTableSkeletonProps {
  rowCount?: number;
  density?: "compact" | "normal" | "comfortable";
}

export default function EquipmentTableSkeleton({
  rowCount = 14,
  density = "normal",
}: EquipmentTableSkeletonProps) {
  const rowPad =
    density === "compact"
      ? "7px 16px"
      : density === "comfortable"
        ? "13px 16px"
        : "11px 16px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        background: "var(--color-surface)",
      }}
      aria-busy="true"
      aria-label="Loading equipment table"
    >
      <div style={{ flex: 1, overflow: "hidden" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "10px 16px",
            borderBottom: "2px solid var(--color-border)",
            background: "var(--color-surface-2)",
          }}
        >
          {HEADER_WIDTHS.map((w, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: w, height: 12, borderRadius: 3, flexShrink: 0 }}
            />
          ))}
        </div>

        {/* Body rows */}
        {Array.from({ length: rowCount }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "12px",
              padding: rowPad,
              borderBottom: "1px solid var(--color-border)",
              opacity: Math.max(0.35, 1 - i * 0.05),
            }}
          >
            {ROW_CELL_WIDTHS.map((cell, j) => (
              <div
                key={j}
                className="skeleton"
                style={{
                  width: cell.flex ? undefined : cell.w,
                  flex: cell.flex || undefined,
                  height: cell.pill ? 20 : 14,
                  borderRadius: cell.pill ? 9999 : 3,
                  flexShrink: cell.flex ? undefined : 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
          flexShrink: 0,
        }}
      >
        <div className="skeleton" style={{ width: 140, height: 14, borderRadius: 4 }} />
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: 28, height: 28, borderRadius: 6 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
