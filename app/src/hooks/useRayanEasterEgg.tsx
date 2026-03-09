/**
 * 🎯 Rayan Easter Egg — one-time funny popup on login
 *
 * Shows a personalized message about the auto-clicker incident.
 * Uses Firestore to track whether the message has been shown.
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/* ── config ──────────────────────────────────────────── */

/** Student names who get the special popup (case-insensitive match on firstName) */
const EASTER_EGG_NAMES = ['rayan'];

/* ── hook ────────────────────────────────────────────── */

export function useRayanEasterEgg(uid: string | undefined, firstName: string | undefined) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!uid || !firstName) return;

        // Only trigger for matching names
        if (!EASTER_EGG_NAMES.includes(firstName.toLowerCase())) return;

        // Check if already shown
        (async () => {
            try {
                const ref = doc(db, 'easter_eggs', `autoclicker_${uid}`);
                const snap = await getDoc(ref);
                if (!snap.exists()) {
                    setShow(true);
                    // Mark as shown
                    await setDoc(ref, { shown: true, shownAt: new Date().toISOString() });
                }
            } catch (err) {
                console.warn('Easter egg check failed:', err);
            }
        })();
    }, [uid, firstName]);

    const dismiss = () => setShow(false);

    const EasterEggPopup = () => {
        if (!show) return null;

        return (
            <>
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 999999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(6px)',
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '20px', padding: '2rem',
                        maxWidth: '440px', textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        animation: 'eeBounce 0.5s ease-out',
                        border: '3px solid #6c5ce7',
                    }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🕵️‍♂️</div>
                        <h2 style={{
                            fontSize: '1.3rem', fontWeight: 800, color: '#6c5ce7',
                            margin: '0 0 0.8rem',
                        }}>
                            Hé {firstName}! 😏
                        </h2>
                        <p style={{
                            fontSize: '0.95rem', color: '#2d3436', lineHeight: 1.7,
                            margin: '0 0 0.5rem',
                        }}>
                            De docent heeft je <strong>'autoclicker'</strong> herkend.
                        </p>
                        <p style={{
                            fontSize: '0.92rem', color: '#636e72', lineHeight: 1.6,
                            margin: '0 0 1.2rem',
                        }}>
                            Was leuk geprobeerd, maar dat gaat niet meer werken 😉<br />
                            Bedankt voor je feedback!
                        </p>
                        <button
                            onClick={dismiss}
                            style={{
                                padding: '0.7rem 2rem', borderRadius: '12px',
                                border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
                                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                                boxShadow: '0 4px 16px rgba(108,92,231,0.3)',
                                transition: 'all 0.2s',
                            }}
                        >
                            Oké, eerlijk spelen! 🤝
                        </button>
                    </div>
                </div>
                <style>{`
                    @keyframes eeBounce {
                        0% { transform: scale(0) rotate(-10deg); opacity: 0; }
                        60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
                        100% { transform: scale(1) rotate(0); }
                    }
                `}</style>
            </>
        );
    };

    return { EasterEggPopup };
}
