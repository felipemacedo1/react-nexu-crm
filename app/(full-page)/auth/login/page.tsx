/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useRef, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const { login } = useAuth();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const handleLogin = async () => {
        if (!email.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Informe o e-mail', life: 3000 });
            return;
        }
        if (!senha.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Informe a senha', life: 3000 });
            return;
        }

        setLoading(true);
        try {
            await login({ email, senha });
            toast.current?.show({ severity: 'success', summary: 'Bem-vindo!', detail: 'Login realizado com sucesso', life: 2000 });
            setTimeout(() => router.push('/'), 500);
        } catch (error: any) {
            const httpStatus = error?.response?.status;
            let message: string;
            let summary = 'Erro no login';

            if (httpStatus === 403) {
                summary = 'E-mail não verificado';
                message = error?.response?.data?.message || 'Verifique seu e-mail antes de fazer login.';
            } else if (httpStatus === 401) {
                message = 'E-mail ou senha incorretos';
            } else {
                message = error?.response?.data?.message || 'Erro ao realizar login. Tente novamente.';
            }

            toast.current?.show({ severity: httpStatus === 403 ? 'warn' : 'error', summary, detail: message, life: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
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
                            <div className="text-900 text-3xl font-medium mb-3">Bem-vindo ao NexoCRM</div>
                            <span className="text-600 font-medium">Faça login para continuar</span>
                        </div>

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
                                placeholder="Seu e-mail"
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                                autoFocus
                            />

                            <label htmlFor="senha" className="block text-900 font-medium text-xl mb-2">
                                Senha
                            </label>
                            <Password
                                inputId="senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Sua senha"
                                toggleMask
                                feedback={false}
                                className="w-full mb-5"
                                inputClassName="w-full p-3 md:w-30rem"
                            />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="lembrar"
                                        checked={checked}
                                        onChange={(e) => setChecked(e.checked ?? false)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="lembrar">Lembrar-me</label>
                                </div>
                                <Link
                                    href="/auth/forgot-password"
                                    className="font-medium no-underline ml-2 text-right cursor-pointer"
                                    style={{ color: 'var(--primary-color)' }}
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            <Button
                                label="Entrar"
                                className="w-full p-3 text-xl"
                                onClick={handleLogin}
                                loading={loading}
                                icon="pi pi-sign-in"
                            />

                            <div className="text-center mt-5">
                                <span className="text-600 font-medium">Não tem uma conta? </span>
                                <Link
                                    href="/auth/register"
                                    className="font-medium no-underline cursor-pointer"
                                    style={{ color: 'var(--primary-color)' }}
                                >
                                    Criar conta
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
