'use client';
import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
    /** Full dataset — all items, no slicing needed */
    items: T[];
    /** Height of each row in pixels (default 56) */
    estimateSize?: number;
    /** Total height of the scroll container in pixels (default 480) */
    height?: number;
    /** Render function for each row */
    renderItem: (item: T, index: number) => React.ReactNode;
    /** Optional className on the outer scroll container */
    className?: string;
    /** Shown when items is empty */
    emptyMessage?: string;
}

/**
 * VirtualList — renders only visible rows for large datasets.
 * Uses @tanstack/react-virtual under the hood.
 *
 * @example
 * <VirtualList
 *   items={leads}                          // 10 000+ items, no problem
 *   estimateSize={64}
 *   height={600}
 *   renderItem={(lead) => <LeadRow lead={lead} />}
 * />
 */
export default function VirtualList<T>({
    items,
    estimateSize = 56,
    height = 480,
    renderItem,
    className,
    emptyMessage = 'Nenhum item encontrado.',
}: VirtualListProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateSize,
        overscan: 8,
    });

    if (items.length === 0) {
        return (
            <div
                className={`flex align-items-center justify-content-center text-color-secondary ${className ?? ''}`}
                style={{ height }}
            >
                <i className="pi pi-inbox mr-2 text-xl" aria-hidden="true" />
                {emptyMessage}
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            className={className}
            style={{ height, overflowY: 'auto' }}
            role="list"
            aria-label="Lista virtualizada"
        >
            {/* Total spacer so the scroll bar is correct */}
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                {virtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                        key={virtualRow.index}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                        role="listitem"
                    >
                        {renderItem(items[virtualRow.index], virtualRow.index)}
                    </div>
                ))}
            </div>
        </div>
    );
}
