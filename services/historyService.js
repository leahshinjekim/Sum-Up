import { withDB } from "@/services/databaseService";
import Summary from "@/models/Summary";

export async function getSummaryHistory() {
  return withDB(async () => {
    const summaries = await Summary.find({})
      .sort({ createdAt: -1 })
      .select("subject header takeaway createdAt")
      .lean();

    return summaries.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));
  });
}

export async function getSummaryById(id) {
  return withDB(async () => {
    const summary = await Summary.findById(id).lean();

    if (!summary) return null;

    return {
      ...summary,
      _id: summary._id.toString(),
    };
  });
}

export async function deleteSummary(id) {
  return withDB(async () => {
    const deleted = await Summary.findByIdAndDelete(id).lean();

    if (!deleted) return null;

    return {
      ...deleted,
      _id: deleted._id.toString(),
    };
  });
}
