/**
 * 🍎 Fruit Challenge — Standalone page
 * Route: /fruit-challenge
 * Gate: requires §8.2 completed
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDevMode } from '../context/DevModeContext';
import FruitChallenge from '../components/FruitChallenge';
import { markFruitChallengeCompleted } from '../services/chapter8Flow';

export default function FruitChallengePage() {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();

    if (!profile) return null;

    const handleComplete = async () => {
        try {
            await markFruitChallengeCompleted(profile.uid);
        } catch (err) {
            console.warn('Failed to mark fruit challenge completed', err);
        }
    };

    return (
        <div className="y-page" style={{ minHeight: '100vh' }}>
            <header className="y-topbar">
                <div className="y-topbar-logo">
                    <span className="y-topbar-logo-icon">🍎</span>
                    <span>Fruit Challenge</span>
                </div>
                <div className="y-topbar-user" style={{ gap: '0.5rem' }}>
                    {devMode && (
                        <span style={{
                            fontSize: '0.65rem', fontWeight: 800,
                            padding: '0.15rem 0.5rem', borderRadius: '6px',
                            background: 'linear-gradient(135deg, #e17055, #d63031)',
                            color: '#fff',
                        }}>DEV</span>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none', border: '1px solid var(--y-outline)',
                            borderRadius: '8px', padding: '0.25rem 0.6rem',
                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            color: 'var(--y-muted)',
                        }}
                    >
                        ✕ Stop
                    </button>
                </div>
            </header>

            <div className="y-main" style={{ paddingBottom: '1rem' }}>
                <FruitChallenge
                    profile={profile}
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}
