// "Beyond the Case Studies" section on the home page: a collage of six designs. Clicking one opens it in a full-view
// viewer at full resolution (the viewer logic is the "Beyond the Case Studies viewer" block in lib/canvas.js).
//
// Images: public/selected/<name>.webp (1600px wide, used in the collage) and public/selected/full/<name>.webp
// (original size, shown in the viewer). The collage is one horizontally scrolling row that also drifts on its own (see lib/canvas.js): every tile has the same height and a
// width proportional to its image's aspect ratio (--ar), so nothing is cropped.
type Design = { name: string; title: string; alt: string; w: number; h: number; fw: number; fh: number };

const DESIGNS: Design[] = [
  { name: "invoices", title: "Tallyhouse · Invoices", alt: "Tallyhouse invoices dashboard with needs-attention cards, collected-per-month chart and a payment page", w: 1600, h: 900, fw: 2000, fh: 1125 },
  { name: "pricing", title: "Pricing page", alt: "Pricing page with Starter, Growth and Enterprise plans and a tailored-quote banner", w: 1600, h: 1717, fw: 1864, fh: 2000 },
  { name: "savings", title: "Vela · Round-up savings", alt: "Vela savings app cards: spare change, round-ups, a money tip, a monthly budget and a Goa trip goal", w: 1600, h: 1200, fw: 2000, fh: 1500 },
  { name: "learnloop-app", title: "Learnloop · Mobile app", alt: "Four Learnloop mobile screens: find a starting point, pick up where you left off, course modules, and a lesson", w: 1600, h: 1200, fw: 2000, fh: 1500 },
  { name: "learnloop-site", title: "Learnloop · Website", alt: "Learnloop homepage: Learn the skills that move you forward, at your pace", w: 1600, h: 1200, fw: 2000, fh: 1500 },
  { name: "arke", title: "Arke · Shopping app", alt: "Arke fashion app: discover, a product page for a flannel overshirt, and the bag", w: 1600, h: 1200, fw: 2000, fh: 1500 },
];

const a = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const GRID =
  '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 0v10M7 0v10M0 3h10M0 7h10" stroke="currentColor" stroke-width="1"/></svg>';
const EXPAND =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';

const tile = (i: number) => {
  const d = DESIGNS[i];
  return `<figure class="sd-tile" id="sd-${i + 1}" style="--ar:${(d.w / d.h).toFixed(4)}" data-layer="${a(d.title)}" data-kind="image">
            <button class="sd-open" type="button" data-i="${i}" data-full="/selected/full/${d.name}.webp" data-fw="${d.fw}" data-fh="${d.fh}" data-title="${a(d.title)}" data-cursor="Open full view" aria-label="Open ${a(d.title)} in full view">
              <img src="/selected/${d.name}.webp" alt="${a(d.alt)}" width="${d.w}" height="${d.h}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async" draggable="false">
              <span class="sd-chip">${a(d.title)}</span>
              <span class="sd-exp">${EXPAND}</span>
            </button>
          </figure>`;
};

const ARROW_L =
  '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_R =
  '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const track = `<div class="sd-row">
          ${DESIGNS.map((_, i) => tile(i)).join("\n          ")}
        </div>`;

export const selectedMarkup = `<section class="cases sd" id="selected" data-layer="Beyond the Case Studies" data-kind="frame" aria-labelledby="selected-title">
  <div class="cc-head exp-head">
    <h2 id="selected-title" class="big-title"><span class="ti-sans">Beyond the </span><span class="ti-serif">Case Studies</span></h2>
  </div>
  <div class="fr sd-frame" id="fr-selected" data-layer="Collage" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}Beyond the Case Studies · scrolls on its own · click a screen to open it</p>
    <div class="fr-body sd-board" id="sd-board">
      <div class="sd-collage" id="sd-collage" tabindex="-1">
        ${track}
      </div>
      <button class="sd-arrow sd-arrow-l" type="button" aria-label="Scroll left">${ARROW_L}</button>
      <button class="sd-arrow sd-arrow-r" type="button" aria-label="Scroll right">${ARROW_R}</button>
      <span class="sel-box" aria-hidden="true"><span class="handle h-tl"></span><span class="handle h-tr"></span><span class="handle h-bl"></span><span class="handle h-br"></span></span>
      <span class="dims" aria-hidden="true"></span>
    </div>
  </div>
</section>
<div class="ui sd-view" id="sd-view" role="dialog" aria-modal="true" aria-label="Design viewer" hidden>
  <button class="sd-btn sd-close" type="button" aria-label="Close full view"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
  <button class="sd-btn sd-nav sd-prev" type="button" aria-label="Previous design"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <button class="sd-btn sd-nav sd-next" type="button" aria-label="Next design"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <div class="sd-view-stage" id="sd-view-stage"><img class="sd-view-img" id="sd-view-img" alt="" draggable="false"></div>
  <p class="sd-view-cap" aria-live="polite"><span id="sd-view-n">01</span><span>/ ${String(DESIGNS.length).padStart(2, "0")}</span><b id="sd-view-t"></b><em id="sd-view-hint">Click the image for actual size</em></p>
</div>`;

const ROW_ICON =
  '<span class="ic" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 0v10M7 0v10M0 3h10M0 7h10" stroke="currentColor"/></svg></span>';
const IMG_ROW_ICON =
  '<span class="ic" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1.5" width="8" height="7" rx="1" fill="none" stroke="currentColor"/><path d="m1.5 7.5 2.5-2.5 2 1.8 1.5-1.3 1.5 1.5" fill="none" stroke="currentColor"/></svg></span>';

/** Layers-panel rows for the section: the section, the collage, then one row per design. */
export const selectedLayers = [
  `<a class="ly d0 top" href="#selected" data-target="selected">${ROW_ICON}<span class="lt">Beyond the Case Studies</span></a>`,
  `<a class="ly d1" href="#fr-selected" data-target="fr-selected">${ROW_ICON}<span class="lt">Collage</span></a>`,
  ...DESIGNS.map((d, i) => `<a class="ly d2" href="#sd-${i + 1}" data-target="sd-${i + 1}">${IMG_ROW_ICON}<span class="lt">${a(d.title)}</span></a>`),
].join("\n      ");
