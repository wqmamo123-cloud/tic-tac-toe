/**
 * Sound Manager - Web Audio API based sound effects
 * No external files needed, generates sounds programmatically
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Silently fail if audio context is not available
    }
  }

  playMoveX() {
    this.playTone(440, 0.15, 'sine', 0.2);
    setTimeout(() => this.playTone(554, 0.1, 'sine', 0.15), 50);
  }

  playMoveO() {
    this.playTone(330, 0.15, 'triangle', 0.2);
    setTimeout(() => this.playTone(392, 0.1, 'triangle', 0.15), 50);
  }

  playWin() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.3, 'sine', 0.25), i * 120);
    });
  }

  playLose() {
    const notes = [400, 350, 300, 250];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.3, 'sawtooth', 0.15), i * 150);
    });
  }

  playDraw() {
    this.playTone(440, 0.3, 'triangle', 0.2);
    setTimeout(() => this.playTone(440, 0.3, 'triangle', 0.2), 200);
  }

  playClick() {
    this.playTone(800, 0.05, 'square', 0.1);
  }

  playInvalid() {
    this.playTone(200, 0.15, 'square', 0.1);
  }

  playCountdown() {
    this.playTone(600, 0.1, 'square', 0.15);
  }

  playTimeout() {
    this.playTone(150, 0.4, 'sawtooth', 0.2);
  }

  playAchievement() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.25, 'sine', 0.2), i * 100);
    });
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
