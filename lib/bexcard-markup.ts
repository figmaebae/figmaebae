// BexCard case study page, built the same way as the home page: plain HTML rendered into the page,
// with lib/canvas.js (theme, Inspect, Layers + Design panels, cursor) and lib/bexcard.js (the
// interactive bits below) attached on mount. Chrome (top bar, link bar, cursor, Design panel) comes
// from lib/chrome.ts so it stays identical to the home page.
//
// Rules from CLAUDE.md that apply here: every block has data-layer + data-kind (so the Design panel
// can inspect it) and a matching row in the Layers panel (see LAYERS below; ids are checked at load).
import { toolbar, topbar, cursor, designPanel } from "./chrome";

const IMG = "/case-studies/bexcard/";
const W = 546;
const H = 1183;

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

/** A phone screen. `layer` makes it inspectable; `zoom` wraps it in a button that opens the viewer. */
function shot(file: string, alt: string, opts: { layer?: string; zoom?: string; cls?: string; w?: number; h?: number; eager?: boolean } = {}) {
  const w = opts.w ?? W;
  const h = opts.h ?? H;
  const layer = opts.layer ?? alt;
  const img = `<img class="cs-shot${opts.cls ? " " + opts.cls : ""}" src="${IMG}${file}.webp" alt="${a(alt)}" width="${w}" height="${h}" ${
    opts.eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'
  } decoding="async" data-layer="${a(layer)}" data-kind="image">`;
  if (!opts.zoom) return img;
  return `<button class="cs-zoom" type="button" data-zoom data-zoom-group="${opts.zoom}" data-cursor="Enlarge: ${a(layer)}" aria-label="Enlarge screen: ${a(layer)}">${img}</button>`;
}

/** A numbered screen in a storyboard row. */
function sfig(file: string, alt: string, title: string, note: string, n: number) {
  return `<figure class="cs-fig cs-sfig"><span class="cs-sn" aria-hidden="true">${n}</span>${shot(file, alt, { layer: title, zoom: "topups" })}<figcaption><b>${title}</b>${note}</figcaption></figure>`;
}

function fig(file: string, alt: string, title: string, note: string, group: string) {
  return `<figure class="cs-fig">${shot(file, alt, { layer: title, zoom: group })}<figcaption><b>${title}</b>${note}</figcaption></figure>`;
}

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

/* ---------- content ---------- */
const JOURNEY: { short: string; sub: string; items: string[]; shots: { f: string; t: string; sq?: boolean }[] }[] = [
  {
    short: "Link a child",
    sub: "Child and parent connect",
    items: ["Scan a QR code or enter six digits", "If the parent can't be found, the child is asked to check the number and the parent gets a download link"],
    shots: [
      { f: "child-link", t: "Link by QR or code" },
      { f: "child-error", t: "Recovery, not an error" },
    ],
  },
  {
    short: "Add money",
    sub: "Parent funds the card",
    items: ["Pick a bank and approve in your own banking app", "Saved banks come back as cards", "Schedule or auto top-up"],
    shots: [
      { f: "oneoff-new-method", t: "Pick bank" },
      { f: "topup-addfunds", t: "Saved bank" },
      { f: "topup-schedule", t: "Schedule" },
    ],
  },
  {
    short: "Send safely",
    sub: "Paying someone else",
    items: ["A partial name match is flagged in the field", 'No match makes "Go back and edit" the main action', "The warning is repeated on the review screen"],
    shots: [
      { f: "cop-form", t: "Flagged in place" },
      { f: "cop-nomatch", t: "No match", sq: true },
      { f: "cop-review", t: "Review" },
    ],
  },
  {
    short: "Come back",
    sub: "Returning to the app",
    items: ["Passcode pad with a fingerprint option"],
    shots: [{ f: "cop-passcode", t: "Passcode + biometrics" }],
  },
  {
    short: "Save long-term",
    sub: "Junior ISA and CTF",
    items: ["Start per child from the parent's family screen", "CTF transfer in three steps, with Bex handling the paperwork"],
    shots: [
      { f: "jisa-family", t: "Start per child" },
      { f: "ctf-form", t: "CTF paperwork" },
      { f: "ctf-congrats", t: "Next step clear" },
    ],
  },
];

const BENCH: { who: string; head: string; text: string; take: string; f: string; cap: string }[] = [
  { who: "GoHenry", head: "Fast return visits", text: "Public reviews mention login friction and ask for Face ID.", take: "Biometrics in the passcode pad.", f: "cop-passcode", cap: "Passcode + biometrics" },
  { who: "Rooster Money", head: "Money on a schedule", text: "Direct debit or standing order top-ups run themselves.", take: "Scheduled and auto top-up.", f: "topup-schedule", cap: "Schedule and auto top-up" },
  { who: "Starling Kite", head: "Top up from your bank", text: "Lives in the parent's bank app. No bank details needed.", take: "Open banking: pick a bank and approve.", f: "oneoff-new-method", cap: "Pick a bank, approve" },
  { who: "HyperJar · Revolut <18", head: "Pots and controls", text: "Jars or pots, limits and card freezing for parents.", take: "Spends, savings and goals in one place.", f: "child-home", cap: "Spends, savings and goals" },
];

