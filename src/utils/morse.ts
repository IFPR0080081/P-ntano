export const MORSE_ALPHABET: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
};

export function formatMorseDisplay(code: string): string {
  return code
    .replace(/\./g, '·')
    .replace(/-/g, '—')
    .split('')
    .join(' ');
}

export function encodeWordToMorse(word: string): string[] {
  return word
    .toUpperCase()
    .split('')
    .map((ch) => MORSE_ALPHABET[ch] ?? '');
}

let activeAudioCtx: AudioContext | null = null;
let activeTimerIds: number[] = [];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!activeAudioCtx || activeAudioCtx.state === 'closed') {
    activeAudioCtx = new AudioCtx();
  }
  if (activeAudioCtx.state === 'suspended') {
    activeAudioCtx.resume().catch(() => {});
  }
  return activeAudioCtx;
}

export function stopAllAudio(): void {
  activeTimerIds.forEach((id) => window.clearTimeout(id));
  activeTimerIds = [];
}

function playBeep(startTimeOffsetSec: number, durationSec: number, freq = 620, volume = 0.08): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const start = ctx.currentTime + startTimeOffsetSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.setValueAtTime(volume, start + Math.max(0.015, durationSec - 0.015));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + durationSec + 0.02);
}

export function playMorseWord(
  word: string,
  muted: boolean,
  onLetterIndex?: (index: number | null) => void
): number {
  stopAllAudio();
  const codes = encodeWordToMorse(word);
  const dotSec = 0.085;
  const dashSec = 0.255;
  const symbolGapSec = 0.075;
  const letterGapSec = 0.24;

  let cursorSec = 0.04;

  codes.forEach((code, letterIdx) => {
    const startMs = cursorSec * 1000;
    const tStart = window.setTimeout(() => {
      onLetterIndex?.(letterIdx);
    }, startMs);
    activeTimerIds.push(tStart);

    for (let i = 0; i < code.length; i++) {
      const symbol = code[i];
      const dur = symbol === '-' ? dashSec : dotSec;
      if (!muted) {
        playBeep(cursorSec, dur, 620, 0.075);
      }
      cursorSec += dur + symbolGapSec;
    }

    cursorSec += letterGapSec;
  });

  const endMs = cursorSec * 1000;
  const tEnd = window.setTimeout(() => {
    onLetterIndex?.(null);
  }, endMs);
  activeTimerIds.push(tEnd);

  return endMs;
}

export function playMorseLetter(code: string, muted: boolean): void {
  if (muted) return;
  const dotSec = 0.085;
  const dashSec = 0.255;
  const symbolGapSec = 0.075;
  let cursorSec = 0.02;

  for (let i = 0; i < code.length; i++) {
    const dur = code[i] === '-' ? dashSec : dotSec;
    playBeep(cursorSec, dur, 640, 0.07);
    cursorSec += dur + symbolGapSec;
  }
}

export function playUiFeedback(type: 'click' | 'success' | 'error' | 'ending_good' | 'ending_cold' | 'ending_lost', muted: boolean): void {
  if (muted) return;

  if (type === 'click') {
    playBeep(0, 0.045, 520, 0.04);
  } else if (type === 'success') {
    playBeep(0, 0.08, 523.25, 0.06);
    playBeep(0.09, 0.14, 659.25, 0.06);
  } else if (type === 'error') {
    playBeep(0, 0.09, 280, 0.06);
    playBeep(0.1, 0.12, 220, 0.06);
  } else if (type === 'ending_good') {
    playBeep(0, 0.11, 523.25, 0.06);
    playBeep(0.12, 0.11, 659.25, 0.06);
    playBeep(0.24, 0.24, 783.99, 0.07);
  } else if (type === 'ending_cold') {
    playBeep(0, 0.14, 440, 0.05);
    playBeep(0.16, 0.22, 392, 0.05);
  } else if (type === 'ending_lost') {
    playBeep(0, 0.15, 349.23, 0.055);
    playBeep(0.16, 0.15, 311.13, 0.055);
    playBeep(0.32, 0.28, 261.63, 0.055);
  }
}

export type ArtworkSoundKind =
  | 'cat'
  | 'frog'
  | 'water'
  | 'lantern'
  | 'fire'
  | 'mist'
  | 'porridge';

export function playArtworkSound(kind: ArtworkSoundKind, muted: boolean): void {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (kind === 'cat') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.28);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  } else if (kind === 'frog') {
    [0, 0.14].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 0 ? 175 : 210, now + offset);
      osc.frequency.exponentialRampToValueAtTime(i === 0 ? 250 : 290, now + offset + 0.08);
      gain.gain.setValueAtTime(0.001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.07, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.11);
    });
  } else if (kind === 'water') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.11);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (kind === 'lantern' || kind === 'fire') {
    playBeep(0, 0.09, 698.46, 0.045);
    playBeep(0.08, 0.15, 880, 0.045);
  } else if (kind === 'porridge') {
    playBeep(0, 0.08, 523.25, 0.05);
    playBeep(0.08, 0.08, 659.25, 0.05);
    playBeep(0.16, 0.16, 783.99, 0.05);
  } else if (kind === 'mist') {
    playBeep(0, 0.22, 311.13, 0.04);
    playBeep(0.14, 0.26, 277.18, 0.035);
  }
}
