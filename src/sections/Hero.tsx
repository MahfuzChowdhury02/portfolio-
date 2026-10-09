import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { person, services } from "../content";
import { ease, hasWebGL, scrollToId, useIsMobile } from "../lib/hooks";
import { Magnetic, SplitText } from "../components/motion";
import { Icon, cx } from "../components/ui";
import type { PanelId } from "../three/heroPanels";

const HeroScene = lazy(() => import("../three/HeroScene"));

/* the four services the 3D panels represent (kept here so the static fallback
   doesn't have to load three.js just for labels) */
const SERVICES: { id: PanelId; label: string; section: string; dot: string }[] = [
  { id: "web", label: "Web Development", section: "expertise", dot: "bg-violet" },
  { id: "crm", label: "CRM & GHL", section: "crm", dot: "bg-sky" },
  { id: "ai", label: "AI & Automation", section: "automation", dot: "bg-fuchsia" },
  { id: "funnels", label: "Funnels", section: "funnel", dot: "bg-teal" },
];

/** No-WebGL fallback: a still version of the same composition in CSS. */
function StaticHero() {
  const card = "surface absolute rounded-2xl p-3";
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 grid place-items-center">
        <div className="aspect-square w-[42%] max-w-[280px] rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#efe9ff_35%,#c4b5fd_75%,#8b5cf6_100%)] shadow-[0_40px_80px_-30px_rgb(109_60_230/0.55)]" />
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-[26%] w-[88%] -rotate-6 rounded-[50%] border border-teal/50" />
      </div>
      {[
        { t: "Landing page", pos: "left-[2%] top-[8%]", dot: "bg-violet" },
        { t: "AI workflow", pos: "right-[2%] top-[14%]", dot: "bg-fuchsia" },
        { t: "Lead pipeline", pos: "right-[6%] bottom-[8%]", dot: "bg-sky" },
        { t: "Funnel", pos: "left-[6%] bottom-[16%] opacity-70", dot: "bg-teal" },
      ].map(c => (
        <div key={c.t} className={cx(card, c.pos, "w-[38%] max-w-[230px]")}>
          <p className="flex items-center gap-2 text-[12px] font-semibold"><span className={cx("size-1.5 rounded-full", c.dot)} />{c.t}</p>
          <div className="mt-2.5 space-y-1.5"><span className="block h-1.5 w-3/4 rounded-full bg-mist" /><span className="block h-1.5 w-1/2 rounded-full bg-mist" /><span className="block h-6 rounded-lg bg-mist" /></div>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const reduced = !!useReducedMotion();
  const mobile = useIsMobile();
  const [webgl, setWebgl] = useState(true);
  useEffect(() => setWebgl(hasWebGL()), []);
  const anchor = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<PanelId | null>(null);
  const select = useCallback((id: PanelId) => { const s = SERVICES.find(x => x.id === id); if (s) scrollToId(s.section); }, []);

  // copy drifts up and fades as the hero leaves
  const { scrollY } = useScroll();
  const copyY = useTransform(scrollY, [0, 700], [0, reduced ? 0 : -90]);
  const copyO = useTransform(scrollY, [0, 520], [1, 0.15]);

  return (
    <section id="top" aria-label="Introduction" className="relative isolate overflow-hidden pb-10 pt-28 md:pt-32 lg:min-h-[100svh] lg:pb-0">
      {/* ambient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(109_60_230/0.11),transparent_65%)]" />
        <div className="absolute -right-24 top-24 size-[760px] rounded-full bg-[radial-gradient(circle,rgb(139_92_246/0.10),transparent_62%)]" />
        <div className="absolute bottom-0 left-1/3 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(181_39_158/0.06),transparent_65%)]" />
      </div>

      {/* 3D layer: spans the hero so particles fill it; the composition is placed over the stage anchor */}
      <div className="absolute inset-0 z-0">
        {webgl ? (
          <Suspense fallback={null}>
            <HeroScene anchor={anchor} hover={hover} onHover={setHover} onSelect={select} reduced={reduced} light={mobile} />
          </Suspense>
        ) : null}
      </div>

      <div className="shell pointer-events-none relative z-10 grid items-center gap-6 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-2">
        <motion.div style={{ y: copyY, opacity: copyO }} className="pointer-events-auto relative pt-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.1 }} className="flex items-center gap-3">
            <img src={person.portrait} alt="" width={40} height={40} className="size-10 rounded-full object-cover object-[50%_18%] shadow-md ring-2 ring-white" />
            <span className="chip">
              <span className="relative flex size-2"><span className="pulse-ring absolute inset-0 rounded-full bg-violet" /><span className="relative size-2 rounded-full bg-violet" /></span>
              Digital marketing systems
            </span>
          </motion.div>

          <h1 className="mt-7 font-display text-[clamp(3.1rem,8.4vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
            <SplitText text={person.firstName} immediate delay={0.2} />
            <br />
            <SplitText text={person.lastName} immediate delay={0.32} className="text-ink/90" />
          </h1>

          <p className="mt-6 font-display text-[clamp(1.5rem,3vw,2.3rem)] font-semibold tracking-[-0.03em]">
            {["Build.", "Automate.", "Grow."].map((w, i) => (
              <motion.span key={w} className="mr-3 inline-block text-gradient" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.6 + i * 0.14 }}>
                {w}
              </motion.span>
            ))}
          </p>

          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.9 }} className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[12.5px] uppercase tracking-[0.08em] text-ink-2" aria-label="Roles">
            {person.roles.map((r, i) => (
              <li key={r} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden className="size-1 rounded-full bg-violet/60" />}
                {r}
              </li>
            ))}
          </motion.ul>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 1 }} className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-ink-2">
            {person.statement}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 1.12 }} className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic href="#projects" onClick={e => { e.preventDefault(); scrollToId("projects"); }} className="btn-primary">
              View My Work <Icon name="arrowRight" />
            </Magnetic>
            <Magnetic href="#contact" onClick={e => { e.preventDefault(); scrollToId("contact"); }} className="btn-ghost">
              Let's Work Together
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* stage: the 3D composition is laid out over this box */}
        <div className="relative flex h-[480px] flex-col justify-end sm:h-[560px] lg:h-[min(740px,84svh)]">
          <div ref={anchor} aria-hidden className="absolute -right-[2%] top-0 bottom-28 left-0 sm:bottom-14 lg:left-[4%] xl:left-0 2xl:-left-[4%]" />
          {!webgl && <StaticHero />}
          <p className="sr-only">An illustration of Mahfuz's connected system: a central core with four service panels — a landing page, a lead pipeline, an AI workflow and a funnel.</p>

          {/* legend: keyboard/touch access to the same interaction as hovering a panel */}
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 1.5 }}
            className="pointer-events-auto relative z-10 flex flex-wrap justify-center gap-2"
            aria-label="Explore services"
          >
            {SERVICES.map(s => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseEnter={() => setHover(s.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(s.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => select(s.id)}
                  className={cx(
                    "glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-[transform,color] duration-300",
                    hover === s.id ? "-translate-y-0.5 text-ink" : "text-ink-2",
                  )}
                >
                  <span className={cx("size-2 rounded-full transition-transform duration-300", s.dot, hover === s.id && "scale-150")} />
                  {s.label}
                  <Icon name="arrowDown" className={cx("size-3 -rotate-90 transition-opacity", hover === s.id ? "opacity-100" : "opacity-0")} />
                </button>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* service ticker */}
      <div className="relative z-10 mt-10 overflow-hidden border-y border-line bg-white/60 py-4 backdrop-blur lg:mt-4" aria-hidden>
        <div className="marquee flex w-max gap-10 pr-10">
          {[0, 1].flatMap(k =>
            [...services, ...services].map((s, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-10 whitespace-nowrap font-display text-[20px] font-semibold tracking-[-0.02em] text-ink/80">
                {s.title}
                <span className="font-mono text-[15px] text-violet">&gt;_</span>
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
