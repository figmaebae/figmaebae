"use client";

import { useEffect } from "react";
import { initCanvas } from "@/lib/canvas";
import { initBexCard } from "@/lib/bexcard";

export function BexCardClient() {
  useEffect(() => {
    // The root layout locks scrolling for the home page's opening animation; this page has none.
    document.documentElement.classList.remove("intro", "intro-hold");
    initCanvas();
    initBexCard();
  }, []);
  return null;
}
