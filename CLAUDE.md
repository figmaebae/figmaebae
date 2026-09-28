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

## Design rules (keep these)
- Minimal, off-white canvas `#F7F7F5` with a faint 24px dot grid. Light mode only.
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
- Resume: **not linked yet** – set `LINKS.resume` in `lib/canvas.js` (opens in a new tab)
- Experience: WASP (current, works on Consequence), BexCard, Chat360, Mimothi Solutions (intern)
- Company logos are base64 images cropped from a screenshot (low-res). Replace with
  official logo files in `/public` when available.

## Next steps
1. Link the resume.
2. Refactor `lib/markup.ts` + `lib/canvas.js` into typed React components
   (Hero, Experience, FrameCard, LayersPanel, DesignPanel, LinkBar, Pixel, FigmaCursor)
   with content in a `content/site.ts` data file. Keep the look and behavior identical.
3. Add projects / case studies section (as frames on the canvas).
