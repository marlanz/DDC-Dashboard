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
        gap: "20px",
        padding: "20px",
      }}
    >
      {/* KPI Cards skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px",
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: "20px" }}>
            <div
              className="skeleton"
              style={{ height: "12px", width: "60%", marginBottom: "12px" }}
            />
            <div
              className="skeleton"
              style={{ height: "28px", width: "40%" }}
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: "20px" }}>
            <div
              className="skeleton"
              style={{ height: "14px", width: "50%", marginBottom: "16px" }}
            />
            <div className="skeleton" style={{ height: "200px" }} />
          </div>
        ))}
      </div>

      {/* Charts Row 2 skeleton */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: "20px" }}>
            <div
              className="skeleton"
              style={{ height: "14px", width: "40%", marginBottom: "16px" }}
            />
            <div className="skeleton" style={{ height: "200px" }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <div className="skeleton" style={{ height: "14px", width: "30%" }} />
        </div>
        <div style={{ padding: "0 20px" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "16px",
                padding: "14px 0",
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
