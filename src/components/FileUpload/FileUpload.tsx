import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CVProfile } from "../../types";
import { cvParserService } from "../../services/cvParserService";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface FileUploadProps {
  onParseComplete: (profile: CVProfile) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ onParseComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const validateAndSetFile = useCallback((f: File) => {
    setError(null);
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File size must be under 5 MB.");
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) validateAndSetFile(droppedFile);
    },
    [validateAndSetFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) validateAndSetFile(selected);
    },
    [validateAndSetFile]
  );

  const handleRemove = () => {
    setFile(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setParsing(true);
    try {
      const profile = await cvParserService.parse(file);
      onParseComplete(profile);
    } catch {
      setError("Failed to parse CV. Please try again.");
    } finally {
      setParsing(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 520, mx: "auto" }}>
      <Paper
        variant="outlined"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        sx={{
          p: 5,
          textAlign: "center",
          border: "2px dashed",
          borderColor: dragOver ? "primary.main" : "grey.400",
          bgcolor: dragOver ? "action.hover" : "background.paper",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 56, color: "grey.500", mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Drag & drop your CV here
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          PDF format, up to 5 MB
        </Typography>
        <Button component="label" variant="outlined">
          Browse Files
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={handleFileInput}
          />
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {file && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <InsertDriveFileIcon color="primary" />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(file.size)}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleRemove}
              aria-label="Remove file"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={!file || parsing}
        onClick={handleAnalyze}
        sx={{ mt: 3 }}
        startIcon={parsing ? <CircularProgress size={20} color="inherit" /> : undefined}
      >
        {parsing ? "Analyzing..." : "Analyze CV"}
      </Button>
    </Box>
  );
}
