import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------
   Light / dark theme. Light is the default (the OS preference is not
   used); the choice persists in localStorage. index.html applies the
   saved theme before first paint so there is no flash on reload.
   ------------------------------------------------------------------ */

export type Theme = "light" | "dark";
export const THEME_KEY = "mc-theme";
const META_COLOR: Record<Theme, string> = { light: "#fbfbfd", dark: "#0b0a10" };

const listeners = new Set<() => void>();
const read = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

function apply(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.style.colorScheme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLOR[t]);
  try { localStorage.setItem(THEME_KEY, t); } catch { /* private mode: theme still applies for this visit */ }
  listeners.forEach(l => l());
}

/** Switch theme with a soft cross-fade (View Transitions where supported, colour transitions otherwise). */
export function setTheme(t: Theme) {
  if (t === read()) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (reduced) return apply(t);
  if (doc.startViewTransition) { doc.startViewTransition(() => apply(t)); return; }
  const root = document.documentElement;
  root.classList.add("theme-anim");
  apply(t);
  window.setTimeout(() => root.classList.remove("theme-anim"), 500);
}

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(
    cb => { listeners.add(cb); return () => listeners.delete(cb); },
    read,
    () => "light" as Theme,
  );
  return [theme, () => setTheme(theme === "dark" ? "light" : "dark")];
}
