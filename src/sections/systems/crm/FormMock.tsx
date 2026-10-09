import { motion } from "framer-motion";
import { Icon, cx } from "../../../components/ui";
import { BIcon, MockButton, StatusLine, useScript } from "../shared";

/* Illustrative values only — example.com / 555 numbers are reserved for fiction. */
const fields = [
  { id: "name", label: "Full name", value: "Sample Lead" },
  { id: "email", label: "Email", value: "lead@example.com" },
  { id: "phone", label: "Phone", value: "+1 555 0100" },
  { id: "need", label: "What do you need?", value: "A new website + CRM" },
] as const;
const outcomes = [
  { icon: "user", label: "Contact created", sub: "Name, email and phone saved" },
  { icon: "tag", label: "Tags added", sub: "source: website · new-lead" },
  { icon: "branch", label: "Workflow started", sub: "New lead follow-up" },
  { icon: "bell", label: "Owner notified", sub: "In-app + email alert" },
] as const;

// script: 0..3 fill fields, 4 consent, 5 submit, 6..9 outcomes
const TOTAL = fields.length + 2 + outcomes.length;

export function FormMock({ active }: { active: boolean }) {
  const s = useScript(TOTAL, active, 650, 500);
  const filled = Math.min(s.i, fields.length);
  const consent = s.i > fields.length;
  const submitted = s.i > fields.length + 1;
  const shownOutcomes = Math.max(0, s.i - (fields.length + 2));

  return (
    <div className="grid h-full gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      {/* the form */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-5">
        <p className="font-display text-[19px] font-semibold tracking-[-0.02em]">Request a callback</p>
        <p className="mt-1 text-[12.5px] text-ink-3">Embedded on a landing page · connected to the CRM</p>
        <div className="mt-4 flex flex-col gap-3">
          {fields.map((f, i) => (
            <div key={f.id}>
              <p className="mb-1 text-[11.5px] font-medium text-ink-2">{f.label}</p>
              <div className={cx("flex h-10 items-center rounded-lg border px-3 text-[13.5px] transition-colors duration-300", i === filled && !submitted && s.i < fields.length ? "border-violet/60 shadow-[0_0_0_3px_rgb(109_60_230/0.10)]" : "border-line-strong")}>
                {i < filled ? (
                  <motion.span initial={s.reduced ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.5, ease: "linear" }} className="truncate text-ink">
                    {f.value}
                  </motion.span>
                ) : (
                  <span className="text-ink-3/60">—</span>
                )}
              </div>
            </div>
          ))}
          <p className="flex items-center gap-2 text-[12px] text-ink-2">
            <span className={cx("grid size-4 place-items-center rounded border transition-colors", consent ? "border-violet bg-violet text-white" : "border-line-strong")}>
              {consent && <Icon name="check" className="size-3" strokeWidth={3} />}
            </span>
            I agree to be contacted about my enquiry
          </p>
          <div className={cx("mt-1 flex h-10 items-center justify-center gap-2 rounded-lg text-[13.5px] font-semibold text-white transition-colors duration-300", submitted ? "bg-teal" : "bg-violet")}>
            {submitted ? <><Icon name="check" className="size-4" /> Submitted</> : "Request my callback"}
          </div>
        </div>
      </div>

      {/* what happens on submit */}
      <div className="flex flex-col rounded-2xl border border-line bg-mist/60 p-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">On submit</p>
        <ol className="mt-3 flex flex-1 flex-col gap-2">
          {outcomes.map((o, i) => {
            const on = i < shownOutcomes;
            return (
              <li key={o.label} className={cx("flex items-center gap-3 rounded-xl border bg-white p-2.5 transition-all duration-500", on ? "border-teal/30 opacity-100" : "border-line opacity-45")}>
                <span className={cx("grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-500", on ? "bg-teal-soft text-teal" : "bg-mist text-ink-3")}>
                  {o.icon === "tag" || o.icon === "bell" ? <BIcon name={o.icon} className="size-4" /> : <Icon name={o.icon} className="size-4" />}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[13px] font-semibold text-ink">{o.label}</span>
                  <span className="block truncate text-[11.5px] text-ink-3">{o.sub}</span>
                </span>
                {on && <Icon name="check" className="size-4 text-teal" strokeWidth={2.4} />}
              </li>
            );
          })}
        </ol>
        <div className="mt-3 flex items-center justify-between gap-2">
          <StatusLine tone={s.done ? "teal" : "violet"}>{s.done ? "Lead is in the CRM" : submitted ? "Processing…" : "Filling the form…"}</StatusLine>
          <MockButton onClick={s.replay}><Icon name="replay" className="size-3.5" /> Replay</MockButton>
        </div>
      </div>
    </div>
  );
}
