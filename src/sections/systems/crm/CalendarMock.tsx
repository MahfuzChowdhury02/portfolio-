import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, cx } from "../../../components/ui";
import { ease } from "../../../lib/hooks";
import { BIcon, MockButton, StatusLine, useScript } from "../shared";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const times = ["9:00", "10:30", "13:00", "15:30"] as const;
/** unavailable slots, as "day-time" indexes */
const busy = new Set(["0-1", "1-0", "2-2", "3-1", "3-3", "4-0"]);
const DEFAULT = "1-1";

const reminders = [
  { label: "Confirmation", sub: "SMS + email", state: "Sent" },
  { label: "Reminder", sub: "1 day before", state: "Scheduled" },
  { label: "Reminder", sub: "1 hour before", state: "Scheduled" },
] as const;

export function CalendarMock({ active }: { active: boolean }) {
  // script: 1 hover/select, 2 booked, 3..5 reminders
  const s = useScript(2 + reminders.length, active, 700, 700);
  const [slot, setSlot] = useState(DEFAULT);
  const selected = s.i >= 1;
  const booked = s.i >= 2;
  const shown = Math.max(0, s.i - 2);
  const [d, t] = slot.split("-").map(Number);

  const book = (key: string) => {
    setSlot(key);
    s.setI(s.reduced ? 2 + reminders.length : 1);
  };

  return (
    <div className="grid h-full gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
      <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-[18px] font-semibold tracking-[-0.02em]">Book a discovery call</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-3"><BIcon name="clock" className="size-3.5" /> 30 min · Video call</p>
          </div>
          <span className="hidden rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] text-ink-3 sm:inline">This week</span>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2" role="group" aria-label="Available times this week">
          {days.map((day, di) => (
            <div key={day} className="flex flex-col gap-1.5 sm:gap-2">
                <p className="text-center text-[11.5px] font-semibold text-ink-2">{day}</p>
                {times.map((time, ti) => {
                  const key = `${di}-${ti}`;
                  const isBusy = busy.has(key);
                  const mine = key === slot && selected;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isBusy}
                      aria-pressed={mine}
                      aria-label={`${day} ${time}${isBusy ? ", unavailable" : ""}`}
                      onClick={() => book(key)}
                      className={cx(
                        "relative h-9 rounded-lg border text-[11.5px] font-medium transition-all duration-300 sm:text-[12.5px]",
                        isBusy && "cursor-not-allowed border-transparent bg-mist text-ink-3/50 line-through",
                        !isBusy && !mine && "border-line-strong text-ink hover:border-violet hover:text-violet",
                        mine && !booked && "border-violet bg-violet-soft text-violet",
                        mine && booked && "border-violet bg-violet text-white shadow-[0_8px_18px_-8px_rgb(84_40_196/0.7)]",
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] text-ink-3">Pick any open time to book it.</p>
      </div>

      <div className="flex flex-col rounded-2xl border border-line bg-mist/60 p-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">After booking</p>
        <AnimatePresence mode="wait" initial={false}>
          {booked ? (
            <motion.div key={`b${slot}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }} className="mt-3 rounded-xl border border-violet/25 bg-white p-3">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <span className="grid size-6 place-items-center rounded-full bg-violet text-white"><Icon name="calendar" className="size-3.5" /></span>
                Call booked · {days[d]} {times[t]}
              </p>
              <p className="mt-1 pl-8 text-[11.5px] text-ink-3">Added to the calendar and the pipeline</p>
            </motion.div>
          ) : (
            <motion.p key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 rounded-xl border border-dashed border-line-strong p-3 text-[12.5px] text-ink-3">
              Waiting for a booking…
            </motion.p>
          )}
        </AnimatePresence>
        <ul className="mt-3 flex flex-1 flex-col gap-2">
          {reminders.map((r, i) => {
            const on = i < shown;
            return (
              <li key={i} className={cx("flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2 transition-all duration-500", on ? "border-line opacity-100" : "border-transparent opacity-40")}>
                <span className={cx("grid size-7 shrink-0 place-items-center rounded-lg", on ? "bg-amber-soft text-amber" : "bg-mist text-ink-3")}>
                  <BIcon name="bell" className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[12.5px] font-semibold">{r.label}</span>
                  <span className="block text-[11px] text-ink-3">{r.sub}</span>
                </span>
                <span className={cx("rounded-full px-2 py-0.5 text-[10.5px] font-semibold", on ? (r.state === "Sent" ? "bg-teal-soft text-teal" : "bg-amber-soft text-amber") : "text-ink-3")}>{on ? r.state : "—"}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center justify-between gap-2">
          <StatusLine tone={s.done ? "teal" : "amber"}>{s.done ? "Reminders scheduled" : "Booking…"}</StatusLine>
          <MockButton onClick={() => { setSlot(DEFAULT); s.replay(); }} label="Replay the booking demo"><Icon name="replay" className="size-3.5" /></MockButton>
        </div>
      </div>
    </div>
  );
}
