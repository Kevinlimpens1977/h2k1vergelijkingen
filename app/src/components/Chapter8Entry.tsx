/**
 * Chapter 8 entry point — redirects to the first incomplete step.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getChapter8Progress, getNextRequiredRoute } from '../services/chapter8Flow';

export default function Chapter8Entry() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!profile) return;
        (async () => {
            try {
                const progress = await getChapter8Progress(profile.uid);
                const route = getNextRequiredRoute(progress);
                navigate(route, { replace: true });
            } catch {
                navigate('/8-1/intro', { replace: true });
            }
        })();
    }, [profile, navigate]);

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
            Laden…
        </div>
    );
}
