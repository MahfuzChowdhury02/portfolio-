import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { Project } from "../../content";
import { BrowserFrame, cx } from "../../components/ui";
import { ease } from "../../lib/hooks";
import { ProjectArt } from "./projectArt";

export const hostOf = (url?: string) => {
  if (!url) return "";
  try { return new URL(url).host.replace(/^www\./, ""); } catch { return url; }
};

/**
 * Browser-framed project preview.
 * - Real screenshots (if any) are shown lazily with alt text and can be switched.
 * - Otherwise a tall abstract skeleton page that "scrolls" on hover, like a live preview.
 * `depth` adds a subtle pointer parallax to the content inside the frame.
 */
export function ProjectPreview({ project, className, depth = true, eager = false }: { project: Project; className?: string; depth?: boolean; eager?: boolean }) {
  const reduced = useReducedMotion();
  const [shot, setShot] = useState(0);
  const shots = project.screenshots;
  const hasShots = shots.length > 0;

  // inner parallax ("image depth")
  const px = useMotionValue(0), py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 120, damping: 20 }), sy = useSpring(py, { stiffness: 120, damping: 20 });
  const ix = useTransform(sx, v => v * -14), iy = useTransform(sy, v => v * -10);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!depth || reduced || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { px.set(0); py.set(0); };

  const url = project.url ? hostOf(project.url) : project.placeholder ? "preview — coming soon" : "";

  return (
    <BrowserFrame url={url} className={cx("group/preview", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-mist" onPointerMove={onMove} onPointerLeave={onLeave}>
        <motion.div className="absolute -inset-3" style={{ x: ix, y: iy }}>
          {hasShots ? (
            <AnimatePresence initial={false} mode="popLayout">
              <motion.img
                key={shots[shot]}
                src={shots[shot]}
                alt={`${project.name} — screenshot ${shot + 1} of ${shots.length}`}
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] object-cover object-top"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease }}
              />
            </AnimatePresence>
          ) : (
            <div className="absolute inset-3 overflow-hidden">
              <ProjectArt
                project={project}
                className="min-h-[165%] transition-transform duration-[2600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/preview:-translate-y-[39%] motion-safe:group-focus-within/card:-translate-y-[39%]"
              />
            </div>
          )}
        </motion.div>
        {/* soft inner vignette for depth */}
        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_-40px_60px_-40px_rgb(23_21_31/0.18)]" />
        {hasShots && shots.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/85 p-1.5 shadow-md backdrop-blur" role="group" aria-label={`${project.name} screenshots`}>
            {shots.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setShot(i)}
                aria-pressed={i === shot}
                aria-label={`Show screenshot ${i + 1}`}
                className={cx("h-2 rounded-full transition-all", i === shot ? "w-6 bg-ink" : "w-2 bg-ink/25 hover:bg-ink/45")}
              />
            ))}
          </div>
        )}
      </div>
    </BrowserFrame>
  );
}
