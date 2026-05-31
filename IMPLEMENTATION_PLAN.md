# CV Analysis - Implementation Plan

## Phase 1 — Project Scaffolding

- Scaffold with `npm create vite@latest` (React + TypeScript template)
- Install dependencies: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
- Set up folder structure:
  ```
  src/
    components/       # Reusable UI components
      FileUpload/
      SkillBar/
      SkillDashboard/
      ComparisonView/
      GrowthPlan/
    services/         # CV parser service abstraction
    data/             # Mock data (user + expert profiles)
    types/            # TypeScript interfaces
    theme/            # MUI theme config
    App.tsx           # Main app with stepper
    main.tsx          # Entry point
  ```
- Configure MUI theme (primary/secondary colors, typography)

## Phase 2 — Types & Mock Data

- Define TypeScript interfaces:
  - `Skill` — `{ name, level, maxLevel, category }`
  - `CVProfile` — `{ role, yearsOfExperience, skills[] }`
  - `GrowthSuggestion` — `{ skillName, currentLevel, targetLevel, priority, tip }`
- Create `data/mockUserProfile.ts` and `data/mockExpertProfile.ts` from the requirement schemas
- Build `services/cvParserService.ts` — an async function that accepts a `File`, simulates a 1.5s delay, and returns the mock user profile. Abstracted behind an interface so a real AI backend can replace it later

## Phase 3 — CV Upload Component

- `FileUpload` component with:
  - Drag-and-drop zone (MUI `Paper` with dashed border)
  - "Browse files" button as fallback
  - PDF-only validation + 5MB size limit with error snackbar
  - Shows file name, size, and a remove button after selection
  - "Analyze CV" button that triggers parsing and shows a `CircularProgress` loader
- On success, calls `onParseComplete(profile)` callback to advance the stepper

## Phase 4 — Skill Dashboard

- `SkillBar` component:
  - Horizontal `LinearProgress` bar (MUI) with label and `level/maxLevel` text
  - Color-coded: red/orange (1-3), amber (4-6), green (7-10)
- `SkillDashboard` component:
  - Profile summary card at top (role, years of experience)
  - Skills grouped by category using MUI `Accordion` or section headers
  - Each group renders its skills as `SkillBar` items
  - "Compare with Expert" button at the bottom to advance

## Phase 5 — Expert Comparison

- `ComparisonView` component:
  - Loads the expert mock profile
  - For each skill, renders **dual horizontal bars** (user = blue, expert = grey/outlined)
  - Gap badge shows `+N` difference on each skill
  - "Missing Skills" section at the bottom for skills the expert has but the user doesn't
  - "View Growth Plan" button to advance

## Phase 6 — Growth Suggestions

- `generateSuggestions()` utility function:
  - Compares user vs expert skills
  - Assigns priority: gap >= 4 = High, gap >= 2 = Medium, gap < 2 = Low
  - Missing skills = High priority with "New skill to learn" tag
  - Returns sorted array (High first, then Medium, then Low)
  - Includes a mocked actionable tip per skill
- `GrowthPlan` component:
  - Renders suggestions as MUI `Card` items
  - Each card shows: skill name, current vs target level, priority chip (color-coded), tip text
  - Summary stats at top (total gaps, high-priority count)

## Phase 7 — App Shell & Stepper

- `App.tsx` uses MUI `Stepper` with 4 steps:
  1. Upload CV
  2. Skills Overview
  3. Expert Comparison
  4. Growth Plan
- State management via `useState`:
  - `activeStep` — current step index
  - `userProfile` — parsed CV profile (null until parsed)
- Back/Next navigation with step validation (can't skip ahead)
- MUI `AppBar` with app title
- MUI `Container` for centered, max-width content

## Phase 8 — Polish & Verify

- Responsive: test layout at 360px, 768px, 1200px breakpoints
- Accessibility: ARIA labels on interactive elements, keyboard navigation through stepper
- Run `npm run build` — ensure zero errors
- Run `npm run lint` — fix any issues
- Final visual review of the full flow
