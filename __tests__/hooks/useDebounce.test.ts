import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('returns initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('inicial', 300));
        expect(result.current).toBe('inicial');
    });

    it('debounces the value after delay', () => {
        const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
            initialProps: { val: 'a' },
        });
        rerender({ val: 'abc' });
        expect(result.current).toBe('a');
        act(() => { jest.advanceTimersByTime(300); });
        expect(result.current).toBe('abc');
    });

    it('only applies the last value when updated quickly', () => {
        const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
            initialProps: { val: 'a' },
        });
        rerender({ val: 'b' });
        rerender({ val: 'c' });
        act(() => { jest.advanceTimersByTime(300); });
        expect(result.current).toBe('c');
    });
});
