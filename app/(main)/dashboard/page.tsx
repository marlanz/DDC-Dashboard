import { getAllEquipments } from "@/lib/data/equipments";
import DashboardContent from "@/components/DashboardContent";

/**
 * Dashboard Page — Server Component.
 *
 * Fetches equipment data directly from MongoDB on the server (no client-side
 * fetch, no TanStack Query, no API round-trip).  The resolved data is passed
 * as serialisable props to the interactive DashboardContent Client Component,
 * which handles all filtering, chart computation and UI state.
 *
 * Loading state is handled by the sibling loading.tsx file which wraps this
 * page in a <Suspense> boundary automatically via the App Router.
 */
export default async function DashboardPage() {
  const equipments = await getAllEquipments();

  return <DashboardContent initialData={equipments} />;
}
