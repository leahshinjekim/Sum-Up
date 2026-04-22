import mongoose from "mongoose";

const HeaderSchema = new mongoose.Schema(
  {
    lecture_title: { type: String, required: true },
    topic: { type: String, required: true },
    learning_goals: { type: [String], default: [] },
  },
  { _id: false },
);

const MainPointSchema = new mongoose.Schema(
  {
    cue: { type: String, required: true },
    summary: { type: String, required: true },
    example: { type: String, required: true },
    evidence: { type: String, required: true },
  },
  { _id: false },
);

const ReviewQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
  },
  { _id: false },
);

const SummarySchema = new mongoose.Schema(
  {
    subject: { type: String },
    enhanced: { type: Boolean, default: false },
    header: { type: HeaderSchema, required: true },
    main_points: { type: [MainPointSchema], required: true },
    takeaway: { type: String, required: true },
    review_questions: { type: [ReviewQuestionSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

const Summary =
  mongoose.models.Summary || mongoose.model("Summary", SummarySchema);

export default Summary;
