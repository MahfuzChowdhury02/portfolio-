import { useEffect, useRef, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Icon, cx } from "../../../components/ui";
import { ease } from "../../../lib/hooks";
import { BIcon, MockButton, StatusLine, useScript } from "../shared";

const stages = ["New lead", "Contacted", "Qualified", "Booked"] as const;

type Card = { id: string; title: string; source: string; next: string; stage: number };
const others: Card[] = [
  { id: "c1", title: "New enquiry", source: "Ad lead form", next: "Instant reply sent", stage: 0 },
  { id: "c2", title: "New enquiry", source: "Chat widget", next: "Call back", stage: 1 },
  { id: "c3", title: "Returning contact", source: "Phone call", next: "Send booking link", stage: 2 },
  { id: "c4", title: "New enquiry", source: "Referral", next: "Reminder scheduled", stage: 3 },
];
const sampleNext = ["Instant reply sent", "Follow-up task created", "Booking link sent", "Reminders scheduled"];
const notes = [
  "Lead created from the website form and tagged by source.",
  "Stage change creates a follow-up task for the owner.",
  "Qualified leads automatically receive the booking link.",
  "Booked — confirmation and reminders are scheduled.",
];

export function PipelineMock({ active }: { active: boolean }) {
  const s = useScript(stages.length - 1, active, 1500, 900);
  const stage = s.i;
  const scroller = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setOverflowing(el.scrollWidth > el.clientWidth + 2));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // keep the moving card in view when the board scrolls sideways (phones)
  useEffect(() => {
    const el = scroller.current, col = colRefs.current[stage];
    if (!el || !col || el.scrollWidth <= el.clientWidth + 2) return;
    el.scrollTo({ left: col.offsetLeft - 12, behavior: s.reduced ? "auto" : "smooth" });
  }, [stage, s.reduced]);

  const advance = () => s.setI(v => Math.min(stages.length - 1, v + 1));

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <div ref={scroller} className="-mx-1 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]" tabIndex={0} role="region" aria-label="Pipeline board">
          <LayoutGroup id="b-pipeline">
            <div className="grid min-w-[720px] grid-cols-4 gap-3">
              {stages.map((name, col) => {
                const cards = others.filter(c => c.stage === col);
                const count = cards.length + (stage === col ? 1 : 0);
                return (
                  <div key={name} ref={el => { colRefs.current[col] = el; }} className="flex min-h-[300px] flex-col rounded-2xl lg:min-h-[372px] border border-line bg-mist/70 p-2.5">
                    <div className="mb-2.5 flex items-center justify-between px-1">
                      <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                        <span className={cx("size-2 rounded-full", ["bg-sky", "bg-violet", "bg-amber", "bg-teal"][col])} />
                        {name}
                      </p>
                      <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10.5px] text-ink-3">{count}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {stage === col && (
                        <motion.div
                          layoutId="b-sample-card"
                          transition={{ duration: 0.7, ease }}
                          className="relative z-10 rounded-xl border border-violet/40 bg-white p-3 shadow-[0_0_0_3px_rgb(109_60_230/0.10),0_14px_28px_-16px_rgb(84_40_196/0.5)]"
                        >
                          <CardBody title="Sample lead" source="Website form" next={sampleNext[col]} featured />
                        </motion.div>
                      )}
                      {cards.map(c => (
                        <motion.div layout="position" key={c.id} className="rounded-xl border border-line bg-white p-3 shadow-[0_1px_2px_rgb(23_21_31/0.04)]">
                          <CardBody title={c.title} source={c.source} next={c.next} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
        {overflowing && <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <StatusLine>{notes[stage]}</StatusLine>
        <div className="flex gap-2">
          <MockButton onClick={s.replay} label="Reset the pipeline demo"><Icon name="replay" className="size-3.5" /></MockButton>
          <MockButton primary onClick={advance} disabled={stage >= stages.length - 1}>
            Move to {stages[Math.min(stage + 1, stages.length - 1)]} <Icon name="arrowRight" className="size-3.5" />
          </MockButton>
        </div>
      </div>
      {overflowing && <p className="mt-2 text-[11.5px] text-ink-3">Scroll the board sideways to see every stage.</p>}
    </div>
  );
}

function CardBody({ title, source, next, featured }: { title: string; source: string; next: string; featured?: boolean }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className={cx("grid size-7 shrink-0 place-items-center rounded-full", featured ? "bg-ink text-white" : "bg-mist text-ink-3")}>
          <Icon name="user" className="size-3.5" />
        </span>
        <p className="truncate text-[13px] font-semibold text-ink">{title}</p>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-sky-soft px-1.5 py-0.5 text-[10.5px] font-medium text-sky">
          <BIcon name="tag" className="size-3" /> {source}
        </span>
      </div>
      <p className={cx("mt-2 flex items-center gap-1.5 text-[11.5px]", featured ? "text-violet" : "text-ink-3")}>
        <BIcon name="clock" className="size-3" /> {next}
      </p>
    </>
  );
}
