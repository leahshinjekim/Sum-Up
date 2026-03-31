import { getSummaryHistory } from "@/services/historyService";

export const runtime = "nodejs";

export async function GET() {
  try {
    const summaryHistory = await getSummaryHistory();

    return Response.json({
      success: true,
      summaryHistory,
    });
  } catch (error) {
    console.error("Histories route error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to fetch summary history",
      },
      { status: 500 },
    );
  }
}
