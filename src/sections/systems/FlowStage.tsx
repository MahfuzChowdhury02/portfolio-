import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Icon, cx } from "../../components/ui";
import { ease } from "../../lib/hooks";
import { asIcon, tints } from "./shared";
import { LAST, TRAVEL_MS, stepTint, steps, type FlowRunner } from "./flow";

/* Board geometry, in viewBox units. The board keeps this aspect ratio so % positions and SVG coords agree. */
const W = 1000;
const H = 700;
const ys = [206, 500, 184, 486, 194, 512, 210];
const pos = steps.map((_, i) => ({ x: 100 + (i * 800) / LAST, y: ys[i] }));
const depth = [44, 72, 104, 60, 92, 52, 80];
const LIFT = 46;
const edge = (i: number) => {
  const a = pos[i], b = pos[i + 1], mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
};
const edges = steps.slice(0, -1).map((_, i) => edge(i));

type Props = {
  runner: FlowRunner;
  preview: number | null;
  setPreview: (i: number | null) => void;
};

export function FlowStage({ runner, preview, setPreview }: Props) {
  const reduced = useReducedMotion();
  const { step, traveling } = runner;
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  /* tilt: scroll eases the board from steep to relaxed; the pointer adds a gentle parallax */
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start end", "center center"] });
  const mx = useSpring(0, { stiffness: 70, damping: 18 });
  const my = useSpring(0, { stiffness: 70, damping: 18 });
  const rotateX = useTransform([scrollYProgress, my], ([s, y]: number[]) => (reduced ? 22 : 46 - s * 22 - y * 7));
  const rotateY = useTransform(mx, v => (reduced ? 0 : v * 9));
  const rotateZ = useTransform(mx, v => (reduced ? 0 : v * -1.2));
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  /* packet position along the active edge (motion values only — no per-frame React state) */
  const px = useMotionValue(pos[0].x);
  const py = useMotionValue(pos[0].y);
  const trail = useMotionValue(0);

  useEffect(() => {
    if (traveling === null) {
      px.set(pos[step].x);
      py.set(pos[step].y);
      trail.set(0);
      return;
    }
    const path = pathRefs.current[traveling];
    if (!path) return;
    const len = path.getTotalLength();
    const c = animate(0, 1, {
      duration: TRAVEL_MS / 1000,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: v => {
        const p = path.getPointAtLength(v * len);
        px.set(p.x);
        py.set(p.y);
        trail.set(v);
      },
    });
    return () => c.stop();
  }, [traveling, step, px, py, trail]);

  const shown = preview ?? step;

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
      className="relative h-full min-h-[560px] [perspective:1700px] [perspective-origin:50%_30%]"
    >
      <motion.div
        className="absolute inset-x-[2%] top-[9%] [transform-style:preserve-3d]"
        style={{ aspectRatio: `${W} / ${H}`, rotateX, rotateY, rotateZ }}
      >
        {/* the board */}
        <div aria-hidden className="absolute inset-0 rounded-[28px] border border-white bg-[linear-gradient(160deg,#ffffff_0%,#f7f4ff_55%,#efe9fd_100%)] shadow-[0_1px_0_#fff_inset,0_0_0_1px_rgb(109_60_230/0.10),0_60px_120px_-50px_rgb(48_27_120/0.45)]">
          <div className="dot-grid absolute inset-0 rounded-[28px] opacity-70 [mask-image:radial-gradient(75%_70%_at_50%_50%,#000,transparent)]" />
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full">
            <defs>
              <linearGradient id="b-flow-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#6d3ce6" />
                <stop offset="0.55" stopColor="#b5279e" />
                <stop offset="1" stopColor="#0f6fb8" />
              </linearGradient>
              <radialGradient id="b-flow-glow">
                <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.9" />
                <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* concentric guide rings */}
            {[120, 210, 300].map(r => (
              <ellipse key={r} cx={W / 2} cy={H / 2} rx={r * 1.6} ry={r} fill="none" stroke="rgb(109 60 230 / 0.07)" strokeDasharray="2 8" />
            ))}
            {/* printed board labels */}
            <g fontFamily="JetBrains Mono Variable, monospace" fontSize="13" letterSpacing="2.4" fill="rgb(23 21 31 / 0.38)">
              <text x={44} y={H - 40}>NEW ENQUIRY → BOOKED CALL</text>
              <text x={W - 44} y={H - 40} textAnchor="end">EVERY STEP TRACKED</text>
            </g>
            <line x1={44} x2={W - 44} y1={H - 70} y2={H - 70} stroke="rgb(23 21 31 / 0.07)" strokeDasharray="4 6" />
            {/* base rails */}
            {edges.map((d, i) => (
              <path key={`b${i}`} ref={el => { pathRefs.current[i] = el; }} d={d} fill="none" stroke="rgb(23 21 31 / 0.10)" strokeWidth={3} strokeLinecap="round" />
            ))}
            {/* ambient data dashes */}
            {edges.map((d, i) => (
              <path key={`d${i}`} d={d} fill="none" stroke="rgb(109 60 230 / 0.35)" strokeWidth={1.6} strokeLinecap="round" className={cx(!reduced && "flow-dash")} opacity={reduced ? 0 : 1} />
            ))}
            {/* completed trail */}
            {edges.map((d, i) => (
              <motion.path
                key={`c${i}`}
                d={d}
                fill="none"
                stroke="url(#b-flow-grad)"
                strokeWidth={3.4}
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: i < step ? 1 : 0, opacity: i < step ? 1 : 0 }}
                transition={{ duration: i < step ? 0 : 0.5, ease }}
              />
            ))}
            {/* trail drawn by the travelling packet */}
            {traveling !== null && (
              <motion.path key={`t${traveling}-${runner.cycle}`} d={edges[traveling]} fill="none" stroke="url(#b-flow-grad)" strokeWidth={3.4} strokeLinecap="round" style={{ pathLength: trail }} />
            )}
            {/* packet */}
            <motion.circle r={26} fill="url(#b-flow-glow)" cx={px} cy={py} opacity={traveling !== null ? 0.9 : 0} />
            <motion.circle r={6} fill="#fff" stroke="#6d3ce6" strokeWidth={3} cx={px} cy={py} opacity={traveling !== null ? 1 : 0} />
          </svg>
        </div>

        {/* nodes */}
        {steps.map((s, i) => (
          <Node
            key={s.id}
            i={i}
            active={i === step && traveling === null}
            focused={i === shown}
            done={i < step}
            onSelect={() => runner.select(i)}
            onPreview={v => setPreview(v ? i : null)}
          />
        ))}
      </motion.div>
    </div>
  );
}

