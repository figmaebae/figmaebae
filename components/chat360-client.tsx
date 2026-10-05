"use client";

import { useEffect } from "react";
import { initCanvas } from "@/lib/canvas";
import { initChat360 } from "@/lib/chat360";

export function Chat360Client() {
  useEffect(() => {
    // The root layout locks scrolling for the home page's opening animation; this page has none.
    document.documentElement.classList.remove("intro", "intro-hold");
    initCanvas();
    initChat360();
  }, []);
  return null;
}
