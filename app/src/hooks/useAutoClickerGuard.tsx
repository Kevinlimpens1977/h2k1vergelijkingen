/**
 * 🛡️ Auto-Clicker Guard v2 — multi-layered bot detection
 *
 * Usage:
 *   const { registerClick, isBlocked, AutoClickerOverlay } = useAutoClickerGuard();
 *   // call registerClick() on every answer click
 *   // render <AutoClickerOverlay /> in your component
 *   // check isBlocked before processing clicks
 *
 * Detection layers:
 *   1. Volume:     >= 5 clicks within 3s → instant block
 *   2. Speed:      interval < 250ms → adds suspicion
 *   3. Regularity: std-dev of recent intervals < 35ms → bot-like timing
 *   4. Cumulative: suspicion score accumulates with slow decay;
 *                  block triggers at score >= 5
 *
 * Typical humans need 400-800ms between MC answers (read + decide + click).
 * Auto-clickers fire at 50-500ms intervals with near-zero variance.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/* ── config ──────────────────────────────────────────── */

/** Sliding window for volume check */
const WINDOW_MS = 2000;
/** Clicks within the window to trigger instant block */
const THRESHOLD_CLICKS = 5;
/** Cooldown before user can continue after getting caught */
const BLOCK_DURATION_MS = 10000;
/** Minimum interval between clicks to be considered human (ms) */
const MIN_HUMAN_INTERVAL_MS = 250;
/** Number of recent intervals to evaluate for regularity */
const REGULARITY_SAMPLE_SIZE = 4;
/** Max standard deviation (ms) of intervals to flag as bot-like */
const MAX_BOT_STDDEV_MS = 35;
/** Suspicion score threshold to trigger a block */
const SUSPICION_BLOCK_THRESHOLD = 5;
/** Points added per fast-click detection */
const SUSPICION_FAST_CLICK = 2;
/** Points added per regularity (bot-timing) detection */
const SUSPICION_REGULARITY = 3;
/** Points added per volume-burst detection */
const SUSPICION_VOLUME = 4;
/** Suspicion decays by 1 point every N ms */
const SUSPICION_DECAY_INTERVAL_MS = 3000;

/* ── helpers ─────────────────────────────────────────── */

