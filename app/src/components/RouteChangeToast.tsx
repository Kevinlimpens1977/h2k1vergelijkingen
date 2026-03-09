import { useState, useEffect } from 'react';
import './RouteChangeToast.css';

interface RouteChangeToastProps {
    message: string;
    visible: boolean;
    onDone: () => void;
}

/**
 * Non-blocking slide-in toast for route changes.
 * Shows for 3.5 seconds, then auto-hides.
 */
export default function RouteChangeToast({ message, visible, onDone }: RouteChangeToastProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (visible && message) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onDone, 400); // wait for slide-out animation
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [visible, message, onDone]);

    if (!visible && !show) return null;

    return (
        <div className={`route-toast ${show ? 'route-toast--visible' : 'route-toast--hidden'}`}>
            <div className="route-toast__content">
                <span className="route-toast__message">{message}</span>
            </div>
        </div>
    );
}
