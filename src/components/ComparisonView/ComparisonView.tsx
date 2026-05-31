import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
  Divider,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import type { CVProfile, Skill } from "../../types";

interface ComparisonViewProps {
  userProfile: CVProfile;
  expertProfile: CVProfile;
  onViewGrowthPlan: () => void;
}

function ComparisonBar({
  skill,
  expertSkill,
}: {
  skill: Skill | null;
  expertSkill: Skill;
}) {
  const userLevel = skill?.level ?? 0;
  const gap = expertSkill.level - userLevel;
  const userPct = (userLevel / expertSkill.maxLevel) * 100;
  const expertPct = (expertSkill.level / expertSkill.maxLevel) * 100;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {expertSkill.name}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
          {!skill && (
            <Chip
              label="Missing"
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          )}
          {gap > 0 && (
            <Chip
              label={`+${gap}`}
              size="small"
              color={gap >= 4 ? "error" : gap >= 2 ? "warning" : "default"}
              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
            />
          )}
        </Box>
      </Box>
      <Box sx={{ position: "relative", mb: 0.3 }}>
        <LinearProgress
          variant="determinate"
          value={expertPct}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: "grey.200",
            "& .MuiLinearProgress-bar": { bgcolor: "grey.400" },
          }}
        />
        <LinearProgress
          variant="determinate"
          value={userPct}
          color="primary"
          sx={{
            height: 10,
            borderRadius: 5,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bgcolor: "transparent",
          }}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" color="primary.main">
          You: {userLevel}/{expertSkill.maxLevel}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Expert: {expertSkill.level}/{expertSkill.maxLevel}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ComparisonView({
  userProfile,
  expertProfile,
  onViewGrowthPlan,
}: ComparisonViewProps) {
  const userSkillMap = new Map(userProfile.skills.map((s) => [s.name, s]));

  const sharedSkills = expertProfile.skills.filter((s) =>
    userSkillMap.has(s.name)
  );
  const missingSkills = expertProfile.skills.filter(
    (s) => !userSkillMap.has(s.name)
  );

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Your Profile
              </Typography>
              <Typography variant="h6">{userProfile.role}</Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile.yearsOfExperience} yrs experience
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
              <Typography variant="caption" color="text.secondary">
                Expert Benchmark
              </Typography>
              <Typography variant="h6">{expertProfile.role}</Typography>
              <Typography variant="body2" color="text.secondary">
                {expertProfile.yearsOfExperience} yrs experience
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: "primary.main" }} />
          <Typography variant="caption">You</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: "grey.400" }} />
          <Typography variant="caption">Expert</Typography>
        </Box>
      </Box>

      {sharedSkills.map((expertSkill) => (
        <ComparisonBar
          key={expertSkill.name}
          skill={userSkillMap.get(expertSkill.name) ?? null}
          expertSkill={expertSkill}
        />
      ))}

      {missingSkills.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <NewReleasesIcon color="error" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Skills You're Missing
            </Typography>
          </Box>
          {missingSkills.map((expertSkill) => (
            <ComparisonBar
              key={expertSkill.name}
              skill={null}
              expertSkill={expertSkill}
            />
          ))}
        </>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<TrendingUpIcon />}
        onClick={onViewGrowthPlan}
        sx={{ mt: 2 }}
      >
        View Growth Plan
      </Button>
    </Box>
  );
}
