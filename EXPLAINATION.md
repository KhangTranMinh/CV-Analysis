# EXPLAINATION.md

A detailed walkthrough of this project, written for an Android developer learning the web/React stack. Where useful I'll draw parallels to Android/Gradle concepts.

---

## 1. Big picture

This is a **client-only Single-Page Application (SPA)** — no backend, no server-side rendering. Everything runs in the user's browser:

- HTML/CSS/JS files are served as **static assets** from GitHub Pages (similar to bundling an Android app into an APK and shipping it — but here the "APK" is just a folder of `.html`/`.js`/`.css` that any web server can host).
- The browser executes the JS, which renders the UI via React.
- The app reads a PDF in-browser, sends extracted text to an external LLM HTTP API, and renders the result.

**Android analogy:** Think of this like an Android app that does everything locally + makes Retrofit calls. There's no Spring/Node server we own; the "backend" is just a third-party REST endpoint.

---

## 2. Languages & runtime

| Concept | Web | Android equivalent |
|---|---|---|
| Source language | **TypeScript** (`.ts`, `.tsx`) | Kotlin |
| Runtime in dev | Node.js (only for tooling) | JVM (for Gradle/build) |
| Runtime in prod | The user's browser (V8/SpiderMonkey/JSC) | ART on the device |
| Package manager | **npm** (uses `package.json`) | Gradle (`build.gradle.kts`) |
| Lockfile | `package-lock.json` (exact versions) | `gradle.lockfile` |
| Build tool | **Vite** (bundles TS → JS + minify) | Gradle + AGP |
| UI framework | **React** + **MUI** (Material UI) | Jetpack Compose + Material 3 |

**TypeScript = JavaScript + static types.** It compiles down to plain JS. Strict mode is on (`tsconfig.app.json` → `"strict": true`), so it behaves a lot like Kotlin's null-safety.

**`.tsx`** = TypeScript file that contains **JSX** (HTML-like syntax inside code). Compare to Compose's `@Composable` functions that look like Kotlin DSL building UI trees.

---

## 3. Folder & file tour (every important file explained)

### Root files

```
package.json           ← like build.gradle (dependencies + tasks)
package-lock.json      ← like gradle.lockfile (exact resolved versions)
tsconfig.json          ← root TypeScript config (just references the two below)
tsconfig.app.json      ← TS compile settings for app source (browser code)
tsconfig.node.json     ← TS compile settings for build-time code (vite.config.ts)
vite.config.ts         ← Vite build/dev-server config (analogous to gradle plugin config)
eslint.config.js       ← lint rules (like ktlint/detekt config)
index.html             ← the HTML entry point (the page the browser actually loads)
src/                   ← all app source code
public/                ← static assets copied verbatim into the build output
dist/                  ← build output (the deployable artifact; gitignored)
node_modules/          ← downloaded dependencies (gitignored)
```

### `package.json` — the "build.gradle" of the project

```jsonc
{
  "name": "cv-analysis",
  "private": true,         // don't try to publish me to the npm registry
  "type": "module",        // use modern ES module imports (import/export, not require)
  "scripts": {             // ← like gradle tasks; run with `npm run <name>`
    "dev": "vite",                                // start dev server with hot reload
    "build": "tsc -b && vite build",              // type-check then bundle to dist/
    "lint": "eslint .",                           // run linter on everything
    "preview": "vite preview",                    // serve the built dist/ for a final smoke test
    "deploy": "npm run build && gh-pages -d dist" // build + push dist/ to gh-pages branch
  },
  "dependencies":    { /* shipped in the browser bundle */ },
  "devDependencies": { /* only used at build/lint time */ }
}
```

Key dependencies and what they do:
- **`react` + `react-dom`** — the UI library. `react` is the engine; `react-dom` is the adapter that mounts components to the browser DOM (like the difference between Compose runtime vs. Compose UI for Android).
- **`@mui/material`, `@mui/icons-material`** — Material UI component library (buttons, steppers, etc.). Equivalent to Jetpack Compose Material 3 components.
- **`@emotion/react`, `@emotion/styled`** — CSS-in-JS engine that MUI uses under the hood. You usually don't touch it directly; you use MUI's `sx` prop.
- **`pdfjs-dist`** — Mozilla's PDF.js, runs PDF parsing entirely in the browser. No server needed.
- **`vite`** — bundler + dev server. Like Gradle + AGP combined.
- **`typescript`** — the TS compiler (`tsc`).
- **`eslint` + plugins** — linter.
- **`gh-pages`** — small CLI that copies a folder to the `gh-pages` git branch and pushes it.

