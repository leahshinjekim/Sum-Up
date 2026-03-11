import { getSummaryHistory } from "@/services/historyService";

export async function GET() {
  try {
    const histories = await getSummaryHistory();
    return Response.json({ success: true, summaries });
  } catch (error) {
    console.error("Histories route error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch histories." },
      { status: 500 },
    );
  }
}
