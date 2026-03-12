import { useRef, useCallback } from 'react';

/**
 * Returns a throttled wrapper for any async function.
 * Prevents the wrapped fn from being called more than once per `minInterval` ms.
 * Any call that arrives before the interval elapses is silently dropped.
 *
 * This is the frontend's lightweight "rate limiter" for expensive API calls
 * (e.g. search-as-you-type, auto-save, bulk operations).
 *
 * @example
 * const rateLimitedSave = useRateLimit(saveData, 2000);
 * <Button onClick={() => rateLimitedSave(payload)} />
 */
export function useRateLimit<T extends (...args: Parameters<T>) => Promise<unknown>>(
    fn: T,
    minInterval: number = 1000
): (...args: Parameters<T>) => void {
    const lastCalledAt = useRef<number>(0);
    const inFlight = useRef<boolean>(false);

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            if (inFlight.current || now - lastCalledAt.current < minInterval) return;
            lastCalledAt.current = now;
            inFlight.current = true;
            fn(...args).finally(() => {
                inFlight.current = false;
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [fn, minInterval]
    );
}
