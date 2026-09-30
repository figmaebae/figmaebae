"use client";

import { useEffect } from "react";

export function AnalyticsClient() {
  useEffect(() => {
    let cancelled = false;
    import("@/lib/firebase")
      .then(({ getFirebaseAnalytics }) => getFirebaseAnalytics())
      .then((analytics) => {
        if (cancelled || !analytics) return;
        return import("@/lib/click-tracking").then(({ initClickTracking }) => initClickTracking(analytics));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
