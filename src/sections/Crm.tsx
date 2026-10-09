import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { crmCapabilities } from "../content";
import { ease, useMediaQuery } from "../lib/hooks";
import { Reveal } from "../components/motion";
import { Icon, IllustrativeTag, ScreenshotSlot, SectionHeading, cx } from "../components/ui";
import { BIcon, type BIconName } from "./systems/shared";
import { PipelineMock } from "./systems/crm/PipelineMock";
import { WorkflowMock } from "./systems/crm/WorkflowMock";
import { FormMock } from "./systems/crm/FormMock";
import { CalendarMock } from "./systems/crm/CalendarMock";
import { RoutingMock } from "./systems/crm/RoutingMock";
import { FollowupMock } from "./systems/crm/FollowupMock";

type CapId = (typeof crmCapabilities)[number]["id"];

/** Presentation for each capability in content.ts — wording describes capability, not results. */
const detail: Record<CapId, { icon: BIconName | "branch" | "calendar" | "message"; title: string; line: string; includes: string[]; view: string; Mock: ComponentType<{ active: boolean }> }> = {
  pipelines: {
    icon: "kanban",
    title: "Every lead in a clear stage",
    line: "Custom pipeline stages, so the team always knows who is new, who has been contacted and who is ready to book.",
    includes: ["Custom stages", "Source tags", "Stage-based automations"],
    view: "Opportunities",
    Mock: PipelineMock,
  },
  workflows: {
    icon: "branch",
    title: "Automations that run themselves",
    line: "Triggers, waits, conditions and actions — built visually and tested before they go live.",
    includes: ["Triggers", "If / else branches", "Internal notifications"],
    view: "Automation",
    Mock: WorkflowMock,
  },
  forms: {
    icon: "form",
    title: "Forms that feed the CRM",
    line: "Every submission creates or updates a contact, adds the right tags and starts the right workflow.",
    includes: ["Custom fields", "Source tagging", "Consent capture"],
    view: "Sites › Forms",
    Mock: FormMock,
  },
  appointments: {
    icon: "calendar",
    title: "Booking without the back-and-forth",
    line: "Calendars with real availability, instant confirmations and automatic reminders.",
    includes: ["Availability rules", "Confirmations", "Reminders"],
    view: "Calendars",
    Mock: CalendarMock,
  },
  routing: {
    icon: "route",
    title: "The right lead to the right person",
    line: "Round-robin or rule-based assignment, with the owner notified the moment a lead arrives.",
    includes: ["Round robin", "Rule-based assignment", "Owner alerts"],
    view: "Automation › Routing",
    Mock: RoutingMock,
  },
  followups: {
    icon: "message",
    title: "Follow-up that never forgets",
    line: "Timed SMS and email sequences that stop on their own when the lead replies or books.",
    includes: ["SMS + email", "Timed steps", "Stop on reply"],
    view: "Conversations",
    Mock: FollowupMock,
  },
};

function CapIcon({ name, className }: { name: (typeof detail)[CapId]["icon"]; className?: string }) {
  return name === "branch" || name === "calendar" || name === "message" ? <Icon name={name} className={className} /> : <BIcon name={name} className={className} />;
}

