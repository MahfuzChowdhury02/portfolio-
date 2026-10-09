import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { focusAreas } from "../content";
import { ease } from "../lib/hooks";
import { Reveal } from "../components/motion";
import { FocusChipsRow, PortraitStage } from "./story/PortraitStage";
import { usePauseOnInteract, useRoving } from "./story/hooks";
import { SectionHeading } from "../components/ui";

const CYCLE_MS = 4200;

export function About() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const { paused, bind } = usePauseOnInteract();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.45 });

  const pick = useCallback((i: number) => { setActive(i); setTouched(true); }, []);
  const rovingDesktop = useRoving(focusAreas.length, active, pick);
  const rovingMobile = useRoving(focusAreas.length, active, pick);

  // gently cycle through the focus areas until the visitor picks one
  const auto = !reduced && !touched && !paused && inView;
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => setActive(a => (a + 1) % focusAreas.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [auto]);

  const a = focusAreas[active];

  return (
    <section id="about" aria-label="About" className="section isolate overflow-x-clip">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-48 top-24 size-[620px] rounded-full bg-[radial-gradient(circle,rgb(109_60_230/0.09),transparent_65%)]" />
        <div className="absolute -left-40 bottom-0 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(15_111_184/0.07),transparent_65%)]" />
      </div>

      <div ref={ref} {...bind} className="shell grid gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <SectionHeading index="01" kicker="About" title="I connect the pieces" accent="into one system." />
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-[34rem] text-[17px] leading-relaxed text-ink-2">
              I'm Mahfuz. I bring web development, CRM and GoHighLevel, paid ads, AI automation and funnels together into one complete digital
              marketing system — built to work as a whole, not stitched together later.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <PortraitStage active={active} onSelect={pick} itemProps={rovingDesktop} />
          <div className="mt-6 lg:hidden">
            <FocusChipsRow active={active} onSelect={pick} itemProps={rovingMobile} />
          </div>
        </div>

        {/* highlighted focus line */}
        <Reveal delay={0.1} className="lg:col-start-1 lg:row-start-2 lg:self-end">
          <div
            id="about-focus-panel"
            role="tabpanel"
            aria-labelledby={`about-tab-${a.id}`}
            className="surface relative overflow-hidden rounded-[28px] p-6 sm:p-8"
          >
            <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgb(109_60_230/0.12),transparent_70%)]" />
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">What I focus on</p>
              <p aria-hidden className="font-mono text-[11.5px] tracking-[0.1em] text-ink-3">
                <span className="font-semibold text-violet">{String(active + 1).padStart(2, "0")}</span> / {String(focusAreas.length).padStart(2, "0")}
              </p>
            </div>
            <div className="relative mt-5 min-h-[7.5rem] sm:min-h-[6.5rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={a.id}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(6px)" }}
                  transition={{ duration: 0.5, ease }}
                >
                  <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-tight tracking-[-0.03em]">{a.label}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-2">{a.line}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* progress ticks — one per focus area */}
            <div aria-hidden className="mt-6 flex gap-1.5">
              {focusAreas.map((f, i) => (
                <span key={f.id} className="relative h-1 flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
                  {i < active && <span className="absolute inset-0 bg-violet/35" />}
                  {i === active && (
                    <motion.span
                      key={`${a.id}-${auto}`}
                      className="absolute inset-y-0 left-0 bg-violet"
                      initial={{ width: auto ? "0%" : "100%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: auto ? CYCLE_MS / 1000 : 0, ease: "linear" }}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
