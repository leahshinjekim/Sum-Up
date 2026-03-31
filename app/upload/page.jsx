"use client";
import { useState } from "react";
import styles from "./page.module.css";
import FileDropZone from "@/components/FileDropZone";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const UploadPage = () => {
  const theme = useTheme();
  const router = useRouter();

  const [transcript, setTranscript] = useState("");
  const [transcriptFileName, setTranscriptFileName] = useState("");
  const [materials, setMaterials] = useState("");
  const [materialsFileName, setMaterialsFileName] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = transcript.trim().length > 0 && !loading;

  const handleTranscriptFile = (name, content) => {
    setTranscriptFileName(name);
    setTranscript(content);
  };

  const handleMaterialsFile = (name, content) => {
    setMaterialsFileName(name);
    setMaterials(content);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, materials, subject, topic }),
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
                Subject / Course
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
                Lecture Topic
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
            Upload a file or paste your lecture transcript directly below.
          </Typography>

          <FileDropZone
            label="Upload transcript file (.txt, .docx, .pdf)"
            accept=".txt,.doc,.docx"
            fileName={transcriptFileName}
            onFileRead={handleTranscriptFile}
            variant="primary"
          />

          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>or paste directly</span>
            <div className={styles.dividerLine} />
          </div>

          <TextField
            fullWidth
            multiline
            rows={7}
            variant="outlined"
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              if (e.target.value === "") setTranscriptFileName("");
            }}
            placeholder="Paste your lecture transcript here..."
          />
          {transcript && (
            <Typography
              variant="caption"
              sx={{ display: "block", textAlign: "right", mt: 0.5 }}
            >
              {transcript.trim().split(/\s+/).length} words
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardContent>
          <Typography variant="h3">
            Course materials
            <span
              style={{
                color: theme.palette.secondary.dark,
                fontSize: "1rem",
                fontWeight: 400,
              }}
            >
              {" "}
              (for enhanced summarisation)
            </span>
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }}>
            Upload files or paste lecture slides, readings and other course
            materials for more context
          </Typography>

          <FileDropZone
            label="Upload course materials (slides, readings, books, etc.)"
            accept=".txt,.doc,.docx"
            fileName={materialsFileName}
            onFileRead={handleMaterialsFile}
            variant="secondary"
          />

          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>or paste directly</span>
            <div className={styles.dividerLine} />
          </div>

          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={materials}
            onChange={(e) => {
              setMaterials(e.target.value);
              if (e.target.value === "") setMaterialsFileName("");
            }}
            placeholder="Paste your lecture slides, readings, or subject outline here..."
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.secondary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.secondary.main,
                },
              },
            }}
          />
          {materials && (
            <Typography
              variant="caption"
              sx={{ display: "block", textAlign: "right", mt: 0.5 }}
            >
              {materials.trim().split(/\s+/).length} words
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
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
