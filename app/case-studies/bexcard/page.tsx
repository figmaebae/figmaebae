import type { Metadata } from "next";
import { bexMarkup } from "@/lib/bexcard-markup";
import { BexCardClient } from "@/components/bexcard-client";
import { AnalyticsClient } from "@/components/analytics-client";
import "./case-study.css";

const title = "BexCard case study: redesigning a family money app";
const description =
  "How I redesigned Bex, a UK prepaid card and money app for kids and parents, as the UI/UX designer on a 3-month redesign: linking a child, open banking top-ups, safer payments, a Junior ISA parents actually open and an AI guide for kids. +68% activity, +47% savings adoption, 50K+ downloads.";
const url = "/case-studies/bexcard";

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
  about: "UI/UX design of a UK family money app (prepaid card, Junior ISA, open banking)",
  author: { "@type": "Person", name: "Yashita", url: "https://figmaebae.com" },
};

export default function BexCardCaseStudy() {
  return (
    <>
      {/* The root layout starts every page in the home page's "intro" state (scroll locked, animations paused).
          This page has no intro, so undo that from the first paint instead of waiting for the script. */}
      <style>{"html.intro{overflow:auto}html.intro-hold *,html.intro-hold *::before,html.intro-hold *::after{animation-play-state:running!important}"}</style>
      {/* The case study opens with the Layers + Design panels closed (the Inspect toggle still opens them). Set before first paint so they don't flash. */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.dataset.inspect="off"' }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: bexMarkup }} />
      <BexCardClient />
      <AnalyticsClient />
    </>
  );
}
