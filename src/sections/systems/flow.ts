import { useCallback, useEffect, useState } from "react";
import { automationFlow } from "../../content";
import type { Tint } from "./shared";

export type FlowStep = (typeof automationFlow)[number];
export const steps = automationFlow;
export const LAST = steps.length - 1;

/** What the sample lead experiences at each step — illustrative wording only, no figures. */
export const stepEvents: Record<FlowStep["id"], readonly string[]> = {
  lead: ["Website form submitted", "Name, email and phone captured", "Source recorded"],
  crm: ["Contact created or updated", "Tagged by source", "Placed in the pipeline: New lead"],
  ai: ["Enquiry read and summarised", "Common question answered", "Intent qualified"],
  workflow: ["Owner assigned", "Pipeline stage updated", "Follow-up sequence started"],
  followup: ["SMS sent", "Email sent", "Sequence stops when the lead replies"],
  appointment: ["Time booked from the calendar", "Confirmation sent", "Reminders scheduled"],
  reporting: ["Booking linked to its source", "Pipeline view updated", "Every step logged"],
};

export const stepTint: Record<FlowStep["id"], Tint> = {
  lead: "violet",
  crm: "sky",
  ai: "fuchsia",
  workflow: "violet",
  followup: "teal",
  appointment: "amber",
  reporting: "sky",
};

export const DWELL_MS = 2600;
export const LAST_DWELL_MS = 4200;
export const TRAVEL_MS = 1000;

/**
 * Drives the sample lead through the flow.
 * `step` = node the lead is at; `traveling` = edge index while moving step → step+1.
 * Auto-advances only while `playing` (user intent) and `enabled` (in view, not hovered, motion allowed).
 */
export function useFlowRunner(enabled: boolean, initiallyPlaying: boolean) {
  const [step, setStep] = useState(0);
  const [traveling, setTraveling] = useState<number | null>(null);
  const [playing, setPlaying] = useState(initiallyPlaying);
  const [cycle, setCycle] = useState(0);

  const running = playing && enabled;

  useEffect(() => {
    if (!running) return;
    if (traveling !== null) {
      const t = setTimeout(() => { setStep(traveling + 1); setTraveling(null); }, TRAVEL_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (step < LAST) setTraveling(step);
      else { setStep(0); setCycle(c => c + 1); }
    }, step === LAST ? LAST_DWELL_MS : DWELL_MS);
    return () => clearTimeout(t);
  }, [running, traveling, step]);

  // if paused mid-travel, land on the next node so the UI never freezes between steps
  useEffect(() => {
    if (!running && traveling !== null) { setStep(traveling + 1); setTraveling(null); }
  }, [running, traveling]);

  const select = useCallback((i: number) => { setTraveling(null); setStep(i); setPlaying(false); }, []);
  const replay = useCallback(() => { setTraveling(null); setStep(0); setCycle(c => c + 1); setPlaying(true); }, []);
  const toggle = useCallback(() => setPlaying(p => !p), []);
  const next = useCallback(() => { setTraveling(null); setPlaying(false); setStep(s => (s >= LAST ? 0 : s + 1)); }, []);
  const prev = useCallback(() => { setTraveling(null); setPlaying(false); setStep(s => (s <= 0 ? LAST : s - 1)); }, []);

  return { step, traveling, playing, running, cycle, select, replay, toggle, next, prev };
}
export type FlowRunner = ReturnType<typeof useFlowRunner>;
