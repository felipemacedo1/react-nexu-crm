'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Avatar } from 'primereact/avatar';
import { formatDate } from '@/utils/format';
import { UsuarioService, UsuarioDTO } from '@/services/usuario.service';

const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="col-12 md:col-6 mb-3">
        <span className="text-500 text-sm block mb-1">{label}</span>
        <span className="font-semibold text-900">{value || '-'}</span>
    </div>
);

const UsuarioDetalhesPage = () => {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const id = params.id as string;

    const [usuario, setUsuario] = useState<UsuarioDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchUsuario = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UsuarioService.getById(id);
            setUsuario(data);
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Usuário não encontrado',
                life: 5000
            });
            setTimeout(() => router.push('/admin/usuarios'), 2000);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) fetchUsuario();
    }, [id, fetchUsuario]);

    const handleDelete = async () => {
        if (!usuario?.id) return;
        setDeleting(true);
        try {
            await UsuarioService.delete(usuario.id);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Usuário "${usuario.nome}" excluído com sucesso`,
                life: 3000
            });
            setTimeout(() => router.push('/admin/usuarios'), 1500);
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir usuário',
                life: 5000
            });
        } finally {
            setDeleting(false);
            setDeleteVisible(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <ProgressSpinner />
            </div>
        );
    }

    if (!usuario) return null;

    const nomeCompleto = `${usuario.nome ?? ''} ${usuario.sobrenome ?? ''}`.trim();

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    {/* Header */}
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div className="flex align-items-center gap-3">
                            <Button
                                icon="pi pi-arrow-left"
                                className="p-button-text p-button-rounded"
                                onClick={() => router.push('/admin/usuarios')}
                                tooltip="Voltar"
                            />
                            <Avatar
                                label={usuario.nome?.charAt(0).toUpperCase() ?? '?'}
                                shape="circle"
                                size="large"
                                style={{ backgroundColor: '#6366f1', color: '#fff' }}
                            />
                            <div>
                                <h5 className="m-0 text-xl font-bold">{nomeCompleto}</h5>
                                <span className="text-500 text-sm">{usuario.email}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                label="Editar"
                                icon="pi pi-pencil"
                                severity="warning"
                                onClick={() => router.push(`/admin/usuarios/${id}/editar`)}
                            />
                            <Button
                                label="Excluir"
                                icon="pi pi-trash"
                                severity="danger"
                                className="p-button-outlined"
                                onClick={() => setDeleteVisible(true)}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Badges de status */}
                    <div className="flex gap-2 mb-4">
                        {usuario.ativo !== false ? (
                            <Tag value="Ativo" severity="success" icon="pi pi-check" />
                        ) : (
                            <Tag value="Inativo" severity="info" />
                        )}
                        {usuario.administrador && (
                            <Tag value="Administrador" severity="danger" icon="pi pi-shield" />
                        )}
                    </div>

                    {/* Informações */}
                    <h6 className="text-lg font-bold text-700 mb-3">Informações do Usuário</h6>
                    <div className="grid">
                        <InfoItem label="Nome Completo" value={nomeCompleto} />
                        <InfoItem label="Nome de Usuário" value={usuario.nomeUsuario} />
                        <InfoItem label="E-mail" value={usuario.email} />
                        <InfoItem label="Telefone" value={(usuario as any).telefone} />
                        <InfoItem label="Título" value={usuario.titulo} />
                        <InfoItem label="Departamento" value={usuario.departamento} />
                        <InfoItem label="Criado em" value={usuario.criadoEm ? formatDate(usuario.criadoEm) : '-'} />
                        <InfoItem label="Atualizado em" value={usuario.atualizadoEm ? formatDate(usuario.atualizadoEm) : '-'} />
                    </div>
                </div>
            </div>

            {/* Confirmar exclusão */}
            <Dialog
                visible={deleteVisible}
                style={{ width: '450px' }}
                header="Confirmar Exclusão"
                modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => setDeleteVisible(false)}
                            disabled={deleting}
                        />
                        <Button
                            label="Excluir"
                            icon="pi pi-trash"
                            severity="danger"
                            onClick={handleDelete}
                            loading={deleting}
                        />
                    </div>
                }
                onHide={() => setDeleteVisible(false)}
            >
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-3xl text-yellow-500" />
                    <span>
                        Deseja excluir o usuário <strong>{nomeCompleto}</strong>? Esta ação não pode ser desfeita.
                    </span>
                </div>
            </Dialog>
        </div>
    );
};

export default UsuarioDetalhesPage;
