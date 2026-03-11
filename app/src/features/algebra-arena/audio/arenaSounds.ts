/**
 * Arena Sounds — Procedural Web Audio API SFX
 *
 * No audio files. 7 synthesized sounds.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch {
            return null;
        }
    }
    return audioCtx;
}

function tone(freq: number, duration: number, type: OscillatorType = 'triangle', gain = 0.15) {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

function noise(duration: number, hpFreq = 2000, gain = 0.08) {
    const ctx = getCtx();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hpFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start();
}

export type SFXType = 'slash' | 'critical' | 'monster_hit' | 'defeat' | 'combo' | 'victory' | 'boss_roar';

let _muted = false;

export function setMuted(m: boolean) { _muted = m; }
export function isMuted(): boolean { return _muted; }

export function playSFX(sfx: SFXType) {
    if (_muted) return;
    switch (sfx) {
        case 'slash':
            noise(0.1, 2000, 0.1);
            tone(800, 0.08, 'square', 0.06);
            break;
        case 'critical':
            noise(0.12, 2500, 0.12);
            tone(1000, 0.1, 'square', 0.08);
            tone(1200, 0.08, 'sawtooth', 0.05);
            break;
        case 'monster_hit':
            tone(80, 0.15, 'sine', 0.2);
            break;
        case 'defeat':
            tone(400, 0.1, 'triangle', 0.1);
            tone(300, 0.1, 'triangle', 0.08);
            setTimeout(() => tone(200, 0.2, 'triangle', 0.06), 100);
            break;
        case 'combo':
            [440, 554, 659].forEach((f, i) => {
                setTimeout(() => tone(f, 0.1, 'triangle', 0.12), i * 80);
            });
            break;
        case 'victory':
            [523, 659, 784, 880, 1047].forEach((f, i) => {
                setTimeout(() => tone(f, 0.2, 'triangle', 0.1), i * 120);
            });
            break;
        case 'boss_roar':
            tone(80, 0.5, 'sawtooth', 0.15);
            setTimeout(() => tone(60, 0.4, 'sawtooth', 0.1), 100);
            break;
    }
}
