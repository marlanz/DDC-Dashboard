export default function EquipmentKpiSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr repeat(4, 1fr)",
        gap: "12px",
        padding: "14px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
      aria-busy="true"
      aria-label="Loading equipment summary"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 14px",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            background: "var(--color-surface-2)",
          }}
        >
          <div
            className="skeleton"
            style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="skeleton"
              style={{ height: 22, width: "45%", marginBottom: 6, borderRadius: 4 }}
            />
            <div
              className="skeleton"
              style={{ height: 11, width: "70%", borderRadius: 3 }}
            />
          </div>
          {i === 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginLeft: 8,
              }}
            >
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className="skeleton"
                  style={{ height: 4, width: `${90 - j * 15}%`, borderRadius: 2 }}
                />
              ))}
            </div>
          )}
          {i > 0 && (
            <div
              className="skeleton"
              style={{ width: 36, height: 22, borderRadius: 4, flexShrink: 0 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
