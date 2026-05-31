import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Alert,
} from "@mui/material";
import type { GrowthSuggestion, Priority } from "../../types";

interface GrowthPlanProps {
  suggestions: GrowthSuggestion[];
}

const priorityColor: Record<Priority, "error" | "warning" | "success"> = {
  High: "error",
  Medium: "warning",
  Low: "success",
};

export default function GrowthPlan({ suggestions }: GrowthPlanProps) {
  const highCount = suggestions.filter((s) => s.priority === "High").length;

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>{suggestions.length}</strong> areas for growth identified
        {highCount > 0 && (
          <>
            {" "}
            &mdash; <strong>{highCount}</strong> high priority
          </>
        )}
      </Alert>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {suggestions.map((s) => (
          <Card key={s.skillName} variant="outlined">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
                  {s.skillName}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {s.isMissing && (
                    <Chip
                      label="New Skill"
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    label={s.priority}
                    size="small"
                    color={priorityColor[s.priority]}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {s.isMissing
                  ? `Target: Level ${s.targetLevel}/${s.maxLevel}`
                  : `Current: ${s.currentLevel}/${s.maxLevel} → Target: ${s.targetLevel}/${s.maxLevel}`}
              </Typography>
              <Typography variant="body2">{s.tip}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
