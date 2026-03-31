// styles/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // ── COLOUR PALETTE ────────────────────────────────────────────────────────
  palette: {
    primary: {
      light: "#dc52b7",
      main: "#bb2693",
      dark: "#911d72",
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#5cd4ae",
      main: "#26bb8f",
      dark: "#1a8a69",
      contrastText: "#ffffff",
    },
    error: {
      main: "#c0392b",
      light: "#fff0ee",
    },
    warning: {
      main: "#f2c94c",
    },
    info: {
      main: "#3d72c4",
      light: "#ebf2ff",
      contrastText: "#ffffff",
    },
    background: {
      default: "#fafafa",
      paper: "#faf8f4",
    },
    text: {
      primary: "#1c1814",
      secondary: "#2e2e2e",
      disabled: "#7a7a7a",
    },
    divider: "#e8e8e8",

    // Custom tokens
    custom: {
      sand: "#e8e8e8",
      sandDark: "#e0d0dc",
      muted: "#7a7a7a",
      mutedLight: "#b8afa8",
      highlightBg: "#fdf6dc",
      blueBg: "#ebf2ff",
      blue: "#3d72c4",
    },
  },

  // ── TYPOGRAPHY ────────────────────────────────────────────────────────────
  typography: {
    fontFamily: "'DM Sans', sans-serif",

    h1: {
      fontFamily: "'Alegreya Sans', sans-serif",
      fontSize: "2.2rem",
      fontWeight: 700,
      lineHeight: 1.2,
      color: "#1c1814",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: "'Alegreya Sans', sans-serif",
      fontSize: "1.75rem",
      fontWeight: 700,
      lineHeight: 1.3,
      color: "#1c1814",
    },
    h3: {
      fontFamily: "'Alegreya Sans', sans-serif",
      fontSize: "1.35rem",
      fontWeight: 700,
      lineHeight: 1.4,
      color: "#1c1814",
    },
    h4: {
      fontFamily: "'Alegreya Sans', sans-serif",
      fontSize: "1.1rem",
      fontWeight: 700,
      color: "#1c1814",
    },
    h5: {
      fontFamily: "'Alegreya Sans', sans-serif",
      fontSize: "1rem",
      fontWeight: 600,
      color: "#1c1814",
    },
    h6: {
      fontFamily: "'Alegreya Sans', sans-serif",
      fontSize: "0.9rem",
      fontWeight: 600,
      color: "#2e2e2e",
    },
    body1: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.97rem",
      lineHeight: 1.75,
      color: "#2e2e2e",
    },
    body2: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.85rem",
      lineHeight: 1.65,
      color: "#7a7a7a",
    },
    caption: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.75rem",
      color: "#7a7a7a",
      letterSpacing: "0.03em",
    },
    overline: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "#a8a8a8",
    },
    button: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.01em",
    },
    hero: {
      fontFamily: "'Alegreya Sans', sans-serif",
      fontSize: "3rem",
      fontWeight: 400,
      lineHeight: 1.2,
      color: "#4e4e4e",
      letterSpacing: "-0.02em",
    },
  },

  // ── SHAPE ─────────────────────────────────────────────────────────────────
  shape: {
    borderRadius: 8,
  },

  // ── SHADOWS ───────────────────────────────────────────────────────────────
  shadows: [
    "none",
    "0 1px 4px rgba(28,24,20,0.06)",
    "0 2px 8px rgba(28,24,20,0.08)",
    "0 4px 16px rgba(28,24,20,0.10)",
    "0 8px 24px rgba(28,24,20,0.12)",
    "0 12px 32px rgba(28,24,20,0.14)",
    ...Array(19).fill("none"),
  ],

  // ── COMPONENT OVERRIDES ───────────────────────────────────────────────────
  components: {
    // ── App Bar / Navbar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#fafafa",
          borderBottom: "1px solid #e8e8e8",
          boxShadow: "0 1px 12px rgba(28,24,20,0.07)",
          color: "#1c1814",
        },
      },
    },

    // ── Button
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "0.5rem 1.25rem",
          boxShadow: "none",
          fontSize: "0.92rem",
          fontWeight: 600,
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: "#bb2693",
          "&:hover": {
            backgroundColor: "#911d72",
          },
        },
        containedSecondary: {
          backgroundColor: "#26bb8f",
          "&:hover": {
            backgroundColor: "#1a8a69",
          },
        },
        outlinedPrimary: {
          borderColor: "#bb2693",
          "&:hover": {
            backgroundColor: "rgba(187,38,147,0.06)",
          },
        },
        // View button — use variant="contained" color="info"
        containedInfo: {
          backgroundColor: "#ebf2ff",
          color: "#3d72c4",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#d6e6ff",
            boxShadow: "none",
          },
        },
        // Delete button — use variant="contained" color="error"
        containedError: {
          backgroundColor: "#fff0ee",
          color: "#c0392b",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#ffd9d5",
            boxShadow: "none",
          },
        },
      },
    },

    // ── Text Field
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.92rem",
          borderRadius: 8,
          backgroundColor: "#fafafa",
          color: "#1c1814",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#bb2693",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#bb2693",
            borderWidth: "1.5px",
          },
        },
        notchedOutline: {
          borderColor: "#e8e8e8",
        },
        input: {
          "&::placeholder": {
            color: "#a8a8a8 ",
            opacity: 1,
          },
        },
      },
    },

    // ── Input Label
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#7a7a7a",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          "&.Mui-focused": {
            color: "#bb2693",
          },
        },
      },
    },

    // ── Card
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#fafafa",
          border: "1px solid #d2d2d2",
          borderRadius: 14,
          boxShadow: "none",
          padding: "1.75rem",
          marginBottom: "1.25rem",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(28,24,20,0.10)",
          },
        },
      },
    },

    // ── Card Content
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 0,
          "&:last-child": {
            paddingBottom: 0,
          },
        },
      },
    },

    // ── Table
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: "#fafafa",
          border: "1px solid #e8e8e8",
          borderRadius: 14,
          boxShadow: "none",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#e8e8e8",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#7a7a7a",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          borderBottom: "1px solid #e0d0dc",
          padding: "0.85rem 1.5rem",
        },
        body: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.88rem",
          color: "#2e2e2e",
          borderBottom: "1px solid #e8e8e8",
          padding: "1rem 1.5rem",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(232,232,232,0.4)",
            cursor: "pointer",
          },
          "&:last-child td": {
            borderBottom: "none",
          },
        },
      },
    },

    // ── Tabs
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: "2px solid #e8e8e8",
        },
        indicator: {
          backgroundColor: "#bb2693",
          height: "2.5px",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.88rem",
          fontWeight: 500,
          textTransform: "none",
          color: "#7a7a7a",
          padding: "0.65rem 1rem",
          minWidth: "unset",
          "&.Mui-selected": {
            color: "#bb2693",
            fontWeight: 700,
          },
        },
      },
    },

    // ── Chip
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.78rem",
          fontWeight: 600,
        },
        colorPrimary: {
          backgroundColor: "rgba(187,38,147,0.12)",
          color: "#911d72",
        },
        colorSecondary: {
          backgroundColor: "rgba(38,187,143,0.12)",
          color: "#1a8a69",
        },
        colorInfo: {
          backgroundColor: "#ebf2ff",
          color: "#3d72c4",
        },
        colorSuccess: {
          backgroundColor: "rgba(38,187,143,0.15)",
          color: "#1a8a69",
        },
      },
    },

    // ── Divider
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#e8e8e8",
        },
      },
    },

    // ── Alert
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.88rem",
          borderRadius: 10,
        },
        standardSuccess: {
          backgroundColor: "rgba(38,187,143,0.12)",
          color: "#1a8a69",
        },
        standardError: {
          backgroundColor: "#fff0ee",
          color: "#c0392b",
        },
        standardInfo: {
          backgroundColor: "#ebf2ff",
          color: "#3d72c4",
        },
      },
    },

    // ── Linear Progress
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: "#e8e8e8",
        },
        bar: {
          backgroundColor: "#bb2693",
        },
      },
    },

    // ── Circular Progress
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "#bb2693",
        },
      },
    },

    // ── Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.78rem",
          backgroundColor: "#1c1814",
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
