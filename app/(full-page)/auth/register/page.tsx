/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/validation';
import Link from 'next/link';

const RegisterPage = () => {
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [email, setEmail] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [registroConcluido, setRegistroConcluido] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const { register } = useAuth();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const handleRegister = async () => {
        // Validações
        if (!nome.trim() || !sobrenome.trim() || !email.trim() || !nomeUsuario.trim() || !senha.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios', life: 3000 });
            return;
        }

        if (!validateEmail(email)) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Informe um e-mail válido', life: 3000 });
            return;
        }

        if (senha.length < 6) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'A senha deve ter no mínimo 6 caracteres', life: 3000 });
            return;
        }

        if (senha !== confirmarSenha) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'As senhas não conferem', life: 3000 });
            return;
        }

        setLoading(true);
        try {
            await register({ nome, sobrenome, email, nomeUsuario, senha });
            setRegistroConcluido(true);
        } catch (error: any) {
            const message =
                error?.response?.status === 409
                    ? error?.response?.data?.message || 'E-mail ou nome de usuário já cadastrado'
                    : error?.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
            toast.current?.show({ severity: 'error', summary: 'Erro no cadastro', detail: message, life: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRegister();
        }
    };

    // Tela de sucesso — pedir para verificar e-mail
    if (registroConcluido) {
        return (
            <div className={containerClassName}>
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
                            background: 'linear-gradient(180deg, var(--green-500) 10%, rgba(76, 175, 80, 0) 30%)'
                        }}
                    >
                        <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                            <div className="text-center">
                                <i className="pi pi-envelope text-green-500 mb-4" style={{ fontSize: '4rem' }}></i>
                                <div className="text-900 text-3xl font-medium mb-3">Verifique seu e-mail</div>
                                <p className="text-600 font-medium mb-3" style={{ lineHeight: '1.6' }}>
                                    Enviamos um link de verificação para:
                                </p>
                                <p className="text-primary font-bold text-xl mb-4">{email}</p>
                                <p className="text-600 mb-5" style={{ lineHeight: '1.6' }}>
                                    Clique no link enviado ao seu e-mail para ativar sua conta.
                                    <br />O link expira em <strong>24 horas</strong>.
                                </p>
                                <div className="flex flex-column gap-3 align-items-center">
                                    <Button
                                        label="Ir para o Login"
                                        className="w-full p-3 text-xl"
                                        icon="pi pi-sign-in"
                                        onClick={() => router.push('/auth/login')}
                                    />
                                    <span className="text-600 text-sm">
                                        Não recebeu? Verifique sua caixa de spam ou{' '}
                                        <a
                                            href="#"
                                            className="text-primary cursor-pointer"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                try {
                                                    const { AuthService } = await import('@/services/auth.service');
                                                    await AuthService.reenviarVerificacao(email);
                                                    toast.current?.show({
                                                        severity: 'success',
                                                        summary: 'E-mail reenviado',
                                                        detail: 'Um novo link de verificação foi enviado.',
                                                        life: 5000
                                                    });
                                                } catch {
                                                    toast.current?.show({
                                                        severity: 'error',
                                                        summary: 'Erro',
                                                        detail: 'Não foi possível reenviar o e-mail.',
                                                        life: 5000
                                                    });
                                                }
                                            }}
                                        >
                                            reenvie o link
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Toast ref={toast} />
            </div>
        );
    }

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
                            <div className="text-900 text-3xl font-medium mb-3">Criar Conta</div>
                            <span className="text-600 font-medium">Preencha os dados para se cadastrar</span>
                        </div>

                        <div>
                            <div className="flex gap-3 mb-5">
                                <div className="flex-1">
                                    <label htmlFor="nome" className="block text-900 text-xl font-medium mb-2">
                                        Nome *
                                    </label>
                                    <InputText
                                        id="nome"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Seu nome"
                                        className="w-full"
                                        style={{ padding: '1rem' }}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="sobrenome" className="block text-900 text-xl font-medium mb-2">
                                        Sobrenome *
                                    </label>
                                    <InputText
                                        id="sobrenome"
                                        value={sobrenome}
                                        onChange={(e) => setSobrenome(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Seu sobrenome"
                                        className="w-full"
                                        style={{ padding: '1rem' }}
                                    />
                                </div>
                            </div>

                            <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                                E-mail *
                            </label>
                            <InputText
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Seu e-mail"
                                className="w-full mb-5"
                                style={{ padding: '1rem' }}
                            />

                            <label htmlFor="nomeUsuario" className="block text-900 text-xl font-medium mb-2">
                                Nome de Usuário *
                            </label>
                            <InputText
                                id="nomeUsuario"
                                value={nomeUsuario}
                                onChange={(e) => setNomeUsuario(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Seu nome de usuário"
                                className="w-full mb-5"
                                style={{ padding: '1rem' }}
                            />

                            <label htmlFor="senha" className="block text-900 font-medium text-xl mb-2">
                                Senha *
                            </label>
                            <Password
                                inputId="senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Mínimo 6 caracteres"
                                toggleMask
                                className="w-full mb-5"
                                inputClassName="w-full p-3"
                                promptLabel="Escolha uma senha"
                                weakLabel="Fraca"
                                mediumLabel="Média"
                                strongLabel="Forte"
                            />

                            <label htmlFor="confirmarSenha" className="block text-900 font-medium text-xl mb-2">
                                Confirmar Senha *
                            </label>
                            <Password
                                inputId="confirmarSenha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Repita a senha"
                                toggleMask
                                feedback={false}
                                className="w-full mb-5"
                                inputClassName="w-full p-3"
                            />

                            <Button
                                label="Criar Conta"
                                className="w-full p-3 text-xl"
                                onClick={handleRegister}
                                loading={loading}
                                icon="pi pi-user-plus"
                            />

                            <div className="text-center mt-5">
                                <span className="text-600 font-medium">Já tem uma conta? </span>
                                <Link
                                    href="/auth/login"
                                    className="font-medium no-underline cursor-pointer"
                                    style={{ color: 'var(--primary-color)' }}
                                >
                                    Fazer login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