### `tsconfig.app.json` — TypeScript compiler options for app code

The important knobs:
- `"strict": true` — enables all strict type-checking (null-safety, etc.). Like Kotlin's compiler defaults.
- `"target": "es2023"` — output modern JS syntax (browsers all support it).
- `"jsx": "react-jsx"` — tells TS how to compile JSX. With the modern transform you don't need to `import React` in every file.
- `"moduleResolution": "bundler"` — resolve `import` paths the way Vite/webpack do (not the way Node does).
- `"noEmit": true` — `tsc` only **type-checks**; it doesn't write `.js` files. Vite handles the actual transpile + bundle. That's why the build script is `tsc -b && vite build` — type-check first, then bundle.
- `"noUnusedLocals" / "noUnusedParameters"` — fail compile on unused vars. Like Kotlin's `unused` warning, but as an error.
- `"include": ["src"]` — only compile stuff in `src/`.

`tsconfig.node.json` is a sibling config that applies to `vite.config.ts` itself (which runs in Node, not the browser). Using two TS configs with `references` in the root `tsconfig.json` is a TypeScript feature called **project references** — speeds up incremental builds.

### `eslint.config.js` — linter

ESLint's modern "flat config" format. Just enables recommended rules for JS, TS, React Hooks, and React Refresh. You rarely need to edit it.

### `vite.config.ts` — the most important config file

```ts
export default defineConfig({
  plugins: [react()],                  // enable React + Fast Refresh (live reload)
  base: '/CV-Analysis/',               // ← see "Base path" below
  server: {                            // dev server (npm run dev)
    proxy: {
      '/api': {
        target: 'https://yyjex83jyiw4.asuscomm.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  preview: { /* same proxy for `npm run preview` */ },
})
```

**`base: '/CV-Analysis/'`**
GitHub Pages serves this project at `https://khangtranminh.github.io/CV-Analysis/`, not at the domain root. The `base` tells Vite to prefix all generated asset URLs with `/CV-Analysis/`. If you forget this, the deployed site loads `index.html` but all `<script>`/`<link>` requests 404.

**Dev proxy (`server.proxy`)**
When the browser is on `http://localhost:5173` and calls `fetch("/api/completion")`, the Vite dev server intercepts that path and forwards it to `https://yyjex83jyiw4.asuscomm.com/completion`. Why?
1. **Avoids CORS** — the browser sees a same-origin request to `localhost:5173`, so no preflight needed.
2. **Avoids mixed content** — even if the API were HTTP, the proxy is server-to-server, not browser-to-server.

In **production** (GitHub Pages), there's no proxy. The code in `cvParserService.ts` detects this with `import.meta.env.DEV` and calls the absolute HTTPS URL directly. That requires the API server to send proper CORS headers.

### `index.html` — the only HTML file

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

The whole app is mounted into the single `<div id="root">`. This is what "SPA" means — one HTML page, JS injects everything else.

Loose Android analogy: this is the `MainActivity`'s `setContentView` of an empty `<FrameLayout>`, and the JS bundle is the equivalent of populating it programmatically.

---

## 4. Source code structure (`src/`)

```
src/
  main.tsx                   ← entry point: mounts <App/> into #root, applies MUI theme
  App.tsx                    ← top-level component, holds wizard state + routing between steps
  types/index.ts             ← TypeScript interfaces (Skill, CVProfile, GrowthSuggestion, Priority)
  data/
    mockUserProfile.ts       ← fallback profile shown if LLM fails
    mockExpertProfile.ts     ← target profile to compare against
  services/                  ← pure logic, no UI
    cvParserService.ts       ← PDF → text → LLM call → CVProfile
    suggestionService.ts     ← (userProfile, expertProfile) → growth suggestions
  theme/theme.ts             ← MUI ThemeProvider config (colors, typography)
  components/                ← React UI components, one folder each
    FileUpload/
    SkillBar/
    SkillDashboard/
    ComparisonView/
    GrowthPlan/
```

### Mental model: React components

A React component is just a **function that returns UI**. It re-runs whenever its inputs (props) or internal state change, and React diffs the result against the previous render to update only what changed.

