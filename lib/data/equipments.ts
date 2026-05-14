import connectDB from "@/lib/mongodb";
import { EquipmentModel } from "@/models/equipment.model";
import type { Equipment } from "@/types/equipment";

/**
 * Fetches all equipment documents from MongoDB.
 * Must only be called from Server Components or Route Handlers.
 *
 * All values are converted to plain JSON-serialisable primitives so that
 * Next.js can safely pass them as props from the Server Component to the
 * "use client" DashboardContent without a serialisation error:
 *   - ObjectId  → string  (via .toString())
 *   - Date      → ISO string (via .toISOString())
 *   - Buffer    → not present in these schemas
 */
export async function getAllEquipments(): Promise<Equipment[]> {
  await connectDB();

  const docs = await EquipmentModel.find({}).sort({ no: 1 }).lean();

  return docs.map((doc) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plain: any = { ...doc };

    // Serialise ObjectId → string
    if (plain._id) plain._id = plain._id.toString();

    // Serialise Date → ISO string (keeps the field but as a plain string)
    if (plain.createdAt instanceof Date)
      plain.createdAt = plain.createdAt.toISOString();
    if (plain.updatedAt instanceof Date)
      plain.updatedAt = plain.updatedAt.toISOString();

    return plain as Equipment;
  });
}
