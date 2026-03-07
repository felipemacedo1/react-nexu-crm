/* eslint-disable @next/next/no-img-element */
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { classNames } from 'primereact/utils';
import { AuthService } from '@/services/auth.service';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'expired' | 'invalid' | 'error';

const VerificarEmailPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { layoutConfig } = useContext(LayoutContext);
    const toast = useRef<Toast>(null);

    const [status, setStatus] = useState<Status>('loading');
    const [message, setMessage] = useState('');
    const [emailReenvio, setEmailReenvio] = useState('');
    const [reenviando, setReenviando] = useState(false);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('invalid');
            setMessage('Token de verificação não encontrado.');
            return;
        }

        AuthService.verificarEmail(token)
            .then((res) => {
                if (res.sucesso) {
                    setStatus('success');
                    setMessage(res.message);
                } else {
                    setStatus('invalid');
                    setMessage(res.message);
                }
            })
            .catch((err) => {
                const httpStatus = err?.response?.status;
                const msg = err?.response?.data?.message || 'Erro ao verificar e-mail.';

                if (httpStatus === 410) {
                    setStatus('expired');
                    setMessage(msg);
                } else if (httpStatus === 400) {
                    setStatus('invalid');
                    setMessage(msg);
                } else {
                    setStatus('error');
                    setMessage(msg);
                }
            });
    }, [searchParams]);

    const handleReenviar = async () => {
        if (!emailReenvio.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Informe seu e-mail', life: 3000 });
            return;
        }
        setReenviando(true);
        try {
            const res = await AuthService.reenviarVerificacao(emailReenvio);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: res.message, life: 5000 });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível reenviar o e-mail.', life: 5000 });
        } finally {
            setReenviando(false);
        }
    };

    const renderIcon = () => {
        switch (status) {
            case 'loading':
                return <ProgressSpinner style={{ width: '60px', height: '60px' }} />;
            case 'success':
                return <i className="pi pi-check-circle text-green-500 mb-4" style={{ fontSize: '5rem' }}></i>;
            case 'expired':
                return <i className="pi pi-clock text-orange-500 mb-4" style={{ fontSize: '5rem' }}></i>;
            case 'invalid':
            case 'error':
                return <i className="pi pi-times-circle text-red-500 mb-4" style={{ fontSize: '5rem' }}></i>;
        }
    };

    const renderTitle = () => {
        switch (status) {
            case 'loading':
                return 'Verificando seu e-mail...';
            case 'success':
                return 'E-mail verificado! ✅';
            case 'expired':
                return 'Link expirado ⏰';
            case 'invalid':
                return 'Token inválido ❌';
            case 'error':
                return 'Erro na verificação';
        }
    };

    const gradientColor = () => {
        switch (status) {
            case 'success':
                return 'var(--green-500)';
            case 'expired':
                return 'var(--orange-500)';
            case 'invalid':
            case 'error':
                return 'var(--red-500)';
            default:
                return 'var(--primary-color)';
        }
    };

    return (
        <div className={containerClassName}>
            <Toast ref={toast} />
            <div className="flex flex-column align-items-center justify-content-center">
                <img
                    src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`}
                    alt="NexoCRM logo"
                    className="mb-5 w-6rem flex-shrink-0"
                />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: `linear-gradient(180deg, ${gradientColor()} 10%, rgba(33, 150, 243, 0) 30%)`
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px', minWidth: '400px' }}>
                        <div className="text-center">
                            {renderIcon()}

                            <div className="text-900 text-3xl font-medium mb-3">{renderTitle()}</div>

                            <p className="text-600 font-medium mb-5" style={{ lineHeight: '1.6' }}>
                                {message}
                            </p>

                            {status === 'success' && (
                                <Button
                                    label="Fazer Login"
                                    className="w-full p-3 text-xl"
                                    icon="pi pi-sign-in"
                                    onClick={() => router.push('/auth/login')}
                                />
                            )}

                            {(status === 'expired' || status === 'error') && (
                                <div className="flex flex-column gap-3">
                                    <label className="block text-900 font-medium text-left">
                                        Informe seu e-mail para reenviar o link:
                                    </label>
                                    <InputText
                                        value={emailReenvio}
                                        onChange={(e) => setEmailReenvio(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full"
                                        style={{ padding: '1rem' }}
                                    />
                                    <Button
                                        label="Reenviar link de verificação"
                                        className="w-full p-3"
                                        icon="pi pi-envelope"
                                        onClick={handleReenviar}
                                        loading={reenviando}
                                        severity="warning"
                                    />
                                    <div className="mt-2">
                                        <Link
                                            href="/auth/login"
                                            className="text-primary font-medium no-underline cursor-pointer"
                                        >
                                            Voltar ao Login
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {status === 'invalid' && (
                                <div className="flex flex-column gap-3 mt-3">
                                    <Button
                                        label="Ir para o Login"
                                        className="w-full p-3"
                                        icon="pi pi-sign-in"
                                        onClick={() => router.push('/auth/login')}
                                        outlined
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificarEmailPage;
