import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ease } from "../../lib/hooks";
import { BrowserFrame, Icon, cx, type IconName } from "../../components/ui";
import type { ServiceId } from "../../content";
import { Edge, NodeAt, VizDefs, curveH, curveV, useBox, useTicker, type Pt } from "./viz";

export type VisualProps = { playing: boolean; reduced: boolean; compact: boolean };

/* =====================================================================
   01 Web — a landing page assembling itself, then going responsive
   ===================================================================== */

const webPhases = ["Wireframe", "Navigation", "Headline", "Call to action", "Hero visual", "Sections", "Responsive", "Ready to convert", "Ready to convert"] as const;

function Piece({ on, className, children, delay = 0 }: { on: boolean; className?: string; children?: React.ReactNode; delay?: number }) {
  return (
    <div className={cx("relative", className)}>
      <div aria-hidden className="absolute inset-0 rounded-[inherit] border border-dashed border-ink/15" />
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        style={{ transformOrigin: "50% 100%" }}
        initial={false}
        animate={on ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 10, rotateX: -35 }}
        transition={{ duration: 0.65, ease, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function WebVisual({ playing, reduced }: VisualProps) {
  const [ref, box] = useBox<HTMLDivElement>();
  const tick = useTicker(780, playing && !reduced);
  const step = reduced ? 8 : tick % webPhases.length;
  const on = (n: number) => step >= n;
  const W = 600, H = 400;
  const s = box.w ? Math.min(box.w / W, box.h / H) : 0;

  return (
    <div ref={ref} className="relative size-full">
      <div className="absolute left-1/2 top-1/2" style={{ width: W, height: H, transform: `translate(-50%,-50%) scale(${s})` }}>
        <div className="absolute inset-0 [perspective:1600px]">
          {/* desktop browser */}
          <div className="absolute left-[30px] top-[34px] w-[440px] [transform:rotateX(9deg)_rotateY(-13deg)] [transform-style:preserve-3d]">
            <BrowserFrame url="your-business.com" className="!rounded-[14px]">
              <div className="flex h-[270px] flex-col gap-3 bg-white p-4 [transform-style:preserve-3d] [perspective:800px]">
                <Piece on={on(1)} className="h-6 rounded-md">
                  <div className="flex h-full items-center justify-between rounded-md px-1">
                    <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-violet" /><span className="h-1.5 w-10 rounded bg-ink/70" /></span>
                    <span className="flex items-center gap-2.5"><span className="h-1 w-6 rounded bg-ink/20" /><span className="h-1 w-6 rounded bg-ink/20" /><span className="h-1 w-6 rounded bg-ink/20" /><span className="h-4 w-12 rounded-full bg-ink" /></span>
                  </div>
                </Piece>
                <div className="grid flex-1 grid-cols-[1.15fr_1fr] gap-3">
                  <div className="flex flex-col justify-center gap-2.5">
                    <Piece on={on(2)} className="h-[54px] rounded-md">
                      <div className="flex h-full flex-col justify-center gap-2 px-1">
                        <span className="h-3.5 w-[92%] rounded bg-ink/85" />
                        <span className="h-3.5 w-[64%] rounded bg-[linear-gradient(90deg,#6d3ce6,#b5279e)]" />
                      </div>
                    </Piece>
                    <Piece on={on(2)} delay={0.08} className="h-6 rounded-md">
                      <div className="flex h-full flex-col justify-center gap-1.5 px-1">
                        <span className="h-1.5 w-[86%] rounded bg-ink/15" />
                        <span className="h-1.5 w-[70%] rounded bg-ink/15" />
                      </div>
                    </Piece>
                    <Piece on={on(3)} className="h-8 w-[70%] rounded-full">
                      <div className="flex h-full items-center gap-2">
                        <span className="relative grid h-full flex-1 place-items-center rounded-full bg-violet text-[10px] font-semibold text-white shadow-[0_8px_18px_-8px_rgb(109_60_230/0.8)]">
                          Book a call
                          {step === 7 && playing && <span className="pulse-ring absolute inset-0 rounded-full bg-violet/40" />}
                        </span>
                        <span className="h-full w-10 rounded-full border border-line-strong" />
                      </div>
                    </Piece>
                  </div>
                  <Piece on={on(4)} className="rounded-xl">
                    <div className="relative size-full overflow-hidden rounded-xl bg-[linear-gradient(150deg,#efeafd,#e7f2fb)]">
                      <span className="absolute -right-6 -top-6 size-28 rounded-full bg-[radial-gradient(circle,rgb(109_60_230/0.45),transparent_70%)]" />
                      <span className="absolute bottom-3 left-3 right-3 rounded-lg bg-white/80 p-2 shadow-sm"><span className="block h-1.5 w-2/3 rounded bg-ink/30" /><span className="mt-1.5 block h-1.5 w-1/3 rounded bg-ink/15" /></span>
                    </div>
                  </Piece>
                </div>
                <div className="grid h-[58px] grid-cols-3 gap-2.5">
                  {[0, 1, 2].map(i => (
                    <Piece key={i} on={on(5)} delay={i * 0.08} className="rounded-lg">
                      <div className="flex size-full flex-col justify-center gap-1.5 rounded-lg border border-line bg-mist/60 px-2.5">
                        <span className={cx("size-3 rounded", ["bg-violet/70", "bg-sky/70", "bg-teal/70"][i])} />
                        <span className="h-1.5 w-[80%] rounded bg-ink/25" />
                        <span className="h-1.5 w-[55%] rounded bg-ink/12" />
                      </div>
                    </Piece>
                  ))}
                </div>
              </div>
            </BrowserFrame>
          </div>

          {/* phone — the same page, responsive */}
          <motion.div
            className="absolute bottom-[22px] right-[34px] h-[250px] w-[128px] rounded-[22px] border-[5px] border-ink bg-white p-2 shadow-[0_30px_50px_-20px_rgb(23_21_31/0.45)]"
            initial={false}
            animate={on(6) ? { opacity: 1, y: 0, rotateY: -10, rotateX: 6 } : { opacity: 0, y: 30, rotateY: -25, rotateX: 6 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-ink/15" />
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between"><span className="size-2.5 rounded bg-violet" /><span className="h-1 w-4 rounded bg-ink/30" /></span>
              <span className="mt-1 h-2.5 w-[90%] rounded bg-ink/80" />
              <span className="h-2.5 w-[60%] rounded bg-[linear-gradient(90deg,#6d3ce6,#b5279e)]" />
              <span className="mt-0.5 h-1 w-[85%] rounded bg-ink/15" />
              <span className="mt-1 grid h-5 w-full place-items-center rounded-full bg-violet text-[7px] font-semibold text-white">Book a call</span>
              <span className="mt-1 h-16 rounded-lg bg-[linear-gradient(150deg,#efeafd,#e7f2fb)]" />
              <span className="h-6 rounded-md border border-line bg-mist/60" />
            </div>
          </motion.div>

          {/* cursor */}
          <motion.div
            aria-hidden
            className="absolute left-0 top-0 text-ink drop-shadow-[0_4px_6px_rgb(0_0_0/0.25)]"
            initial={false}
            animate={step >= 3 && step <= 7 ? { x: 166, y: 236, opacity: 1, scale: step === 7 ? 0.85 : 1 } : { x: 330, y: 320, opacity: 0, scale: 1 }}
            transition={{ duration: 0.8, ease }}
          >
            <svg viewBox="0 0 24 24" className="size-6"><path d="M5 3l14 7-6 2-2 6-6-15Z" fill="#17151f" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          </motion.div>
        </div>
      </div>

      {/* phase readout (not scaled, stays legible on small screens) */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-line bg-white/90 py-1.5 pl-2.5 pr-3.5 font-mono text-[11px] text-ink-2 shadow-sm backdrop-blur">
        <span className={cx("size-1.5 rounded-full", step >= 7 ? "bg-teal" : "bg-violet")} />
        <span className="text-ink-3">{step >= 7 ? "Done" : "Building"}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={webPhases[step]} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className="font-semibold text-ink">
            {webPhases[step]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =====================================================================
   02 CRM — a lead card moving through pipeline stages
   ===================================================================== */

const stages = [
  { label: "New lead", dot: "bg-sky", ghosts: 3, event: "Contact created from the website form", icon: "user" as IconName },
  { label: "Contacted", dot: "bg-violet", ghosts: 2, event: "Follow-up sent automatically", icon: "message" as IconName },
  { label: "Booked", dot: "bg-amber", ghosts: 2, event: "Appointment booked from the calendar", icon: "calendar" as IconName },
  { label: "Won", dot: "bg-teal", ghosts: 1, event: "Moved to won — source on record", icon: "check" as IconName },
];

function Ghost({ compact }: { compact: boolean }) {
  return (
    <div className={cx("flex items-center gap-2 rounded-lg border border-line bg-white", compact ? "w-[74px] shrink-0 p-1.5" : "p-2")}>
      <span className="size-5 shrink-0 rounded-full bg-mist" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="h-1.5 w-[85%] rounded bg-ink/10" />
        <span className="h-1.5 w-[55%] rounded bg-ink/[0.06]" />
      </span>
    </div>
  );
}

function HotCard({ compact }: { compact: boolean }) {
  return (
    <motion.div
      layoutId="a-crm-hot"
      transition={{ layout: { duration: 0.85, ease } }}
      className={cx("relative z-10 rounded-lg bg-white shadow-[0_16px_30px_-14px_rgb(84_40_196/0.6)] ring-2 ring-violet/55", compact ? "w-[108px] shrink-0 p-1.5" : "p-2.5")}
    >
      <div className="flex items-center gap-2">
        <span className={cx("grid shrink-0 place-items-center rounded-full bg-violet-soft text-violet", compact ? "size-5" : "size-6")}>
          <Icon name="user" className={compact ? "size-3" : "size-3.5"} />
        </span>
        <span className="min-w-0 leading-tight">
          <span className={cx("block truncate font-semibold text-ink", compact ? "text-[10.5px]" : "text-[12px]")}>New lead</span>
          <span className={cx("block truncate text-ink-3", compact ? "text-[9.5px]" : "text-[10.5px]")}>Website form</span>
        </span>
      </div>
    </motion.div>
  );
}

function CrmVisual({ playing, reduced, compact }: VisualProps) {
  const tick = useTicker(1700, playing && !reduced);
  const step = reduced ? 2 : tick % stages.length;
  const ev = stages[step];

  return (
    <div className="relative size-full p-4 sm:p-6">
      <LayoutGroup id="a-crm">
        {compact ? (
          <div className="flex h-full flex-col justify-center gap-2 pt-10">
            {stages.map((st, i) => (
              <div key={st.label} className={cx("flex items-center gap-2 rounded-xl border p-1.5 transition-colors duration-500", i === step ? "border-violet/25 bg-violet-soft/60" : "border-line bg-white/60")}>
                <span className="flex w-[76px] shrink-0 items-center gap-1.5 pl-1 text-[11px] font-semibold text-ink-2"><span className={cx("size-1.5 rounded-full", st.dot)} />{st.label}</span>
                <div className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
                  {i === step && <HotCard compact />}
                  {Array.from({ length: Math.max(1, st.ghosts - (i === step ? 1 : 0)) }).map((_, k) => <Ghost key={k} compact />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col pt-12 [perspective:1400px]">
            <div className="flex flex-1 flex-col rounded-2xl border border-line bg-white/70 p-2.5 shadow-[0_30px_60px_-30px_rgb(48_27_120/0.35)] [transform:rotateX(9deg)] [transform-origin:50%_100%]">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-[12px] font-semibold text-ink"><Icon name="database" className="size-3.5 text-violet" />Pipeline</span>
              <span className="flex gap-1.5" aria-hidden><span className="h-5 w-14 rounded-md bg-mist" /><span className="h-5 w-9 rounded-md bg-mist" /><span className="h-5 w-16 rounded-md bg-ink" /></span>
            </div>
            <div className="grid flex-1 grid-cols-4 gap-2">
              {stages.map((st, i) => (
                <div key={st.label} className={cx("flex flex-col gap-2 rounded-xl border p-2 transition-colors duration-500", i === step ? "border-violet/25 bg-violet-soft/60" : "border-line bg-mist/50")}>
                  <p className="flex items-center gap-1.5 px-0.5 pb-1 text-[11.5px] font-semibold text-ink-2">
                    <span className={cx("size-1.5 rounded-full", st.dot)} />
                    {st.label}
                  </p>
                  {i === step && <HotCard compact={false} />}
                  {Array.from({ length: st.ghosts }).map((_, k) => <Ghost key={k} compact={false} />)}
                </div>
              ))}
            </div>
            </div>
          </div>
        )}
      </LayoutGroup>

      {/* event toast */}
      <div className="absolute left-4 right-4 top-4 flex sm:left-6 sm:right-auto sm:top-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={ev.label}
            initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease }}
            className="glass flex min-w-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-white"><Icon name={ev.icon} className="size-3.5" /></span>
            <span className="truncate text-[12px] font-medium text-ink">{ev.event}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =====================================================================
   03 Paid Ads — campaign → ad sets → ads → lead, tracking loops back
   ===================================================================== */

function AdsVisual({ playing, reduced, compact }: VisualProps) {
  const [ref, box] = useBox<HTMLDivElement>();
  const tick = useTicker(900, playing && !reduced);
  const step = reduced ? 4 : tick % 7;
  const platform = reduced ? "Meta Ads" : Math.floor(tick / 7) % 2 === 0 ? "Meta Ads" : "Google Ads";
  const { w, h } = box;
  const P = (x: number, y: number): Pt => ({ x: (x / 100) * w, y: (y / 100) * h });

  const L = compact
    ? { camp: P(50, 9), sets: [P(28, 31), P(72, 31)], ads: [P(15, 54), P(38, 54), P(62, 54), P(85, 54)], lead: P(50, 76), track: [P(50, 84), P(50, 93), P(4, 93), P(4, 9), P(33, 9)], label: P(27, 93) }
    : { camp: P(14, 44), sets: [P(39, 24), P(39, 64)], ads: [P(63, 13), P(63, 35), P(63, 53), P(63, 75)], lead: P(86, 44), track: [P(86, 52), P(86, 92), P(14, 92), P(14, 53)], label: P(50, 92) };
  const curve = compact ? curveV : curveH;
  const track = `M${L.track.map(p => `${p.x} ${p.y}`).join(" L")}`;

  return (
    <div ref={ref} className="relative size-full">
      {w > 0 && (
        <>
          <svg aria-hidden className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${w} ${h}`}>
            <VizDefs w={w} h={h} />
            {L.sets.map((s, i) => <Edge key={`s${i}`} d={curve(L.camp, s)} lit={step >= 1} delay={i * 0.08} />)}
            {L.ads.map((a, i) => <Edge key={`a${i}`} d={curve(L.sets[i < 2 ? 0 : 1], a)} lit={step >= 2} delay={i * 0.06} />)}
            {L.ads.map((a, i) => <Edge key={`l${i}`} d={curve(a, L.lead)} lit={step >= 3} delay={i * 0.06} />)}
            <Edge d={track} lit={step >= 4} dashed color="url(#a-viz-grad-sky)" width={2} />
            {step >= 4 && !reduced && (
              <motion.circle
                r={4}
                fill="#0f6fb8"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
                style={{ offsetPath: `path("${track}")` }}
              />
            )}
          </svg>

          <NodeAt at={L.camp} lit={step >= 0} className={cx("flex items-center gap-2", compact ? "px-2 py-1.5" : "px-3 py-2.5")}>
            <span className="grid size-7 place-items-center rounded-lg bg-ink text-white"><Icon name="target" className="size-4" /></span>
            <span className="leading-tight">
              <span className="block text-[12px] font-semibold">Campaign</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={platform} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} className="block whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.08em] text-violet">
                  {platform}
                </motion.span>
              </AnimatePresence>
            </span>
          </NodeAt>
          {L.sets.map((s, i) => (
            <NodeAt key={i} at={s} lit={step >= 1} className={cx("flex items-center gap-1.5", compact ? "px-2 py-1.5" : "px-2.5 py-2")}>
              <Icon name="layers" className="size-3.5 text-ink-3" />
              <span className="whitespace-nowrap text-[11.5px] font-semibold">Ad set {i === 0 ? "A" : "B"}</span>
            </NodeAt>
          ))}
          {L.ads.map((a, i) => (
            <NodeAt key={i} at={a} lit={step >= 2} className={cx("overflow-hidden p-1", compact ? "w-[52px]" : "w-[78px]")}>
              <span className={cx("block rounded-md", compact ? "h-6" : "h-9", ["bg-[linear-gradient(140deg,#efeafd,#c4b5fd)]", "bg-[linear-gradient(140deg,#e7f2fb,#93c5fd)]", "bg-[linear-gradient(140deg,#fbf0e3,#fcd34d)]", "bg-[linear-gradient(140deg,#e3f4f1,#5eead4)]"][i])} />
              <span className="mt-1 block h-1 w-[80%] rounded bg-ink/20" />
              {!compact && <span className="mt-1 block h-1 w-[50%] rounded bg-ink/10" />}
            </NodeAt>
          ))}
          <NodeAt at={L.lead} lit={step >= 3} className={cx("flex items-center gap-2", compact ? "px-2 py-1.5" : "px-3 py-2.5")}>
            <span className="grid size-7 place-items-center rounded-lg bg-violet-soft text-violet"><Icon name="user" className="size-4" /></span>
            <span className="text-[12px] font-semibold">Lead</span>
          </NodeAt>
          <div
            className={cx("absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors duration-500", step >= 4 ? "border-sky/40 text-sky" : "border-line text-ink-3")}
            style={{ left: L.label.x, top: L.label.y }}
          >
            <Icon name="chart" className="size-3" /> Tracking
          </div>
        </>
      )}
    </div>
  );
}

/* =====================================================================
   04 AI & Automation — workflow nodes lighting in sequence, branching
   ===================================================================== */

const aiNodes: { id: string; title: string; sub: string; icon: IconName }[] = [
  { id: "trigger", title: "New enquiry", sub: "Form, chat or call", icon: "bolt" },
  { id: "ai", title: "AI step", sub: "Reads & qualifies", icon: "spark" },
  { id: "if", title: "Qualified?", sub: "Yes / not yet", icon: "branch" },
  { id: "yes", title: "Reply & book", sub: "Booking link sent", icon: "calendar" },
  { id: "no", title: "Nurture", sub: "Timed follow-ups", icon: "message" },
];

function AiVisual({ playing, reduced, compact }: VisualProps) {
  const [ref, box] = useBox<HTMLDivElement>();
  const tick = useTicker(850, playing && !reduced);
  const step = reduced ? 4 : tick % 6;
  const branchYes = reduced ? true : Math.floor(tick / 6) % 2 === 0;
  const { w, h } = box;
  const P = (x: number, y: number): Pt => ({ x: (x / 100) * w, y: (y / 100) * h });
  const cxp = compact ? 50 : 30, spread = compact ? 25 : 16;
  const pos = [P(cxp, 12), P(cxp, 36), P(cxp, 60), P(cxp - spread, 87), P(cxp + spread, 87)];
  const lit = (i: number) => (i <= 2 ? step >= i : step >= 3 && (i === 3 ? branchYes : !branchYes));
  const log = [
    { at: 0, text: "New enquiry received", icon: "bolt" as IconName },
    { at: 1, text: "AI read and qualified it", icon: "spark" as IconName },
    { at: 2, text: "Condition checked", icon: "branch" as IconName },
    { at: 3, text: branchYes ? "Booking link sent" : "Added to nurture sequence", icon: (branchYes ? "calendar" : "message") as IconName },
  ];

  return (
    <div ref={ref} className="relative size-full">
      {w > 0 && (
        <>
          <svg aria-hidden className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${w} ${h}`}>
            <VizDefs w={w} h={h} />
            <Edge d={curveV(pos[0], pos[1])} lit={step >= 1} />
            <Edge d={curveV(pos[1], pos[2])} lit={step >= 2} />
            <Edge d={curveV(pos[2], pos[3])} lit={lit(3)} />
            <Edge d={curveV(pos[2], pos[4])} lit={lit(4)} />
          </svg>
          {aiNodes.map((n, i) => (
            <NodeAt key={n.id} at={pos[i]} lit={lit(i)} className={cx("flex items-center gap-2", compact ? "w-[148px] px-2 py-1.5" : "w-[156px] px-2.5 py-2")}>
              <span className={cx("relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-500", lit(i) ? "bg-[linear-gradient(140deg,#6d3ce6,#b5279e)] text-white" : "bg-mist text-ink-3")}>
                <Icon name={n.icon} className="size-4" />
                {lit(i) && playing && !reduced && step === Math.min(i, 3) && <span className="pulse-ring absolute inset-0 rounded-lg bg-violet/40" />}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[12px] font-semibold">{n.title}</span>
                <span className="block truncate text-[10.5px] text-ink-3">{n.sub}</span>
              </span>
            </NodeAt>
          ))}
          {(["Yes", "Not yet"] as const).map((t, i) => {
            const b = pos[3 + i];
            return (
              <span
                key={t}
                className={cx("absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] ring-1 transition-colors duration-500", lit(3 + i) ? "text-violet ring-violet/30" : "text-ink-3 ring-line")}
                style={{ left: (pos[2].x + b.x) / 2, top: pos[2].y + (b.y - pos[2].y) * 0.52 }}
              >
                {t}
              </span>
            );
          })}

          {/* run log */}
          {!compact && (
            <div className="glass absolute right-[4%] top-[16%] flex min-h-[52%] w-[34%] flex-col rounded-2xl p-4">
              <p className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                Run log
                <span className={cx("flex items-center gap-1.5 normal-case tracking-normal", playing && !reduced ? "text-teal" : "text-ink-3")}>
                  <span className={cx("size-1.5 rounded-full", playing && !reduced ? "bg-teal" : "bg-ink-3/50")} />
                  {playing && !reduced ? "Running" : "Idle"}
                </span>
              </p>
              <ol className="mt-3 flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {log.filter(l => step >= l.at).map(l => (
                    <motion.li
                      key={`${l.at}-${l.text}`}
                      layout
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease }}
                      className="flex items-center gap-2.5 rounded-xl border border-line bg-white/80 px-2.5 py-2"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-violet-soft text-violet"><Icon name={l.icon} className="size-3.5" /></span>
                      <span className="line-clamp-2 min-w-0 flex-1 text-[11.5px] font-medium leading-tight text-ink">{l.text}</span>
                      <Icon name="check" className="size-3.5 shrink-0 text-teal" />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* =====================================================================
   05 Funnels — stacked, narrowing layers with a lead dropping through
   ===================================================================== */

const layers = ["Traffic", "Landing page", "Lead form", "Appointment", "Thank-you page"] as const;

function FunnelVisual({ playing, reduced }: VisualProps) {
  const [ref, box] = useBox<HTMLDivElement>();
  const tick = useTicker(800, playing && !reduced);
  const n = layers.length;
  const step = reduced ? n : tick % (n + 2);
  // geometry in a 520×360 space; labels share it so they always line up with their layer
  const VW = 520, VH = 360, cx0 = 150, top = 50, gap = 62, labelX = 318;
  const rx = (i: number) => 130 - i * 24;
  const ry = (i: number) => rx(i) * 0.26;
  const y = (i: number) => top + i * gap;
  const body = `M${cx0 - rx(0)} ${y(0)} L${cx0 - rx(n - 1)} ${y(n - 1)} A${rx(n - 1)} ${ry(n - 1)} 0 0 0 ${cx0 + rx(n - 1)} ${y(n - 1)} L${cx0 + rx(0)} ${y(0)} Z`;
  const dotY = step === 0 ? y(0) - 34 : step <= n ? y(step - 1) : y(n - 1) + 44;
  const fit = box.w ? Math.min(box.w / VW, box.h / VH) : 0;

  return (
    <div ref={ref} className="relative size-full">
      {fit > 0 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: VW * fit, height: VH * fit }}>
          <svg aria-hidden viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 size-full overflow-visible">
            <defs>
              <linearGradient id="a-funnel-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6d3ce6" stopOpacity="0.07" />
                <stop offset="1" stopColor="#b5279e" stopOpacity="0.14" />
              </linearGradient>
              <linearGradient id="a-funnel-plate" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#c026d3" />
              </linearGradient>
            </defs>
            <path d={body} fill="url(#a-funnel-body)" />
            {layers.map((l, i) => {
              const on = step >= i + 1;
              const current = step === i + 1 || (reduced && i === n - 1);
              return (
                <g key={l}>
                  <line x1={cx0 + rx(i) + 10} y1={y(i)} x2={labelX - 8} y2={y(i)} stroke={on ? "rgb(109 60 230 / 0.45)" : "rgb(23 21 31 / 0.12)"} strokeDasharray="2 4" />
                  <motion.g initial={false} animate={{ y: current && !reduced ? -6 : 0 }} transition={{ duration: 0.5, ease }}>
                    <ellipse cx={cx0} cy={y(i)} rx={rx(i)} ry={ry(i)} fill="#ffffff" stroke={on ? "rgb(84 40 196 / 0.55)" : "rgb(23 21 31 / 0.16)"} strokeWidth={1.2} />
                    <motion.ellipse cx={cx0} cy={y(i)} rx={rx(i)} ry={ry(i)} fill="url(#a-funnel-plate)" initial={false} animate={{ opacity: current ? 0.95 : on ? 0.3 : 0 }} transition={{ duration: 0.5, ease }} />
                    <ellipse cx={cx0} cy={y(i) - 1.5} rx={rx(i) * 0.82} ry={ry(i) * 0.6} fill="none" stroke="rgb(255 255 255 / 0.55)" strokeWidth={1} />
                  </motion.g>
                </g>
              );
            })}
            <motion.g initial={false} animate={{ y: dotY, opacity: step === n + 1 ? 0 : 1 }} transition={{ duration: 0.6, ease }}>
              <circle cx={cx0} cy={0} r={8} fill="#17151f" />
              <circle cx={cx0} cy={0} r={14} fill="none" stroke="#6d3ce6" strokeOpacity={0.35} />
            </motion.g>
            <motion.g initial={false} animate={{ opacity: step >= n ? 1 : 0, scale: step >= n ? 1 : 0.6 }} style={{ transformOrigin: `${cx0}px ${y(n - 1) + 44}px` }} transition={{ duration: 0.5, ease }}>
              <circle cx={cx0} cy={y(n - 1) + 44} r={13} fill="#0b7c74" />
              <path d={`M${cx0 - 5.5} ${y(n - 1) + 44} l3.8 3.8 l7.4 -8.4`} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
          </svg>
          <ol>
            {layers.map((l, i) => {
              const on = step >= i + 1;
              const current = step === i + 1 || (reduced && i === n - 1);
              return (
                <li
                  key={l}
                  className={cx(
                    "absolute -translate-y-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-all duration-500 sm:text-[12.5px]",
                    current ? "border-transparent bg-ink text-white shadow-[0_10px_22px_-10px_rgb(23_21_31/0.6)]" : on ? "border-violet/25 bg-white text-ink" : "border-line bg-white/60 text-ink-3",
                  )}
                  style={{ left: `${(labelX / VW) * 100}%`, top: `${(y(i) / VH) * 100}%` }}
                >
                  {l}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ===================================================================== */

export const serviceVisuals: Record<ServiceId, (p: VisualProps) => React.JSX.Element> = {
  web: WebVisual,
  crm: CrmVisual,
  ads: AdsVisual,
  ai: AiVisual,
  funnels: FunnelVisual,
};

/** Plain-language text equivalent for each diagram. */
export const visualDescriptions: Record<ServiceId, string> = {
  web: "Illustration: a landing page assembling itself — navigation, headline, call-to-action button, hero visual and sections — then the same page shown on a phone.",
  crm: "Illustration: a CRM pipeline with stages New lead, Contacted, Booked and Won; a lead card moves from stage to stage as follow-ups and bookings happen.",
  ads: "Illustration: an ad campaign branching into two ad sets and four ads that lead to a captured lead, with a tracking line feeding results back to the campaign.",
  ai: "Illustration: an automation workflow — a new enquiry triggers an AI step that qualifies it, then a condition routes it to reply-and-book or a nurture sequence.",
  funnels: "Illustration: a funnel of narrowing layers — traffic, landing page, lead form, appointment and thank-you page — with a lead dropping through to a booked outcome.",
};
