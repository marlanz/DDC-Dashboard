"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  Suspense,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { data as allEquipment } from "@/data";
import type { Equipment, EquipmentFilters } from "@/types/equipment";

// ── sub-components ──────────────────────────────────────────────────────────
import EquipmentKpiRow from "@/app/equipments/_components/EquipmentKpiRow";
import EquipmentToolbar from "@/app/equipments/_components/EquipmentToolbar";
import EquipmentFilterPanel, {
  EMPTY_FILTERS,
} from "@/app/equipments/_components/EquipmentFilterPanel";
import EquipmentDataTable from "@/app/equipments/_components/EquipmentDataTable";
import EquipmentDetailPanel from "@/app/equipments/_components/EquipmentDetailPanel";

// ── helpers ─────────────────────────────────────────────────────────────────

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)].sort((a, b) => String(a).localeCompare(String(b)));
}

function buildFilterOptions(data: Equipment[]) {
  return {
    factories: uniq(data.map((d) => d.organization.factory)),
    workshops: uniq(data.map((d) => d.organization.workshop)),
    workCenters: uniq(data.map((d) => d.organization.workCenter)),
    layouts: uniq(data.map((d) => d.organization.layout)),
    group1s: uniq(data.map((d) => d.equipmentGroup.level1)),
    group2s: uniq(data.map((d) => d.equipmentGroup.level2)),
    brands: uniq(data.map((d) => d.manufacturer.brand)),
    countries: uniq(data.map((d) => d.manufacturer.country)),
    produceYears: uniq(data.map((d) => String(d.manufacturer.produceYear))),
  };
}

function applySearch(data: Equipment[], q: string): Equipment[] {
  if (!q.trim()) return data;
  const lq = q.toLowerCase();
  return data.filter(
    (r) =>
      r.equipmentName.toLowerCase().includes(lq) ||
      r.equipmentCode.toLowerCase().includes(lq) ||
      r.organization.factory.toLowerCase().includes(lq) ||
      r.manufacturer.brand.toLowerCase().includes(lq) ||
      r.manufacturer.model.toLowerCase().includes(lq) ||
      r.equipmentGroup.level2.toLowerCase().includes(lq),
  );
}

function applyFilters(data: Equipment[], f: EquipmentFilters): Equipment[] {
  return data.filter((r) => {
    if (f.factories.length && !f.factories.includes(r.organization.factory))
      return false;
    if (f.workshops.length && !f.workshops.includes(r.organization.workshop))
      return false;
    if (f.workCenters.length && !f.workCenters.includes(r.organization.workCenter))
      return false;
    if (f.layouts.length && !f.layouts.includes(r.organization.layout))
      return false;
    if (f.group1s.length && !f.group1s.includes(r.equipmentGroup.level1))
      return false;
    if (f.group2s.length && !f.group2s.includes(r.equipmentGroup.level2))
      return false;
    if (f.brands.length && !f.brands.includes(r.manufacturer.brand))
      return false;
    if (f.countries.length && !f.countries.includes(r.manufacturer.country))
      return false;
    if (
      f.produceYears.length &&
      !f.produceYears.includes(String(r.manufacturer.produceYear))
    )
      return false;
    if (f.statuses.length && !f.statuses.includes(r.status ?? "active"))
      return false;
    return true;
  });
}

function countActiveFilters(f: EquipmentFilters): number {
  return (Object.values(f) as string[][]).reduce((acc, v) => acc + v.length, 0);
}

// ── URL ↔ filter state serialization ────────────────────────────────────────

function filtersToParams(f: EquipmentFilters): Record<string, string> {
  const out: Record<string, string> = {};
  (Object.keys(f) as (keyof EquipmentFilters)[]).forEach((k) => {
    if (f[k].length) out[k] = f[k].join(",");
  });
  return out;
}

function paramsToFilters(p: URLSearchParams): EquipmentFilters {
  const f = { ...EMPTY_FILTERS };
  (Object.keys(f) as (keyof EquipmentFilters)[]).forEach((k) => {
    const v = p.get(k);
    if (v) (f[k] as string[]) = v.split(",");
  });
  return f;
}

// ── Loading shimmer ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* header row shimmer */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "10px 16px",
          borderBottom: "2px solid var(--color-border)",
          background: "var(--color-surface-2)",
        }}
      >
        {[14, 30, 110, 200, 110, 90, 160, 120, 100, 70, 120].map((w, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: w, height: 12, borderRadius: 3, flexShrink: 0 }}
          />
        ))}
      </div>
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "12px",
            padding: "11px 16px",
            borderBottom: "1px solid var(--color-border)",
            opacity: 1 - i * 0.05,
          }}
        >
          <div className="skeleton" style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0 }} />
          <div className="skeleton" style={{ width: 30, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ width: 110, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ flex: 2, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ width: 110, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ width: 90, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ flex: 1, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ width: 50, height: 14, borderRadius: 3 }} />
          <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 9999 }} />
        </div>
      ))}
    </div>
  );
}

// ── Inner page (needs useSearchParams, wrapped in Suspense below) ────────────

function EquipmentPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── state initialised from URL ──
  const [filters, setFilters] = useState<EquipmentFilters>(() =>
    paramsToFilters(searchParams),
  );
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [filterOpen, setFilterOpen] = useState(
    () => countActiveFilters(paramsToFilters(searchParams)) > 0,
  );
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [detailEquipment, setDetailEquipment] = useState<Equipment | null>(null);
  const [density, setDensity] = useState<"compact" | "normal" | "comfortable">(
    "normal",
  );
  const [loading, setLoading] = useState(true);

  // ── debounced search ──
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // ── simulate async data load ──
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  // ── persist state to URL (shallow replace) ──
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    Object.entries(filtersToParams(filters)).forEach(([k, v]) =>
      params.set(k, v),
    );
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters]);

  // ── keyboard: ESC closes detail drawer ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailEquipment(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ── derived ──
  const filterOptions = useMemo(() => buildFilterOptions(allEquipment), []);

  const filteredData = useMemo(() => {
    let d = applySearch(allEquipment, debouncedSearch);
    d = applyFilters(d, filters);
    return d;
  }, [debouncedSearch, filters]);

  const afCount = countActiveFilters(filters);

  // ── callbacks (stable refs) ──
  const handleFiltersChange = useCallback(
    (f: EquipmentFilters) => setFilters(f),
    [],
  );
  const handleSearchChange = useCallback((v: string) => setSearch(v), []);
  const handleRowClick = useCallback((row: Equipment) => setDetailEquipment(row), []);
  const handleCloseDetail = useCallback(() => setDetailEquipment(null), []);

  // ── remove one filter chip ──
  const removeFilterValue = useCallback(
    (key: keyof EquipmentFilters, val: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: prev[key].filter((v) => v !== val),
      }));
    },
    [],
  );

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
      {/* ── Sticky toolbar (breadcrumb + search + actions) ── */}
      <EquipmentToolbar
        search={search}
        onSearchChange={handleSearchChange}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((o) => !o)}
        activeFiltersCount={afCount}
        density={density}
        onDensityChange={setDensity}
        selectedCount={selectedCodes.size}
        totalCount={allEquipment.length}
        onAddEquipment={() => {}}
      />

      {/* ── KPI summary strip ── */}
      <EquipmentKpiRow data={allEquipment} />

      {/* ── Body row: filter panel + table ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left collapsible filter panel */}
        <EquipmentFilterPanel
          open={filterOpen}
          options={filterOptions}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setFilterOpen(false)}
          resultCount={filteredData.length}
        />

        {/* Right: results info + chips + data table */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--color-surface)",
            borderTop: "1px solid var(--color-border)",
            borderLeft: filterOpen ? "none" : undefined,
          }}
        >
          {/* Active filter chips */}
          {afCount > 0 && (
            <div
              style={{
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flexWrap: "wrap",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-surface-2)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  flexShrink: 0,
                }}
              >
                Active:
              </span>

              {(Object.keys(filters) as (keyof EquipmentFilters)[]).map((key) =>
                filters[key].map((val) => (
                  <button
                    key={`${key}-${val}`}
                    onClick={() => removeFilterValue(key, val)}
                    aria-label={`Remove filter: ${val}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      padding: "1px 7px 1px 9px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(233,34,39,0.25)",
                      background: "rgba(233,34,39,0.06)",
                      color: "rgb(233,34,39)",
                      fontSize: "11px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(233,34,39,0.12)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "rgba(233,34,39,0.06)")
                    }
                  >
                    {val}
                    <span style={{ fontSize: "13px", lineHeight: 1, opacity: 0.7 }}>
                      ×
                    </span>
                  </button>
                )),
              )}

              <button
                onClick={() => handleFiltersChange({ ...EMPTY_FILTERS })}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: "1px 4px",
                  marginLeft: "2px",
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results count bar */}
          <div
            style={{
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
              Showing{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {filteredData.length}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "rgb(233,34,39)" }}>
                {allEquipment.length}
              </strong>{" "}
              records
            </span>

            {debouncedSearch && (
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  padding: "1px 6px",
                }}
              >
                Search: &ldquo;{debouncedSearch}&rdquo;
              </span>
            )}

            {selectedCodes.size > 0 && (
              <>
                <div style={{ flex: 1 }} />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "rgb(233,34,39)",
                    background: "rgba(233,34,39,0.06)",
                    border: "1px solid rgba(233,34,39,0.2)",
                    borderRadius: "9999px",
                    padding: "1px 8px",
                  }}
                >
                  {selectedCodes.size} selected
                </span>
              </>
            )}
          </div>

          {/* Table or loading shimmer */}
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <EquipmentDataTable
              data={filteredData}
              density={density}
              onRowClick={handleRowClick}
              selectedCodes={selectedCodes}
              onSelectionChange={setSelectedCodes}
            />
          )}
        </div>
      </div>

      {/* ── Slide-in detail drawer ── */}
      <EquipmentDetailPanel
        equipment={detailEquipment}
        onClose={handleCloseDetail}
      />
    </div>
  );
}

// ── Page export wrapped in Suspense (required for useSearchParams) ─────────

export default function EquipmentPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <LoadingSkeleton />
        </div>
      }
    >
      <EquipmentPageInner />
    </Suspense>
  );
}
