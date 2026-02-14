# treehacks-2026

Starter website for your mobile app demo, designed to be hosted on GitHub Pages.

## Project structure

- `docs/index.html` - main landing page
- `docs/assets/css/styles.css` - global styles
- `docs/assets/js/main.js` - starter JavaScript
- `docs/assets/images/` - add screenshots/logo files here
- `docs/pages/privacy.html` - placeholder legal page
- `docs/.nojekyll` - ensures GitHub Pages serves static files directly

## Local preview

From the repo root, run a simple static server (choose one):

```bash
python3 -m http.server 8000 --directory docs
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In GitHub, go to `Settings` -> `Pages`.
3. Under `Build and deployment`, set:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/docs`
4. Save. GitHub will publish your site URL.

## Why this approach

This is plain HTML/CSS/JS, which is the simplest reliable option for a demo site on GitHub Pages.
You can later migrate to Jekyll, Astro, Next.js static export, or another framework if needed.
