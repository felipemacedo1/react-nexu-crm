'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { Divider } from 'primereact/divider';
import { formatDateTime } from '@/utils/format';
import {
    WebhookService,
    WebhookDTO,
    WebhookRequestDTO,
    WEBHOOK_EVENTO_OPTIONS
} from '@/services/oauth.service';

const WebhooksPage = () => {
    const toast = useRef<Toast>(null);
    const [webhooks, setWebhooks] = useState<WebhookDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<WebhookRequestDTO>({ nome: '', url: '', eventos: [], ativo: true });

    const [deleteVisible, setDeleteVisible] = useState(false);
    const [toDelete, setToDelete] = useState<WebhookDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchWebhooks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await WebhookService.listar();
            setWebhooks(data);
        } catch {
            setWebhooks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

    const update = (field: keyof WebhookRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const openNew = () => {
        setEditingId(null);
        setForm({ nome: '', url: '', eventos: [], ativo: true });
        setFormVisible(true);
    };

    const openEdit = (w: WebhookDTO) => {
        setEditingId(w.id);
        setForm({ nome: w.nome, url: w.url, eventos: w.eventos, ativo: w.ativo, secret: w.secret ?? '' });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.nome.trim() || !form.url.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Nome e URL são obrigatórios.', life: 4000 });
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await WebhookService.atualizar(editingId, form);
                toast.current?.show({ severity: 'success', summary: 'Atualizado', detail: 'Webhook atualizado!', life: 3000 });
            } else {
                await WebhookService.criar(form);
                toast.current?.show({ severity: 'success', summary: 'Criado', detail: 'Webhook criado!', life: 3000 });
            }
            setFormVisible(false);
            fetchWebhooks();
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
            await WebhookService.delete(toDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Webhook removido.', life: 3000 });
            setDeleteVisible(false);
            fetchWebhooks();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao remover webhook.', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const handleTest = async (w: WebhookDTO) => {
        try {
            const result = await WebhookService.testar(w.id);
            toast.current?.show({
                severity: result.sucesso ? 'success' : 'warn',
                summary: result.sucesso ? `HTTP ${result.httpStatus}` : 'Falha',
                detail: result.mensagem,
                life: 4000
            });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível testar o webhook.', life: 5000 });
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
                                <i className="pi pi-bolt text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Webhooks</h5>
                                    <span className="text-500 text-sm">Configure notificações automáticas para sistemas externos</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Novo Webhook" icon="pi pi-plus" className="p-button-success" onClick={openNew} />}
                    />

                    {loading ? (
                        <div className="flex justify-content-center py-6"><i className="pi pi-spin pi-spinner text-4xl text-primary" /></div>
                    ) : webhooks.length === 0 ? (
                        <div className="text-center py-6">
                            <i className="pi pi-bolt text-5xl text-300 mb-4" style={{ display: 'block' }} />
                            <p className="text-500 text-lg">Nenhum webhook configurado.</p>
                            <p className="text-400 text-sm mb-4">Webhooks enviam notificações automáticas quando eventos ocorrem no CRM.</p>
                            <Button label="Criar Primeiro Webhook" icon="pi pi-plus" className="p-button-success" onClick={openNew} />
                        </div>
                    ) : (
                        <div className="grid">
                            {webhooks.map(w => (
                                <div key={w.id} className="col-12 md:col-6">
                                    <Card className="surface-50 border-none shadow-1 h-full">
                                        <div className="flex align-items-start justify-content-between mb-3">
                                            <div>
                                                <div className="font-bold text-900 text-lg">{w.nome}</div>
                                                <div className="text-500 text-sm mt-1 word-break-all">{w.url}</div>
                                            </div>
                                            <Tag value={w.ativo ? 'Ativo' : 'Inativo'} severity={w.ativo ? 'success' : 'info'} className="ml-2 flex-shrink-0" />
                                        </div>

                                        <div className="mb-3">
                                            <div className="text-500 text-xs font-semibold uppercase mb-2">Eventos ({w.eventos?.length ?? 0})</div>
                                            <div className="flex flex-wrap gap-1">
                                                {(w.eventos ?? []).slice(0, 4).map(ev => (
                                                    <Tag key={ev} value={ev} severity="info" className="text-xs" />
                                                ))}
                                                {(w.eventos?.length ?? 0) > 4 && (
                                                    <Tag value={`+${(w.eventos?.length ?? 0) - 4}`} severity="info" className="text-xs" />
                                                )}
                                            </div>
                                        </div>

                                        {w.ultimaExecucao && (
                                            <div className="text-500 text-sm mb-3">
                                                <span className="font-semibold">Última execução:</span> {formatDateTime(w.ultimaExecucao)}
                                                {w.ultimoStatus && (
                                                    <Tag value={w.ultimoStatus} severity={w.ultimoStatus === '200' ? 'success' : 'danger'} className="ml-2 text-xs" />
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button icon="pi pi-send" size="small" className="p-button-outlined p-button-info" tooltip="Testar agora" tooltipOptions={{ position: 'top' }} onClick={() => handleTest(w)} />
                                            <Button icon="pi pi-pencil" size="small" className="p-button-outlined p-button-warning" tooltip="Editar" tooltipOptions={{ position: 'top' }} onClick={() => openEdit(w)} />
                                            <Button icon="pi pi-trash" size="small" className="p-button-outlined p-button-danger" tooltip="Remover" tooltipOptions={{ position: 'top' }} onClick={() => { setToDelete(w); setDeleteVisible(true); }} />
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog visible={formVisible} style={{ width: '560px' }} header={editingId ? 'Editar Webhook' : 'Novo Webhook'}
                modal onHide={() => setFormVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setFormVisible(false)} disabled={saving} />
                        <Button label="Salvar" icon="pi pi-save" onClick={handleSave} loading={saving} className="p-button-success" />
                    </div>
                }>
                <div className="grid formgrid pt-2">
                    <div className="field col-12">
                        <label className="font-semibold">Nome <span className="text-red-500">*</span></label>
                        <InputText value={form.nome} onChange={e => update('nome', e.target.value)} className="w-full" placeholder="ex: Notificação Slack" />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">URL de Destino <span className="text-red-500">*</span></label>
                        <InputText value={form.url} onChange={e => update('url', e.target.value)} className="w-full" placeholder="https://hooks.slack.com/..." />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Eventos</label>
                        <MultiSelect value={form.eventos} options={WEBHOOK_EVENTO_OPTIONS} onChange={e => update('eventos', e.value)}
                            placeholder="Selecione os eventos..." className="w-full" display="chip" maxSelectedLabels={3} />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Secret (opcional)</label>
                        <InputText type="password" value={form.secret ?? ''} onChange={e => update('secret', e.target.value)} className="w-full" placeholder="Chave de assinatura HMAC..." />
                    </div>
                    <div className="field col-12 flex align-items-center gap-3">
                        <InputSwitch checked={form.ativo} onChange={e => update('ativo', e.value)} />
                        <label className="font-semibold">Webhook ativo</label>
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
                    <span>Remover o webhook <strong>{toDelete?.nome}</strong>? Esta ação não pode ser desfeita.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default WebhooksPage;
