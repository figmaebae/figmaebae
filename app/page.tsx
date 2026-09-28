import { markup } from "@/lib/markup";
import { CanvasClient } from "@/components/canvas-client";

export default function Home() {
  return (
    <>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: markup }} />
      <CanvasClient />
    </>
  );
}
