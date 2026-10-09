import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { focusAreas, person } from "../../content";
import { ease, useFinePointer } from "../../lib/hooks";
import { cx } from "../../components/ui";
import type { RovingProps } from "./hooks";

export type FocusId = (typeof focusAreas)[number]["id"];

/** Where each focus chip sits around the portrait on large screens: side, inset from that edge and top (percent of stage), plus depth. */
const orbit: Record<FocusId, { side: "l" | "r"; inset: number; y: number; z: number; tone: string }> = {
  web: { side: "l", inset: 2, y: 19, z: 70, tone: "bg-violet" },
  crm: { side: "r", inset: 0, y: 13, z: 50, tone: "bg-sky" },
  ghl: { side: "r", inset: 3, y: 43, z: 90, tone: "bg-teal" },
  ads: { side: "l", inset: 0, y: 47, z: 60, tone: "bg-amber" },
  ai: { side: "r", inset: 1, y: 73, z: 80, tone: "bg-fuchsia" },
  funnels: { side: "l", inset: 4, y: 75, z: 55, tone: "bg-violet-deep" },
};

type ChipProps = {
  i: number;
  area: (typeof focusAreas)[number];
  active: boolean;
  onSelect: () => void;
  tilt: { mx: MotionValue<number>; my: MotionValue<number> };
  itemProps: RovingProps;
};

function OrbitChip({ i, area, active, onSelect, tilt, itemProps }: ChipProps) {
  const o = orbit[area.id];
  const x = useTransform(tilt.mx, v => v * o.z * 0.35);
  const y = useTransform(tilt.my, v => v * o.z * 0.35);
  return (
    <motion.button
      type="button"
      role="tab"
      id={`about-tab-${area.id}`}
      aria-selected={active}
      aria-controls="about-focus-panel"
      onClick={onSelect}
      {...itemProps}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease, delay: 0.35 + i * 0.07 }}
      style={{ ...({ "--ox": `${o.inset}%`, "--oy": `${o.y}%` } as React.CSSProperties), x, y, z: o.z }}
      className={cx(
        "group relative z-20 inline-flex items-center gap-2 rounded-full py-2 pl-2 pr-4 text-[13.5px] font-semibold transition-[background-color,color,box-shadow] duration-500",
        "lg:absolute lg:top-[var(--oy)] lg:[translate:0_-50%]",
        o.side === "l" ? "lg:left-[var(--ox)]" : "lg:right-[var(--ox)]",
        active
          ? "bg-ink text-white shadow-[0_18px_40px_-14px_rgb(48_27_120/0.55)]"
          : "glass text-ink-2 hover:text-ink",
      )}
    >
      <span className={cx("grid size-6 place-items-center rounded-full font-mono text-[10px] font-bold transition-colors duration-500", active ? "bg-white/15 text-white" : "bg-ink/[0.05] text-ink-3")}>
        {String(i + 1).padStart(2, "0")}
      </span>
      <span className="whitespace-nowrap">{area.label}</span>
      <span aria-hidden className={cx("size-1.5 rounded-full transition-opacity duration-500", o.tone, active ? "opacity-100" : "opacity-40")} />
    </motion.button>
  );
}

