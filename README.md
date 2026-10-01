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

## The desk: books, hourglass, time and weather

- **Books:** the three books on the desk are Management, Blockchain and Artificial Intelligence. Titles, colours and cover art are in `BOOK_SPECS` at the top of `js/desk-scene.js`.
- **Hourglass:** tap or click it (or use the Flip button) to flip it. The sand runs for 45 s, then it glows to invite another flip. Flipping mid-run sends the sand back up. Change `RUN` in `js/desk-scene.js` to change the duration.
- **Time of day:** follows the visitor's own clock (dawn, day, dusk, night). With Live weather it uses the real sunrise and sunset for the visitor's area.
- **Weather:** the Scene button (top right) offers Live, Sunny, Cloudy, Rainy, Foggy and Snowy. Live uses [Open-Meteo](https://open-meteo.com) (free, no API key). It looks up the main city of the visitor's time zone, so it needs no location permission and never learns the exact location. If the lookup fails, the sky is clear. The result is cached for 30 minutes and the visitor's choice is remembered in the browser.
- The logic is in `js/environment.js`; the lighting, sky, rain, snow and fog are in `js/desk-scene.js`.

## Time travel

Each page is a moment in time, defined by `ERA` at the top of `js/browser.js`:

The tabs, and the order you travel in when scrolling, run from now back to 2009 and then out to the future:

| Order | Page | Era |
|---|---|---|
| 1 | Home | NOW |
| 2 | Experience | 2026 → 2012 (follows the scroll) |
| 3 | Resume | 2023 |
| 4 | Projects | 2017 |
| 5 | Education | 2009 |
| 6 | Contact | NEXT |
| 7 | Blog | ∞ |

The order is the `ROUTES` list at the top of `js/browser.js`.

Every page shows the **delivery roadmap dial**: a ring that fills up one step at a time (spec, build, test, ship), with that page's year on its face (NOW on Home). It is also on the laptop screen at the desk. Edit the phases, step counts and colours in `delivery` in `js/content.js`. On the Experience page the year follows the role being read as you scroll.

**Engineering examples and skill evidence.** The Resume page has an Engineering examples panel: each example says what the system was, what I personally did, the problem and the outcome. Edit them in `examples` in `js/content.js`. Only write what is true, and add numbers only if you have them. An example is shown inside its project's page, and a qualification can point to it with `example: "id"`. Skills have no self-rated percentages: each one shows evidence worked out from the projects and roles that mention it (plus any example that lists it). Skills with nothing behind them yet appear under *Also*. To write the evidence yourself, use `["Skill", "evidence text"]` in `skills`.

**The CV on the desk.** Tapping the CV sheet lifts it off the table, flips it and holds it facing you for a moment, then it glides into the laptop screen and the browser opens on the Resume page with the CV viewer open. It goes back on the table when you return to the desk (with reduced motion it skips the flourish). The animation is `raiseCv` in `js/desk-scene.js`.

**Travel by scrolling.** Keep scrolling past the end of a page and a small meter fills; when it is full you dive to the next page (in tab order). Scroll up past the top to come back, landing at the end of the earlier page. It works with the mouse wheel, touch swipes and the arrow / Page / Space keys. The toolbar shows where you are (Depth 3/7). Change `DIVE_PUSH` in `js/browser.js` to make the push shorter or longer.

Switching tabs runs a year counter from one era to the other. The tunnel twists one way going back and the other way going forward. Change the years in `ERA` to whatever suits you.

## Structure

```
index.html          page shell
css/style.css       all styling
js/content.js       all portfolio content
js/desk-scene.js    the desk, laptop, lamp and fly-in camera
js/time-scene.js    time tunnel, the roadmap dial and the time jump between pages
js/browser.js       tabs, address bar, history and every page
js/main.js          ties it together (intro, enter/exit, input)
```

## Features kept from the Streamlit version

Every page (Home, Experience, Resume, Projects, Education, Contact, Blog), the Education / Certificates tabs, project filters by technology and name, the interactive skills chart with hover details, CV download and in-page CV viewer, and all social and blog links.

New: the address bar accepts page names (`projects`, `cv`, `blogs`…), back / forward / reload, links such as `yoursite/?page=projects` that open directly on a page (the site otherwise always opens on Home, even after a refresh), a contact form that opens your email app, one-click copy for the email and credential IDs, a flippable hourglass, and a desk whose sky, light and weather follow the visitor's time and place, reduced-motion support, and a WebGL-free fallback.
