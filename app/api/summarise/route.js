import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import { auth } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/mongodb";
import { SUMMARISE_PROMPT } from "@/lib/summarisePrompt";
import Summary from "@/models/Summary";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPPORTED_EXTENSIONS = new Set([".txt", ".srt", ".vtt", ".pdf"]);

function extensionFor(file) {
  const lastDot = file.name.lastIndexOf(".");
  return lastDot === -1 ? "" : file.name.slice(lastDot).toLowerCase();
}

function assertSupported(file, label) {
  const extension = extensionFor(file);
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(
      `${label} "${file.name}" is unsupported. Use TXT, SRT, VTT, or a text-based PDF.`,
    );
  }
  return extension;
}

function parseCaptions(content) {
  const withoutHeader = content
    .replace(/^\uFEFF?\s*WEBVTT[^\n]*(?:\r?\n|$)/i, "")
    .trim();
  const blocks = withoutHeader.split(/\r?\n\s*\r?\n/);
  const captions = [];

  for (const block of blocks) {
    const lines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const timestampIndex = lines.findIndex((line) => line.includes("-->"));

    if (timestampIndex === -1) continue;

    const caption = lines
      .slice(timestampIndex + 1)
      .filter((line) => !/^(NOTE|STYLE|REGION)\b/i.test(line))
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (caption) captions.push(caption);
  }

  return captions.join("\n");
}

async function extractText(file, label) {
  const extension = assertSupported(file, label);

  if (extension === ".pdf") {
    const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
    try {
      const { text } = await parser.getText();
      if (!text.trim()) {
        throw new Error(
          `${label} "${file.name}" has no extractable text. Scanned PDFs are not supported.`,
        );
      }
      return text.trim();
    } finally {
      await parser.destroy();
    }
  }

  const content = await file.text();
  const text = extension === ".srt" || extension === ".vtt" ? parseCaptions(content) : content.trim();
  if (!text) {
    throw new Error(`${label} "${file.name}" has no usable text.`);
  }
  return text;
}

function normaliseSummary(summary, topic) {
  if (!summary || typeof summary !== "object") {
    throw new Error("The AI returned an invalid summary.");
  }

  const header = summary.header && typeof summary.header === "object" ? summary.header : {};
  const mainPoints = Array.isArray(summary.main_points) ? summary.main_points : [];
  const takeaway = typeof summary.takeaway === "string" ? summary.takeaway.trim() : "";

  if (!mainPoints.length || !takeaway) {
    throw new Error("The AI returned an incomplete summary. Please try again.");
  }

  const normalisedPoints = mainPoints.map((point) => {
    const fields = ["cue", "summary", "example", "evidence"];
    if (!point || fields.some((field) => typeof point[field] !== "string" || !point[field].trim())) {
      throw new Error("The AI returned an incomplete main point. Please try again.");
    }
    return Object.fromEntries(fields.map((field) => [field, point[field].trim()]));
  });

  const reviewQuestions = Array.isArray(summary.review_questions)
    ? summary.review_questions
        .map((question) => (typeof question === "string" ? question : question?.question))
        .filter((question) => typeof question === "string" && question.trim())
        .map((question) => ({ question: question.trim() }))
    : [];

  return {
    header: {
      lecture_title: topic,
      topic: typeof header.topic === "string" && header.topic.trim() ? header.topic.trim() : topic,
      learning_goals: Array.isArray(header.learning_goals)
        ? header.learning_goals
            .filter((goal) => typeof goal === "string" && goal.trim())
            .map((goal) => goal.trim())
        : [],
    },
    main_points: normalisedPoints,
    takeaway,
    review_questions: reviewQuestions,
  };
}

async function generateSummary({ topic, transcript, slide, materials }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured in the server environment.");
  }

  const sources = [["Lecture Transcript", transcript]];
  if (slide) sources.push(["Slides", slide]);
  materials.forEach((material, index) => {
    sources.push([`Supporting Material ${index + 1}`, material]);
  });

  const inputText = sources.map(([name, text]) => `[${name}]\n${text}`).join("\n\n");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are an expert teaching assistant." },
      { role: "user", content: SUMMARISE_PROMPT.replace("{{INPUT_TEXT}}", inputText) },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("The AI returned an empty summary.");

  try {
    return normaliseSummary(JSON.parse(content), topic);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("The AI returned malformed JSON. Please try again.");
    }
    throw error;
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ success: false, error: "Authentication is required." }, { status: 401 });
    }

    const formData = await req.formData();
    const subject = String(formData.get("subject") || "").trim();
    const topic = String(formData.get("topic") || "").trim();
    const transcriptFile = formData.get("transcript");
    const slideFile = formData.get("slide");
    const materialFiles = formData.getAll("materials").filter((file) => file?.size > 0);

    if (!subject) return Response.json({ success: false, error: "Subject is required." }, { status: 400 });
    if (!topic) return Response.json({ success: false, error: "Topic is required." }, { status: 400 });
    if (!transcriptFile || transcriptFile.size === 0) {
      return Response.json({ success: false, error: "Transcript file is required." }, { status: 400 });
    }

    const transcript = await extractText(transcriptFile, "Transcript");
    const slide = slideFile?.size > 0 ? await extractText(slideFile, "Slide") : null;
    const materials = await Promise.all(
      materialFiles.map((file) => extractText(file, "Supporting material")),
    );
    const summary = await generateSummary({ topic, transcript, slide, materials });

    await connectDB();
    const savedSummary = await Summary.create({
      ...summary,
      subject,
      enhanced: Boolean(slide || materials.length),
    });

    return Response.json({ success: true, result: savedSummary });
  } catch (error) {
    console.error("Summarise route error:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to generate summary." },
      { status: 500 },
    );
  }
}
