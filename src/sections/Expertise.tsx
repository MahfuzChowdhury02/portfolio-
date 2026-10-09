import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { services } from "../content";
import { ease, useMediaQuery } from "../lib/hooks";
import { useTilt } from "../components/motion";
import { Icon, IllustrativeTag, cx, SectionHeading } from "../components/ui";
import { usePauseOnInteract, useRoving } from "./story/hooks";
import { serviceVisuals, visualDescriptions } from "./story/ServiceVisuals";

type Service = (typeof services)[number];

/** The animated diagram for a service, with pointer tilt and autoplay control. */
function Stage({ service, compact, className }: { service: Service; compact: boolean; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const { paused, bind } = usePauseOnInteract();
  const t = useTilt(3.5);
  const Visual = serviceVisuals[service.id];
  return (
    <div ref={ref} {...bind} className={cx("relative", className)} style={{ perspective: 1600 }}>
      <motion.div
        ref={t.ref}
        onPointerMove={t.onMove}
        onPointerLeave={t.onLeave}
        style={{ rotateX: t.rotateX, rotateY: t.rotateY }}
        className="relative size-full overflow-hidden rounded-[22px] border border-line bg-[linear-gradient(180deg,#fbfaff,#f4f3f8)]"
      >
        <div aria-hidden className="dot-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(80%_80%_at_50%_45%,#000,transparent)]" />
        <div role="img" aria-label={visualDescriptions[service.id]} className="relative size-full">
          <div aria-hidden className="size-full">
            <Visual playing={inView && !paused} reduced={reduced} compact={compact} />
          </div>
        </div>
        {service.id !== "funnels" && !compact && <IllustrativeTag className="absolute right-3 top-3">Illustrative</IllustrativeTag>}
      </motion.div>
    </div>
  );
}

function Items({ s }: { s: Service }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label={`${s.title} services`}>
      {s.items.map((it, i) => (
        <motion.li
          key={it}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.04 }}
          className="chip"
        >
          <Icon name="check" className="size-3.5 text-violet" />
          {it}
        </motion.li>
      ))}
    </ul>
  );
}

/* ---------------- desktop: tabs + large stage ---------------- */

function DesktopTabs() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const select = useCallback((i: number) => setActive(i), []);
  const roving = useRoving(services.length, active, select);
  const s = services[active];

  return (
    <div className="mt-16 grid grid-cols-[minmax(0,0.78fr)_minmax(0,1.5fr)] gap-10 xl:gap-14">
      <div role="tablist" aria-label="Services" aria-orientation="vertical" className="flex flex-col gap-1.5 self-start">
        {services.map((sv, i) => {
          const on = i === active;
          return (
            <button
              key={sv.id}
              type="button"
              role="tab"
              id={`exp-tab-${sv.id}`}
              aria-selected={on}
              aria-controls="exp-panel"
              onClick={() => select(i)}
              {...roving(i)}
              className={cx("group relative flex items-center gap-5 rounded-2xl px-5 py-5 text-left transition-colors duration-300", on ? "text-ink" : "text-ink-3 hover:text-ink")}
            >
              {on && (
                <motion.span
                  layoutId="a-exp-pill"
                  className="surface absolute inset-0 rounded-2xl"
                  transition={{ duration: 0.6, ease }}
                />
              )}
              <span className={cx("relative font-mono text-[12px] font-semibold tracking-[0.08em] transition-colors", on ? "text-violet" : "text-ink-3")}>{sv.num}</span>
              <span className="relative flex-1 font-display text-[clamp(1.25rem,1.9vw,1.6rem)] font-semibold leading-tight tracking-[-0.025em]">{sv.title}</span>
              <span className={cx("relative grid size-9 place-items-center rounded-full transition-all duration-500", on ? "bg-ink text-white" : "bg-transparent text-ink-3 opacity-0 group-hover:opacity-100")}>
                <Icon name="arrowRight" className="size-4" />
              </span>
            </button>
          );
        })}
        <p className="mt-4 flex items-center gap-2 px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3" aria-hidden>
          <kbd className="rounded border border-line-strong bg-white px-1.5 py-0.5 text-[10px]">↑</kbd>
          <kbd className="rounded border border-line-strong bg-white px-1.5 py-0.5 text-[10px]">↓</kbd>
          to switch
        </p>
      </div>

      <div id="exp-panel" role="tabpanel" aria-labelledby={`exp-tab-${s.id}`} tabIndex={0} className="surface-lg relative rounded-[30px] p-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={s.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.985, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease }}
          >
            <Stage service={s} compact={false} className="h-[400px] xl:h-[430px]" />
            <div className="grid gap-5 px-4 pb-4 pt-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] xl:gap-8">
              <div>
                <p className="eyebrow"><span className="text-violet">{s.num}</span> · {s.title}</p>
                <h3 className="mt-2 font-display text-[22px] font-semibold leading-snug tracking-[-0.02em] text-ink">{s.summary}</h3>
              </div>
              <div className="xl:pt-6"><Items s={s} /></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- mobile / tablet: accordion with visuals ---------------- */

function Accordion() {
  const [open, setOpen] = useState<number | null>(0);
  const compact = useMediaQuery("(max-width: 639px)");
  return (
    <ul className="mt-12 flex flex-col gap-3">
      {services.map((s, i) => {
        const on = open === i;
        return (
          <li key={s.id} className={cx("overflow-hidden rounded-[24px] border transition-[background-color,border-color,box-shadow] duration-500", on ? "surface-lg border-transparent" : "border-line bg-white/60")}>
            <h3>
              <button
                type="button"
                id={`exp-acc-${s.id}`}
                aria-expanded={on}
                aria-controls={`exp-acc-panel-${s.id}`}
                onClick={() => setOpen(on ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-5 text-left"
              >
                <span className={cx("font-mono text-[12px] font-semibold", on ? "text-violet" : "text-ink-3")}>{s.num}</span>
                <span className="flex-1 font-display text-[21px] font-semibold tracking-[-0.025em]">{s.title}</span>
                <span className={cx("grid size-9 place-items-center rounded-full transition-all duration-500", on ? "rotate-45 bg-ink text-white" : "bg-mist text-ink")}>
                  <Icon name="plus" className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  id={`exp-acc-panel-${s.id}`}
                  role="region"
                  aria-labelledby={`exp-acc-${s.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease }}
                >
                  <div className="px-3 pb-5">
                    <Stage service={s} compact={compact} className={compact ? (s.id === "funnels" ? "h-[270px]" : "h-[340px]") : "h-[360px]"} />
                    <div className="px-2 pt-5">
                      <p className="text-[16px] leading-relaxed text-ink-2">{s.summary}</p>
                      <div className="mt-4"><Items s={s} /></div>
                      {s.id !== "funnels" && compact && <IllustrativeTag className="mt-4">Illustrative example</IllustrativeTag>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export function Expertise() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  return (
    <section id="expertise" aria-label="Expertise" className="section isolate overflow-x-clip border-y border-line bg-mist/50">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-1/3 size-[560px] rounded-full bg-[radial-gradient(circle,rgb(109_60_230/0.08),transparent_65%)]" />
        <div className="absolute -right-32 bottom-0 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(181_39_158/0.06),transparent_65%)]" />
      </div>
      <div className="shell">
        <SectionHeading
          index="02"
          kicker="Expertise"
          title="Five disciplines,"
          accent="one connected system."
          sub="Each part is useful on its own. Together they turn traffic into booked calls — pick one to see how it works."
        />
        {desktop ? <DesktopTabs /> : <Accordion />}
      </div>
    </section>
  );
}
