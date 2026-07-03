import EquipmentKpiSkeleton from "./_components/EquipmentKpiSkeleton";
import EquipmentTableSkeleton from "./_components/EquipmentTableSkeleton";

/** Route-level fallback while the equipments page shell loads. */
export default function EquipmentLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <EquipmentKpiSkeleton />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <EquipmentTableSkeleton />
      </div>
    </div>
  );
}
