// Shared page chrome: the markup that every canvas page (home, case studies) repeats.
// lib/markup.ts (home) and lib/bexcard-markup.ts (case study) both build their HTML from these,
// so a change to a toggle icon, a social link or the cursor only has to be made once.

/** Bottom link bar: LinkedIn, X, Medium, Resume. The hrefs are filled in by initCanvas (LINKS). */
export const toolbar = `<nav class="ui toolbar" aria-label="Links">
  <a class="tool soc" data-link="linkedin" data-cursor="LinkedIn" title="LinkedIn" target="_blank" rel="noopener noreferrer"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.44 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V22h-4.56v-6.62c0-1.58-.03-3.61-2.2-3.61-2.2 0-2.54 1.72-2.54 3.5V22H7.66V8z"/></svg><span class="sr-only">LinkedIn (opens in a new tab)</span></a>
  <a class="tool soc" data-link="twitter" data-cursor="Twitter / X" title="Twitter / X" target="_blank" rel="noopener noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg><span class="sr-only">Twitter (opens in a new tab)</span></a>
  <a class="tool soc" data-link="medium" data-cursor="Medium" title="Medium" target="_blank" rel="noopener noreferrer"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="6.8" cy="12" rx="6.3" ry="6.4"/><ellipse cx="16.9" cy="12" rx="3.2" ry="6"/><ellipse cx="22" cy="12" rx="1.2" ry="5.4"/></svg><span class="sr-only">Medium (opens in a new tab)</span></a>
  <span class="tb-sep" aria-hidden="true"></span>
  <a class="resume" data-link="resume" data-cursor="Open resume" target="_blank" rel="noopener noreferrer">Resume<span class="sr-only"> (opens in a new tab)</span></a>
</nav>`;

/** Top bar with the Dark mode + Inspect toggles. `lead` is extra markup placed before them (e.g. a back link). */
export const topbar = (lead = "") =>
  `<div class="ui topbar" role="toolbar" aria-label="Display options">${lead}
  <button type="button" class="tgl tgl-theme" id="tgl-theme" role="switch" aria-checked="false" aria-label="Dark mode" aria-keyshortcuts="X" title="Swap colours: light / dark"><span class="swap" aria-hidden="true"><span class="swap-b"></span><span class="swap-a"></span><svg class="swap-ar" viewBox="0 0 12 12"><path d="M1.8 7.6A4.4 4.4 0 0 1 9.2 3.2"/><path d="M7 2.6l2.4.6-.5 2.4"/><path d="M10.2 4.4A4.4 4.4 0 0 1 2.8 8.8"/><path d="M5 9.4l-2.4-.6.5-2.4"/></svg></span><span class="tgl-roll" aria-hidden="true"><span>Light</span><span>Dark</span></span></button>
  <span class="tb-sep tgl-sep" aria-hidden="true"></span>
  <button type="button" class="tgl tgl-inspect" id="tgl-inspect" role="switch" aria-checked="true" aria-label="Inspect" aria-keyshortcuts="I" title="Show or hide the layers and inspect panels"><svg class="cb" viewBox="0 0 30 30" aria-hidden="true"><path class="cb-l" d="M11 9l-6 6 6 6"/><path class="cb-r" d="M19 9l6 6-6 6"/><path class="cb-s" pathLength="1" d="M17 6l-4 18"/></svg><span class="tgl-label">Inspect</span></button>
</div>`;

/** The Figma-style multiplayer cursor that follows the mouse. */
export const cursor = `<div class="cursor" id="cursor" aria-hidden="true">
  <svg width="20" height="22" viewBox="0 0 20 22"><path class="arrow" d="M2 2v15.5l4.2-4 2.9 6.6 2.8-1.2-2.9-6.5H15z" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>
  <span class="tag" id="tag">You</span>
</div>`;

/** Right-hand Design panel (the hover inspector fills #insp). */
export const designPanel = `<aside class="ui panel panel-r" aria-label="Design properties">
  <div class="p-head"><span class="p-file">Design</span><span class="p-sub" id="insp-name">Page 1</span></div>
  <div class="p-body" id="insp"></div>
</aside>`;
