import type { ReactNode } from "react";
import { Icon, cx, type IconName } from "../../components/ui";

/* ======================================================================
   Mini visuals for each funnel stage. Illustrative UI only:
   generic labels, no names, no numbers.
   ====================================================================== */

export type StageId = "traffic" | "landing" | "form" | "crm" | "automation" | "appointment" | "conversion";

export const stageIcons: Record<StageId, IconName> = {
  traffic: "target",
  landing: "globe",
  form: "layers",
  crm: "database",
  automation: "bolt",
  appointment: "calendar",
  conversion: "check",
};

const Bar = ({ w, className }: { w: string; className?: string }) => <span className={cx("block h-1.5 rounded-full bg-ink/10", className)} style={{ width: w }} />;

function Shell({ children, title, icon, className }: { children: ReactNode; title: string; icon: IconName; className?: string }) {
  return (
    <div className={cx("overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgb(23_21_31/0.05),0_30px_60px_-30px_rgb(48_27_120/0.35)]", className)}>
      <div className="flex items-center gap-2 border-b border-line bg-mist/60 px-3 py-2">
        <span className="grid size-5 place-items-center rounded-md bg-white text-violet ring-1 ring-line"><Icon name={icon} className="size-3" /></span>
        <span className="text-[11.5px] font-semibold text-ink-2">{title}</span>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

function Traffic() {
  return (
    <Shell title="Ad" icon="target">
      <div className="flex items-center gap-2">
        <span className="size-6 rounded-full bg-gradient-to-br from-violet to-fuchsia" />
        <span className="leading-tight"><span className="block text-[11.5px] font-semibold">Your Business</span><span className="block text-[10px] text-ink-3">Sponsored</span></span>
      </div>
      <div className="relative mt-2.5 aspect-[16/9] overflow-hidden rounded-lg bg-gradient-to-br from-violet via-fuchsia to-sky">
        <div className="absolute -right-4 -top-6 size-20 rounded-full bg-white/25 blur-lg" />
        <div className="absolute bottom-2 left-2 right-10 rounded-md bg-white/90 p-1.5"><Bar w="70%" className="bg-ink/50" /><Bar w="45%" className="mt-1" /></div>
        <Icon name="cursor" className="absolute bottom-3 right-4 size-5 fill-white text-ink drop-shadow" />
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="flex gap-1.5"><span className="rounded-full bg-violet-soft px-2 py-0.5 text-[10px] font-semibold text-violet">Meta</span><span className="rounded-full bg-sky-soft px-2 py-0.5 text-[10px] font-semibold text-sky">Google</span></span>
        <span className="rounded-md bg-ink px-2.5 py-1 text-[10.5px] font-semibold text-white">Learn more</span>
      </div>
    </Shell>
  );
}

function Landing() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgb(23_21_31/0.05),0_30px_60px_-30px_rgb(48_27_120/0.35)]">
      <div className="flex items-center gap-1.5 border-b border-line bg-mist/60 px-3 py-2">
        <span className="size-1.5 rounded-full bg-[#ff5f57]" /><span className="size-1.5 rounded-full bg-[#febc2e]" /><span className="size-1.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 h-3 flex-1 rounded bg-white" />
      </div>
      <div className="p-3.5">
        <span className="block h-1.5 w-10 rounded-full bg-violet/30" />
        <span className="mt-2 block h-2.5 w-[88%] rounded bg-ink/80" />
        <span className="mt-1 block h-2.5 w-[62%] rounded bg-ink/80" />
        <Bar w="80%" className="mt-2.5" /><Bar w="66%" className="mt-1" />
        <div className="mt-3 flex items-center gap-2">
          <span className="relative rounded-full bg-violet px-3 py-1.5 text-[10.5px] font-semibold text-white">
            Book a call
            <span aria-hidden className="absolute -inset-1 rounded-full ring-2 ring-violet/30" />
          </span>
          <span className="text-[10.5px] text-ink-3">One clear action</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">{[0, 1, 2].map(i => <span key={i} className="h-8 rounded-md bg-mist" />)}</div>
      </div>
    </div>
  );
}

