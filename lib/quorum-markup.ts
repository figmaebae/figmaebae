// Quorum case study page, built like the BexCard and Chat360 ones: plain HTML rendered into the page, with
// lib/canvas.js (theme, Inspect, Layers + Design panels, cursor) and lib/quorum.js (the interactive bits) attached
// on mount. Chrome comes from lib/chrome.ts so it matches the home page.
//
// Rules from CLAUDE.md that apply here: every block has data-layer + data-kind (so the Design panel can
// inspect it) and a matching row in the Layers panel (see LAYERS below; ids are checked at load).
import { toolbar, topbar, cursor, designPanel } from "./chrome";
import { DG_DEPS, DG_SWIM, DG_ROUTE } from "./quorum-diagrams";

const IMG = "/case-studies/quorum/";
/* [width, height] of every screenshot, so the browser can reserve the space before it loads */
const DIMS: Record<string, [number, number]> = { "m-dash-top": [1027, 2200], "m-web-top": [800, 1713], "site-home": [1000, 651], "site-industries": [1000, 605], "site-features": [1000, 558], "site-pricing": [1000, 790], "site-resources": [1000, 698], "site-demo": [1000, 465], "step-pr": [1400, 3743], "step-approval": [1400, 2191], "step-po": [1400, 3429], "step-grn": [1400, 2579], "step-invoice": [1400, 2865], ai: [975, 1542], ai_context: [1472, 1120], appr_overview: [2880, 2228], book_avail: [1426, 2738], book_cal: [2880, 2049], book_overview: [2880, 2049], dash_approvals: [500, 530], dash_desktop: [1280, 1842], hero_devices: [2012, 1132], inv_overview: [2880, 2049], multi_dash: [2856, 2270], multi_entities: [2880, 2048], multi_reports: [2853, 2434], onb_done: [2880, 2438], onb_login: [2880, 2048], onb_step1: [2880, 2428], onb_step3: [2880, 3836], onb_step7: [2880, 5276], ord_invoice: [2880, 4470], ord_overview: [2880, 2300], proc_list: [2880, 2049], proc_overview: [2880, 2049], proc_qc: [1530, 1346], rep_fields: [2880, 2056], rep_pre: [2881, 2726], rep_trend: [2880, 2056], set_main: [2880, 2049], };

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

/** A screenshot. `zoom` wraps it in a button that opens the viewer (a group of screens you can page through). */
function qshot(file: string, alt: string, opts: { layer?: string; zoom?: string; eager?: boolean } = {}) {
  const [w, h] = DIMS[file];
  const layer = opts.layer ?? alt;
  const img = `<img class="q-shot" src="${IMG}${file}.webp" alt="${a(alt)}" width="${w}" height="${h}" ${
    opts.eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'
  } decoding="async" data-layer="${a(layer)}" data-kind="image">`;
  if (!opts.zoom) return img;
  return `<button class="cs-zoom" type="button" data-zoom data-zoom-group="${opts.zoom}" data-cursor="Enlarge: ${a(layer)}" aria-label="Enlarge screen: ${a(layer)}">${img}</button>`;
}

/** A screen in a framed card with a caption. */
function fig(file: string, alt: string, cap: string, zoom: string, bold?: string, tall?: boolean) {
  return `<figure class="q-fig"><div class="q-sc${tall ? " tall" : ""}">${qshot(file, alt, { layer: bold ?? alt, zoom })}</div><figcaption>${bold ? `<b>${bold}.</b> ` : ""}${cap}</figcaption></figure>`;
}

/** A browser window around some content. */
const bw = (inner: string, url = "") =>
  `<div class="c3-bw"><div class="c3-bar" aria-hidden="true"><i></i><i></i><i></i>${url ? `<span>${url}</span>` : ""}</div>${inner}</div>`;

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

const sub = (h: string, p?: string) => `<h3 class="cs-h3 cs-gap">${h}</h3>${p ? `<p class="cs-sub">${p}</p>` : ""}`;

