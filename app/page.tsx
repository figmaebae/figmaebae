import { markup } from "@/lib/markup";
import { CanvasClient } from "@/components/canvas-client";
import { AnalyticsClient } from "@/components/analytics-client";

export default function Home() {
  return (
    <>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: markup }} />
      <CanvasClient />
      <AnalyticsClient />
    </>
  );
}
