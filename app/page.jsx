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
  TablePagination,
  useMediaQuery,
  IconButton,
  TextField,
  Tooltip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import ConfirmDialog from "@/components/ConfirmDialog";
import CardSwap, { Card } from "@/components/CardSwap/CardSwap";

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const [summaryHistory, setSummaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // { id, subject, lecture_title }
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [page, setPage] = useState(0);
  const ROWS_PER_PAGE = 5;

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

  function handleEditClick(item) {
    setEditTarget({
      id: item._id,
      subject: item.subject || "",
      lecture_title: item.header?.lecture_title || "",
    });
  }

  function handleEditCancel() {
    setEditTarget(null);
  }

  async function handleEditSave() {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/history/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: editTarget.subject,
          lecture_title: editTarget.lecture_title,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSummaryHistory((prev) =>
          prev.map((item) =>
            item._id === editTarget.id
              ? {
                  ...item,
                  subject: editTarget.subject,
                  header: {
                    ...item.header,
                    lecture_title: editTarget.lecture_title,
                  },
                }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update summary:", error);
    } finally {
      setSaving(false);
      setEditTarget(null);
    }
  }

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

  const uniqueSubjects = [
    ...new Set(summaryHistory.map((i) => i.subject).filter(Boolean)),
  ];

  const filtered = summaryHistory.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      item.subject?.toLowerCase().includes(q) ||
      item.header?.lecture_title?.toLowerCase().includes(q) ||
      item.header?.topic?.toLowerCase().includes(q);
    const matchSubject = !filterSubject || item.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  const paginated = filtered.slice(
    page * ROWS_PER_PAGE,
    (page + 1) * ROWS_PER_PAGE,
  );

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
    background: "#ffffff",
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
          <Image
            src="/logo.png"
            alt="Sum-Up"
            width={500}
            height={200}
            style={{ width: "min(500px, 100%)", height: "auto" }}
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

      <Box sx={{ mb: 2, mt: { xs: 6, md: 10 } }}>
        <Typography variant="h2" gutterBottom>
          Summary History
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
          <TextField
            size="small"
            placeholder="Search by subject, title or topic…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ flex: 1, minWidth: 220, "& .MuiOutlinedInput-root": { backgroundColor: "#ffffff" } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180, "& .MuiOutlinedInput-root": { backgroundColor: "#ffffff" } }}>
            <InputLabel sx={{ textTransform: "none", fontSize: "0.92rem", fontWeight: 400, letterSpacing: 0, color: "#a8a8a8", "&.Mui-focused": { color: "#bb2693" } }}>Subject</InputLabel>
            <Select
              value={filterSubject}
              label="Subject"
              onChange={(e) => {
                setFilterSubject(e.target.value);
                setPage(0);
              }}
              MenuProps={{ PaperProps: { sx: { backgroundColor: "#ffffff" } } }}
            >
              <MenuItem value="">All subjects</MenuItem>
              {uniqueSubjects.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Typography variant="body2" sx={{ p: 6, textAlign: "center" }}>
          Loading summaries...
        </Typography>
      ) : summaryHistory.length === 0 ? (
        <Typography variant="body2" sx={{ p: 6, textAlign: "center" }}>
          No summaries yet. Start generating your first summary!
        </Typography>
      ) : filtered.length === 0 ? (
        <Typography variant="body2" sx={{ p: 6, textAlign: "center" }}>
          No summaries match your search.
        </Typography>
      ) : isMd ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {paginated.map((item) => {
            const isEditing = editTarget?.id === item._id;
            return (
              <Box
                key={item._id}
                sx={{
                  backgroundColor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  p: 2.5,
                  "& .editBtn": { opacity: 0 },
                  "&:hover .editBtn": { opacity: 1 },
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
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {isEditing ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={editTarget.lecture_title}
                        onChange={(e) =>
                          setEditTarget((p) => ({
                            ...p,
                            lecture_title: e.target.value,
                          }))
                        }
                        autoFocus
                        sx={{ mb: 1 }}
                      />
                    ) : (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Typography variant="h4">
                          {item.header?.lecture_title || "-"}
                        </Typography>
                        <Tooltip title="Edit">
                          <IconButton
                            className="editBtn"
                            size="small"
                            onClick={() => handleEditClick(item)}
                          >
                            <DriveFileRenameOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                    {isEditing ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={editTarget.subject}
                        onChange={(e) =>
                          setEditTarget((p) => ({
                            ...p,
                            subject: e.target.value,
                          }))
                        }
                        sx={{ mb: 1 }}
                      />
                    ) : (
                      item.subject && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
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
                      )
                    )}
                    {!isEditing && (
                      <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                        {item.header?.topic || "-"}
                      </Typography>
                    )}
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
                  {isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleEditSave}
                        disabled={saving}
                      >
                        <CheckIcon fontSize="small" />
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleEditCancel}
                        disabled={saving}
                      >
                        <CloseIcon fontSize="small" />
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </Box>
              </Box>
            );
          })}
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
              {paginated.map((item) => {
                const isEditing = editTarget?.id === item._id;
                return (
                  <TableRow
                    key={item._id}
                    sx={{
                      "& .editBtn": { opacity: 0 },
                      "&:hover .editBtn": { opacity: 1 },
                    }}
                  >
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          value={editTarget.subject}
                          onChange={(e) =>
                            setEditTarget((p) => ({
                              ...p,
                              subject: e.target.value,
                            }))
                          }
                          autoFocus
                        />
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {item.subject || "-"}
                          <Tooltip title="Edit">
                            <IconButton
                              className="editBtn"
                              size="small"
                              onClick={() => handleEditClick(item)}
                            >
                              <DriveFileRenameOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          value={editTarget.lecture_title}
                          onChange={(e) =>
                            setEditTarget((p) => ({
                              ...p,
                              lecture_title: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        item.header?.lecture_title || "-"
                      )}
                    </TableCell>
                    <TableCell>{item.header?.topic || "-"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell align="right">
                      {isEditing ? (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={handleEditSave}
                            disabled={saving}
                          >
                            <CheckIcon fontSize="small" />
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleEditCancel}
                            disabled={saving}
                          >
                            <CloseIcon fontSize="small" />
                          </Button>
                        </Box>
                      ) : (
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
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && filtered.length > 0 && (
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
        />
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
