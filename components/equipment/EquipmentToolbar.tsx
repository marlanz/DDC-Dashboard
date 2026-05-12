"use client";

import React from "react";
import {
  Search, SlidersHorizontal, FileSpreadsheet, Download, Plus,
  ChevronRight, Home, LayoutGrid, List, Columns, RefreshCw,
} from "lucide-react";

interface EquipmentToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  filterOpen: boolean;
  onToggleFilter: () => void;
  activeFiltersCount: number;
  density: "compact" | "normal" | "comfortable";
  onDensityChange: (d: "compact" | "normal" | "comfortable") => void;
  selectedCount: number;
  totalCount: number;
  onAddEquipment: () => void;
}

export default function EquipmentToolbar({
  search, onSearchChange, filterOpen, onToggleFilter, activeFiltersCount,
  density, onDensityChange, selectedCount, totalCount, onAddEquipment,
}: EquipmentToolbarProps) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Breadcrumb row */}
      <div
        style={{
          padding: "8px 20px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: "var(--color-text-muted)",
        }}
      >
        <Home size={12} />
        <span>EMS Pro</span>
        <ChevronRight size={11} />
        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Equipment Registry</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: "var(--color-text-muted)" }}>
          {totalCount} total records
          {selectedCount > 0 && (
            <span style={{ color: "rgb(233,34,39)", fontWeight: 600, marginLeft: 6 }}>
              · {selectedCount} selected
            </span>
          )}
        </span>
      </div>

      {/* Actions row */}
      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "nowrap",
        }}
      >
        {/* Filter toggle */}
        <button
          onClick={onToggleFilter}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 12px",
            height: "34px",
            border: `1px solid ${filterOpen || activeFiltersCount > 0 ? "rgb(233,34,39)" : "var(--color-border)"}`,
            borderRadius: "7px",
            background: filterOpen || activeFiltersCount > 0 ? "rgba(233,34,39,0.06)" : "var(--color-surface)",
            color: filterOpen || activeFiltersCount > 0 ? "rgb(233,34,39)" : "var(--color-text-secondary)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFiltersCount > 0 && (
            <span
              style={{
                background: "rgb(233,34,39)",
                color: "white",
                borderRadius: "9999px",
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 5px",
                lineHeight: 1.5,
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: "340px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, code, factory, brand..."
            style={{
              width: "100%",
              height: "34px",
              paddingLeft: "32px",
              paddingRight: search ? "30px" : "10px",
              border: "1px solid var(--color-border)",
              borderRadius: "7px",
              fontSize: "13px",
              background: "var(--color-surface-2)",
              color: "var(--color-text-primary)",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgb(233,34,39)";
              e.target.style.boxShadow = "0 0 0 3px rgba(233,34,39,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                fontSize: "16px",
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Density */}
        <div
          style={{
            display: "flex",
            border: "1px solid var(--color-border)",
            borderRadius: "7px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {(["compact", "normal", "comfortable"] as const).map((d, i) => (
            <button
              key={d}
              title={`${d.charAt(0).toUpperCase() + d.slice(1)} density`}
              onClick={() => onDensityChange(d)}
              style={{
                height: "34px",
                padding: "0 10px",
                border: "none",
                borderLeft: i > 0 ? "1px solid var(--color-border)" : "none",
                background: density === d ? "rgba(233,34,39,0.08)" : "var(--color-surface)",
                color: density === d ? "rgb(233,34,39)" : "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: density === d ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {d === "compact" ? "S" : d === "normal" ? "M" : "L"}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Bulk actions when rows selected */}
        {selectedCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 10px",
              height: "34px",
              background: "rgba(233,34,39,0.05)",
              border: "1px solid rgba(233,34,39,0.2)",
              borderRadius: "7px",
              fontSize: "12px",
              fontWeight: 500,
              color: "rgb(233,34,39)",
            }}
          >
            <span>{selectedCount} selected:</span>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "12px", padding: "0 4px", fontWeight: 600 }}
            >
              Export
            </button>
            <span style={{ color: "rgba(233,34,39,0.4)" }}>|</span>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "12px", padding: "0 4px", fontWeight: 600 }}
            >
              Delete
            </button>
          </div>
        )}

        {/* Refresh */}
        <button
          className="btn-ghost"
          style={{ height: "34px", padding: "0 10px", flexShrink: 0 }}
          title="Refresh data"
        >
          <RefreshCw size={14} />
        </button>

        {/* Import */}
        <button className="btn-ghost" style={{ height: "34px", flexShrink: 0 }}>
          <FileSpreadsheet size={14} />
          Import
        </button>

        {/* Export */}
        <button className="btn-ghost" style={{ height: "34px", flexShrink: 0 }}>
          <Download size={14} />
          Export
        </button>

        {/* Add */}
        <button
          className="btn-brand"
          onClick={onAddEquipment}
          style={{ height: "34px", flexShrink: 0, fontWeight: 600 }}
        >
          <Plus size={14} />
          Add Equipment
        </button>
      </div>
    </div>
  );
}