const RULES: [string, string][] = [
  ["One system, two apps", "Shared top bar, input, button, PIN pad and options across the parent and child apps. Main action at the bottom."],
  ["Fewer fields", "Let systems do the work: open banking to add money, Face ID or fingerprint to come back."],
  ["Design the unhappy paths", "A name mismatch or a child who can't link gets a clear next step, not a dead end."],
  ["Make saving next", "Junior ISA where parents already look. Paperwork for an old CTF handled for them."],
];

const FAMILY: [string, string][] = [
  ["Link", "The child scans a QR code or enters six digits to join the parent's account."],
  ["Fund", "The parent adds money and moves it between a child's spends and savings."],
  ["Use", "The child sees spends, savings, tasks, goals and when the next allowance arrives."],
  ["Grow", "The Junior ISA has a child view, so the same account reads for both people."],
];

const COP: { tab: string; img: string; sq: boolean; head: string; text: string; sev: string; tone: "h" | "m" | "g" }[] = [
  { tab: "Typing", img: "cop-form", sq: false, head: "The field flags itself in place", text: "As the recipient name is typed, a partial match is flagged right in the form, before any decision.", sev: "Partial match", tone: "m" },
  { tab: "Partial match", img: "cop-partial", sq: true, head: "One tap to use the name the bank holds", text: "The sheet offers the name on the account, so the fix is a tap, not retyping.", sev: "Partial match", tone: "m" },
  { tab: "No match", img: "cop-nomatch", sq: true, head: "The safe choice is the main button", text: '"Go back and edit" is primary. Continuing anyway is secondary.', sev: "No match", tone: "h" },
  { tab: "Review", img: "cop-review", sq: false, head: "Warning repeated where the decision is made", text: "The warning sits above Confirm and send, so it can't be missed.", sev: "Review", tone: "m" },
  { tab: "Confirm", img: "cop-passcode", sq: false, head: "Passcode or biometrics to authorise", text: "Strong customer authentication without extra screens.", sev: "Confirm", tone: "g" },
];

const MODES: { id: string; name: string; shots: [string, string, string][] }[] = [
  {
    id: "light",
    name: "Light",
    shots: [
      ["topup-addfunds", "Add funds screen", "Saved bank, recurring"],
      ["topup-schedule", "Schedule top-up screen", "Schedule top-up"],
      ["cop-passcode", "Passcode screen", "Passcode with biometrics"],
      ["oneoff-new-submitted", "Success screen", "Confirmation"],
    ],
  },
  {
    id: "dark",
    name: "Dark",
    shots: [
      ["dark-addfunds", "Add funds screen, dark", "Saved bank, recurring"],
      ["dark-schedule", "Schedule top-up screen, dark", "Schedule top-up"],
      ["dark-passcode", "Passcode screen, dark", "Passcode with biometrics"],
      ["dark-success", "Success screen, dark", "Confirmation"],
    ],
  },
];

/* ---------- sections ---------- */
const hero = `<header class="cs-hero cs-wrap" id="cs-hero" data-layer="Hero" data-kind="frame">
  <p class="fr-label reveal">${GRID}Case study · UI/UX design · UK family money app</p>
  <h1 class="cs-h1 reveal"><span class="sel" id="sel" data-cursor="Bex, for families." data-layer="Bex, for families." data-kind="text">Bex,<br><span class="ti-serif">for families.</span>${SEL_CHROME}<span class="dims" id="dims" aria-hidden="true">Hug × Hug</span></span></h1>
  <p class="about cs-lede reveal" id="cs-lede" data-layer="Summary" data-kind="text">A prepaid card and app for kids, an app for parents, and a Junior ISA for later. This was a <b>redesign of an existing app</b>, shipped after users complained and dropped off.</p>
  <ul class="cs-pills reveal" role="list" id="cs-pills" data-layer="Project details" data-kind="frame">
    <li class="cs-pill"><span class="dot" aria-hidden="true"></span>Shipped</li>
    <li class="cs-pill">Role · UI/UX designer</li>
    <li class="cs-pill">3 months</li>
    <li class="cs-pill">Parent app · Child app · Junior ISA · CTF</li>
    <li class="cs-pill">Light + dark</li>
  </ul>
  <div class="cs-fan" id="cs-fan" data-layer="Redesigned screens" data-kind="frame" role="group" aria-label="Redesigned screens">
    ${shot("child-home", "Child home with spends, savings, tasks and goals", { layer: "Child home", eager: true })}
    ${shot("parent-home-jisa", "Parent home with balance and Junior ISA prompt", { layer: "Parent home", eager: true })}
    ${shot("jisa-home", "Junior ISA home with cash and stocks split", { layer: "Junior ISA home", eager: true })}
    ${shot("buddy-answer", "BexBuddy chat answering a savings question", { layer: "BexBuddy answer", w: 542 })}
  </div>
</header>`;

