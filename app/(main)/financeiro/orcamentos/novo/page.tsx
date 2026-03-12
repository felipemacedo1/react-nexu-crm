'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import { OrcamentoService, OrcamentoRequestDTO, FASE_ORCAMENTO_OPTIONS } from '@/services/financeiro.service';

const NovoOrcamentoPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<OrcamentoRequestDTO>({ nome: '', fase: 'Draft' });

    const update = (field: keyof OrcamentoRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await OrcamentoService.criar(form);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Orçamento criado!', life: 3000 });
            setTimeout(() => router.push('/financeiro/orcamentos'), 1500);
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao criar orçamento.', life: 5000 });
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
                        <Button icon="pi pi-arrow-left" className="p-button-text p-button-rounded" onClick={() => router.push('/financeiro/orcamentos')} />
                        <div>
                            <h4 className="m-0 text-2xl font-bold">Novo Orçamento</h4>
                            <span className="text-500 text-sm">Crie uma nova proposta ou orçamento</span>
                        </div>
                    </div>

                    <Divider />

                    <div className="grid formgrid">
                        {/* General */}
                        <div className="col-12">
                            <h6 className="text-primary font-bold uppercase text-xs mb-3">Informações Gerais</h6>
                        </div>
                        <div className="field col-12 md:col-4">
                            <label className="font-semibold">Fase</label>
                            <Dropdown value={form.fase} options={FASE_ORCAMENTO_OPTIONS} onChange={e => update('fase', e.value)} className="w-full" />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label className="font-semibold">Validade</label>
                            <Calendar value={form.validade ? new Date(form.validade) : null}
                                onChange={e => update('validade', e.value ? (e.value as Date).toISOString().split('T')[0] : undefined)}
                                dateFormat="dd/mm/yy" className="w-full" placeholder="Data de validade" />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label className="font-semibold">Prazo</label>
                            <Calendar value={form.prazo ? new Date(form.prazo) : null}
                                onChange={e => update('prazo', e.value ? (e.value as Date).toISOString().split('T')[0] : undefined)}
                                dateFormat="dd/mm/yy" className="w-full" placeholder="Data de prazo" />
                        </div>

                        <Divider className="col-12 my-2" />

                        {/* Relationships */}
                        <div className="col-12">
                            <h6 className="text-primary font-bold uppercase text-xs mb-3">Relacionamentos</h6>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">ID da Conta (Cobrança)</label>
                            <InputText value={form.contaCobrancaId ?? ''} onChange={e => update('contaCobrancaId', e.target.value)} className="w-full" placeholder="ID da empresa de cobrança..." />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">ID do Contato (Cobrança)</label>
                            <InputText value={form.contatoCobrancaId ?? ''} onChange={e => update('contatoCobrancaId', e.target.value)} className="w-full" placeholder="ID do contato de cobrança..." />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">ID da Oportunidade</label>
                            <InputText value={form.oportunidadeId ?? ''} onChange={e => update('oportunidadeId', e.target.value)} className="w-full" placeholder="ID da oportunidade..." />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">ID da Moeda</label>
                            <InputText value={form.moedaId ?? ''} onChange={e => update('moedaId', e.target.value)} className="w-full" placeholder="ID da moeda..." />
                        </div>

                        <Divider className="col-12 my-2" />

                        {/* Values */}
                        <div className="col-12">
                            <h6 className="text-primary font-bold uppercase text-xs mb-3">Valores</h6>
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Subtotal</label>
                            <InputText type="number" value={String(form.valorSubtotal ?? '')} onChange={e => update('valorSubtotal', Number(e.target.value))} className="w-full" placeholder="0.00" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Desconto</label>
                            <InputText type="number" value={String(form.valorDesconto ?? '')} onChange={e => update('valorDesconto', Number(e.target.value))} className="w-full" placeholder="0.00" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Imposto</label>
                            <InputText type="number" value={String(form.valorImposto ?? '')} onChange={e => update('valorImposto', Number(e.target.value))} className="w-full" placeholder="0.00" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Frete</label>
                            <InputText type="number" value={String(form.valorFrete ?? '')} onChange={e => update('valorFrete', Number(e.target.value))} className="w-full" placeholder="0.00" />
                        </div>
                    </div>

                    <Divider />

                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => router.push('/financeiro/orcamentos')} disabled={saving} />
                        <Button label="Salvar Orçamento" icon="pi pi-save" className="p-button-success" onClick={handleSave} loading={saving} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NovoOrcamentoPage;
