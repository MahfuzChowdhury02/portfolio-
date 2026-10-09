import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

/**
 * Advances a step counter on an interval while `running` is true.
 * State only changes once per tick (never per frame).
 */
export function useAutoStep(count: number, ms: number, running: boolean, initial = 0) {
  const [step, setStep] = useState(initial);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setStep(s => (s + 1) % count), ms);
    return () => window.clearInterval(id);
  }, [count, ms, running]);
  return [step, setStep] as const;
}

/** Tracks hover + keyboard focus inside an element so autoplay can pause. */
export function usePauseOnInteract() {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const bind = {
    onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType === "mouse") setHover(true); },
    onPointerLeave: () => setHover(false),
    onFocus: () => setFocus(true),
    onBlur: (e: React.FocusEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false); },
  };
  return { paused: hover || focus, bind };
}

/**
 * Roving-tabindex keyboard support for tablists / radio-like groups.
 * Arrow keys (both axes), Home and End move focus and selection.
 */
export function useRoving(count: number, active: number, select: (i: number) => void) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const onKeyDown = useCallback(
    (e: KeyboardEvent, i: number) => {
      let n = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % count;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + count) % count;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = count - 1;
      if (n < 0) return;
      e.preventDefault();
      e.stopPropagation();
      select(n);
      refs.current[n]?.focus();
    },
    [count, select],
  );
  const itemProps = (i: number) => ({
    ref: (el: HTMLElement | null) => { refs.current[i] = el; },
    tabIndex: i === active ? 0 : -1,
    onKeyDown: (e: KeyboardEvent) => onKeyDown(e, i),
  });
  return itemProps;
}

export type RovingProps = ReturnType<ReturnType<typeof useRoving>>;