```tsx
function SkillBar({ skill }: { skill: Skill }) {
  return <LinearProgress value={skill.level * 10} />;
}
```

**Android analogy:** very similar to a `@Composable` function — it takes inputs, emits a UI tree, and the framework figures out what to redraw. `useState` is to React what `remember { mutableStateOf(...) }` is to Compose.

### `main.tsx` — entry point

```tsx
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

- `createRoot(...).render(...)` — React 19 way to attach a component tree to a DOM node.
- `<StrictMode>` — dev-only wrapper that double-invokes things to surface bugs (no effect in prod).
- `<ThemeProvider>` — provides the MUI theme via React Context to all children. Like Compose's `MaterialTheme { ... }`.
- `<CssBaseline />` — applies a CSS reset so the app looks the same across browsers.

### `App.tsx` — the wizard

Holds two pieces of state with `useState`:
- `activeStep: number` — which step of the wizard we're on (0..3).
- `userProfile: CVProfile | null` — the parsed CV, or `null` until upload succeeds.

Renders one of four screens based on `activeStep`. When `FileUpload` finishes parsing it calls `onParseComplete(profile)`, which sets state and advances to step 1.

**Why no router/navigation library?** Only 4 sequential steps. State + conditional rendering is simpler. If the app grew, you'd add `react-router`.

### `services/cvParserService.ts` — the most complex file

The core pipeline:

```
File (PDF)
  └─ extractTextFromPdf()     ← uses pdfjs-dist to read each page's text
       └─ buildPrompt(text)   ← wraps text in instruction template for the LLM
            └─ fetch(API_URL) ← POST to LLM endpoint
                 └─ parseProfileFromResponse(content)
                      ├─ strip <think>...</think> blocks (some LLMs emit reasoning)
                      ├─ extract first {...} JSON block
                      ├─ validate each skill (typed guard `isValidSkill`)
                      └─ return CVProfile
On any error: log warning and return `mockUserProfile`.
```

Key TS patterns to notice:
- **Interface as a contract:** `export interface ICVParserService { parse(file: File): Promise<CVProfile> }` and `export const cvParserService: ICVParserService = { ... }` — like an `interface` + an `object` implementing it in Kotlin. Lets you swap implementations for tests later.
- **Type guard:** `function isValidSkill(s: unknown): s is Skill` — narrows the type of `s` for the compiler if it returns true. Similar to Kotlin's smart casts after `is` checks.
- **`async/await`** behaves like Kotlin coroutines' `suspend fun`. A function returning `Promise<T>` is roughly `suspend fun ...: T`.
- **`import.meta.env.DEV`** — Vite-provided boolean, `true` during `npm run dev`, `false` in prod build. Used to switch between the proxy path and the absolute URL.

### `services/suggestionService.ts`

Pure function. For every expert skill: if the user lacks it → "High" priority missing skill; if the user has it but at a lower level → priority based on the gap. Sorted High → Medium → Low. No async, no side effects.

### Components

Each folder has one `.tsx` file. They're all "function components":
- **FileUpload**: drag-and-drop zone, validates PDF + 5MB limit, calls `cvParserService.parse()`, raises `onParseComplete` callback.
- **SkillBar**: a single `<LinearProgress>` colored red/amber/green based on `level`.
- **SkillDashboard**: groups skills by `category` and renders many `SkillBar`s.
- **ComparisonView**: overlays user vs expert bars; lists missing skills.
- **GrowthPlan**: renders the prioritized suggestion cards.

All styling is via MUI's `sx` prop (CSS-in-JS object). Example: `<Box sx={{ p: 2, bgcolor: "background.default" }}>`. Numbers in `sx` are theme spacing units (1 = 8px by default), similar to Material 3's spacing tokens in Compose.

---

## 5. Build, dev, and deploy lifecycle

### `npm run dev`
1. Vite starts a local server on `http://localhost:5173`.
2. Serves `index.html` directly.
3. When the browser requests `/src/main.tsx`, Vite transpiles TS on the fly using esbuild and returns JS. No bundling — files are served individually as ES modules.
4. **Hot Module Replacement (HMR)**: editing a component updates the running page without losing state. Compare to Compose's live edit / instant run.
5. Requests to `/api/...` are proxied per `vite.config.ts`.

