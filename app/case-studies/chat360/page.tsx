import type { Metadata } from "next";
import { chatMarkup } from "@/lib/chat360-markup";
import { Chat360Client } from "@/components/chat360-client";
import { AnalyticsClient } from "@/components/analytics-client";
// The shared case-study layout and widgets (cs- classes) live in the BexCard stylesheet; this page only adds its own (c3-).
import "../bexcard/case-study.css";
import "./case-study.css";

const title = "Chat360 case study: redesigning a B2B SaaS homepage";
const description =
  "How I redesigned Chat360's homepage as the solo UI/UX designer in one month: an outcome-led message, one demo CTA, use cases by industry and customer proof before the ask. +42% demo bookings and a 68% lower bounce rate.";
const url = "/case-studies/chat360";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "article", siteName: "Yashita, Senior UI/UX Designer", locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: title,
  description,
  url: `https://figmaebae.com${url}`,
  inLanguage: "en",
  about: "UX research and UI design of a B2B SaaS homepage (conversational AI platform)",
  author: { "@type": "Person", name: "Yashita", url: "https://figmaebae.com" },
};

export default function Chat360CaseStudy() {
  return (
    <>
      {/* The root layout starts every page in the home page's "intro" state (scroll locked, animations paused).
          This page has no intro, so undo that from the first paint instead of waiting for the script. */}
      <style>{"html.intro{overflow:auto}html.intro-hold *,html.intro-hold *::before,html.intro-hold *::after{animation-play-state:running!important}"}</style>
      {/* The case study opens with the Layers + Design panels closed (the Inspect toggle still opens them). Set before first paint so they don't flash. */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.dataset.inspect="off"' }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: chatMarkup }} />
      <Chat360Client />
      <AnalyticsClient />
    </>
  );
}
