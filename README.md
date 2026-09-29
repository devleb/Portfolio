# Georges Matta — 3D Portfolio

A 3D desk scene with a laptop. Visitors step inside the laptop and browse the portfolio in a tabbed browser, travelling through time between pages.

Plain HTML, CSS and JavaScript with Three.js (no build step, no framework, no server).

## Run locally

```bash
cd portfolio-3d
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly from disk also works for everything except the CV preview; use a local server for that.

## Edit the content

All text lives in **`js/content.js`**: profile, education, certificates, experience, projects, skills, languages, links and blog posts. For projects, leave a field empty (`""`) to hide it on the card.

**Experience and projects are linked.** Every role in `experience` has an `id` (`pm`, `senior`, `da`, `py`, `it`). Give a project `exp: "<role id>"` and it appears under that role on the Experience page and shows a role badge on its card. Use `exp: "solo"` for work outside your job roles (shown under "Independent projects").

| Replace this file | With |
|---|---|
| `assets/img/profile.jpg` | Your photo (square works best) |
| `assets/cv/Georges-Matta-CV.pdf` | Your latest CV (same file name) |
| `assets/img/blog-data-analysis.jpg` | Blog cover image |

## Deploy (free)

**GitHub Pages:** push this folder to a repository, then Settings → Pages → Deploy from branch → `main` / root.
**Vercel / Netlify:** import the repository or drag the folder in. No build command, output directory is the root.

## Single-file version

`python3 build.py` writes `dist/index.html`, one self-contained file with every image and the CV embedded. Use it where you can only upload one file.

## Time travel

Each page is a moment in time, defined by `ERA` at the top of `js/browser.js`:

| Page | Era | Page | Era |
|---|---|---|---|
| Education | 2009 | Home | NOW |
| Experience | 2012 | Contact | NEXT |
| Projects | 2017 | Blog | ∞ |
| Resume | 2023 | | |

Switching tabs runs a year counter from one era to the other. The tunnel twists one way going back and the other way going forward, and the clock hands follow. Change the years in `ERA` to whatever suits you.

## Structure

```
index.html          page shell
css/style.css       all styling
js/content.js       all portfolio content
js/desk-scene.js    the desk, laptop, lamp and fly-in camera
js/time-scene.js    clock tunnel, era clocks and the time jump between pages
js/browser.js       tabs, address bar, history and every page
js/main.js          ties it together (intro, enter/exit, input)
```

## Features kept from the Streamlit version

Every page (Home, Education, Experience, Projects, Contact, Resume, Blog), the Education / Certificates tabs, project filters by technology and name, the interactive skills chart with hover details, CV download and in-page CV viewer, and all social and blog links.

New: the address bar accepts page names (`projects`, `cv`, `blogs`…), back / forward / reload, shareable links such as `yoursite/#/projects` that open directly on a page, a contact form that opens your email app, one-click copy for the email and credential IDs, reduced-motion support, and a WebGL-free fallback.
