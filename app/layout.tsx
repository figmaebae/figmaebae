import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Caveat, Be_Vietnam_Pro, Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-caveat",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-vietnam",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-serif-italic",
  display: "swap",
});

const title = "Yashita, Senior UI/UX Designer";
const description =
  "Senior UI/UX Designer with 4 years of experience creating user-centered design solutions that enhance user experiences and drive business results.";
const siteUrl = "https://figmaebae.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "Yashita",
    "UI/UX Designer",
    "UI Designer",
    "UX Designer",
    "Product Designer",
    "Design Systems",
    "Figma Designer",
    "Portfolio",
  ],
  authors: [{ name: "Yashita", url: siteUrl }],
  creator: "Yashita",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: { title, description, url: siteUrl, siteName: title, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
};

// Structured data: a Person entity (so search engines can associate this page with
// Yashita by name, job title and social profiles) and a WebSite entity for the page
// itself. Rendered as plain JSON in the initial server HTML — no client JS needed.
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yashita",
  jobTitle: "Senior UI/UX Designer",
  description,
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  email: "mailto:figmaebae@gmail.com",
  sameAs: [
    "https://www.linkedin.com/in/yashita-sharma-6721bb163/",
    "https://x.com/Figmaebae",
    "https://medium.com/@figmaebae",
  ],
  worksFor: { "@type": "Organization", name: "WASP", url: "https://waspmobile.com/" },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: title,
  url: siteUrl,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f7f5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${caveat.variable} ${beVietnamPro.variable} ${instrumentSerif.variable} intro intro-hold`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <noscript>
          <style>{"html.intro{overflow:auto}#intro{display:none}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
