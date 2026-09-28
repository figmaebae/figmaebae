"use client";

import { useEffect } from "react";
import { initCanvas } from "@/lib/canvas";
import { runIntro } from "@/lib/intro";

export function CanvasClient() {
  useEffect(() => {
    runIntro(() => initCanvas());
  }, []);
  return null;
}
