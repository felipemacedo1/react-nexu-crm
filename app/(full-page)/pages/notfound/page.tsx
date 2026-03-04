import React from 'react';
import Link from 'next/link';

const NotFoundPage = () => {
    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
            <div className="flex flex-column align-items-center justify-content-center">
                <img src="/demo/images/notfound/logo-blue.svg" alt="NexoCRM logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, rgba(33, 150, 243, 0.4) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style={{ borderRadius: '53px' }}>
                        <span className="text-blue-500 font-bold text-3xl">404</span>
                        <h1 className="text-900 font-bold text-5xl mb-2">Página não encontrada</h1>
                        <div className="text-600 mb-5">O recurso solicitado não está disponível</div>
                        <Link href="/" className="w-full flex align-items-center py-5 border-300 border-bottom-1">
                            <span className="flex justify-content-center align-items-center bg-cyan-400 border-round" style={{ height: '3.5rem', width: '3.5rem' }}>
                                <i className="text-50 pi pi-fw pi-home text-2xl"></i>
                            </span>
                            <span className="ml-4 flex flex-column">
                                <span className="text-900 lg:text-xl font-medium mb-1">Dashboard</span>
                                <span className="text-600 lg:text-lg">Voltar para a página inicial do NexoCRM</span>
                            </span>
                        </Link>
                        <Link href="/crm/leads" className="w-full flex align-items-center py-5 border-300 border-bottom-1">
                            <span className="flex justify-content-center align-items-center bg-orange-400 border-round" style={{ height: '3.5rem', width: '3.5rem' }}>
                                <i className="pi pi-fw pi-users text-50 text-2xl"></i>
                            </span>
                            <span className="ml-4 flex flex-column">
                                <span className="text-900 lg:text-xl font-medium mb-1">Leads</span>
                                <span className="text-600 lg:text-lg">Gerenciar seus leads e prospecções</span>
                            </span>
                        </Link>
                        <Link href="/crm/contas" className="w-full flex align-items-center mb-5 py-5 border-300 border-bottom-1">
                            <span className="flex justify-content-center align-items-center bg-indigo-400 border-round" style={{ height: '3.5rem', width: '3.5rem' }}>
                                <i className="pi pi-fw pi-building text-50 text-2xl"></i>
                            </span>
                            <span className="ml-4 flex flex-column">
                                <span className="text-900 lg:text-xl font-medium mb-1">Contas</span>
                                <span className="text-600 lg:text-lg">Gerenciar suas contas e empresas</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
