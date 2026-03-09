/**
 * 🛡️ Auto-Clicker Guard — detects inhuman click speeds
 *
 * Usage:
 *   const { registerClick, isBlocked, AutoClickerOverlay } = useAutoClickerGuard();
 *   // call registerClick() on every answer click
 *   // render <AutoClickerOverlay /> in your component
 *   // check isBlocked before processing clicks
 *
 * Detection: If >= THRESHOLD_CLICKS happen within WINDOW_MS, it's flagged.
 * Typical humans need 300-500ms minimum between MC answers (read + click).
 * Auto-clickers fire at 50-150ms intervals.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/* ── config ──────────────────────────────────────────── */

/** clicks within this window to trigger detection */
const WINDOW_MS = 2000;
/** minimum clicks within the window to flag */
const THRESHOLD_CLICKS = 8;
/** cooldown before the user can continue after getting caught */
const BLOCK_DURATION_MS = 8000;
/** minimum interval between clicks to be considered human (ms) */
const MIN_HUMAN_INTERVAL_MS = 180;

/* ── hook ────────────────────────────────────────────── */

export function useAutoClickerGuard() {
    const clickTimestamps = useRef<number[]>([]);
    const suspiciousCount = useRef(0);
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

    /* ── register click ──────────────────────────────── */
    const registerClick = useCallback((): boolean => {
        const now = Date.now();
        const stamps = clickTimestamps.current;

        // Add current timestamp
        stamps.push(now);

        // Remove timestamps older than the window
        while (stamps.length > 0 && stamps[0] < now - WINDOW_MS) {
            stamps.shift();
        }

        // Check 1: Too many clicks in the window
        if (stamps.length >= THRESHOLD_CLICKS) {
            suspiciousCount.current++;
            setDetectionCount((c) => c + 1);
            setIsBlocked(true);
            setFlashActive(true);
            clickTimestamps.current = [];
            return false; // blocked
        }

        // Check 2: Interval between last two clicks is inhuman
        if (stamps.length >= 2) {
            const lastInterval = stamps[stamps.length - 1] - stamps[stamps.length - 2];
            if (lastInterval < MIN_HUMAN_INTERVAL_MS) {
                suspiciousCount.current++;
                // Only trigger full block after 3 rapid-fire detections
                if (suspiciousCount.current >= 3) {
                    setDetectionCount((c) => c + 1);
                    setIsBlocked(true);
                    setFlashActive(true);
                    clickTimestamps.current = [];
                    suspiciousCount.current = 0;
                    return false;
                }
            }
        }

        return true; // allowed
    }, []);

    /* ── reset ───────────────────────────────────────── */
    const reset = useCallback(() => {
        clickTimestamps.current = [];
        suspiciousCount.current = 0;
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
                `}</style>
            </>
        );
    }, [isBlocked, blockTimeLeft, detectionCount]);

    return { registerClick, isBlocked, reset, detectionCount, AutoClickerOverlay };
}