export function PortraitStage({
  active,
  onSelect,
  itemProps,
}: {
  active: number;
  onSelect: (i: number) => void;
  itemProps: (i: number) => RovingProps;
}) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);

  // pointer tilt (fine pointers only)
  const px = useMotionValue(0), py = useMotionValue(0);
  const mx = useSpring(px, { stiffness: 90, damping: 18 }), my = useSpring(py, { stiffness: 90, damping: 18 });
  const rotateY = useTransform(mx, v => v * 9);
  const rotateX = useTransform(my, v => v * -7);
  const onMove = (e: React.PointerEvent) => {
    if (reduced || !fine || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { px.set(0); py.set(0); };

  // scroll parallax: layers drift at different speeds
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "-11%"]);
  const plateY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);
  const ringRot = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-12, 12]);
  const cardY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [30, -30]);


  return (
    <div className="relative">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative mx-auto aspect-[4/5] w-full max-w-[460px] [perspective:1400px] sm:aspect-[5/5] sm:max-w-[560px] lg:aspect-[11/12] lg:max-w-none"
      >
        <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateX, rotateY }}>
          {/* orbit rings */}
          <motion.svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            style={{ rotate: ringRot, translateZ: -80 }}
          >
            <ellipse cx="50" cy="50" rx="46" ry="40" fill="none" stroke="rgb(23 21 31 / 0.09)" strokeDasharray="0.6 1.4" vectorEffect="non-scaling-stroke" />
            <ellipse cx="50" cy="50" rx="38" ry="47" fill="none" stroke="rgb(109 60 230 / 0.14)" vectorEffect="non-scaling-stroke" />
          </motion.svg>

          {/* back gradient plate */}
          <motion.div
            aria-hidden
            className="absolute left-[24%] top-[13%] h-[74%] w-[58%] rounded-t-full rounded-b-[44px] bg-[linear-gradient(160deg,#8b5cf6_0%,#b5279e_55%,#0f6fb8_100%)] opacity-80 blur-[1px]"
            style={{ y: plateY, translateZ: -60, rotate: 4 }}
          />
          <motion.div aria-hidden className="absolute left-[14%] top-[5%] h-[78%] w-[58%] rounded-t-full rounded-b-[44px] border border-violet/25" style={{ translateZ: -40 }} />

          {/* portrait frame */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease }}
            className="absolute left-[19%] top-[9%] h-[78%] w-[58%] overflow-hidden rounded-t-full rounded-b-[40px] bg-mist shadow-[0_2px_6px_rgb(23_21_31/0.06),0_50px_90px_-40px_rgb(48_27_120/0.5)] ring-1 ring-black/5"
            style={{ translateZ: 0 }}
          >
            <motion.img
              src={person.portrait}
              alt={person.portraitAlt}
              width={796}
              height={1024}
              loading="lazy"
              decoding="async"
              className="absolute inset-x-0 top-0 h-[118%] w-full origin-top object-cover object-[50%_0%]"
              style={{ y: imgY, scale: 1.26 }}
            />
            {/* soft light wash + bottom fade for depth */}
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0)_55%,rgb(23_21_31/0.35)_100%)]" />
            <div aria-hidden className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/40" />
          </motion.div>

          {/* name card (front layer) */}
          <motion.div
            className="glass absolute bottom-[7%] left-1/2 z-10 w-[min(78%,300px)] -translate-x-1/2 rounded-2xl px-4 py-3"
            style={{ y: cardY, translateZ: 60 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="flex items-center gap-2 font-display text-[16px] font-semibold tracking-[-0.02em] text-ink">
              <span aria-hidden className="font-mono text-[13px] font-bold text-violet">&gt;_</span>
              {person.name}
            </p>
            <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">{person.tagline}</p>
          </motion.div>

          {/* orbiting focus chips (large screens) */}
          <div role="tablist" aria-label="Focus areas" aria-orientation="horizontal" className="absolute inset-0 hidden [transform-style:preserve-3d] lg:block">
            {focusAreas.map((f, i) => (
              <OrbitChip key={f.id} i={i} area={f} active={i === active} onSelect={() => onSelect(i)} tilt={{ mx, my }} itemProps={itemProps(i)} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Same focus chips as a wrapped row, for small screens. */
export function FocusChipsRow({
  active,
  onSelect,
  itemProps,
}: {
  active: number;
  onSelect: (i: number) => void;
  itemProps: (i: number) => RovingProps;
}) {
  return (
    <div role="tablist" aria-label="Focus areas" className="flex flex-wrap gap-2 lg:hidden">
      {focusAreas.map((f, i) => {
        const on = i === active;
        return (
          <button
            key={f.id}
            type="button"
            role="tab"
            id={`about-tab-m-${f.id}`}
            aria-selected={on}
            aria-controls="about-focus-panel"
            onClick={() => onSelect(i)}
            {...itemProps(i)}
            className={cx(
              "inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold transition-colors duration-300",
              on ? "border-transparent bg-ink text-white" : "border-line bg-white text-ink-2",
            )}
          >
            <span className={cx("grid size-6 place-items-center rounded-full font-mono text-[10px] font-bold", on ? "bg-white/15" : "bg-ink/[0.05] text-ink-3")}>{String(i + 1).padStart(2, "0")}</span>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
