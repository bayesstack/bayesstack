import { useState, useCallback, useRef } from "react";

const AUDIO_STORAGE_KEY = "bs_cs_sound_enabled";

/**
 * Web Audio API synthesized sensory cues for BayesStack Coding Studio.
 * Zero external audio assets, zero network latency (<5ms response time), offline ready.
 */
export function useAudioEffects() {
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AUDIO_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  /**
   * Subtle, crisp mechanical key click on "Run" action
   */
  const playClick = useCallback(() => {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.035);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.038);
    } catch {
      // AudioContext unavailable in test/headless env
    }
  }, [isAudioEnabled, getAudioContext]);

  /**
   * Celebratory ascending major arpeggio chime on "Accepted" submission
   * Notes: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz) with rich harmonic decay
   */
  const playChime = useCallback(() => {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const noteDelay = 0.075; // 75ms spacing for quick ascending flourish

      notes.forEach((freq, idx) => {
        const startTime = now + idx * noteDelay;
        const duration = 0.45;

        // Primary bell tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.14, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);

        // Warm harmonic overtone (octave higher)
        const overtone = ctx.createOscillator();
        const overGain = ctx.createGain();
        overtone.type = "sine";
        overtone.frequency.setValueAtTime(freq * 2, startTime);

        overGain.gain.setValueAtTime(0, startTime);
        overGain.gain.linearRampToValueAtTime(0.04, startTime + 0.01);
        overGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);

        overtone.connect(overGain);
        overGain.connect(ctx.destination);

        overtone.start(startTime);
        overtone.stop(startTime + duration * 0.7);
      });
    } catch {
      // AudioContext unavailable
    }
  }, [isAudioEnabled, getAudioContext]);

  /**
   * Soft, gentle non-punitive double-tone on Wrong Answer / Failure
   * Notes: E4 (330Hz) -> C4 (261Hz) with soft sine warmth
   */
  const playFailure = useCallback(() => {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [329.63, 261.63]; // E4, C4
      const noteDelay = 0.11;

      notes.forEach((freq, idx) => {
        const startTime = now + idx * noteDelay;
        const duration = 0.22;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // AudioContext unavailable
    }
  }, [isAudioEnabled, getAudioContext]);

  return {
    isAudioEnabled,
    toggleAudio,
    playClick,
    playChime,
    playFailure,
  };
}
