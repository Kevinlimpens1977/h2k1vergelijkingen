/**
 * Route guard for the Letterrekenen Intro.
 *
 * If letterIntroCompleted is false (and devMode is off),
 * redirects the user to /intro/letterrekenen.
 *
 * Usage: wrap any route that should require the letter intro to be completed.
 */

import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDevMode } from '../context/DevModeContext';
import { getChapter8Progress } from '../services/chapter8Flow';

interface Props {
    children: ReactNode;
}

export default function RequireLetterIntro({ children }: Props) {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        // Dev mode bypasses the gate
        if (devMode) {
            setAllowed(true);
            setChecked(true);
            return;
        }

        if (!profile) return;
        (async () => {
            try {
                const progress = await getChapter8Progress(profile.uid);
                if (!progress.letterIntroCompleted) {
                    navigate('/intro/letterrekenen', { replace: true });
                } else {
                    setAllowed(true);
                }
            } catch (err) {
                console.warn('Could not check letterIntro progress:', err);
                setAllowed(true); // fail-open
            } finally {
                setChecked(true);
            }
        })();
    }, [profile, navigate, devMode]);

    if (!checked) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--y-bg, #f0f4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--y-muted, #64748b)',
                fontFamily: "'Inter', system-ui, sans-serif",
            }}>
                Even checken…
            </div>
        );
    }

    if (!allowed) return null;
    return <>{children}</>;
}
