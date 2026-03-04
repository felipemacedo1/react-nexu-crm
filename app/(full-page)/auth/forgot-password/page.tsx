/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { validateEmail } from '@/utils/validation';
import Link from 'next/link';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const handleSubmit = async () => {
        if (!email.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Informe o e-mail', life: 3000 });
            return;
        }

        if (!validateEmail(email)) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Informe um e-mail válido', life: 3000 });
            return;
        }

        setLoading(true);
        try {
            // TODO: Integrar com endpoint de recuperação de senha do backend
            // await api.post('/auth/forgot-password', { email });
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simula chamada
            setEnviado(true);
            toast.current?.show({
                severity: 'success',
                summary: 'E-mail enviado',
                detail: 'Verifique sua caixa de entrada para redefinir a senha',
                life: 5000
            });
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao enviar e-mail de recuperação. Tente novamente.',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
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
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <i className="pi pi-lock text-primary" style={{ fontSize: '3rem' }}></i>
                            <div className="text-900 text-3xl font-medium mb-3 mt-3">Esqueceu a Senha?</div>
                            <span className="text-600 font-medium">
                                {enviado
                                    ? 'Verifique seu e-mail para redefinir a senha'
                                    : 'Informe seu e-mail para receber o link de recuperação'}
                            </span>
                        </div>

                        {!enviado ? (
                            <div>
                                <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                                    E-mail
                                </label>
                                <InputText
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Seu e-mail cadastrado"
                                    className="w-full md:w-30rem mb-5"
                                    style={{ padding: '1rem' }}
                                    autoFocus
                                />

                                <Button
                                    label="Enviar link de recuperação"
                                    className="w-full p-3 text-xl"
                                    onClick={handleSubmit}
                                    loading={loading}
                                    icon="pi pi-envelope"
                                />
                            </div>
                        ) : (
                            <div className="text-center">
                                <i className="pi pi-check-circle text-green-500 mb-3" style={{ fontSize: '4rem' }}></i>
                                <p className="text-600 mb-5">
                                    Enviamos um link de recuperação para <strong>{email}</strong>.
                                    <br />
                                    Verifique também sua pasta de spam.
                                </p>
                                <Button
                                    label="Reenviar e-mail"
                                    className="w-full p-3 text-xl mb-3"
                                    onClick={() => { setEnviado(false); handleSubmit(); }}
                                    outlined
                                    icon="pi pi-refresh"
                                />
                            </div>
                        )}

                        <div className="text-center mt-5">
                            <Link
                                href="/auth/login"
                                className="font-medium no-underline cursor-pointer"
                                style={{ color: 'var(--primary-color)' }}
                            >
                                <i className="pi pi-arrow-left mr-2"></i>
                                Voltar para o login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
