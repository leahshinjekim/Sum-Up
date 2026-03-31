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
} from "@mui/material";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Home() {
  const router = useRouter();
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

  // ── Handlers ───────────────────────────────────────────────────────────────
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
        py: { xs: 3, sm: 5 },
        minHeight: "100vh",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h1" gutterBottom>
          Welcome to Sum-Up
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 700 }}>
          Your study assistant that helps turn your study materials into
          insightful summarisation.
        </Typography>
      </Box>

      <Box sx={{ mb: 8 }}>
        <Button variant="contained" color="primary" href="/upload">
          Start summarisation
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h2" gutterBottom>
          Summary History
        </Typography>
      </Box>
      <TableContainer>
        {loading ? (
          <Typography variant="body2" sx={{ p: 6, textAlign: "center" }}>
            Loading summaries...
          </Typography>
        ) : summaryHistory.length === 0 ? (
          <Typography variant="body2" sx={{ p: 6, textAlign: "center" }}>
            No summaries yet. Upload your first lecture!
          </Typography>
        ) : (
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
                <TableCell sx={{ whiteSpace: "nowrap" }}>{new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
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
        )}
      </TableContainer>

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
