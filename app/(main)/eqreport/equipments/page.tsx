import { EquipmentPageInner } from "./_components/EquipmentWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý thiết bị |  Hệ thống Quản lí thiết bị Cơ khí",
};

export default async function EquipmentPage() {
  return <EquipmentPageInner />;
}
