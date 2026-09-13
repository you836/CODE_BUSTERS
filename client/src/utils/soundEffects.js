/**
 * Web Audio API 8-Bit Retro Chiptune Sound Synthesizer
 * Produces crisp, authentic RPG sound effects with ZERO external MP3 files!
 */

class SoundEffectsEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Play a retro single frequency tone
  playTone(freq, type, duration, delay = 0, gainLevel = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(gainLevel, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // UI Button Click
  playClick() {
    this.playTone(600, 'square', 0.05, 0, 0.05);
  }

  // Quest Completed (Victory Chime)
  playQuestComplete() {
    if (!this.enabled) return;
    // Arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.12, idx * 0.08, 0.08);
    });
  }

  // Level Up Fanfare!
  playLevelUp() {
    if (!this.enabled) return;
    // Classic triumphant RPG fanfare
    const melody = [
      { f: 440.0, d: 0.12 }, // A4
      { f: 554.37, d: 0.12 }, // C#5
      { f: 659.25, d: 0.12 }, // E5
      { f: 880.0, d: 0.35 }, // A5
    ];
    let time = 0;
    melody.forEach((note) => {
      this.playTone(note.f, 'triangle', note.d, time, 0.15);
      time += note.d * 0.85;
    });
  }

  // Gold Purchase / Coin sound
  playCoin() {
    if (!this.enabled) return;
    this.playTone(987.77, 'square', 0.08, 0, 0.1); // B5
    this.playTone(1318.51, 'square', 0.2, 0.06, 0.1); // E6
  }

  // Abandon / Delete Quest
  playDecline() {
    if (!this.enabled) return;
    this.playTone(300, 'sawtooth', 0.1, 0, 0.08);
    this.playTone(200, 'sawtooth', 0.15, 0.08, 0.08);
  }
}

export const sounds = new SoundEffectsEngine();
