import { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Step,
  StepLabel,
  Stepper,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FileUpload from "./components/FileUpload/FileUpload";
import SkillDashboard from "./components/SkillDashboard/SkillDashboard";
import ComparisonView from "./components/ComparisonView/ComparisonView";
import GrowthPlan from "./components/GrowthPlan/GrowthPlan";
import { mockExpertProfile } from "./data/mockExpertProfile";
import { generateSuggestions } from "./services/suggestionService";
import type { CVProfile } from "./types";

const steps = ["Upload CV", "Skills Overview", "Expert Comparison", "Growth Plan"];

export default function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [userProfile, setUserProfile] = useState<CVProfile | null>(null);

  const handleParseComplete = (profile: CVProfile) => {
    setUserProfile(profile);
    setActiveStep(1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setUserProfile(null);
  };

  const suggestions =
    userProfile ? generateSuggestions(userProfile, mockExpertProfile) : [];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            CV Analysis
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <FileUpload onParseComplete={handleParseComplete} />
        )}

        {activeStep === 1 && userProfile && (
          <SkillDashboard
            profile={userProfile}
            onCompare={() => setActiveStep(2)}
          />
        )}

        {activeStep === 2 && userProfile && (
          <ComparisonView
            userProfile={userProfile}
            expertProfile={mockExpertProfile}
            onViewGrowthPlan={() => setActiveStep(3)}
          />
        )}

        {activeStep === 3 && (
          <GrowthPlan suggestions={suggestions} />
        )}

        {activeStep > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveStep((s) => s - 1)}
            >
              Back
            </Button>
            {activeStep === 3 && (
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                Start Over
              </Button>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
