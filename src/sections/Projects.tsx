import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { projects, type Project } from "../content";
import { Reveal } from "../components/motion";
import { useTilt } from "../components/motion";
import { Icon, SectionHeading } from "../components/ui";
import { useFinePointer, useMediaQuery } from "../lib/hooks";
import { CaseStudyDialog, ComingSoonBadge } from "./showcase/CaseStudyDialog";
import { ProjectPreview, hostOf } from "./showcase/ProjectPreview";
import { accentTokens } from "./showcase/projectArt";

const pad = (n: number) => String(n).padStart(2, "0");

/* ---------------- 3D framed preview with depth layers ---------------- */

function DepthPreview({ project, tilt }: { project: Project; tilt: boolean }) {
  const t = useTilt(7);
  const a = accentTokens[project.accent];
  return (
    <div style={{ perspective: 1400 }} className="relative">
      <motion.div
        ref={t.ref}
        onPointerMove={tilt ? t.onMove : undefined}
        onPointerLeave={t.onLeave}
        style={tilt ? { rotateX: t.rotateX, rotateY: t.rotateY, transformStyle: "preserve-3d" } : undefined}
        className="relative"
      >
        {/* back plate — sits behind the frame */}
        <div
          aria-hidden
          className="absolute inset-x-[6%] -bottom-5 top-8 rounded-[28px] opacity-80 blur-2xl"
          style={{ background: `linear-gradient(135deg, ${a.a}, ${a.b})`, transform: "translateZ(-60px)", opacity: 0.28 }}
        />
        <div style={{ transform: "translateZ(0px)" }}>
          <ProjectPreview project={project} depth={tilt} />
        </div>
        {/* floating layer in front of the frame */}
        {project.placeholder && (
          <div className="absolute -bottom-4 left-4 sm:left-6" style={{ transform: "translateZ(70px)" }}>
            <ComingSoonBadge />
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ---------------- one project card ---------------- */

function ProjectCard({ project, index, total, onOpen, tilt }: { project: Project; index: number; total: number; onOpen: (i: number) => void; tilt: boolean }) {
  const a = accentTokens[project.accent];
  const titleId = `project-${project.id}-title`;
  return (
    <article
      aria-labelledby={titleId}
      className="group/card surface-lg relative isolate grid overflow-hidden rounded-[26px] sm:rounded-[32px] lg:h-[min(620px,calc(100svh-150px))] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"
    >
      {/* accent wash + giant index */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(60% 80% at 100% 0%, ${a.soft}, transparent 65%), radial-gradient(50% 60% at 0% 100%, ${a.soft}aa, transparent 70%)` }} />
      <span aria-hidden className="pointer-events-none absolute -bottom-10 -left-3 -z-10 font-display text-[clamp(9rem,18vw,15rem)] font-bold leading-none tracking-[-0.06em] text-ink/[0.035]">{pad(index + 1)}</span>

      {/* copy */}
      <div className="flex min-w-0 flex-col p-6 sm:p-9 lg:p-11">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[12px] font-semibold text-ink"><span className={a.text}>{pad(index + 1)}</span><span className="text-ink-3"> / {pad(total)}</span></span>
          <span className="h-px w-6 bg-ink/15" aria-hidden />
          <span className="chip !py-1 !text-[12px]"><span className="size-1.5 rounded-full" style={{ background: a.a }} />{project.type}</span>
          {project.placeholder && <span className="rounded-full border border-dashed border-line-strong px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-3">Coming soon</span>}
        </div>

        <h3 id={titleId} className="mt-6 text-[clamp(1.85rem,3.3vw,2.9rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance">{project.name}</h3>
        <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-ink-2">{project.description}</p>

        <dl className="mt-6 grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-3 border-t border-line pt-5 text-[14px]">
          <dt className="eyebrow">Role</dt>
          <dd className="font-medium text-ink">{project.role}</dd>
          <dt className="eyebrow">Tools</dt>
          <dd className="flex flex-wrap gap-1.5">{project.tools.map(t => <span key={t} className="rounded-md bg-mist px-2 py-0.5 text-[12.5px] font-medium text-ink-2">{t}</span>)}</dd>
        </dl>

        {project.results.length > 0 && (
          <div className="mt-5">
            <p className="eyebrow">Results</p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {project.results.slice(0, 3).map(r => (
                <li key={r} className="flex items-start gap-2 text-[14px] text-ink">
                  <Icon name="check" className="mt-0.5 size-4 shrink-0 text-teal" />{r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3 lg:mt-auto lg:pt-6">
          <button type="button" onClick={() => onOpen(index)} className="btn-primary !py-3 !text-[14px]" aria-haspopup="dialog">
            {project.placeholder ? "Preview case study" : "Open case study"}
            <Icon name="arrowRight" className="size-4 transition-transform group-hover/card:translate-x-0.5" />
          </button>
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-3 !text-[14px]">
              Visit site <Icon name="arrowUpRight" className="size-4" /><span className="sr-only">({hostOf(project.url)}, opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>

      {/* visual */}
      <div className="relative order-first min-w-0 px-4 pt-4 sm:px-8 sm:pt-8 lg:order-none lg:flex lg:items-center lg:py-10 lg:pl-0 lg:pr-10">
        <div className="w-full pb-4 lg:pb-0">
          <DepthPreview project={project} tilt={tilt} />
        </div>
      </div>
    </article>
  );
}

/* ---------------- sticky stack item (desktop) ---------------- */

function StackItem({ children, index, total, progress, animate, stacked }: { children: React.ReactNode; index: number; total: number; progress: MotionValue<number>; animate: boolean; stacked: boolean }) {
  const start = index / total;
  const last = index === total - 1;
  const target = 1 - (total - 1 - index) * 0.045;
  const scale = useTransform(progress, [start, 1], [1, last || !animate ? 1 : target]);
  const rotateX = useTransform(progress, [start, Math.min(1, start + 1 / total)], [0, last || !animate ? 0 : 3]);
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / total)], [0, last || !animate ? 0 : 0.035]);
  return (
    <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center" style={{ perspective: 1600 }}>
      <motion.div
        style={animate ? { scale, rotateX, top: index * 22 - 10, transformOrigin: "50% 0%" } : stacked ? { top: index * 22 - 10 } : undefined}
        className="relative w-full"
      >
        {children}
        {animate && <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[32px] bg-ink" style={{ opacity: dim }} />}
      </motion.div>
    </div>
  );
}

/* ---------------- section ---------------- */

export function Projects() {
  const reduced = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const fine = useFinePointer();
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const pending = projects.filter(p => p.placeholder).length;

  return (
    <section id="projects" aria-label="Projects" className="section pb-0 lg:pb-[clamp(40px,6vw,80px)]">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="03"
            kicker="Selected work"
            title="Projects, built as"
            accent="complete systems."
            sub="Websites, CRM builds, funnels and campaigns — each one a working part of a bigger marketing system. Open any card for the full case study."
          />
          <Reveal delay={0.2} className="lg:pb-2">
            <ul className="flex flex-wrap gap-2 lg:max-w-[18rem] lg:justify-end" aria-label="Project types">
              {projects.map(p => (
                <li key={p.id} className="chip"><span className="size-1.5 rounded-full" style={{ background: accentTokens[p.accent].a }} />{p.type}</li>
              ))}
            </ul>
            {pending > 0 && (
              <p className="mt-4 max-w-[18rem] text-[13px] leading-relaxed text-ink-3 lg:ml-auto lg:text-right">
                Case studies are being prepared — screenshots, links and verified results will appear here as they're added.
              </p>
            )}
          </Reveal>
        </div>

        <div ref={stackRef} className="relative mt-12 flex flex-col gap-6 sm:gap-8 lg:mt-6 lg:gap-0">
          {projects.map((p, i) => (
            <StackItem key={p.id} index={i} total={projects.length} progress={scrollYProgress} animate={desktop && !reduced} stacked={desktop}>
              {desktop ? (
                <ProjectCard project={p} index={i} total={projects.length} onOpen={setOpen} tilt={fine && !reduced} />
              ) : (
                <Reveal y={36} amount={0.15}>
                  <ProjectCard project={p} index={i} total={projects.length} onOpen={setOpen} tilt={false} />
                </Reveal>
              )}
            </StackItem>
          ))}
        </div>
      </div>

      <CaseStudyDialog projects={projects} index={open} onClose={close} onNavigate={setOpen} />
    </section>
  );
}


