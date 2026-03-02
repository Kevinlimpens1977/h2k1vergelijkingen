/**
 * Gate component for §8.1 practice.
 * If intro speed test not passed, redirects to /8-1/intro with a notice.
 */

import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { getIntroProgress } from '../services/introProgressService';

interface Props {
    children: ReactNode;
}

export default function RequireIntroPass({ children }: Props) {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        if (!profile) return;
        (async () => {
            try {
                const p = await getIntroProgress(profile.uid);
                if (p?.completedSpeedTest) {
                    setAllowed(true);
                } else {
                    // Redirect with a small delay to show notice
                    navigate('/8-1/intro', { replace: true });
                }
            } catch (err) {
                console.warn('Could not check intro progress:', err);
                // Allow access on error (don't block if Firestore is down)
                setAllowed(true);
            } finally {
                setChecked(true);
            }
        })();
    }, [profile, navigate]);

    if (!checked) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(145deg, #0f172a, #1e293b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontFamily: "'Inter', system-ui, sans-serif",
            }}>
                Even checken…
            </div>
        );
    }

    if (!allowed) return null;

    return <>{children}</>;
}
