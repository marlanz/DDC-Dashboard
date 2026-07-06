import { getAllEquipments } from "@/lib/data/equipments";
import DashboardContent from "@/components/DashboardContent";
import { Metadata } from "next";
import { cacheLife } from "next/cache";

export const metadata: Metadata = {
  title: "Bảng thống kê thiết bị |  Hệ thống Quản lí thiết bị Cơ khí",
};

export default async function DashboardPage() {
  "use cache";
  cacheLife({ revalidate: 60 * 3 });
  // await connection();

  const equipments = await getAllEquipments();

  return <DashboardContent initialData={equipments} />;
}
