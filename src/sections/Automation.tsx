import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { automationFlow } from "../content";
import { useMediaQuery } from "../lib/hooks";
import { Reveal } from "../components/motion";
import { IllustrativeTag, ScreenshotSlot, SectionHeading } from "../components/ui";
import { useFlowRunner } from "./systems/flow";
import { FlowStage } from "./systems/FlowStage";
import { FlowConsole } from "./systems/FlowConsole";
import { FlowCompact } from "./systems/FlowCompact";

const samples = [
  { label: "AI agent / chatbot flow", note: "Conversation design and the hand-off to the CRM." },
  { label: "Automation workflow", note: "Triggers, conditions and actions behind the flow above." },
  { label: "AI-assisted follow-up", note: "Replies and reminders that keep a lead moving." },
];

export function Automation() {
  const reduced = useReducedMotion();
  const lg = useMediaQuery("(min-width: 1200px)"); // the 3D board needs room; below this the vertical rail is used
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.35 });
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  const runner = useFlowRunner(inView && !hovering && !focusWithin && !reduced, !reduced);
  const shown = lg ? (preview ?? runner.step) : runner.step;

  return (
    <section id="automation" aria-label="AI and automation" className="section relative isolate overflow-hidden">
      {/* violet-tinted canvas */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fbfbfd_0%,#f4f0fe_22%,#f3effd_78%,#fbfbfd_100%)]" />
        <div className="absolute left-1/2 top-[30%] h-[720px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(109_60_230/0.12),transparent)]" />
        <div className="absolute -right-40 bottom-10 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(15_111_184/0.08),transparent)]" />
      </div>

      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionHeading
              index="04"
              kicker="AI & Automation"
              title="Every lead, handled"
              accent="without the busywork."
              sub="One connected flow takes a new enquiry from first contact to a booked appointment — and keeps a record of where it came from."
            />
          </div>
          <Reveal delay={0.2} className="shrink-0 lg:pb-2">
            <p className="max-w-[17rem] text-[13.5px] leading-relaxed text-ink-3 lg:text-right">
              {lg ? "Hover or click any step to see what happens there. Hovering pauses the run." : "Tap any step to see what happens there."}
            </p>
          </Reveal>
        </div>

        <Reveal y={40} amount={0.15} className="mt-12 md:mt-16">
          <div
            ref={stageRef}
            role="group"
            aria-label={`Illustrative automation flow: ${automationFlow.map(s => s.label).join(" → ")}`}
          >
            {lg ? (
              <div className="relative grid grid-cols-[minmax(0,1fr)_minmax(320px,370px)] gap-6 rounded-[36px] border border-white/80 bg-white/40 p-4 shadow-[0_0_0_1px_rgb(109_60_230/0.08),0_50px_100px_-60px_rgb(48_27_120/0.5)] xl:gap-8 xl:p-5">
                <div
                  className="relative"
                  onPointerEnter={e => e.pointerType === "mouse" && setHovering(true)}
                  onPointerLeave={() => setHovering(false)}
                  onFocus={e => e.target.matches(":focus-visible") && setFocusWithin(true)}
                  onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false); }}
                >
                  <IllustrativeTag className="absolute left-4 top-4 z-30">Illustrative flow · sample lead</IllustrativeTag>
                  <FlowStage runner={runner} preview={preview} setPreview={setPreview} />
                </div>
                <FlowConsole runner={runner} shown={shown} hovering={hovering || focusWithin} />
              </div>
            ) : (
              <FlowCompact runner={runner} />
            )}
          </div>
        </Reveal>

        {/* work samples */}
        <div className="mt-16 md:mt-20">
          <Reveal>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h3 className="text-[22px] font-semibold tracking-[-0.02em]">Work samples</h3>
              <p className="text-[13.5px] text-ink-3">Screenshots of real AI and automation builds are being prepared.</p>
            </div>
          </Reveal>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {samples.map((s, i) => (
              <Reveal as="li" key={s.label} delay={i * 0.08}>
                <ScreenshotSlot label={s.label} aspect="aspect-[16/10]" className="bg-white/60" />
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-3">{s.note}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
