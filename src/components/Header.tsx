import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useReducedMotion } from "framer-motion";
import { nav } from "../content";
import { ease, scrollToId, useActiveSection } from "../lib/hooks";
import { Icon, Logo, cx } from "./ui";
import { Magnetic } from "./motion";
import { useTheme } from "../lib/theme";

const navIds: readonly string[] = nav.map(n => n.id);
// observe every section so the indicator clears while reading sections that aren't in the nav
const ids = ["top", "about", "experience", "expertise", "projects", "automation", "crm", "ads", "funnel", "process", "stack", "contact"];

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const current = useActiveSection(ids);
  const active = current && navIds.includes(current) ? current : null;
  const reduced = useReducedMotion();

  useMotionValueEvent(scrollY, "change", y => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    // tuck away while scrolling down quickly, return on any upward scroll
    setHidden(!open && y > 600 && y - prev > 4);
    if (y < prev - 2) setHidden(false);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); setOpen(false); setTimeout(() => scrollToId(id), open ? 280 : 0); };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4"
        initial={reduced ? false : { y: -40, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
      >
        <motion.nav
          aria-label="Primary"
          className={cx(
            "flex w-full items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-[max-width,background-color,box-shadow,border-color] duration-500 sm:px-5",
            scrolled ? "glass max-w-[1040px]" : "max-w-[1280px] border border-transparent",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <a href="#top" onClick={go("top")} className="rounded-md py-1" aria-label="Mahfuz Chowdhury — back to top">
            <Logo />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map(n => (
              <li key={n.id} className="relative">
                <a
                  href={`#${n.id}`}
                  onClick={go(n.id)}
                  aria-current={active === n.id ? "true" : undefined}
                  className={cx("relative z-10 block rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors", active === n.id ? "text-ink" : "text-ink-2 hover:text-ink")}
                >
                  {n.label}
                </a>
                {active === n.id && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-violet-soft" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Magnetic href="#contact" onClick={go("contact")} className="hidden rounded-full bg-ink px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-violet-deep sm:inline-flex">
              Let's talk <Icon name="arrowUpRight" className="size-3.5" />
            </Magnetic>
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-10 place-items-center rounded-full border border-line-strong bg-white/80 lg:hidden"
            >
              <Icon name={open ? "close" : "menu"} className="size-[18px]" />
            </button>
          </div>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col bg-canvas/95 px-6 pb-10 pt-28 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.ul className="flex flex-col gap-1" initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}>
              {nav.map((n, i) => (
                <motion.li key={n.id} variants={{ hide: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}>
                  <a href={`#${n.id}`} onClick={go(n.id)} className="flex items-baseline gap-4 border-b border-line py-4 font-display text-[34px] font-semibold tracking-[-0.03em]">
                    <span className="font-mono text-[12px] font-normal text-violet">0{i + 1}</span>
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
            <a href="#contact" onClick={go("contact")} className="btn-primary mt-auto justify-center">
              Let's Work Together <Icon name="arrowRight" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Light / dark switch: sun and moon swap with a small rotation. */
function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      title={dark ? "Light mode" : "Dark mode"}
      className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-line-strong bg-white/80 text-ink transition-colors hover:border-violet hover:text-violet"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          initial={{ y: 14, rotate: -60, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 60, opacity: 0 }}
          transition={{ duration: 0.35, ease }}
          className="grid place-items-center"
        >
          <Icon name={dark ? "moon" : "sun"} className="size-[18px]" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/** Thin reading-progress bar at the very top. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-gradient-to-r from-violet via-fuchsia to-sky" style={{ scaleX: scrollYProgress }} />;
}
