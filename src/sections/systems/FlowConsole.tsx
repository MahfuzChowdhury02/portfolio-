import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon, IllustrativeTag, cx } from "../../components/ui";
import { ease } from "../../lib/hooks";
import { asIcon, tints } from "./shared";
import { stepEvents, stepTint, steps, type FlowRunner } from "./flow";

/** Detail for one step: icon, title, the content.ts detail line, and what happens to the sample lead. */
export function StepDetail({ index, compact, bare }: { index: number; compact?: boolean; bare?: boolean }) {
  const s = steps[index];
  const t = tints[stepTint[s.id]];
  return (
    <div>
      <div className={cx("flex items-center gap-3", bare && "sr-only")}>
        <span className={cx("grid shrink-0 place-items-center rounded-2xl", t.tile, compact ? "size-10" : "size-12")}>
          <Icon name={asIcon(s.icon)} className={compact ? "size-5" : "size-6"} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Step {String(index + 1).padStart(2, "0")}</p>
          <h3 className={cx("font-semibold leading-tight tracking-[-0.02em]", compact ? "text-[20px]" : "text-[26px]")}>{s.label}</h3>
        </div>
      </div>
      <p className={cx(bare ? "mt-0" : "mt-4", "leading-relaxed text-ink-2", compact ? "text-[14.5px]" : "text-[15.5px]")}>{s.detail}</p>
      <ul className="mt-4 flex flex-col gap-2" aria-label={`What happens at the ${s.label} step`}>
        {stepEvents[s.id].map((e, k) => (
          <motion.li
            key={e}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.12 + k * 0.12 }}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-white/80 px-3 py-2 text-[13.5px] text-ink-2"
          >
            <span className={cx("grid size-5 shrink-0 place-items-center rounded-full text-white", t.dot)}>
              <Icon name="check" className="size-3" strokeWidth={2.6} />
            </span>
            {e}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** Play / pause / step controls shared by both layouts. */
export function FlowControls({ runner, className }: { runner: FlowRunner; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className={cx("flex items-center gap-2", className)}>
      {!reduced && (
        <button
          type="button"
          onClick={runner.toggle}
          aria-pressed={runner.playing}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-12px_rgb(23_21_31/0.6)] transition-colors hover:bg-violet-deep"
        >
          <Icon name={runner.playing ? "pause" : "play"} className="size-3.5" strokeWidth={2.2} />
          {runner.playing ? "Pause" : "Run the flow"}
        </button>
      )}
      <button type="button" onClick={runner.prev} aria-label="Previous step" className="grid size-10 place-items-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:border-violet">
        <Icon name="arrowRight" className="size-4 rotate-180" />
      </button>
      <button type="button" onClick={runner.next} aria-label="Next step" className="grid size-10 place-items-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:border-violet">
        <Icon name="arrowRight" className="size-4" />
      </button>
      <button type="button" onClick={runner.replay} aria-label="Replay from the first step" className="grid size-10 place-items-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:border-violet">
        <Icon name="replay" className="size-4" />
      </button>
    </div>
  );
}

export function StepProgress({ step, className }: { step: number; className?: string }) {
  return (
    <div className={cx("flex gap-1.5", className)} aria-hidden>
      {steps.map((s, i) => (
        <span key={s.id} className="relative h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
          <motion.span className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-violet to-fuchsia" initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.6, ease }} />
        </span>
      ))}
    </div>
  );
}

/** Side console for the desktop stage (and the tablet layout). */
export function FlowConsole({ runner, shown, hovering }: { runner: FlowRunner; shown: number; hovering: boolean }) {
  const status = runner.running ? "Running" : runner.playing && hovering ? "Paused while you explore" : runner.playing ? "Waiting" : "Paused";
  return (
    <div className="glass flex h-full flex-col rounded-[26px] p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-ink text-white"><Icon name="user" className="size-4" /></span>
          <div className="leading-tight">
            <p className="text-[13.5px] font-semibold">Sample lead</p>
            <p className="flex items-center gap-1.5 text-[12px] text-ink-3">
              <span className={cx("size-1.5 rounded-full", runner.running ? "bg-teal" : "bg-ink/30")} />
              {status}
            </p>
          </div>
        </div>
        <IllustrativeTag>Illustrative</IllustrativeTag>
      </div>

      <StepProgress step={runner.step} className="mt-5" />

      <div className="relative mt-6 min-h-[296px] flex-1" aria-live={runner.running ? "off" : "polite"}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={shown} initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8, filter: "blur(4px)" }} transition={{ duration: 0.45, ease }}>
            <StepDetail index={shown} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5" aria-hidden>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Journey so far</p>
        <ol className="mt-2.5 flex flex-wrap gap-1.5">
          {steps.map((s, i) => (
            <li
              key={s.id}
              className={cx(
                "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11.5px] font-medium transition-colors duration-500",
                i < runner.step ? "border-violet/20 bg-violet-soft text-violet" : i === runner.step ? "border-ink bg-ink text-white" : "border-line text-ink-3",
              )}
            >
              {i < runner.step && <Icon name="check" className="size-3" strokeWidth={2.6} />}
              {s.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <FlowControls runner={runner} />
      </div>
    </div>
  );
}
