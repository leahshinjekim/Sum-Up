"use client";
import { useRef } from "react";
import { useTheme } from "@mui/material/styles";
import styles from "./FileDropZone.module.css";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FileDropZone = ({
  label,
  accept,
  files = [],
  onFilesChange,
  variant,
  multiple = true,
}) => {
  const inputRef = useRef(null);
  const theme = useTheme();

  const accentColor =
    variant === "secondary"
      ? theme.palette.secondary.main
      : variant === "tertiary"
      ? theme.palette.custom.accent.main
      : theme.palette.primary.main;

  const appendFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    if (!newFiles.length) return;

    if (multiple) {
      onFilesChange([...(files || []), ...newFiles]);
    } else {
      onFilesChange(newFiles.slice(0, 1));
    }
  };

  const handleChange = (e) => {
    appendFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    appendFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleRemove = (e, index) => {
    e.stopPropagation();
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const hasFiles = files && files.length > 0;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {!hasFiles ? (
        <div
          className={styles.dropZone}
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ borderColor: theme.palette.custom.mutedLight }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.backgroundColor = `${accentColor}06`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.palette.custom.mutedLight;
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <UploadFileIcon className={styles.icon} />
          <div className={styles.label}>{label}</div>
          <div className={styles.hint}>
            {multiple
              ? "Click to browse or drag and drop multiple files"
              : "Click to browse or drag and drop a file"}
          </div>
        </div>
      ) : (
        <div
          className={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            borderColor: accentColor,
            backgroundColor: `${accentColor}08`,
            cursor: "default",
            textAlign: "left",
          }}
        >
          <div className={styles.fileList}>
            {files.map((file, i) => (
              <span
                key={i}
                className={styles.fileChip}
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                {file.name}
                <button
                  className={styles.removeBtn}
                  onClick={(e) => handleRemove(e, i)}
                  style={{ color: accentColor }}
                >
                  ✕
                </button>
              </span>
            ))}

            {multiple && (
              <button
                className={styles.addBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current.click();
                }}
                style={{ color: accentColor, borderColor: accentColor }}
              >
                + Add another file
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropZone;