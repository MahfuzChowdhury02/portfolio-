import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useTransform } from "framer-motion";
import { tech, techGroups, type TechGroup } from "../content";
import { ease } from "../lib/hooks";
import { Glare, Reveal, useTilt } from "../components/motion";
import { cx, SectionHeading } from "../components/ui";

type Filter = TechGroup | "all";
type Tech = (typeof tech)[number];

const filters: { id: Filter; label: string }[] = [{ id: "all", label: "All" }, ...techGroups];

/** Per-group look for the monogram glyph. */
const tone: Record<TechGroup, { glyph: string; soft: string; text: string; label: string }> = {
  web: { glyph: "bg-[linear-gradient(140deg,#8b5cf6,#5428c4)]", soft: "text-violet/[0.07]", text: "text-violet", label: "Web" },
  marketing: { glyph: "bg-[linear-gradient(140deg,#38bdf8,#0f6fb8)]", soft: "text-sky/[0.08]", text: "text-sky", label: "CRM & Ads" },
  ai: { glyph: "bg-[linear-gradient(140deg,#2dd4bf,#0b7c74)]", soft: "text-teal/[0.08]", text: "text-teal", label: "AI & Automation" },
};

/** Force text (not emoji) presentation for symbol glyphs such as ⚙. */
const glyph = (m: string) => (/^[☀-⟿]$/.test(m) ? `${m}︎` : m);

function Tile({ t, i, ref }: { t: Tech; i: number; ref?: React.Ref<HTMLLIElement> }) {
  const reduced = useReducedMotion();
  const tilt = useTilt(9);
  const tn = tone[t.group];
  // inner layers drift with the tilt for parallax depth
  const gx = useTransform(tilt.sx, v => (reduced ? 0 : (v - 0.5) * 14));
  const gy = useTransform(tilt.sy, v => (reduced ? 0 : (v - 0.5) * 14));
  const noteId = `stack-note-${i}`;

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
      transition={{ duration: 0.55, ease, layout: { duration: 0.6, ease } }}
      className="[perspective:900px]"
    >
      <motion.div
        ref={tilt.ref}
        onPointerMove={tilt.onMove}
        onPointerLeave={tilt.onLeave}
        tabIndex={0}
        aria-describedby={noteId}
        style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformStyle: "preserve-3d" }}
        className="group relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-[22px] border border-line bg-white p-4 shadow-[0_1px_2px_rgb(23_21_31/0.04),0_18px_40px_-28px_rgb(23_21_31/0.3)] transition-[border-color,box-shadow] duration-500 hover:border-violet/25 hover:shadow-[0_1px_2px_rgb(23_21_31/0.04),0_30px_60px_-30px_rgb(48_27_120/0.45)] focus-visible:border-violet/40 sm:aspect-[4/3] sm:p-5 lg:aspect-[16/11]"
      >
        {/* oversized watermark monogram (back layer) */}
        <motion.span
          aria-hidden
          className={cx("pointer-events-none absolute -bottom-5 -right-2 select-none font-display font-bold leading-none tracking-[-0.06em]", t.mono.length >= 3 ? "text-[72px] sm:text-[84px]" : t.mono.length === 2 ? "text-[96px] sm:text-[112px]" : "text-[110px] sm:text-[130px]", tn.soft)}
          style={{ x: gx, y: gy }}
        >
          {glyph(t.mono)}
        </motion.span>

        <div className="relative flex items-start justify-between" style={{ transform: "translateZ(30px)" }}>
          <span className={cx("grid size-12 place-items-center rounded-2xl font-display text-[17px] font-bold tracking-[-0.03em] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_10px_20px_-10px_rgb(23_21_31/0.5)] sm:size-14 sm:text-[19px]", tn.glyph)}>
            <span aria-hidden>{glyph(t.mono)}</span>
          </span>
          <span className={cx("hidden font-mono text-[10px] uppercase tracking-[0.14em] sm:block", tn.text)}>{tn.label}</span>
        </div>

        <div className="relative" style={{ transform: "translateZ(20px)" }}>
          <h3 className="font-display text-[17px] font-semibold leading-tight tracking-[-0.02em] sm:text-[20px]">{t.name}</h3>
          <div className="relative mt-1 h-[2.6em] text-[12.5px] leading-snug sm:h-[1.4em] sm:text-[13px]">
            <p
              id={noteId}
              className="text-ink-2 transition-all duration-500 [transition-timing-function:var(--ease-out-expo)] sm:absolute sm:inset-x-0 sm:top-0 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100 [@media(hover:none)]:!translate-y-0 [@media(hover:none)]:!opacity-100"
            >
              {t.note}
            </p>
          </div>
        </div>
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <Glare x={tilt.glareX} y={tilt.glareY} />
        </span>
      </motion.div>
    </motion.li>
  );
}

export function TechStack() {
  const [filter, setFilter] = useState<Filter>("all");
  const list = filter === "all" ? tech : tech.filter(t => t.group === filter);
  const count = (f: Filter) => (f === "all" ? tech.length : tech.filter(t => t.group === f).length);

  return (
    <section id="stack" aria-label="Tech stack" className="section isolate overflow-x-clip">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 top-10 size-[560px] rounded-full bg-[radial-gradient(circle,rgb(15_111_184/0.07),transparent_65%)]" />
        <div className="absolute -left-40 bottom-10 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(109_60_230/0.07),transparent_65%)]" />
      </div>
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="10"
            kicker="Tech stack"
            title="A focused stack,"
            accent="used together."
            sub="Front-end tools for the web, CRM and ad platforms for growth, and AI and automation to connect it all."
          />
          <Reveal delay={0.1} className="lg:shrink-0 lg:pb-2">
            <div role="group" aria-label="Filter technologies" className="relative inline-flex max-w-full flex-wrap gap-1 rounded-[20px] lg:flex-nowrap border border-line bg-white/80 p-1.5 shadow-[0_10px_30px_-20px_rgb(23_21_31/0.3)] backdrop-blur sm:rounded-full">
              <LayoutGroup id="a-stack-filter">
                {filters.map(f => {
                  const on = f.id === filter;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setFilter(f.id)}
                      className={cx("relative inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors duration-300", on ? "text-white" : "text-ink-2 hover:text-ink")}
                    >
                      {on && <motion.span layoutId="a-stack-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease }} />}
                      <span className="relative">{f.label}</span>
                      <span className={cx("relative font-mono text-[10.5px]", on ? "text-white/55" : "text-ink-3")}>{String(count(f.id)).padStart(2, "0")}</span>
                    </button>
                  );
                })}
              </LayoutGroup>
            </div>
          </Reveal>
        </div>

        <p className="sr-only" aria-live="polite">{`Showing ${list.length} of ${tech.length} technologies`}</p>

        <motion.ul layout className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-14 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map(t => (
              <Tile key={t.name} t={t} i={tech.indexOf(t)} />
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
