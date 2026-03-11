import mongoose from "mongoose";

const SummarySchema = new mongoose.Schema({
  subject: { type: String },
  topic: { type: String },
  transcript: { type: String, required: true },
  overview: { type: String },
  keyConcepts: { type: String },
  examPoints: { type: String },
  glossary: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Summary ||
  mongoose.model("Summary", SummarySchema);
