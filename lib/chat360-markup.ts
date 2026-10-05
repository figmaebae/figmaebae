// Chat360 case study page, built like the BexCard one: plain HTML rendered into the page, with lib/canvas.js
// (theme, Inspect, Layers + Design panels, cursor) and lib/chat360.js (the interactive bits) attached on mount.
// Chrome (top bar, link bar, cursor, Design panel) comes from lib/chrome.ts so it matches the home page.
//
// Rules from CLAUDE.md that apply here: every block has data-layer + data-kind (so the Design panel can
// inspect it) and a matching row in the Layers panel (see LAYERS below; ids are checked at load).
import { toolbar, topbar, cursor, designPanel } from "./chrome";

const IMG = "/case-studies/chat360/";

/* ---------- small helpers ---------- */
const a = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const GRID =
  '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 0v10M7 0v10M0 3h10M0 7h10" stroke="currentColor" stroke-width="1"/></svg>';
const DIAMONDS =
  '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 .6 6.9 2.5 5 4.4 3.1 2.5zM7.5 3.1 9.4 5 7.5 6.9 5.6 5zM2.5 3.1 4.4 5 2.5 6.9.6 5zM5 5.6 6.9 7.5 5 9.4 3.1 7.5z" fill="currentColor"/></svg>';
const DIAMOND =
  '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1 9 5 5 9 1 5z" fill="none" stroke="currentColor"/></svg>';
const SEL_CHROME =
  '<span class="sel-box" aria-hidden="true"><span class="handle h-tl"></span><span class="handle h-tr"></span><span class="handle h-bl"></span><span class="handle h-br"></span></span>';

const ICON = {
  frame: GRID.replace(' aria-hidden="true"', ""),
  text: '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1.5h8M5 1.5V9" stroke="currentColor" stroke-width="1.2"/></svg>',
  image:
    '<svg width="10" height="10" viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" rx="1" fill="none" stroke="currentColor"/><circle cx="3.2" cy="3.2" r=".9" fill="currentColor"/><path d="M1 8l2.4-2.8 2 1.9 1.4-1.8L9 8" stroke="currentColor" stroke-width="1" fill="none"/></svg>',
  component: DIAMONDS.replace(' aria-hidden="true"', ""),
  variant: DIAMOND.replace(' aria-hidden="true"', ""),
} as const;
type Kind = keyof typeof ICON;

/** A page screenshot (1600×801). `zoom` wraps it in a button that opens the viewer; `pos` picks which part a crop shows. */
function wshot(file: string, alt: string, opts: { layer?: string; zoom?: string; pos?: string; eager?: boolean; h?: number } = {}) {
  const layer = opts.layer ?? alt;
  const img = `<img class="c3-shot" src="${IMG}${file}.webp" alt="${a(alt)}" width="${opts.h ? 1200 : 1600}" height="${opts.h ?? 801}" ${
    opts.eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'
  } decoding="async"${opts.pos ? ` style="object-position:${opts.pos}"` : ""} data-layer="${a(layer)}" data-kind="image">`;
  if (!opts.zoom) return img;
  return `<button class="cs-zoom" type="button" data-zoom data-zoom-group="${opts.zoom}" data-cursor="Enlarge: ${a(layer)}" aria-label="Enlarge screenshot: ${a(layer)}">${img}</button>`;
}

/** A browser window around a page screenshot. */
const bw = (inner: string, url = "chat360.io") =>
  `<div class="c3-bw"><div class="c3-bar" aria-hidden="true"><i></i><i></i><i></i><span>${url}</span></div>${inner}</div>`;

/** Two-tone section heading, like every other title on the site. */
const title = (id: string, sans: string, serif: string) =>
  `<h2 class="big-title cs-h2" id="${id}"><span class="ti-sans">${sans} </span><span class="ti-serif">${serif}</span></h2>`;

function section(id: string, layer: string, label: string, sans: string, serif: string, intro: string | null, body: string) {
  return `<section class="cs-sec cs-wrap" id="${id}" data-layer="${a(layer)}" data-kind="frame" aria-labelledby="${id}-h">
  <p class="fr-label">${GRID}${label}</p>
  ${title(id + "-h", sans, serif)}
  ${intro ? `<p class="cs-sub">${intro}</p>` : ""}
  ${body}
</section>`;
}

const tile = (id: string, layer: string, label: string, inner: string, cls = "") =>
  `<div class="cs-tile${cls ? " " + cls : ""}" id="${id}" data-layer="${a(layer)}" data-kind="frame"><span class="cs-lab">${label}</span>${inner}</div>`;

/** A big number that counts up when it scrolls into view (the real value is in the HTML, so it also reads fine with no JS). */
const stat = (n: number, pre: string, suf: string) =>
  `<div class="cs-stat"><span class="sr-only">${pre}${n}${suf}</span><span aria-hidden="true">${pre}<span class="cs-num" data-to="${n}">${n}</span>${suf ? `<span class="ti-serif cs-suf">${suf}</span>` : ""}</span></div>`;

/** A small heading with a letter chip, used for the four research methods A–D. */
const kh = (k: string, text: string) => `<h3 class="cs-h3 cs-gap"><span class="c3-k" aria-hidden="true">${k}</span>${text}</h3>`;

const dot = (k: "y" | "p" | "n", text = "") => `<span class="c3-dot ${k}" aria-hidden="true"></span>${text}`;

