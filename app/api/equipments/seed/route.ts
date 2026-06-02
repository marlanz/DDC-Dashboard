import { NextResponse } from "next/server";

// import { data } from "@/data";
import { EquipmentModel } from "@/models/equipment.model";
import connectDB from "@/lib/mongodb";

// POST /api/equipments/seed
// Inserts all records from data.ts into MongoDB.
// Uses ordered:false so duplicates are skipped rather than aborting.
export async function POST() {
  try {
    await connectDB();

    // const result = await EquipmentModel.insertMany(data, {
    //   ordered: false, // continue past duplicate-key errors
    // }).catch((err) => {
    //   // insertMany with ordered:false throws a BulkWriteError but still
    //   // returns partial results on the error object.
    //   if (err.name === "BulkWriteError" || err.code === 11000) {
    //     return err.insertedDocs ?? [];
    //   }
    //   throw err;
    // });

    // const inserted = Array.isArray(result) ? result.length : result?.insertedCount ?? 0;

    // return NextResponse.json({
    //   message: "Seed complete",
    //   inserted,
    //   total: data.length,
    // });
  } catch (error) {
    console.error("[POST /api/equipments/seed]", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}

// DELETE /api/equipments/seed
// Wipes the entire equipment collection — use only during development.
export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not allowed in production" },
      { status: 403 },
    );
  }

  try {
    await connectDB();
    const result = await EquipmentModel.deleteMany({});
    return NextResponse.json({ deleted: result.deletedCount });
  } catch (error) {
    console.error("[DELETE /api/equipments/seed]", error);
    return NextResponse.json({ error: "Wipe failed" }, { status: 500 });
  }
}
