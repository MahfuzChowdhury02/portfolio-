import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { workProcess } from "../../content";
import { ease } from "../../lib/hooks";
import { Icon, cx, type IconName } from "../../components/ui";
import { useBox } from "./viz";
import { useRoving } from "./hooks";

export const stepIcons: Record<(typeof workProcess)[number]["id"], IconName> = {
  discover: "target",
  plan: "layers",
  build: "cursor",
  integrate: "branch",
  automate: "bolt",
  optimize: "chart",
};

/** Step anchor points on the plane (percent). Front row low, back row high — a zig-zag path. */
const pts = [
  { x: 8, y: 74 },
  { x: 25, y: 34 },
  { x: 42, y: 72 },
  { x: 58, y: 32 },
  { x: 75, y: 70 },
  { x: 92, y: 30 },
];
const TILT = 54;

function smoothPath(p: { x: number; y: number }[]) {
  let d = `M${p[0].x} ${p[0].y}`;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i];
    const mx = (a.x + b.x) / 2;
    d += ` C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
  }
  return d;
}

/** Desktop: a tilted plane with a path that draws on scroll; steps stand on it and lift when active. */
export function ProcessPlane() {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const [plane, box] = useBox<HTMLDivElement>();
  const inView = useInView(wrap, { amount: 0.3 });
  const [active, setActive] = useState(0);
  const roving = useRoving(workProcess.length, active, setActive);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 80%", "end 45%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const drawn = useTransform(progress, v => (reduced ? 1 : Math.max(0.02, v)));
  const lastScrollStep = useRef(-1);
  useMotionValueEvent(scrollYProgress, "change", v => {
    const s = Math.min(workProcess.length - 1, Math.max(0, Math.floor(v * workProcess.length)));
    if (s !== lastScrollStep.current) {
      lastScrollStep.current = s;
      setActive(s);
    }
  });

  // pixel geometry for the path (so the travelling pulse can follow it)
  const P = pts.map(p => ({ x: (p.x / 100) * box.w, y: (p.y / 100) * box.h }));
  const d = box.w ? smoothPath(P) : "";

  // pulse that travels the path in a loop (stops when off-screen or reduced motion)
  const pulse = useMotionValue(0);
  const pulseDist = useTransform(pulse, v => `${v}%`);
  useEffect(() => {
    if (reduced || !inView) return;
    const c = animate(pulse, [0, 100], { duration: 5.5, ease: "linear", repeat: Infinity });
    return () => c.stop();
  }, [reduced, inView, pulse]);

  const s = workProcess[active];

  return (
    <div ref={wrap} className="relative">
      <div className="relative h-[440px] [perspective:2100px] [perspective-origin:50%_10%] xl:h-[470px]">
        <div
          ref={plane}
          className="absolute inset-x-[9%] top-[6%] h-[540px] xl:inset-x-[7%] [transform-style:preserve-3d] xl:h-[580px]"
          style={{ transform: `rotateX(${TILT}deg)`, transformOrigin: "50% 0%" }}
        >
          {/* the plane surface */}
          <div aria-hidden className="absolute -inset-x-[4%] -inset-y-[6%] rounded-[48px] border border-line bg-[linear-gradient(180deg,rgb(255_255_255/0.9),rgb(244_243_248/0.7))] dark:bg-[linear-gradient(180deg,rgb(32_29_45/0.92),rgb(21_19_29/0.75))] shadow-[0_60px_120px_-60px_rgb(48_27_120/0.35)]">
            <div className="dot-grid absolute inset-0 rounded-[inherit] opacity-90 [mask-image:radial-gradient(75%_70%_at_50%_50%,#000,transparent)]" />
          </div>

          {d && (
            <svg aria-hidden className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${box.w} ${box.h}`}>
              <defs>
                <linearGradient id="a-proc-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#6d3ce6" />
                  <stop offset="0.6" stopColor="#b5279e" />
                  <stop offset="1" stopColor="#0f6fb8" />
                </linearGradient>
              </defs>
              <path d={d} fill="none" stroke="rgb(23 21 31 / 0.12)" strokeWidth={2} strokeDasharray="4 8" />
              <motion.path d={d} fill="none" stroke="url(#a-proc-grad)" strokeWidth={4} strokeLinecap="round" style={{ pathLength: drawn }} />
            </svg>
          )}

          {d && !reduced && (
            <motion.span
              aria-hidden
              className="absolute left-0 top-0 size-3.5 rounded-full bg-white shadow-[0_0_0_4px_rgb(109_60_230/0.35),0_0_24px_6px_rgb(181_39_158/0.45)]"
              style={{ offsetPath: `path("${d}")`, offsetDistance: pulseDist, offsetRotate: "0deg", translateX: "-50%", translateY: "-50%" }}
            />
          )}

          {/* pads + standing step cards */}
          <div role="tablist" aria-label="Process steps" className="absolute inset-0 [transform-style:preserve-3d]">
            {workProcess.map((st, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <div key={st.id} className="absolute [transform-style:preserve-3d]" style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}>
                  {/* pad on the plane */}
                  <span
                    aria-hidden
                    className={cx(
                      "absolute left-0 top-0 size-[76px] -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-700",
                      on ? "border-violet/40 bg-[radial-gradient(circle,rgb(109_60_230/0.28),rgb(109_60_230/0.04)_70%)]" : done ? "border-violet/20 bg-violet-soft/60" : "border-line bg-white/70",
                    )}
                  />
                  {on && !reduced && inView && <span aria-hidden className="pulse-ring absolute left-0 top-0 size-[76px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-violet/40" />}
                  {/* standing card */}
                  <motion.button
                    type="button"
                    role="tab"
                    id={`proc-tab-${st.id}`}
                    aria-selected={on}
                    aria-controls="proc-panel"
                    onClick={() => setActive(i)}
                    {...roving(i)}
                    className="group absolute bottom-0 left-0 block w-[150px] origin-bottom xl:w-[168px] text-left [transform-style:preserve-3d] focus-visible:outline-none"
                    initial={false}
                    animate={{ z: on ? 54 : 6 }}
                    transition={{ duration: 0.7, ease }}
                    style={{ x: "-50%", rotateX: -TILT }}
                  >
                    <span
                      className={cx(
                        "block rounded-2xl border p-3.5 transition-[background-color,border-color,box-shadow,color] duration-500 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-violet",
                        on
                          ? "border-transparent bg-ink text-white shadow-[0_30px_50px_-20px_rgb(48_27_120/0.7)]"
                          : "border-line bg-white/95 text-ink shadow-[0_16px_30px_-18px_rgb(23_21_31/0.35)] hover:border-violet/30",
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className={cx("grid size-8 place-items-center rounded-lg transition-colors duration-500", on ? "bg-[linear-gradient(140deg,#6d3ce6,#b5279e)] text-white" : done ? "bg-violet-soft text-violet" : "bg-mist text-ink-3")}>
                          <Icon name={stepIcons[st.id]} className="size-4" />
                        </span>
                        <span className={cx("font-mono text-[11px] font-semibold tracking-[0.08em]", on ? "text-white/60" : "text-ink-3")}>{String(i + 1).padStart(2, "0")}</span>
                      </span>
                      <span className="mt-3 block font-display text-[19px] font-semibold leading-none tracking-[-0.02em]">{st.label}</span>
                    </span>
                    {/* stem down to the pad */}
                    <span aria-hidden className={cx("mx-auto block h-5 w-px transition-colors duration-500", on ? "bg-violet" : "bg-ink/15")} />
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* detail for the active step */}
      <div id="proc-panel" role="tabpanel" aria-labelledby={`proc-tab-${s.id}`} className="relative z-10 mx-auto -mt-2 grid max-w-4xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-8 rounded-[28px] border border-line bg-white/80 px-8 py-6 shadow-[0_24px_60px_-36px_rgb(48_27_120/0.35)] backdrop-blur">
        <span aria-hidden className="font-display text-[64px] font-semibold leading-none tracking-[-0.05em] text-gradient">{String(active + 1).padStart(2, "0")}</span>
        <div className="min-h-[4.5rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={s.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease }}
            >
              <h3 className="font-display text-[26px] font-semibold tracking-[-0.03em]">{s.label}</h3>
              <p className="mt-1 text-[16px] leading-relaxed text-ink-2">{s.detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous step" disabled={active === 0} onClick={() => setActive(a => Math.max(0, a - 1))} className="grid size-11 place-items-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:border-violet disabled:opacity-35">
            <Icon name="arrowRight" className="size-4 rotate-180" />
          </button>
          <button type="button" aria-label="Next step" disabled={active === workProcess.length - 1} onClick={() => setActive(a => Math.min(workProcess.length - 1, a + 1))} className="grid size-11 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-violet-deep disabled:opacity-35">
            <Icon name="arrowRight" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Mobile / tablet: vertical timeline whose line draws as you scroll. */
export function ProcessTimeline() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 110, damping: 26, restDelta: 0.001 });
  const [reached, setReached] = useState(reduced ? workProcess.length : 0);
  useMotionValueEvent(scrollYProgress, "change", v => {
    const n = Math.ceil(v * workProcess.length + 0.15);
    setReached(r => (r === n ? r : n));
  });
  const shown = reduced ? workProcess.length : reached;

  return (
    <ol ref={ref} className="relative mt-12 flex flex-col gap-4 pl-14 sm:pl-16">
      <span aria-hidden className="absolute bottom-6 left-[21px] top-6 w-0.5 rounded-full bg-ink/[0.08] sm:left-[25px]" />
      <motion.span aria-hidden className="absolute bottom-6 left-[21px] top-6 w-0.5 origin-top rounded-full bg-[linear-gradient(180deg,#6d3ce6,#b5279e,#0f6fb8)] sm:left-[25px]" style={{ scaleY: reduced ? 1 : scaleY }} />
      {workProcess.map((st, i) => {
        const on = i < shown;
        return (
          <li key={st.id} className="relative">
            <span
              aria-hidden
              className={cx(
                "absolute -left-14 top-4 grid size-11 place-items-center rounded-full border font-mono text-[12px] font-bold transition-all duration-500 sm:-left-16 sm:size-[52px]",
                on ? "border-transparent bg-ink text-white shadow-[0_10px_24px_-10px_rgb(48_27_120/0.7)]" : "border-line bg-white text-ink-3",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <motion.div
              initial={reduced ? false : { opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease }}
              className={cx("rounded-[22px] border p-5 transition-[background-color,border-color,box-shadow] duration-500", on ? "surface border-transparent" : "border-line bg-white/50")}
            >
              <div className="flex items-center gap-3">
                <span className={cx("grid size-9 place-items-center rounded-xl transition-colors duration-500", on ? "bg-[linear-gradient(140deg,#6d3ce6,#b5279e)] text-white" : "bg-mist text-ink-3")}>
                  <Icon name={stepIcons[st.id]} className="size-[18px]" />
                </span>
                <h3 className="font-display text-[21px] font-semibold tracking-[-0.025em]">{st.label}</h3>
              </div>
              <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">{st.detail}</p>
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}
