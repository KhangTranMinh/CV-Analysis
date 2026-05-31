import { Box, LinearProgress, Typography } from "@mui/material";

interface SkillBarProps {
  name: string;
  level: number;
  maxLevel: number;
}

function getColor(level: number): "error" | "warning" | "success" {
  if (level <= 3) return "error";
  if (level <= 6) return "warning";
  return "success";
}

export default function SkillBar({ name, level, maxLevel }: SkillBarProps) {
  const pct = (level / maxLevel) * 100;

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {level}/{maxLevel}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={getColor(level)}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  );
}
