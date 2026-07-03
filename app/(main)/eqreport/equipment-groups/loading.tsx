export default function EquipmentGroupsLoading() {
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
      {/* Toolbar skeleton */}
      <div
        style={{
          padding: "0 20px",
          height: 56,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          gap: 12,
        }}
      >
        <div className="skeleton" style={{ height: 16, width: 200, borderRadius: 4 }} />
        <div style={{ flex: 1 }} />
        <div className="skeleton" style={{ height: 32, width: 32, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 34, width: 100, borderRadius: 6 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {/* Stats strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: "14px 16px" }}>
              <div className="skeleton" style={{ height: 12, width: "60%", borderRadius: 4, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 26, width: 48, borderRadius: 4 }} />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div
          className="card"
          style={{ overflow: "hidden" }}
        >
          {/* Toolbar */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div className="skeleton" style={{ height: 18, width: 200, borderRadius: 4 }} />
            <div style={{ flex: 1 }} />
            <div className="skeleton" style={{ height: 32, width: 240, borderRadius: 6 }} />
          </div>
          {/* Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div className="skeleton" style={{ height: 14, width: 24, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 22, width: 120, borderRadius: 9999 }} />
              <div className="skeleton" style={{ height: 22, width: 100, borderRadius: 9999 }} />
              <div className="skeleton" style={{ height: 22, width: 90, borderRadius: 9999 }} />
              <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 9999 }} />
              <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 4 }} />
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                <div className="skeleton" style={{ height: 28, width: 28, borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 28, width: 28, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