/** Component-set tab strip + hidden panels, used for the decisions, the forks and the reflection. */
function variantSet(opts: {
  id: string;
  layer: string;
  label: string;
  prop: string;
  tabs: string[];
  panels: string[];
  hash: string; // id prefix of each panel
  extra?: string;
}) {
  const { id, hash, prop } = opts;
  return `<div class="cset c3-set ${opts.extra ?? ""}" id="${id}" data-layer="${a(opts.layer)}" data-kind="component" data-measure=".cset-box">
    <p class="cset-label">${DIAMONDS}${opts.label}</p>
    <div class="cset-box">
      <div class="cs-vprops" role="tablist" aria-label="${a(opts.label)}" data-tabs="${id}">
        <span class="cs-vlab">${prop}</span>
        ${opts.tabs
          .map(
            (t, i) =>
              `<button class="cs-vbtn" type="button" role="tab" id="${hash}t-${i}" aria-controls="${hash}-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-cursor="${a(prop)}: ${a(t)}">${t}</button>`,
          )
          .join("")}
      </div>
      ${opts.panels
        .map(
          (p, i) =>
            `<div class="cs-variant" role="tabpanel" id="${hash}-${i}" aria-labelledby="${hash}t-${i}" data-layer="${a(prop)}=${a(opts.tabs[i])}" data-kind="variant" data-measure=".v-card"${i === 0 ? "" : " hidden"}>
        <span class="v-prop">${DIAMONDS}${prop}=${opts.tabs[i]}</span>
        <div class="v-card c3-vcard">${p}</div>
      </div>`,
        )
        .join("")}
    </div>
  </div>`;
}

/* ---------- content ---------- */
const CONTEXT: [string, string][] = [
  ["The business", "Chat360 is a B2B customer-experience platform. Its AI agents handle sales, support and engagement across WhatsApp, web, social and voice for brands in retail, finance, education, automotive and more."],
  ["What had changed", "The old page still sold a “Generative AI powered, no-code chatbot builder”, in its own words. The product had grown into agentic AI agents and a new voice product, Voice360."],
  ["Why it mattered", "The homepage is where most buyers form a first impression, and its commercial job is to turn visitors into demo requests. A page a release behind the product undersold it at exactly that moment."],
  ["Who it is for", "Decision-makers in CX, sales and marketing evaluating conversational AI. They arrive already knowing WhatsApp. They need three answers fast: what will this do for my business, does it fit my industry, and who else trusts it?"],
  ["What they got", "A generic AI headline, four channel blurbs with platform stats, four solution cards and a row of blog posts. No outcomes, no customer voices, and two competing “main” buttons."],
];

const CRITERIA: [string, string, string, "p" | "a" | "d"][] = [
  ["More demo requests", "Demo bookings that start on the homepage go up. This is the page's commercial job.", "Primary · analytics", "p"],
  ["Fewer early exits", "Bounce rate goes down: visitors find a reason to keep reading or act.", "Analytics", "a"],
  ["Clear value", "The hero alone says what Chat360 achieves and for whom, in today's positioning.", "Design check", "d"],
  ["One next step", "A single primary action above the fold, repeated consistently.", "Design check", "d"],
  ["Find your industry", "A buyer sees their own industry within the first couple of scrolls.", "Design check", "d"],
  ["Evidence before the ask", "Customer results and named voices appear before the closing CTA.", "Design check", "d"],
];

const METHODS: [string, string, string][] = [
  ["A", "Heuristic audit", "Walked the live page as a first-time buyer and logged every point of friction."],
  ["B", "CTA inventory", "Counted every button, its label, its visual weight and where it led."],
  ["C", "Content inventory", "Mapped each section against the questions a buyer needs answered."],
  ["D", "Positioning gap", "Compared the page's language with what the product had become."],
];

type Mark = { box: [number, number, number, number]; pin: [number, number] }; // % of the screenshot: [left, top, width, height] and the pin centre
const AUDIT: { t: string; short: string; sev: "h" | "m"; p: string; slide: string; marks: Mark[] }[] = [
  { t: "A category, not a promise", short: "Category, not a promise", sev: "h", slide: "hero", p: "“Generative AI for Enhanced CX Engagement” could be any chatbot vendor. It names the technology, not the result.", marks: [{ box: [14.9, 25.5, 36.7, 12], pin: [51.6, 25.5] }] },
  { t: "Two “main” buttons", short: "Two main buttons", sev: "h", slide: "hero", p: "The nav makes Start Free Trial the filled button. Directly below, the hero makes Schedule a Demo the filled one.", marks: [{ box: [66.1, 1.5, 10.6, 5.6], pin: [76.7, 7.1] }, { box: [27.6, 54.2, 11.9, 5.6], pin: [39.5, 59.8] }] },
  { t: "Organised by channel", short: "Channels, not results", sev: "h", slide: "channels", p: "WhatsApp, Messenger, Instagram and Website each get a block of platform stats (“2.2 billion people”), not Chat360 results.", marks: [{ box: [14.7, 21.2, 71, 68.7], pin: [85.7, 21.2] }] },
  { t: "Eight identical blocks", short: "Eight identical blocks", sev: "m", slide: "solutions", p: "Icon, paragraph, “Know more”; then icon, paragraph, “Learn More”. Eight times. Nothing stands out.", marks: [{ box: [13.6, 1, 72.8, 68], pin: [86.4, 4.5] }] },
  { t: "Proof was only logos", short: "Proof was only logos", sev: "m", slide: "logos", p: "“300+ brands” and a logo strip. No testimonials, results or case studies.", marks: [{ box: [16.4, 14, 67.6, 10.4], pin: [84, 14] }] },
  { t: "Blog posts in the trust slot", short: "Blog in the trust slot", sev: "m", slide: "blog", p: "The space before the final CTA held three blog posts, not customer results.", marks: [{ box: [14.3, 11, 71.6, 74.7], pin: [85.9, 11] }] },
  { t: "Stock art instead of the product", short: "Stock art, no product", sev: "m", slide: "hero", p: "A stock illustration of a hand holding a phone. Visitors never saw the product or the channels it connects. It's covered under Decision 6.", marks: [{ box: [58.75, 15.2, 27.7, 44.4], pin: [86.4, 15.2] }] },
];
const SLIDES: [string, string, string][] = [
  ["hero", "old-hero", "Old homepage hero"],
  ["channels", "old-channels", "Old channel section"],
  ["solutions", "old-solutions", "Old solution cards"],
  ["logos", "old-logos", "Old logo strip"],
  ["blog", "old-blog", "Old blog cards"],
];

const CTAS: [string, string][] = [
  ["Nav", '<span class="c3-fb f">Start Free Trial</span><span class="c3-fb o">Login</span>'],
  ["Hero", '<span class="c3-fb o">Start Free Trial</span><span class="c3-fb f">Schedule a Demo</span>'],
  ["Channels", '<span class="c3-fb f">Know more →</span>'.repeat(4)],
  ["Solutions", '<span class="c3-fb f">Learn More →</span>'.repeat(4)],
  ["Mid-page", '<span class="c3-fb f">Sign up for free</span>'],
  ["Closing", '<span class="c3-fb o">Schedule a Demo</span>'],
];

const INVENTORY: [string, string, string, string, string, string][] = [
  ["Hero", dot("p", "Category only"), dot("n"), dot("n"), dot("n"), dot("p", "Two options")],
  ["Logos", dot("n"), dot("p", "Unsorted"), dot("n"), dot("p", "Logos only"), dot("n")],
  ["Channels ×4", dot("p", "By channel"), dot("n"), dot("p", "Platform stats"), dot("n"), dot("p", "Know more ×4")],
  ["Solutions ×4", dot("n"), dot("n"), dot("p", "By function"), dot("n"), dot("p", "Learn More ×4")],
  ["Blog ×3", dot("n"), dot("n"), dot("n"), dot("n"), dot("n")],
  ["Closing", dot("n"), dot("n"), dot("n"), dot("n"), dot("y", "Demo")],
];

type Shot = { f: string; h: number; alt: string; cap: string };
const INSIGHTS: { t: string; obs: string; ev: string; why: string; so: string; obsShot: Shot; evShot: Shot; led: number[] }[] = [
  {
    t: "Buyers judge outcomes, not channels.",
    obs: "The headline named a technology (“Generative AI for Enhanced CX Engagement”), and the largest section described WhatsApp, Messenger, Instagram and Website.",
    ev: "The content inventory (C) showed no section answering “what will it do for me?” in business terms. The channel copy quoted platform statistics such as “2.2 billion people” rather than results Chat360 delivered (A).",
    why: "The page's buyers already use these channels. Telling them where Chat360 works gives them no reason to book a demo.",
    so: "Lead every primary message with a business result, and treat channels as proof of reach rather than as the story.",
    obsShot: { f: "ins1-obs", h: 439, alt: "Old hero: Generative AI for Enhanced CX Engagement", cap: "The old hero names a technology, not a result." },
    evShot: { f: "ins1-ev", h: 426, alt: "Old channel section with platform statistics", cap: "The channel copy quotes platform stats (“2.2 billion people”), not Chat360 results." },
    led: [0],
  },
  {
    t: "A page with two primary actions has none.",
    obs: "The nav's filled button was Start Free Trial; the hero's filled button was Schedule a Demo.",
    ev: "The CTA inventory (B) counted 13 buttons with 5 labels, all in the same visual weight. Eight of them led to channel or solution pages rather than to a conversion.",
    why: "Demo requests are the page's commercial job. When the page doesn't signal the next step, visitors have to decide for themselves, and many leave instead.",
    so: "Give each stage of the page one job: demo above the fold, trial at the close, small links in between.",
    obsShot: { f: "ins2-obs", h: 470, alt: "Old nav and hero, each with its own filled button", cap: "Start Free Trial is the filled button in the nav; Schedule a Demo is the filled button right below it." },
    evShot: { f: "ins2-ev", h: 610, alt: "Know more, Learn More and Sign up for free buttons from the old page", cap: "Know more ×4, Learn More ×4 and Sign up for free: five labels, all the same weight." },
    led: [1],
  },
  {
    t: "B2B buyers look for themselves.",
    obs: "Solutions were grouped by internal function (lead generation, support, WhatsApp Business, marketing). The logo strip mixed fitness, automotive, education and retail brands with no way to sort them.",
    ev: "The content inventory (C) found no section answering “does it fit my industry?” The existing page structure (A) showed that the customer base already spanned many industries.",
    why: "A bank and a retailer evaluate the same product against very different problems. Seeing a peer's use case is the fastest route to relevance.",
    so: "Organise use cases by industry and job, and let social proof be filtered by industry.",
    obsShot: { f: "ins3-obs", h: 734, alt: "Old solutions grouped by function", cap: "Four solution cards grouped by internal function, not by who the buyer is." },
    evShot: { f: "ins3-ev", h: 320, alt: "Old logo strip mixing brands from different industries", cap: "A logo strip that mixes fitness, automotive, education, retail and food brands, with no way to sort them." },
    led: [2],
  },
  {
    t: "Claims need evidence next to the ask.",
    obs: "The slot just before the final CTA held three blog posts about catalogues, appointments and promotions.",
    ev: "The content inventory (C) showed “does it work?” answered only by a logo strip: no results, no testimonials, no case studies anywhere on the page.",
    why: "A demo costs a buyer time and, internally, credibility. The page asked for that commitment without giving them anything to justify it.",
    so: "Put case studies and named testimonials directly before the closing CTA.",
    obsShot: { f: "ins4-obs", h: 718, alt: "Old latest updates blog row before the closing CTA", cap: "Three blog posts sit directly before the closing ask." },
    evShot: { f: "ins4-ev", h: 407, alt: "Old logo strip followed by the closing CTA", cap: "The only proof is a logo strip, then straight to “Contact our team of experts”." },
    led: [3],
  },
  {
    t: "The page was a release behind the product.",
    obs: "The copy described a “Generative AI powered, no-code chatbot builder”. Agentic AI and Voice360 were not mentioned.",
    ev: "The positioning gap review (D) compared the page's language with what the product had become: AI agents that act across channels, plus a new voice product.",
    why: "Undersold positioning makes Chat360 look interchangeable with simpler chatbot tools, and leaves the newest product invisible to the people most likely to buy it.",
    so: "Reposition around agentic AI and make room for Voice360 without letting the new product take over the core message.",
    obsShot: { f: "ins5-obs", h: 89, alt: "Old sub-line: Generative AI powered, no-code chatbot builder", cap: "The sub-line still sells a “Generative AI powered, no-code chatbot builder”." },
    evShot: { f: "ins5-ev", h: 681, alt: "Old headline compared with the new headline and the Voice360 bar", cap: "The old headline against the new one, plus the Voice360 bar the old page had no room for." },
    led: [0, 6],
  },
];

const CONSTRAINTS: [string, string, string][] = [
  ["One month, one designer", "Audit to launch in a month, designed solo.", "Prioritised structure and messaging over custom illustration or new components."],
  ["Evolve, don't rebrand", "The page had to stay recognisably Chat360 for existing customers.", "Kept the logo and a blue-led palette; brightened the blue and refreshed radius and contrast around it."],
  ["Proof needs real material", "Case studies, quotes and logos can't be designed into existence.", "Built the proof sections around the customer material available, in formats that scale as more arrives."],
  ["The homepage still has to rank", "A slogan-only page loses the terms buyers search for.", "Headings pair the promise with descriptive terms: “Omnichannel CX Platform”, “Agentic AI”, “WhatsApp”."],
  ["Three jobs, one page", "Generate demos, launch Voice360, and keep the self-serve trial visible.", "Gave each goal a position, not equal weight: demo leads, Voice360 gets a bar and a section, trial closes."],
  ["Easy to build and update", "Marketing pages change often after launch.", "A small set of repeatable section patterns instead of one-off layouts."],
];

const DIRS: { k: string; t: string; what: string; pros: string[]; cons: string[]; pick?: boolean }[] = [
  { k: "Direction A", t: "Feature-led messaging", what: "Lead with capabilities and channels: WhatsApp, voice, web, integrations, AI. Closest to the old page.", pros: ["Shows the breadth of the platform immediately", "Easy to maintain as features ship"], cons: ["Leaves buyers to connect features to outcomes themselves (Insight 1)", "Hard to tell apart from other chatbot vendors"] },
  { k: "Direction B", t: "Industry-led messaging", what: "Lead with industries: the visitor picks a sector and the page speaks to it.", pros: ["Creates relevance quickly (Insight 3)", "Uses the breadth of the customer base"], cons: ["Fragments the story before the visitor knows what Chat360 is", "Visitors outside the listed industries feel excluded", "Needs a full content set per industry, which a one-month timeline can't support"] },
  { k: "Direction C · Chosen", t: "Outcome-led messaging, with industry as the proof layer", what: "Lead with the business result for everyone, then show it per industry and back it with customer evidence.", pros: ["Matches what buyers are trying to achieve (Insight 1)", "Keeps one story for every visitor, then lets each find themselves (Insight 3)", "Supports a single conversion path toward the demo (Insight 2)", "Fits within the timeline and the content that existed"], cons: ["Outcome language can turn generic, so the industry jobs and case studies have to carry the specifics"], pick: true },
];

const FORKS: { q: string; opts: [boolean, string, string][] }[] = [
  { q: "What is the primary action?", opts: [[false, "Trial-led", "Lowest friction, but setting up AI agents across channels usually needs guidance, and a trial alone gives sales no conversation."], [false, "Demo and trial, equal weight", "Keeps both audiences happy on paper, but recreates the split Insight 2 identified."], [true, "Demo leads, trial closes", "One clear ask up top; the trial catches visitors who reach the end but aren't ready for a call."]] },
  { q: "How should we prove it works?", opts: [[false, "Bigger logo wall", "Cheap and impressive at a glance, but logos show presence, not results."], [false, "Content hub on the homepage", "Keeps the page fresh, but blog posts serve a learning intent, not a buying one."], [true, "Case studies + named testimonials", "Specific brands, specific outcomes, real people, placed right before the final ask."]] },
  { q: "Where does Voice360 go?", opts: [[false, "Take over the hero", "Maximum launch visibility, but it replaces the core platform story for every visitor."], [false, "Nav menu only", "Safe, but almost invisible for a new product."], [true, "Top bar + its own section", "Seen on every visit, explained in depth mid-page, and the hero stays about the platform."]] },
];

const IA_OLD: [string, string, string, string][] = [
  ["k", "hero", "Hero", "headline + 2 CTAs"],
  ["k", "logos", "Logos", "300+"],
  ["r", "plat", "Channels ×4", "stats per app"],
  ["r", "ind", "Solutions ×4", "by function"],
  ["x", "demo", "“See it in action” box", ""],
  ["x", "blog", "Latest updates", "blog ×3"],
  ["k", "close", "“Contact our experts”", ""],
  ["k", "foot", "Footer", ""],
];
const IA_NEW: [string, string, string, string][] = [
  ["n", "voice", "Voice360 top bar", ""],
  ["k", "hero", "Hero", "outcome + 1 CTA"],
  ["n", "prod", "Product overview", "video"],
  ["k", "logos", "Logos by industry", "350+ · tabs"],
  ["r", "plat", "Platform: AI agents", "+ omnichannel"],
  ["r", "ind", "Business impact", "7 industries"],
  ["n", "voice", "Voice360 feature", ""],
  ["r", "plat", "Omnichannel support", ""],
  ["n", "blog", "Case studies", "×3"],
  ["n", "test", "Testimonials", "×7"],
  ["k", "close", "Free-trial close", "14 days"],
  ["k", "foot", "Footer", ""],
];
const iaBlk = ([k, g, name, small]: [string, string, string, string]) =>
  `<button class="c3-blk ${k}" type="button" data-g="${g}">${name}${small ? ` <small>${small}</small>` : ""}</button>`;

const DECISIONS: {
  t: string; h: string; c: string; p: string; dec: string; alt: string; y: string; o: string;
  oi: string; ni: string; oc: string; nc: string; op?: string; np?: string;
}[] = [
  { t: "Headline", h: "Lead with the result", c: "Clear value · Bounce",
    p: "The hero named a technology category (“Generative AI for Enhanced CX Engagement”) that any chatbot vendor could claim, and it described last year's product.",
    dec: "Rewrite the hero around the outcome, then name the technology: “Intelligent Conversations. Real Results. Powered By Agentic-AI”, with a sub-line naming the channels.",
    alt: "A feature-led hero would list capabilities and repeat the old problem. An industry-led hero would speak to one sector and lose everyone else. The outcome works for every visitor.",
    y: "We hypothesized that <em>leading with the outcome and today's positioning</em> would help first-time visitors <em>understand Chat360's value within seconds</em>, because buyers evaluate results, not technology labels.",
    o: "Fewer visitors leaving from the hero; more scrolling into the product.",
    oi: "old-hero", ni: "new-hero", oc: "“Generative AI for Enhanced CX Engagement”", nc: "“Intelligent Conversations. Real Results. Powered By Agentic-AI”", op: "0 30%" },
  { t: "Primary action", h: "One ask above the fold", c: "One next step · Demos",
    p: "The nav made Start Free Trial the filled button; the hero made Schedule a Demo the filled one. 13 buttons with 5 labels competed down the page.",
    dec: "Make Book a demo the only filled button in the nav and repeat it as the hero CTA. Move the trial to the close. Turn section CTAs into small links.",
    alt: "Trial-led would lower friction but give sales no conversation for a product that usually needs guided setup. Equal weight would recreate the split.",
    y: "We hypothesized that <em>a single, consistent demo CTA above the fold</em> would <em>increase demo requests</em>, because one clear next step removes the decision of which button matters.",
    o: "More demo bookings from the homepage.",
    oi: "old-hero", ni: "new-hero", oc: "Nav: Start Free Trial (filled)<br>Hero: Schedule a Demo (filled)", nc: "Nav: Book a demo (filled)<br>Hero: Book a free demo", op: "0 0", np: "0 0" },
  { t: "Structure", h: "Industry over channel", c: "Find your industry",
    p: "Four channel blocks and four function cards described where and how Chat360 works, not who it helps or with what.",
    dec: "Replace both with a “Business impact” carousel of seven industries, each tied to one concrete job and the agent's steps. Add industry filters to the logo section.",
    alt: "Keeping channels fails Insight 1. Grouping by function stays abstract and overlaps. Industry and job is how buyers describe their own problems.",
    y: "We hypothesized that <em>organising use cases by industry and job</em> would help buyers <em>find relevant value faster</em>, because they identify with their industry's problems, not with a messaging channel.",
    o: "Deeper scroll into use cases, and demo requests that start from a relevant example.",
    oi: "old-channels", ni: "new-industries", oc: "WhatsApp · Messenger · Instagram · Website", nc: "Automotive · Telecom · EdTech · Banking · E-commerce · Healthcare · D2C" },
  { t: "Proof", h: "Evidence before the ask", c: "Evidence before the ask · Demos",
    p: "“Does it work?” was answered only by a logo strip. The slot before the final CTA went to blog posts.",
    dec: "Replace the blog row with three case studies and a carousel of seven named testimonials, placed directly before the closing CTA. Move the blog to Resources.",
    alt: "A bigger logo wall shows presence, not results. A content hub serves learning, not buying.",
    y: "We hypothesized that <em>case studies and named testimonials just before the closing CTA</em> would <em>increase trust and conversion</em>, because B2B buyers want evidence from peers before giving time to a demo.",
    o: "Higher conversion at the bottom of the page.",
    oi: "old-blog", ni: "new-cases", oc: "Latest updates from Chat360 (3 blog posts)", nc: "Case Studies Backed By Real Results · Proven Outcomes" },
  { t: "Closing", h: "Take the risk out of the last step", c: "Demos (indirect)",
    p: "“Contact our team of experts” asked a visitor who wasn't yet convinced to start a sales conversation.",
    dec: "Close with a free trial, and put “Free 14-day trial” and “No credit card required” directly under the button.",
    alt: "Repeating the demo would offer nothing to visitors who already passed on it. A contact form asks for even more commitment.",
    y: "We hypothesized that <em>a free trial with “14 days” and “no credit card” at the close</em> would <em>capture visitors not ready for a call</em>, because removing cost and commitment lowers the barrier to a first step.",
    o: "A second conversion path for late-stage visitors, without competing with the demo up top.",
    oi: "old-footer", ni: "new-close", oc: "“Contact our team of experts” → Schedule a Demo", nc: "“Effortless 24/7 Customer Engagement Starts Here” → Start a free trial" },
  { t: "Visuals", h: "Show the product, not stock art", c: "Clear value · Bounce",
    p: "A stock illustration of a hand holding a phone. Visitors never saw the product or the channels it connects.",
    dec: "Wire real channel logos into the Chat360 logo around the headline, and place a product overview video directly under the CTA.",
    alt: "A refreshed illustration would still be generic. A static screenshot shows the UI but not the omnichannel idea.",
    y: "We hypothesized that <em>real channel logos wired into Chat360 and a product video in the first scroll</em> would <em>make the platform feel tangible</em>, because seeing the product reduces uncertainty about what you're buying.",
    o: "Lower bounce, and more confidence going into a demo.",
    oi: "old-hero", ni: "new-product", oc: "Stock illustration: hand holding a phone", nc: "Channel icons → Chat360 hub · product overview video", op: "100% 40%" },
  { t: "Voice360", h: "Launch without a takeover", c: "Clear value",
    p: "The new voice product had no presence on the homepage at all.",
    dec: "Add an announcement bar above the nav on every visit, and a dedicated Voice360 section mid-page.",
    alt: "A hero takeover would replace the platform story for every visitor. A nav-only link would leave a new product almost invisible.",
    y: "We hypothesized that <em>an announcement bar plus a dedicated section</em> would <em>raise awareness of Voice360 without diluting the core message</em>, because returning visitors notice what's new while first-time visitors still get the platform story.",
    o: "Voice360 seen on every visit; the hero stays focused.",
    oi: "old-nav", ni: "new-voice", oc: "No mention of voice", nc: "Top bar + “Voice AI that Speaks Business: Voice360”", op: "0 0" },
];

const INDUSTRIES: [string, string][] = [
  ["Automotive", "Service appointment"],
  ["Telecom", "Billing dispute"],
  ["EdTech", "Lead qualification"],
  ["Banking", "Loan recovery"],
  ["E-commerce", "Order issue resolution"],
  ["Healthcare", "Appointment booking"],
  ["D2C / Retail", "Shopping journey &amp; upsell"],
];

const TRADEOFFS: [string, string, string, string][] = [
  ["Simplicity <span>vs</span> completeness", "A homepage that tells one story: outcome, relevance, proof, action.", "Channel-by-channel detail and four solution descriptions.", "That detail serves visitors who already know they want Chat360. They have the Platform and Solutions menus; first-time buyers need the story first."],
  ["Conversion focus <span>vs</span> content depth", "Space before the final CTA for case studies and testimonials.", "The blog's homepage presence and the sense of fresh content it gave.", "Blog readers have a learning intent and look in Resources. The homepage's job is a buying decision."],
  ["Single CTA <span>vs</span> multiple entry points", "One unmistakable next step above the fold.", "Trial visibility at the top for self-serve visitors, and some purity: the page still offers a trial at the end and small links in between.", "Insight 2 was about two primaries competing in the same place. Separating them by position (demo leads, trial closes) keeps focus without losing either audience."],
  ["Page length <span>vs</span> contextual clarity", "Room for what the old page lacked: product, industries, Voice360, proof.", "Brevity. The page grew from 8 sections to 12.", "Length is a cost only when sections don't earn their place. Each new section answers a buyer question the old page skipped, and the demo CTA is reachable from the first screen."],
  ["Launch visibility <span>vs</span> message focus", "Voice360 seen on every visit, through the top bar.", "A hero-level launch moment, plus one more CTA label (“Check now”).", "The platform story serves every visitor; Voice360 serves a subset. A bar plus a mid-page section balances both."],
];

const FINAL: [string, string, string, string][] = [
  ["new-hero", "New hero", "Hero", "Outcome-first headline, one demo CTA, Voice360 bar on top."],
  ["new-product", "Product overview", "Product", "Platform overview right under the CTA."],
  ["new-logos", "Logos filterable by industry", "Proof", "350+ brands, filterable by industry."],
  ["new-platform", "Platform section", "Platform", "Voice-enabled agents and the omnichannel platform."],
  ["new-industries", "Industry carousel", "Business impact", "One job per industry."],
  ["new-voice", "Voice360 section", "Voice360", "The new product gets its own feature."],
  ["new-omni", "Omnichannel support", "Omnichannel", "Real integrations around the message."],
  ["new-cases", "Case studies", "Case studies", "mCaffeine, JP Infra, Motilal Oswal."],
  ["new-testimonials", "Testimonials", "Testimonials", "Named people, named brands."],
  ["new-close", "Closing CTA", "Close", "Free trial, 14 days, no card."],
];

const QA: [string, string, string][] = [
  ["What is it?", dot("p", "Technology category"), dot("y", "Outcome-led hero, product video, platform section")],
  ["Fits my industry?", dot("n", "Not answered"), dot("y", "Logos filtered by industry, seven industry jobs")],
  ["What will it do for me?", dot("p", "Platform stats, functions"), dot("y", "One concrete job per industry, step by step")],
  ["Does it work?", dot("p", "Logos only"), dot("y", "3 case studies, 7 named testimonials")],
  ["What next?", dot("p", "Two competing primaries"), dot("y", "Demo up top, trial at the close")],
];

const REFLECT: { t: string; items: [string, string][] }[] = [
  { t: "Assumptions", items: [
    ["Held up", "An outcome-led message with one clear demo CTA would convert better than a channel-led page with competing buttons. Demo bookings rose 42% and bounce fell 68%, both in the predicted direction, though the share each change contributed is not isolated."],
    ["Still unvalidated", "That buyers find themselves through industries. I don't yet know how often the industry tabs are used, or whether demos from different industries convert differently."],
    ["Still unvalidated", "That more demos means better demos. The metric counts requests, not qualified opportunities."],
    ["Still unvalidated", "That the Voice360 bar builds awareness without distracting from the demo CTA."],
  ] },
  { t: "What I'd test next", items: [
    ["Instrument the page", "CTA clicks per section, scroll depth and industry-tab usage, to see which sections actually drive demos."],
    ["A/B test the hero", "Headline variants, to separate the copy's effect from the layout's."],
    ["Consolidate CTA labels", "The page still mixes “Book a free demo”, “Book a Demo now”, “Try for FREE” and “Check now”. Test two labels against the current set."],
    ["Talk to buyers", "Interview recent demo bookers and the sales team to check the five insights against real conversations."],
    ["Track demo quality", "Demo-to-qualified rate, so the gain shows up in pipeline, not just volume."],
  ] },
  { t: "Beyond the homepage", items: [
    ["Industry landing pages", "Each industry card could open a page built for that buyer, with its own case study and proof."],
    ["Demo booking flow", "The homepage now sends more people to the demo form; the form itself is the next place friction could cost conversions."],
    ["Case-study template", "Lead every case study with its headline metric so proof reads at a glance, on the homepage and on its own page."],
    ["Trial onboarding", "Visitors who choose the trial at the close need a first-run experience that gets them to a working agent quickly."],
    ["Mobile-first pass", "A sticky demo button and shorter sections for small screens."],
  ] },
  { t: "What I learned", items: [
    ["Order is the strategy.", "A B2B homepage is a sales conversation. Getting the sequence of questions right mattered more than any single visual choice."],
    ["Cutting is design work.", "Removing the blog row and channel stats is what made room for proof."],
    ["A CTA is a product decision.", "Choosing demo over trial was a call about the sales motion, not a style choice."],
  ] },
];

/* ---------- sections ---------- */
const hero = `<header class="cs-hero cs-wrap" id="cs-hero" data-layer="Hero" data-kind="frame">
  <p class="fr-label reveal">${GRID}Case study · UI/UX design · B2B SaaS homepage</p>
  <h1 class="cs-h1 reveal"><span class="sel" id="sel" data-cursor="Chat360, said plainly." data-layer="Chat360, said plainly." data-kind="text">Chat360,<br><span class="ti-serif">said plainly.</span>${SEL_CHROME}<span class="dims" id="dims" aria-hidden="true">Hug × Hug</span></span></h1>
  <p class="about cs-lede reveal" id="cs-lede" data-layer="Summary" data-kind="text">Chat360 sells AI agents that talk to customers on WhatsApp, the web, social and voice. The old homepage listed channels. I redesigned it to <b>show what the product does for a business, and to prove it</b>.</p>
  <ul class="cs-pills reveal" role="list" id="cs-pills" data-layer="Project details" data-kind="frame">
    <li class="cs-pill"><span class="dot" aria-hidden="true"></span>Live at chat360.io</li>
    <li class="cs-pill">Role · UI/UX designer</li>
    <li class="cs-pill">Solo</li>
    <li class="cs-pill">1 month, audit to launch</li>
  </ul>
  <div class="fr c3-compare" id="c3-compare" data-cursor="Before and after" data-layer="Before and after hero" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}Drag to compare the hero · before and after</p>
    <div class="fr-body">
      <div class="c3-cmp" id="c3-cmp">
        <img class="c3-shot" src="${IMG}old-hero.webp" alt="Old homepage hero: Generative AI for Enhanced CX Engagement" width="1600" height="801" loading="eager" fetchpriority="high" data-layer="Old hero" data-kind="image">
        <img class="c3-shot top" src="${IMG}new-hero.webp" alt="New homepage hero: Intelligent Conversations. Real Results. Powered By Agentic-AI" width="1600" height="801" loading="eager" data-layer="New hero" data-kind="image">
        <span class="c3-lab l">Before</span><span class="c3-lab r">After</span>
        <div class="c3-handle" aria-hidden="true"></div>
        <input type="range" min="0" max="100" value="50" aria-label="Drag to compare the old and new hero" id="c3-range">
      </div>
      ${SEL_CHROME}<span class="dims" aria-hidden="true"></span>
    </div>
  </div>