function Node({ i, active, focused, done, onSelect, onPreview }: { i: number; active: boolean; focused: boolean; done: boolean; onSelect: () => void; onPreview: (on: boolean) => void }) {
  const s = steps[i];
  const p = pos[i];
  const t = tints[stepTint[s.id]];
  const z = depth[i] + (active ? LIFT : 0);
  return (
    <div className="absolute [transform-style:preserve-3d]" style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}>
      {/* shadow on the board */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-0 h-10 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(48_27_120/0.28),transparent)]"
        animate={{ scale: active ? 1.15 : 0.95, opacity: active ? 0.9 : 0.55 }}
        transition={{ duration: 0.8, ease }}
      />
      {/* anchor */}
      <span aria-hidden className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
        {active && <span className="pulse-ring absolute inset-0 rounded-full bg-violet/50" />}
        <span className={cx("relative block size-3 rounded-full border-2 border-white shadow", done || active ? "bg-violet" : "bg-ink/25")} />
      </span>
      {/* stem rising from the board */}
      <motion.span
        aria-hidden
        className="absolute left-0 top-0 w-px origin-top bg-gradient-to-b from-violet/50 to-violet/5 [transform:rotateX(90deg)]"
        animate={{ height: z }}
        transition={{ duration: 0.8, ease }}
      />
      {/* card */}
      <motion.div className="absolute left-0 top-0 [transform-style:preserve-3d]" animate={{ z }} transition={{ duration: 0.8, ease }}>
        <div className="relative -translate-x-1/2 -translate-y-1/2">
        <button
          type="button"
          onClick={onSelect}
          onPointerEnter={() => onPreview(true)}
          onPointerLeave={() => onPreview(false)}
          onFocus={() => onPreview(true)}
          onBlur={() => onPreview(false)}
          aria-pressed={active}
          aria-label={`Step ${i + 1} of ${steps.length}: ${s.label}. ${s.detail}`}
          className={cx(
            "group flex min-w-[140px] items-center whitespace-nowrap gap-2.5 rounded-2xl border bg-white/95 py-2.5 pl-2.5 pr-3 text-left transition-[box-shadow,border-color] duration-500",
            active
              ? "border-violet/40 shadow-[0_0_0_4px_rgb(109_60_230/0.12),0_24px_40px_-18px_rgb(84_40_196/0.55)]"
              : focused
                ? "border-violet/30 shadow-[0_18px_34px_-20px_rgb(48_27_120/0.45)]"
                : "border-line shadow-[0_14px_28px_-20px_rgb(48_27_120/0.35)] hover:border-violet/30",
          )}
        >
          <span className={cx("relative grid size-9 shrink-0 place-items-center rounded-xl", t.tile)}>
            <Icon name={asIcon(s.icon)} className="size-[18px]" />
            {done && (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-violet text-white ring-2 ring-white">
                <Icon name="check" className="size-2.5" strokeWidth={3} />
              </span>
            )}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block font-mono text-[10px] tracking-[0.12em] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
            <span className="block font-display text-[15px] font-semibold tracking-[-0.01em] text-ink">{s.label}</span>
          </span>
        </button>
        </div>
        {/* the sample lead rides on the active card */}
        <span
          aria-hidden
          className={cx(
            "pointer-events-none absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink py-1 pl-1 pr-3 text-[11.5px] font-semibold text-white shadow-[0_10px_22px_-10px_rgb(23_21_31/0.7)] [transform:translate3d(-50%,-58px,6px)] transition-opacity duration-500",
            active ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="grid size-5 place-items-center rounded-full bg-white/15"><Icon name="user" className="size-3" /></span>
          Sample lead
        </span>
      </motion.div>
    </div>
  );
}
