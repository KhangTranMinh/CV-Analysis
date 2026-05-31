import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Button,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import type { CVProfile } from "../../types";
import SkillBar from "../SkillBar/SkillBar";

interface SkillDashboardProps {
  profile: CVProfile;
  onCompare: () => void;
}

export default function SkillDashboard({
  profile,
  onCompare,
}: SkillDashboardProps) {
  const grouped = profile.skills.reduce<Record<string, typeof profile.skills>>(
    (acc, skill) => {
      (acc[skill.category] ??= []).push(skill);
      return acc;
    },
    {}
  );

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <WorkIcon color="primary" />
            <Typography variant="h5">{profile.role}</Typography>
          </Box>
          <Chip
            label={`${profile.yearsOfExperience} years of experience`}
            variant="outlined"
            size="small"
          />
        </CardContent>
      </Card>

      {Object.entries(grouped).map(([category, skills]) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ fontWeight: 600, mb: 1 }}
          >
            {category}
          </Typography>
          {skills.map((skill) => (
            <SkillBar
              key={skill.name}
              name={skill.name}
              level={skill.level}
              maxLevel={skill.maxLevel}
            />
          ))}
        </Box>
      ))}

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<CompareArrowsIcon />}
        onClick={onCompare}
        sx={{ mt: 1 }}
      >
        Compare with Expert
      </Button>
    </Box>
  );
}
