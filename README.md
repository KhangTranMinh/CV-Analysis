# CV Analysis

A web app that parses a CV, visualizes skill proficiency levels, compares them against an expert benchmark, and provides a prioritized growth plan.

> **Demo mode** — AI parsing is mocked; the app always returns a Mobile Developer profile. Designed so a real AI backend can be swapped in later without changing UI code.

## Quick Start

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build
npm run lint     # ESLint check
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript (strict) |
| UI | MUI (Material UI) v9 |
| Build | Vite |
| Backend | None (all data mocked client-side) |

## Project Structure

```
src/
  types/                          # TypeScript interfaces (Skill, CVProfile, GrowthSuggestion)
  data/                           # Mock data
    mockUserProfile.ts            #   Junior Mobile Developer (3 yrs, 8 skills)
    mockExpertProfile.ts          #   Senior Mobile Developer (8 yrs, 10 skills)
  services/                       # Business logic
    cvParserService.ts            #   CV parser (mock, behind ICVParserService interface)
    suggestionService.ts          #   Gap analysis & priority sorting
  theme/
    theme.ts                      # MUI theme (colors, typography, shape)
  components/
    FileUpload/                   # Drag-and-drop PDF upload with validation
    SkillBar/                     # Color-coded horizontal proficiency bar
    SkillDashboard/               # Skills grouped by category + profile card
    ComparisonView/               # Dual-bar user vs expert overlay
    GrowthPlan/                   # Prioritized suggestion cards
  App.tsx                         # Stepper shell (Upload -> Skills -> Compare -> Growth)
  main.tsx                        # Entry point (ThemeProvider + CssBaseline)
```

## Core Components

| Component | Purpose |
|-----------|---------|
| **FileUpload** | Drag-and-drop zone + file picker. Validates PDF type and 5 MB size limit. Shows file info and triggers mock parsing with a loading spinner. |
| **SkillBar** | Single horizontal `LinearProgress` bar. Color-coded by level: red (1-3), amber (4-6), green (7-10). |
| **SkillDashboard** | Displays the parsed profile — role, experience, and skills grouped by category. Each group renders `SkillBar` items. |
| **ComparisonView** | Overlays user (blue) and expert (grey) bars per skill. Shows `+N` gap badges and a "Missing Skills" section for skills the user lacks. |
| **GrowthPlan** | Renders prioritized suggestion cards (High/Medium/Low). Each card shows current vs target level and an actionable tip. Summary banner at top. |

## User Flow

```
Upload CV  -->  Parsing (mock)  -->  Skills Overview  -->  Expert Comparison  -->  Growth Plan
```

Navigated via an MUI Stepper. Back button on every step; "Start Over" on the final step.

## Documentation

- [Product Requirements](docs/REQUIREMENT.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
