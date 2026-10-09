import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { experience, type Role } from "../content";
import { ease } from "../lib/hooks";
import { TiltCard } from "../components/motion";
import { SectionHeading, cx } from "../components/ui";

const ACCENT: Record<Role["accent"], { dot: string; soft: string; text: string; glow: string; bar: string }> = {
  violet: { dot: "bg-violet", soft: "bg-violet-soft", text: "text-violet", glow: "from-violet/25", bar: "from-violet to-fuchsia" },
  sky: { dot: "bg-sky", soft: "bg-sky-soft", text: "text-sky", glow: "from-sky/25", bar: "from-sky to-violet" },
  teal: { dot: "bg-teal", soft: "bg-teal-soft", text: "text-teal", glow: "from-teal/25", bar: "from-teal to-sky" },
};

/** Two-letter monogram from the company name (e.g. LofiStack → LS). */
const monogram = (name: string) => (name.match(/[A-Z]/g)?.join("") || name).slice(0, 2).toUpperCase();

function RoleCard({ r, i }: { r: Role; i: number }) {
  const a = ACCENT[r.accent];
  return (
    <motion.li
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease, delay: 0.12 + i * 0.12 }}
      className="relative pl-12 lg:pl-0 lg:pt-14"
    >
      {/* node on the timeline */}
      <span aria-hidden className="absolute left-[11px] top-8 grid size-[22px] place-items-center rounded-full border border-line-strong bg-white lg:left-8 lg:top-[13px]">
        <span className={cx("size-2.5 rounded-full", a.dot)} />
        <span className={cx("pulse-ring absolute inset-0 rounded-full opacity-40", a.dot)} />
      </span>

      <TiltCard max={6} className="rounded-[26px]">
        <article className="surface-lg group relative h-full overflow-hidden rounded-[26px] p-7 sm:p-8" style={{ transform: "translateZ(0)" }}>
          <div aria-hidden className={cx("pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100", a.glow)} />
          <div aria-hidden className={cx("absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r transition-transform duration-700 group-hover:scale-x-100", a.bar)} />

          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-[12px] font-semibold tracking-[0.14em] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
            <span aria-hidden className={cx("grid size-12 place-items-center rounded-2xl font-display text-[16px] font-bold tracking-[-0.02em]", a.soft, a.text)} style={{ transform: "translateZ(30px)" }}>
              {monogram(r.company)}
            </span>
          </div>

          <h3 className="mt-10 font-display text-[clamp(1.5rem,2.4vw,1.95rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink" style={{ transform: "translateZ(24px)" }}>
            {r.role}
          </h3>
          <p className="mt-3 flex items-center gap-2.5 text-[15px] font-medium text-ink-2">
            <span aria-hidden className={cx("h-px w-6", a.dot)} />
            <span className="sr-only">at </span>
            {r.company}
          </p>
        </article>
      </TiltCard>
    </motion.li>
  );
}

export function Experience() {
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  // the timeline draws itself as the list scrolls through the viewport
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 85%", "end 55%"] });
  const draw = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 90, damping: 24 });
  const line = reduced ? 1 : draw;

  return (
    <section id="experience" aria-label="Work experience" className="section">
      <div className="shell">
        <SectionHeading index="02" kicker="Experience" title="Roles behind" accent="the work." sub="Where I've built my experience across creative, IT support and automation." />

        <ol ref={listRef} className="relative mt-14 grid gap-5 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {/* timeline rail: vertical on mobile, horizontal on desktop */}
          <span aria-hidden className="absolute bottom-6 left-[21px] top-8 w-px bg-line-strong lg:hidden" />
          <motion.span aria-hidden className="absolute bottom-6 left-[21px] top-8 w-px origin-top bg-gradient-to-b from-violet via-sky to-teal lg:hidden" style={{ scaleY: line }} />
          <span aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-line-strong lg:block" />
          <motion.span aria-hidden className="absolute left-0 right-0 top-6 hidden h-px origin-left bg-gradient-to-r from-violet via-sky to-teal lg:block" style={{ scaleX: line }} />

          {experience.map((r, i) => <RoleCard key={r.company} r={r} i={i} />)}
        </ol>
      </div>
    </section>
  );
}
