// Firebase Analytics (GA4). The values below are the public web-app config Firebase
// generates for this project — they identify the project, they are not secret keys,
// and Firebase's own docs say they're safe to ship in client code. Access to the data
// itself is controlled from the Firebase console, not by hiding this object.
//
// The Firebase SDK is loaded via dynamic import() (same pattern lib/intro.js already
// uses for gsap) so it never sits in the initial page bundle — it's fetched, in its
// own chunk, only after the page has mounted.
import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCvptc_WJpf0hDoCgZdSJ7xCMINEIMUtl4",
  authDomain: "figmaebae-8c3e0.firebaseapp.com",
  projectId: "figmaebae-8c3e0",
  storageBucket: "figmaebae-8c3e0.firebasestorage.app",
  messagingSenderId: "149758722640",
  appId: "1:149758722640:web:dd14deb00f2f4f46aa0755",
  measurementId: "G-MQJFBV8N2P",
};

let analyticsPromise: Promise<Analytics | null> | null = null;

/** Lazily initializes Firebase + Analytics, once, only in the browser, and only when the
 *  browser actually supports it (private/incognito windows, bots and some older browsers
 *  don't have the storage Analytics needs — isSupported() catches all of that safely). */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = Promise.all([import("firebase/app"), import("firebase/analytics")])
      .then(async ([{ initializeApp }, { getAnalytics, isSupported }]) => {
        const ok = await isSupported();
        if (!ok) return null;
        const app = initializeApp(firebaseConfig);
        return getAnalytics(app);
      })
      .catch(() => null);
  }
  return analyticsPromise;
}