const TICKER = ["Open banking top-up", "Junior ISA", "CTF transfer", "Confirmation of Payee", "BexBuddy AI", "Light + dark", "Face ID passcode"];
const marquee = `<div class="cs-marq" id="cs-marq" data-layer="Feature ticker" data-kind="frame" aria-hidden="true"><div class="cs-marq-track">${[0, 1]
  .map(() => TICKER.map((t) => `<span>${t}</span>`).join(""))
  .join("")}</div></div>`;

const impact = `<section class="cs-sec cs-wrap" id="cs-impact" data-layer="Impact" data-kind="frame" aria-label="Impact">
  <div class="cs-bento cs-stats">
    ${tile("cs-stat-1", "Overall activity", "Overall activity", `${stat(68, "+", "%")}<p>user activity after the core app redesign</p>`, "inv")}
    ${tile("cs-stat-2", "Kids' savings", "Kids' savings", `${stat(47, "+", "%")}<p>adoption of the Junior ISA and CTF feature</p>`)}
    ${tile("cs-stat-3", "Reach", "Reach", `${stat(50, "", "K+")}<p>app downloads driven by the redesign</p>`)}
  </div>
</section>`;

const SPEC: [string, string, string, string][] = [
  ["cs-role-1", "My role", "UI/UX designer", "The whole app: parent, child, Junior ISA and money flows."],
  ["cs-role-2", "Worked with", "Developers, a manager and a PM", "Designed alongside the people who built and owned it."],
  ["cs-role-3", "Timeline", "3 months", "For the whole app redesign."],
];
const about = `<section class="cs-sec cs-tight cs-wrap" id="cs-about" data-layer="Role and team" data-kind="frame" aria-label="Role and team">
  <div class="cs-spec">
    ${SPEC.map(([id, lab, val, note]) => `<div class="cs-spec-item" id="${id}" data-layer="${a(lab)}" data-kind="frame"><span class="cs-lab">${lab}</span><p class="cs-spec-val">${val}</p><p class="cs-spec-note">${note}</p></div>`).join("")}
  </div>
</section>`;

const problem = section(
  "cs-problem",
  "01 · The problem",
  "01 · The problem",
  "Families were leaving before",
  "Bex could help",
  null,
  `<div class="cs-bento">
    ${tile("cs-p-1", "Two users, one dependency", "Two users, one dependency", `<p class="cs-big">A parent signs up, passes ID checks, links a bank and adds money. Only then can a child start. One bad step stalls the family.</p>`, "cs-half")}
    ${tile("cs-p-2", "What was happening", "What was happening", `<p class="cs-big">Complaints about key steps and a high drop-off. Many families never reached a funded card, an active child or long-term savings.</p>`, "cs-half inv")}
    ${tile("cs-p-3", "Problem statement", "Problem statement", `<p class="cs-statement"><span class="ti-sans">Parents and children dropped out between download and a funded card. The design had to ask for less at the moments that need the most trust.</span></p>`, "cs-full")}
  </div>
  <div class="cs-bento cs-hmw" id="cs-hmw" data-layer="How might we" data-kind="frame">
    ${tile("cs-hmw-1", "How might we 1", "HMW 1", "<p>get a family from download to a funded card with fewer steps and less typing?</p>", "cs-third")}
    ${tile("cs-hmw-2", "How might we 2", "HMW 2", "<p>make moving money feel safe without slowing people down?</p>", "cs-third")}
    ${tile("cs-hmw-3", "How might we 3", "HMW 3", "<p>turn a spending card into a saving habit that lasts until 18?</p>", "cs-third")}
  </div>`,
);

