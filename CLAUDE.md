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
- `lib/selected-designs.ts` – the "Beyond the Case Studies" section (one row of tiles that drifts sideways on its own) (markup + Layers rows + the full-size viewer dialog); the viewer's behaviour is the "Beyond the Case Studies viewer" block in `lib/canvas.js`. Images: `public/selected/<name>.webp` (1600px, shown in the collage) and `public/selected/full/<name>.webp` (original size, shown in the viewer). Every tile has the same height and a width from its aspect ratio (nothing is cropped); the row auto-scrolls in an endless loop (JS adds two copies of the tiles; it pauses on hover, drag, touch, keyboard focus and while the viewer is open; with reduced motion it doesn't move or loop) and can also be moved by trackpad, mouse drag or the side arrows ("Beyond the Case Studies row" block in `lib/canvas.js`). To add one, add it to `DESIGNS` with both image sizes.
- `lib/chrome.ts` – the markup every canvas page repeats (top bar toggles, link bar, cursor, Design panel); `lib/markup.ts` and the case study both build from it

### Case studies
Each case study is its own route under `app/case-studies/<slug>/` and reuses the home page's chrome and `lib/canvas.js`:
- `page.tsx` (metadata + JSON-LD), `case-study.css` (layout + widgets, all prefixed `cs-`), `opengraph-image.tsx` (share image)
- `lib/<slug>-markup.ts` builds the HTML (sections, Layers rows; ids are checked at load) and `lib/<slug>.js` holds the page's own interactions
- images live in `public/case-studies/<slug>/` (Chat360's `final-board.webp`, the single image in section 12, is a composite of the ten `new-*.webp` screens: they sit on a gradient in rounded cards with dark label pills; regenerate it with sharp if a screen changes)
- BexCard is the first one (`lib/bexcard-markup.ts`, `lib/bexcard.js`) and owns the shared `cs-` layout/widgets in its `case-study.css`. Chat360 (`lib/chat360-markup.ts`, `lib/chat360.js`, `app/case-studies/chat360/`) imports that stylesheet and adds its own `c3-` styles; its `initChat360()` calls `initBexCard()` for the shared reveal/tabs/viewer behaviour. Quorum (`lib/quorum-markup.ts`, `lib/quorum-diagrams.ts` for its three SVG diagrams, `lib/quorum.js`, `app/case-studies/quorum/`) imports both of those stylesheets and adds `q-` styles, so the stylesheets chain bexcard (`cs-`) → chat360 (`c3-`) → quorum (`q-`). To add another, copy the Chat360 set, add the route to `app/sitemap.ts`, and add a card for it in the home page's "Case studies" section (`#cases`, right after the hero) the way BexCard/Chat360 are: a `.fr` frame with a `.fr-case` overlay link and `data-return="<card id>"`, a `.cc-media` preview, role/dates, title and result chips, plus a Layers row.
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
- Home page order: Hero, Case studies (BexCard, Chat360, Quorum), Beyond the Case Studies (six designs in a horizontally scrolling row; click one for the full-size viewer), Experience (WASP, BexCard, Chat360, Mimothi Solutions, then Freelance last), Testimonials, Skills, Writing, Stack, Off the grid (gallery), Footer (contact). The Layers panel rows follow the same order.
- Skills section ("Things I'm really good at", `#services`, classes `services cases sv2`): five tinted vertical strips side by side (`.sv` in `ol.sv-strips`, ids `sv-*`, tint from `--tint`). The strip you point at, tap or focus opens to show its icon + the pain-point question; the rest fold to a number and a vertical title. They also open one after another every 2s on desktop (paused while pointing at them, off with reduced motion). On phones it is a stack of cards, the active one unfolds under its title. Icons are in `public/services/`. Logic: the "Services" block in `lib/canvas.js`. (The previous index + preview-card version is not kept in the repo.)
- Experience: WASP (current, works on Consequence), BexCard, Chat360, Mimothi Solutions (intern), then Freelance as the last row with a pink "beyond 9 to 5" sticky tag (startups and founders; its Clients component set with Citrus and OSG used to be the separate "Beyond the 9-to-5" section, which no longer exists). Layout: the heading + spinning badge sit in a left column and the roles are a ruled list on the right (`.xr-*` styles, section classes `experience cases xr`, same width as the Case studies grid). WASP, Freelance and Mimothi rows open on click/tap (one at a time, `+` button, `aria-expanded`); picking one of their layers in the Layers panel opens it too. BexCard and Chat360 are plain non-expanding rows. BexCard and Chat360 appear both under Work experience (plain job cards, ids `fr-exp-*`) and as case-study cards in the Case studies section (ids `fr-bexcard`, `fr-chat360`, which the case pages' back links return to). Quorum is a client project (names changed for confidentiality in the case study); its card shows "Solo product designer · 4–6 months" because no dates were given.
- Company logos are base64 images cropped from a screenshot (low-res). Replace with
  official logo files in `/public` when available.

## Next steps
2. Refactor `lib/markup.ts` + `lib/canvas.js` into typed React components
   (Hero, Experience, FrameCard, LayersPanel, DesignPanel, LinkBar, Pixel, FigmaCursor)
   with content in a `content/site.ts` data file. Keep the look and behavior identical.
3. More case studies (BexCard is done; see "Case studies" above for the pattern).
