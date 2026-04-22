import fs from "fs/promises";
import path from "path";
import os from "os";
import { spawn } from "child_process";

function getPythonPath() {
  const root = process.cwd();

  const winVenv = path.join(root, "python", "venv", "Scripts", "python.exe");
  const unixVenv = path.join(root, "python", "venv", "bin", "python");

  return process.platform === "win32" ? winVenv : unixVenv;
}

function runPython(scriptPath, inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const pythonPath = getPythonPath();

    const child = spawn(
      pythonPath,
      [scriptPath, "--input", inputPath, "--output", outputPath],
      {
        cwd: process.cwd(),
        shell: false,
          env: {
            ...process.env,
            OPENAI_API_KEY: process.env.OPENAI_API_KEY,
          },
      }
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `Python exited with code ${code}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`
          )
        );
      }
    });
  });
}

export async function generateSummary({
  transcript,
  slides,
  materials,
  subject,
  topic,
}) {
  let inputPath = "";
  let outputPath = "";

  try {
    const requestId = `sumup-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    inputPath = path.join(os.tmpdir(), `${requestId}-input.json`);
    outputPath = path.join(os.tmpdir(), `${requestId}-output.json`);

    const payload = {
      transcript,
      slides,
      materials,
      subject,
      topic,
    };

    await fs.writeFile(inputPath, JSON.stringify(payload, null, 2), "utf-8");

    const scriptPath = path.join(process.cwd(), "python", "summarise_bridge.py");

    const { stdout, stderr } = await runPython(scriptPath, inputPath, outputPath);

    const raw = await fs.readFile(outputPath, "utf-8");
    const summary = JSON.parse(raw);

    return {
      summary,
      debug: {
        stdout,
        stderr,
      },
    };
  } finally {
    for (const filePath of [inputPath, outputPath]) {
      if (!filePath) continue;
      try {
        await fs.unlink(filePath);
      } catch {
        // ignore cleanup errors
      }
    }
  }
}