export function Crm() {
  const lg = useMediaQuery("(min-width: 1024px)");
  const [tab, setTab] = useState<CapId>("pipelines");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { amount: 0.35 });
  const d = detail[tab];
  const rowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // keep the active pill visible in the horizontal tab row (phones / tablets)
  useEffect(() => {
    const row = rowRef.current, btn = tabRefs.current[tab];
    if (!row || !btn || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: btn.offsetLeft - row.clientWidth / 2 + btn.offsetWidth / 2, behavior: reduced ? "auto" : "smooth" });
  }, [tab, reduced]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const ids = crmCapabilities.map(c => c.id);
    const i = ids.indexOf(tab);
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: ids.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = ids[(map[e.key] + ids.length) % ids.length];
    setTab(next);
    const btn = tabRefs.current[next];
    btn?.focus({ preventScroll: true });
  };

  const tabList = (
    <div
      role="tablist"
      aria-label="CRM capabilities"
      aria-orientation={lg ? "vertical" : "horizontal"}
      onKeyDown={onKey}
      className={cx(lg ? "flex flex-col gap-1" : "flex w-max gap-1.5 px-4 sm:px-5")}
    >
      {crmCapabilities.map(c => {
        const on = c.id === tab;
        return (
          <button
            key={c.id}
            ref={el => { tabRefs.current[c.id] = el; }}
            id={`crm-tab-${c.id}`}
            role="tab"
            type="button"
            aria-selected={on}
            aria-controls={on ? `crm-panel-${c.id}` : undefined}
            tabIndex={on ? 0 : -1}
            onClick={() => setTab(c.id)}
            className={cx(
              "relative flex items-center gap-2.5 text-left font-semibold transition-colors",
              lg ? "w-full rounded-xl px-3 py-2.5 text-[14px]" : "whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px]",
              lg && (on ? "text-ink" : "text-ink-3 hover:bg-mist hover:text-ink"),
              !lg && (on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2"),
            )}
          >
            {lg && on && <motion.span layoutId="b-crm-tab" transition={{ duration: 0.45, ease }} className="absolute inset-0 rounded-xl border border-line bg-white shadow-[0_1px_2px_rgb(23_21_31/0.06),0_8px_20px_-12px_rgb(23_21_31/0.25)]" />}
            <span className={cx("relative grid place-items-center rounded-lg", lg ? "size-8" : "size-5", lg && (on ? "bg-violet-soft text-violet" : "bg-mist text-ink-3"))}>
              <CapIcon name={detail[c.id].icon} className={lg ? "size-4" : "size-3.5"} />
            </span>
            <span className="relative">{c.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <section id="crm" aria-label="CRM and GoHighLevel" className="section border-y border-line bg-mist/50">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="05"
            kicker="CRM & GoHighLevel"
            title="A CRM that runs"
            accent="the whole pipeline."
            sub="Pipelines, workflows, forms, calendars, routing and follow-ups — set up inside GoHighLevel so every lead always has a next step."
          />
          <Reveal delay={0.2} className="shrink-0 lg:pb-2">
            <ul className="flex flex-wrap gap-2 lg:max-w-[18rem] lg:justify-end">
              {["GoHighLevel", "CRM setup", "Workflow automation"].map(t => <li key={t} className="chip">{t}</li>)}
            </ul>
          </Reveal>
        </div>

        <Reveal y={40} amount={0.1} className="mt-12 md:mt-16">
          <div className="surface-lg overflow-hidden rounded-[28px]">
            {/* app chrome */}
            <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink font-mono text-[12px] font-bold text-white">&gt;_</span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13px] font-semibold">Client workspace</p>
                <p className="truncate font-mono text-[10.5px] text-ink-3">{d.view}</p>
              </div>
              <div className="ml-auto hidden h-9 w-64 items-center gap-2 rounded-full border border-line bg-mist/70 px-3 text-[12.5px] text-ink-3 md:flex" aria-hidden>
                <BIcon name="search" className="size-3.5" /> Search contacts, pipelines…
              </div>
              <IllustrativeTag className="ml-auto shrink-0 md:ml-0">Illustrative</IllustrativeTag>
            </div>

            <div className={cx(lg && "grid grid-cols-[232px_minmax(0,1fr)]")}>
              {/* navigation */}
              {lg ? (
                <div className="flex flex-col justify-between gap-6 border-r border-line bg-mist/60 p-3">
                  {tabList}
                  <p className="px-3 pb-2 text-[11.5px] leading-relaxed text-ink-3">Use the arrow keys to move between areas.</p>
                </div>
              ) : (
                <div className="relative border-b border-line bg-mist/60 py-3">
                  <div ref={rowRef} className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{tabList}</div>
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f6f5f9] to-transparent" />
                </div>
              )}

              {/* panel */}
              <div ref={panelRef} id={`crm-panel-${tab}`} role="tabpanel" aria-labelledby={`crm-tab-${tab}`} className="min-w-0 bg-white p-4 sm:p-6 lg:p-7">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease }}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-8">
                      <div className="max-w-xl">
                        <h3 className="text-[clamp(1.35rem,2.2vw,1.7rem)] font-semibold leading-tight tracking-[-0.025em]">{d.title}</h3>
                        <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{d.line}</p>
                      </div>
                      <ul className="flex shrink-0 flex-wrap gap-1.5 md:max-w-[15rem] md:justify-end" aria-label="Included">
                        {d.includes.map(x => (
                          <li key={x} className="inline-flex items-center gap-1 rounded-full bg-violet-soft px-2.5 py-1 text-[11.5px] font-semibold text-violet">
                            <Icon name="check" className="size-3" strokeWidth={2.6} /> {x}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-5 lg:grid lg:min-h-[470px]">
                      <d.Mock active={inView} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>

        {/* real screenshots to come */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <Reveal className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-[20px] font-semibold tracking-[-0.02em]">From real GoHighLevel builds</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-3">The workspace above is an illustration. Screenshots of real pipelines and workflows will sit here.</p>
          </Reveal>
          <Reveal delay={0.08}><ScreenshotSlot label="GoHighLevel pipeline build" className="bg-white" /></Reveal>
          <Reveal delay={0.16}><ScreenshotSlot label="GoHighLevel workflow build" className="bg-white" /></Reveal>
        </div>
      </div>
    </section>
  );
}