/** Component-set tab strip + hidden panels (the decisions). */
function variantSet(opts: { id: string; layer: string; label: string; prop: string; tabs: string[]; panels: string[]; hash: string }) {
  const { id, hash, prop } = opts;
  return `<div class="cset c3-set" id="${id}" data-layer="${a(opts.layer)}" data-kind="component" data-measure=".cset-box">
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
const USERS: [string, string, string][] = [
  ["Login → Dashboard", "Single-entity owner", "One business, one branch. Lands straight on their dashboard."],
  ["Login → Entity picker → Consolidated view", "Multi-entity owner", "Branches or subsidiaries. Needs a combined view and a quick way into each entity."],
  ["Login → Platform console", "Super admin", "Runs the platform: onboards clients, sets plans, handles billing and support."],
];

const COMP: { grp: "Goods" | "Services"; name: string; vibe: string; plus: string; minus: string }[] = [
  { grp: "Goods", name: "Zoho", vibe: "The suite", plus: "Cheap, trusted, native e-invoicing and e-way bills", minus: "Stock, accounts and staff live in separate apps. You can't see staff and stock on one screen." },
  { grp: "Goods", name: "Odoo", vibe: "The Lego set", plus: "Customisable, handles manufacturing and multi-company", minus: "Pay per app and often a consultant to set it up. Master-detail navigation means a page load for every record." },
  { grp: "Goods", name: "Kladana", vibe: "The workhorse", plus: "Strong bill of materials and batch tracking", minus: "Treats labour as a cost, not a bookable service. Dated interface." },
  { grp: "Goods", name: "Precoro · Coupa", vibe: "The specialists", plus: "Best-in-class approvals and 3-way matching", minus: "Procurement only, priced for enterprise. You still need another tool to sell." },
  { grp: "Services", name: "Calendly", vibe: "The meeting", plus: "Zero learning curve, perfect calendar sync", minus: "No back office. It can't deduct stock or raise a GST invoice." },
  { grp: "Services", name: "Trafft", vibe: "The salon app", plus: "Visual staff and slot picking, deposits", minus: "“Extras” isn't inventory. There are no batches or POs for products used in a service." },
  { grp: "Services", name: "Reservio", vibe: "The reminder", plus: "Visit history and strong no-show reminders", minus: "Schedules people only. It can't require staff, a room and a machine together." },
];

const lv = (n: number) => `<span class="q-lv" data-v="${n}" role="img" aria-label="${n} out of 4"><i></i><i></i><i></i><i></i></span>`;
const MATRIX: [string, (number | string)[]][] = [
  ["Procurement", [4, 4, 2, 3, 2]],
  ["Inventory", [1, 1, 3, 3, 3]],
  ["Sales channels", ["None", "None", 3, 3, 2]],
  ["Service booking", ["No", "No", "Separate app", "Separate app", "No"]],
  ["Indian compliance", [1, 3, 4, 3, 1]],
];

const PRINCIPLES: [string, string, string][] = [
  ["P1", "One screen for staff and stock", "Zoho's split apps and Trafft's missing inventory. A salon owner shouldn't open two tools to see who's free and what's in stock."],
  ["P2", "Never leave the list to enter data", "Odoo's click, load, back pattern. Purchase and sales teams key in dozens of documents a day."],
  ["P3", "Quick yes on the dashboard, full review in Approvals", "Approvals carry money. Routine items should take one tap, but anything that needs a closer look belongs on a screen built for checking."],
  ["P4", "Help sits beside the work", "The PRD. AI chat opens at the side, not floating, so people can keep using the tool while they ask."],
  ["P5", "Ask only what's needed now", "Odoo's consultant-led setup. Get owners to a working dashboard first and configure modules when they're opened."],
];

type Mod = { id: string; name: string; tag: string; grp: string; gc: string; pages: [string, boolean][] };
const MODS: Mod[] = [
  { id: "dash", name: "Dashboard", tag: "reads + quick approve", grp: "Watch", gc: "var(--bl)", pages: [["KPI row with trends", false], ["Pending approvals: one-tap approve", false], ["Critical alerts", false], ["Sales vs spend", false], ["Activity feed", false]] },
  { id: "proc", name: "Procurement", tag: "PR → PO → GRN", grp: "Buy & stock", gc: "var(--gr)", pages: [["Overview", false], ["Requisitions", true], ["Purchase orders", true], ["Goods received + QC", true], ["Invoices", true], ["Vendors", true]] },
  { id: "inv", name: "Inventory", tag: "goods + services", grp: "Buy & stock", gc: "var(--gr)", pages: [["Overview", false], ["Catalogue", true], ["Stock: reserved vs available", false], ["Bin locations", false], ["Adjustments", true], ["Stock ledger", false]] },
  { id: "ord", name: "Orders", tag: "every channel", grp: "Sell & serve", gc: "var(--warn)", pages: [["Overview", false], ["Quotes & pro-forma", true], ["Orders & invoices", true], ["Returns", true], ["Customers", true], ["Discounts", true]] },
  { id: "book", name: "Bookings", tag: "time as inventory", grp: "Sell & serve", gc: "var(--warn)", pages: [["Overview", false], ["Calendar: day, week, month", false], ["New booking", true], ["Services", true], ["Resources & availability", true]] },
  { id: "rep", name: "Reporting", tag: "trends + exports", grp: "Insight & control", gc: "var(--pu)", pages: [["Trends", false], ["Pre-built reports", false], ["Custom report", false], ["Download data in 5 steps", false]] },
  { id: "appr", name: "Approvals", tag: "where money moves", grp: "Insight & control", gc: "var(--pu)", pages: [["Overview", false], ["To review, with SLA", false], ["My requests", false], ["Workflow builder", true]] },
  { id: "set", name: "Settings", tag: "admin only", grp: "Insight & control", gc: "var(--pu)", pages: [["Organization", false], ["Users & roles", true], ["Integrations", false], ["Templates", false], ["Notifications", false]] },
];

const STEPS: { n: string; short: string; img: string; alt: string; cap: string }[] = [
  { n: "Raise PR", short: "Raise PR", img: "step-pr", alt: "Create purchase requisition panel", cap: "Line items and cost summary in a floating panel." },
  { n: "Approval rules", short: "Approval", img: "step-approval", alt: "Create approval workflow panel", cap: "Criteria and stages decide who approves, set without code." },
  { n: "Create PO", short: "Create PO", img: "step-po", alt: "Create purchase order panel", cap: "Requisition details carry over, so purchasing only adds price, tax and terms." },
  { n: "Create GRN", short: "Create GRN", img: "step-grn", alt: "Create GRN panel", cap: "Received quantity per line, with a delivery challan upload." },
  { n: "Quality check", short: "Quality check", img: "proc_qc", alt: "Quality check modal", cap: "Accepted and rejected quantities, a reason and a photo." },
  { n: "Record invoice", short: "Invoice", img: "step-invoice", alt: "Upload invoice panel", cap: "Linked to its PO and GRN for the 3-way match." },
];

type Shot = { f: string; alt: string; b: string; cap: string; tall?: boolean };
const DECISIONS: { t: string; tag: string; h: string; p: [string, string]; d: [string, string]; wire?: boolean; layout: "side" | "two"; shots: Shot[] }[] = [
  {
    t: "Floating panels", tag: "P2 · Every create and edit form", h: "Floating screens instead of page loads",
    p: ["Problem", "Master-detail navigation reloads the page for every record. Teams lose their place in long lists."],
    d: ["Decision", "Forms slide in over the list as a panel. The list stays visible behind, and closing returns you to the same row."],
    wire: true, layout: "side",
    shots: [
      { f: "ord_invoice", tall: true, alt: "Create sales invoice panel open over the dimmed orders list", b: "Sales invoice", cap: "Line items, totals and a payment QR in one panel, with the orders list still behind it." },
      { f: "proc_list", alt: "Procurement lifecycle list with tabs for requisitions, orders, receipts and invoices", b: "Same pattern in Procurement", cap: "Requisitions, orders, receipts and invoices as tabs on one list, with every form opening over it." },
    ],
  },
  {
    t: "Approvals", tag: "P3 · Dashboards and approvals", h: "One tap for routine approvals, a full screen for the rest",
    p: ["Problem", "Managers need to clear routine requests fast. A full review on a busy dashboard is one misclick away from releasing the wrong purchase order."],
    d: ["Decision", "The dashboard card shows priority, amount and requester, with approve and dismiss for routine items. Anything that needs checking opens Approvals, where the full request and audit trail sit together."],
    layout: "two",
    shots: [
      { f: "appr_overview", alt: "Approvals overview with pending, approved, rejected and SLA-breached counts and a pending list", b: "In Approvals", cap: "The full queue, with SLA breaches counted separately." },
      { f: "dash_approvals", alt: "Dashboard pending approvals card with priority tags, amounts, requester and Approve buttons", b: "On the dashboard", cap: "Priority tag, amount, requester, then approve or dismiss." },
    ],
  },
  {
    t: "AI beside the work", tag: "P4 · Global shell · set by the brief", h: "AI beside the work: the brief's call, my execution",
    p: ["From the brief", "The PRD asked for AI chat that opens at the side, not floating, so people can keep using the tool while they ask."],
    d: ["My part", "A permanent entry at the foot of the sidebar, a drawer that leaves the data visible, suggested prompts for common questions, and answers that link back to the real report."],
    layout: "side",
    shots: [
      { f: "ai_context", alt: "Dashboard with the AI Assistant drawer open on the right, answering which vendors had delayed deliveries", b: "In context", cap: "The drawer shares the screen with the procurement workflow it is answering about." },
      { f: "ai", alt: "AI Assistant drawer close-up listing vendors with delayed deliveries", b: "Answers link back to data", cap: "“View full report” opens the real report." },
    ],
  },
  {
    t: "Onboarding", tag: "P5 · Onboarding", h: "Six questions, then the dashboard",
    p: ["Problem", "The PRD listed ten setup sections, from PAN and CIN to vendor masters and price lists. Asking for all of them up front stalls a trial."],
    d: ["Decision", "Organization details are required. Every module setup is optional, skippable and resumable from a left-hand checklist. A final review lets people edit any section before they start."],
    layout: "two",
    shots: [
      { f: "onb_step1", alt: "Let's set up your organization: required organization details form with setup checklist", b: "Step 1, required", cap: "Legal name, tax IDs, contact and address." },
      { f: "onb_done", alt: "Final review and summary with each completed setup section and edit links", b: "Review", cap: "Each section shows as configured or pending, with an edit link." },
    ],
  },
  {
    t: "Bookings + inventory", tag: "P1 · Bookings + inventory", h: "Services are bookable, not just billable",
    p: ["Problem", "Goods tools treat labour as a cost line. Booking tools can't link a staff member, a room and a machine to one slot."],
    d: ["Decision", "Staff, rooms and equipment are all “resources” with weekly availability. A booking checks every resource it needs, and the catalogue holds products and services side by side."],
    layout: "side",
    shots: [
      { f: "book_overview", alt: "Bookings overview with schedule snapshot, weekly resource utilisation and resource insights", b: "Bookings overview", cap: "Today's schedule and how busy each resource is." },
      { f: "book_avail", tall: true, alt: "Setup service availability panel with per-day time ranges", b: "Availability", cap: "Set per day, by time range or specific slots." },
    ],
  },
  {
    t: "Multi-entity", tag: "Multi-entity owners", h: "One login, every branch, one comparison",
    p: ["Problem", "Owners with several businesses log in and out of each to compare them."],
    d: ["Decision", "They land on an entity picker with a consolidated dashboard and reports that compare entities side by side. Approvals are pooled across entities."],
    layout: "two",
    shots: [
      { f: "multi_entities", alt: "Entities screen with three organisation cards and Enter Workspace buttons", b: "Entity picker", cap: "Status, role and last activity on each card." },
      { f: "multi_reports", alt: "Consolidated reports comparing revenue contribution by entity", b: "Consolidated reports", cap: "Revenue contribution by entity over time." },
    ],
  },
  {
    t: "Reporting", tag: "Reporting", h: "Custom exports as a five-step wizard",
    p: ["Problem", "A blank “build your report” screen asks owners to think like analysts."],
    d: ["Decision", "Pick a module, then fields, filters and a date range, then review and download a CSV. Pre-built reports cover the common cases."],
    layout: "two",
    shots: [
      { f: "rep_fields", alt: "Download data wizard on the select fields step", b: "Step 2 of 5", cap: "Fields shown as chips, with the stepper always visible." },
      { f: "rep_pre", alt: "Reports tab with pre-built reports and a custom report generator", b: "Pre-built first", cap: "Monthly sales, valuation, procurement and returns." },
    ],
  },
];

const wireframes = `<div class="q-opts">
    <div class="q-opt"><span class="cs-lab">Option A · Master-detail</span>
      <div class="q-wf"><div class="q-wfb"><i></i><i></i><i></i><i></i><i></i></div><span class="q-wfa">→</span><div class="q-wfb full"><b></b><i></i><i></i><i></i></div><span class="q-wfa">←</span><div class="q-wfb"><i></i><i></i><i class="lost"></i><i></i><i></i></div></div>
      <p>Every record is a new page. Coming back reloads the list and loses your filters and place.</p></div>
    <div class="q-opt pick"><span class="cs-lab">Option B · Floating panel · chosen</span>
      <div class="q-wf"><div class="q-wfb wide"><i></i><i></i><i class="hl"></i><i></i><i></i><div class="q-pnl"><b></b><i></i><i></i><i></i></div></div></div>
      <p>The list stays behind a panel. Close it and you're on the same row, ready for the next entry.</p></div>
  </div>
  <p class="cs-note">Wireframes redrawn for this case study to show the two patterns I compared, using Odoo's master-detail flow from my research as option A.</p>`;

/** Where each procure-to-pay panel sits on its board, in % of the board's width: [left, top, width, height] (some run off the edges on purpose). */
const PANELS: [number, number, number, number][] = [
  [5, 6, 43, 26],
  [52, -8, 43, 26],
  [5, 34, 43, 26],
  [52, 20, 43, 26],
  [5, 62, 43, 26],
  [52, 48, 43, 32],
];

/** Where each module overview sits on its board, in % of the board's width: [left, top, width, height, label corner]. */
const SHELLBOARD: [number, number, number, number, "tl" | "tr" | "bl" | "br"][] = [
  [5, 6, 43, 31, "tl"], // Inventory
  [52, -9, 43, 32, "bl"], // Orders
  [5, 39, 43, 36, "tl"], // Bookings
  [52, 25, 43, 34.3, "tl"], // Multi-entity
];

const SHELL: [string, string, string, string][] = [
  ["inv_overview", "Inventory overview", "Inventory", "Stock trend, fast and slow movers, low-stock alerts."],
  ["ord_overview", "Orders overview", "Orders", "Orders and invoices trend, revenue by channel, top customers."],
  ["book_cal", "Bookings week calendar", "Bookings", "Week calendar of every booking by time slot."],
  ["multi_dash", "Consolidated multi-entity dashboard", "Multi-entity", "Consolidated revenue, spend and order breakdown across entities."],
];

const SITES: [string, string, string, string][] = [
  ["site-home", "Home page", "Home", "The promise, three-step setup, a before-and-after table and pricing."],
  ["site-industries", "Industries page", "Industries", "Trading, salons, clinics, fitness and tutoring, each with the modules it uses."],
  ["site-features", "Features page", "Features", "Every module and how they connect, on a dark “foundation” band."],
  ["site-pricing", "Pricing page", "Pricing", "Three plans, a full comparison and a competitor table that admits what Quorum doesn't do."],
  ["site-resources", "Resources page", "Resources", "Setup guides, checklists and walkthrough videos for owners and their accountants."],
  ["site-demo", "Book a demo page", "Book a demo", "A 30-minute walkthrough on the visitor's own business type."],
];

/** Where each website tile sits on the board, in % of its width: [left, top, width, height] (some run off the edges), and the corner its label is in. */
const BOARD: { css: string; lab: "tl" | "tr" | "bl" | "br" }[] = (
  [
    [5, 6, 43, 28, "tl"], // Home
    [52, -8, 43, 26, "bl"], // Industries
    [52, 20, 43, 24, "tl"], // Features
    [52, 46, 43, 34, "tl"], // Pricing
    [5, 58, 43, 30, "tl"], // Resources
    [5, 36, 43, 20, "tl"], // Book a demo
  ] as [number, number, number, number, "tl" | "tr" | "bl" | "br"][]
).map(([l, t, w, h, lab]) => ({ css: `--l:${l};--t:${t};--w:${w};--h:${h}`, lab }));

const BREAKPOINTS: [string, string, string][] = [
  ['<rect x="2" y="4" width="20" height="13" rx="1.5"/><path d="M8 20h8"/>', "Desktop", "Full sidebar, KPI row, side-by-side widgets and panels that slide in over lists."],
  ['<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M11 18h2"/>', "Tablet", "The same modules reflowed for touch, for counters and receiving desks."],
  ['<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>', "Mobile", "The sidebar becomes a menu button, KPIs sit in a 2×2 grid, and widgets and cards stack into a single column."],
];

const SHIP = [
  "Research: 8 competitors, a feature matrix and positioning",
  "IA for 10 modules plus onboarding, with a glossary",
  "Happy-path flows for every module, including routing logic",
  "App UI for 8 modules and the multi-entity views",
  "Every screen designed for mobile, tablet and desktop",
  "A six-page marketing website, also responsive",
];
const METRICS: [string, string][] = [
  ["Time to first PO", "From signup to the first purchase order. Tests whether the six-question onboarding gets people working quickly."],
  ["Entry speed", "Documents created per session with floating screens. Compare against a sample of Odoo users if the client can recruit them."],
  ["Approval turnaround", "Median time in “Pending” and the share of SLA breaches, before and after workflow rules."],
  ["Hybrid adoption", "Share of accounts using both Bookings and Inventory. The core bet of the product."],
];
const LEARN: [string, string][] = [
  ["Vocabulary first", "Writing the glossary before the screens gave everyone one meaning for each term, and it decided the labels on screen."],
  ["Consistency scales a solo designer", "One shell, one panel pattern and one status language let me cover eight modules and three breakpoints alone."],
  ["Next, test with real operators", "I'd run task-based sessions with store managers and owners: receive a delivery, raise a PO, finish onboarding."],
];

/* ---------- sections ---------- */
const hero = `<header class="cs-hero cs-wrap" id="cs-hero" data-layer="Hero" data-kind="frame">
  <p class="fr-label reveal">${GRID}Case study · Product design · B2B SaaS · ERP for Indian SMEs</p>
  <h1 class="cs-h1 reveal"><span class="sel" id="sel" data-cursor="Quorum, one login, one stock record." data-layer="Quorum, one login, one stock record." data-kind="text">Quorum,<br><span class="ti-serif">one login,<br>one stock record.</span>${SEL_CHROME}<span class="dims" id="dims" aria-hidden="true">Hug × Hug</span></span></h1>
  <p class="about cs-lede reveal" id="cs-lede" data-layer="Summary" data-kind="text">Quorum is an ERP for Indian small businesses. It runs procurement, inventory, orders, bookings and approvals in one product. I <b>designed it end to end</b>, from competitor research to the full app and its marketing website, for mobile, tablet and desktop.</p>
  <ul class="cs-pills reveal" role="list" id="cs-pills" data-layer="Project details" data-kind="frame">
    <li class="cs-pill"><span class="dot" aria-hidden="true"></span>Design complete, in development</li>
    <li class="cs-pill">Role · Solo product designer</li>
    <li class="cs-pill">4–6 months</li>
    <li class="cs-pill">Mobile · Tablet · Desktop</li>
  </ul>
  <div class="fr q-stagefr" id="q-stage" data-cursor="The dashboard on laptop and phone" data-layer="Dashboard on laptop and phone" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}The dashboard, desktop and phone</p>
    <div class="fr-body">
      <div class="q-stage">${qshot("hero_devices", "Quorum dashboard on a laptop with the same overview on a phone, an AI assistant drawer open beside the content", { layer: "Quorum dashboard", zoom: "hero", eager: true })}</div>
      ${SEL_CHROME}<span class="dims" aria-hidden="true"></span>
    </div>
  </div>
</header>`;

const impact = `<section class="cs-sec cs-wrap" id="cs-impact" data-layer="At a glance" data-kind="frame" aria-label="At a glance">
  <div class="cs-bento q-nums">
    ${tile("cs-stat-1", "Modules", "Modules", `${stat(10, "", "")}<p>modules mapped in the information architecture</p>`, "inv")}
    ${tile("cs-stat-2", "Screens", "Screens", `${stat(150, "", "+")}<p>app screens and states designed</p>`)}
    ${tile("cs-stat-3", "Breakpoints", "Breakpoints", `${stat(3, "", "")}<p>for every screen: mobile, tablet, desktop</p>`)}
    ${tile("cs-stat-4", "Website", "Website", `${stat(6, "", "")}<p>marketing website pages</p>`)}
  </div>
  <div class="cs-bento c3-tldr">
    ${tile("q-tl-1", "Problem", "Problem", "<p>Indian SMEs run goods and services on separate tools. A salon that sells shampoo, or a detailer that buys wax, needs two or three apps that don't talk to each other.</p>", "cs-third")}
    ${tile("q-tl-2", "Approach", "Approach", "<p>One product with a shared shell. Fast floating screens for data entry, a dashboard that flags work and clears routine approvals in one tap, AI docked beside the work, and onboarding that asks only six questions.</p>", "cs-third")}
    ${tile("q-tl-3", "Outcome", "Outcome", "<p>Eight modules designed across three breakpoints, plus the marketing website, handed off to development. The founders called it “extremely high quality output”.</p>", "cs-third")}
  </div>
</section>`;

const FACTS: [string, string, string, string][] = [
  ["cs-role-1", "Role", "Solo product designer", ""],
  ["cs-role-2", "Team", "Worked directly with the client's founders", ""],
  ["cs-role-3", "Timeline", "4–6 months, research to handoff", ""],
  ["cs-role-4", "Scope", "Research, IA, flows, UI, website", ""],
  ["cs-role-5", "Platforms", "Mobile · Tablet · Desktop", ""],
  ["cs-role-6", "Status", "Design complete, in development", ""],
];
const about = `<section class="cs-sec cs-tight cs-wrap" id="cs-about" data-layer="Role and team" data-kind="frame" aria-label="Role and team">
  <div class="q-facts">
    ${FACTS.map(([id, lab, val]) => `<div class="q-fact" id="${id}" data-layer="${a(lab)}" data-kind="frame"><span class="cs-lab">${lab}</span><p>${val}</p></div>`).join("")}
  </div>
</section>`;

const context = section(
  "q-context",
  "01 · Context",
  "01 · Context",
  "A client brief with",
  "room to rethink",
  "The client gave me a product requirements document and a functional spec. The PRD said it plainly: change the flows and modules wherever that makes the product easier to use.",
  `<div class="cs-bento">
    ${tile("q-problem", "The gap", "The gap", `<p class="cs-statement"><span class="ti-sans">Most SME tools pick a side: <em class="c3-em">goods</em> (stock, POs, GST) or <em class="c3-em">services</em> (staff, rooms, time slots). Many Indian businesses are both.</span></p>`, "cs-full inv")}
  </div>
  ${sub("Who it serves: three users, three front doors")}
  <div class="q-users" id="q-users" data-layer="Three users" data-kind="frame">
    ${USERS.map(([route, h, p]) => `<div class="cs-card"><span class="q-route">${route}</span><h4 class="cs-h4">${h}</h4><p>${p}</p></div>`).join("")}
  </div>
  <p class="c3-note"><b>Role-based on top of all three.</b> Every client assigns roles to their users, so each screen also has to work when parts of it are hidden or read-only.</p>`,
);

const research = section(
  "q-research",
  "02 · Research and principles",
  "02 · Research &amp; principles",
  "Eight competitors,",
  "one recurring gap",
  "I reviewed the tools these businesses already use, in two groups: goods tools and booking tools. For each, I noted why people buy it and where it stops being useful.",
  `<div class="q-filter" role="group" aria-label="Filter competitors" data-cursor="Filter competitors">
    <button type="button" class="q-fbtn" data-f="all" aria-pressed="true">All 7</button>
    <button type="button" class="q-fbtn" data-f="Goods" aria-pressed="false">Goods tools</button>
    <button type="button" class="q-fbtn" data-f="Services" aria-pressed="false">Booking tools</button>
  </div>
  <div class="q-comp" id="q-comp" data-layer="Competitors" data-kind="frame">
    ${COMP.map(
      (c) =>
        `<article class="cs-card q-cc" data-grp="${c.grp}"><span class="q-grp">${c.grp}</span><header><h4 class="cs-h4">${c.name}</h4><span class="q-vibe">${c.vibe}</span></header><p class="q-plus">${c.plus}</p><p class="q-minus">${c.minus}</p></article>`,
    ).join("")}
  </div>
  ${sub("Feature depth: nobody covers procurement, inventory, sales and bookings together", "Ratings from my teardown, on a four-step scale from basic data entry to best-in-class.")}
  <div class="c3-tw" id="q-matrix" data-layer="Feature matrix" data-kind="frame"><table class="c3-mx q-mx">
    <thead><tr><th>Capability</th><th>Precoro</th><th>Coupa</th><th>Zoho</th><th>Odoo</th><th>Kladana</th></tr></thead>
    <tbody>${MATRIX.map(([k, vals]) => `<tr><td>${k}</td>${vals.map((v) => `<td>${typeof v === "number" ? lv(v) : `<small>${v}</small>`}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>
  <div class="cs-pers" id="q-pos" data-layer="Where Quorum can win" data-kind="frame">
    <div class="cs-card"><span class="c3-pcl g">Where Quorum can win</span><p>Goods and services in one product, native marketplace sync, and asking the data questions instead of learning menus.</p></div>
    <div class="cs-card"><span class="c3-pcl l">Where it's exposed</span><p>No track record against Zoho, rivals that start at $0–$10 a month, and frequent GST rule changes.</p></div>
  </div>
  ${sub("What the research told me: five rules I designed every screen against", "Each comes from a competitor gap or a line in the brief. The decisions in chapter 05 refer back to them.")}
  <div class="c3-rows q-pr" id="q-principles" data-layer="Five principles" data-kind="frame">
    ${PRINCIPLES.map(([k, h, from]) => `<div><span class="cs-lab q-k">${k}</span><div><h4 class="cs-h4">${h}</h4><p><b>From:</b> ${from}</p></div></div>`).join("")}
  </div>`,
);

const ia = section(
  "q-ia",
  "03 · Information architecture",
  "03 · Information architecture",
  "One shell, eight sections",
  "in the sidebar",
  "Research mapped ten modules. I grouped them by the job the owner is doing, so the final sidebar has eight sections: watch the business, buy and stock, sell and serve, then insight and control.",
  `<div class="cs-bento q-shell3" id="q-shell" data-layer="Around the sidebar" data-kind="frame">
    ${tile("q-sh-1", "Before the shell", "Before the shell", "<h3 class=\"cs-h4\">Onboarding</h3><p>6 required questions, then optional module setup.</p>", "cs-third")}
    ${tile("q-sh-2", "App shell", "App shell", `<h3 class="cs-h4">One frame around everything</h3><ul class="q-parts" role="list"><li>Sidebar</li><li>Global search</li><li>Entity switcher</li><li>Notifications</li><li>AI drawer</li><li>Profile</li></ul>`, "cs-third inv")}
    ${tile("q-sh-3", "Separate console", "Separate console", "<h3 class=\"cs-h4\">Super admin</h3><p>Tenants, plans and feature flags, logs, impersonation.</p>", "cs-third")}
  </div>
  <div class="fr q-smfr" id="q-sitemap" data-cursor="Sidebar sections" data-layer="Sidebar sections" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}The sidebar · pick a section to see its pages</p>
    <div class="fr-body">
      <div class="q-mods" role="tablist" aria-label="Sidebar sections" data-tabs="sitemap">
        ${MODS.map(
          (m, i) =>
            `<button class="q-mod" type="button" role="tab" id="q-mt-${i}" aria-controls="q-mp-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" style="--gc:${m.gc}" data-cursor="${a(m.name)}"><i aria-hidden="true"></i><span>${m.name}</span></button>`,
        ).join("")}
      </div>
      <div class="q-modpanels">
        ${MODS.map(
          (m, i) =>
            `<div class="q-modp" role="tabpanel" id="q-mp-${i}" aria-labelledby="q-mt-${i}" style="--gc:${m.gc}"${i === 0 ? "" : " hidden"}>
          <div class="q-modh"><span class="q-grp">${m.grp}</span><h3 class="cs-h3 cs-lg">${m.name}</h3><span class="q-tag">${m.tag}</span></div>
          <ul class="q-pages" role="list">${m.pages.map(([p, f]) => `<li>${p}${f ? '<i title="Opens as a floating panel over its list" aria-label="floating panel">▣</i>' : ""}</li>`).join("")}</ul>
        </div>`,
        ).join("")}
      </div>
      <p class="q-legend"><span><i>▣</i>Opens as a floating panel over its list</span></p>
      ${SEL_CHROME}<span class="dims" aria-hidden="true"></span>
    </div>
  </div>
  ${sub("How the sections connect: inventory sits in the middle of everything", "The hybrid model works because every module writes to one stock record. This is the data path behind P1.")}
  <figure class="q-dg" id="q-deps" data-layer="Data paths between modules" data-kind="frame">
    <div class="q-dgs q-mid" role="region" aria-label="Diagram: how modules change inventory" tabindex="0">${DG_DEPS}</div>
    <figcaption><b>Blue arrows change stock.</b> Goods come in through procurement and go out through orders and bookings. The dashboard only reads stock. Its one action is a quick approve, and anything complex goes to Approvals.</figcaption>
  </figure>`,
);

const flows = section(
  "q-flows",
  "04 · Key flows",
  "04 · Key flows",
  "Procure to pay,",
  "lane by lane",
  "The longest chain in the product crosses five roles and the system. Read it top to bottom: each column is a role, so you can see exactly where work changes hands.",
  `<figure class="q-dg q-swimfig" id="q-swim" data-layer="Procure-to-pay swimlane" data-kind="frame">
    <div class="q-dgs q-swim" role="region" aria-label="Swimlane diagram: procure to pay" tabindex="0">${DG_SWIM}</div>
    <figcaption><b>Six hand-offs, one record.</b> Dashed boxes are automatic. Rejections go back to the requester with a reason, and stock moves only after QC, not when goods arrive.</figcaption>
  </figure>
  ${sub("The screens behind each numbered step", "Six steps, six panels, laid out as one board in the order the flow runs (1, 3 and 5 on the left; 2, 4 and 6 on the right). Point at a panel, or at its step underneath, to light it up.")}
  <div class="fr q-stepfr" id="q-steps" data-cursor="Screens for each step" data-layer="Screens for each step" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}Procure to pay · steps 1–6</p>
    <div class="fr-body">
      <div class="q-stack" id="q-stack">
        ${STEPS.map(
          (s, i) =>
            `<div class="q-card" style="--l:${PANELS[i][0]};--t:${PANELS[i][1]};--w:${PANELS[i][2]};--h:${PANELS[i][3]}" data-i="${i}"><span class="q-pill"><i>${i + 1}</i>${s.short}</span>${qshot(s.img, s.alt, { layer: `Step ${i + 1}: ${s.n}` })}</div>`,
        ).join("")}
      </div>
      <ol class="q-points" aria-label="Procure-to-pay steps">
        ${STEPS.map(
          (s, i) =>
            `<li><div class="q-pt" data-i="${i}"><i>${i + 1}</i><span><b>${s.n}</b>${s.cap}</span></div></li>`,
        ).join("")}
      </ol>
      ${SEL_CHROME}<span class="dims" aria-hidden="true"></span>
    </div>
  </div>
  ${sub("Smart routing: three doors, five landing spots", "Trial users, buyers and returning users start differently. Two checks decide where each one lands, so nobody sees a wizard they don't need.")}
  <figure class="q-dg" id="q-route" data-layer="Entry routing" data-kind="frame">
    <div class="q-dgs q-wide" role="region" aria-label="Decision tree: where each kind of user lands" tabindex="0">${DG_ROUTE}</div>
    <figcaption><b>Diamonds are system checks.</b> A returning buyer whose trial expired skips setup entirely, and only multi-entity owners ever see a picker.</figcaption>
  </figure>`,
);

const decisions = section(
  "q-decisions",
  "05 · Design decisions",
  "05 · Design decisions",
  "Seven decisions that",
  "shaped the product",
  null,
  `${variantSet({
    id: "q-dec",
    layer: "Decisions",
    label: "Decision",
    prop: "Decision",
    hash: "q-dec",
    tabs: DECISIONS.map((d) => d.t),
    panels: DECISIONS.map(
      (d, i) => `<div class="q-dhead"><span class="cs-lab">${d.tag}</span><h3 class="cs-h3 cs-lg">${d.h}</h3></div>
        <div class="c3-dgrid">
          <div><span class="c3-pcl l">${d.p[0]}</span><p>${d.p[1]}</p></div>
          <div><span class="c3-pcl w">${d.d[0]}</span><p>${d.d[1]}</p></div>
        </div>
        ${d.wire ? wireframes : ""}
        <div class="q-vis ${d.layout}">${d.shots.map((s) => fig(s.f, s.alt, s.cap, "dec" + i, s.b, s.tall)).join("")}</div>`,
    ),
  })}
  ${sub("Same shell everywhere: learn one module, know them all", "Every module opens on its numbers and quick actions, then lists, then floating forms.")}
  <div class="q-board plain shell" id="q-shellgrid" data-layer="Module overviews" data-kind="frame" role="img" aria-label="A board of four module overviews: ${SHELL.map((x) => x[2]).join(", ")}">
    ${SHELL.map(
      ([f, , b], i) =>
        `<figure class="q-tile" style="--l:${SHELLBOARD[i][0]};--t:${SHELLBOARD[i][1]};--w:${SHELLBOARD[i][2]};--h:${SHELLBOARD[i][3]}" data-lab="${SHELLBOARD[i][4]}"><img class="q-shot" src="${IMG}${f}.webp" alt="" width="${DIMS[f][0]}" height="${DIMS[f][1]}" loading="lazy" decoding="async"><figcaption>${b}</figcaption></figure>`,
    ).join("")}
  </div>
  <ul class="q-sitelist two" id="q-shelllist" data-layer="Module overview notes" data-kind="frame">
    ${SHELL.map(([, , b, cap]) => `<li><span><b>${b}</b>${cap}</span></li>`).join("")}
  </ul>`,
);

const responsive = section(
  "q-responsive",
  "06 · Responsive and visual system",
  "06 · Responsive &amp; visual system",
  "Designed for the phone",
  "in the warehouse too",
  "I designed every dashboard screen and every website page for mobile, tablet and desktop. Owners check numbers on the move, and store staff receive goods with a phone in hand.",
  `<div class="q-devstage" id="q-devices" data-layer="Desktop and mobile dashboard" data-kind="frame">
    <div class="q-dk"><img class="q-shot" src="${IMG}dash_desktop.webp" alt="Desktop dashboard with KPIs, sales vs procurement chart, inventory distribution, recent activity, pending approvals, operational metrics and quick actions" width="${DIMS.dash_desktop[0]}" height="${DIMS.dash_desktop[1]}" loading="lazy" decoding="async" data-layer="Dashboard, desktop" data-kind="image"></div>
    <div class="q-ph"><img class="q-shot" src="${IMG}m-dash-top.webp" alt="Mobile dashboard: menu, 2 by 2 KPI grid and the start of the sales chart" width="${DIMS["m-dash-top"][0]}" height="${DIMS["m-dash-top"][1]}" loading="lazy" decoding="async" data-layer="Dashboard, mobile" data-kind="image"></div>
  </div>
  <div class="q-caps two">
    <p><b>Dashboard, desktop.</b> Two-column widgets beside a fixed sidebar.</p>
    <p><b>Dashboard, mobile.</b> KPIs in a 2×2 grid, everything else in one column. Approve becomes a full-width button.</p>
  </div>
  <div class="q-rgrid rev" id="q-breakpoints" data-layer="Breakpoints" data-kind="frame">
    <figure class="q-fig">
      <div class="q-devstage single"><div class="q-ph web"><img class="q-shot" src="${IMG}m-web-top.webp" alt="Mobile homepage: free-trial bar, nav, the headline, two buttons and the app on a phone" width="${DIMS["m-web-top"][0]}" height="${DIMS["m-web-top"][1]}" loading="lazy" decoding="async" data-layer="Homepage, mobile" data-kind="image"></div></div>
      <figcaption><b>Homepage, mobile.</b> Feature tabs, the before-and-after table and pricing cards stack into one column.</figcaption>
    </figure>
    <div class="c3-rows q-bps">
      ${BREAKPOINTS.map(([ic, h, p]) => `<div><span class="q-bpic" aria-hidden="true"><svg viewBox="0 0 24 24">${ic}</svg></span><div><h4 class="cs-h4">${h}</h4><p>${p}</p></div></div>`).join("")}
    </div>
  </div>
  ${sub("Visual system: calm navy shell, one action colour", "ERP screens are dense, so the palette stays quiet and lets status colours and the teal action colour stand out.")}
  <div class="cs-feat" id="q-vs" data-layer="Palette and status language" data-kind="frame">
    <div class="cs-card cs-fcard"><span class="cs-lab">Palette</span>
      <div class="q-sw">
        <div><i style="background:#0f172b"></i><b>Shell navy</b>#0F172B</div>
        <div><i style="background:#019f93"></i><b>Action teal</b>#019F93</div>
        <div><i style="background:#e3f4f3"></i><b>Mint surface</b>#E3F4F3</div>
        <div><i style="background:#f4f4f6"></i><b>Canvas</b>#F4F4F6</div>
        <div><i style="background:#ffffff"></i><b>Card</b>#FFFFFF</div>
        <div><i style="background:#fef5ea"></i><b>Notice</b>#FEF5EA</div>
      </div>
      <p>Navy holds the sidebar and footer. Teal marks every primary action and selected state, and nothing else.</p>
    </div>
    <div class="cs-card cs-fcard"><span class="cs-lab">Status language</span>
      <div class="q-chips">
        <span style="background:#e6f6ee;color:#127a4d">Approved</span>
        <span style="background:#fdf1e1;color:#a35f05">Pending approval</span>
        <span style="background:#fde8e6;color:#b42b1d">Rejected</span>
        <span style="background:#e8eefc;color:#2d55c2">In transit</span>
        <span style="background:#eceef1;color:#4b5563">Draft</span>
      </div>
      <p>The same five states across PRs, POs, orders, bookings and approvals, so a colour always means the same thing.</p>
    </div>
  </div>`,
);

const website = section(
  "q-website",
  "07 · Marketing website",
  "07 · Marketing website",
  "A website that sells",
  "by industry",
  "I designed the marketing site in the same visual language as the app. It leads with the “one screen” promise, then shows each industry the modules it would use. Six pages, laid out as one board.",
  `<div class="q-board" id="q-sites" data-layer="Six website pages" data-kind="frame" role="img" aria-label="A board of the six website pages: ${SITES.map((x) => x[2]).join(", ")}">
    <img class="q-bgimg" src="${IMG}site-home.webp" alt="" width="1000" height="651" loading="lazy" decoding="async" aria-hidden="true">
    ${SITES.map(
      ([f, , h], i) =>
        `<figure class="q-tile" style="${BOARD[i].css}" data-lab="${BOARD[i].lab}"><img class="q-shot" src="${IMG}${f}.webp" alt="" width="${DIMS[f][0]}" height="${DIMS[f][1]}" loading="lazy" decoding="async"><figcaption>${h}</figcaption></figure>`,
    ).join("")}
  </div>
  <ol class="q-sitelist" id="q-sitelist" data-layer="Website pages" data-kind="frame">
    ${SITES.map(([, , h, p]) => `<li><span><b>${h}</b>${p}</span></li>`).join("")}
  </ol>`,
);

const outcome = `<section class="contact cs-close" id="cs-outcome" data-layer="Outcome" data-kind="frame" aria-labelledby="cs-outcome-h">
  <div class="cs-wrap">
    <p class="cs-close-lab">${GRID}08 · Outcome &amp; reflection</p>
    <h2 id="cs-outcome-h" class="big-title contact-head"><span class="ti-sans">Designed, handed off, </span><span class="ti-serif">being built.</span></h2>
    <p class="q-closesub">Quorum is in development, so there is no usage data yet. This is what I delivered, and the metrics I'd track from launch to test the design.</p>
    <figure class="q-quote" id="q-quote" data-layer="Client quote" data-kind="frame"><blockquote>It was a pleasure working with Yashita for our website and SaaS platform design. She was extremely professional and understood our requirements very quickly. She delivered on a range of design requirements single-handedly, on time and with extremely high quality output. I would definitely work with Yashita in the future as well and would recommend everyone reaching out to her for all design requirements.</blockquote><figcaption>The client's founders · Quorum</figcaption></figure>
    <div class="q-closegrid">
      <div><span class="q-cl">What I delivered</span><ul class="q-ship" role="list">${SHIP.map((s) => `<li>${s}</li>`).join("")}</ul></div>
      <div><span class="q-cl">How I'd measure it after launch</span><dl class="q-metrics">${METRICS.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></div>
    </div>
    <div class="q-learn">${LEARN.map(([h, p]) => `<div><h3>${h}</h3><p>${p}</p></div>`).join("")}</div>
    <div class="cs-closer">
      <a class="gl-all cs-cta" href="/" data-return="fr-quorum" data-cursor="Back to the portfolio"><span>Back to the portfolio</span><span class="gl-all-go" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></span></a>
      <p class="cs-foot">Quorum · Product design case study · Product and client names changed for confidentiality</p>
    </div>
  </div>
</section>`;

/* ---------- Layers panel ---------- */
type Row = { id: string; name: string; kind: Kind; depth: 0 | 1 | 2 };
const LAYERS: Row[] = [
  { id: "cs-hero", name: "Hero", kind: "frame", depth: 0 },
  { id: "sel", name: "Quorum, one login, one stock record.", kind: "text", depth: 1 },
  { id: "cs-lede", name: "Summary", kind: "text", depth: 1 },
  { id: "q-stage", name: "Dashboard on laptop and phone", kind: "frame", depth: 1 },
  { id: "cs-impact", name: "At a glance", kind: "frame", depth: 0 },
  { id: "cs-stat-1", name: "Modules", kind: "frame", depth: 1 },
  { id: "cs-stat-2", name: "Screens", kind: "frame", depth: 1 },
  { id: "cs-stat-3", name: "Breakpoints", kind: "frame", depth: 1 },
  { id: "cs-stat-4", name: "Website", kind: "frame", depth: 1 },
  { id: "q-tl-1", name: "Problem", kind: "frame", depth: 1 },
  { id: "q-tl-2", name: "Approach", kind: "frame", depth: 1 },
  { id: "q-tl-3", name: "Outcome", kind: "frame", depth: 1 },
  { id: "cs-about", name: "Role and team", kind: "frame", depth: 0 },
  { id: "q-context", name: "01 · Context", kind: "frame", depth: 0 },
  { id: "q-problem", name: "The gap", kind: "frame", depth: 1 },
  { id: "q-users", name: "Three users", kind: "frame", depth: 1 },
  { id: "q-research", name: "02 · Research and principles", kind: "frame", depth: 0 },
  { id: "q-comp", name: "Competitors", kind: "frame", depth: 1 },
  { id: "q-matrix", name: "Feature matrix", kind: "frame", depth: 1 },
  { id: "q-pos", name: "Where Quorum can win", kind: "frame", depth: 1 },
  { id: "q-principles", name: "Five principles", kind: "frame", depth: 1 },
  { id: "q-ia", name: "03 · Information architecture", kind: "frame", depth: 0 },
  { id: "q-shell", name: "Around the sidebar", kind: "frame", depth: 1 },
  { id: "q-sitemap", name: "Sidebar sections", kind: "frame", depth: 1 },
  { id: "q-deps", name: "Data paths between modules", kind: "frame", depth: 1 },
  { id: "q-flows", name: "04 · Key flows", kind: "frame", depth: 0 },
  { id: "q-swim", name: "Procure-to-pay swimlane", kind: "frame", depth: 1 },
  { id: "q-steps", name: "Screens for each step", kind: "frame", depth: 1 },
  { id: "q-route", name: "Entry routing", kind: "frame", depth: 1 },
  { id: "q-decisions", name: "05 · Design decisions", kind: "frame", depth: 0 },
  { id: "q-dec", name: "Decisions", kind: "component", depth: 1 },
  ...DECISIONS.map((d, i): Row => ({ id: `q-dec-${i}`, name: `Decision=${d.t}`, kind: "variant", depth: 2 })),
  { id: "q-shellgrid", name: "Module overviews", kind: "frame", depth: 1 },
  { id: "q-responsive", name: "06 · Responsive and visual system", kind: "frame", depth: 0 },
  { id: "q-devices", name: "Desktop and mobile dashboard", kind: "frame", depth: 1 },
  { id: "q-breakpoints", name: "Breakpoints", kind: "frame", depth: 1 },
  { id: "q-vs", name: "Palette and status language", kind: "frame", depth: 1 },
  { id: "q-website", name: "07 · Marketing website", kind: "frame", depth: 0 },
  { id: "q-sites", name: "Six website pages", kind: "frame", depth: 1 },
  { id: "cs-outcome", name: "08 · Outcome and reflection", kind: "frame", depth: 0 },
  { id: "q-quote", name: "Client quote", kind: "frame", depth: 1 },
];

const layerRow = (r: Row) =>
  `<a class="ly d${r.depth}${r.depth === 0 ? " top" : ""}${r.kind === "component" || r.kind === "variant" ? " comp" : ""}" href="#${r.id}" data-target="${r.id}"><span class="ic" aria-hidden="true">${ICON[r.kind]}</span><span class="lt">${a(r.name)}</span></a>`;

const layersPanel = `<aside class="ui panel panel-l" aria-label="Page outline">
  <div class="p-head"><span class="p-file">Yashita’s portfolio</span><span class="p-sub">Case study · Quorum</span></div>
  <p class="p-title">Layers</p>
  <nav class="layers">
    ${LAYERS.map(layerRow).join("\n    ")}
  </nav>
</aside>`;

/* ---------- screen viewer (click a screen to enlarge it) ---------- */
const viewer = `<div class="ui lightbox cs-viewer" id="cs-viewer" role="dialog" aria-modal="true" aria-label="Screen viewer" hidden>
  <button class="lb-btn lb-close" type="button" aria-label="Close screen viewer"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
  <button class="lb-btn lb-nav lb-prev" type="button" aria-label="Previous screen"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <img class="lb-img" alt="">
  <div class="lb-cap" aria-live="polite"><span class="lb-name"></span><span class="lb-count"></span></div>
  <button class="lb-btn lb-nav lb-next" type="button" aria-label="Next screen"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
</div>`;

/* ---------- the top bar's back link ---------- */
const backLink = `<a class="tgl cs-back" href="/" data-return="fr-quorum" data-cursor="Back to the portfolio" aria-label="Back to the portfolio"><span class="cs-back-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="tgl-label">Portfolio</span></a><span class="tb-sep" aria-hidden="true"></span>`;

export const quorumMarkup = [
  `<main class="cs c3 c4" id="cs-top">`,
  hero,
  impact,
  about,
  context,
  research,
  ia,
  flows,
  decisions,
  responsive,
  website,
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
  if (!quorumMarkup.includes(`id="${r.id}"`)) throw new Error(`quorum-markup: Layers row "${r.name}" points at missing #${r.id}`);
}
