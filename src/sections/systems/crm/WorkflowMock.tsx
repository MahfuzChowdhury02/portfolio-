import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, cx, type IconName } from "../../../components/ui";
import { ease } from "../../../lib/hooks";
import { BIcon, MockButton, Segmented, StatusLine, useScript, type BIconName } from "../shared";

type Kind = "Trigger" | "Action" | "Wait" | "Condition";
type WNode = { id: string; kind: Kind; label: string; icon: { ui?: IconName; b?: BIconName } };

const main: WNode[] = [
  { id: "trigger", kind: "Trigger", label: "Form submitted", icon: { ui: "bolt" } },
  { id: "contact", kind: "Action", label: "Create / update contact", icon: { ui: "database" } },
  { id: "tag", kind: "Action", label: "Add tag: new-lead", icon: { b: "tag" } },
  { id: "wait", kind: "Wait", label: "Wait 5 minutes", icon: { b: "clock" } },
  { id: "if", kind: "Condition", label: "Has the lead replied?", icon: { b: "split" } },
];
const yes: WNode = { id: "yes", kind: "Action", label: "Move to Contacted", icon: { b: "kanban" } };
const no: WNode = { id: "no", kind: "Action", label: "Send SMS follow-up", icon: { ui: "message" } };
const last: WNode = { id: "notify", kind: "Action", label: "Notify the owner", icon: { b: "bell" } };

const kindStyle: Record<Kind, string> = {
  Trigger: "bg-amber-soft text-amber",
  Action: "bg-violet-soft text-violet",
  Wait: "bg-sky-soft text-sky",
  Condition: "bg-teal-soft text-teal",
};

type Path = "yes" | "no";
const TOTAL = main.length + 2; // + branch + notify

export function WorkflowMock({ active }: { active: boolean }) {
  const [path, setPath] = useState<Path>("no");
  const s = useScript(TOTAL, active, 800, 600);
  const at = s.i; // number of nodes completed
  const branch = path === "yes" ? yes : no;
  const run = [...main, branch, last];
  const state = (idx: number) => (idx < at ? "done" : idx === at && !s.done ? "running" : "idle");

  const changePath = (p: Path) => { setPath(p); s.replay(); };

  return (
    <div className="grid h-full gap-4 md:grid-cols-[minmax(0,1fr)_236px]">
      <div className="dot-grid relative overflow-hidden rounded-2xl border border-line bg-mist/50 px-3 py-5">
        <div className="mx-auto flex max-w-[440px] flex-col items-center">
          {main.map((n, i) => (
            <div key={n.id} className="flex w-full flex-col items-center">
              <WorkflowNode n={n} state={state(i)} />
              <Connector lit={at > i} />
            </div>
          ))}
          {/* branches */}
          <div className="relative grid w-full grid-cols-2 gap-3">
            <svg aria-hidden viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute -top-5 left-0 h-5 w-full">
              <path d="M50 0 V6 H25 V20 M50 6 H75 V20" fill="none" stroke="rgb(23 21 31 / 0.18)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
              <path d={path === "yes" ? "M50 0 V6 H25 V20" : "M50 6 H75 V20 M50 0 V6"} fill="none" stroke={at > main.length - 1 ? "#6d3ce6" : "transparent"} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            </svg>
            {([["yes", yes], ["no", no]] as const).map(([p, n]) => (
              <div key={p} className={cx("flex flex-col items-center transition-opacity duration-500", path !== p && at >= main.length && "opacity-40")}>
                <span className={cx("mb-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]", p === "yes" ? "bg-teal-soft text-teal" : "bg-rose/10 text-rose")}>{p === "yes" ? "Yes" : "No"}</span>
                <WorkflowNode n={n} state={path === p ? state(main.length) : "idle"} compact />
              </div>
            ))}
          </div>
          <Connector lit={at > main.length} />
          <WorkflowNode n={last} state={state(main.length + 1)} />
        </div>
      </div>

      {/* run log */}
      <div className="flex flex-col rounded-2xl border border-line bg-white p-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Test run</p>
        <div className="mt-3">
          <Segmented<Path> label="Simulate the lead's response" value={path} onChange={changePath} options={[{ id: "no", label: "No reply" }, { id: "yes", label: "Replies" }]} />
        </div>
        <ol className="mt-4 flex flex-1 flex-col gap-1.5" aria-label="Executed steps">
          <AnimatePresence initial={false}>
            {run.slice(0, at).map(n => (
              <motion.li key={`${path}-${n.id}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center gap-2 text-[12.5px] text-ink-2">
                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-teal text-white"><Icon name="check" className="size-2.5" strokeWidth={3} /></span>
                <span className="truncate">{n.label}</span>
              </motion.li>
            ))}
          </AnimatePresence>
          {at === 0 && <li className="text-[12.5px] text-ink-3">Waiting to run…</li>}
        </ol>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <StatusLine tone={s.done ? "teal" : "violet"}>{s.done ? "Complete" : at === 0 ? "Ready" : "Running…"}</StatusLine>
          <MockButton primary onClick={s.replay}><Icon name="play" className="size-3" /> Run test</MockButton>
        </div>
      </div>
    </div>
  );
}

function Connector({ lit }: { lit: boolean }) {
  return (
    <span aria-hidden className="relative block h-5 w-px bg-ink/15">
      <span className={cx("absolute inset-0 origin-top bg-violet transition-transform duration-500", lit ? "scale-y-100" : "scale-y-0")} />
    </span>
  );
}

function WorkflowNode({ n, state, compact }: { n: WNode; state: "done" | "running" | "idle"; compact?: boolean }) {
  return (
    <div
      className={cx(
        "relative flex w-full items-center gap-2.5 rounded-xl border bg-white transition-[border-color,box-shadow] duration-500",
        compact ? "px-2 py-2" : "px-2.5 py-2",
        state === "running" ? "border-violet/50 shadow-[0_0_0_3px_rgb(109_60_230/0.12)]" : state === "done" ? "border-teal/30" : "border-line",
      )}
    >
      <span className={cx("size-7 shrink-0 place-items-center rounded-lg", compact ? "hidden sm:grid" : "grid", kindStyle[n.kind])}>
        {n.icon.ui ? <Icon name={n.icon.ui} className="size-3.5" /> : n.icon.b ? <BIcon name={n.icon.b} className="size-3.5" /> : null}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        {!compact && <span className="block font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">{n.kind}</span>}
        <span className={cx("block font-semibold text-ink", compact ? "text-[11.5px] leading-snug sm:text-[12px]" : "truncate text-[12.5px]")}>{n.label}</span>
      </span>
      <span className={cx("grid size-4 shrink-0 place-items-center rounded-full transition-all duration-300", state === "done" ? "bg-teal text-white" : state === "running" ? "bg-violet/15" : "bg-transparent")}>
        {state === "done" && <Icon name="check" className="size-2.5" strokeWidth={3} />}
        {state === "running" && <span className="size-1.5 rounded-full bg-violet" />}
      </span>
    </div>
  );
}
