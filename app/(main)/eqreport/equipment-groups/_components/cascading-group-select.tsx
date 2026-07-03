"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EquipmentGroupRecord, EquipmentGroupSelection } from "@/types/equipment-group";

interface CascadingGroupSelectProps {
  groups: EquipmentGroupRecord[];
  value: EquipmentGroupSelection;
  onChange: (value: EquipmentGroupSelection) => void;
  disabled?: boolean;
}

export function CascadingGroupSelect({
  groups,
  value,
  onChange,
  disabled,
}: CascadingGroupSelectProps) {
  // ── Derive options client-side — no waterfall API calls ────────
  const level1Options = useMemo(
    () => [...new Set(groups.map((g) => g.level1))].sort(),
    [groups],
  );

  const level2Options = useMemo(() => {
    if (!value.level1) return [];
    return [
      ...new Set(
        groups.filter((g) => g.level1 === value.level1).map((g) => g.level2),
      ),
    ].sort();
  }, [groups, value.level1]);

  const level3Options = useMemo(() => {
    if (!value.level1 || !value.level2) return [];
    return [
      ...new Set(
        groups
          .filter((g) => g.level1 === value.level1 && g.level2 === value.level2)
          .map((g) => g.level3),
      ),
    ].sort();
  }, [groups, value.level1, value.level2]);

  const level4Options = useMemo(() => {
    if (!value.level1 || !value.level2 || !value.level3) return [];
    return [
      ...new Set(
        groups
          .filter(
            (g) =>
              g.level1 === value.level1 &&
              g.level2 === value.level2 &&
              g.level3 === value.level3,
          )
          .map((g) => g.level4),
      ),
    ].sort();
  }, [groups, value.level1, value.level2, value.level3]);

  // ── Handlers — cascades reset lower levels on parent change ───
  const onLevel1Change = (v: string) =>
    onChange({ level1: v, level2: "", level3: "", level4: "" });

  const onLevel2Change = (v: string) =>
    onChange({ ...value, level2: v, level3: "", level4: "" });

  const onLevel3Change = (v: string) =>
    onChange({ ...value, level3: v, level4: "" });

  const onLevel4Change = (v: string) =>
    onChange({ ...value, level4: v });

  const LEVELS = [
    {
      label: "Nhóm thiết bị",
      placeholder: "Chọn nhóm…",
      options: level1Options,
      val: value.level1,
      onChangeFn: onLevel1Change,
      isDisabled: false,
    },
    {
      label: "Loại thiết bị",
      placeholder: "Chọn loại…",
      options: level2Options,
      val: value.level2,
      onChangeFn: onLevel2Change,
      isDisabled: !value.level1 || level2Options.length === 0,
    },
    {
      label: "Cấu hình",
      placeholder: "Chọn cấu hình…",
      options: level3Options,
      val: value.level3,
      onChangeFn: onLevel3Change,
      isDisabled: !value.level2 || level3Options.length === 0,
    },
    {
      label: "Công suất",
      placeholder: "Chọn công suất…",
      options: level4Options,
      val: value.level4,
      onChangeFn: onLevel4Change,
      isDisabled: !value.level3 || level4Options.length === 0,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {LEVELS.map(({ label, placeholder, options, val, onChangeFn, isDisabled }) => (
        <div key={label} className="space-y-1.5">
          <label
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            {label}
          </label>
          <Select
            value={val || undefined}
            onValueChange={onChangeFn}
            disabled={disabled || isDisabled || groups.length === 0}
          >
            <SelectTrigger
              style={{
                height: 36,
                fontSize: 13,
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <SelectValue placeholder={groups.length === 0 ? "Chưa có dữ liệu" : placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt} style={{ fontSize: 13 }}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
