# Portfolio Site

Plain HTML/CSS/JS — no build step, no dependencies. Ready for GitHub Pages.

## File structure
```
index.html                        ← homepage (project cards)
projects/bigtime.html               ← BigTime case study
css/style.css                     ← all styling
js/main.js                        ← scroll-reveal animation
assets/images/rpg/                ← 26 optimized screenshots (~3MB total)
```

## Before you publish — fill these in
Search the HTML files for the dashed placeholder boxes (class `fill-me`).
There are a handful in:
- `index.html` — your intro blurb, email, Figma/LinkedIn links, the two
  "coming soon" project names
- `projects/bigtime.html` — your role, the overview paragraph,
  a couple of inline notes, and the closing reflection

Everything else (the screen-by-screen descriptions) is already written
from what's actually in your screenshots — edit freely if you'd
describe any of it differently.

## Deploy on GitHub Pages

1. Create a new repo on GitHub (public, or private if you're on a paid plan
   that supports Pages for private repos).
2. Push these files to it:
   ```bash
   cd portfolio-site
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy
   from a branch → Branch: main, folder: / (root) → Save.**
4. Your site goes live in about a minute at:
   `https://YOUR-USERNAME.github.io/YOUR-REPO/`

   If you want it at the root of your GitHub Pages domain (no `/YOUR-REPO/`
   suffix), name the repo `YOUR-USERNAME.github.io` exactly.

## Adding the next two projects
Duplicate `projects/bigtime.html` as a starting template, swap
the images and copy, and update its card in `index.html` (change
`class="card disabled"` to `class="card live"`, remove the `soon-badge`
div, add the real thumbnail and link).
