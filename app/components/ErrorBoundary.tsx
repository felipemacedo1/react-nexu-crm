'use client';
import React, { Component, ReactNode } from 'react';
import { Button } from 'primereact/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary global para capturar erros de renderização React.
 * Envolva seções da aplicação para exibir uma UI amigável ao invés de uma tela branca.
 *
 * @example
 * <ErrorBoundary>
 *   <MinhaPage />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary] Erro capturado:', error, info);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-column align-items-center justify-content-center py-8 px-4 text-center">
                    <i className="pi pi-exclamation-circle text-5xl text-red-400 mb-4" />
                    <h3 className="text-xl font-semibold text-700 mb-2">Algo deu errado</h3>
                    <p className="text-500 mb-2 max-w-30rem">
                        Ocorreu um erro inesperado nesta seção. Tente recarregar a página ou voltar ao início.
                    </p>
                    {this.state.error && (
                        <code className="text-xs text-400 bg-gray-100 px-3 py-2 border-round mb-4 max-w-30rem block overflow-hidden text-overflow-ellipsis">
                            {this.state.error.message}
                        </code>
                    )}
                    <div className="flex gap-2">
                        <Button
                            label="Tentar novamente"
                            icon="pi pi-refresh"
                            onClick={this.handleReset}
                            className="p-button-outlined"
                        />
                        <Button
                            label="Voltar ao início"
                            icon="pi pi-home"
                            onClick={() => (window.location.href = '/')}
                        />
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
