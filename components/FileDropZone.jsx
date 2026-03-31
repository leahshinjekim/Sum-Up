"use client";
import { useRef } from "react";
import { useTheme } from "@mui/material/styles";
import styles from "./FileDropZone.module.css";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FileDropZone = ({ label, accept, fileName, onFileRead, variant }) => {
  const inputRef = useRef(null);
  const theme = useTheme();

  const accentColor =
    variant === "secondary"
      ? theme.palette.secondary.main
      : theme.palette.primary.main;

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onFileRead(file.name, e.target.result);
    reader.readAsText(file);
  };

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <div
        className={styles.dropZone}
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          borderColor: fileName ? accentColor : theme.palette.custom.mutedLight,
          backgroundColor: fileName ? `${accentColor}08` : "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = accentColor;
          e.currentTarget.style.backgroundColor = `${accentColor}06`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = fileName
            ? accentColor
            : theme.palette.custom.mutedLight;
          e.currentTarget.style.backgroundColor = fileName
            ? `${accentColor}08`
            : "transparent";
        }}
      >
        {fileName ? (
          <div className={styles.fileName}>
            <span
              style={{
                color: accentColor,
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {fileName}
            </span>
            <span className={styles.replace}>— click to replace</span>
          </div>
        ) : (
          <div>
            <UploadFileIcon className={styles.icon} />
            <div className={styles.label}>{label}</div>
            <div className={styles.hint}>Click to browse or drag and drop</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropZone;
