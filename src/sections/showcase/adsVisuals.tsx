import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Icon, IllustrativeTag, cx, type IconName } from "../../components/ui";
import { ease } from "../../lib/hooks";

/* ======================================================================
   Paid-ads illustrations. Generic labels only — no brands, no people,
   and never any performance numbers.
   ====================================================================== */

export type PlatformId = "meta" | "google";

type Tree = {
  campaign: { title: string; note: string };
  level2: string;
  level3: string;
  groups: { title: string; note: string; ads: { title: string; note: string }[] }[];
};

type PlatformInfo = { label: string; short: string; tree: Tree; levels: [string, string][]; notes: string[] };

export const platforms: Record<PlatformId, PlatformInfo> = {
  meta: {
    label: "Meta Ads",
    short: "Meta",
    levels: [["Campaign", "sets the goal"], ["Ad sets", "choose who sees it"], ["Ads", "are what people see"]],
    notes: ["Feed placement", "Image, video or carousel", "Lead objective"],
    tree: {
      campaign: { title: "Campaign", note: "Lead objective" },
      level2: "Ad sets",
      level3: "Ads",
      groups: [
        { title: "Ad set A", note: "Cold audience", ads: [{ title: "Image ad", note: "Single image" }, { title: "Video ad", note: "Short video" }] },
        { title: "Ad set B", note: "Retargeting", ads: [{ title: "Carousel ad", note: "Multiple cards" }] },
      ],
    },
  },
  google: {
    label: "Google Ads",
    short: "Google",
    levels: [["Campaign", "sets the goal"], ["Ad groups", "group keyword themes"], ["Ads", "match the search"]],
    notes: ["Search results", "Responsive search ad", "Keyword themes"],
    tree: {
      campaign: { title: "Campaign", note: "Search · lead goal" },
      level2: "Ad groups",
      level3: "Ads",
      groups: [
        { title: "Ad group A", note: "Service keywords", ads: [{ title: "Search ad", note: "Responsive · version A" }, { title: "Search ad", note: "Responsive · version B" }] },
        { title: "Ad group B", note: "Location keywords", ads: [{ title: "Search ad", note: "Responsive" }] },
      ],
    },
  },
};

/* ---------------- account structure diagram ---------------- */

const tone: Record<PlatformId, { dot: string; soft: string; text: string; stroke: string }> = {
  meta: { dot: "bg-violet", soft: "bg-violet-soft", text: "text-violet", stroke: "#6d3ce6" },
  google: { dot: "bg-sky", soft: "bg-sky-soft", text: "text-sky", stroke: "#0f6fb8" },
};

function Node({ title, note, icon, p, level, delay }: { title: string; note?: string; icon: IconName; p: PlatformId; level: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease, delay }}
      className={cx("relative flex w-full items-center gap-2.5 rounded-xl border bg-white px-2.5 py-2 shadow-[0_1px_2px_rgb(23_21_31/0.05),0_10px_24px_-18px_rgb(23_21_31/0.35)]", level === 0 ? "border-transparent ring-1 ring-ink/10" : "border-line")}
    >
      <span className={cx("grid size-8 shrink-0 place-items-center rounded-lg", level === 0 ? "bg-ink text-white" : cx(tone[p].soft, tone[p].text))}>
        <Icon name={icon} className="size-4" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[13px] font-semibold text-ink">{title}</span>
        {note && <span className="block truncate text-[11.5px] text-ink-3">{note}</span>}
      </span>
    </motion.div>
  );
}

/** Rows for the three-column tree: ads at 3 rows, groups aligned to their ads. */
const COL = [0, 37, 74] as const;
const COL_W = 26;

