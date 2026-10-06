import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Quorum case study: Quorum, one login, one stock record. 10 modules, 150+ screens, 3 breakpoints.";

// Dark-theme tokens, same as the home page's share image (app/opengraph-image.tsx)
const PAPER = "#151517";
const INK = "#ececea";
const MUTED = "#9b9ba2";
const SEL = "#0d99ff";

const STATS: [string, string, string][] = [
  ["10", "", "modules"],
  ["150", "+", "screens"],
  ["3", "", "breakpoints"],
];

export default async function OpengraphImage() {
  const fontsDir = path.join(process.cwd(), "assets/og-fonts");
  const [bvp600, isMed, serifItalic] = await Promise.all([
    readFile(path.join(fontsDir, "bvp-600.ttf")),
    readFile(path.join(fontsDir, "is-500.ttf")),
    readFile(path.join(fontsDir, "iserif-italic.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 100px",
          backgroundColor: PAPER,
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,.34) 1.5px, transparent 0)`,
          backgroundSize: "32px 32px",
          fontFamily: "Instrument Sans",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: MUTED, letterSpacing: "0.01em", marginBottom: 30 }}>
          Case study · Product design · ERP for Indian SMEs
        </div>

        {/* "Quorum, one login, one stock record." boxed like the hero's Figma selection */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", alignSelf: "flex-start", marginBottom: 40 }}>
          <div style={{ display: "flex", position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "6px 14px", lineHeight: 1.05, color: INK }}>
              <span style={{ fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: 112, letterSpacing: "-0.03em" }}>Quorum,</span>
              <span style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400, fontSize: 76, letterSpacing: "0.02em" }}>one login, one stock record.</span>
            </div>
            <div style={{ position: "absolute", inset: 0, border: `2px solid ${SEL}`, borderRadius: 4 }} />
            {[
              { top: -5, left: -5 },
              { top: -5, right: -5 },
              { bottom: -5, left: -5 },
              { bottom: -5, right: -5 },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 14,
                  height: 14,
                  background: PAPER,
                  border: `2px solid ${SEL}`,
                  borderRadius: 3,
                  display: "flex",
                  ...pos,
                }}
              />
            ))}
          </div>
        </div>

        {/* the three results */}
        <div style={{ display: "flex", gap: 80, marginTop: 4 }}>
          {STATS.map(([n, suf, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "baseline", color: INK, lineHeight: 1 }}>
                <span style={{ fontFamily: "Be Vietnam Pro", fontWeight: 600, fontSize: 84, letterSpacing: "-0.04em" }}>{n}</span>
                <span style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400, fontSize: 70, color: MUTED }}>{suf}</span>
              </div>
              <div style={{ display: "flex", marginTop: 12, fontSize: 28, fontWeight: 500, color: MUTED }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", right: 100, bottom: 52, display: "flex", fontSize: 28, fontWeight: 500, color: MUTED, letterSpacing: "0.02em" }}>
          figmaebae.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Be Vietnam Pro", data: bvp600, weight: 600, style: "normal" },
        { name: "Instrument Sans", data: isMed, weight: 500, style: "normal" },
        { name: "Instrument Serif", data: serifItalic, weight: 400, style: "italic" },
      ],
    }
  );
}
