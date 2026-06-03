# AGENTS.md

Quick reference for AI agents working on this repo. Read this first — it should be enough context without scanning the whole codebase.

_Optional further reading (only if this file is insufficient):_ `README.md` for end-user docs, `docs/` for deeper design notes.

## What this project is

Static React SPA that:
1. Accepts a CV (PDF), extracts text in-browser with `pdfjs-dist`.
2. Sends the text to an LLM completion API, gets back a structured `CVProfile` (role, years, skills with 1–10 levels + category).
3. Visualizes skills, compares against a mock expert profile, and produces a prioritized growth plan.
4. Falls back to `mockUserProfile` on any parsing/network failure so the UI always works.

Deployed as a static site to **GitHub Pages** under the `/CV-Analysis/` base path.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript (strict) |
| UI | MUI (Material UI) v9 + Emotion |
| Build / dev server | Vite 8 |
| PDF parsing | `pdfjs-dist` (client-side) |
| LLM | External completion API (HTTPS) |
| Lint | ESLint 10 (flat config in `eslint.config.js`) |
| Deploy | `gh-pages` package → `gh-pages` branch |

No backend in this repo. No tests configured.

## Commands

```bash
npm install
npm run dev      # dev server: http://localhost:5173/CV-Analysis/
npm run build    # tsc -b && vite build  →  dist/
npm run preview  # serve dist/ at http://localhost:4173
npm run lint     # ESLint
npm run deploy   # build + publish dist/ to gh-pages branch
```

Verification before claiming work is done: `npm run build` (catches TS + Vite errors). `npm run lint` if touching many files.

## Project layout (only what matters)

```
src/
  types/                       # Skill, CVProfile, GrowthSuggestion
  data/                        # mockUserProfile, mockExpertProfile
  services/
    cvParserService.ts         # PDF text extract + LLM call + validation + fallback
    suggestionService.ts       # Gap analysis & priority sorting
  components/
    FileUpload/                # Drag-and-drop PDF upload (validates type + 5MB limit)
    SkillBar/                  # Color-coded LinearProgress (red 1-3, amber 4-6, green 7-10)
    SkillDashboard/            # Skills grouped by category + profile card
    ComparisonView/            # User vs expert dual bars + missing skills
    GrowthPlan/                # Prioritized suggestion cards
  theme/theme.ts               # MUI theme
  App.tsx                      # Stepper: Upload → Skills → Compare → Growth
  main.tsx                     # Entry (ThemeProvider + CssBaseline)
vite.config.ts                 # base '/CV-Analysis/', dev+preview /api proxy
```

## API integration

The LLM call lives in `src/services/cvParserService.ts`.

- **Endpoint selection** (`API_URL`):
  - Dev/preview: `"/api/completion"` — proxied by Vite to the LLM host (avoids CORS).
  - Production: `"https://yyjex83jyiw4.asuscomm.com/completion"` — direct HTTPS call from the browser. Requires the server to send CORS headers allowing the GitHub Pages origin.
- **Auth**: bearer `API_KEY` sent in the `Authorization` header. ⚠ Key is bundled into the client JS — anyone can read it. Don't put real secrets here; use a server-side proxy if cost matters.
- **Proxy config**: `vite.config.ts` proxies `/api` → `https://yyjex83jyiw4.asuscomm.com` for both `server` and `preview`. Server has a valid TLS cert, so no `secure: false` needed.

If you change the API host, update **both** the `API_URL` (prod branch) and `vite.config.ts` proxy targets.

## Deployment

```bash
npm run deploy
```

This runs `npm run build && gh-pages -d dist`, pushing `dist/` to the `gh-pages` branch. Live site: https://khangtranminh.github.io/CV-Analysis/

### ⚠ GitHub account — IMPORTANT

The repo is owned by **`KhangTranMinh`**, but the machine also has a `KhangTranUney` account configured in `gh`. Pushing or deploying as the wrong user gets a `403 Permission denied` error.

Before any `git push` or `npm run deploy`, ensure the active account is `KhangTranMinh`:

```bash
gh auth status                       # check active account
gh auth switch -u KhangTranMinh      # switch if needed
```

`gh` manages the git credential helper for HTTPS, so switching here is enough for `git push` to use the right token.

## Conventions

- TypeScript strict mode — no `any` unless unavoidable.
- Functional components + hooks. No class components.
- Services are plain TS modules exposing interfaces (e.g. `ICVParserService`).
- MUI components and `sx` prop for styling — don't add a CSS framework.
- Keep the mock-data fallback path intact when modifying the parser — the UI relies on it.
- Don't commit secrets beyond what's already in the repo (the existing `API_KEY` is intentionally client-side).
