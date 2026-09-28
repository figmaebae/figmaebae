import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Yashita, Senior UI/UX Designer";

// Dark-theme tokens, matching html[data-theme="dark"] in app/globals.css
const PAPER = "#151517";
const INK = "#ececea";
const MUTED = "#9b9ba2";
const SEL = "#0d99ff";

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
        {/* "Yashita", boxed like the hero's Figma selection */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            alignSelf: "flex-start",
            marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", position: "relative" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Be Vietnam Pro",
                fontWeight: 600,
                fontSize: 148,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: INK,
                padding: "6px 10px",
              }}
            >
              Yashita
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: `2px solid ${SEL}`,
                borderRadius: 4,
              }}
            />
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
          <div
            style={{
              display: "flex",
              alignSelf: "center",
              marginTop: 14,
              background: SEL,
              color: "#fff",
              fontFamily: "Instrument Sans",
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: "0.01em",
              padding: "6px 12px",
              borderRadius: 6,
            }}
          >
            620 × 178
          </div>
        </div>

        {/* Role line, split sans / serif-italic like the hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 52,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          <div style={{ display: "flex", fontFamily: "Instrument Sans", fontWeight: 500, color: INK }}>
            One designer. Four years.
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontWeight: 400,
              color: MUTED,
              letterSpacing: "0.01em",
            }}
          >
            Every layer of your product.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 100,
            bottom: 56,
            display: "flex",
            fontFamily: "Instrument Sans",
            fontWeight: 500,
            fontSize: 26,
            color: MUTED,
            letterSpacing: "0.02em",
          }}
        >
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
