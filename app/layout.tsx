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

const description =
  "Senior UI/UX Designer with 4 years of experience creating user-centered design solutions that enhance user experiences and drive business results.";

export const metadata: Metadata = {
  metadataBase: new URL("https://figmaebae.com"),
  title: "Yashita, Senior UI/UX Designer",
  description,
  openGraph: { title: "Yashita, Senior UI/UX Designer", description, type: "website" },
  twitter: { card: "summary_large_image", title: "Yashita, Senior UI/UX Designer", description },
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
        <noscript>
          <style>{"html.intro{overflow:auto}#intro{display:none}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
