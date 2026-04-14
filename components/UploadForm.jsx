"use client";

import { useState } from "react";
import FileDropZone from "./FileDropZone";

export default function UploadForm() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const [transcriptFiles, setTranscriptFiles] = useState([]);
  const [slideFiles, setSlideFiles] = useState([]);
  const [materialFiles, setMaterialFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      if (!subject.trim()) {
        throw new Error("Subject is required.");
      }

      if (!topic.trim()) {
        throw new Error("Topic is required.");
      }

      if (!transcriptFiles.length) {
        throw new Error("Transcript file is required.");
      }

      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("topic", topic);
      formData.append("transcript", transcriptFiles[0]);

      if (slideFiles.length > 0) {
        formData.append("slide", slideFiles[0]);
      }

      for (const file of materialFiles) {
        formData.append("materials", file);
      }

      const response = await fetch("/api/summarise", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate summary.");
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. TIM"
        />
      </div>

      <div>
        <label>Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Week5_baseline"
        />
      </div>

      <FileDropZone
        label="Upload Transcript"
        accept=".srt,.txt"
        files={transcriptFiles}
        onFilesChange={setTranscriptFiles}
        multiple={false}
      />

      <FileDropZone
        label="Upload Slide"
        accept=".pdf"
        files={slideFiles}
        onFilesChange={setSlideFiles}
        variant="secondary"
        multiple={false}
      />

      <FileDropZone
        label="Upload Supporting Materials"
        accept=".pdf,.txt,.json"
        files={materialFiles}
        onFilesChange={setMaterialFiles}
        variant="tertiary"
        multiple={true}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Summary"}
      </button>

      {error && <p>{error}</p>}

      {result && (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </form>
  );
}