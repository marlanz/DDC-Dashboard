import { connection } from "next/server";

import { getAllEquipments } from "@/lib/data/equipments";
import DashboardContent from "@/components/DashboardContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng thống kê thiết bị |  Hệ thống Quản lí thiết bị Cơ khí",
};

export default async function DashboardPage() {
  await connection();

  const equipments = await getAllEquipments();

  return <DashboardContent initialData={equipments} />;
}
