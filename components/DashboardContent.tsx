"use client";

import { useMemo, useState } from "react";
import type { Equipment } from "@/types/equipment";
import KpiCards from "@/components/KpiCards";
import Filters, { FilterState } from "@/components/Filters";
import {
  EquipmentByFactoryChart,
  StatusDistributionChart,
  TopGroupsChart,
  WorkCenterChart,
} from "@/components/Charts";
import EquipmentTable from "@/components/EquipmentTable";
import DetailDrawer from "@/components/DetailDrawer";
import { EQUIPMENT_STATUSES } from "@/lib/constants/equipment-status";

interface DashboardContentProps {
  /** Pre-fetched equipment data from the server (replaces static mock data). */
  initialData: Equipment[];
  searchValue?: string;
}

export default function DashboardContent({
  initialData,
  searchValue,
}: DashboardContentProps) {
  const [filters, setFilters] = useState<FilterState>({
    factories: [],
    groups: [],
    workCenters: [],
    produceYears: [],
    statuses: [],
  });
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );

  // Derived filter options from the full dataset
  const factories = useMemo(
    () => [...new Set(initialData.map((d) => d.organization.factory))].sort(),
    [initialData],
  );
  const groups = useMemo(
    () => [...new Set(initialData.map((d) => d.equipmentGroup.level1))].sort(),
    [initialData],
  );
  const workCenters = useMemo(
    () =>
      [...new Set(initialData.map((d) => d.organization.workCenter))].sort(),
    [initialData],
  );
  const produceYears = useMemo(
    () =>
      [...new Set(initialData.map((d) => d.manufacturer.produceYear))]
        .filter((y): y is number => y !== null)
        .sort(),
    [initialData],
  );

  // Filtered dataset based on active filter state
  const filtered = useMemo(() => {
    return initialData.filter((eq) => {
      if (
        filters.factories.length > 0 &&
        !filters.factories.includes(eq.organization.factory)
      )
        return false;
      if (
        filters.groups.length > 0 &&
        !filters.groups.includes(eq.equipmentGroup.level1)
      )
        return false;
      if (
        filters.workCenters.length > 0 &&
        !filters.workCenters.includes(eq.organization.workCenter)
      )
        return false;
      if (
        filters.produceYears.length > 0 &&
        !filters.produceYears.includes(String(eq.manufacturer.produceYear))
      )
        return false;
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(eq.status || "active")
      )
        return false;
      return true;
    });
  }, [initialData, filters]);

  // KPI stats derived from filtered data
  const kpi = useMemo(() => {
    const totalFactories = new Set(filtered.map((d) => d.organization.factory))
      .size;
    const totalWorkCenters = new Set(
      filtered.map((d) => d.organization.workCenter),
    ).size;
    const totalRegisteredEquipment = initialData.filter(
      (d) => d.status !== "pending-investment",
    ).length;
    const activeEquipment = filtered.filter(
      (d) => (d.status || "active") === "active",
    ).length;
    const pendingInvestment = filtered.filter(
      (d) => d.status === "pending-investment",
    ).length;
    return {
      totalFactories,
      totalWorkCenters,
      activeEquipment,
      pendingInvestment,
      totalRegisteredEquipment,
    };
  }, [filtered]);

  // Chart datasets
  const byFactory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((d) => {
      const factory = d.organization.factory;
      if (factory.toLowerCase().includes("dự kiến đầu tư")) return;
      map[factory] = (map[factory] || 0) + 1;
    });
    return Object.entries(map)
      .map(([factory, count]) => ({ factory, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  const statusDist = useMemo(() => {
    // Count each status in the filtered dataset
    const counts: Record<string, number> = {};
    filtered.forEach((d) => {
      const s = d.status || "active";
      counts[s] = (counts[s] || 0) + 1;
    });
    // Build bar chart data from the centralized config (preserves order, skips zero)
    return (
      Object.keys(EQUIPMENT_STATUSES) as (keyof typeof EQUIPMENT_STATUSES)[]
    ).flatMap((key) => {
      const count = counts[key] ?? 0;
      if (count === 0) return [];
      return [
        {
          status: key,
          label: EQUIPMENT_STATUSES[key].translate,
          count,
          color: EQUIPMENT_STATUSES[key].color,
        },
      ];
    });
  }, [filtered]);

  const topGroups = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((d) => {
      map[d.equipmentGroup.level2] = (map[d.equipmentGroup.level2] || 0) + 1;
    });
    const total = filtered.length || 1;
    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  const wcChartData = useMemo(() => {
    const wcMap: Record<string, Record<string, number>> = {};
    filtered.forEach((d) => {
      const wc = d.organization.workCenter;
      const f = d.organization.factory;
      if (!wcMap[wc]) wcMap[wc] = {};
      wcMap[wc][f] = (wcMap[wc][f] || 0) + 1;
    });
    return Object.entries(wcMap).map(([workCenter, fMap]) => ({
      workCenter,
      ...fMap,
    }));
  }, [filtered]);

  const produceYearData = useMemo(() => {
    const map: Record<number, number> = {};
    filtered.forEach((d) => {
      const year = d.manufacturer.produceYear;
      if (year === null) return;
      map[year] = (map[year] || 0) + 1;
    });
    return Object.entries(map)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [filtered]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "20px",
      }}
    >
      {/* KPI Cards */}
      <KpiCards
        totalEquipment={kpi.totalRegisteredEquipment}
        totalFactories={kpi.totalFactories}
        totalWorkCenters={kpi.totalWorkCenters}
        activeEquipment={kpi.activeEquipment}
        pendingInvestment={kpi.pendingInvestment}
      />

      {/* Filters */}
      {/* <Filters
        factories={factories}
        groups={groups}
        workCenters={workCenters}
        produceYears={produceYears}
        filters={filters}
        onFiltersChange={setFilters}
      /> */}

      {/* Charts Row 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr ",
          gap: "16px",
        }}
      >
        <EquipmentByFactoryChart data={byFactory} />
        <StatusDistributionChart data={statusDist} />
        {/* <ProduceYearChart data={produceYearData} /> */}
      </div>

      {/* Charts Row 2 */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <TopGroupsChart data={topGroups} />
        <WorkCenterChart data={wcChartData} factories={factories} />
      </div>

      {/* Equipment Table */}
      <EquipmentTable
        data={filtered}
        searchValue={searchValue}
        onRowClick={setSelectedEquipment}
      />

      {/* Detail Drawer */}
      {selectedEquipment && (
        <DetailDrawer
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
        />
      )}
    </div>
  );
}