</header>`;

const impact = `<section class="cs-sec cs-wrap" id="cs-impact" data-layer="Impact" data-kind="frame" aria-label="Impact">
  <div class="cs-bento cs-stats">
    ${tile("cs-stat-1", "Demo bookings", "Demo bookings", `${stat(42, "+", "%")}<p>from the homepage within one month</p>`, "inv")}
    ${tile("cs-stat-2", "Bounce rate", "Bounce rate", `${stat(68, "−", "%")}<p>homepage bounce rate</p>`)}
    ${tile("cs-stat-3", "Proof on the page", "Proof on the page", `${stat(10, "0→", "")}<p>case studies and named testimonials</p>`)}
  </div>
  <div class="cs-bento c3-tldr">
    ${tile("c3-tl-1", "Problem", "Problem", "<p>The homepage described channels and an older product. It never said what Chat360 achieves, offered no proof, and split visitors between two primary buttons.</p>", "cs-third")}
    ${tile("c3-tl-2", "Approach", "Approach", "<p>Rebuilt the page as a buyer's sequence of questions: an outcome-led message, one demo CTA up front, use cases by industry, and customer evidence before the final ask.</p>", "cs-third")}
    ${tile("c3-tl-3", "Outcome", "Outcome", "<p>+42% demo bookings from the homepage in the first month and a 68% lower bounce rate.</p>", "cs-third")}
  </div>
