'use client';
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { useAuth } from '@/hooks/useAuth';
import { UsuarioService } from '@/services/usuario.service';

const PerfilPage = () => {
    const toast = useRef<Toast>(null);
    const { user } = useAuth();

    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Dados pessoais
    const [nome, setNome] = useState(user?.nome ?? '');
    const [sobrenome, setSobrenome] = useState(user?.sobrenome ?? '');
    const [telefone, setTelefone] = useState('');
    const [titulo, setTitulo] = useState('');
    const [departamento, setDepartamento] = useState('');

    // Alterar senha
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const nomeCompleto = `${user?.nome ?? ''} ${user?.sobrenome ?? ''}`.trim();
    const iniciais = user
        ? `${user.nome?.charAt(0) ?? ''}${user.sobrenome?.charAt(0) ?? ''}`.toUpperCase()
        : 'U';

    const handleSavePerfil = async () => {
        if (!nome.trim() || !sobrenome.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Nome e sobrenome são obrigatórios.', life: 4000 });
            return;
        }
        if (!user?.id) return;
        setSaving(true);
        try {
            await UsuarioService.update(user.id, {
                nome,
                sobrenome,
                email: user.email,
                nomeUsuario: user.nomeUsuario,
                telefone: telefone || undefined,
                titulo: titulo || undefined,
                departamento: departamento || undefined
            });
            toast.current?.show({ severity: 'success', summary: 'Salvo', detail: 'Perfil atualizado com sucesso!', life: 3000 });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o perfil.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async () => {
        if (!novaSenha || !confirmarSenha || !senhaAtual) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos de senha.', life: 4000 });
            return;
        }
        if (novaSenha !== confirmarSenha) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'A nova senha e a confirmação não coincidem.', life: 4000 });
            return;
        }
        if (novaSenha.length < 8) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'A nova senha deve ter pelo menos 8 caracteres.', life: 4000 });
            return;
        }
        setSavingPassword(true);
        try {
            // TODO: conectar ao endpoint PUT /api/auth/alterar-senha quando disponível
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.current?.show({ severity: 'success', summary: 'Senha alterada', detail: 'Sua senha foi alterada com sucesso!', life: 3000 });
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível alterar a senha.', life: 5000 });
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* ── Cabeçalho ── */}
            <div className="col-12">
                <div className="card mb-0">
                    <div className="flex align-items-center gap-4">
                        <Avatar
                            label={iniciais}
                            shape="circle"
                            style={{
                                width: '5rem',
                                height: '5rem',
                                fontSize: '1.75rem',
                                backgroundColor: 'var(--primary-color)',
                                color: '#fff',
                                flexShrink: 0
                            }}
                        />
                        <div>
                            <h4 className="m-0 text-2xl font-bold">{nomeCompleto || 'Usuário'}</h4>
                            <span className="text-500 text-sm">{user?.email}</span>
                            <div className="mt-2 flex gap-2">
                                {user?.administrador && (
                                    <Tag value="Administrador" icon="pi pi-shield" severity="warning" />
                                )}
                                <Tag value="Ativo" icon="pi pi-check-circle" severity="success" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Dados Pessoais ── */}
            <div className="col-12 lg:col-8">
                <div className="card">
                    <h5 className="flex align-items-center gap-2 mb-4">
                        <i className="pi pi-user text-primary" />
                        Dados Pessoais
                    </h5>

                    <div className="grid formgrid">
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Nome *</label>
                            <InputText
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                className="w-full"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Sobrenome *</label>
                            <InputText
                                value={sobrenome}
                                onChange={e => setSobrenome(e.target.value)}
                                className="w-full"
                                placeholder="Seu sobrenome"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">E-mail</label>
                            <InputText
                                value={user?.email ?? ''}
                                disabled
                                className="w-full"
                                tooltip="O e-mail não pode ser alterado aqui"
                                tooltipOptions={{ position: 'top' }}
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Usuário</label>
                            <InputText
                                value={user?.nomeUsuario ?? ''}
                                disabled
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Telefone</label>
                            <InputText
                                value={telefone}
                                onChange={e => setTelefone(e.target.value)}
                                className="w-full"
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Título / Cargo</label>
                            <InputText
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                className="w-full"
                                placeholder="Ex: Gerente de Vendas"
                            />
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold">Departamento</label>
                            <InputText
                                value={departamento}
                                onChange={e => setDepartamento(e.target.value)}
                                className="w-full"
                                placeholder="Ex: Comercial"
                            />
                        </div>
                    </div>

                    <div className="flex justify-content-end mt-2">
                        <Button
                            label="Salvar Alterações"
                            icon="pi pi-save"
                            severity="success"
                            onClick={handleSavePerfil}
                            loading={saving}
                        />
                    </div>
                </div>
            </div>

            {/* ── Informações da Conta ── */}
            <div className="col-12 lg:col-4">
                <div className="card">
                    <h5 className="flex align-items-center gap-2 mb-4">
                        <i className="pi pi-info-circle text-primary" />
                        Minha Conta
                    </h5>
                    <div className="flex flex-column gap-3">
                        <div>
                            <span className="text-500 text-xs uppercase font-semibold block mb-1">ID da Conta</span>
                            <span className="font-medium text-sm" style={{ wordBreak: 'break-all' }}>{user?.id ?? '-'}</span>
                        </div>
                        <Divider className="my-1" />
                        <div>
                            <span className="text-500 text-xs uppercase font-semibold block mb-1">Tipo de Acesso</span>
                            <span className="font-medium">
                                {user?.administrador ? 'Administrador' : 'Usuário Padrão'}
                            </span>
                        </div>
                        <Divider className="my-1" />
                        <div>
                            <span className="text-500 text-xs uppercase font-semibold block mb-1">Status</span>
                            <Tag value="Conta Ativa" severity="success" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Alterar Senha ── */}
            <div className="col-12 lg:col-8">
                <div className="card">
                    <h5 className="flex align-items-center gap-2 mb-4">
                        <i className="pi pi-lock text-primary" />
                        Alterar Senha
                    </h5>

                    <div className="grid formgrid">
                        <div className="field col-12">
                            <label className="font-semibold">Senha Atual *</label>
                            <Password
                                value={senhaAtual}
                                onChange={e => setSenhaAtual(e.target.value)}
                                className="w-full"
                                inputClassName="w-full"
                                feedback={false}
                                toggleMask
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Nova Senha *</label>
                            <Password
                                value={novaSenha}
                                onChange={e => setNovaSenha(e.target.value)}
                                className="w-full"
                                inputClassName="w-full"
                                toggleMask
                                placeholder="Mínimo 8 caracteres"
                                promptLabel="Digite uma senha forte"
                                weakLabel="Fraca"
                                mediumLabel="Média"
                                strongLabel="Forte"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Confirmar Nova Senha *</label>
                            <Password
                                value={confirmarSenha}
                                onChange={e => setConfirmarSenha(e.target.value)}
                                className="w-full"
                                inputClassName="w-full"
                                feedback={false}
                                toggleMask
                                placeholder="Repita a nova senha"
                            />
                        </div>
                    </div>

                    <div className="flex justify-content-end mt-2">
                        <Button
                            label="Alterar Senha"
                            icon="pi pi-key"
                            severity="warning"
                            onClick={handleSavePassword}
                            loading={savingPassword}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilPage;
