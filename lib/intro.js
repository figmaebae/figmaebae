// @ts-nocheck
// Opening slide: "20" + a year strip that scrolls 22 -> 26, a line that reads
// "A journey through years of design", then the opening screen wipes away to the homepage.
// Timings and eases mirror the reference intro (GSAP timeline, power4.inOut strip, power3.out lines).
export async function runIntro(onHandoff) {
  if (window.__introStarted) return;
  window.__introStarted = true;

  const root = document.documentElement;
  const el = document.getElementById("intro");
  const finish = () => {
    root.classList.remove("intro", "intro-hold");
    if (el) el.style.display = "none";
    window.__introDone = true;
    document.dispatchEvent(new CustomEvent("introdone"));
  };

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    onHandoff();
    return;
  }

  let gsap;
  try {
    gsap = (await import("gsap")).gsap;
  } catch (e) {
    finish();
    onHandoff();
    return;
  }

  const q = (s) => el.querySelector(s);
  const qa = (s) => [].slice.call(el.querySelectorAll(s));
  // global speed factor: 1 = the original ~5.9s intro, 0.853 = ~5s (same on every screen size)
  const n = 0.853;

  const bg = q("[data-intro-bg]");
  const bar = q("[data-intro-bar]");
  const yearRow = q("[data-year-row]");
  const strip = q("[data-year-strip]");
  const cells = qa(".ys-cell");
  const chars = qa("[data-year-start-text] .ch");
  const journey = q("[data-journey]");
  const journeyLines = qa("[data-journey] [data-line]");
  const steps = Math.max(0, cells.length - 1);
  const cellH = () => (cells[0] ? cells[0].getBoundingClientRect().height : 0) || 1;

  gsap.set(strip, { y: 0, force3D: true });
  gsap.set(bar, { scaleX: 0, transformOrigin: "0% 100%", force3D: true });
  gsap.set(bg, { clipPath: "inset(0px 0px 0px 0px)" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.addLabel("stripGo", 0);
  tl.set(yearRow, { opacity: 1, force3D: true }, "stripGo");

  // 1. "20" and "22" rise in, character by character
  const B = gsap.timeline();
  B.fromTo(
    chars,
    { yPercent: 102, opacity: 1 },
    { yPercent: 0, opacity: 1, duration: 1.7 * n, ease: "power4.inOut", force3D: true, stagger: 0.07 * n }
  );
  const C = B.duration();
  tl.add(B, "stripGo");

  // 2. the two-digit strip scrolls 22 -> 26 while a progress bar fills along the bottom
  const M = 1.9; // fixed seconds (1.6s -> 3.5s), independent of the global speed factor
  tl.to(strip, { y: () => -steps * cellH(), duration: M, ease: "power4.inOut", force3D: true }, "stripGo+=" + C);
  tl.to(bar, { scaleX: 1, duration: M, ease: "power4.inOut", force3D: true }, "stripGo+=" + C);

  // 3. the journey line rises in with the year
  tl.set(journey, { opacity: 1 }, "stripGo");
  tl.fromTo(
    journeyLines,
    { yPercent: 102, opacity: 1, force3D: true },
    { yPercent: 0, opacity: 1, duration: 1.7 * n, ease: "power3.out", stagger: 0.07 * n, force3D: true },
    "stripGo"
  );

  // 4. hand-off: the year slides up and out, the journey line drops out
  tl.addLabel("handoff", "stripGo+=" + Math.max(0.06, C + M - 0.42 * n));
  const I = 1.78 * n;
  tl.to(yearRow, { y: () => -(yearRow.offsetHeight || 1), duration: I, ease: "power4.inOut", force3D: true }, "handoff");
  tl.fromTo(
    journeyLines,
    { yPercent: 0, opacity: 1 },
    {
      yPercent: 102,
      opacity: 1,
      duration: 1.7 * n,
      ease: "power3.out",
      stagger: { each: 0.07 * n, from: "end" },
      force3D: true,
      immediateRender: false,
      onComplete: () => gsap.set(journey, { opacity: 0 }),
    },
    "handoff"
  );

  // 5. the homepage starts animating in beneath the slide
  tl.call(
    () => {
      root.classList.remove("intro-hold");
      onHandoff();
    },
    [],
    "handoff+=" + I * 0.5
  );

  // 6. the purple screen wipes upward, uncovering the homepage
  const end = "stripGo+=" + (C + M);
  tl.set(bg, { clipPath: "inset(0px 0px 8px 0px)" }, end);
  tl.set(bar, { display: "none" }, end);
  tl.fromTo(
    bg,
    { clipPath: "inset(0px 0px 8px 0px)" },
    {
      clipPath: () => "inset(0px 0px " + window.innerHeight + "px 0px)",
      duration: 1.1 * n,
      ease: "power2.inOut",
      immediateRender: false,
    },
    end
  );

  tl.eventCallback("onComplete", () => {
    finish();
    window.removeEventListener("resize", onResize);
  });

  let raf = 0;
  function onResize() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const t = tl.time();
      tl.invalidate();
      tl.time(t, false);
    });
  }
  window.addEventListener("resize", onResize, { passive: true });
}
