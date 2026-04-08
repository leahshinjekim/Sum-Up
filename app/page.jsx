"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import CardSwap, { Card } from "@/components/CardSwap/CardSwap";
import theme from "@/styles/theme";

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const [summaryHistory, setSummaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (data.success) {
          setSummaryHistory(data.summaryHistory || []);
        } else {
          setSummaryHistory([]);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setSummaryHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  function handleView(item) {
    router.push(`/result/${item._id}`);
  }

  function handleDeleteClick(item) {
    setDeleteTarget(item);
  }

  function handleDeleteCancel() {
    setDeleteTarget(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/history/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSummaryHistory((prev) =>
          prev.filter((item) => item._id !== deleteTarget._id),
        );
      }
    } catch (error) {
      console.error("Failed to delete summary:", error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const featureCards = [
    {
      label: "Feature 03",
      title: "Study Ready",
      description:
        "Review concise insights and enhanced summary of your lecture",
    },
    {
      label: "Feature 01",
      title: "Upload Learning Materials",
      description:
        "Drop in your lecture transcript and materials get instant summaries",
    },
    {
      label: "Feature 02",
      title: "AI Summarisation",
      description: "Key concepts extracted and organised automatically",
    },
  ];

  const cardStyle = {
    background: "#fafafa",
    padding: 32,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    border: "1px solid #bb2693",
  };

  if (!mounted) return null;

  const deleteDescription = deleteTarget ? (
    <>
      <strong>
        {deleteTarget.header?.lecture_title ||
          deleteTarget.header?.topic ||
          "This summary"}
      </strong>{" "}
      will be permanently deleted and cannot be recovered.
    </>
  ) : null;

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, sm: 4 },
        py: { xs: 4, sm: 5 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: { md: 8 },
        }}
      >
        {/* Left: Hero content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "flex-start" },
            justifyContent: "flex-start",
            textAlign: { xs: "center", md: "left" },
            flex: 1,
            minHeight: "100vh",
          }}
        >
          <img
            src="/logo.png"
            alt="Sum-Up"
            style={{
              width: "min(500px, 100%)",
              height: "auto",
            }}
          />
          <Typography
            variant="hero"
            sx={{
              fontSize: { xs: "1.6rem", sm: "2rem", md: "2.4rem" },
              lineHeight: 1.3,
              mt: { xs: 4, md: 6 },
            }}
          >
            Your study assistant that helps turn study materials into insightful
            summarisation
          </Typography>

          <Box sx={{ mt: { xs: 4, md: 6 } }}>
            <Button
              variant="contained"
              color="primary"
              href="/upload"
              sx={{
                fontSize: { xs: 16, md: 20 },
                borderRadius: "999px",
                textAlign: "center",
              }}
            >
              ✦ Start summarisation
            </Button>
          </Box>
        </Box>

        {/* Right: CardSwap */}
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardSwap
            delay={3000}
            cardDistance={60}
            verticalDistance={70}
            width={500}
            height={250}
            pauseOnHover={false}
          >
            {featureCards.map((card, i) => (
              <Card key={i} style={cardStyle}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: `${theme.palette.primary.main}`,
                    marginBottom: 8,
                    fontFamily: "DM Sans, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {card.label}
                </p>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#1c1814",
                    margin: "0 0 8px",
                    fontFamily: "Alegreya Sans, sans-serif",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "#7a7a7a",
                    margin: 0,
                    fontFamily: "DM Sans, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  {card.description}
                </p>
              </Card>
            ))}
          </CardSwap>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h2" gutterBottom>
          Summary History
        </Typography>
      </Box>

      {loading ? (
        <Typography variant="body2" sx={{ p: 6, textAlign: "center" }}>
          Loading summaries...
        </Typography>
      ) : summaryHistory.length === 0 ? (
        <Typography variant="body2" sx={{ p: 6, textAlign: "center" }}>
          No summaries yet. Start generating your first summary!
        </Typography>
      ) : isMd ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {summaryHistory.map((item) => (
            <Box
              key={item._id}
              sx={{
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                p: 2.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Box>
                  <Typography variant="h4">
                    {item.header?.lecture_title || "-"}
                  </Typography>
                  {item.subject && (
                    <Box
                      sx={{
                        mt: 1,
                        display: "inline-block",
                        backgroundColor: "#fcdaf3",
                        borderRadius: "999px",
                        px: 1.5,
                        py: 0.25,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                        }}
                      >
                        {item.subject}
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                    {item.header?.topic || "-"}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ whiteSpace: "nowrap", ml: 1 }}
                >
                  {new Date(item.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  onClick={() => handleView(item)}
                >
                  View
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleDeleteClick(item)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Lecture Title</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryHistory.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.subject || "-"}</TableCell>
                  <TableCell>{item.header?.lecture_title || "-"}</TableCell>
                  <TableCell>{item.header?.topic || "-"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {new Date(item.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { md: "column", lg: "row" },
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={() => handleView(item)}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(item)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete summary?"
        description={deleteDescription}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
}
