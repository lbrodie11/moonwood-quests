/**
 * Synthesized Web Audio sound effects with gentle envelopes and decibel-scaled
 * headroom. Respects the Sound setting; the AudioContext is created lazily on
 * the first user gesture.
 */
export class AudioSystem {
  private context: AudioContext | null = null;

  constructor(private readonly enabled: () => boolean) {}

  /** A soft rising chime for a correct answer. */
  chime(): void {
    this.notes([523.25, 659.25, 783.99], 0.09, "sine", 0.07);
  }

  /** A gentle, non-punishing "hmm" for a wrong answer or hint prompt. */
  hmm(): void {
    this.notes([392, 349.23], 0.12, "triangle", 0.045);
  }

  /** Soft sparkle sound when discovering a hidden treasure or talking to a friend. */
  discover(): void {
    this.notes([587.33, 783.99, 987.77, 1174.66], 0.07, "sine", 0.06);
  }

  /** Gentle footstep / map move cue. */
  step(): void {
    this.notes([261.63, 329.63], 0.05, "sine", 0.03);
  }

  /** Celebration arpeggio for completing a quest or restoring the kingdom. */
  fanfare(): void {
    this.notes([523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5], 0.11, "sine", 0.08);
  }

  private notes(frequencies: readonly number[], step: number, type: OscillatorType, volume = 0.08): void {
    if (!this.enabled()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const start = ctx.currentTime + 0.01;
    frequencies.forEach((frequency, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = start + i * step;
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + step * 2.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + step * 3);
    });
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context;
    try {
      this.context = new AudioContext();
    } catch {
      return null;
    }
    return this.context;
  }
}
