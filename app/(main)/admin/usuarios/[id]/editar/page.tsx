'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { UsuarioService, UsuarioDTO } from '@/services/usuario.service';

const TITULO_OPTIONS = [
    { label: 'Sr.', value: 'Sr.' },
    { label: 'Sra.', value: 'Sra.' },
    { label: 'Dr.', value: 'Dr.' },
    { label: 'Dra.', value: 'Dra.' },
    { label: 'Outro', value: 'Outro' }
];

const EditarUsuarioPage = () => {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Partial<UsuarioDTO> & { novaSenha?: string; confirmarSenha?: string }>({});

    const fetchUsuario = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UsuarioService.getById(id);
            setForm({ ...data, novaSenha: '', confirmarSenha: '' });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Usuário não encontrado', life: 5000 });
            setTimeout(() => router.push('/admin/usuarios'), 2000);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) fetchUsuario();
    }, [id, fetchUsuario]);

    const update = (field: keyof typeof form, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!form.nome?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'O nome é obrigatório.', life: 4000 });
            return;
        }
        if (!form.email?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'O e-mail é obrigatório.', life: 4000 });
            return;
        }
        if (form.novaSenha && form.novaSenha !== form.confirmarSenha) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'As senhas não coincidem.', life: 4000 });
            return;
        }

        setSaving(true);
        try {
            const { novaSenha, confirmarSenha, ...payload } = form;
            if (novaSenha) (payload as any).senha = novaSenha;
            await UsuarioService.update(id, payload as Partial<UsuarioDTO>);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário atualizado com sucesso!', life: 3000 });
            setTimeout(() => router.push(`/admin/usuarios/${id}`), 1500);
        } catch (err: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: err?.response?.data?.message ?? 'Erro ao atualizar usuário.',
                life: 5000
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    {/* Header */}
                    <div className="flex align-items-center gap-3 mb-4">
                        <Button
                            icon="pi pi-arrow-left"
                            className="p-button-text p-button-rounded"
                            onClick={() => router.push(`/admin/usuarios/${id}`)}
                            tooltip="Voltar"
                        />
                        <div>
                            <h5 className="m-0 text-xl font-bold">Editar Usuário</h5>
                            <span className="text-500 text-sm">{form.nome} {form.sobrenome}</span>
                        </div>
                    </div>

                    <Divider />

                    <div className="grid formgrid">

                        {/* Título */}
                        <div className="field col-12 md:col-2">
                            <label htmlFor="titulo" className="font-semibold">Título</label>
                            <Dropdown
                                id="titulo"
                                value={form.titulo}
                                options={TITULO_OPTIONS}
                                onChange={(e) => update('titulo', e.value)}
                                placeholder="Título"
                                className="w-full"
                                showClear
                            />
                        </div>

                        {/* Nome */}
                        <div className="field col-12 md:col-5">
                            <label htmlFor="nome" className="font-semibold">
                                Nome <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="nome"
                                value={form.nome ?? ''}
                                onChange={(e) => update('nome', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Sobrenome */}
                        <div className="field col-12 md:col-5">
                            <label htmlFor="sobrenome" className="font-semibold">Sobrenome</label>
                            <InputText
                                id="sobrenome"
                                value={form.sobrenome ?? ''}
                                onChange={(e) => update('sobrenome', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* E-mail */}
                        <div className="field col-12 md:col-6">
                            <label htmlFor="email" className="font-semibold">
                                E-mail <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="email"
                                type="email"
                                value={form.email ?? ''}
                                onChange={(e) => update('email', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Nome de usuário */}
                        <div className="field col-12 md:col-6">
                            <label htmlFor="nomeUsuario" className="font-semibold">Nome de Usuário</label>
                            <InputText
                                id="nomeUsuario"
                                value={form.nomeUsuario ?? ''}
                                onChange={(e) => update('nomeUsuario', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Nova senha */}
                        <div className="field col-12 md:col-6">
                            <label htmlFor="novaSenha" className="font-semibold">Nova Senha</label>
                            <Password
                                id="novaSenha"
                                value={form.novaSenha ?? ''}
                                onChange={(e) => update('novaSenha', e.target.value)}
                                placeholder="Deixe em branco para manter"
                                className="w-full"
                                inputClassName="w-full"
                                feedback
                                toggleMask
                                promptLabel="Digite a senha"
                                weakLabel="Fraca"
                                mediumLabel="Média"
                                strongLabel="Forte"
                            />
                        </div>

                        {/* Confirmar senha */}
                        <div className="field col-12 md:col-6">
                            <label htmlFor="confirmarSenha" className="font-semibold">Confirmar Nova Senha</label>
                            <Password
                                id="confirmarSenha"
                                value={form.confirmarSenha ?? ''}
                                onChange={(e) => update('confirmarSenha', e.target.value)}
                                placeholder="Repita a nova senha"
                                className="w-full"
                                inputClassName="w-full"
                                feedback={false}
                                toggleMask
                            />
                        </div>

                        {/* Departamento */}
                        <div className="field col-12 md:col-6">
                            <label htmlFor="departamento" className="font-semibold">Departamento</label>
                            <InputText
                                id="departamento"
                                value={form.departamento ?? ''}
                                onChange={(e) => update('departamento', e.target.value)}
                                placeholder="Ex: Comercial, TI, RH..."
                                className="w-full"
                            />
                        </div>

                        {/* Telefone */}
                        <div className="field col-12 md:col-6">
                            <label htmlFor="telefone" className="font-semibold">Telefone</label>
                            <InputText
                                id="telefone"
                                value={(form as any).telefone ?? ''}
                                onChange={(e) => update('telefone' as any, e.target.value)}
                                placeholder="(11) 99999-9999"
                                className="w-full"
                            />
                        </div>

                        {/* Flags */}
                        <div className="field col-12 flex gap-4 align-items-center">
                            <div className="flex align-items-center gap-2">
                                <Checkbox
                                    inputId="ativo"
                                    checked={form.ativo !== false}
                                    onChange={(e) => update('ativo', e.checked)}
                                />
                                <label htmlFor="ativo" className="cursor-pointer font-semibold">Usuário ativo</label>
                            </div>
                            <div className="flex align-items-center gap-2">
                                <Checkbox
                                    inputId="administrador"
                                    checked={!!form.administrador}
                                    onChange={(e) => update('administrador', e.checked)}
                                />
                                <label htmlFor="administrador" className="cursor-pointer font-semibold">Administrador</label>
                            </div>
                        </div>

                    </div>

                    <Divider />

                    {/* Ações */}
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => router.push(`/admin/usuarios/${id}`)}
                            disabled={saving}
                        />
                        <Button
                            label="Salvar Alterações"
                            icon="pi pi-save"
                            onClick={handleSave}
                            loading={saving}
                            className="p-button-success"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditarUsuarioPage;
