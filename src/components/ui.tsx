import type { ReactNode, SVGProps } from "react";
import { Reveal, SplitText } from "./motion";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ---------------- icons (stroke, 24px grid) ---------------- */

const paths = {
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowUpRight: "M7 17 17 7M8 7h9v9",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6 6 18",
  menu: "M4 8h16M4 16h16",
  check: "M5 12.5 10 17l9-10",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0",
  database: "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M12 8.5l1.2 2.3 2.3 1.2-2.3 1.2L12 15.5l-1.2-2.3L8.5 12l2.3-1.2Z",
  branch: "M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9c0 5-6 4-12 6",
  message: "M4 5h16v11H9l-5 4V5Z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18",
  funnel: "M3 5h18l-7 8v6l-4 2v-8L3 5Z",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 12h.01",
  bolt: "M13 3 4 14h7l-1 7 9-11h-7l1-7Z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  layers: "M12 3 2 8l10 5 10-5-10-5ZM2 13l10 5 10-5M2 18l10 5 10-5",
  cursor: "M5 3l14 7-6 2-2 6-6-15Z",
  play: "M7 5v14l12-7L7 5Z",
  pause: "M8 5v14M16 5v14",
  replay: "M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5",
  image: "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01",
  phone: "M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-4", ...rest }: { name: IconName; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className} {...rest}>
      <path d={paths[name]} />
    </svg>
  );
}

/* ---------------- logo: terminal-prompt wordmark ---------------- */

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cx("inline-flex items-baseline gap-2 font-display text-[19px] leading-none tracking-[-0.02em] text-ink", className)}>
      <span aria-hidden className="font-mono text-[17px] font-bold text-violet">&gt;_</span>
      <span>
        <span className="font-normal">mahfuz</span>
        {!compact && <span className="font-bold">chowdhury</span>}
      </span>
    </span>
  );
}

/* ---------------- section heading ---------------- */

export function SectionHeading({ index, kicker, title, accent, sub, align = "left", className }: { index: string; kicker: string; title: string; accent?: string; sub?: string; align?: "left" | "center"; className?: string }) {
  return (
    <header className={cx("relative z-10 max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Reveal>
        <p className={cx("eyebrow flex items-center gap-3", align === "center" && "justify-center")}>
          <span className="font-semibold text-violet">{index}</span>
          <span className="h-px w-8 bg-ink/15" />
          {kicker}
        </p>
      </Reveal>
      <h2 className="mt-5 text-[clamp(2.2rem,5.2vw,4.2rem)] font-semibold leading-[1] tracking-[-0.035em] text-balance">
        <SplitText text={title} />
        {accent && (
          <>
            {" "}
            <SplitText text={accent} className="text-gradient" delay={0.12} />
          </>
        )}
      </h2>
      {sub && (
        <Reveal delay={0.15}>
          <p className={cx("mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2", align === "center" && "mx-auto")}>{sub}</p>
        </Reveal>
      )}
    </header>
  );
}

/* ---------------- browser frame (for screenshots / mock pages) ---------------- */

export function BrowserFrame({ url = "", children, className, tone = "light" }: { url?: string; children: ReactNode; className?: string; tone?: "light" | "dark" }) {
  return (
    <div className={cx("overflow-hidden rounded-2xl", tone === "dark" ? "bg-[#15131d] ring-1 ring-white/10" : "surface-lg", className)}>
      <div className={cx("flex items-center gap-2 border-b px-4 py-2.5", tone === "dark" ? "border-white/10" : "border-line bg-mist/60")}>
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        {url && (
          <span className={cx("ml-3 min-w-0 flex-1 truncate rounded-md px-3 py-1 text-center font-mono text-[11px]", tone === "dark" ? "bg-white/5 text-white/50" : "bg-white text-ink-3")}>{url}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ---------------- honest labels ---------------- */

/** Small label marking a visual as an illustration (not real client data). */
export function IllustrativeTag({ children = "Illustrative example", className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border border-line bg-white/90 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-3", className)}>
      <span className="size-1.5 rounded-full bg-ink-3/50" />
      {children}
    </span>
  );
}

/** Slot waiting for a real screenshot. */
export function ScreenshotSlot({ label, className, aspect = "aspect-[16/10]" }: { label: string; className?: string; aspect?: string }) {
  return (
    <div className={cx("placeholder-stripes relative grid place-items-center rounded-xl border border-dashed border-line-strong bg-mist/50", aspect, className)}>
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <Icon name="image" className="size-6 text-ink-3" />
        <p className="text-[12.5px] font-medium text-ink-2">{label}</p>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-3">Screenshot coming soon</p>
      </div>
    </div>
  );
}
