/**
 * Sound Manager — Full Audio Engine
 *
 * Features:
 * - Procedurally generated Background Music (BGM) — soft ambient loop
 * - Distinct SFX: click, moveX, moveO, win, lose, draw, countdown, timeout, achievement
 * - Global mute toggle with immediate stop/resume
 * - Persistent mute state via localStorage
 */

const STORAGE_KEY = 'tictactoe-muted';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private isMuted = false;
  private bgmPlaying = false;
  private bgmInitialized = false;

  constructor() {
    // Restore persisted mute state
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') this.isMuted = true;
    }
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  // ─── Global Mute Control ────────────────────────────────

  get muted(): boolean {
    return this.isMuted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(this.isMuted));
    }

    if (this.isMuted) {
      // Stop everything immediately
      this.stopBGM();
    } else {
      // Resume BGM if it was playing
      this.resumeBGM();
    }

    return this.isMuted;
  }

  /** Legacy compat: setEnabled = !muted */
  setEnabled(enabled: boolean) {
    this.isMuted = !enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(this.isMuted));
    }
    if (this.isMuted) {
      this.stopBGM();
    }
  }

  /** Legacy compat */
  get enabled(): boolean {
    return !this.isMuted;
  }

  // ─── Background Music (BGM) ─────────────────────────────

  startBGM() {
    if (this.isMuted || this.bgmPlaying) return;
    this.bgmInitialized = true;

    try {
      const ctx = this.getContext();

      // Master BGM gain (very soft)
      this.bgmGain = ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.06, ctx.currentTime);
      this.bgmGain.connect(ctx.destination);

      // Create a gentle ambient pad with multiple detuned oscillators
      const notes = [130.81, 164.81, 196.0, 246.94]; // C3, E3, G3, B3 (Cmaj7)
      this.bgmOscillators = [];

      for (const freq of notes) {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Slow LFO for gentle movement
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15 + Math.random() * 0.1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.25, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(this.bgmGain);

        osc.start();
        this.bgmOscillators.push(osc);
      }

      // Add a very soft sub-bass
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
      subGain.gain.setValueAtTime(0.15, ctx.currentTime);
      subOsc.connect(subGain);
      subGain.connect(this.bgmGain);
      subOsc.start();
      this.bgmOscillators.push(subOsc);

      this.bgmPlaying = true;
    } catch {
      // Audio context not available
    }
  }

  stopBGM() {
    for (const osc of this.bgmOscillators) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.bgmOscillators = [];
    this.bgmPlaying = false;
  }

  resumeBGM() {
    if (this.bgmInitialized && !this.bgmPlaying && !this.isMuted) {
      this.startBGM();
    }
  }

  // ─── Sound Effects (SFX) ────────────────────────────────

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();

      // Create SFX gain node for this sound
      const sfxGain = ctx.createGain();
      sfxGain.gain.setValueAtTime(volume, ctx.currentTime);
      sfxGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      sfxGain.connect(ctx.destination);

      const oscillator = ctx.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      oscillator.connect(sfxGain);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Silently fail
    }
  }

  /** Button click sound — short, crisp tick */
  playClick() {
    this.playTone(900, 0.04, 'square', 0.08);
  }

  /** X placement — sharp percussive tap */
  playMoveX() {
    this.playTone(523, 0.08, 'sine', 0.2);
    setTimeout(() => this.playTone(659, 0.06, 'sine', 0.15), 40);
    setTimeout(() => this.playTone(784, 0.04, 'sine', 0.1), 70);
  }

  /** O placement — softer, rounder sound */
  playMoveO() {
    this.playTone(392, 0.1, 'triangle', 0.2);
    setTimeout(() => this.playTone(440, 0.07, 'triangle', 0.15), 40);
    setTimeout(() => this.playTone(494, 0.05, 'triangle', 0.1), 70);
  }

  /** Win — triumphant ascending arpeggio */
  playWin() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.3, 'sine', 0.2), i * 100);
    });
  }

  /** Lose — descending minor */
  playLose() {
    const notes = [440, 392, 349, 311];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.35, 'sawtooth', 0.12), i * 130);
    });
  }

  /** Draw — two equal tones */
  playDraw() {
    this.playTone(440, 0.25, 'triangle', 0.15);
    setTimeout(() => this.playTone(440, 0.25, 'triangle', 0.15), 250);
  }

  /** Countdown tick */
  playCountdown() {
    this.playTone(700, 0.08, 'square', 0.12);
  }

  /** Time's up */
  playTimeout() {
    this.playTone(180, 0.4, 'sawtooth', 0.15);
  }

  /** Achievement unlocked */
  playAchievement() {
    const notes = [659, 784, 988, 1319, 1568];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 'sine', 0.15), i * 80);
    });
  }

  /** Invalid action */
  playInvalid() {
    this.playTone(220, 0.12, 'square', 0.08);
  }
}

export const soundManager = new SoundManager();

/**
 * Haptic feedback (vibration) for mobile devices
 */
export function triggerHaptic(pattern: number | number[] = 10) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Not supported
  }
}
