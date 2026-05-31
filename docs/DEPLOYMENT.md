# Deployment Guide

This project is deployed to **GitHub Pages** as a static site. The production build is pushed to the `gh-pages` branch automatically via the `gh-pages` npm package.

**Live URL:** https://khangtranminh.github.io/CV-Analysis/

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ and npm
- Git with push access to the repository
- GitHub CLI (`gh`) authenticated as the repo owner

## How It Works

1. `npm run build` compiles TypeScript and bundles the app with Vite into the `dist/` folder.
2. `gh-pages -d dist` pushes the contents of `dist/` to the `gh-pages` branch.
3. GitHub Pages serves the `gh-pages` branch at the live URL.

The Vite config sets `base: '/CV-Analysis/'` so all asset paths are relative to the GitHub Pages subdirectory.

## Deploy

```bash
npm run deploy
```

This single command builds and publishes. It is equivalent to:

```bash
npm run build
npx gh-pages -d dist
```

After running, the site updates within 1-2 minutes.

## First-Time Setup

If deploying to a new repository, follow these steps:

### 1. Install dependencies

```bash
npm install
```

### 2. Verify the Vite base path

In `vite.config.ts`, ensure `base` matches your repo name:

```ts
export default defineConfig({
  plugins: [react()],
  base: '/<REPO_NAME>/',
})
```

### 3. Deploy

```bash
npm run deploy
```

This creates the `gh-pages` branch automatically on first run.

### 4. Enable GitHub Pages

Go to **Settings > Pages** in your GitHub repository:

| Setting | Value |
|---------|-------|
| Source | Deploy from a branch |
| Branch | `gh-pages` / `/ (root)` |

Or via the GitHub CLI:

```bash
gh api repos/<OWNER>/<REPO>/pages -X POST \
  -f build_type=legacy \
  -f source='gh-pages'
```

### 5. Verify

Visit `https://<owner>.github.io/<repo>/` after the build completes (1-2 minutes).

## Custom Domain (Optional)

1. In your repo, go to **Settings > Pages > Custom domain** and enter your domain.
2. Add a `CNAME` DNS record pointing to `<owner>.github.io`.
3. Create a `public/CNAME` file with your domain so it persists across deploys:
   ```
   your-domain.com
   ```
4. Update `base` in `vite.config.ts` to `'/'` (no subdirectory needed with a custom domain).
5. Redeploy: `npm run deploy`.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page after deploy | Check that `base` in `vite.config.ts` matches the repo name exactly (case-sensitive). |
| 404 on refresh | GitHub Pages doesn't support client-side routing by default. This app is a single-page stepper, so direct navigation isn't an issue. If you add routing later, copy `index.html` as `404.html` in the `public/` folder. |
| Assets not loading | Clear browser cache or hard-refresh (`Cmd+Shift+R`). Verify asset paths start with `/<repo>/`. |
| Permission denied on push | Ensure you're authenticated as the repo owner: `gh auth switch --user <owner>`. |
| Old version still showing | GitHub Pages caches aggressively. Wait 2-3 minutes or check the deployment status at **Settings > Pages**. |

## CI/CD (Future)

To automate deployment on every push to `main`, add a GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```
