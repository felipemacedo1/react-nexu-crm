import { useState, useEffect, useRef } from 'react';

/**
 * Throttle a value so it only updates at most once per `limit` ms.
 * Useful for scroll events, resize handlers and any high-frequency updates.
 *
 * @example
 * const throttledScroll = useThrottle(scrollY, 100);
 */
export function useThrottle<T>(value: T, limit: number = 300): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastRan = useRef<number>(Date.now());

    useEffect(() => {
        const elapsed = Date.now() - lastRan.current;
        if (elapsed >= limit) {
            setThrottledValue(value);
            lastRan.current = Date.now();
        } else {
            const timer = setTimeout(() => {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }, limit - elapsed);
            return () => clearTimeout(timer);
        }
    }, [value, limit]);

    return throttledValue;
}
