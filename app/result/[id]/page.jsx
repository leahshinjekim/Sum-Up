"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter, useParams } from "next/navigation";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import DownloadIcon from "@mui/icons-material/Download";

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

  async function handleDownload() {
    const title =
      summary.header?.lecture_title || summary.header?.topic || "Summary";

    const sectionHeading = (text) =>
      new Paragraph({
        style: "SectionHeading",
        children: [new TextRun({ text: text.toUpperCase() })],
        spacing: { before: 400, after: 160 },
        border: {
          bottom: { style: "single", size: 6, color: "BB2693", space: 6 },
        },
      });

    const cueHeading = (text) =>
      new Paragraph({
        style: "CueHeading",
        children: [new TextRun({ text })],
        spacing: { before: 240, after: 80 },
      });

    const bodyPara = (text, opts = {}) =>
      new Paragraph({
        style: "BodyText",
        children: [new TextRun({ text, ...opts })],
        spacing: { after: 100 },
      });

    const numberedPara = (text, i) =>
      new Paragraph({
        style: "BodyText",
        children: [new TextRun({ text: `${i + 1}.  ${text}` })],
        spacing: { after: 80 },
        indent: { left: 360 },
      });

    const children = [
      // Title block
      new Paragraph({
        style: "DocTitle",
        children: [new TextRun({ text: title })],
        spacing: { after: 120 },
        alignment: AlignmentType.LEFT,
      }),
      new Paragraph({
        style: "SubjectTag",
        children: [new TextRun({ text: summary.subject || "" })],
        spacing: { after: 400 },
      }),

      // Learning Goals
      sectionHeading("Learning Goals"),
      ...(summary.header?.learning_goals ?? []).map((g, i) =>
        numberedPara(g, i),
      ),

      // Summary
      sectionHeading("Summary"),
      ...(summary.main_points ?? []).flatMap((p) => [
        cueHeading(p.cue),
        bodyPara(p.summary),
        ...(p.example
          ? [
              new Paragraph({
                style: "BodyText",
                children: [
                  new TextRun({
                    text: "Example:  ",
                    bold: true,
                    color: "BB2693",
                  }),
                  new TextRun({ text: p.example }),
                ],
                spacing: { after: 100 },
                indent: { left: 360 },
              }),
            ]
          : []),
      ]),

      // Takeaway
      sectionHeading("Takeaway"),
      bodyPara(summary.takeaway || ""),

      // Review Questions
      sectionHeading("Review Questions"),
      ...(summary.review_questions ?? []).map((q, i) =>
        numberedPara(typeof q === "string" ? q : q.question, i),
      ),
    ];

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "DocTitle",
            name: "Doc Title",
            basedOn: "Normal",
            run: { size: 48, bold: true, color: "1C1814", font: "Calibri" },
          },
          {
            id: "SubjectTag",
            name: "Subject Tag",
            basedOn: "Normal",
            run: { size: 32, color: "3D72C4", bold: true, font: "Calibri" },
          },
          {
            id: "SectionHeading",
            name: "Section Heading",
            basedOn: "Normal",
            run: { size: 24, bold: true, color: "BB2693", font: "Calibri" },
          },
          {
            id: "CueHeading",
            name: "Cue Heading",
            basedOn: "Normal",
            run: { size: 24, bold: true, color: "1C1814", font: "Calibri" },
          },
          {
            id: "BodyText",
            name: "Body Text",
            basedOn: "Normal",
            run: { size: 22, color: "2E2E2E", font: "Calibri" },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/")}>
          ← Back to dashboard
        </button>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
          }}
        >
          <Typography variant="h1" className={styles.title}>
            {summary.header?.lecture_title || summary.header?.topic}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleDownload}
            sx={{ flexShrink: 0, display: { xs: "none", sm: "inline-flex" } }}
          >
            Download
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mt: 0.5,
            width: "100%",
          }}
        >
          <Chip
            label={summary.subject}
            color="info"
            size="medium"
            sx={{ fontSize: 14 }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleDownload}
            sx={{
              display: { xs: "inline-flex", sm: "none" },
              minWidth: 0,
              p: "6px",
            }}
          >
            <DownloadIcon fontSize="small" />
          </Button>
        </Box>
      </div>

      {summary.enhanced && (
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
      )}

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
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
