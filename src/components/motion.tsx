import { Fragment, useRef, type ReactNode, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ease } from "../lib/hooks";

/* ---------------- text reveal (word by word, masked) ---------------- */

type SplitProps = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** animate on mount instead of when scrolled into view */
  immediate?: boolean;
};

export function SplitText({ text, className, delay = 0, stagger = 0.055, immediate }: SplitProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.5 } };
  // background-clip:text can't reach transformed children, so each word carries
  // its own slice of one gradient sized to the whole run
  const gradClass = className?.split(" ").find(c => c.startsWith("text-gradient"));
  const gradient = !!gradClass;
  const outer = gradient ? className!.split(" ").filter(c => c !== gradClass).join(" ") : className;
  const n = words.length;
  return (
    <span className={outer}>
      <span className="sr-only">{text}</span>
      <motion.span aria-hidden="true" initial="hide" {...trigger} style={{ display: "inline" }}>
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
              <motion.span
                className={`inline-block will-change-transform ${gradClass ?? ""}`}
                style={gradient ? { backgroundSize: `${n * 100}% 100%`, backgroundPosition: `${n > 1 ? (i / (n - 1)) * 100 : 0}% 0` } : undefined}
                variants={{
                  hide: reduced ? { opacity: 0 } : { y: "105%", opacity: 0 },
                  show: { y: "0%", opacity: 1, transition: { duration: reduced ? 0.25 : 0.95, ease, delay: delay + i * stagger } },
                }}
              >
                {w}
              </motion.span>
            </span>
            {/* the space lives between the inline-blocks so it isn't collapsed */}
            {i < n - 1 ? " " : null}
          </Fragment>
        ))}
      </motion.span>
    </span>
  );
}

/* ---------------- fade + lift into view ---------------- */

export function Reveal({ children, delay = 0, y = 28, className, as = "div", amount = 0.25 }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "article" | "section" | "p"; amount?: number }) {
  const reduced = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduced ? 0.25 : 0.9, ease, delay }}
    >
      {children}
    </M>
  );
}

/** Stagger container + item variants for lists. */
export const staggerParent = { hide: {}, show: { transition: { staggerChildren: 0.07 } } };
export const staggerChild = {
  hide: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

/* ---------------- magnetic button / link ---------------- */

type MagneticProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
  href?: string;
  onClick?: (e: ReactMouseEvent) => void;
  type?: "button" | "submit";
  ariaLabel?: string;
  disabled?: boolean;
  target?: string;
  rel?: string;
};

export function Magnetic({ children, className, strength = 0.3, href, onClick, type = "button", ariaLabel, disabled, target, rel }: MagneticProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const x = useSpring(0, { stiffness: 240, damping: 18, mass: 0.5 });
  const y = useSpring(0, { stiffness: 240, damping: 18, mass: 0.5 });
  const ix = useTransform(x, v => v * 0.4), iy = useTransform(y, v => v * 0.4);
  const move = (e: ReactMouseEvent) => {
    if (reduced || !ref.current || (e.nativeEvent as PointerEvent).pointerType === "touch") return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => { x.set(0); y.set(0); };
  const inner = <motion.span className="relative inline-flex items-center gap-2.5" style={{ x: ix, y: iy }}>{children}</motion.span>;
  const common = { ref: ref as never, onMouseMove: move, onMouseLeave: leave, style: { x, y }, className, "aria-label": ariaLabel };
  return href ? (
    <motion.a href={href} onClick={onClick} target={target} rel={rel} {...common}>{inner}</motion.a>
  ) : (
    <motion.button type={type} onClick={onClick} disabled={disabled} {...common}>{inner}</motion.button>
  );
}

/* ---------------- 3D tilt with glare ---------------- */

export function useTilt(max = 8) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5), py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 150, damping: 20 }), sy = useSpring(py, { stiffness: 150, damping: 20 });
  const rotateY = useTransform(sx, v => (reduced ? 0 : (v - 0.5) * max * 2));
  const rotateX = useTransform(sy, v => (reduced ? 0 : (0.5 - v) * max * 2));
  const glareX = useTransform(sx, v => `${v * 100}%`);
  const glareY = useTransform(sy, v => `${v * 100}%`);
  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };
  return { ref, rotateX, rotateY, glareX, glareY, sx, sy, onMove, onLeave };
}

export function TiltCard({ children, className, max = 8, style, glare = true, perspective = 1200 }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties; glare?: boolean; perspective?: number }) {
  const t = useTilt(max);
  return (
    <div style={{ perspective }} className="h-full">
      <motion.div
        ref={t.ref}
        onPointerMove={t.onMove}
        onPointerLeave={t.onLeave}
        style={{ rotateX: t.rotateX, rotateY: t.rotateY, transformStyle: "preserve-3d", ...style }}
        className={`relative h-full ${className ?? ""}`}
      >
        {children}
        {glare && <Glare x={t.glareX} y={t.glareY} />}
      </motion.div>
    </div>
  );
}

export function Glare({ x, y }: { x: MotionValue<string>; y: MotionValue<string> }) {
  const bg = useTransform([x, y] as MotionValue<string>[], ([gx, gy]) => `radial-gradient(460px circle at ${gx} ${gy}, rgba(109,60,230,0.08), transparent 55%)`);
  return <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: bg }} />;
}
