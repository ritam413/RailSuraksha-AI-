// src/lib/audioAlerts.ts
// Web Audio API Synthesizer for RDSO SPN 196 Standard Locomotive Cab Alarms & Station Chimes

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;
const muteListeners = new Set<(muted: boolean) => void>();

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioMuted(): boolean {
  return isMuted;
}

export function toggleAudioMute(forcedValue?: boolean): boolean {
  isMuted = forcedValue !== undefined ? forcedValue : !isMuted;
  muteListeners.forEach((listener) => listener(isMuted));
  return isMuted;
}

export function subscribeAudioMute(callback: (muted: boolean) => void): () => void {
  muteListeners.add(callback);
  return () => muteListeners.delete(callback);
}

/**
 * RDSO Standard Emergency Cab Alarm (Dual frequency 800Hz / 1200Hz pulsing alert)
 */
export function playCabEmergencyAlarm(durationSeconds: number = 1.2): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Modulate between 800Hz and 1200Hz
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
    osc.frequency.setValueAtTime(800, now + 0.3);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.45);
    osc.frequency.setValueAtTime(800, now + 0.6);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.75);

    // Envelope
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSeconds);
  } catch (err) {
    console.warn('Audio alert playback suppressed:', err);
  }
}

/**
 * Platform Hold & Bottleneck Warning Chime (Two-tone railway chime)
 */
export function playPlatformHoldChime(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.2); // A5
    gain2.gain.setValueAtTime(0.06, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn('Audio alert playback suppressed:', err);
  }
}

/**
 * Action Approval & Dispatch Confirmation Sound (Ascending gentle confirmation)
 */
export function playActionConfirmedChime(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (err) {
    console.warn('Audio confirmation playback suppressed:', err);
  }
}
