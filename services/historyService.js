import { withDB } from "@/services/mongodb.js";
import Summary from "@/models/Summary";

export async function getSummaryHistory() {
  return await withDB(() =>
    Summary.find()
      .sort({ createdAt: -1 })
      .select("subject topic overview createdAt"),
  );
}

export async function getSummaryById(id) {
  return await withDB(() => Summary.findById(id));
}

export async function deleteSummary(id) {
  return await withDB(() => Summary.findByIdAndDelete(id));
}
