import type { CSSProperties, ReactNode } from "react";
import type { Project } from "../../content";
import { cx } from "../../components/ui";

/* ---------------------------------------------------------------
   Abstract placeholder art for project slots that have no
   screenshots yet. Pure shapes — no text, no numbers, no names.
   The layout hints at the project type; colours come from `accent`.
   --------------------------------------------------------------- */

export type Accent = Project["accent"];

export const accentTokens: Record<Accent, { a: string; b: string; soft: string; text: string; ring: string; glow: string }> = {
  violet: { a: "#6d3ce6", b: "#b5279e", soft: "#efeafd", text: "text-violet", ring: "ring-violet/20", glow: "rgb(109 60 230 / 0.22)" },
  sky: { a: "#0f6fb8", b: "#6d3ce6", soft: "#e7f2fb", text: "text-sky", ring: "ring-sky/20", glow: "rgb(15 111 184 / 0.2)" },
  teal: { a: "#0b7c74", b: "#0f6fb8", soft: "#e3f4f1", text: "text-teal", ring: "ring-teal/20", glow: "rgb(11 124 116 / 0.2)" },
  amber: { a: "#a8550a", b: "#c2334d", soft: "#fbf0e3", text: "text-amber", ring: "ring-amber/20", glow: "rgb(168 85 10 / 0.2)" },
};

export type ArtVariant = "site" | "board" | "funnel" | "ads";

/** Pick a skeleton layout that matches the project type (falls back to a website layout). */
export function artVariantFor(p: Project): ArtVariant {
  const t = `${p.type} ${p.name}`.toLowerCase();
  if (/crm|gohighlevel|ghl/.test(t)) return "board";
  if (/funnel/.test(t)) return "funnel";
  if (/ads|campaign/.test(t)) return "ads";
  return "site";
}

const Bar = ({ w, className, style }: { w: string; className?: string; style?: CSSProperties }) => (
  <span className={cx("block h-2 rounded-full bg-ink/[0.08]", className)} style={{ width: w, ...style }} />
);

