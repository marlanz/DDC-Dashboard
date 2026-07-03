/**
 * Dashboard Loading Skeleton
 *
 * The App Router automatically wraps page.tsx in a <Suspense> boundary using
 * this file as the fallback, so the shell (sidebar, header) renders instantly
 * while the async MongoDB query resolves in page.tsx.
 */
export default function DashboardLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "10px 12px 12px",
        minHeight: "100%",
      }}
    >
      {/* KPI Cards skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "8px",
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="card"
            style={{ padding: "12px 14px", minHeight: "112px" }}
          >
            <div
              className="skeleton"
              style={{ height: "11px", width: "58%", marginBottom: "8px" }}
            />
            <div
              className="skeleton"
              style={{ height: "24px", width: "42%" }}
            />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "36px", width: "140px", borderRadius: "8px" }}
            />
          ))}
        </div>
      </div>

      {/* Charts Row 1 skeleton */}
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: "12px" }}>
            <div
              className="skeleton"
              style={{ height: "14px", width: "50%", marginBottom: "8px" }}
            />
            <div className="skeleton" style={{ height: "290px" }} />
          </div>
        ))}
      </div>

      {/* Charts Row 2 skeleton */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: "12px" }}>
            <div
              className="skeleton"
              style={{ height: "14px", width: "40%", marginBottom: "8px" }}
            />
            <div className="skeleton" style={{ height: "300px" }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="skeleton" style={{ height: "14px", width: "30%" }} />
        </div>
        <div style={{ padding: "0 12px" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "12px",
                padding: "10px 0",
                borderBottom: "1px solid var(--color-border)",
                alignItems: "center",
              }}
            >
              <div className="skeleton" style={{ height: "12px", width: "30px", flexShrink: 0 }} />
              <div className="skeleton" style={{ height: "12px", width: "180px" }} />
              <div className="skeleton" style={{ height: "12px", width: "100px" }} />
              <div className="skeleton" style={{ height: "12px", width: "120px" }} />
              <div className="skeleton" style={{ height: "12px", width: "80px" }} />
              <div className="skeleton" style={{ height: "20px", width: "70px", borderRadius: "9999px" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
