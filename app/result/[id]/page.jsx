"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";

const TabHeaders = [
  { id: "learningGoals", label: "Leaning Goals" },
  { id: "main_points", label: "Summary" },
  { id: "takeaway", label: "Takeaway" },
  { id: "review_questions", label: "Review Questions" },
];

export default function ResultsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useParams();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("learningGoals");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/history/${id}`)
      .then((r) => r.json())
      .then((data) => setSummary(data.success ? data.summary : null))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!summary) {
    return (
      <div className={styles.empty}>
        <Typography variant="body1" color="text.disabled">
          No summary selected.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => router.push("/upload")}
        >
          Upload a transcript
        </Button>
      </div>
    );
  }

  function getPlainText() {
    if (activeTab === "learningGoals")
      return (summary.header?.learning_goals ?? []).join("\n");
    if (activeTab === "main_points")
      return (summary.main_points ?? [])
        .map((p) => `${p.cue}\n${p.summary}\n${p.example}`)
        .join("\n\n\n");
    if (activeTab === "takeaway") return summary.takeaway ?? "";
    if (activeTab === "review_questions")
      return (summary.review_questions ?? [])
        .map((q) => (typeof q === "string" ? q : q.question))
        .join("\n");
    return "";
  }

  function renderContent() {
    if (activeTab === "learningGoals") {
      return (summary.header?.learning_goals ?? []).map((goal, i) => (
        <Typography key={i} variant="body1" sx={{ mb: 0.5 }}>
          ✦ {goal}
        </Typography>
      ));
    }
    if (activeTab === "main_points") {
      return (summary.main_points ?? []).map((point, i) => (
        <Box key={i} sx={{ mb: 2 }}>
          <Typography variant="h5">{point.cue}</Typography>
          <Typography variant="body1">{point.summary}</Typography>
          {point.example && (
            <Typography variant="body1">
              <strong style={{ color: theme.palette.primary.main }}>
                Example:
              </strong>{" "}
              {point.example}
            </Typography>
          )}
        </Box>
      ));
    }
    if (activeTab === "takeaway") {
      return <Typography variant="body1">{summary.takeaway}</Typography>;
    }
    if (activeTab === "review_questions") {
      return (summary.review_questions ?? []).map((q, i) => (
        <Typography key={i} variant="body1" sx={{ mb: 0.5 }}>
          ✦ {typeof q === "string" ? q : q.question}
        </Typography>
      ));
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(getPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/")}>
          ← Back to dashboard
        </button>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            width: "100%",
          }}
        >
          <Typography variant="h1" className={styles.title}>
            {summary.header?.lecture_title || summary.header?.topic}
          </Typography>
        </Box>

        <Chip
          label={summary.subject}
          color="info"
          size="medium"
          sx={{ mt: 0.5, fontSize: 14, maxWidth: 250, alignSelf: "flex-start" }}
        />
      </div>

      <Card className={styles.banner}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <div>
            <Typography
              variant="h5"
              sx={{ color: theme.palette.secondary.dark }}
            >
              Enhanced summary generated ✦
            </Typography>
            <Typography variant="body2">
              Additional course materials used to improve summarisation quality
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onChange={(_, newVal) => setActiveTab(newVal)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          [theme.breakpoints.down("sm")]: {
            "& .MuiTabs-flexContainer": {
              flexWrap: "wrap",
            },
            "& .MuiTabs-indicator": {
              display: "none",
            },
          },
        }}
      >
        {TabHeaders.map((tab) => (
          <Tab key={tab.id} value={tab.id} label={tab.label} />
        ))}
      </Tabs>

      <Card className={styles.contentCard}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            {activeTab === "main_points" && (
              <Tooltip title={copied ? "Copied!" : "Copy section"}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    color: copied
                      ? theme.palette.secondary.main
                      : theme.palette.text.disabled,
                  }}
                >
                  {copied ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <ContentCopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