</section>`;

const SPEC: [string, string, string, string][] = [
  ["cs-role-1", "Role", "UI/UX designer", "Research, structure, messaging and visual design."],
  ["cs-role-2", "Team", "Solo", "Designed and shipped by one designer."],
  ["cs-role-3", "Timeline", "1 month", "From audit to launch."],
  ["cs-role-4", "Status", "Live", "On chat360.io."],
];
const about = `<section class="cs-sec cs-tight cs-wrap" id="cs-about" data-layer="Role and team" data-kind="frame" aria-label="Role and team">
  <div class="cs-spec c3-spec4">
    ${SPEC.map(([id, lab, val, note]) => `<div class="cs-spec-item" id="${id}" data-layer="${a(lab)}" data-kind="frame"><span class="cs-lab">${lab}</span><p class="cs-spec-val">${val}</p><p class="cs-spec-note">${note}</p></div>`).join("")}
  </div>
</section>`;

const context = section(
  "c3-context",
  "01 · Context",
  "01 · Context &amp; business problem",
  "The product had moved on.",
  "The homepage hadn't.",
  null,
  `<div class="c3-rows" id="c3-context-rows" data-layer="Context" data-kind="frame">
    ${CONTEXT.map(([k, v]) => `<div><span class="cs-lab">${k}</span><p>${v}</p></div>`).join("")}
  </div>
  <div class="cs-bento">
    ${tile("c3-problem", "Problem statement", "Problem statement", `<p class="cs-statement"><span class="ti-sans">The homepage explained <em class="c3-em">where</em> Chat360 works, but never <em class="c3-em">what it achieves</em>. Buyers had to piece the value together, then choose between competing buttons, so too many left before asking for a demo.</span></p>`, "cs-full inv")}
  </div>`,
);

const success = section(
  "c3-success",
  "02 · Success criteria",
  "02 · Success criteria",
  "What “better”",
  "had to mean",
  "One business metric, one engagement metric, and four design checks. Every decision later traces back to one of these.",
  `<div class="c3-grid" id="c3-criteria" data-layer="Success criteria" data-kind="frame">
    ${CRITERIA.map(
      ([h, p, tag, tone]) =>
        `<div class="cs-card c3-crit"><span class="c3-pill ${tone}">${tag}</span><h3 class="cs-h4">${h}</h3><p>${p}</p></div>`,
    ).join("")}
  </div>`,
);

const research = section(
  "c3-research",
  "03 · Research",
  "03 · Research &amp; evidence",
  "What the old page",
  "was telling us",
  "With one month and no research budget, I built the evidence base from what I could inspect directly.",
  `<div class="cs-rules c3-methods" id="c3-methods" data-layer="Four methods" data-kind="frame">
    ${METHODS.map(
      ([k, h, p]) => `<div class="cs-card cs-rule"><span class="cs-rn ti-serif" aria-hidden="true">${k}</span><h3 class="cs-h3">${h}</h3><p>${p}</p></div>`,
    ).join("")}
  </div>
  <p class="c3-note"><b>Scope note.</b> No interviews or usability tests were run for this project. I treat these findings as strong signals for design direction, not as proof. The impact data later is what tests them.</p>

  ${kh("A", "Heuristic audit: seven points of friction")}
  <p class="cs-sub">Rated by how directly each one blocked a buyer from understanding the value or taking the next step. Tap a pin on the old page, or pick a finding.</p>
  <div class="fr c3-annfr" id="c3-audit" data-cursor="Heuristic audit" data-layer="Heuristic audit" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}The old homepage · 7 findings</p>
    <div class="fr-body">
      ${bw(
        `<div class="c3-annstage">${SLIDES.map(
          ([id, img, alt], k) =>
            `<div class="c3-slide${k === 0 ? " on" : ""}" data-slide="${id}" aria-hidden="${k !== 0}">
          <img class="c3-shot" src="${IMG}${img}.webp" alt="${alt}" width="1600" height="801" loading="${k === 0 ? "eager" : "lazy"}" decoding="async" data-layer="${alt}" data-kind="image">
          ${AUDIT.map((f, i) =>
            f.slide !== id
              ? ""
              : f.marks
                  .map(
                    (m) =>
                      `<span class="c3-box ${f.sev}" data-f="${i}" style="left:${m.box[0]}%;top:${m.box[1]}%;width:${m.box[2]}%;height:${m.box[3]}%" aria-hidden="true"></span><button class="c3-pin ${f.sev}" type="button" data-f="${i}" style="left:${m.pin[0]}%;top:${m.pin[1]}%" aria-label="Finding ${i + 1}: ${a(f.t)}" data-cursor="Finding ${i + 1}">${i + 1}</button>`,
                  )
                  .join(""),
          ).join("")}
        </div>`,
        ).join("")}</div>`,
        "chat360.io · the old homepage",
      )}
      <div class="c3-chips" role="tablist" aria-label="Findings" data-tabs="audit">
        ${AUDIT.map(
          (f, i) =>
            `<button class="c3-chip ${f.sev}" type="button" role="tab" id="c3-at-${i}" aria-controls="c3-ap-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-slide="${f.slide}" data-cursor="Finding ${i + 1}: ${a(f.t)}"><i>${i + 1}</i><span>${f.short}</span></button>`,
        ).join("")}
      </div>
      <div class="c3-acardwrap">
        <div class="c3-acards">
          ${AUDIT.map(
            (f, i) =>
              `<div class="c3-acard" role="tabpanel" id="c3-ap-${i}" aria-labelledby="c3-at-${i}"${i === 0 ? "" : " hidden"}><span class="c3-sev ${f.sev}">${f.sev === "h" ? "High" : "Medium"}</span><h3 class="cs-h3 cs-lg">${f.t}</h3><p>${f.p}</p></div>`,
          ).join("")}
        </div>
        <div class="c3-anav"><button class="c3-prev" type="button" aria-label="Previous finding" data-cursor="Previous finding">←</button><span class="c3-count" aria-live="polite">1 / ${AUDIT.length}</span><button class="c3-next" type="button" aria-label="Next finding" data-cursor="Next finding">→</button></div>
      </div>
      ${SEL_CHROME}<span class="dims" aria-hidden="true"></span>
    </div>
  </div>

    ${kh("B", "CTA inventory: 13 buttons, 5 labels, no single next step")}
  <p class="cs-sub">Excluding Login. Eight of the thirteen led away from conversion, to channel and solution pages. The page never decided what it wanted the visitor to do.</p>
  <div class="c3-cta" id="c3-cta" data-layer="CTA inventory" data-kind="frame">
    ${CTAS.map(([k, b]) => `<div><span class="cs-lab">${k}</span><div class="c3-btnrow">${b}</div></div>`).join("")}
  </div>

  ${kh("C", "Content inventory: which buyer questions did each section answer?")}
  <p class="cs-sub">Most of the page answered “where does it work?” Almost none of it answered “does it work?”</p>
  <div class="c3-tw" id="c3-inventory" data-layer="Content inventory" data-kind="frame"><table class="c3-mx">
    <thead><tr><th>Old section</th><th>What is it?</th><th>Fits my industry?</th><th>What will it do for me?</th><th>Does it work?</th><th>What next?</th></tr></thead>
    <tbody>
      ${INVENTORY.map((r) => `<tr><td>${r[0]}</td>${r.slice(1).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("\n      ")}
    </tbody>
  </table></div>
  <div class="c3-legend"><span>${dot("y")}Answered</span><span>${dot("p")}Partly</span><span>${dot("n")}Not answered</span></div>`,
);

const insights = section(
  "c3-insights",
  "04 · Key insights",
  "04 · Key insights",
  "Five insights that",
  "set the direction",
  "Each insight shows the observation behind it, the evidence that was available, and why it mattered enough to shape the design. Letters refer to the four methods above.",
  `<div class="c3-ins" id="c3-ins" data-layer="Five insights" data-kind="frame">
    <div class="c3-itabs" role="tablist" aria-label="Insights" data-tabs="insights">
      ${INSIGHTS.map(
        (x, i) =>
          `<button class="cs-brow" type="button" role="tab" id="c3-it-${i}" aria-controls="c3-ip-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-cursor="Insight ${i + 1}"><span class="c3-inum ti-serif" aria-hidden="true">${i + 1}</span><b>${x.t}</b></button>`,
      ).join("")}
    </div>
    <div class="c3-istage">
      ${INSIGHTS.map((x, i) => {
        const fig = (s: Shot, who: string) =>
          `<figure class="c3-evfig">${wshot(s.f, s.alt, { layer: `Insight ${i + 1} ${who}`, zoom: "ins" + i, h: s.h })}</figure>`;
        return `<div class="c3-ipanel" role="tabpanel" id="c3-ip-${i}" aria-labelledby="c3-it-${i}"${i === 0 ? "" : " hidden"}>
        <h3 class="cs-h3 cs-lg">${x.t}</h3>
        <div class="c3-quad">
          <div class="c3-q"><span class="c3-qlab"><i>1</i>Observation</span>${fig(x.obsShot, "observation")}<p>${x.obs}</p></div>
          <div class="c3-q"><span class="c3-qlab"><i>2</i>Evidence</span>${fig(x.evShot, "evidence")}<p>${x.ev}</p></div>
          <div class="c3-q c3-qwhy"><span class="c3-qlab"><i>3</i>Why it mattered</span><p>${x.why}</p></div>
          <div class="c3-q c3-qso"><span class="c3-qlab"><i>4</i>So the design should</span><p>${x.so}</p><div class="c3-leads"><span class="c3-pcl">Became</span>${x.led.map((d) => `<button class="c3-lead" type="button" data-dec="${d}" data-cursor="Go to Decision ${d + 1}">Decision ${d + 1} · ${DECISIONS[d].t}<span aria-hidden="true">→</span></button>`).join("")}</div></div>
        </div>
      </div>`;
      }).join("")}
    </div>
  </div>
  <h3 class="cs-h3 cs-gap">How might we…</h3>
  <div class="cs-bento cs-hmw" id="c3-hmw" data-layer="How might we" data-kind="frame">
    ${tile("c3-hmw-1", "How might we 1", "Insights 1, 5", "<p>…say what Chat360 achieves in the first five seconds, in today's positioning?</p>", "cs-third")}
    ${tile("c3-hmw-2", "How might we 2", "Insight 3", "<p>…help a buyer from any industry see their own problem being solved?</p>", "cs-third")}
    ${tile("c3-hmw-3", "How might we 3", "Insights 2, 4", "<p>…replace claims with proof, and give the page one clear next step?</p>", "cs-third")}
  </div>`,
);

const constraints = section(
  "c3-constraints",
  "05 · Constraints",
  "05 · Constraints &amp; considerations",
  "The box I was",
  "designing in",
  null,
  `<div class="cs-pers c3-cons" id="c3-cons" data-layer="Constraints" data-kind="frame">
    ${CONSTRAINTS.map(
      ([h, p, e]) => `<div class="cs-card"><h3 class="cs-h4">${h}</h3><p>${p}</p><p class="c3-eff"><b>What I did:</b> ${e}</p></div>`,
    ).join("")}
  </div>`,
);

const directions = section(
  "c3-directions",
  "06 · Directions considered",
  "06 · Directions considered",
  "Three ways to",
  "tell the story",
  "The first decision was strategic: what should the homepage lead with? Three approaches were open. Each is judged against the success criteria and the insights.",
  `<div class="c3-dirs" id="c3-dirs" data-layer="Three directions" data-kind="frame">
    ${DIRS.map(
      (d) => `<div class="cs-card c3-dir${d.pick ? " pick" : ""}"><span class="cs-lab">${d.k}</span><h3 class="cs-h3 cs-lg">${d.t}</h3><p>${d.what}</p>
      <div class="c3-pc"><div><span class="c3-pcl g">${d.pick ? "Why selected" : "Pros"}</span><ul>${d.pros.map((x) => `<li>${x}</li>`).join("")}</ul></div><div><span class="c3-pcl l">${d.pick ? "Risk accepted" : "Cons"}</span><ul>${d.cons.map((x) => `<li>${x}</li>`).join("")}</ul></div></div></div>`,
    ).join("")}
  </div>
  <h3 class="cs-h3 cs-gap">Three smaller forks inside the chosen direction</h3>
  <p class="cs-sub">Once the direction was set, three decisions still had more than one reasonable answer.</p>
  ${variantSet({
    id: "c3-forks",
    layer: "Smaller forks",
    label: "Fork",
    prop: "Question",
    hash: "c3-fork",
    tabs: ["Primary action", "Proving it works", "Voice360"],
    panels: FORKS.map(
      (f) => `<div class="c3-fork"><h3 class="cs-h3 cs-lg">${f.q}</h3><div class="c3-opts">${f.opts
        .map(([pick, b, p]) => `<div class="c3-opt${pick ? " pick" : ""}"><i aria-hidden="true">${pick ? "✓" : "✕"}</i><b>${b}</b><p>${p}</p></div>`)
        .join("")}</div></div>`,
    ),
  })}`,
);

const ia = section(
  "c3-ia",
  "07 · Information architecture",
  "07 · Information architecture",
  "From a list of channels to",
  "a sales story",
  "I ordered the page by the questions a buyer asks: what is it, who uses it, what can it do for me, does it work, what next. Anything that didn't answer one of them was cut or moved. Tap a section to see what happened to it.",
  `<div class="fr c3-iafr" id="c3-iamap" data-cursor="Section map" data-layer="Section map" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}Old page → new page</p>
    <div class="fr-body">
      <div class="c3-leg"><span><i class="k"></i>Kept, rewritten</span><span><i class="r"></i>Restructured</span><span><i class="n"></i>New</span><span><i class="x"></i>Removed</span></div>
      <div class="c3-iacols" id="c3-ia">
        <div class="c3-iacol"><span class="cs-lab">Old page · 8 sections</span>${IA_OLD.map(iaBlk).join("")}</div>
        <div class="c3-iacol"><span class="cs-lab">New page · 12 sections</span>${IA_NEW.map(iaBlk).join("")}</div>
      </div>
      <div class="c3-iapanel" id="c3-iapanel" aria-live="polite"></div>
      ${SEL_CHROME}<span class="dims" aria-hidden="true"></span>
    </div>
  </div>
  <div class="cs-feat" id="c3-nav" data-layer="Navigation, old and new" data-kind="frame">
    <div class="cs-card cs-fcard"><span class="c3-pill old">Old nav · 6 items + 2 buttons</span>
      <ul class="c3-tree">
        <li><b>Home</b></li>
        <li><b>Platforms</b><span>WhatsApp Chatbot · Facebook Messenger · Instagram · Website</span></li>
        <li><b>Solutions</b><span>Conversational Sales · Marketing · Customer Support · WhatsApp Marketing</span></li>
        <li><b>Integrations</b></li><li><b>Resources</b></li><li><b>Partner</b></li>
        <li><span class="c3-fb f">Start Free Trial</span><span class="c3-fb o">Login</span></li>
      </ul>
      <p>Eight items competed for attention, and “Platforms” was really a list of channels.</p>
    </div>
    <div class="cs-card cs-fcard"><span class="c3-pill new">New nav · 4 menus + 3 actions</span>
      <ul class="c3-tree">
        <li><b>Platform</b></li><li><b>Solutions</b></li><li><b>Integration</b></li><li><b>Resources</b></li>
        <li><span class="c3-fb o x">Contact us</span><span class="c3-fb o x">Login</span><span class="c3-fb f">Book a demo</span></li>
      </ul>
      <p>Four menus and one main action. Partner moves to the footer and the logo takes you home. Book a demo is the only filled button and matches the hero CTA, so the page asks for one thing.</p>
    </div>
  </div>`,
);

const wire = section(
  "c3-wire",
  "08 · Wireframes",
  "08 · Wireframes",
  "Structure",
  "before style",
  "Low-fidelity, desktop and mobile together, so every section had to work as a single column too. Scroll either one, or tap a note to jump to it.",
  `<div class="fr c3-wfr" id="c3-wf" data-cursor="Wireframes" data-layer="Wireframes" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}Homepage · desktop + mobile · lo-fi</p>
    <div class="fr-body">
      <div class="c3-wfwrap c3-wf">
        ${bw('<div class="c3-wview" id="c3-wfd"></div>', "Homepage · desktop · lo-fi")}
        <div class="c3-wfm"><div class="c3-wview" id="c3-wfm"></div></div>
      </div>
      ${SEL_CHROME}<span class="dims" aria-hidden="true"></span>
    </div>
  </div>
  <div class="c3-notes" id="c3-notes" data-layer="Wireframe notes" data-kind="frame"></div>`,
);

const matrix: [string, string, string, string][] = [
  ["Outcome-first headline", "Buyers evaluate results, not technology labels (Insight 1); positioning had to catch up with the product (Insight 5)", "Visitors grasp the value from the hero and keep scrolling", "Clear value · Bounce"],
  ["One demo CTA above the fold", "Two primaries split attention (Insight 2); the demo starts a sales conversation", "More demo requests from the homepage", "One next step · Demos"],
  ["Use cases by industry and job", "Buyers look for their own problem (Insight 3)", "Faster relevance, deeper scroll into use cases", "Find your industry"],
  ["Case studies + testimonials before the close", "The ask needs evidence beside it (Insight 4)", "Higher conversion at the bottom of the page", "Evidence before the ask · Demos"],
  ["Free-trial close with risk reducers", "Late-stage visitors not ready for sales still need a step", "A second conversion path that doesn't compete with the demo", "Demos (indirect)"],
  ["Product and real channels instead of stock art", "Seeing the product reduces uncertainty (audit A)", "Lower bounce, more confident demo requests", "Clear value · Bounce"],
  ["Voice360 bar + dedicated section", "New product needed visibility without taking the hero (Insight 5)", "Voice360 awareness while the core story stays focused", "Clear value"],
];
const design = section(
  "c3-design",
  "09 · Design decisions",
  "09 · Design decisions",
  "Every major change,",
  "and why",
  "The matrix summarises the decisions. Below it, each one is broken down: the problem, the decision, why it beat the alternatives, and the outcome it was expected to drive.",
  `<div class="c3-tw" id="c3-matrix" data-layer="Decision matrix" data-kind="frame"><table class="c3-mx c3-dm">
    <thead><tr><th>Decision</th><th>Reasoning</th><th>Expected outcome</th><th>Criterion</th></tr></thead>
    <tbody>
      ${matrix.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("\n      ")}
    </tbody>
  </table></div>
  ${variantSet({
    id: "c3-dec",
    layer: "Decisions",
    label: "Decision",
    prop: "Decision",
    hash: "c3-dec",
    tabs: DECISIONS.map((d) => d.t),
    panels: DECISIONS.map(
      (d, i) => `<div class="c3-dhead"><span class="cs-lab">Decision ${i + 1} · serves: ${d.c}</span><h3 class="cs-h3 cs-lg">${d.h}</h3></div>
        <div class="c3-dgrid">
          <div><span class="c3-pcl l">Problem</span><p>${d.p}</p></div>
          <div><span class="c3-pcl w">Decision</span><p>${d.dec}</p></div>
          <div><span class="c3-pcl">Why over the alternatives</span><p>${d.alt}</p></div>
          <div><span class="c3-pcl g">Expected outcome</span><p>${d.o}</p></div>
        </div>
        <p class="c3-hyp">${d.y}</p>
        <div class="c3-ba">
          <figure><div class="c3-crop">${wshot(d.oi, `Old homepage: ${d.h}`, { layer: `Old: ${d.h}`, zoom: "dec" + i, pos: d.op })}</div><figcaption><span class="c3-pill old">Before</span>${d.oc}</figcaption></figure>
          <figure><div class="c3-crop">${wshot(d.ni, `New homepage: ${d.h}`, { layer: `New: ${d.h}`, zoom: "dec" + i, pos: d.np })}</div><figcaption><span class="c3-pill new">After</span>${d.nc}</figcaption></figure>
        </div>`,
    ),
  })}
  <h3 class="cs-h3 cs-gap">Inside Decision 3: seven industries, seven real jobs</h3>
  <p class="cs-sub">Each card names one job and spells out the agent's steps, like “user calls on WhatsApp, voice AI fetches the bill from the ERP, explains the charges, sends a breakdown.”</p>
  <div class="c3-ind" id="c3-ind" data-layer="Seven industries" data-kind="frame">
    ${INDUSTRIES.map(([k, v]) => `<div class="cs-card"><span class="cs-lab">${k}</span><b>${v}</b></div>`).join("")}
  </div>
  <h3 class="cs-h3 cs-gap">Inside Decision 4: from claims to evidence</h3>
  <p class="cs-sub">What a buyer could find on the homepage to answer “does this work for companies like mine?”</p>
  <div class="cs-bento c3-proof" id="c3-proof" data-layer="Claims to evidence" data-kind="frame">
    ${tile("c3-pf-1", "Brands", "Brands", '<div class="c3-pn"><s>300+</s>350+</div><p>brands, filterable by industry</p>', "c3-quarter")}
    ${tile("c3-pf-2", "Case studies", "Case studies", '<div class="c3-pn"><s>0</s>3</div><p>case studies: mCaffeine, JP Infra, Motilal Oswal</p>', "c3-quarter")}
    ${tile("c3-pf-3", "Testimonials", "Testimonials", '<div class="c3-pn"><s>0</s>7</div><p>named testimonials, e.g. upGrad Abroad, BJS Toyota, Paragon</p>', "c3-quarter")}
    ${tile("c3-pf-4", "Blog posts", "Blog posts", '<div class="c3-pn"><s>3</s>0</div><p>blog posts, moved to Resources</p>', "c3-quarter")}
  </div>`,
);

const tradeoffs = section(
  "c3-tradeoffs",
  "10 · Key trade-offs",
  "10 · Key trade-offs",
  "What we gave up,",
  "on purpose",
  "Every decision above cost something. These are the five tensions that shaped the page and why each one landed where it did.",
  `<div class="c3-tos" id="c3-tos" data-layer="Trade-offs" data-kind="frame">
    ${TRADEOFFS.map(
      ([h, g, l, w]) => `<div class="c3-tob"><h3 class="cs-h3 cs-lg">${h}</h3><dl><div><dt class="g">Gained</dt><dd>${g}</dd></div><div><dt class="l">Sacrificed</dt><dd>${l}</dd></div><div><dt class="w">Why it was right</dt><dd>${w}</dd></div></dl></div>`,
    ).join("")}
  </div>`,
);

const visual = section(
  "c3-visual",
  "11 · Visual system",
  "11 · Visual system",
  "Brighter, rounder,",
  "more confident",
  "Visual changes in service of the strategy. A brighter blue for the one action that matters, deep navy for weight, and soft blue-to-blush backgrounds that keep long sections light.",
  `<div class="cs-feat" id="c3-vs" data-layer="Before and after palette" data-kind="frame">
    <div class="cs-card cs-fcard"><span class="c3-pill old">Before</span>
      <div class="c3-sw"><div><i style="background:#2b63a2"></i><b>Muted blue</b>#2B63A2</div><div><i style="background:#e8ecef"></i><b>Card grey</b>#E8ECEF</div><div><i style="background:#ffffff"></i><b>White</b>#FFFFFF</div></div>
      <div class="c3-btnrow"><span class="c3-fb f">Schedule a Demo</span><span class="c3-fb o">Start Free Trial</span><span class="c3-fb f">Know more →</span></div>
      <p>Square-cornered buttons in one blue, used for everything from “Know more” to the main CTA.</p></div>
    <div class="cs-card cs-fcard"><span class="c3-pill new">After</span>
      <div class="c3-sw"><div><i style="background:#1a5eed"></i><b>Chat360 blue</b>#1A5EED</div><div><i style="background:#11264e"></i><b>Deep navy</b>#11264E</div><div><i style="background:#e7f0ff"></i><b>Soft blue</b>#E7F0FF</div><div><i style="background:linear-gradient(180deg,#e9f1fc,#f0eaf0)"></i><b>Hero wash</b>Blue → blush</div></div>
      <div class="c3-btnrow"><span class="c3-fb p">Book a demo</span><span class="c3-fb o pill">● Book a free demo</span></div>
      <p>Pill buttons: filled blue for the main action, white for the repeat, small links for section CTAs.</p></div>
  </div>
  <div class="c3-rows" id="c3-vsrows" data-layer="Visual changes" data-kind="frame">
    <div><span class="cs-lab">Headings</span><p>Bold, centred section titles with one key phrase in blue (“Real Results”, “Agentic-AI”). The blue phrase is the promise.</p></div>
    <div><span class="cs-lab">Cards</span><p>Large radii and soft blue fills for features; blue-over-navy cards for industries so the carousel reads as one set.</p></div>
    <div><span class="cs-lab">Imagery</span><p>Real channel and partner logos, product UI and customer photography instead of stock illustration.</p></div>
    <div><span class="cs-lab">Closing</span><p>One full-bleed blue gradient band, the only one on the page, so the trial offer can't be missed.</p></div>
  </div>`,
);

const final = section(
  "c3-final",
  "12 · Final design",
  "12 · Final design",
  "The shipped",
  "homepage",
  "The new page, top to bottom. Click any screenshot to enlarge it.",
  `<div class="c3-gal cs-bleed" id="c3-gal" data-layer="Shipped homepage" data-kind="frame">
    ${FINAL.map(([f, alt, t, n]) => `<figure class="c3-gfig">${bw(wshot(f, alt, { layer: alt, zoom: "final" }))}<figcaption><b>${t}.</b> ${n}</figcaption></figure>`).join("")}
  </div>`,
);

const validation = section(
  "c3-impact",
  "13 · Validation and impact",
  "13 · Validation &amp; impact",
  "How the direction was judged,",
  "and what happened",
  "No usability testing was run. Confidence came from three places: checking the design against the buyer questions, checking it against the success criteria, and the business metrics after launch.",
  `<h3 class="cs-h3 cs-gap">Before launch · the same buyer questions, re-asked of the new page</h3>
  <p class="cs-sub">Running the same content inventory on the final design shows that every question the old page skipped now has a section that answers it.</p>
  <div class="c3-tw" id="c3-qa" data-layer="Buyer questions, old and new" data-kind="frame"><table class="c3-mx">
    <thead><tr><th>Buyer question</th><th>Old page</th><th>New page</th></tr></thead>
    <tbody>${QA.map(([q, o, n]) => `<tr><td>${q}</td><td>${o}</td><td>${n}</td></tr>`).join("")}</tbody>
  </table></div>
  <h3 class="cs-h3 cs-gap">Before launch · signals that increased confidence</h3>
  <div class="c3-rows" id="c3-signals" data-layer="Signals" data-kind="frame">
    <div><span class="cs-lab">Every section traces to evidence</span><p>Each section of the new page maps to an insight, and each insight to an observation on the old page. Nothing was added for decoration.</p></div>
    <div><span class="cs-lab">The design checks pass</span><p>One filled button above the fold, value stated in the hero, industry visible in the second scroll, proof before the close.</p></div>
    <div><span class="cs-lab">The proof is real</span><p>The case studies, testimonials and logos all come from existing customers, so the evidence section rests on real material, not placeholders.</p></div>
  </div>
  <h3 class="cs-h3 cs-gap">After launch · business metrics moved in the predicted direction</h3>
  <p class="cs-sub">The primary goal was demo requests; bounce rate was the early signal of whether the top of the page was working.</p>
  <div class="cs-feat" id="c3-links" data-layer="Metrics and their causes" data-kind="frame">
    <div class="cs-card cs-fcard c3-link"><span class="cs-lab">Demo bookings</span><div class="c3-mt">+42%</div>
      <ul><li>One demo CTA in nav and hero (Decision 2)</li><li>Case studies and testimonials before the ask (Decision 4)</li><li>Industry use cases that show relevance (Decision 3)</li></ul>
      <p>The page asks for one thing up front and earns it with peer evidence on the way down. Both remove reasons to hesitate at the moment of conversion.</p></div>
    <div class="cs-card cs-fcard c3-link"><span class="cs-lab">Bounce rate</span><div class="c3-mt">−68%</div>
      <ul><li>Outcome-first headline (Decision 1)</li><li>Product shown in the first scroll (Decision 6)</li><li>Logos filterable by industry, right after the hero</li></ul>
      <p>Visitors understand the offer and see something relevant before deciding whether to stay. These are the changes at the top of the page, which is where bounce is decided.</p></div>
  </div>
  <p class="c3-note"><b>Attribution.</b> These are before-and-after results for the whole redesign, not an A/B test, so each decision's share of the impact is inferred from where it sits on the page and what it was designed to do. Traffic mix and campaigns can also move these numbers. Isolating them is first on my next-steps list.</p>`,
);

