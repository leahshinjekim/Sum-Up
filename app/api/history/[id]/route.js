import { getSummaryById, deleteSummary, updateSummary } from "@/services/historyService";
import { auth } from "@clerk/nextjs/server";

async function requireUser() {
  const { userId } = await auth();
  return userId;
}

function unauthenticatedResponse() {
  return Response.json({ success: false, error: "Authentication is required." }, { status: 401 });
}

export async function GET(req, { params }) {
  if (!(await requireUser())) return unauthenticatedResponse();

  const { id } = await params;
  try {
    const summary = await getSummaryById(id);

    if (!summary) {
      return Response.json(
        { success: false, error: "Summary not found." },
        { status: 404 },
      );
    }

    return Response.json({ success: true, summary });
  } catch (error) {
    console.error("Get summary error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch summary." },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  if (!(await requireUser())) return unauthenticatedResponse();

  const { id } = await params;
  try {
    const { subject, lecture_title } = await req.json();
    const updated = await updateSummary(id, { subject, lecture_title });
    if (!updated)
      return Response.json({ success: false, error: "Not found." }, { status: 404 });
    return Response.json({ success: true, summary: updated });
  } catch (error) {
    console.error("Update summary error:", error);
    return Response.json({ success: false, error: "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!(await requireUser())) return unauthenticatedResponse();

  const { id } = await params;
  try {
    await deleteSummary(id);
    return Response.json({ success: true, message: "Summary deleted." });
  } catch (error) {
    console.error("Delete summary error:", error);
    return Response.json(
      { success: false, error: "Failed to delete summary." },
      { status: 500 },
    );
  }
}
