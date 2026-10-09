import { AnimatePresence, motion } from "framer-motion";
import { Icon, IllustrativeTag, cx } from "../../components/ui";
import { ease, useMediaQuery } from "../../lib/hooks";
import { asIcon, tints } from "./shared";
import { LAST, stepTint, steps, type FlowRunner } from "./flow";
import { FlowConsole, FlowControls, StepDetail } from "./FlowConsole";

/**
 * Below lg: the same flow as a vertical rail. Phones expand the active step inline;
 * tablets pair the rail with the side console.
 */
export function FlowCompact({ runner }: { runner: FlowRunner }) {
  const md = useMediaQuery("(min-width: 768px)");
  const { step, traveling } = runner;
  const fill = (traveling !== null ? traveling + 0.5 : step) / LAST;

  return (
    <div className={cx("grid gap-5", md && "grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start")}>
      <div className="relative rounded-[26px] border border-white bg-[linear-gradient(170deg,#ffffff,#f5f1ff)] dark:border-[#fff]/10 dark:bg-[linear-gradient(170deg,#1e1b2b,#16132a)] p-4 shadow-[0_0_0_1px_rgb(109_60_230/0.10),0_40px_80px_-50px_rgb(48_27_120/0.45)] sm:p-5">
        {!md && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <FlowControls runner={runner} />
            <IllustrativeTag>Illustrative</IllustrativeTag>
          </div>
        )}
        <ol className="relative flex flex-col gap-2" aria-label="Automation flow steps">
          {/* rail */}
          <span aria-hidden className="absolute bottom-7 left-[27px] top-7 w-[2px] rounded-full bg-ink/10 sm:left-[31px]">
            <motion.span className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-gradient-to-b from-violet via-fuchsia to-sky" initial={false} animate={{ scaleY: fill }} transition={{ duration: traveling !== null ? 0.9 : 0.5, ease }} />
          </span>
          {steps.map((s, i) => {
            const active = i === step && traveling === null;
            const done = i < step;
            const t = tints[stepTint[s.id]];
            return (
              <li key={s.id} className="relative">
                <button
                  type="button"
                  onClick={() => runner.select(i)}
                  aria-pressed={i === step}
                  aria-expanded={!md ? i === step : undefined}
                  className={cx(
                    "relative flex w-full items-center gap-3 rounded-2xl border p-2 pr-3 text-left transition-[background-color,border-color,box-shadow] duration-500",
                    active ? "border-violet/30 bg-white shadow-[0_0_0_4px_rgb(109_60_230/0.08),0_16px_30px_-20px_rgb(84_40_196/0.5)]" : "border-transparent hover:bg-white/70",
                  )}
                >
                  <span className={cx("relative grid size-10 shrink-0 place-items-center rounded-xl ring-4 ring-[#f7f4ff] dark:ring-[#1a1729] sm:size-12", t.tile)}>
                    <Icon name={asIcon(s.icon)} className="size-[18px] sm:size-5" />
                    {done && (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-violet text-white ring-2 ring-white">
                        <Icon name="check" className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block font-mono text-[10px] tracking-[0.12em] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <span className="block font-display text-[16px] font-semibold tracking-[-0.01em]">{s.label}</span>
                  </span>
                  {active && <span aria-hidden className="size-2 rounded-full bg-violet shadow-[0_0_0_4px_rgb(109_60_230/0.15)]" />}
                </button>
                {!md && (
                  <AnimatePresence initial={false}>
                    {i === step && (
                      <motion.div
                        key="d"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease }}
                        className="overflow-hidden"
                      >
                        <div className="pb-3 pl-[52px] pr-1 pt-3">
                          <StepDetail index={i} compact bare />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      {md && (
        <div className="sticky top-24">
          <FlowConsole runner={runner} shown={step} hovering={false} />
        </div>
      )}
    </div>
  );
}
