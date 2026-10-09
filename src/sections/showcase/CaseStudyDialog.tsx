import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Project } from "../../content";
import { Icon, cx } from "../../components/ui";
import { ease } from "../../lib/hooks";
import { ProjectPreview, hostOf } from "./ProjectPreview";
import { accentTokens } from "./projectArt";

type LenisLike = { stop: () => void; start: () => void };
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

const focusables = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null || el === document.activeElement);

/**
 * Accessible case-study dialog: rendered in a portal, the rest of the app is made `inert`,
 * focus moves to the close button and is trapped inside, Esc / backdrop click closes,
 * and focus returns to the element that opened it.
 */
export function CaseStudyDialog({ projects, index, onClose, onNavigate }: { projects: Project[]; index: number | null; onClose: () => void; onNavigate: (i: number) => void }) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const open = index !== null;
  const project = open ? projects[index] : null;

  // open / close side effects
  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const root = document.getElementById("root");
    root?.setAttribute("inert", "");
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    lenis()?.stop();
    const id = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(id);
      root?.removeAttribute("inert");
      html.style.overflow = prevOverflow;
      lenis()?.start();
      returnTo.current?.focus({ preventScroll: true });
    };
  }, [open]);

  // Esc + focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const list = focusables(panelRef.current);
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  const n = projects.length;

  return createPortal(
    <AnimatePresence>
      {project && index !== null && (
        <motion.div key="cs" className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <div aria-hidden className="absolute inset-0 bg-[#17151f]/45 backdrop-blur-md" />
          <div className="absolute inset-0 overflow-y-auto overscroll-contain px-3 py-3 sm:px-6 sm:py-8 lg:py-12" data-lenis-prevent onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="case-study-title"
              aria-describedby="case-study-desc"
              className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[24px] bg-canvas shadow-[0_40px_120px_-30px_rgb(23_21_31/0.55)] ring-1 ring-black/5 sm:rounded-[30px]"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.55, ease }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80" style={{ background: `radial-gradient(70% 100% at 85% 0%, ${accentTokens[project.accent].soft}, transparent 70%)` }} />

              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close case study" className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border border-line-strong bg-white transition-colors hover:border-violet hover:text-violet sm:right-8 sm:top-8">
                <Icon name="close" className="size-[18px]" />
              </button>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={project.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease }} className="relative">
                  {/* header */}
                  <div className="px-5 pr-20 pt-5 sm:px-10 sm:pr-24 sm:pt-9">
                    <div className="min-w-0">
                      <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="font-semibold text-violet">Case study {String(index + 1).padStart(2, "0")}</span>
                        <span className="h-px w-6 bg-ink/15" />
                        {project.type}
                      </p>
                      <h2 id="case-study-title" className="mt-3 text-[clamp(1.8rem,4.2vw,3rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance">
                        {project.name}
                      </h2>
                    </div>
                  </div>

                  {/* preview */}
                  <div className="px-3 pt-6 sm:px-10 sm:pt-8">
                    <div className="relative">
                      <ProjectPreview project={project} depth={false} eager />
                      {project.placeholder && <ComingSoonBadge className="absolute bottom-4 left-4" />}
                    </div>
                  </div>

                  {/* body */}
                  <div className="grid gap-8 px-5 pb-6 pt-8 sm:px-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-12 md:pt-10">
                    <div>
                      <h3 className="eyebrow">Overview</h3>
                      <p id="case-study-desc" className="mt-3 text-[17px] leading-relaxed text-ink-2">{project.description}</p>

                      <h3 className="eyebrow mt-8">Results</h3>
                      {project.results.length ? (
                        <ul className="mt-3 flex flex-col gap-2.5">
                          {project.results.map(r => (
                            <li key={r} className="flex items-start gap-3 text-[15.5px] text-ink">
                              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal-soft text-teal"><Icon name="check" className="size-3.5" /></span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 rounded-xl border border-dashed border-line-strong bg-white/70 px-4 py-3 text-[14px] text-ink-3">
                          Results are added only when verified figures are available.
                        </p>
                      )}
                    </div>

                    <dl className="surface grid h-fit gap-5 rounded-2xl p-5 sm:p-6">
                      <div>
                        <dt className="eyebrow">Type</dt>
                        <dd className="mt-1.5 text-[15px] font-medium">{project.type}</dd>
                      </div>
                      <div>
                        <dt className="eyebrow">Role</dt>
                        <dd className="mt-1.5 text-[15px] font-medium">{project.role}</dd>
                      </div>
                      <div>
                        <dt className="eyebrow">Tools</dt>
                        <dd className="mt-2 flex flex-wrap gap-1.5">{project.tools.map(t => <span key={t} className="chip !py-1 !text-[12px]">{t}</span>)}</dd>
                      </div>
                      {project.url && (
                        <div>
                          <dt className="eyebrow">Live site</dt>
                          <dd className="mt-2">
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-violet hover:text-violet-deep">
                              Visit {hostOf(project.url)}
                              <Icon name="arrowUpRight" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* prev / next */}
              {n > 1 && (
                <nav aria-label="Other case studies" className="relative flex items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-10">
                  <button type="button" onClick={() => onNavigate((index - 1 + n) % n)} className="group flex min-w-0 items-center gap-2 rounded-full py-2 pr-3 text-left text-[13.5px] font-medium text-ink-2 hover:text-ink">
                    <Icon name="arrowRight" className="size-4 shrink-0 rotate-180 transition-transform group-hover:-translate-x-0.5" />
                    <span className="truncate"><span className="sr-only">Previous: </span>{projects[(index - 1 + n) % n].name}</span>
                  </button>
                  <span className="hidden font-mono text-[11px] text-ink-3 sm:block" aria-hidden>{String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
                  <button type="button" onClick={() => onNavigate((index + 1) % n)} className="group flex min-w-0 items-center gap-2 rounded-full py-2 pl-3 text-right text-[13.5px] font-medium text-ink-2 hover:text-ink">
                    <span className="truncate"><span className="sr-only">Next: </span>{projects[(index + 1) % n].name}</span>
                    <Icon name="arrowRight" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </nav>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function ComingSoonBadge({ className, label = "Project details coming soon" }: { className?: string; label?: string }) {
  return (
    <span className={cx("glass inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 text-[12px] font-medium text-ink-2", className)}>
      <span className="size-2 rounded-full bg-amber shadow-[0_0_0_3px_rgb(168_85_10/0.15)]" />
      {label}
    </span>
  );
}