const reflection = section(
  "c3-reflection",
  "14 · Reflection",
  "14 · Reflection",
  "Where the thinking",
  "goes next",
  null,
  variantSet({
    id: "c3-refl",
    layer: "Reflection",
    label: "Reflection",
    prop: "Topic",
    hash: "c3-rf",
    tabs: REFLECT.map((r) => r.t),
    panels: REFLECT.map(
      (r) => `<ul class="c3-list">${r.items.map(([k, v]) => `<li><b>${k}</b><span>${v}</span></li>`).join("")}</ul>`,
    ),
  }),
);

const outcome = `<section class="contact cs-close" id="cs-outcome" data-layer="Outcome" data-kind="frame" aria-labelledby="cs-outcome-h">
  <div class="cs-wrap">
    <p class="cs-close-lab">${GRID}Outcome</p>
    <h2 id="cs-outcome-h" class="big-title contact-head"><span class="ti-sans">Said plainly, and </span><span class="ti-serif">it converted.</span></h2>
    <div class="cs-nums">
      <div class="cs-n">${stat(42, "+", "%")}<p>demo bookings from the homepage in one month</p></div>
      <div class="cs-n">${stat(68, "−", "%")}<p>homepage bounce rate</p></div>
      <div class="cs-n">${stat(10, "0→", "")}<p>case studies and named testimonials on the page</p></div>
    </div>
    <div class="cs-closer">
      <a class="gl-all cs-cta" href="/" data-return="fr-chat360" data-cursor="Back to the portfolio"><span>Back to the portfolio</span><span class="gl-all-go" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></span></a>
      <p class="cs-foot">Chat360 homepage redesign · Product design case study · Old homepage from the Internet Archive</p>
    </div>
  </div>
</section>`;