export function StructureDiagram({ p }: { p: PlatformId }) {
  const wrap = useRef<HTMLDivElement>(null);
  const live = useInView(wrap, { amount: 0.2 });
  const { tree } = platforms[p];
  const s = tone[p].stroke;
  const ads = tree.groups.flatMap((g, gi) => g.ads.map((a, ai) => ({ a, gi, key: `${gi}-${ai}` })));
  const rowsY = ads.map((_, i) => (ads.length === 1 ? 50 : 14 + (i / (ads.length - 1)) * 72));
  const groupY = tree.groups.map((_, gi) => {
    const ys = ads.map((x, i) => (x.gi === gi ? rowsY[i] : null)).filter((v): v is number => v !== null);
    return ys.reduce((a, b) => a + b, 0) / ys.length;
  });
  const campY = groupY.reduce((a, b) => a + b, 0) / groupY.length;
  const elbow = (x1: number, y1: number, x2: number, y2: number) => { const m = (x1 + x2) / 2; return `M${x1} ${y1} H${m} V${y2} H${x2}`; };
  const links = [
    ...groupY.map((gy, gi) => ({ key: `c${gi}`, d: elbow(COL_W, campY, COL[1], gy), delay: 0.12 })),
    ...ads.map((x, i) => ({ key: `a${x.key}`, d: elbow(COL[1] + COL_W, groupY[x.gi], COL[2], rowsY[i]), delay: 0.3 })),
  ];
  const dot = <span aria-hidden className={cx("absolute -left-[5px] top-1/2 z-10 size-2.5 -translate-y-1/2 rounded-full border-2 border-white", tone[p].dot)} />;

  return (
    <div ref={wrap}>
      {/* column headings */}
      <div className="relative mb-3 h-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3" aria-hidden>
        {["Campaign", tree.level2, tree.level3].map((h, i) => <span key={h} className="absolute top-0" style={{ left: `${COL[i]}%` }}>{h}</span>)}
      </div>
      <div className="relative h-[280px]" aria-hidden>
        <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {links.map(l => (
            <g key={`${p}${l.key}`}>
              <motion.path d={l.d} fill="none" stroke={s} strokeOpacity={0.35} strokeWidth={1.25} strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease, delay: l.delay }} />
              <path d={l.d} fill="none" stroke={s} strokeOpacity={0.7} strokeWidth={1.25} vectorEffect="non-scaling-stroke" className={live ? "flow-dash" : undefined} strokeDasharray="5 9" />
            </g>
          ))}
        </svg>
        <div key={p}>
          <div className="absolute -translate-y-1/2" style={{ left: `${COL[0]}%`, width: `${COL_W}%`, top: `${campY}%` }}>
            <Node title={tree.campaign.title} note={tree.campaign.note} icon="target" p={p} level={0} delay={0} />
          </div>
          {tree.groups.map((g, gi) => (
            <div key={g.title} className="absolute -translate-y-1/2" style={{ left: `${COL[1]}%`, width: `${COL_W}%`, top: `${groupY[gi]}%` }}>
              {dot}
              <Node title={g.title} note={g.note} icon="user" p={p} level={1} delay={0.15 + gi * 0.06} />
            </div>
          ))}
          {ads.map((x, i) => (
            <div key={x.key} className="absolute -translate-y-1/2" style={{ left: `${COL[2]}%`, width: `${COL_W}%`, top: `${rowsY[i]}%` }}>
              {dot}
              <Node title={x.a.title} note={x.a.note} icon={p === "meta" ? "image" : "globe"} p={p} level={2} delay={0.3 + i * 0.06} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Nested list version — used on small screens and as the text equivalent of the diagram. */
export function StructureList({ p, className }: { p: PlatformId; className?: string }) {
  const { tree, label } = platforms[p];
  return (
    <ul className={className} aria-label={`${label} account structure`}>
      <li>
        <span className="flex items-center gap-2 text-[14px] font-semibold"><span className={cx("size-2 rounded-full", tone[p].dot)} />{tree.campaign.title} <span className="font-normal text-ink-3">· {tree.campaign.note}</span></span>
        <ul className="ml-[3px] mt-2 flex flex-col gap-2 border-l border-line-strong pl-4">
          {tree.groups.map(g => (
            <li key={g.title}>
              <span className="text-[13.5px] font-medium">{g.title} <span className="font-normal text-ink-3">· {g.note}</span></span>
              <ul className="ml-[3px] mt-1.5 flex flex-col gap-1.5 border-l border-dashed border-line-strong pl-4">
                {g.ads.map((a, i) => <li key={i} className="flex items-center gap-2 text-[13px] text-ink-2"><span className={cx("grid size-5 place-items-center rounded-md", tone[p].soft, tone[p].text)}><Icon name={p === "meta" ? "image" : "globe"} className="size-3" /></span>{a.title} <span className="text-ink-3">· {a.note}</span></li>)}
              </ul>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}

/* ---------------- ad creative previews (generic copy, no brand) ---------------- */

export function AdPreview({ p }: { p: PlatformId }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={p} initial={{ opacity: 0, y: 14, rotateX: -8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease }} style={{ transformPerspective: 900 }}>
        {p === "meta" ? <MetaAd /> : <SearchAd />}
      </motion.div>
    </AnimatePresence>
  );
}

function MetaAd() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-30px_rgb(48_27_120/0.35)]">
      <div className="flex items-center gap-2.5 p-3">
        <span className="size-8 rounded-full bg-gradient-to-br from-violet to-fuchsia" />
        <span className="leading-tight">
          <span className="block text-[12.5px] font-semibold">Your Business</span>
          <span className="block text-[11px] text-ink-3">Sponsored</span>
        </span>
        <span className="ml-auto flex gap-0.5" aria-hidden><span className="size-1 rounded-full bg-ink/30" /><span className="size-1 rounded-full bg-ink/30" /><span className="size-1 rounded-full bg-ink/30" /></span>
      </div>
      <p className="px-3 pb-3 text-[12.5px] leading-snug text-ink-2">Need more enquiries from your website? Book a free consultation and see what's possible.</p>
      <div className="relative aspect-[1.25] overflow-hidden bg-gradient-to-br from-violet via-fuchsia to-sky">
        <div className="absolute -left-10 top-6 size-40 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute inset-x-[16%] top-[18%] rounded-xl bg-white/90 p-3 shadow-xl">
          <span className="block h-2 w-1/2 rounded-full bg-ink/70" />
          <span className="mt-2 block h-1.5 w-4/5 rounded-full bg-ink/15" />
          <span className="mt-1 block h-1.5 w-3/5 rounded-full bg-ink/15" />
          <span className="mt-3 block h-5 w-20 rounded-full bg-violet" />
        </div>
        <div className="absolute bottom-[12%] right-[10%] grid size-12 place-items-center rounded-2xl bg-white/90 text-violet shadow-lg"><Icon name="calendar" className="size-5" /></div>
      </div>
      <div className="flex items-center justify-between gap-3 bg-mist/70 px-3 py-2.5">
        <span className="min-w-0 leading-tight">
          <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">example.com</span>
          <span className="block truncate text-[12.5px] font-semibold">Book a free consultation</span>
        </span>
        <span className="shrink-0 rounded-md bg-ink/[0.08] px-3 py-1.5 text-[12px] font-semibold">Learn more</span>
      </div>
    </div>
  );
}

function SearchAd() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 shadow-sm">
        <Icon name="globe" className="size-4 text-ink-3" />
        <span className="text-[13px] text-ink-2">service near me</span>
        <span className="ml-auto h-4 w-px animate-pulse bg-ink/40 motion-reduce:animate-none" aria-hidden />
      </div>
      <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_30px_60px_-30px_rgb(15_60_120/0.35)]">
        <p className="text-[11.5px] font-semibold text-ink">Sponsored</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-sky-soft text-sky"><Icon name="globe" className="size-3.5" /></span>
          <span className="leading-tight">
            <span className="block text-[12px] text-ink">Your Business</span>
            <span className="block text-[11px] text-ink-3">example.com</span>
          </span>
        </div>
        <p className="mt-2 text-[16px] font-medium leading-snug text-sky">Your Service in Your City — Book a Free Consultation</p>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-2">Clear pricing, fast replies and an easy online booking. Get in touch today.</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-[12.5px] text-sky">
          <span>Services</span><span>Book a call</span><span>Contact</span>
        </div>
      </div>
      {[0, 1].map(i => (
        <div key={i} className="rounded-2xl border border-line bg-white/60 p-4 opacity-60" aria-hidden>
          <span className="block h-2 w-24 rounded-full bg-ink/15" />
          <span className="mt-2.5 block h-2.5 w-4/5 rounded-full bg-sky/30" />
          <span className="mt-2 block h-2 w-3/5 rounded-full bg-ink/10" />
        </div>
      ))}
    </div>
  );
}

