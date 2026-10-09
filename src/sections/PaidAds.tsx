import { useRef, useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { adsCapabilities } from "../content";
import { Reveal, staggerChild, staggerParent } from "../components/motion";
import { Icon, IllustrativeTag, ScreenshotSlot, SectionHeading, cx, type IconName } from "../components/ui";
import { AdPreview, ReportMock, StructureDiagram, StructureList, TrackingFlow, platforms, type PlatformId } from "./showcase/adsVisuals";

const capIcons: IconName[] = ["target", "globe", "layers", "user", "cursor", "chart"];
const ids: PlatformId[] = ["meta", "google"];

function PlatformTabs({ value, onChange }: { value: PlatformId; onChange: (p: PlatformId) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let j = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % ids.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + ids.length) % ids.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = ids.length - 1;
    if (j < 0) return;
    e.preventDefault();
    onChange(ids[j]);
    refs.current[j]?.focus();
  };
  return (
    <div role="tablist" aria-label="Ad platform" className="relative inline-flex rounded-full border border-line bg-mist/80 p-1">
      {ids.map((id, i) => {
        const on = id === value;
        return (
          <button
            key={id}
            ref={el => { refs.current[i] = el; }}
            id={`ads-tab-${id}`}
            role="tab"
            type="button"
            aria-selected={on}
            aria-controls="ads-panel"
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={e => onKey(e, i)}
            className={cx("relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors", on ? "text-white" : "text-ink-2 hover:text-ink")}
          >
            {on && <motion.span layoutId="ads-tab-pill" className="absolute inset-0 -z-10 rounded-full bg-ink shadow-[0_8px_20px_-10px_rgb(23_21_31/0.6)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className={cx("size-2 rounded-full", id === "meta" ? "bg-violet" : "bg-sky", on && "ring-2 ring-white/30")} />
            {platforms[id].label}
          </button>
        );
      })}
    </div>
  );
}

export function PaidAds() {
  const [p, setP] = useState<PlatformId>("meta");

  return (
    <section id="ads" aria-label="Paid ads" className="section overflow-hidden border-y border-line bg-mist/60">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-10 size-[560px] rounded-full bg-[radial-gradient(circle,rgb(15_111_184/0.08),transparent_65%)]" />
        <div className="absolute -left-40 bottom-0 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(109_60_230/0.08),transparent_65%)]" />
      </div>
      <div className="shell relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16">
          <SectionHeading
            index="06"
            kicker="Paid ads"
            title="Ads wired to tracking,"
            accent="not guesswork."
            sub="I set up Meta and Google campaigns with the structure and tracking needed to see which ads actually bring in leads — then report on it clearly."
          />
          <motion.ul variants={staggerParent} initial="hide" whileInView="show" viewport={{ once: true, amount: 0.4 }} className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Paid ads capabilities">
            {adsCapabilities.map((c, i) => (
              <motion.li key={c} variants={staggerChild} className="flex items-center gap-2.5 rounded-2xl border border-line bg-white/80 px-3 py-2.5 backdrop-blur">
                <span className={cx("grid size-8 shrink-0 place-items-center rounded-xl", i % 2 ? "bg-sky-soft text-sky" : "bg-violet-soft text-violet")}><Icon name={capIcons[i] ?? "check"} className="size-4" /></span>
                <span className="text-[13px] font-medium leading-tight text-ink">{c}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* account structure + ad preview */}
        <Reveal className="mt-14 md:mt-20" amount={0.15}>
          <div className="surface-lg relative overflow-hidden rounded-[28px]">
            <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <h3 className="text-[20px] font-semibold tracking-[-0.02em]">Campaign structure</h3>
                <p className="mt-1 text-[14px] text-ink-3">How an account is organised, from campaign to individual ads.</p>
              </div>
              <PlatformTabs value={p} onChange={setP} />
            </div>
            <div id="ads-panel" role="tabpanel" aria-labelledby={`ads-tab-${p}`} className="grid xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <div className="dot-grid relative flex flex-col px-5 py-7 sm:px-8 sm:py-9">
                <IllustrativeTag className="mb-6 self-start" />
                <div className="hidden md:block" aria-hidden><StructureDiagram key={p} p={p} /></div>
                <StructureList p={p} className="md:sr-only" />
                <dl className="mt-8 grid gap-2 border-t border-line pt-5 sm:grid-cols-3 sm:gap-4 xl:mt-auto">
                  {platforms[p].levels.map(([k, v], i) => (
                    <div key={k} className="flex items-baseline gap-2 sm:flex-col sm:gap-0.5">
                      <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-3">{String(i + 1).padStart(2, "0")} · {k}</dt>
                      <dd className="text-[13.5px] font-medium text-ink-2">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="relative grid items-center gap-8 border-t border-line bg-gradient-to-b from-white to-mist/60 px-5 py-7 sm:px-8 sm:py-9 md:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-1 xl:items-start xl:border-l xl:border-t-0">
                <div>
                  <p className="eyebrow flex items-center gap-2"><Icon name="image" className="size-3.5" /> Ad preview · {platforms[p].short}</p>
                  <p className="mt-3 hidden max-w-xs text-[15px] leading-relaxed text-ink-2 md:block xl:hidden">
                    Clear, specific creative with one call to action — matched to the campaign it sits in.
                  </p>
                  <ul className="mt-4 hidden flex-wrap gap-1.5 md:flex xl:hidden" aria-label="Ad format">
                    {platforms[p].notes.map(n => <li key={n} className="chip !py-1 !text-[12px]">{n}</li>)}
                  </ul>
                </div>
                <div className="mx-auto w-full max-w-[340px]">
                  <AdPreview p={p} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* tracking flow */}
        <Reveal className="mt-6" amount={0.15}>
          <div className="surface-lg relative overflow-hidden rounded-[28px] px-5 py-7 sm:px-8 sm:py-9">
            <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-[20px] font-semibold tracking-[-0.02em]">Tracking, end to end</h3>
                <p className="mt-1 max-w-lg text-[14px] text-ink-3">Every lead is followed from the ad click to the report, so spend is judged on real outcomes.</p>
              </div>
              <p className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">Hover to pause · click a step</p>
            </div>
            <TrackingFlow />
          </div>
        </Reveal>

        {/* reporting + real screenshots to come */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Reveal amount={0.15}><ReportMock /></Reveal>
          <Reveal delay={0.1} amount={0.15} className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[17px] font-semibold tracking-[-0.01em]">From real campaigns</h3>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-3">Coming soon</span>
            </div>
            <ScreenshotSlot label="Meta Ads Manager — campaign setup" className="flex-1 bg-white/70" aspect="aspect-[16/9]" />
            <ScreenshotSlot label="Google Ads — campaign overview" className="flex-1 bg-white/70" aspect="aspect-[16/9]" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