/* ---------- Layers panel ---------- */
type Row = { id: string; name: string; kind: Kind; depth: 0 | 1 | 2 };
const LAYERS: Row[] = [
  { id: "cs-hero", name: "Hero", kind: "frame", depth: 0 },
  { id: "sel", name: "Chat360, said plainly.", kind: "text", depth: 1 },
  { id: "cs-lede", name: "Summary", kind: "text", depth: 1 },
  { id: "c3-compare", name: "Before and after hero", kind: "frame", depth: 1 },
  { id: "cs-impact", name: "Impact", kind: "frame", depth: 0 },
  { id: "cs-stat-1", name: "Demo bookings", kind: "frame", depth: 1 },
  { id: "cs-stat-2", name: "Bounce rate", kind: "frame", depth: 1 },
  { id: "cs-stat-3", name: "Proof on the page", kind: "frame", depth: 1 },
  { id: "c3-tl-1", name: "Problem", kind: "frame", depth: 1 },
  { id: "c3-tl-2", name: "Approach", kind: "frame", depth: 1 },
  { id: "c3-tl-3", name: "Outcome", kind: "frame", depth: 1 },
  { id: "cs-about", name: "Role and team", kind: "frame", depth: 0 },
  { id: "cs-role-1", name: "Role", kind: "frame", depth: 1 },
  { id: "cs-role-2", name: "Team", kind: "frame", depth: 1 },
  { id: "cs-role-3", name: "Timeline", kind: "frame", depth: 1 },
  { id: "cs-role-4", name: "Status", kind: "frame", depth: 1 },
  { id: "c3-context", name: "01 · Context", kind: "frame", depth: 0 },
  { id: "c3-problem", name: "Problem statement", kind: "frame", depth: 1 },
  { id: "c3-success", name: "02 · Success criteria", kind: "frame", depth: 0 },
  { id: "c3-criteria", name: "Six criteria", kind: "frame", depth: 1 },
  { id: "c3-research", name: "03 · Research", kind: "frame", depth: 0 },
  { id: "c3-methods", name: "Four methods", kind: "frame", depth: 1 },
  { id: "c3-audit", name: "Heuristic audit", kind: "frame", depth: 1 },
  { id: "c3-cta", name: "CTA inventory", kind: "frame", depth: 1 },
  { id: "c3-inventory", name: "Content inventory", kind: "frame", depth: 1 },
  { id: "c3-insights", name: "04 · Key insights", kind: "frame", depth: 0 },
  { id: "c3-ins", name: "Five insights", kind: "frame", depth: 1 },
  { id: "c3-hmw", name: "How might we", kind: "frame", depth: 1 },
  { id: "c3-constraints", name: "05 · Constraints", kind: "frame", depth: 0 },
  { id: "c3-cons", name: "Six constraints", kind: "frame", depth: 1 },
  { id: "c3-directions", name: "06 · Directions", kind: "frame", depth: 0 },
  { id: "c3-dirs", name: "Three directions", kind: "frame", depth: 1 },
  { id: "c3-forks", name: "Smaller forks", kind: "component", depth: 1 },
  ...FORKS.map((f, i): Row => ({ id: `c3-fork-${i}`, name: `Question=${["Primary action", "Proving it works", "Voice360"][i]}`, kind: "variant", depth: 2 })),
  { id: "c3-ia", name: "07 · Information architecture", kind: "frame", depth: 0 },
  { id: "c3-iamap", name: "Section map", kind: "frame", depth: 1 },
  { id: "c3-nav", name: "Navigation, old and new", kind: "frame", depth: 1 },
  { id: "c3-wire", name: "08 · Wireframes", kind: "frame", depth: 0 },
  { id: "c3-wf", name: "Desktop and mobile", kind: "frame", depth: 1 },
  { id: "c3-design", name: "09 · Design decisions", kind: "frame", depth: 0 },
  { id: "c3-matrix", name: "Decision matrix", kind: "frame", depth: 1 },
  { id: "c3-dec", name: "Decisions", kind: "component", depth: 1 },
  ...DECISIONS.map((d, i): Row => ({ id: `c3-dec-${i}`, name: `Decision=${d.t}`, kind: "variant", depth: 2 })),
  { id: "c3-ind", name: "Seven industries", kind: "frame", depth: 1 },
  { id: "c3-proof", name: "Claims to evidence", kind: "frame", depth: 1 },
  { id: "c3-tradeoffs", name: "10 · Key trade-offs", kind: "frame", depth: 0 },
  { id: "c3-tos", name: "Five trade-offs", kind: "frame", depth: 1 },
  { id: "c3-visual", name: "11 · Visual system", kind: "frame", depth: 0 },
  { id: "c3-vs", name: "Before and after palette", kind: "frame", depth: 1 },
  { id: "c3-final", name: "12 · Final design", kind: "frame", depth: 0 },
  { id: "c3-gal", name: "Shipped homepage", kind: "image", depth: 1 },
  { id: "c3-impact", name: "13 · Validation and impact", kind: "frame", depth: 0 },
  { id: "c3-qa", name: "Buyer questions", kind: "frame", depth: 1 },
  { id: "c3-links", name: "Metrics and causes", kind: "frame", depth: 1 },
  { id: "c3-reflection", name: "14 · Reflection", kind: "frame", depth: 0 },
  { id: "c3-refl", name: "Reflection", kind: "component", depth: 1 },
  ...REFLECT.map((r, i): Row => ({ id: `c3-rf-${i}`, name: `Topic=${r.t}`, kind: "variant", depth: 2 })),
  { id: "cs-outcome", name: "Outcome", kind: "frame", depth: 0 },
];