/* ---------------- tracking flow with a travelling pulse ---------------- */

const trackSteps: { id: string; label: string; detail: string; icon: IconName }[] = [
  { id: "click", label: "Ad click", detail: "Campaign tags travel in the link.", icon: "cursor" },
  { id: "page", label: "Landing page", detail: "The visit is tracked on the page.", icon: "globe" },
  { id: "event", label: "Form submit event", detail: "A lead event fires when the form is sent.", icon: "bolt" },
  { id: "crm", label: "CRM", detail: "The contact is saved with its source.", icon: "database" },
  { id: "report", label: "Reporting", detail: "Each lead traces back to its campaign.", icon: "chart" },
];

export function TrackingFlow() {
  const reduced = useReducedMotion();

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState(false);
  const playing = inView && !reduced && !hold;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep(s => (s + 1) % trackSteps.length), 1300);
    return () => clearInterval(t);
  }, [playing]);

  const n = trackSteps.length;
  // measure icon centres so the track, fill and pulse line up at every breakpoint
  const olRef = useRef<HTMLOListElement>(null);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [pts, setPts] = useState<{ x: number; y: number }[]>([]);
  useLayoutEffect(() => {
    const ol = olRef.current;
    if (!ol) return;
    const measure = () => {
      const o = ol.getBoundingClientRect();
      setPts(iconRefs.current.map(el => {
        const r = el?.getBoundingClientRect();
        return r ? { x: r.left - o.left + r.width / 2, y: r.top - o.top + r.height / 2 } : { x: 0, y: 0 };
      }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, []);
  const first = pts[0], last = pts[n - 1], cur = pts[step];
  const vertical = !!first && !!last && Math.abs(last.y - first.y) > Math.abs(last.x - first.x);

  return (
    <div ref={ref} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)} className="relative">
        {first && last && cur && (
          <>
            {/* track */}
            <span aria-hidden className="absolute bg-line-strong" style={vertical ? { left: first.x, top: first.y, width: 1, height: last.y - first.y } : { left: first.x, top: first.y, height: 1, width: last.x - first.x }} />
            <motion.span
              aria-hidden
              className={cx("absolute from-violet to-sky", vertical ? "bg-gradient-to-b" : "bg-gradient-to-r")}
              style={vertical ? { left: first.x, top: first.y, width: 1 } : { left: first.x, top: first.y, height: 1 }}
              initial={false}
              animate={vertical ? { height: cur.y - first.y } : { width: cur.x - first.x }}
              transition={{ duration: reduced ? 0 : 0.9, ease }}
            />
            {/* travelling pulse (sits under the icons, so it shows on the line between nodes) */}
            <motion.span
              aria-hidden
              className="absolute left-0 top-0 -ml-[6px] -mt-[6px] size-3 rounded-full bg-violet shadow-[0_0_0_5px_rgb(109_60_230/0.16),0_0_22px_rgb(109_60_230/0.7)]"
              initial={false}
              animate={{ x: cur.x, y: cur.y }}
              transition={{ duration: reduced ? 0 : 0.9, ease }}
            />
          </>
        )}
      <ol ref={olRef} className="relative grid gap-5 md:grid-cols-5 md:gap-4" aria-label="Tracking flow">
        {trackSteps.map((s, i) => {
          const on = i === step, past = i < step;
          return (
            <li key={s.id} className="relative">
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={on ? "step" : undefined}
                className="group flex w-full items-start gap-4 rounded-2xl p-0 text-left md:flex-col md:items-center md:gap-3 md:text-center"
              >
                <span ref={el => { iconRefs.current[i] = el; }} className={cx("relative z-[1] grid size-14 shrink-0 place-items-center rounded-2xl border transition-[background-color,border-color,color,box-shadow] duration-300", on ? "border-transparent bg-ink text-white shadow-[0_14px_30px_-12px_rgb(23_21_31/0.55)]" : past ? "border-violet/25 bg-violet-soft text-violet" : "border-line bg-white text-ink-2 group-hover:border-violet/40")}>
                  <Icon name={s.icon} className="size-[22px]" />
                </span>
                {on && playing && <span aria-hidden className="pulse-ring pointer-events-none absolute left-0 top-0 size-14 rounded-2xl bg-violet/35 md:left-1/2 md:-ml-7" />}
                <span className="min-w-0 pt-1.5 md:pt-0">
                  <span className="block font-mono text-[10.5px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <span className={cx("block font-display text-[16px] font-semibold tracking-[-0.01em] transition-colors", on ? "text-ink" : "text-ink-2")}>{s.label}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-ink-3">{s.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- reporting dashboard mock — shapes only, no values ---------------- */

const kpis = ["Leads", "Cost per lead", "Booked calls", "Ad spend"];

export function ReportMock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const bars = [0.42, 0.58, 0.5, 0.72, 0.64, 0.8, 0.7, 0.88];
  return (
    <div ref={ref} className="surface-lg relative flex h-full flex-col overflow-hidden rounded-[24px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-mist/50 px-5 py-3.5">
        <span className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-ink text-white"><Icon name="chart" className="size-4" /></span>
          <span className="text-[13.5px] font-semibold">Campaign report</span>
        </span>
        <IllustrativeTag />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-2 rounded-full bg-amber-soft px-3 py-1 text-[12px] font-medium text-amber">
          <Icon name="check" className="size-3.5" /> Metrics shown only when verified
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {kpis.map((k, i) => (
            <div key={k} className="rounded-xl border border-line bg-white p-3">
              <p className="text-[11.5px] font-medium text-ink-3">{k}</p>
              <span className="mt-2.5 block h-4 w-3/4 overflow-hidden rounded-md bg-ink/[0.06]" aria-label="No verified value yet" role="img">
                <motion.span className="block h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent" initial={{ x: "-100%" }} animate={inView ? { x: "220%" } : undefined} transition={{ duration: 1.4, ease, delay: 0.3 + i * 0.1 }} />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border border-line bg-white p-3.5">
            <div className="flex items-center justify-between"><span className="text-[12px] font-medium text-ink-2">Leads over time</span><span className="flex gap-3 text-[11px] text-ink-3"><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-violet" />Meta</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-sky" />Google</span></span></div>
            <svg viewBox="0 0 300 110" className="mt-2 h-28 w-full" preserveAspectRatio="none" aria-hidden>
              {[20, 50, 80].map(y => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="rgb(23 21 31 / 0.06)" strokeDasharray="3 4" />)}
              <defs><linearGradient id="rep-a" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6d3ce6" stopOpacity="0.2" /><stop offset="1" stopColor="#6d3ce6" stopOpacity="0" /></linearGradient></defs>
              <motion.path d="M0 88 C30 84 50 70 80 72 S130 52 160 56 S220 34 250 30 S285 22 300 18 V110 H0Z" fill="url(#rep-a)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : undefined} transition={{ duration: 1, delay: 0.8 }} />
              <motion.path d="M0 88 C30 84 50 70 80 72 S130 52 160 56 S220 34 250 30 S285 22 300 18" fill="none" stroke="#6d3ce6" strokeWidth="2" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : undefined} transition={{ duration: 1.4, ease, delay: 0.2 }} />
              <motion.path d="M0 96 C40 94 60 86 90 84 S140 74 170 76 S230 60 260 58 S290 52 300 50" fill="none" stroke="#0f6fb8" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : undefined} transition={{ duration: 1.4, ease, delay: 0.4 }} />
            </svg>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border border-line bg-white p-3.5 sm:grid-cols-1 sm:items-start">
            <span className="text-[12px] font-medium text-ink-2 sm:order-first">Leads by source</span>
            <svg viewBox="0 0 42 42" className="size-20 -rotate-90 sm:mx-auto sm:size-24" aria-hidden>
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="rgb(23 21 31 / 0.06)" strokeWidth="6" />
              <motion.circle cx="21" cy="21" r="15.9" fill="none" stroke="#6d3ce6" strokeWidth="6" strokeLinecap="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 0.55 } : undefined} transition={{ duration: 1.2, ease, delay: 0.4 }} />
              <motion.circle cx="21" cy="21" r="15.9" fill="none" stroke="#0f6fb8" strokeWidth="6" strokeLinecap="round" style={{ rotate: 210, originX: "50%", originY: "50%" }} initial={{ pathLength: 0 }} animate={inView ? { pathLength: 0.3 } : undefined} transition={{ duration: 1.2, ease, delay: 0.6 }} />
            </svg>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-line bg-white p-3.5">
          <span className="text-[12px] font-medium text-ink-2">Booked calls by week</span>
          <div className="mt-3 flex h-16 items-end gap-2" aria-hidden>
            {bars.map((b, i) => (
              <motion.span key={i} className="flex-1 origin-bottom rounded-t-md bg-gradient-to-t from-violet/70 to-fuchsia/50" style={{ height: `${b * 100}%` }} initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : undefined} transition={{ duration: 0.8, ease, delay: 0.3 + i * 0.05 }} />
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-1 flex-col rounded-xl border border-line bg-white">
          <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 border-b border-line px-3.5 py-2.5 text-[11px] font-medium text-ink-3">
            <span>Campaign</span><span>Status</span><span>Leads</span><span className="truncate">Cost per lead</span>
          </div>
          <div className="flex flex-1 flex-col justify-around" aria-hidden>
            {["violet", "sky", "violet"].map((c, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] items-center gap-3 border-b border-line/60 px-3.5 py-2.5 last:border-0">
                <span className="flex min-w-0 items-center gap-2"><span className={cx("size-2 shrink-0 rounded-full", c === "violet" ? "bg-violet" : "bg-sky")} /><span className="block h-2 rounded-full bg-ink/15" style={{ width: `${78 - i * 14}%` }} /></span>
                <span><span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium", i === 2 ? "bg-mist text-ink-3" : "bg-teal-soft text-teal")}><span className={cx("size-1.5 rounded-full", i === 2 ? "bg-ink-3/60" : "bg-teal")} />{i === 2 ? "Paused" : "Active"}</span></span>
                <span className="block h-2 w-3/5 rounded-full bg-ink/[0.07]" />
                <span className="block h-2 w-3/5 rounded-full bg-ink/[0.07]" />
              </div>
            ))}
          </div>
        </div>
        <p className="sr-only">Illustrative reporting dashboard layout with leads, cost per lead, booked calls and ad spend. No values are shown until verified figures are available.</p>
      </div>
    </div>
  );
}