const journey = `<div class="fr cs-jmap" id="cs-journey" data-cursor="Family journey" data-layer="Family journey" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}The family journey · tap a step to see the screens</p>
    <div class="fr-body">
      <div class="cs-jgrid">
        <div class="cs-jline" role="tablist" aria-orientation="vertical" aria-label="Family journey" data-tabs="journey">
          ${JOURNEY.map(
            (s, i) =>
              `<button class="cs-jstep" type="button" role="tab" id="cs-jt-${i}" aria-controls="cs-jp-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-cursor="Journey step: ${a(s.short)}"><span class="cs-jdot">${i + 1}</span><span class="cs-jtx"><b>${s.short}</b><small>${s.sub}</small></span><span class="cs-jbar" aria-hidden="true"></span></button>`,
          ).join("")}
        </div>
        <div class="cs-jstage">
          ${JOURNEY.map(
            (s, i) =>
              `<div class="cs-jpanel" role="tabpanel" id="cs-jp-${i}" aria-labelledby="cs-jt-${i}"${i === 0 ? "" : " hidden"}>
            <div class="cs-jtxt"><span class="cs-lab">Step ${i + 1} of ${JOURNEY.length} · ${s.sub}</span><h3 class="cs-h3 cs-lg">${s.short}</h3><ul>${s.items.map((x) => `<li>${x}</li>`).join("")}</ul></div>
            <div class="cs-jshots">${s.shots
              .map(
                (x) =>
                  `<figure class="cs-jfig">${shot(x.f, x.t, { layer: x.t, zoom: "journey-" + i, cls: x.sq ? "sq" : "", w: x.sq ? 560 : W, h: x.sq ? 575 : H })}<figcaption>${x.t}</figcaption></figure>`,
              )
              .join("")}</div>
          </div>`,
          ).join("")}
        </div>
      </div>
      ${SEL_CHROME}<span class="dims" aria-hidden="true"></span>
    </div>
  </div>`;

const research = section(
  "cs-research",
  "02 · Research",
  "02 · Research",
  "What families needed from the",
  "journey",
  "I started from the complaints and drop-off, then used a benchmark of UK kids' money apps and proto-personas to decide where the design had to work hardest.",
  `${journey}
  <h3 class="cs-h3 cs-gap">What parents already expect</h3>
  <div class="cs-bench" id="cs-bench" data-layer="Benchmark" data-kind="frame">
    <div class="cs-blist" role="tablist" aria-orientation="vertical" aria-label="What other apps offer" data-tabs="bench">
      ${BENCH.map(
        (b, i) =>
          `<button class="cs-brow" type="button" role="tab" id="cs-bt-${i}" aria-controls="cs-bp-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-cursor="Benchmark: ${a(b.who)}"><span class="cs-lab">${a(b.who)}</span><b>${b.head}</b><small>${b.text}</small></button>`,
      ).join("")}
    </div>
    <div class="cs-bstage">
      ${BENCH.map(
        (b, i) =>
          `<div class="cs-bpanel" role="tabpanel" id="cs-bp-${i}" aria-labelledby="cs-bt-${i}"${i === 0 ? "" : " hidden"}>
        <div class="cs-btext"><span class="cs-bpill">Bex's answer</span><p class="cs-btake">${b.take}</p><p class="cs-bfrom">Against ${a(b.who)}: ${b.head.toLowerCase()}.</p></div>
        <figure class="cs-bfig">${shot(b.f, b.cap, { layer: b.cap, zoom: "bench" })}<figcaption>${b.cap}</figcaption></figure>
      </div>`,
      ).join("")}
    </div>
  </div>
  <p class="cs-callout"><span class="cs-lab">The gap</span>None of them made the long term easy. <span class="ti-serif">Bex could own it with a Junior ISA and a simple CTF transfer.</span></p>
  <h3 class="cs-h3 cs-gap">Two users, built from the complaints</h3>
  <div class="cs-pers" id="cs-personas" data-layer="Proto-personas" data-kind="frame">
    <div class="cs-card cs-pe" id="cs-pe-1" data-layer="Parent persona" data-kind="frame"><div class="cs-pehead"><img class="cs-avatar" src="${IMG}persona-parent.svg" alt="Illustration of Mary, the parent persona" width="160" height="160" loading="lazy" decoding="async" data-layer="Mary, parent" data-kind="image"><span class="cs-lab">Parent</span></div><p class="cs-q">"I'll finish setting it up when I have ten minutes."</p><p><b>Mary, two kids.</b> Wants cashless pocket money, visibility, and a start on saving.</p><p><b>Blocked by</b> long set-up, typing bank details, doubt about where money went.</p></div>
    <div class="cs-card cs-pe" id="cs-pe-2" data-layer="Child persona" data-kind="frame"><div class="cs-pehead"><img class="cs-avatar" src="${IMG}persona-child.svg" alt="Illustration of Anika, the child persona" width="160" height="160" loading="lazy" decoding="async" data-layer="Anika, child" data-kind="image"><span class="cs-lab">Child</span></div><p class="cs-q">"Can I use it yet?"</p><p><b>Anika, 11.</b> Wants her own card, a goal to save for, and tasks that earn.</p><p><b>Blocked by</b> waiting on the parent to finish, and screens written for adults.</p></div>
  </div>
  <p class="cs-note">Proto-personas are assumption-based, not from interviews. Names come from the sample data in the designs.</p>`,
);

const approach = section(
  "cs-approach",
  "03 · Approach",
  "03 · Approach",
  "Four rules I",
  "designed against",
  null,
  `<div class="cs-rules" id="cs-rules" data-layer="Four rules" data-kind="frame">
    ${RULES.map(
      ([h, p], i) =>
        `<div class="cs-card cs-rule"><span class="cs-rn ti-serif" aria-hidden="true">0${i + 1}</span><h3 class="cs-h3">${h}</h3><p>${p}</p></div>`,
    ).join("")}
  </div>`,
);

const two = section(
  "cs-two",
  "04 · Two apps, one product",
  "04 · Two apps, one product",
  "Every family action has",
  "two sides",
  "Bex is a parent app and a child app that depend on each other. I designed them as one product, so what a parent does is visible to the child, and the other way round.",
  `<div class="cs-pair" id="cs-pair" data-layer="Parent and child apps" data-kind="frame">
    <figure class="cs-side">${shot("parent-home-jisa", "Parent home with each child's spends and savings", { layer: "Parent home", zoom: "pair" })}<figcaption><span class="cs-lab">Parent app</span><b>Sees every child's money</b>Balance, each child's spends and savings, Add Funds and Transfer in reach.</figcaption></figure>
    <ol class="cs-steps">
      ${FAMILY.map(([b, t]) => `<li><b>${b}</b><span>${t}</span></li>`).join("\n      ")}
    </ol>
    <figure class="cs-side">${shot("child-home", "Child home with spends, savings, tasks, allowance and goals", { layer: "Child home", zoom: "pair" })}<figcaption><span class="cs-lab">Child app</span><b>Sees what is theirs</b>Spends, savings, tasks, allowance countdown and goals on one screen.</figcaption></figure>
  </div>`,
);

const linking = section(
  "cs-linking",
  "05 · Linking a child",
  "05 · Linking a child",
  "Connecting a child never",
  "dead-ends",
  null,
  `<div class="cs-feat" id="cs-link" data-layer="Linking a child" data-kind="frame">
    <div class="cs-card cs-fcard cs-linktxt" data-layer="Scan or type six digits" data-kind="frame">
      <div class="cs-mtext"><h3 class="cs-h3 cs-lg">Scan or type six digits</h3>
      <p>A child links to their parent by scanning a QR code or entering a six-digit code. If Bex can't find the parent, the child isn't left with an error.</p></div>
      <ol class="cs-mini">
        <li><i>1</i><p><b>Scan the QR code</b> or enter the six digits.</p></li>
        <li><i>2</i><p><b>Parent not found?</b> The child is asked to check the number.</p></li>
        <li><i>3</i><p><b>The parent gets a download link,</b> so the family can carry on.</p></li>
      </ol>
    </div>
    <div class="cs-card cs-fcard" data-layer="Link screens" data-kind="frame">
      <div class="cs-duo two">
        ${shot("child-link", "Child link screen with QR code and six-digit code", { layer: "Child link", zoom: "link" })}
        ${shot("child-error", "Cannot connect screen with option to send a download link", { layer: "Cannot connect", zoom: "link" })}
      </div>
    </div>
  </div>`,
);

const money = section(
  "cs-money",
  "06 · Adding money",
  "06 · Adding money",
  "From typing bank details to",
  "tapping your bank",
  null,
  `<div class="fr cs-scene" id="cs-scene" data-cursor="Typing vs tapping" data-layer="Typing vs tapping" data-kind="frame" data-measure=".fr-body">
    <p class="fr-label">${GRID}Add funds · typing vs tapping</p>
    <div class="fr-body">
      <div class="cs-sc">
        <div class="cs-sc-text">
          <h3 class="cs-h3 cs-lg">Pick your bank. Approve. Done.</h3>
          <p>Parents choose their bank and approve the payment in their own banking app through open banking. Saved banks come back as cards, so the next top-up is an amount and a tap.</p>
          <ul class="cs-facts">
            <li><b>Recurring</b><span>Schedule monthly, weekly or daily, or top up automatically when the balance drops below a chosen amount</span></li>
          </ul>
        </div>
        <div class="cs-demo" id="cs-demo" aria-hidden="true">
          <div class="cs-dcol cs-dold">
            <div class="cs-ph">
              <div class="cs-ph-top">Bank details</div>
              <div class="cs-ph-body">
                <div class="cs-fl"><span>Account name</span><span class="cs-fin"><em class="t1">George Miller</em></span></div>
                <div class="cs-fl"><span>Sort code</span><span class="cs-fin"><em class="t2">00-00-00</em></span></div>
                <div class="cs-fl"><span>Account number</span><span class="cs-fin"><em class="t3">12345678</em></span></div>
                <span class="cs-ph-btn cs-ph-cont">Continue</span>
              </div>
            </div>
            <p class="cs-dcap"><b>Typing bank details</b>3 fields, 14 digits</p>
          </div>
          <span class="cs-dvs">vs</span>
          <div class="cs-dcol cs-dnew">
            <div class="cs-ph">
              <div class="cs-ph-top">Pick your bank</div>
              <div class="cs-ph-body">
                <span class="cs-ph-h">Select a payment bank account</span>
                <div class="cs-banks">
                  <span class="cs-bank">Royal Bank of Scotland</span>
                  <span class="cs-bank pick">Monzo</span>
                  <span class="cs-bank">Barclays</span>
                  <span class="cs-bank">Natwest</span>
                  <span class="cs-tap"></span>
                </div>
                <span class="cs-ph-btn cs-ph-app"><span class="a1">Approve in your banking app</span><span class="a2">✓ Approved</span></span>
              </div>
            </div>
            <p class="cs-dcap"><b>Tapping your bank</b>1 tap, then approve</p>
          </div>
        </div>
      </div>
      ${SEL_CHROME}<span class="dims" aria-hidden="true"></span>
    </div>
  </div>
  <div class="cs-story cs-bleed" id="cs-topups" data-layer="Top-up screens" data-kind="frame" role="group" aria-label="Top-up screens">
    <div class="cs-sgroup">
      <p class="cs-sglab">One-off top-up</p>
      <div class="cs-sflow">
        ${sfig("oneoff-new-amount", "Enter amount", "Amount first", "Bank chosen next", 1)}
        ${sfig("oneoff-new-method", "Saved banks shown as cards", "Pick a bank", "Saved banks come back as cards", 2)}
        ${sfig("oneoff-new-submitted", "Transfer submitted confirmation", "Submitted", "Amount and transaction ID", 3)}
      </div>
    </div>
    <div class="cs-sgroup">
      <p class="cs-sglab">Recurring top-ups</p>
      <div class="cs-sflow">
        ${sfig("topup-addfunds", "Add funds with saved bank card", "Saved bank", "With recurring status", 4)}
        ${sfig("topup-schedule", "Schedule top-up", "Schedule", "Amount, frequency, day", 5)}
        ${sfig("topup-auto", "Auto top-up threshold", "Auto top-up", "Below a threshold", 6)}
      </div>
    </div>
  </div>`,
);

const save = section(
  "cs-save",
  "07 · Saving for later",
  "07 · Saving for later · +47%",
  "A Junior ISA parents",
  "actually open",
  "Shown on the parent home with a reason to act (opening one removes card fees), four labelled steps, and CTF paperwork handled for them.",
  `<div class="cs-spread cs-bleed" id="cs-jisa" data-layer="Junior ISA and CTF screens" data-kind="frame" role="group" aria-label="Junior ISA and CTF screens" data-zoom-group="jisa" style="--cols:7;--cols-md:4;--cols-sm:2">
    ${fig("jisa-family", "Family list with Start per child", "Start per child", "Opened accounts listed below", "jisa")}
    ${fig("jisa-declaration", "Risk warning, step 2 of 4", "Risk in plain words", "Documents in one list, step 2 of 4", "jisa")}
    ${fig("jisa-invest", "Slider for cash and stocks mix", "One slider", "Cash or stocks, changeable later", "jisa")}
    ${fig("jisa-portfolio", "Estimated value by age 18", "See the future", "Estimate at 18 updates live", "jisa")}
    ${fig("ctf-details", "CTF details step 3 of 3", "CTF in 3 steps", "You, your child, the fund", "jisa")}
    ${fig("ctf-form", "Let Bex handle the form or print it yourself", "Who does the paperwork", "Bex posts a form, or print it", "jisa")}
    ${fig("ctf-congrats", "Form and prepaid envelope on the way", "Clear next step", "With tracking", "jisa")}
  </div>
  <p class="cs-quote">"Let bex handle everything for you."</p>`,
);

const send = section(
  "cs-send",
  "08 · Sending money out",
  "08 · Sending money out",
  "Catch the wrong account",
  "before money leaves",
  "UK banks check that the payee name matches the account (Confirmation of Payee) and payments need strong authentication. Each result is its own state with one clear action.",
  `<div class="cset cs-cop" id="cs-cop" data-layer="Confirmation of Payee" data-kind="component" data-measure=".cset-box">
    <p class="cset-label">${DIAMONDS}Confirmation of Payee</p>
    <div class="cset-box">
      <div class="cs-vprops" role="tablist" aria-label="Payee check state" data-tabs="cop">
        <span class="cs-vlab">State</span>
        ${COP.map(
          (c, i) =>
            `<button class="cs-vbtn" type="button" role="tab" id="cs-ct-${i}" aria-controls="cs-cop-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-cursor="Payee state: ${a(c.tab)}">${c.tab}</button>`,
        ).join("")}
      </div>
      ${COP.map(
        (c, i) =>
          `<div class="cs-variant" role="tabpanel" id="cs-cop-${i}" aria-labelledby="cs-ct-${i}" data-layer="State=${a(c.tab)}" data-kind="variant" data-measure=".v-card"${i === 0 ? "" : " hidden"}>
        <span class="v-prop">${DIAMONDS}State=${c.tab}</span>
        <div class="v-card cs-stage">
          ${shot(c.img, `${c.tab} screen`, { layer: `${c.tab} screen`, zoom: "cop", cls: c.sq ? "sq" : "", w: c.sq ? 560 : W, h: c.sq ? 575 : H })}
          <div class="cs-info"><span class="cs-sev ${c.tone}">${c.sev}</span><h3 class="cs-h3 cs-lg">${c.head}</h3><p>${c.text}</p></div>
        </div>
      </div>`,
      ).join("")}
    </div>
  </div>`,
);

const learn = section(
  "cs-learn",
  "09 · Learning for kids",
  "09 · Learning for kids",
  "BexBuddy, an AI guide that",
  "knows its limits",
  null,
  `<div class="cs-feat">
    <div class="cs-card cs-fcard" id="cs-chat" data-layer="BexBuddy chat" data-kind="frame">
      <h3 class="cs-h3">The best feature is what it won't do</h3>
      <div class="cs-chat">
        <div class="cs-msg u">Who would win, Batman or Superman?</div>
        <div class="cs-msg b">That's a great question, but it's not something I can help you with. My knowledge is limited to finance topics. Maybe you can ask a grown-up for help.</div>
        <div class="cs-msg u">How do I boost my savings?</div>
        <div class="cs-msg b">Answered in plain words.</div>
      </div>
      <p>Typing a keyword shows suggested questions, so there is no blank chat box. Past questions are saved and filtered by topic.</p>
    </div>
    <div class="cs-card cs-fcard" id="cs-buddy-screens" data-layer="BexBuddy screens" data-kind="frame">
      <div class="cs-duo">
        ${shot("buddy-suggest", "Suggested questions after typing a keyword", { layer: "Suggested questions", zoom: "buddy", w: 542 })}
        ${shot("buddy-guardrail", "Off-topic question redirected", { layer: "Off-topic redirect", zoom: "buddy", w: 542 })}
        ${shot("buddy-history", "History filtered by topic", { layer: "History by topic", zoom: "buddy", w: 542 })}
      </div>
    </div>
  </div>`,
);

const system = section(
  "cs-system",
  "10 · The system",
  "10 · The system",
  "Key flows in",
  "light and dark",
  "One component library for both apps: top bar, input, button, PIN pad and option control, designed in light and dark.",
  `<div class="cset cs-mode" id="cs-mode" data-layer="Appearance" data-kind="component" data-measure=".cset-box">
    <p class="cset-label">${DIAMONDS}Appearance</p>
    <div class="cset-box">
      <div class="cs-vprops" role="group" aria-label="Appearance of the screens">
        <span class="cs-vlab">Mode</span>
        ${MODES.map(
          (m, i) =>
            `<button class="cs-vbtn" type="button" id="cs-mt-${m.id}" aria-pressed="${i === 0}" data-mode="${m.id}" data-cursor="Screens mode: ${m.name}">${m.name}</button>`,
        ).join("")}
      </div>
      ${MODES.map(
        (m, i) =>
          `<div class="cs-variant" id="cs-mode-${m.id}" data-layer="Mode=${m.name}" data-kind="variant" data-measure=".v-card"${i === 0 ? "" : " hidden"}>
        <span class="v-prop">${DIAMONDS}Mode=${m.name}</span>
        <div class="v-card cs-modeg">
          ${m.shots
            .map(
              ([f, alt, cap]) =>
                `<figure class="cs-fig">${shot(f, alt, { layer: `${alt}`, zoom: "mode-" + m.id })}<figcaption>${cap}</figcaption></figure>`,
            )
            .join("")}
        </div>
      </div>`,
      ).join("")}
    </div>
  </div>`,
);

const outcome = `<section class="contact cs-close" id="cs-outcome" data-layer="Outcome" data-kind="frame" aria-labelledby="cs-outcome-h">
  <div class="cs-wrap">
    <p class="cs-close-lab">${GRID}Outcome</p>
    <h2 id="cs-outcome-h" class="big-title contact-head"><span class="ti-sans">It shipped, and </span><span class="ti-serif">families stayed.</span></h2>
    <div class="cs-nums">
      <div class="cs-n">${stat(68, "+", "%")}<p>overall user activity</p></div>
      <div class="cs-n">${stat(47, "+", "%")}<p>Junior ISA and CTF adoption</p></div>
      <div class="cs-n">${stat(50, "", "K+")}<p>downloads driven by the redesign</p></div>
    </div>
    <div class="cs-closer">
      <a class="gl-all cs-cta" href="/" data-return="fr-bexcard" data-cursor="Back to the portfolio"><span>Back to the portfolio</span><span class="gl-all-go" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></span></a>
      <p class="cs-foot">Bex app redesign · Product design case study · Screens use sample data</p>
    </div>
  </div>