const layerRow = (r: Row) =>
  `<a class="ly d${r.depth}${r.depth === 0 ? " top" : ""}${r.kind === "component" || r.kind === "variant" ? " comp" : ""}" href="#${r.id}" data-target="${r.id}"><span class="ic" aria-hidden="true">${ICON[r.kind]}</span><span class="lt">${a(r.name)}</span></a>`;

const layersPanel = `<aside class="ui panel panel-l" aria-label="Page outline">
  <div class="p-head"><span class="p-file">Yashita’s portfolio</span><span class="p-sub">Case study · Chat360</span></div>
  <p class="p-title">Layers</p>
  <nav class="layers">
    ${LAYERS.map(layerRow).join("\n    ")}
  </nav>
</aside>`;

/* ---------- screenshot viewer (click a screenshot to enlarge it) ---------- */
const viewer = `<div class="ui lightbox cs-viewer" id="cs-viewer" role="dialog" aria-modal="true" aria-label="Screenshot viewer" hidden>
  <button class="lb-btn lb-close" type="button" aria-label="Close screenshot viewer"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
  <button class="lb-btn lb-nav lb-prev" type="button" aria-label="Previous screenshot"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <img class="lb-img" alt="">
  <div class="lb-cap" aria-live="polite"><span class="lb-name"></span><span class="lb-count"></span></div>
  <button class="lb-btn lb-nav lb-next" type="button" aria-label="Next screenshot"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
</div>`;

/* ---------- the top bar's back link ---------- */
const backLink = `<a class="tgl cs-back" href="/" data-return="fr-chat360" data-cursor="Back to the portfolio" aria-label="Back to the portfolio"><span class="cs-back-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="tgl-label">Portfolio</span></a><span class="tb-sep" aria-hidden="true"></span>`;

export const chatMarkup = [
  `<main class="cs c3" id="cs-top">`,
  hero,
  impact,
  about,
  context,
  success,
  research,
  insights,
  constraints,
  directions,
  ia,
  wire,
  design,
  tradeoffs,
  visual,
  final,
  validation,
  reflection,
  outcome,
  `</main>`,
  layersPanel,
  designPanel,
  toolbar,
  topbar(backLink),
  viewer,
  cursor,
].join("\n");

// Every Layers-panel row must point at a real element, or clicking it would silently do nothing.
for (const r of LAYERS) {
  if (!chatMarkup.includes(`id="${r.id}"`)) throw new Error(`chat360-markup: Layers row "${r.name}" points at missing #${r.id}`);
}