function stddev(values: number[]): number {
    if (values.length < 2) return Infinity;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sqDiffs = values.map((v) => (v - mean) ** 2);
    return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/* ── hook ────────────────────────────────────────────── */

export function useAutoClickerGuard() {
    const clickTimestamps = useRef<number[]>([]);
    const suspicionScore = useRef(0);
    const lastDecayTime = useRef(Date.now());
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockTimeLeft, setBlockTimeLeft] = useState(0);
    const [flashActive, setFlashActive] = useState(false);
    const [detectionCount, setDetectionCount] = useState(0);

    /* ── block countdown ─────────────────────────────── */
    useEffect(() => {
        if (!isBlocked) return;
        const start = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, BLOCK_DURATION_MS - elapsed);
            setBlockTimeLeft(remaining);
            if (remaining <= 0) {
                setIsBlocked(false);
                setFlashActive(false);
                clearInterval(timer);
            }
        }, 100);
        return () => clearInterval(timer);
    }, [isBlocked]);

    /* ── flash effect ────────────────────────────────── */
    useEffect(() => {
        if (!flashActive) return;
        let frame = 0;
        const timer = setInterval(() => {
            frame++;
            if (frame > 12) {
                clearInterval(timer);
            }
        }, 200);
        return () => clearInterval(timer);
    }, [flashActive]);

    /* ── trigger block ───────────────────────────────── */
    const triggerBlock = useCallback(() => {
        setDetectionCount((c) => c + 1);
        setIsBlocked(true);
        setFlashActive(true);
        clickTimestamps.current = [];
        // Don't reset suspicion — it persists across blocks to
        // catch repeat offenders faster
    }, []);

    /* ── register click ──────────────────────────────── */
    const registerClick = useCallback((): boolean => {
        if (isBlocked) return false;

        const now = Date.now();
        const stamps = clickTimestamps.current;

        // ── Decay suspicion over time ──
        const timeSinceDecay = now - lastDecayTime.current;
        if (timeSinceDecay >= SUSPICION_DECAY_INTERVAL_MS) {
            const decayPoints = Math.floor(timeSinceDecay / SUSPICION_DECAY_INTERVAL_MS);
            suspicionScore.current = Math.max(0, suspicionScore.current - decayPoints);
            lastDecayTime.current = now;
        }

        // Add current timestamp
        stamps.push(now);

        // Keep only timestamps within the larger analysis window (10s for regularity)
        const analysisWindow = Math.max(WINDOW_MS, 10000);
        while (stamps.length > 0 && stamps[0] < now - analysisWindow) {
            stamps.shift();
        }

        // ── Layer 1: Volume — too many clicks in short window ──
        const recentStamps = stamps.filter((t) => t >= now - WINDOW_MS);
        if (recentStamps.length >= THRESHOLD_CLICKS) {
            suspicionScore.current += SUSPICION_VOLUME;
            triggerBlock();
            return false;
        }

        // ── Layer 2: Speed — interval between last two clicks is inhuman ──
        if (stamps.length >= 2) {
            const lastInterval = stamps[stamps.length - 1] - stamps[stamps.length - 2];
            if (lastInterval < MIN_HUMAN_INTERVAL_MS) {
                suspicionScore.current += SUSPICION_FAST_CLICK;
            }
        }

        // ── Layer 3: Regularity — bot-like consistent timing ──
        if (stamps.length >= REGULARITY_SAMPLE_SIZE + 1) {
            const recentIntervals: number[] = [];
            for (let i = stamps.length - REGULARITY_SAMPLE_SIZE; i < stamps.length; i++) {
                recentIntervals.push(stamps[i] - stamps[i - 1]);
            }
            const sd = stddev(recentIntervals);
            const avgInterval = recentIntervals.reduce((a, b) => a + b, 0) / recentIntervals.length;

            // Bot-like: very regular timing AND reasonably fast
            if (sd < MAX_BOT_STDDEV_MS && avgInterval < 800) {
                suspicionScore.current += SUSPICION_REGULARITY;
            }
        }

        // ── Check cumulative suspicion score ──
        if (suspicionScore.current >= SUSPICION_BLOCK_THRESHOLD) {
            triggerBlock();
            return false;
        }

        return true; // allowed
    }, [isBlocked, triggerBlock]);

    /* ── reset ───────────────────────────────────────── */
    const reset = useCallback(() => {
        clickTimestamps.current = [];
        suspicionScore.current = 0;
        lastDecayTime.current = Date.now();
        setIsBlocked(false);
        setFlashActive(false);
    }, []);

    /* ── overlay component ───────────────────────────── */
    const AutoClickerOverlay = useCallback(() => {
        if (!isBlocked) return null;

        const secondsLeft = Math.ceil(blockTimeLeft / 1000);

        return (
            <>
                {/* Flashing red overlay */}
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 999998,
                    animation: 'acFlash 0.4s ease-in-out infinite alternate',
                    pointerEvents: 'none',
                }} />

                {/* Warning modal */}
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 999999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '20px', padding: '2rem',
                        maxWidth: '420px', textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        animation: 'acBounce 0.4s ease-out',
                        border: '3px solid #e74c3c',
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🚨</div>
                        <h2 style={{
                            fontSize: '1.4rem', fontWeight: 800, color: '#e74c3c',
                            margin: '0 0 0.5rem',
                        }}>
                            Auto-Clicker Gedetecteerd!
                        </h2>
                        <p style={{
                            fontSize: '0.95rem', color: '#636e72', lineHeight: 1.6,
                            margin: '0 0 1rem',
                        }}>
                            Dit is valsspelen 😉 Sluit je autoclicker en start opnieuw!
                        </p>
                        {detectionCount > 1 && (
                            <p style={{
                                fontSize: '0.78rem', color: '#e74c3c', fontWeight: 700,
                                margin: '0 0 1rem',
                            }}>
                                ⚠️ Al {detectionCount}x gedetecteerd. Het gaat écht niet werken...
                            </p>
                        )}
                        <div style={{
                            display: 'inline-block',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '12px',
                            background: '#e74c3c',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                        }}>
                            ⏳ Wacht {secondsLeft}s...
                        </div>
                    </div>
                </div>

                {/* Keyframe animations */}
                <style>{`
                    @keyframes acFlash {
                        from { background: rgba(231, 76, 60, 0.15); }
                        to { background: rgba(231, 76, 60, 0.35); }
                    }
                    @keyframes acBounce {
                        0% { transform: scale(0.3); opacity: 0; }
                        60% { transform: scale(1.05); opacity: 1; }
                        100% { transform: scale(1); }
                    }
                `}
                </style>
            </>
        );
    }, [isBlocked, blockTimeLeft, detectionCount]);

    return { registerClick, isBlocked, reset, detectionCount, AutoClickerOverlay };
}