function Form() {
  const fields = ["Name", "Email", "Phone"];
  return (
    <Shell title="Lead form" icon="layers">
      <div className="flex flex-col gap-2">
        {fields.map((f, i) => (
          <div key={f}>
            <span className="text-[10px] font-medium text-ink-3">{f}</span>
            <span className={cx("mt-0.5 flex h-7 items-center rounded-md border px-2", i === 2 ? "border-violet ring-2 ring-violet/15" : "border-line")}>
              <Bar w={i === 2 ? "30%" : i === 1 ? "60%" : "45%"} className={i === 2 ? "bg-violet/30" : "bg-ink/15"} />
              {i === 2 && <span className="ml-0.5 h-3.5 w-px bg-violet" />}
            </span>
          </div>
        ))}
        <span className="mt-1 grid h-8 place-items-center rounded-md bg-ink text-[11px] font-semibold text-white">Send</span>
      </div>
    </Shell>
  );
}

function Crm() {
  return (
    <Shell title="CRM · Pipeline" icon="database">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-violet-soft text-violet"><Icon name="user" className="size-4" /></span>
        <span className="leading-tight"><span className="block text-[12px] font-semibold">New lead</span><span className="block text-[10.5px] text-ink-3">Added just now</span></span>
        <span className="ml-auto rounded-full bg-teal-soft px-2 py-0.5 text-[10px] font-semibold text-teal">New</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Source: ad", "Website form"].map(t => <span key={t} className="rounded-md border border-line bg-mist/70 px-1.5 py-0.5 text-[10px] font-medium text-ink-2">{t}</span>)}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[9.5px] font-medium">
        {["New", "Contacted", "Booked"].map((s, i) => (
          <span key={s} className={cx("rounded-md px-1 py-1.5", i === 0 ? "bg-ink text-white" : "bg-mist text-ink-3")}>{s}</span>
        ))}
      </div>
    </Shell>
  );
}

function Automation() {
  return (
    <Shell title="Automation" icon="bolt">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-ink-3">
        <span className="rounded-md bg-violet-soft px-1.5 py-0.5 text-violet">Trigger</span> Form submitted
      </div>
      <div className="mt-2.5 flex flex-col gap-2">
        <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-mist px-3 py-2 text-[11px] leading-snug text-ink">Thanks for getting in touch! Pick a time that suits you here.</div>
        <div className="ml-auto flex items-center gap-1.5 text-[9.5px] text-ink-3"><Icon name="check" className="size-3 text-teal" />Sent automatically</div>
      </div>
      <div className="mt-2 flex gap-1.5">
        {(["message", "mail"] as const).map(ic => <span key={ic} className="grid size-6 place-items-center rounded-md border border-line text-ink-2"><Icon name={ic} className="size-3" /></span>)}
        <span className="ml-auto self-center text-[10px] text-ink-3">Follow-ups scheduled</span>
      </div>
    </Shell>
  );
}

function Appointment() {
  const picked = 10;
  return (
    <Shell title="Calendar" icon="calendar">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className={cx("grid aspect-square place-items-center rounded-md", i === picked ? "bg-violet shadow-[0_6px_14px_-6px_rgb(109_60_230/0.8)]" : i % 7 > 4 ? "bg-transparent" : "bg-mist")}>
            {i === picked && <Icon name="check" className="size-3 text-white" />}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-line px-2.5 py-2">
        <span className="grid size-6 place-items-center rounded-md bg-teal-soft text-teal"><Icon name="phone" className="size-3" /></span>
        <span className="leading-tight"><span className="block text-[11px] font-semibold">Call booked</span><span className="block text-[9.5px] text-ink-3">Reminders scheduled</span></span>
      </div>
    </Shell>
  );
}

function Conversion() {
  return (
    <Shell title="Outcome" icon="check">
      <div className="flex flex-col items-center py-1 text-center">
        <span className="relative grid size-12 place-items-center rounded-full bg-gradient-to-br from-violet to-fuchsia text-white shadow-[0_12px_26px_-10px_rgb(109_60_230/0.8)]">
          <Icon name="check" className="size-6" />
        </span>
        <span className="mt-2.5 text-[12.5px] font-semibold">New customer</span>
        <span className="text-[10.5px] text-ink-3">From a booked call</span>
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[9.5px] font-medium text-ink-2">
        {["Ad", "Page", "Form", "CRM", "Call"].map((s, i) => (
          <span key={s} className="flex items-center gap-1.5">{i > 0 && <span className="h-px w-2 bg-ink/20" />}<span className="rounded bg-mist px-1 py-0.5">{s}</span></span>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-teal">Source tracked</p>
    </Shell>
  );
}

export function StageVisual({ id }: { id: StageId }) {
  switch (id) {
    case "traffic": return <Traffic />;
    case "landing": return <Landing />;
    case "form": return <Form />;
    case "crm": return <Crm />;
    case "automation": return <Automation />;
    case "appointment": return <Appointment />;
    case "conversion": return <Conversion />;
  }
}