</section>`;

/* ---------- Layers panel ---------- */
type Row = { id: string; name: string; kind: Kind; depth: 0 | 1 | 2 };
const LAYERS: Row[] = [
  { id: "cs-hero", name: "Hero", kind: "frame", depth: 0 },
  { id: "sel", name: "Bex, for families.", kind: "text", depth: 1 },
  { id: "cs-lede", name: "Summary", kind: "text", depth: 1 },
  { id: "cs-fan", name: "Redesigned screens", kind: "image", depth: 1 },
  { id: "cs-impact", name: "Impact", kind: "frame", depth: 0 },
  { id: "cs-stat-1", name: "Overall activity", kind: "frame", depth: 1 },
  { id: "cs-stat-2", name: "Kids' savings", kind: "frame", depth: 1 },
  { id: "cs-stat-3", name: "Reach", kind: "frame", depth: 1 },
  { id: "cs-about", name: "Role and team", kind: "frame", depth: 0 },
  { id: "cs-role-1", name: "My role", kind: "frame", depth: 1 },
  { id: "cs-role-2", name: "Worked with", kind: "frame", depth: 1 },
  { id: "cs-role-3", name: "Timeline", kind: "frame", depth: 1 },
  { id: "cs-problem", name: "01 · The problem", kind: "frame", depth: 0 },
  { id: "cs-p-1", name: "Two users, one dependency", kind: "frame", depth: 1 },
  { id: "cs-p-2", name: "What was happening", kind: "frame", depth: 1 },
  { id: "cs-p-3", name: "Problem statement", kind: "frame", depth: 1 },
  { id: "cs-hmw", name: "How might we", kind: "frame", depth: 1 },
  { id: "cs-research", name: "02 · Research", kind: "frame", depth: 0 },
  { id: "cs-journey", name: "Family journey", kind: "frame", depth: 1 },
  { id: "cs-bench", name: "Benchmark", kind: "frame", depth: 1 },
  { id: "cs-personas", name: "Proto-personas", kind: "frame", depth: 1 },
  { id: "cs-approach", name: "03 · Approach", kind: "frame", depth: 0 },
  { id: "cs-rules", name: "Four rules", kind: "frame", depth: 1 },
  { id: "cs-two", name: "04 · Two apps, one product", kind: "frame", depth: 0 },
  { id: "cs-pair", name: "Parent and child apps", kind: "frame", depth: 1 },
  { id: "cs-linking", name: "05 · Linking a child", kind: "frame", depth: 0 },
  { id: "cs-link", name: "Linking a child", kind: "frame", depth: 1 },
  { id: "cs-money", name: "06 · Adding money", kind: "frame", depth: 0 },
  { id: "cs-scene", name: "Typing vs tapping", kind: "frame", depth: 1 },
  { id: "cs-topups", name: "Top-up screens", kind: "frame", depth: 1 },
  { id: "cs-save", name: "07 · Saving for later", kind: "frame", depth: 0 },
  { id: "cs-jisa", name: "Junior ISA and CTF screens", kind: "frame", depth: 1 },
  { id: "cs-send", name: "08 · Sending money out", kind: "frame", depth: 0 },
  { id: "cs-cop", name: "Confirmation of Payee", kind: "component", depth: 1 },
  ...COP.map((c, i): Row => ({ id: `cs-cop-${i}`, name: `State=${c.tab}`, kind: "variant", depth: 2 })),
  { id: "cs-learn", name: "09 · Learning for kids", kind: "frame", depth: 0 },
  { id: "cs-chat", name: "BexBuddy chat", kind: "frame", depth: 1 },
  { id: "cs-buddy-screens", name: "BexBuddy screens", kind: "frame", depth: 1 },
  { id: "cs-system", name: "10 · The system", kind: "frame", depth: 0 },
  { id: "cs-mode", name: "Appearance", kind: "component", depth: 1 },
  ...MODES.map((m): Row => ({ id: `cs-mode-${m.id}`, name: `Mode=${m.name}`, kind: "variant", depth: 2 })),
  { id: "cs-outcome", name: "Outcome", kind: "frame", depth: 0 },
];

const layerRow = (r: Row) =>
  `<a class="ly d${r.depth}${r.depth === 0 ? " top" : ""}${r.kind === "component" || r.kind === "variant" ? " comp" : ""}" href="#${r.id}" data-target="${r.id}"><span class="ic" aria-hidden="true">${ICON[r.kind]}</span><span class="lt">${a(r.name)}</span></a>`;

const layersPanel = `<aside class="ui panel panel-l" aria-label="Page outline">
  <div class="p-head"><span class="p-file">Yashita’s portfolio</span><span class="p-sub">Case study · BexCard</span></div>
  <p class="p-title">Layers</p>
  <nav class="layers">
    ${LAYERS.map(layerRow).join("\n    ")}
  </nav>
