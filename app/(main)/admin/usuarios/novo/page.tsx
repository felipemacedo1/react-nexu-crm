'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { UsuarioService, UsuarioDTO } from '@/services/usuario.service';
import { GrupoSegurancaResponseDTO, GrupoSegurancaService } from '@/services/grupo-seguranca.service';

const TITULO_OPTIONS = [
    { label: 'Sr.', value: 'Sr.' },
    { label: 'Sra.', value: 'Sra.' },
    { label: 'Dr.', value: 'Dr.' },
    { label: 'Dra.', value: 'Dra.' },
    { label: 'Outro', value: 'Outro' }
];

const NovoUsuarioPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [saving, setSaving] = useState(false);
    const [grupos, setGrupos] = useState<GrupoSegurancaResponseDTO[]>([]);

    const [form, setForm] = useState<Partial<UsuarioDTO> & { confirmarSenha?: string }>({
        nome: '',
        sobrenome: '',
        email: '',
        nomeUsuario: '',
        senha: '',
        confirmarSenha: '',
        titulo: '',
        departamento: '',
        grupoSegurancaId: '',
        ativo: true,
        administrador: false
    });

    useEffect(() => {
        GrupoSegurancaService.listarAtivos()
            .then(setGrupos)
            .catch(() => {
                toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Não foi possível carregar os grupos de segurança.', life: 4000 });
            });
    }, []);

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
        if (!form.nomeUsuario?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'O nome de usuário é obrigatório.', life: 4000 });
            return;
        }
        if (form.senha && form.senha !== form.confirmarSenha) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'As senhas não coincidem.', life: 4000 });
            return;
        }

        setSaving(true);
        try {
            const { confirmarSenha, ...payload } = form;
            await UsuarioService.create(payload as Partial<UsuarioDTO>);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário criado com sucesso!', life: 3000 });
            setTimeout(() => router.push('/admin/usuarios'), 1500);
        } catch (err: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: err?.response?.data?.message ?? 'Erro ao criar usuário.',
                life: 5000
            });
        } finally {
            setSaving(false);
        }
    };

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
                            onClick={() => router.push('/admin/usuarios')}
                            tooltip="Voltar"
                        />
                        <div>
                            <h5 className="m-0 text-xl font-bold">Novo Usuário</h5>
                            <span className="text-500 text-sm">Cadastre um novo usuário no sistema</span>
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
                                placeholder="Primeiro nome"
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
                                placeholder="Sobrenome"
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
                                placeholder="usuario@empresa.com"
                                className="w-full"
                            />
                        </div>

                        {/* Nome de usuário */}
                        <div className="field col-12 md:col-6">
                            <label htmlFor="nomeUsuario" className="font-semibold">
                                Nome de Usuário <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="nomeUsuario"
                                value={form.nomeUsuario ?? ''}
                                onChange={(e) => update('nomeUsuario', e.target.value)}
                                placeholder="usuario.sistema"
                                className="w-full"
                            />
                        </div>

                        {/* Senha */}
                        <div className="field col-12 md:col-6">
                            <label htmlFor="senha" className="font-semibold">Senha</label>
                            <Password
                                id="senha"
                                value={form.senha ?? ''}
                                onChange={(e) => update('senha', e.target.value)}
                                placeholder="Nova senha"
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
                            <label htmlFor="confirmarSenha" className="font-semibold">Confirmar Senha</label>
                            <Password
                                id="confirmarSenha"
                                value={form.confirmarSenha ?? ''}
                                onChange={(e) => update('confirmarSenha', e.target.value)}
                                placeholder="Repita a senha"
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

                        <div className="field col-12 md:col-6">
                            <label htmlFor="grupoSegurancaId" className="font-semibold">Grupo de Segurança</label>
                            <Dropdown
                                id="grupoSegurancaId"
                                value={form.grupoSegurancaId ?? ''}
                                options={grupos.map((grupo) => ({ label: grupo.nome, value: grupo.id }))}
                                onChange={(e) => update('grupoSegurancaId', e.value)}
                                placeholder="Selecione um grupo"
                                className="w-full"
                                showClear
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
                            onClick={() => router.push('/admin/usuarios')}
                            disabled={saving}
                        />
                        <Button
                            label="Salvar Usuário"
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

export default NovoUsuarioPage;
