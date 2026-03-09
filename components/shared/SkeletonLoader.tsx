'use client';
import React from 'react';
import { Skeleton } from 'primereact/skeleton';

interface SkeletonTableProps {
    rows?: number;
    cols?: number;
}

interface SkeletonCardProps {
    count?: number;
    cols?: number;
}

/** Skeleton para DataTable */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, cols = 5 }) => (
    <div>
        {/* Header */}
        <div className="flex gap-2 mb-3">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} height="2rem" className="flex-1" borderRadius="4px" />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-2 mb-2">
                {Array.from({ length: cols }).map((_, c) => (
                    <Skeleton key={c} height="1.75rem" className="flex-1" borderRadius="4px" />
                ))}
            </div>
        ))}
    </div>
);

/** Skeleton para Cards em grid */
export const SkeletonCards: React.FC<SkeletonCardProps> = ({ count = 6, cols = 3 }) => {
    const colClass = cols === 2 ? 'col-12 md:col-6' : cols === 4 ? 'col-12 md:col-6 lg:col-3' : 'col-12 md:col-6 lg:col-4';
    return (
        <div className="grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={colClass}>
                    <div className="surface-card border-round border-1 surface-border p-3">
                        <div className="flex align-items-center gap-2 mb-3">
                            <Skeleton shape="circle" size="2.5rem" />
                            <div className="flex-1">
                                <Skeleton height="1rem" className="mb-1" />
                                <Skeleton height="0.75rem" width="60%" />
                            </div>
                        </div>
                        <Skeleton height="0.75rem" className="mb-2" />
                        <Skeleton height="0.75rem" width="80%" className="mb-2" />
                        <Skeleton height="0.75rem" width="50%" />
                    </div>
                </div>
            ))}
        </div>
    );
};

/** Skeleton para formulário */
export const SkeletonForm: React.FC<{ fields?: number }> = ({ fields = 6 }) => (
    <div className="grid formgrid">
        {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="field col-12 md:col-6">
                <Skeleton height="0.75rem" width="40%" className="mb-2" borderRadius="4px" />
                <Skeleton height="2.5rem" borderRadius="6px" />
            </div>
        ))}
    </div>
);

/** Skeleton para KPI cards no dashboard */
export const SkeletonKPI: React.FC<{ count?: number }> = ({ count = 4 }) => (
    <div className="grid">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="col-12 md:col-6 xl:col-3">
                <div className="surface-card shadow-1 border-round p-3 flex flex-column gap-2">
                    <div className="flex justify-content-between align-items-center">
                        <Skeleton height="0.875rem" width="50%" />
                        <Skeleton shape="circle" size="2.5rem" />
                    </div>
                    <Skeleton height="2rem" width="60%" />
                    <Skeleton height="0.75rem" width="40%" />
                </div>
            </div>
        ))}
    </div>
);
