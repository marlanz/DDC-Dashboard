import type { Metadata } from "next";
import { EquipmentGroupPageClient } from "./_components/equipment-group-page-client";

export const metadata: Metadata = {
  title: "Nhóm thiết bị | Hệ thống Quản lí thiết bị Cơ khí",
  description:
    "Quản lý danh mục nhóm thiết bị 4 cấp — Nhóm, Loại, Cấu hình, Công suất. Master data dùng cho toàn hệ thống.",
};

export default function EquipmentGroupsPage() {
  return <EquipmentGroupPageClient />;
}
