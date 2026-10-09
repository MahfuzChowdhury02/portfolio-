import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, cx } from "../../../components/ui";
import { ease } from "../../../lib/hooks";
import { BIcon, MockButton, StatusLine, useScript } from "../shared";

type Channel = "SMS" | "Email";
const sequence: { day: string; channel: Channel; text: string }[] = [
  { day: "Day 0", channel: "SMS", text: "Thanks for reaching out! Here's a link to book a time that suits you." },
  { day: "Day 0", channel: "Email", text: "What happens next — and how the first call works." },
  { day: "Day 1", channel: "SMS", text: "Quick check-in: any questions before you book?" },
  { day: "Day 3", channel: "Email", text: "A short guide to getting started." },
  { day: "Day 7", channel: "SMS", text: "Last nudge — the booking link is still open." },
];

export function FollowupMock({ active }: { active: boolean }) {
  const s = useScript(sequence.length, active, 1100, 600);
  const [repliedAt, setRepliedAt] = useState<number | null>(null);
  const sent = repliedAt ?? s.i;
  const stopped = repliedAt !== null;

  const reply = () => {
    const at = Math.max(1, s.i);
    setRepliedAt(at);
    s.setI(sequence.length); // halt the script
  };
  const replay = () => { setRepliedAt(null); s.replay(); };

  return (
    <div className="grid h-full gap-4 md:grid-cols-[minmax(0,1fr)_250px]">
      {/* sequence timeline */}
      <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-[17px] font-semibold tracking-[-0.02em]">New lead follow-up</p>
          <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-semibold", stopped ? "bg-teal-soft text-teal" : "bg-violet-soft text-violet")}>{stopped ? "Stopped on reply" : s.done ? "Completed" : "Active"}</span>
        </div>
        <ol className="relative mt-4 flex flex-col gap-2.5">
          <span aria-hidden className="absolute bottom-4 left-[15px] top-4 w-px bg-ink/10" />
          {sequence.map((m, i) => {
            const isSent = i < sent;
            const skipped = stopped && i >= sent;
            return (
              <li key={i} className="relative flex items-start gap-3">
                <span className={cx("relative z-10 grid size-[31px] shrink-0 place-items-center rounded-full border-2 border-white transition-colors duration-500", isSent ? (m.channel === "SMS" ? "bg-violet text-white" : "bg-sky text-white") : "bg-mist text-ink-3")}>
                  {m.channel === "SMS" ? <Icon name="message" className="size-3.5" /> : <Icon name="mail" className="size-3.5" />}
                </span>
                <div className={cx("min-w-0 flex-1 rounded-xl border px-3 py-2 transition-all duration-500", isSent ? "border-line bg-white" : "border-transparent bg-mist/60", skipped && "opacity-50")}>
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                    {m.day} · {m.channel}
                    <span className={cx("ml-auto rounded-full px-1.5 py-px text-[10px] normal-case tracking-normal", isSent ? "bg-teal-soft text-teal" : skipped ? "bg-mist text-ink-3 line-through" : "text-ink-3")}>
                      {isSent ? "Sent" : skipped ? "Skipped" : "Scheduled"}
                    </span>
                  </p>
                  <p className={cx("mt-0.5 text-[12.5px] leading-snug", isSent ? "text-ink" : "text-ink-3")}>{m.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* phone preview */}
      <div className="flex flex-col gap-3">
        <div className="relative hidden flex-1 overflow-hidden rounded-[26px] border-[6px] border-ink bg-[#f6f5fa] dark:border-[#2a2738] dark:bg-[#1d1b27] p-3 shadow-[0_24px_40px_-24px_rgb(23_21_31/0.6)] md:flex md:flex-col">
          <span aria-hidden className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-ink/80" />
          <p className="text-center text-[10.5px] font-semibold text-ink-3">Messages</p>
          <div className="mt-2 flex flex-1 flex-col justify-end gap-1.5">
            <AnimatePresence initial={false}>
              {sequence.slice(0, sent).filter(m => m.channel === "SMS").slice(-3).map(m => (
                <motion.p key={m.text} layout initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }} className="max-w-[88%] self-start rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[11.5px] leading-snug text-ink shadow-[0_1px_2px_rgb(23_21_31/0.08)]">
                  {m.text}
                </motion.p>
              ))}
              {stopped && (
                <motion.p key="reply" layout initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease }} className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-violet px-3 py-2 text-[11.5px] leading-snug text-white">
                  Yes please — can we talk this week?
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
        <StatusLine tone={stopped ? "teal" : "violet"}>{stopped ? "Lead replied — sequence stopped and lead moved to Contacted." : "Stops automatically on reply or booking."}</StatusLine>
        <div className="flex gap-2">
          <MockButton primary onClick={reply} disabled={stopped}><BIcon name="reply" className="size-3.5" /> Simulate a reply</MockButton>
          <MockButton onClick={replay} label="Replay the sequence"><Icon name="replay" className="size-3.5" /></MockButton>
        </div>
      </div>
    </div>
  );
}
