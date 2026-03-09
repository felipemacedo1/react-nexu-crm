'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { Divider } from 'primereact/divider';
import {
    OAuthService,
    OAuthProviderDTO,
    OAuthProviderRequestDTO,
    OAUTH_TIPO_OPTIONS
} from '@/services/oauth.service';

const TIPO_ICON: Record<string, string> = {
    GOOGLE: 'pi pi-google',
    MICROSOFT: 'pi pi-microsoft',
    GITHUB: 'pi pi-github',
    SALESFORCE: 'pi pi-cloud',
    CUSTOM: 'pi pi-link'
};

const OAuthPage = () => {
    const toast = useRef<Toast>(null);
    const [providers, setProviders] = useState<OAuthProviderDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<OAuthProviderRequestDTO>({ nome: '', tipo: 'GOOGLE', clientId: '', clientSecret: '', scopes: '', ativo: true });

    const [deleteVisible, setDeleteVisible] = useState(false);
    const [toDelete, setToDelete] = useState<OAuthProviderDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProviders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await OAuthService.listar();
            setProviders(data);
        } catch {
            // Backend endpoint may not exist yet — show empty state gracefully
            setProviders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProviders(); }, [fetchProviders]);

    const update = (field: keyof OAuthProviderRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const openNew = () => {
        setEditingId(null);
        setForm({ nome: '', tipo: 'GOOGLE', clientId: '', clientSecret: '', scopes: '', ativo: true });
        setFormVisible(true);
    };

    const openEdit = (p: OAuthProviderDTO) => {
        setEditingId(p.id);
        setForm({
            nome: p.nome, tipo: p.tipo, clientId: p.clientId, clientSecret: '',
            scopes: p.scopes, ativo: p.ativo,
            urlAutorizacao: p.urlAutorizacao, urlToken: p.urlToken, urlUserInfo: p.urlUserInfo
        });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.nome.trim() || !form.clientId.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Nome e Client ID são obrigatórios.', life: 4000 });
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await OAuthService.atualizar(editingId, form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Provider atualizado!', life: 3000 });
            } else {
                await OAuthService.criar(form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Provider adicionado!', life: 3000 });
            }
            setFormVisible(false);
            fetchProviders();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao salvar.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await OAuthService.delete(toDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Provider removido.', life: 3000 });
            setDeleteVisible(false);
            fetchProviders();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao remover provider.', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const handleTest = async (p: OAuthProviderDTO) => {
        try {
            const result = await OAuthService.testarConexao(p.id);
            toast.current?.show({ severity: result.sucesso ? 'success' : 'warn', summary: result.sucesso ? 'Conexão OK' : 'Falha', detail: result.mensagem, life: 4000 });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível testar a conexão.', life: 5000 });
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <Toolbar className="mb-4"
                        start={
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-link text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">OAuth e APIs Externas</h5>
                                    <span className="text-500 text-sm">Configure conexões com provedores OAuth externos</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Novo Provider" icon="pi pi-plus" className="p-button-success" onClick={openNew} />}
                    />

                    {loading ? (
                        <div className="flex justify-content-center py-6"><i className="pi pi-spin pi-spinner text-4xl text-primary" /></div>
                    ) : providers.length === 0 ? (
                        <div className="text-center py-6">
                            <i className="pi pi-link text-5xl text-300 mb-4" style={{ display: 'block' }} />
                            <p className="text-500 text-lg">Nenhum provider OAuth configurado.</p>
                            <p className="text-400 text-sm mb-4">Adicione integrações com Google, Microsoft, GitHub e outros.</p>
                            <Button label="Adicionar Provider" icon="pi pi-plus" className="p-button-success" onClick={openNew} />
                        </div>
                    ) : (
                        <div className="grid">
                            {providers.map(p => (
                                <div key={p.id} className="col-12 md:col-6 lg:col-4">
                                    <Card className="surface-50 border-none shadow-1 h-full">
                                        <div className="flex align-items-center justify-content-between mb-3">
                                            <div className="flex align-items-center gap-3">
                                                <i className={`${TIPO_ICON[p.tipo] ?? 'pi pi-link'} text-2xl text-primary`} />
                                                <div>
                                                    <div className="font-bold text-900">{p.nome}</div>
                                                    <div className="text-500 text-sm">{p.tipo}</div>
                                                </div>
                                            </div>
                                            <Tag value={p.ativo ? 'Ativo' : 'Inativo'} severity={p.ativo ? 'success' : 'secondary'} />
                                        </div>
                                        <div className="text-500 text-sm mb-1"><span className="font-semibold">Client ID:</span> {p.clientId.substring(0, 20)}...</div>
                                        <div className="text-500 text-sm mb-3"><span className="font-semibold">Scopes:</span> {p.scopes || '-'}</div>
                                        <div className="flex gap-2">
                                            <Button icon="pi pi-wifi" size="small" className="p-button-outlined p-button-info" tooltip="Testar conexão" onClick={() => handleTest(p)} />
                                            <Button icon="pi pi-pencil" size="small" className="p-button-outlined p-button-warning" tooltip="Editar" onClick={() => openEdit(p)} />
                                            <Button icon="pi pi-trash" size="small" className="p-button-outlined p-button-danger" tooltip="Remover" onClick={() => { setToDelete(p); setDeleteVisible(true); }} />
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog visible={formVisible} style={{ width: '580px' }} header={editingId ? 'Editar Provider OAuth' : 'Novo Provider OAuth'}
                modal onHide={() => setFormVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setFormVisible(false)} disabled={saving} />
                        <Button label="Salvar" icon="pi pi-save" onClick={handleSave} loading={saving} className="p-button-success" />
                    </div>
                }>
                <div className="grid formgrid pt-2">
                    <div className="field col-12 md:col-7">
                        <label className="font-semibold">Nome <span className="text-red-500">*</span></label>
                        <InputText value={form.nome} onChange={e => update('nome', e.target.value)} className="w-full" placeholder="ex: Google Workspace" />
                    </div>
                    <div className="field col-12 md:col-5">
                        <label className="font-semibold">Tipo</label>
                        <Dropdown value={form.tipo} options={OAUTH_TIPO_OPTIONS} onChange={e => update('tipo', e.value)} className="w-full" />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Client ID <span className="text-red-500">*</span></label>
                        <InputText value={form.clientId} onChange={e => update('clientId', e.target.value)} className="w-full" placeholder="Client ID do provider" />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Client Secret</label>
                        <InputText type="password" value={form.clientSecret} onChange={e => update('clientSecret', e.target.value)} className="w-full" placeholder="••••••••" />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Scopes (separados por espaço)</label>
                        <InputText value={form.scopes} onChange={e => update('scopes', e.target.value)} className="w-full" placeholder="openid email profile" />
                    </div>
                    {form.tipo === 'CUSTOM' && (
                        <>
                            <div className="field col-12">
                                <label className="font-semibold">URL de Autorização</label>
                                <InputText value={form.urlAutorizacao ?? ''} onChange={e => update('urlAutorizacao', e.target.value)} className="w-full" placeholder="https://..." />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold">URL do Token</label>
                                <InputText value={form.urlToken ?? ''} onChange={e => update('urlToken', e.target.value)} className="w-full" placeholder="https://..." />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold">URL UserInfo</label>
                                <InputText value={form.urlUserInfo ?? ''} onChange={e => update('urlUserInfo', e.target.value)} className="w-full" placeholder="https://..." />
                            </div>
                        </>
                    )}
                    <div className="field col-12 flex align-items-center gap-3 mt-1">
                        <InputSwitch checked={form.ativo} onChange={e => update('ativo', e.value)} />
                        <label className="font-semibold">Provider ativo</label>
                    </div>
                </div>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog visible={deleteVisible} style={{ width: '420px' }} header="Confirmar Remoção" modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteVisible(false)} disabled={deleting} />
                        <Button label="Remover" icon="pi pi-trash" severity="danger" onClick={handleDelete} loading={deleting} />
                    </div>
                }
                onHide={() => setDeleteVisible(false)}>
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-3xl text-yellow-500" />
                    <span>Remover o provider <strong>{toDelete?.nome}</strong>? As integrações que dependem dele deixarão de funcionar.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default OAuthPage;
