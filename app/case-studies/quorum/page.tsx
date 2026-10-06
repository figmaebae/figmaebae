import type { Metadata } from "next";
import { quorumMarkup } from "@/lib/quorum-markup";
import { QuorumClient } from "@/components/quorum-client";
import { AnalyticsClient } from "@/components/analytics-client";
// The shared case-study layout and widgets (cs-) live in the BexCard stylesheet and the c3- helpers (tables, tabs,
// browser frames, rows) in the Chat360 one; this page only adds its own (q-).
import "../bexcard/case-study.css";
import "../chat360/case-study.css";
import "./case-study.css";

const title = "Quorum case study: designing an ERP for Indian small businesses";
const description =
  "How I designed Quorum, an ERP for Indian SMEs, end to end as the solo product designer: competitor research, information architecture, procure-to-pay flows, seven design decisions, responsive screens for mobile, tablet and desktop, and the marketing website.";
const url = "/case-studies/quorum";

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
  about: "Product design of a B2B SaaS ERP: procurement, inventory, orders, bookings and approvals",
  author: { "@type": "Person", name: "Yashita", url: "https://figmaebae.com" },
};

export default function QuorumCaseStudy() {
  return (
    <>
      {/* The root layout starts every page in the home page's "intro" state (scroll locked, animations paused).
          This page has no intro, so undo that from the first paint instead of waiting for the script. */}
      <style>{"html.intro{overflow:auto}html.intro-hold *,html.intro-hold *::before,html.intro-hold *::after{animation-play-state:running!important}"}</style>
      {/* The case study opens with the Layers + Design panels closed (the Inspect toggle still opens them). Set before first paint so they don't flash. */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.dataset.inspect="off"' }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: quorumMarkup }} />
      <QuorumClient />
      <AnalyticsClient />
    </>
  );
}