function Grad({ accent, className, style, children }: { accent: Accent; className?: string; style?: CSSProperties; children?: ReactNode }) {
  const t = accentTokens[accent];
  return (
    <div className={cx("relative overflow-hidden", className)} style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})`, ...style }}>
      <div className="absolute -right-6 -top-8 size-28 rounded-full bg-white/25 blur-xl" />
      <div className="absolute -bottom-10 left-4 size-24 rounded-full bg-black/10 blur-xl" />
      {children}
    </div>
  );
}

function SiteArt({ accent }: { accent: Accent }) {
  const t = accentTokens[accent];
  return (
    <div className="flex flex-col gap-5 p-[6%]">
      <div className="flex items-center justify-between">
        <span className="h-3 w-16 rounded-full" style={{ background: t.a, opacity: 0.85 }} />
        <span className="flex gap-3"><Bar w="34px" /><Bar w="34px" /><Bar w="34px" /><span className="h-4 w-14 rounded-full" style={{ background: t.soft }} /></span>
      </div>
      <div className="grid grid-cols-[1.1fr_1fr] items-center gap-[6%] pt-[4%]">
        <div className="flex flex-col gap-2.5">
          <span className="h-2 w-16 rounded-full" style={{ background: t.soft }} />
          <span className="h-4 w-[92%] rounded-md bg-ink/80" />
          <span className="h-4 w-[70%] rounded-md bg-ink/80" />
          <Bar w="88%" className="mt-2" /><Bar w="74%" />
          <span className="mt-3 flex gap-2"><span className="h-6 w-20 rounded-full" style={{ background: t.a }} /><span className="h-6 w-16 rounded-full border border-ink/15" /></span>
        </div>
        <Grad accent={accent} className="aspect-[4/3.4] rounded-xl">
          <div className="absolute inset-x-[14%] bottom-[14%] rounded-lg bg-white/85 p-2.5 shadow-lg"><Bar w="70%" /><Bar w="45%" className="mt-1.5" /></div>
        </Grad>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-[3%]">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-xl border border-ink/[0.07] bg-white p-3">
            <span className="mb-3 block size-6 rounded-lg" style={{ background: t.soft }} />
            <Bar w="80%" /><Bar w="60%" className="mt-1.5" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Grad accent={accent} className="aspect-[16/10] rounded-xl opacity-80" />
        <div className="flex flex-col justify-center gap-2"><span className="h-3 w-[70%] rounded-md bg-ink/70" /><Bar w="90%" /><Bar w="80%" /><Bar w="55%" /></div>
      </div>
      <div className="mt-2 rounded-2xl p-5" style={{ background: t.soft }}>
        <span className="mx-auto block h-3 w-[40%] rounded-md bg-ink/70" /><span className="mx-auto mt-3 block h-6 w-24 rounded-full" style={{ background: t.a }} />
      </div>
    </div>
  );
}

function BoardArt({ accent }: { accent: Accent }) {
  const t = accentTokens[accent];
  const cols = [3, 2, 3, 1];
  return (
    <div className="grid flex-1 grid-cols-[18%_1fr]">
      <div className="flex flex-col gap-3 border-r border-ink/[0.06] bg-mist/70 p-[12%]">
        <span className="mb-2 h-3 w-[70%] rounded-full" style={{ background: t.a }} />
        {[0, 1, 2, 3, 4, 5].map(i => <span key={i} className={cx("flex items-center gap-2 rounded-md p-1.5", i === 1 && "bg-white shadow-sm")}><span className="size-3 rounded" style={{ background: i === 1 ? t.a : "rgb(23 21 31 / 0.12)" }} /><Bar w="60%" /></span>)}
      </div>
      <div className="flex flex-col gap-4 p-[5%]">
        <div className="flex items-center justify-between"><span className="h-3.5 w-28 rounded-md bg-ink/75" /><span className="h-6 w-20 rounded-full" style={{ background: t.a }} /></div>
        <div className="grid grid-cols-4 gap-2.5">
          {cols.map((n, c) => (
            <div key={c} className="flex flex-col gap-2 rounded-xl bg-mist/80 p-2">
              <span className="flex items-center gap-1.5 px-1 pb-1"><span className="size-2 rounded-full" style={{ background: c === 0 ? t.a : t.b, opacity: 0.4 + c * 0.15 }} /><Bar w="55%" /></span>
              {Array.from({ length: n }, (_, k) => (
                <div key={k} className="rounded-lg border border-ink/[0.06] bg-white p-2 shadow-[0_1px_2px_rgb(23_21_31/0.05)]">
                  <span className="flex items-center gap-1.5"><span className="size-4 rounded-full" style={{ background: t.soft }} /><Bar w="60%" /></span>
                  <Bar w="85%" className="mt-2" /><Bar w="50%" className="mt-1" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1.4fr_1fr] gap-3">
          <div className="rounded-xl border border-ink/[0.07] bg-white p-3">
            <Bar w="40%" />
            <div className="mt-3 flex flex-col gap-2">
              {[0, 1, 2].map(i => <span key={i} className="flex items-center gap-2"><span className="size-5 rounded-md" style={{ background: t.soft }} /><Bar w={`${70 - i * 12}%`} /><span className="ml-auto h-3 w-10 rounded-full" style={{ background: t.soft }} /></span>)}
            </div>
          </div>
          <Grad accent={accent} className="rounded-xl opacity-90" />
        </div>
      </div>
    </div>
  );
}

function FunnelArt({ accent }: { accent: Accent }) {
  const t = accentTokens[accent];
  const page = (i: number) => (
    <div className="flex flex-col gap-2 rounded-xl border border-ink/[0.07] bg-white p-2.5 shadow-[0_10px_24px_-14px_rgb(23_21_31/0.3)]">
      {i === 0 && <><Grad accent={accent} className="aspect-[4/3] rounded-lg" /><span className="h-2.5 w-[85%] rounded bg-ink/75" /><Bar w="70%" /><span className="mt-1 h-5 w-[60%] rounded-full" style={{ background: t.a }} /></>}
      {i === 1 && <><span className="h-2.5 w-[70%] rounded bg-ink/75" />{[0, 1, 2].map(k => <span key={k} className="h-5 rounded-md border border-ink/10" />)}<span className="mt-1 h-5 rounded-full" style={{ background: t.a }} /></>}
      {i === 2 && <><span className="mx-auto mt-2 grid size-10 place-items-center rounded-full" style={{ background: t.soft }}><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke={t.a} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17l9-10" /></svg></span><span className="mx-auto h-2.5 w-[70%] rounded bg-ink/75" /><Bar w="80%" className="mx-auto" /><Bar w="60%" className="mx-auto" /></>}
    </div>
  );
  return (
    <div className="flex flex-col gap-6 p-[6%]">
      <div className="flex items-center gap-3"><span className="h-3 w-24 rounded-md bg-ink/75" /><span className="h-2 w-16 rounded-full" style={{ background: t.soft }} /></div>
      <div className="relative grid grid-cols-3 items-start gap-[7%]">
        <svg aria-hidden className="absolute inset-x-[12%] top-1/2 h-4 w-[76%] -translate-y-1/2" viewBox="0 0 100 4" preserveAspectRatio="none"><path d="M0 2H100" stroke={t.a} strokeOpacity={0.35} strokeWidth={0.6} strokeDasharray="2 2" /></svg>
        {[0, 1, 2].map(i => <div key={i} className="relative" style={{ transform: `translateY(${i * 14}px)` }}>{page(i)}</div>)}
      </div>
      <div className="mt-6 grid grid-cols-[1fr_1.3fr] gap-4">
        <div className="flex flex-col gap-2 rounded-xl p-4" style={{ background: t.soft }}>
          {[100, 78, 56, 38].map(w => <span key={w} className="mx-auto h-4 rounded-md" style={{ width: `${w}%`, background: t.a, opacity: 0.25 + (100 - w) / 120 }} />)}
        </div>
        <div className="flex flex-col gap-2.5 rounded-xl border border-ink/[0.07] bg-white p-4"><Bar w="45%" /><Bar w="90%" /><Bar w="75%" /><Bar w="82%" /><Bar w="50%" /></div>
      </div>
      <Grad accent={accent} className="aspect-[16/6] rounded-2xl opacity-80" />
    </div>
  );
}

function AdsArt({ accent }: { accent: Accent }) {
  const t = accentTokens[accent];
  return (
    <div className="flex flex-col gap-5 p-[6%]">
      <div className="flex items-center justify-between"><span className="h-3.5 w-28 rounded-md bg-ink/75" /><span className="flex gap-2"><span className="h-5 w-14 rounded-full" style={{ background: t.soft }} /><span className="h-5 w-14 rounded-full border border-ink/10" /></span></div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="overflow-hidden rounded-xl border border-ink/[0.07] bg-white">
            <span className="flex items-center gap-1.5 p-2"><span className="size-4 rounded-full" style={{ background: t.soft }} /><Bar w="50%" /></span>
            <Grad accent={accent} className="aspect-square" style={{ opacity: 1 - i * 0.18 }} />
            <div className="flex items-center justify-between gap-2 p-2"><Bar w="55%" /><span className="h-4 w-10 rounded" style={{ background: t.soft }} /></div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-ink/[0.07] bg-white p-4">
        <Bar w="30%" />
        <svg aria-hidden viewBox="0 0 300 80" className="mt-3 h-20 w-full" preserveAspectRatio="none">
          <defs><linearGradient id={`ads-art-${accent}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={t.a} stopOpacity="0.28" /><stop offset="1" stopColor={t.a} stopOpacity="0" /></linearGradient></defs>
          <path d="M0 62 C40 58 60 40 100 44 S160 30 200 26 S260 18 300 12 V80 H0Z" fill={`url(#ads-art-${accent})`} />
          <path d="M0 62 C40 58 60 40 100 44 S160 30 200 26 S260 18 300 12" fill="none" stroke={t.a} strokeWidth="2" />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map(i => <div key={i} className="flex flex-col gap-2 rounded-xl p-3" style={{ background: i ? "#fff" : t.soft, border: i ? "1px solid rgb(23 21 31 / 0.07)" : undefined }}><Bar w="60%" /><Bar w="85%" /><Bar w="40%" /></div>)}
      </div>
    </div>
  );
}

/** Tall skeleton page — taller than its frame so it can "scroll" on hover as a live preview. */
export function ProjectArt({ project, className }: { project: Project; className?: string }) {
  const t = accentTokens[project.accent];
  const v = artVariantFor(project);
  return (
    <div aria-hidden className={cx("relative flex w-full select-none flex-col bg-white", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48" style={{ background: `radial-gradient(80% 100% at 80% 0%, ${t.soft}, transparent 70%)` }} />
      <div className="relative flex flex-1 flex-col">
        {v === "site" && <SiteArt accent={project.accent} />}
        {v === "board" && <BoardArt accent={project.accent} />}
        {v === "funnel" && <FunnelArt accent={project.accent} />}
        {v === "ads" && <AdsArt accent={project.accent} />}
      </div>
    </div>
  );
}
