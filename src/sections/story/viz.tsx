import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ease } from "../../lib/hooks";
import { cx } from "../../components/ui";

/** Measures an element's content box (for pixel-accurate SVG connectors). */
export function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

/** Unbounded tick counter while running (one state update per tick, never per frame). */
export function useTicker(ms: number, running: boolean) {
  const [tick, setTick] = useState(0);
  useLayoutEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTick(t => t + 1), ms);
    return () => window.clearInterval(id);
  }, [ms, running]);
  return tick;
}

export type Pt = { x: number; y: number };

export const curveH = (a: Pt, b: Pt) => {
  const mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
};
export const curveV = (a: Pt, b: Pt) => {
  const my = (a.y + b.y) / 2;
  return `M${a.x} ${a.y} C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
};

/** Connector: quiet base line + a bright stroke that draws when lit. */
export function Edge({ d, lit, color = "url(#a-viz-grad)", delay = 0, dashed, width = 2 }: { d: string; lit: boolean; color?: string; delay?: number; dashed?: boolean; width?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke="rgb(23 21 31 / 0.13)" strokeWidth={1.25} strokeDasharray={dashed ? "3 5" : undefined} />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
        transition={{ pathLength: { duration: 0.75, ease, delay }, opacity: { duration: 0.25, delay: lit ? delay : 0 } }}
      />
    </g>
  );
}

/**
 * Shared SVG gradient defs (violet → fuchsia), in user space across the whole
 * box so perfectly straight (zero-width) connectors still get painted.
 */
export function VizDefs({ w, h }: { w: number; h: number }) {
  return (
    <defs>
      <linearGradient id="a-viz-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2={h}>
        <stop offset="0" stopColor="#6d3ce6" />
        <stop offset="1" stopColor="#b5279e" />
      </linearGradient>
      <linearGradient id="a-viz-grad-sky" gradientUnits="userSpaceOnUse" x1={w} y1="0" x2="0" y2={h}>
        <stop offset="0" stopColor="#0f6fb8" />
        <stop offset="1" stopColor="#6d3ce6" />
      </linearGradient>
    </defs>
  );
}

/** Absolutely positioned node, centred on a pixel point. */
export function NodeAt({ at, lit, children, className }: { at: Pt; lit: boolean; children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cx(
        "absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white transition-[border-color,box-shadow] duration-500",
        lit ? "border-violet/45 shadow-[0_14px_30px_-14px_rgb(84_40_196/0.55),0_0_0_4px_rgb(109_60_230/0.08)]" : "border-line shadow-[0_1px_2px_rgb(23_21_31/0.05)]",
        className,
      )}
      style={{ left: at.x, top: at.y }}
      initial={false}
      animate={{ scale: lit ? 1 : 0.97 }}
      transition={{ duration: 0.5, ease }}
    >
      {children}
    </motion.div>
  );
}