</aside>`;

/* ---------- screen viewer (click a screen to enlarge) ---------- */
const viewer = `<div class="ui lightbox cs-viewer" id="cs-viewer" role="dialog" aria-modal="true" aria-label="Screen viewer" hidden>
  <button class="lb-btn lb-close" type="button" aria-label="Close screen viewer"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
  <button class="lb-btn lb-nav lb-prev" type="button" aria-label="Previous screen"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <img class="lb-img" alt="">
  <div class="lb-cap" aria-live="polite"><span class="lb-name"></span><span class="lb-count"></span></div>
  <button class="lb-btn lb-nav lb-next" type="button" aria-label="Next screen"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
</div>`;

/* ---------- the top bar's back link ---------- */
const backLink = `<a class="tgl cs-back" href="/" data-return="fr-bexcard" data-cursor="Back to the portfolio" aria-label="Back to the portfolio"><span class="cs-back-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="tgl-label">Portfolio</span></a><span class="tb-sep" aria-hidden="true"></span>`;

export const bexMarkup = [
  `<main class="cs" id="cs-top">`,
  hero,
  marquee,
  impact,
  about,
  problem,
  research,
  approach,
  two,
  linking,
  money,
  save,
  send,
  learn,
  system,
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
  if (!bexMarkup.includes(`id="${r.id}"`)) throw new Error(`bexcard-markup: Layers row "${r.name}" points at missing #${r.id}`);
}
