// Sends every click on the site to Firebase Analytics as a "ui_click" event, labelled
// using the same attributes the canvas already relies on for its Figma-style inspector
// (data-cursor, data-layer, data-kind — see lib/canvas.js), so the label reported here
// is the same friendly name the custom cursor already shows for that element.
import { logEvent, type Analytics } from "firebase/analytics";

declare global {
  interface Window {
    __clickTrackingInit?: boolean;
  }
}

function text(el: Element): string {
  return (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 100);
}

function kindOf(el: Element): string {
  return el.getAttribute("data-kind") || (el.tagName === "A" ? "link" : el.tagName === "BUTTON" ? "button" : "element");
}

function describeTarget(el: Element): { label: string; kind: string } {
  const withCursor = el.closest("[data-cursor]");
  if (withCursor) return { label: withCursor.getAttribute("data-cursor") || "", kind: kindOf(withCursor) };
  const withLayer = el.closest("[data-layer]");
  if (withLayer) return { label: withLayer.getAttribute("data-layer") || "", kind: kindOf(withLayer) };
  const link = el.closest("a[href]");
  if (link) return { label: text(link) || "link", kind: "link" };
  const btn = el.closest("button,[role='button']");
  if (btn) return { label: text(btn) || "button", kind: "button" };
  return { label: el.tagName.toLowerCase(), kind: "element" };
}

/** Attaches one document-wide click listener (guarded so React Strict Mode's double
 *  mount, like initCanvas's own guard, can't attach it twice) that reports every click
 *  on the page as a "ui_click" event — this is on top of the page_view / session_start
 *  events Analytics already logs automatically once it's initialized. */
export function initClickTracking(analytics: Analytics) {
  if (typeof window === "undefined" || window.__clickTrackingInit) return;
  window.__clickTrackingInit = true;
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (!el) return;
      const { label, kind } = describeTarget(el);
      const link = el.closest("a[href]") as HTMLAnchorElement | null;
      const withId = el.closest("[id]") as HTMLElement | null;
      logEvent(analytics, "ui_click", {
        element_label: label,
        element_kind: kind,
        element_id: withId ? withId.id : undefined,
        link_url: link ? link.href : undefined,
        page_path: location.pathname,
      });
    },
    { capture: true, passive: true }
  );
}
