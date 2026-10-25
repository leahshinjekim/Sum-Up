import { getSummaryHistory } from "@/services/historyService";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ success: false, error: "Authentication is required." }, { status: 401 });
    }

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
