# Yashita's portfolio

Personal portfolio for Yashita, Senior UI/UX Designer. Next.js (App Router), deploys to Vercel.
The whole site is styled as an open Figma file: dot-grid canvas, Layers panel (left),
Design/inspect panel (right), link bar (bottom), Figma multiplayer cursor, and a helper
character called Pixel.

## Structure
- `app/layout.tsx` – fonts (Instrument Sans + Caveat via next/font), metadata
- `app/page.tsx` – renders the page markup and mounts the client script
- `app/globals.css` – all styles and design tokens
- `lib/markup.ts` – page HTML as a string (ported 1:1 from the approved preview)
- `lib/canvas.js` – all interactions (vanilla JS, runs once on mount)
- `components/canvas-client.tsx` – client component that calls `initCanvas()`
- `lib/chrome.ts` – the markup every canvas page repeats (top bar toggles, link bar, cursor, Design panel); `lib/markup.ts` and the case study both build from it

### Case studies
Each case study is its own route under `app/case-studies/<slug>/` and reuses the home page's chrome and `lib/canvas.js`:
- `page.tsx` (metadata + JSON-LD), `case-study.css` (layout + widgets, all prefixed `cs-`), `opengraph-image.tsx` (share image)
- `lib/<slug>-markup.ts` builds the HTML (sections, Layers rows; ids are checked at load) and `lib/<slug>.js` holds the page's own interactions
- images live in `public/case-studies/<slug>/`
- BexCard is the first one (`lib/bexcard-markup.ts`, `lib/bexcard.js`) and owns the shared `cs-` layout/widgets in its `case-study.css`. Chat360 (`lib/chat360-markup.ts`, `lib/chat360.js`, `app/case-studies/chat360/`) imports that stylesheet and adds its own `c3-` styles; its `initChat360()` calls `initBexCard()` for the shared reveal/tabs/viewer behaviour. To add another, copy the Chat360 set, add the route to `app/sitemap.ts`, and link it from the work-experience card the way BexCard/Chat360 are (a `.fr-case` overlay link + `.sticky-case` note + `data-return="<card id>"`).
- Case-study pages open with Inspect closed (an inline script in `page.tsx` sets `data-inspect="off"` before first paint); the toggle still opens the panels.
- Coming back from a case study skips the opening animation and lands on the card that was opened (`yp-return` in sessionStorage, read once in `lib/intro.js`).

## Design rules (keep these)
- Minimal, off-white canvas `#F7F7F5` with a faint 24px dot grid. Light by default, plus a dark theme
  (`html[data-theme="dark"]` re-maps the tokens at the top of `globals.css`; use `var(--surface)`, `--hair`, etc.
  instead of hard-coded colours). The top bar has two toggles: Dark mode ("swap colours" swatches, key X) and Inspect (code-brackets icon, key I) (shows/hides the Layers +
  Design panels, `html[data-inspect="off"]`). Every visit starts in light mode with the panels open; the choices are not saved between visits.
- Colors: ink `#1C1C1E`, muted `#6F6F74`, Figma selection blue `#0D99FF`,
  component purple `#9747FF`, available green `#14AE5C`.
- One UI typeface (Instrument Sans); Caveat only for handwritten notes.
- Figma metaphors: sections are frames with `#` labels and blue selection on hover;
  Consequence is a component set (dashed purple) with variants `Site=Editorial` / `Site=Live`.
- Every element on the canvas has `data-layer` + `data-kind` so the Design panel can inspect it.
  New sections must add these and a matching row in the Layers panel.
- Respect `prefers-reduced-motion`. Custom cursor and panels are desktop-only (fine pointer).

## Content
- Email: figmaebae@gmail.com (press C to copy)
- LinkedIn, Twitter/X, Medium links: `LINKS` object in `lib/canvas.js`
- Resume: `public/resume.pdf`, linked through `LINKS.resume` in `lib/canvas.js` (opens in a new tab)
- Experience: WASP (current, works on Consequence), BexCard, Chat360, Mimothi Solutions (intern)
- Company logos are base64 images cropped from a screenshot (low-res). Replace with
  official logo files in `/public` when available.

## Next steps
2. Refactor `lib/markup.ts` + `lib/canvas.js` into typed React components
   (Hero, Experience, FrameCard, LayersPanel, DesignPanel, LinkBar, Pixel, FigmaCursor)
   with content in a `content/site.ts` data file. Keep the look and behavior identical.
3. More case studies (BexCard is done; see "Case studies" above for the pattern).
