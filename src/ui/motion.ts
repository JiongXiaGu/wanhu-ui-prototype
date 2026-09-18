import { useEffect, useRef, useState } from 'react';

export const MOTION_MS = {
  fast: 100,
  control: 120,
  surface: 160,
  space: 200,
} as const;

export type MotionPhase = 'entering' | 'steady' | 'exiting' | 'hidden';

interface PresenceOptions {
  exitMs?: number;
  enterDelayMs?: number;
  initialEnter?: boolean;
}

function reducedMotionEnabled() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

export function usePresence(
  visible: boolean,
  {
    exitMs = MOTION_MS.fast,
    enterDelayMs = 0,
    initialEnter = true,
  }: PresenceOptions = {},
) {
  const [mounted, setMounted] = useState(visible);
  const [phase, setPhase] = useState<MotionPhase>(
    visible ? (initialEnter ? 'entering' : 'steady') : 'hidden',
  );
  const mountedRef = useRef(visible);
  const timeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);

    const reduced = reducedMotionEnabled();

    if (visible) {
      if (!mountedRef.current) {
        mountedRef.current = true;
        setMounted(true);
      }

      if (reduced) {
        setPhase('steady');
        return;
      }

      setPhase('entering');
      timeoutRef.current = window.setTimeout(() => {
        frameRef.current = window.requestAnimationFrame(() => setPhase('steady'));
      }, enterDelayMs);
      return;
    }

    if (!mountedRef.current) {
      setPhase('hidden');
      return;
    }

    if (reduced) {
      mountedRef.current = false;
      setMounted(false);
      setPhase('hidden');
      return;
    }

    setPhase('exiting');
    timeoutRef.current = window.setTimeout(() => {
      mountedRef.current = false;
      setMounted(false);
      setPhase('hidden');
    }, exitMs);
  }, [visible, exitMs, enterDelayMs]);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);

  return { mounted, phase } as const;
}
