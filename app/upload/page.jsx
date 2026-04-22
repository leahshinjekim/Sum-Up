"use client";
import { useState } from "react";
import styles from "./page.module.css";
import FileDropZone from "@/components/FileDropZone";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const UploadPage = () => {
  const theme = useTheme();
  const router = useRouter();

  const [transcriptFiles, setTranscriptFiles] = useState([]);
  const [slidesFiles, setSlidesFiles] = useState([]);
  const [materialsFiles, setMaterialsFiles] = useState([]);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    transcriptFiles.length > 0 &&
    subject.trim().length > 0 &&
    topic.trim().length > 0 &&
    !loading;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptFiles.map((f) => f.content).join("\n\n"),
          slides: slidesFiles.map((f) => f.content).join("\n\n"),
          materials: materialsFiles.map((f) => f.content).join("\n\n"),
          subject,
          topic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // TODO: navigate to results page with summary data
        console.log("Summary generated:", data.summary);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/")}>
          ← Back to dashboard
        </button>
        <Typography variant="h1" className={styles.title}>
          New Summary
        </Typography>
        <Typography variant="body2" className={styles.subtitle}>
          Upload your transcript and course materials. The more context you
          provide, the better the summary.
        </Typography>
      </div>

      {/* Course context */}
      <Card>
        <CardContent>
          <Typography variant="h3">Course Information</Typography>
          <div className={styles.contextGrid}>
            <div>
              <Typography variant="overline" component="label">
                Subject / Course{" "}
                <span style={{ color: theme.palette.primary.main }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. 32516 Internet Programming"
                sx={{ mt: 0.5 }}
              />
            </div>
            <div>
              <Typography variant="overline" component="label">
                Lecture Topic{" "}
                <span style={{ color: theme.palette.primary.main }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Introduction to Web Development"
                sx={{ mt: 0.5 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      <Card>
        <CardContent>
          <Typography variant="h3">
            Lecture transcript
            <span
              style={{
                color: theme.palette.primary.main,
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              {" "}
              (required)
            </span>
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
            Upload your lecture transcript directly below.
          </Typography>

          <FileDropZone
            label="Upload transcript file (.txt, .pdf, .srt)"
            accept=".txt,.pdf,.srt"
            files={transcriptFiles}
            onFilesChange={setTranscriptFiles}
            variant="primary"
          />
        </CardContent>
      </Card>

      <div className={styles.supplementRow}>
        {/* Slides */}
        <Card>
          <CardContent>
            <Typography variant="h3">
              Lecture slides
              <span
                style={{
                  color: theme.palette.secondary.dark,
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {" "}
                (for enhanced summarisation)
              </span>
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
              Upload your lecture slides for additional context.
            </Typography>

            <FileDropZone
              label="Upload lecture slides (.ppt, .pptx, .pdf)"
              accept=".ppt, .pptx, .pdf"
              files={slidesFiles}
              onFilesChange={setSlidesFiles}
              variant="secondary"
            />
          </CardContent>
        </Card>

        {/* Other Materials */}
        <Card>
          <CardContent>
            <Typography variant="h3">
              Other learning materials
              <span
                style={{
                  color: theme.palette.custom.accent.dark,
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {" "}
                (for enhanced summarisation)
              </span>
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
              Upload additional learning materials for additional context
            </Typography>

            <FileDropZone
              label="Upload course materials (readings, books, etc.)"
              accept=".txt,.docx,.pdf"
              files={materialsFiles}
              onFilesChange={setMaterialsFiles}
              variant="tertiary"
            />
          </CardContent>
        </Card>
      </div>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        disabled={!canSubmit}
        onClick={handleSubmit}
        sx={{
          padding: "0.9rem",
          fontSize: "1rem",
          borderRadius: "10px",
          mt: 0.5,
        }}
      >
        {loading ? "Generating summary..." : "Generate summary"}
      </Button>
    </div>
  );
};

export default UploadPage;
