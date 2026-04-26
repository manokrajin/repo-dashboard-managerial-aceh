import { fetchSheetData } from "@/app/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchSheetData();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return Response.json(
      { error: "Failed to fetch spreadsheet data" },
      { status: 500 }
    );
  }
}
