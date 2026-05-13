import { NextResponse } from "next/server";
import { EquipmentModel } from "@/models/equipment.model";
import connectDB from "@/lib/mongodb";

// GET /api/equipments
// Returns all equipment documents as JSON array
export async function GET() {
  try {
    await connectDB();
    const equipments = await EquipmentModel.find({}).lean();
    return NextResponse.json(equipments);
  } catch (error) {
    console.error("[GET /api/equipments]", error);
    return NextResponse.json(
      { error: "Failed to fetch equipments" },
      { status: 500 },
    );
  }
}
