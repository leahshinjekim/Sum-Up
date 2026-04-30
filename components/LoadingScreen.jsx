"use client";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const STEPS = [
  { label: "Reading your transcript…", duration: 5000 },
  { label: "Extracting key concepts…", duration: 5000 },
  { label: "Generating learning goals…", duration: 5000 },
  { label: "Building your summary…", duration: 5000 },
  { label: "Crafting review questions…", duration: 5000 },
  { label: "Finalising your notes…", duration: 99999 },
];

export default function LoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, STEPS[stepIndex].duration);
    return () => clearTimeout(timer);
  }, [stepIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        backgroundColor: "#fafafa",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        px: 3,
      }}
    >
      {/* Animated logo mark */}
      <Box sx={{ position: "relative", width: 72, height: 72 }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid #e8e8e8",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#bb2693",
            borderRightColor: "#bb2693",
            animation: "spin 1s linear infinite",
            "@keyframes spin": {
              from: { transform: "rotate(0deg)" },
              to: { transform: "rotate(360deg)" },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.6rem",
          }}
        >
          ✦
        </Box>
      </Box>

      {/* Steps */}
      <Box sx={{ textAlign: "center", maxWidth: 420 }}>
        <Typography
          sx={{
            fontFamily: "'Alegreya Sans', sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1c1814",
            mb: 1,
            minHeight: "2rem",
          }}
        >
          {STEPS[stepIndex].label.replace("…", "")}
          <span style={{ color: "#bb2693" }}>{dots}</span>
        </Typography>

        {/* Step dots */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
          {STEPS.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === stepIndex ? 20 : 8,
                height: 8,
                borderRadius: "999px",
                backgroundColor: i <= stepIndex ? "#bb2693" : "#e8e8e8",
                transition: "all 0.4s ease",
              }}
            />
          ))}
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: "#a8a8a8", mt: -2 }}>
        This may take up to a minute
      </Typography>
    </Box>
  );
}
