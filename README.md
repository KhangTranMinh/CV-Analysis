# CV Analysis

A web app that parses a CV, visualizes skill proficiency levels, compares them against an expert benchmark, and provides a prioritized growth plan.

The app extracts text from an uploaded PDF and sends it to an LLM completion API, which returns a structured skill profile. If the API is unreachable or returns an invalid response, the app **falls back to mock data** so the UI always works.

## Quick Start

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build
npm run preview  # serve the production build at http://localhost:4173
npm run lint     # ESLint check
npm run deploy   # build + publish dist/ to the gh-pages branch
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript (strict) |
| UI | MUI (Material UI) v9 |
| Build | Vite |
| PDF parsing | pdfjs-dist (client-side text extraction) |
| AI | LLM completion API (via Vite dev/preview proxy) |

## CV Parsing & LLM Integration

The parsing pipeline lives in `src/services/cvParserService.ts`:

1. **Extract text** — PDFs are parsed in-browser with `pdfjs-dist`; all pages are concatenated into plain text.
2. **Call the LLM** — the text is wrapped in a structured prompt instructing the model to return a JSON object matching the `CVProfile` schema (role, years of experience, and skills with 1-10 proficiency levels + categories).
3. **Validate** — `<think>` blocks are stripped, the first JSON object is extracted, and each skill is validated (type checks + allowed category). Invalid skills are dropped.
4. **Fallback** — on any failure (network, CORS, bad response, empty result) the service logs a warning and returns `mockUserProfile`.

### API proxy

The app calls a relative path (`/api/completion`). In dev and preview, Vite proxies `/api` to the LLM server (configured in `vite.config.ts`), which avoids CORS and mixed-content issues during local development.

> **Note on production / GitHub Pages:** GitHub Pages is a static host with **no proxy**, so the `/api` route does not exist there. Additionally, a browser on an HTTPS page (`*.github.io`) **cannot** call an HTTP API (mixed content) and requires CORS headers for cross-origin calls. As a result, on the deployed site every upload falls back to mock data. To make the LLM work in production, expose the model behind an **HTTPS** endpoint with **CORS** enabled (e.g. a Cloudflare Tunnel/Worker or a reverse proxy) and point the app at that URL.

## Project Structure

```
src/
  types/                          # TypeScript interfaces (Skill, CVProfile, GrowthSuggestion)
  data/                           # Mock data
    mockUserProfile.ts            #   Junior Mobile Developer (3 yrs, 8 skills)
    mockExpertProfile.ts          #   Senior Mobile Developer (8 yrs, 10 skills)
  services/                       # Business logic
    cvParserService.ts            #   PDF text extraction + LLM call (mock fallback), behind ICVParserService
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
| **FileUpload** | Drag-and-drop zone + file picker. Validates PDF type and 5 MB size limit. Shows file info and triggers parsing (text extraction + LLM call) with a loading spinner. |
| **SkillBar** | Single horizontal `LinearProgress` bar. Color-coded by level: red (1-3), amber (4-6), green (7-10). |
| **SkillDashboard** | Displays the parsed profile — role, experience, and skills grouped by category. Each group renders `SkillBar` items. |
| **ComparisonView** | Overlays user (blue) and expert (grey) bars per skill. Shows `+N` gap badges and a "Missing Skills" section for skills the user lacks. |
| **GrowthPlan** | Renders prioritized suggestion cards (High/Medium/Low). Each card shows current vs target level and an actionable tip. Summary banner at top. |

## User Flow

```
Upload CV  -->  Extract text + LLM parse  -->  Skills Overview  -->  Expert Comparison  -->  Growth Plan
```

Navigated via an MUI Stepper. Back button on every step; "Start Over" on the final step.

## Documentation

- [Product Requirements](docs/REQUIREMENT.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
