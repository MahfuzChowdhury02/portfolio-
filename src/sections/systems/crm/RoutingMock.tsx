import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Icon, cx } from "../../../components/ui";
import { useMediaQuery } from "../../../lib/hooks";
import { BIcon, MockButton, Segmented, StatusLine, useScript } from "../shared";

type Mode = "robin" | "source";
type Pt = { x: number; y: number };
type Geo = { w: number; h: number; src: Pt; router: Pt; reps: Pt[] };

const wide: Geo = { w: 800, h: 330, src: { x: 120, y: 165 }, router: { x: 400, y: 165 }, reps: [{ x: 680, y: 62 }, { x: 680, y: 165 }, { x: 680, y: 268 }] };
const tall: Geo = { w: 340, h: 470, src: { x: 170, y: 52 }, router: { x: 170, y: 220 }, reps: [{ x: 58, y: 400 }, { x: 170, y: 400 }, { x: 282, y: 400 }] };

const reps = ["Rep A", "Rep B", "Rep C"] as const;
const sources = ["Website form", "Ad lead form", "Phone call"] as const;
const sourceRule = ["Website → Rep A", "Ads → Rep B", "Calls → Rep C"] as const;
/** the order sources arrive in, so the two rules visibly differ */
const arrivals = [0, 1, 0, 2, 1, 0] as const;

type Lead = { id: number; rep: number; source: number; arrived: boolean };

const curve = (g: Geo, a: Pt, b: Pt) =>
  g === wide ? `M${a.x} ${a.y} C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}` : `M${a.x} ${a.y} C${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}`;

export function RoutingMock({ active }: { active: boolean }) {
  const md = useMediaQuery("(min-width: 768px)");
  const g = md ? wide : tall;
  const [mode, setMode] = useState<Mode>("robin");
  const [leads, setLeads] = useState<Lead[]>([]);
  const nextId = useRef(0);
  const s = useScript(3, active, 1600, 700);
  const sentFor = useRef(0);

  const send = () => {
    const id = nextId.current++;
    const source = arrivals[id % arrivals.length];
    const rep = mode === "robin" ? id % 3 : source;
    setLeads(ls => [...ls.slice(-11), { id, rep, source, arrived: !!s.reduced }]);
  };

  // autoplay: one lead per script tick
  useEffect(() => {
    if (s.reduced) return;
    while (sentFor.current < s.i) { sentFor.current++; send(); }
  }, [s.i]);

  // reduced motion: show a settled state with one lead per rep
  useEffect(() => {
    if (s.reduced && leads.length === 0) { setLeads([0, 1, 2].map(i => ({ id: i, rep: i, source: arrivals[i], arrived: true }))); nextId.current = 3; }
  }, [s.reduced]);

  const reset = (m: Mode = mode) => {
    setMode(m);
    setLeads([]);
    nextId.current = 0;
    sentFor.current = 0;
    s.replay();
  };

  const arrive = (id: number) => setLeads(ls => ls.map(l => (l.id === id ? { ...l, arrived: true } : l)));
  const lastArrived = [...leads].reverse().find(l => l.arrived);
  const nextSource = sources[arrivals[nextId.current % arrivals.length]];
  const pct = (p: Pt) => ({ left: `${(p.x / g.w) * 100}%`, top: `${(p.y / g.h) * 100}%` });

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<Mode> label="Routing rule" value={mode} onChange={m => reset(m)} options={[{ id: "robin", label: "Round robin" }, { id: "source", label: "By source" }]} />
        <MockButton primary onClick={send}><BIcon name="send" className="size-3.5" /> Send a new lead</MockButton>
      </div>

      <div className="dot-grid relative mx-auto w-full overflow-hidden rounded-2xl border border-line bg-mist/50" style={{ aspectRatio: `${g.w} / ${g.h}`, maxWidth: md ? undefined : 380 }}>
        <svg aria-hidden viewBox={`0 0 ${g.w} ${g.h}`} className="absolute inset-0 size-full">
          <path d={curve(g, g.src, g.router)} fill="none" stroke="rgb(23 21 31 / 0.16)" strokeWidth={2} />
          {g.reps.map((r, i) => (
            <path key={i} d={curve(g, g.router, r)} fill="none" stroke={lastArrived?.rep === i ? "#6d3ce6" : "rgb(23 21 31 / 0.16)"} strokeWidth={2} className="transition-[stroke] duration-500" />
          ))}
          {leads.filter(l => !l.arrived).map(l => {
            const r = g.reps[l.rep];
            return (
              <motion.circle
                key={l.id}
                r={7}
                fill="#6d3ce6"
                stroke="#fff"
                strokeWidth={3}
                initial={{ cx: g.src.x, cy: g.src.y }}
                animate={{ cx: [g.src.x, g.router.x, r.x], cy: [g.src.y, g.router.y, r.y] }}
                transition={{ duration: 1.3, ease: "easeInOut", times: [0, 0.45, 1] }}
                onAnimationComplete={() => arrive(l.id)}
              />
            );
          })}
        </svg>

        {/* incoming */}
        <div className="absolute w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-white p-2.5 shadow-[0_10px_24px_-18px_rgb(23_21_31/0.5)] md:w-[170px]" style={pct(g.src)}>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">Incoming</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold"><Icon name="user" className="size-3.5 text-violet" /> New lead</p>
          <p className="mt-0.5 truncate text-[11px] text-ink-3">Next from: {nextSource}</p>
        </div>

        {/* router */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(g.router)}>
          <div className="flex items-center gap-2 rounded-full bg-ink py-2 pl-2 pr-3.5 text-white shadow-[0_14px_28px_-14px_rgb(23_21_31/0.7)]">
            <span className="grid size-7 place-items-center rounded-full bg-white/15"><BIcon name="route" className="size-3.5" /></span>
            <span className="whitespace-nowrap text-[12.5px] font-semibold">{mode === "robin" ? "Round robin" : "Route by source"}</span>
          </div>
        </div>

        {/* reps */}
        {g.reps.map((p, i) => {
          const mine = leads.filter(l => l.rep === i && l.arrived);
          const ping = lastArrived?.rep === i;
          return (
            <div key={i} className={cx("absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-2 transition-[border-color,box-shadow] duration-500", md ? "w-[150px]" : "w-[96px]", ping ? "border-violet/40 shadow-[0_0_0_3px_rgb(109_60_230/0.10)]" : "border-line")} style={pct(p)}>
              <div className="flex items-center gap-1.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-soft font-mono text-[10.5px] font-bold text-violet">{reps[i].slice(-1)}</span>
                <span className="text-[12px] font-semibold">{reps[i]}</span>
                {ping && <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-amber-soft text-amber ring-2 ring-white"><BIcon name="bell" className="size-3" /></span>}
              </div>
              <div className="mt-1.5 flex min-h-4 flex-wrap gap-1" aria-label={`${reps[i]} leads`}>
                {mine.slice(-4).map(l => (
                  <motion.span key={l.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="size-3.5 rounded-full bg-violet/80 ring-2 ring-violet-soft" />
                ))}
              </div>
              {mode === "source" && md && <p className="mt-1 truncate text-[10.5px] text-ink-3">{sourceRule[i]}</p>}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusLine>{lastArrived ? `${sources[lastArrived.source]} lead assigned to ${reps[lastArrived.rep]} — owner notified` : "Leads are assigned the moment they arrive."}</StatusLine>
        <MockButton onClick={() => reset()} label="Reset the routing demo"><Icon name="replay" className="size-3.5" /></MockButton>
      </div>
    </div>
  );
}
