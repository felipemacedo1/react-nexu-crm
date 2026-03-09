'use client';
import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

interface LoadingSpinnerProps {
    message?: string;
    /** Se true, cobre a tela inteira com overlay semi-transparente */
    overlay?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
    sm: '2rem',
    md: '4rem',
    lg: '6rem'
};

/**
 * Spinner de carregamento reutilizável.
 *
 * @example
 * // Inline
 * {loading && <LoadingSpinner message="Carregando registros..." />}
 *
 * // Overlay de tela cheia
 * {submitting && <LoadingSpinner overlay message="Salvando..." />}
 */
export default function LoadingSpinner({
    message = 'Carregando...',
    overlay = false,
    size = 'md'
}: LoadingSpinnerProps) {
    const spinner = (
        <div className="flex flex-column align-items-center justify-content-center gap-3 py-6">
            <ProgressSpinner
                style={{ width: sizeMap[size], height: sizeMap[size] }}
                strokeWidth="4"
                animationDuration=".8s"
            />
            {message && <span className="text-500 text-sm">{message}</span>}
        </div>
    );

    if (overlay) {
        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}
            >
                <div
                    style={{
                        background: 'var(--surface-card)',
                        borderRadius: '8px',
                        padding: '2rem 3rem'
                    }}
                >
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
}
