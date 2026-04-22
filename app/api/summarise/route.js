import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { spawn } from "child_process";

import { connectDB } from "@/lib/mongodb";
import Summary from "@/models/Summary";

export const runtime = "nodejs";

async function saveUploadedFile(file, targetDir) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const savedPath = path.join(targetDir, safeName);

  await fs.writeFile(savedPath, buffer);

  return {
    originalName: file.name,
    savedPath,
  };
}

async function removeDirectorySafe(dirPath) {
  try {
    if (existsSync(dirPath)) {
      await fs.rm(dirPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Failed to remove temp directory:", error);
  }
}

function runPythonScript(args, workingDir) {
  return new Promise((resolve, reject) => {
    const pythonCommand =
        process.platform === "win32"
            ? path.join(process.cwd(), "python", ".venv", "Scripts", "python.exe")
            : path.join(process.cwd(), "python", ".venv", "bin", "python");
    const child = spawn(pythonCommand, args, {
      cwd: workingDir,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("Python stdout:", stdout);
        resolve();
      } else {
        reject(
          new Error(`Python process failed with code ${code}\n${stderr || stdout}`)
        );
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

export async function POST(req) {
  const jobId = randomUUID();
  const uploadDir = path.join(process.cwd(), "tmp", "uploads", jobId);

  try {
    await fs.mkdir(uploadDir, { recursive: true });

    const formData = await req.formData();

    const subject = String(formData.get("subject") || "").trim();
    const topic = String(formData.get("topic") || "").trim();
    const transcript = formData.get("transcript");
    const slide = formData.get("slide");
    const materialFiles = formData.getAll("materials");

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject is required." },
        { status: 400 }
      );
    }

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Topic is required." },
        { status: 400 }
      );
    }

    if (!transcript || transcript.size === 0) {
      return NextResponse.json(
        { success: false, error: "Transcript file is required." },
        { status: 400 }
      );
    }

    const savedTranscript = await saveUploadedFile(transcript, uploadDir);
    
    let savedSlide = null;
    if (slide && slide.size > 0) {
        savedSlide = await saveUploadedFile(slide, uploadDir);
    }

    const savedMaterials = [];
    for (const file of materialFiles) {
      if (file && file.size > 0) {
        const saved = await saveUploadedFile(file, uploadDir);
        savedMaterials.push(saved);
      }
    }
    
    function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_");
    }
    const subjectSlug = slugify(subject);
    const topicSlug = slugify(topic);
    const outputFileName = `${subjectSlug}_${topicSlug}.json`;
    
    const pythonScriptPath = path.join(process.cwd(), "python", "summarise.py");

    const pythonArgs = [
        pythonScriptPath,
        savedTranscript.savedPath,  // input path(=uploaded transcript)
        outputFileName,   // output file name only, script will save to outputDir

        "--subject",
        subject,

        "--topic",
        topic,
    ];

    if (savedSlide) {
        pythonArgs.push("--slide", savedSlide.savedPath);
    }

    if (savedMaterials.length > 0) {
        pythonArgs.push("--materials", ...savedMaterials.map((f) => f.savedPath));
    }

    await runPythonScript(pythonArgs, process.cwd());
    // Result Folder: outputs/{subject}_{topic}/results/
    const resultJsonPath = path.join(
        process.cwd(),
        "outputs",
        `${subjectSlug}_${topicSlug}`,
        "results",
        outputFileName
    );

    const rawResult = await fs.readFile(resultJsonPath, "utf-8");
    const parsedResult = JSON.parse(rawResult);

    // ✅ MongoDB Save
    await connectDB();

    const savedSummary = await Summary.create({
    ...parsedResult,
    subject,
    topic,
    enhanced: !!(savedSlide || savedMaterials.length > 0),
    createdAt: new Date(),
    });

    // outputs/{subject}_{topic} folder cleanup after saving to DB
    const outputDir = path.join(
      process.cwd(),
      "outputs",
      `${subjectSlug}_${topicSlug}`
    );

    await removeDirectorySafe(outputDir);

    return NextResponse.json({
    success: true,
    result: savedSummary,
    });
  } catch (error) {
    console.error("Summarise route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate summary.",
      },
      { status: 500 }
    );
  } finally {
    await removeDirectorySafe(uploadDir);
  }
}