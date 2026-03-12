'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { InputSwitch } from 'primereact/inputswitch';
import {
    CasoService,
    CasoRequestDTO,
    ESTADO_CASO_OPTIONS,
    STATUS_CASO_OPTIONS,
    PRIORIDADE_CASO_OPTIONS
} from '@/services/caso.service';

const NovoCasoPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<CasoRequestDTO>({
        nome: '',
        estado: 'Open',
        status: 'New',
        prioridade: 'Medium',
        interno: false
    });

    const update = (field: keyof CasoRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!form.nome?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'O nome do caso é obrigatório.', life: 4000 });
            return;
        }
        setSaving(true);
        try {
            await CasoService.criar(form);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Caso criado com sucesso!', life: 3000 });
            setTimeout(() => router.push('/suporte/casos'), 1500);
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao criar caso.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <div className="flex align-items-center gap-3 mb-4">
                        <Button icon="pi pi-arrow-left" className="p-button-text p-button-rounded" onClick={() => router.push('/suporte/casos')} />
                        <div>
                            <h4 className="m-0 text-2xl font-bold">Novo Caso de Suporte</h4>
                            <span className="text-500 text-sm">Registre um novo caso de atendimento</span>
                        </div>
                    </div>

                    <Divider />

                    <div className="grid formgrid">
                        {/* Identification */}
                        <div className="col-12">
                            <h6 className="text-primary font-bold uppercase text-xs mb-3">Identificação</h6>
                        </div>
                        <div className="field col-12 md:col-8">
                            <label className="font-semibold">Nome do Caso <span className="text-red-500">*</span></label>
                            <InputText value={form.nome ?? ''} onChange={e => update('nome', e.target.value)} className="w-full" placeholder="Descreva o assunto do caso" />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label className="font-semibold">Estado</label>
                            <Dropdown value={form.estado} options={ESTADO_CASO_OPTIONS} onChange={e => update('estado', e.value)} className="w-full" />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Status</label>
                            <Dropdown value={form.status} options={STATUS_CASO_OPTIONS} onChange={e => update('status', e.value)} className="w-full" />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Prioridade</label>
                            <Dropdown value={form.prioridade} options={PRIORIDADE_CASO_OPTIONS} onChange={e => update('prioridade', e.value)} className="w-full" />
                        </div>

                        <Divider className="col-12 my-2" />

                        {/* Relationships */}
                        <div className="col-12">
                            <h6 className="text-primary font-bold uppercase text-xs mb-3">Relacionamentos</h6>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">ID da Empresa (Conta)</label>
                            <InputText value={form.contaId ?? ''} onChange={e => update('contaId', e.target.value)} className="w-full" placeholder="ID da empresa..." />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">ID do Contato (criador)</label>
                            <InputText value={form.contatoCriadoPorId ?? ''} onChange={e => update('contatoCriadoPorId', e.target.value)} className="w-full" placeholder="ID do contato..." />
                        </div>

                        <Divider className="col-12 my-2" />

                        {/* Content */}
                        <div className="col-12">
                            <h6 className="text-primary font-bold uppercase text-xs mb-3">Conteúdo</h6>
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold">Descrição</label>
                            <InputTextarea value={form.descricao ?? ''} onChange={e => update('descricao', e.target.value)} rows={4} className="w-full" autoResize placeholder="Descreva o problema ou solicitação..." />
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold">Resolução</label>
                            <InputTextarea value={form.resolucao ?? ''} onChange={e => update('resolucao', e.target.value)} rows={3} className="w-full" autoResize placeholder="Resolução aplicada..." />
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold">Texto de atualização</label>
                            <InputTextarea value={form.textoAtualizacao ?? ''} onChange={e => update('textoAtualizacao', e.target.value)} rows={3} className="w-full" autoResize placeholder="Notas ou atualizações..." />
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold block mb-2">Caso interno?</label>
                            <InputSwitch checked={form.interno ?? false} onChange={e => update('interno', e.value)} />
                        </div>
                    </div>

                    <Divider />

                    {/* Footer */}
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => router.push('/suporte/casos')} disabled={saving} />
                        <Button label="Salvar Caso" icon="pi pi-save" className="p-button-success" onClick={handleSave} loading={saving} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NovoCasoPage;