### `npm run build`
1. `tsc -b` does a **type-check only** pass across `tsconfig.app.json` and `tsconfig.node.json`. Fails on any TS error. Doesn't emit JS.
2. `vite build` bundles everything in `src/` into a handful of files in `dist/`:
   - `dist/index.html` (with `<script src="/CV-Analysis/assets/index-<hash>.js">`)
   - `dist/assets/index-<hash>.js` — your code + React + MUI, minified.
   - `dist/assets/pdf.worker.min-<hash>.mjs` — pdfjs worker (loaded lazily by the browser).
   - Plus any static files from `public/`.
3. The `[hash]` in filenames is a **content hash** for cache busting. Same idea as Gradle's resource versioning, but more aggressive.

### `npm run preview`
Serves `dist/` on `http://localhost:4173`, exactly as a static host would. Last sanity check before deploy.

### `npm run deploy`
Runs `npm run build`, then `gh-pages -d dist` which:
1. Clones the repo's `gh-pages` branch into a temp dir (or creates it).
2. Replaces its contents with `dist/`.
3. Commits and pushes.

GitHub then serves `gh-pages` at `https://<user>.github.io/<repo>/`. Propagation usually takes <1 minute.

⚠ **Account note**: deploy pushes a git commit, so you must be authenticated as `KhangTranMinh` (see `AGENTS.md` for `gh auth switch`).

---

## 6. How a single user action flows through the code

Example: user drops a PDF onto the upload zone.

1. **`FileUpload`** receives the `File` object from a drop event.
2. It validates type & size, sets a local `loading=true` state, calls `cvParserService.parse(file)`.
3. **`cvParserService`**:
   - Reads file bytes → `arrayBuffer`.
   - Uses `pdfjs-dist` to extract concatenated text.
   - Builds the prompt, `fetch` to the LLM endpoint.
   - Parses JSON, validates, returns `CVProfile`.
   - On any failure: returns `mockUserProfile` so the UI continues.
4. `FileUpload` calls `onParseComplete(profile)`.
5. **`App`** updates `userProfile` state and sets `activeStep = 1`.
6. React re-renders — now `<SkillDashboard profile={userProfile} />` mounts and shows the skills grouped by category.

---

## 7. Things that will trip you up coming from Android

- **No null vs undefined consistency.** TS has both. `null` = "explicitly empty", `undefined` = "not set". Most APIs use one or the other; just match what the surrounding code does.
- **Re-renders are cheap, not free.** Avoid creating heavy objects inline in render. Use `useMemo` / `useCallback` only when you have a measurable problem.
- **No threads.** Browser JS is single-threaded. "Async" means microtasks/event loop, not parallelism. Heavy CPU work (like PDF parsing) ideally goes into a Web Worker — pdfjs already does this internally.
- **CSS units.** MUI's `sx` numeric values are spacing units (× 8px). Strings like `"100vh"` are CSS units (`vh` = viewport height).
- **No manifest/permissions.** The browser has its own permission model (camera, mic, etc.); we don't use any of those here.
- **Imports are paths.** `import x from "./services/foo"` is a relative file path, not a package name. Different from Kotlin's package-based imports.

---

## 8. Where to make common changes

| You want to... | Edit |
|---|---|
| Add/remove a wizard step | `src/App.tsx` (the `steps` array + the conditional renders) |
| Change colors / typography | `src/theme/theme.ts` |
| Tweak how skills are extracted from CV | `src/services/cvParserService.ts` (prompt + `parseProfileFromResponse`) |
| Add/change suggestion tips | `src/services/suggestionService.ts` (`tips` map) |
| Change the LLM endpoint | `src/services/cvParserService.ts` (`API_URL`) **and** `vite.config.ts` (proxy target) |
| Change GitHub Pages base path | `vite.config.ts` (`base`) — must match the repo name |
| Add a new npm package | `npm install <pkg>` (runtime dep) or `npm install -D <pkg>` (dev dep) |
| Add a new component | Create `src/components/Foo/Foo.tsx`, export a function, import it where needed |

---

## 9. Recommended next reading

- React Hooks: <https://react.dev/reference/react>
- MUI components: <https://mui.com/material-ui/all-components/>
- Vite guide: <https://vitejs.dev/guide/>
- TypeScript handbook: <https://www.typescriptlang.org/docs/handbook/intro.html>

For repo-specific info (deploy/account quirks), see `AGENTS.md`. For high-level features, see `README.md`. For design/PRD, see `docs/`.
