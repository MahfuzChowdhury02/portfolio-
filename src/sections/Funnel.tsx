import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { funnelStages } from "../content";
import { Reveal } from "../components/motion";
import { Icon, IllustrativeTag, SectionHeading, cx } from "../components/ui";
import { clamp, ease, useMediaQuery } from "../lib/hooks";
import { StageVisual, stageIcons, type StageId } from "./showcase/funnelVisuals";

const stages = funnelStages;
const N = stages.length;
const pad = (n: number) => String(n).padStart(2, "0");

/* ---------------- 3D layered funnel ---------------- */

const GAP = 64; // vertical distance between layers (px)
const RING_H = 100; // plate height before the 3D tilt
const MIN_W = 34; // narrowest plate width (%)
const widthAt = (i: number) => 100 - (i * (100 - MIN_W)) / (N - 1);

function FunnelStack({ active, onSelect, playing }: { active: number; onSelect: (i: number) => void; playing: boolean }) {
  const H = (N - 1) * GAP + RING_H * 0.5;
  return (
    <div className="relative w-full" style={{ height: H + 40, perspective: 1100, perspectiveOrigin: "50% -20%" }} aria-hidden>
      {/* soft cone behind the plates */}
      <svg className="absolute inset-x-0 top-[22px] w-full" style={{ height: H - 10 }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fn-cone" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6d3ce6" stopOpacity="0.08" />
            <stop offset="1" stopColor="#b5279e" stopOpacity="0.14" />
          </linearGradient>
        </defs>
        <path d={`M0 0 L100 0 L${50 + MIN_W / 2} 100 L${50 - MIN_W / 2} 100 Z`} fill="url(#fn-cone)" />
        <path d={`M50 0 V100`} stroke="#6d3ce6" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* flow particles dropping through the funnel */}
      {playing &&
        [0, 1, 2].map(k => (
          <motion.span
            key={k}
            className="absolute left-1/2 top-[18px] -ml-[3px] size-1.5 rounded-full bg-violet shadow-[0_0_10px_rgb(109_60_230/0.8)]"
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [0, H - 20], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.2, ease: "easeIn", repeat: Infinity, delay: k * 1.05 }}
          />
        ))}

      {stages.map((s, i) => {
        const on = i === active, past = i < active;
        const w = widthAt(i);
        return (
          <div key={s.id} className="absolute inset-x-0 flex justify-center" style={{ top: i * GAP, height: RING_H * 0.5 }}>
            <motion.button
              type="button"
              tabIndex={-1}
              aria-label={`Show stage ${i + 1}: ${s.label}`}
              onClick={() => onSelect(i)}
              className="absolute top-1/2 cursor-pointer rounded-[50%]"
              style={{
                width: `${w}%`,
                height: RING_H,
                marginTop: -RING_H / 2,
                transformStyle: "preserve-3d",
                zIndex: N - i + (on ? 10 : 0),
              }}
              initial={false}
              animate={{
                rotateX: 64,
                y: on ? -12 : 0,
                scale: on ? 1.05 : 1,
                background: on
                  ? "radial-gradient(70% 70% at 50% 35%, #8f63ff 0%, #6d3ce6 45%, #5428c4 100%)"
                  : past
                    ? "radial-gradient(70% 70% at 50% 35%, #ffffff 0%, #efeafd 70%, #e3d9fb 100%)"
                    : "radial-gradient(70% 70% at 50% 35%, #ffffff 0%, #f8f7fb 70%, #efeef4 100%)",
                boxShadow: on
                  ? "0 16px 0 #3f1d9e, 0 40px 60px -10px rgba(109,60,230,0.55), inset 0 0 0 1px rgba(255,255,255,0.35)"
                  : past
                    ? "0 12px 0 #d6c9f7, 0 24px 40px -18px rgba(48,27,120,0.3), inset 0 0 0 1px rgba(109,60,230,0.18)"
                    : "0 12px 0 #e4e2ec, 0 24px 40px -18px rgba(48,27,120,0.22), inset 0 0 0 1px rgba(23,21,31,0.08)",
              }}
              transition={{ duration: 0.6, ease }}
            />
            {/* flat label riding on the plate */}
            <motion.span
              className={cx("pointer-events-none relative z-[30] flex items-center gap-1.5 self-center rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold", on ? "text-white" : past ? "text-violet" : "text-ink-3")}
              initial={false}
              animate={{ y: on ? -12 : 0 }}
              transition={{ duration: 0.6, ease }}
              style={{ zIndex: 40 }}
            >
              {pad(i + 1)}
              <AnimatePresence>
                {on && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap font-sans text-[12px]">
                    {s.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- desktop: pinned scroll story ---------------- */

function PinnedFunnel() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const inView = useInView(stageRef, { amount: 0.3 });
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  useMotionValueEvent(scrollYProgress, "change", v => setActive(clamp(Math.floor(v * N), 0, N - 1)));

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((i + 0.5) / N) * (el.offsetHeight - window.innerHeight);
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
    setActive(i);
  };

  const s = stages[active];
  // card follows the active layer
  const cardY = clamp(active * GAP - 70, -10, (N - 1) * GAP - 150);
  const w = widthAt(active);

  return (
    <div ref={trackRef} className="relative mt-6" style={{ height: `${N * 52 + 100}svh` }}>
      <div ref={stageRef} className="sticky top-0 flex h-[100svh] items-center pt-16">
        <div className="grid w-full grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-12 xl:gap-20">
          {/* copy + controls */}
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[12px] font-semibold text-ink"><span className="text-violet">Stage {pad(active + 1)}</span><span className="text-ink-3"> / {pad(N)}</span></span>
              <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
                <motion.span className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-violet via-fuchsia to-sky" style={{ scaleX: bar }} />
              </span>
            </div>

            <div className="relative mt-7 min-h-[150px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={s.id} initial={{ opacity: 0, y: 18, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -12, filter: "blur(6px)" }} transition={{ duration: 0.45, ease }}>
                  <h3 className="text-[clamp(2.4rem,4.2vw,3.7rem)] font-semibold leading-[0.98] tracking-[-0.04em]">{s.label}</h3>
                  <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-ink-2">{s.detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <ol className="mt-8 grid grid-cols-2 gap-1.5" aria-label="Funnel stages">
              {stages.map((st, i) => {
                const on = i === active;
                return (
                  <li key={st.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={on ? "step" : undefined}
                      className={cx("relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition-colors", on ? "text-ink" : i < active ? "text-ink-2 hover:text-ink" : "text-ink-3 hover:text-ink")}
                    >
                      {on && <motion.span layoutId="funnel-pill" className="absolute inset-0 -z-10 rounded-xl border border-line bg-white shadow-[0_10px_24px_-14px_rgb(48_27_120/0.35)]" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                      <span className={cx("grid size-7 shrink-0 place-items-center rounded-lg transition-colors", on ? "bg-violet text-white" : i < active ? "bg-violet-soft text-violet" : "bg-ink/[0.05] text-ink-3")}>
                        <Icon name={stageIcons[st.id as StageId]} className="size-3.5" />
                      </span>
                      <span className="truncate">{st.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 text-[12.5px] text-ink-3">Scroll, or pick a stage. Real project screenshots will be attached to each stage when available.</p>
          </div>

          {/* funnel + matching visual */}
          <div className="relative min-w-0">
            <div className="absolute -top-12 left-0"><IllustrativeTag /></div>
            <div className="relative w-[58%]">
              <FunnelStack active={active} onSelect={goTo} playing={inView && !reduced} />
            </div>
            {/* connector from the active plate to the card */}
            <motion.span
              aria-hidden
              className="absolute h-px bg-gradient-to-r from-violet/70 to-violet/10"
              initial={false}
              animate={{ top: active * GAP + RING_H * 0.25 - 12, left: `${58 * (0.5 + w / 200)}%`, width: `${Math.max(0, 61 - 58 * (0.5 + w / 200))}%` }}
              transition={{ duration: 0.6, ease }}
            />
            <motion.div className="absolute right-0 top-0 w-[39%] min-w-[220px]" initial={false} animate={{ y: cardY }} transition={{ duration: 0.7, ease }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={s.id}
                  aria-hidden
                  initial={{ opacity: 0, x: 24, rotateY: -14, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -12, rotateY: 8, scale: 0.97 }}
                  transition={{ duration: 0.45, ease }}
                  style={{ transformPerspective: 900 }}
                >
                  <StageVisual id={s.id as StageId} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- mobile / short screens: vertical stepper ---------------- */

function Step({ i }: { i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const on = useInView(ref, { margin: "-35% 0px -45% 0px" });
  const s = stages[i];
  return (
    <li ref={ref} className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-4 pb-12 last:pb-0">
      <span className={cx("relative z-10 grid size-10 place-items-center rounded-xl border transition-all duration-500", on ? "border-transparent bg-violet text-white shadow-[0_12px_24px_-10px_rgb(109_60_230/0.7)]" : "border-line bg-white text-ink-3")}>
        <Icon name={stageIcons[s.id as StageId]} className="size-[18px]" />
      </span>
      <div className="min-w-0 pt-1 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] md:items-start md:gap-10">
        <div>
          <p className="flex items-center gap-3 font-mono text-[11px] text-ink-3">
            Stage {pad(i + 1)} / {pad(N)}
            {/* the funnel narrows as the lead moves through */}
            <span aria-hidden className="flex h-1 w-16 items-center"><span className={cx("h-full rounded-full transition-colors duration-500", on ? "bg-gradient-to-r from-violet to-fuchsia" : "bg-ink/10")} style={{ width: `${widthAt(i)}%` }} /></span>
          </p>
          <h3 className="mt-1 text-[24px] font-semibold leading-tight tracking-[-0.025em]">{s.label}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{s.detail}</p>
        </div>
        <Reveal y={24} amount={0.3} className="mt-5 max-w-[320px] md:mt-0">
          <div aria-hidden className={cx("transition-transform duration-700", on ? "scale-100" : "scale-[0.97]")}>
            <StageVisual id={s.id as StageId} />
          </div>
        </Reveal>
      </div>
    </li>
  );
}

function StepperFunnel() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 55%"] });
  return (
    <div className="mt-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <IllustrativeTag />
        <p className="text-[12.5px] text-ink-3">Real project screenshots will be attached to each stage when available.</p>
      </div>
      <ol ref={ref} className="relative" aria-label="Funnel stages">
        <span aria-hidden className="absolute bottom-0 left-[19.5px] top-0 w-px bg-line-strong" />
        <motion.span aria-hidden className="absolute left-[19.5px] top-0 h-full w-px origin-top bg-gradient-to-b from-violet via-fuchsia to-sky" style={{ scaleY: scrollYProgress }} />
        {stages.map((s, i) => <Step key={s.id} i={i} />)}
      </ol>
    </div>
  );
}

/* ---------------- section ---------------- */

export function Funnel() {
  const pinned = useMediaQuery("(min-width: 1024px) and (min-height: 680px)");
  return (
    <section id="funnel" aria-label="Funnel" className="section">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(60%_60%_at_80%_0%,rgb(181_39_158/0.06),transparent_70%)]" />
      <div className="shell relative">
        <SectionHeading
          index="07"
          kicker="Funnels"
          title="From first click"
          accent="to booked call."
          sub="Every stage hands the lead to the next — ads, page, form, CRM, automation and calendar working as one funnel."
        />
        {pinned ? <PinnedFunnel /> : <StepperFunnel />}
        {/* text equivalent of the whole funnel (the pinned view only shows one stage detail at a time) */}
        {pinned && <ol className="sr-only" aria-label="Funnel stages in order">
          {stages.map((s, i) => <li key={s.id}>{`Stage ${i + 1}: ${s.label} — ${s.detail}`}</li>)}
        </ol>}
      </div>
    </section>
  );
}
