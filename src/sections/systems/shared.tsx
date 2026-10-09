import { useEffect, useRef, useState, type ReactNode, type SVGProps } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import type { IconName } from "../../components/ui";
import { cx } from "../../components/ui";

/* ---------- local extra icons (same 24px stroke grid as ui.tsx Icon) ---------- */

const extra = {
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  tag: "M3 12V4h8l10 10-8 8L3 12ZM7.5 7.5h.01",
  split: "M12 4v6M12 10 6 16v4M12 10l6 6v4",
  form: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h3",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2ZM10 21h4",
  kanban: "M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v13h-4z",
  route: "M5 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 6v5a4 4 0 0 0 4 4h6a4 4 0 0 1 4 4",
  send: "M4 12 20 4l-6 16-3-7-7-1Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  chevron: "M9 6l6 6-6 6",
  stop: "M7 7h10v10H7z",
  reply: "M9 14 4 9l5-5M4 9h11a5 5 0 0 1 5 5v6",
} as const;

export type BIconName = keyof typeof extra;

export function BIcon({ name, className = "size-4", ...rest }: { name: BIconName; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className} {...rest}>
      <path d={extra[name]} />
    </svg>
  );
}

/** Icon names from content.ts are plain strings; narrow them to the shared set. */
export const asIcon = (n: string) => n as IconName;

/* ---------- step tints ---------- */

export const tints = {
  violet: { tile: "bg-violet-soft text-violet", dot: "bg-violet", text: "text-violet", hex: "#6d3ce6" },
  sky: { tile: "bg-sky-soft text-sky", dot: "bg-sky", text: "text-sky", hex: "#0f6fb8" },
  fuchsia: { tile: "bg-[#fbe9f7] text-fuchsia dark:bg-[rgb(236_132_220/0.15)]", dot: "bg-fuchsia", text: "text-fuchsia", hex: "#b5279e" },
  teal: { tile: "bg-teal-soft text-teal", dot: "bg-teal", text: "text-teal", hex: "#0b7c74" },
  amber: { tile: "bg-amber-soft text-amber", dot: "bg-amber", text: "text-amber", hex: "#a8550a" },
} as const;
export type Tint = keyof typeof tints;

/* ---------- one-shot demo helper ----------
   Advances `i` from 0 → total once while `active`. Under reduced motion it starts at the final state
   (static), and `replay` / manual changes apply instantly. */
export function useScript(total: number, active: boolean, stepMs: number, startDelay = 500) {
  const reduced = !!useReducedMotion();
  const [i, setI] = useState(reduced ? total : 0);
  useEffect(() => {
    if (!active || reduced || i >= total) return;
    const t = setTimeout(() => setI(v => v + 1), i === 0 ? startDelay : stepMs);
    return () => clearTimeout(t);
  }, [active, reduced, i, total, stepMs, startDelay]);
  const replay = () => setI(reduced ? total : 0);
  return { i, setI, done: i >= total, replay, reduced };
}

/** Ref + in-view flag. */
export function useVisible<T extends Element>(amount = 0.35) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { amount });
  return [ref, inView] as const;
}

/* ---------- small UI atoms for the CRM mocks ---------- */

export function MockButton({ children, onClick, primary, disabled, pressed, className, label }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean; pressed?: boolean; className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={label}
      className={cx(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        primary ? "bg-ink text-white hover:bg-violet-deep" : "border border-line-strong bg-white text-ink hover:border-violet",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Two-option segmented control (radio-like, uses aria-pressed buttons). */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-line bg-mist p-0.5">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cx("rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors", value === o.id ? "bg-white text-ink shadow-[0_1px_2px_rgb(23_21_31/0.12)]" : "text-ink-3 hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function StatusLine({ children, tone = "violet" }: { children: ReactNode; tone?: "violet" | "teal" | "amber" }) {
  const dot = tone === "teal" ? "bg-teal" : tone === "amber" ? "bg-amber" : "bg-violet";
  return (
    <p className="flex min-w-0 items-center gap-2 text-[12.5px] text-ink-2" role="status">
      <span className={cx("size-1.5 shrink-0 rounded-full", dot)} />
      <span className="min-w-0">{children}</span>
    </p>
  );
}
