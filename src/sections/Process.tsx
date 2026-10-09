import { useMediaQuery } from "../lib/hooks";
import { workProcess } from "../content";
import { ProcessPlane, ProcessTimeline } from "./story/ProcessPlane";
import { SectionHeading } from "../components/ui";

export function Process() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  return (
    <section id="process" aria-label="Process" className="section isolate overflow-x-clip">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 size-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(109_60_230/0.07),transparent_62%)]" />
      </div>
      <div className="shell">
        <SectionHeading
          index="09"
          kicker="Process"
          title="How a system"
          accent="comes together."
          sub="Six steps, from understanding the business to improving what's live."
        />
        {desktop ? (
          <>
            {/* full text equivalent: the plane shows one step's detail at a time */}
            <ol className="sr-only">
              {workProcess.map((s, i) => (
                <li key={s.id}>{`Step ${i + 1}, ${s.label}: ${s.detail}`}</li>
              ))}
            </ol>
            <div className="mt-14">
              <ProcessPlane />
            </div>
          </>
        ) : (
          <ProcessTimeline />
        )}
      </div>
    </section>
  );
}
