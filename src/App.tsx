import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { Header, ScrollProgress } from "./components/Header";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Experience } from "./sections/Experience";
import { Expertise } from "./sections/Expertise";
import { Projects } from "./sections/Projects";
import { Automation } from "./sections/Automation";
import { Crm } from "./sections/Crm";
import { PaidAds } from "./sections/PaidAds";
import { Funnel } from "./sections/Funnel";
import { Process } from "./sections/Process";
import { TechStack } from "./sections/TechStack";
import { Contact, Footer } from "./sections/Contact";
import { useReducedMotionPref } from "./lib/hooks";

export default function App() {
  const reduced = useReducedMotionPref();

  // inertial smooth scrolling (off for reduced motion and touch-first devices)
  useEffect(() => {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
    return () => { cancelAnimationFrame(raf); lenis.destroy(); delete (window as unknown as { __lenis?: Lenis }).__lenis; };
  }, [reduced]);

  // honour a #hash on first load once sections have mounted
  useEffect(() => {
    const id = location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only z-[70] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Expertise />
        <Projects />
        <Automation />
        <Crm />
        <PaidAds />
        <Funnel />
        <Process />
        <TechStack />
        <Contact />
      </main>
      <Footer />
      <div aria-hidden className="grain" />
    </MotionConfig>
  );
}
