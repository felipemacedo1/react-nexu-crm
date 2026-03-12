'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { ProdutoService, ProdutoRequestDTO, TIPO_PRODUTO_OPTIONS } from '@/services/financeiro.service';

const NovoProdutoPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<ProdutoRequestDTO>({ nome: '', tipo: 'Good' });

    const update = (field: keyof ProdutoRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!form.nome?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'O nome do produto é obrigatório.', life: 4000 });
            return;
        }
        setSaving(true);
        try {
            await ProdutoService.criar(form);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto criado!', life: 3000 });
            setTimeout(() => router.push('/financeiro/produtos'), 1500);
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao criar produto.', life: 5000 });
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
                        <Button icon="pi pi-arrow-left" className="p-button-text p-button-rounded" onClick={() => router.push('/financeiro/produtos')} />
                        <div>
                            <h4 className="m-0 text-2xl font-bold">Novo Produto</h4>
                            <span className="text-500 text-sm">Adicione um produto ou serviço ao catálogo</span>
                        </div>
                    </div>

                    <Divider />

                    <div className="grid formgrid">
                        {/* Identification */}
                        <div className="col-12">
                            <h6 className="text-primary font-bold uppercase text-xs mb-3">Identificação</h6>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold">Nome <span className="text-red-500">*</span></label>
                            <InputText value={form.nome ?? ''} onChange={e => update('nome', e.target.value)} className="w-full" placeholder="Nome do produto..." />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Tipo</label>
                            <Dropdown value={form.tipo} options={TIPO_PRODUTO_OPTIONS} onChange={e => update('tipo', e.value)} className="w-full" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Código Principal</label>
                            <InputText value={form.codigoPrincipal ?? ''} onChange={e => update('codigoPrincipal', e.target.value)} className="w-full" placeholder="SKU/Código..." />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label className="font-semibold">Número de Peça</label>
                            <InputText value={form.numeroPeca ?? ''} onChange={e => update('numeroPeca', e.target.value)} className="w-full" placeholder="Part number..." />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label className="font-semibold">URL</label>
                            <InputText value={form.url ?? ''} onChange={e => update('url', e.target.value)} className="w-full" placeholder="https://..." />
                        </div>

                        <Divider className="col-12 my-2" />

                        {/* Pricing */}
                        <div className="col-12">
                            <h6 className="text-primary font-bold uppercase text-xs mb-3">Preços</h6>
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Custo (R$)</label>
                            <InputText type="number" value={String(form.custo ?? '')} onChange={e => update('custo', Number(e.target.value))} className="w-full" placeholder="0.00" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Custo (USD)</label>
                            <InputText type="number" value={String((form as any).custoDolar ?? '')} onChange={e => update('custoDolar' as any, Number(e.target.value))} className="w-full" placeholder="0.00" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Preço (R$)</label>
                            <InputText type="number" value={String(form.preco ?? '')} onChange={e => update('preco', Number(e.target.value))} className="w-full" placeholder="0.00" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-semibold">Preço (USD)</label>
                            <InputText type="number" value={String((form as any).precoDolar ?? '')} onChange={e => update('precoDolar' as any, Number(e.target.value))} className="w-full" placeholder="0.00" />
                        </div>

                        <Divider className="col-12 my-2" />

                        {/* Description */}
                        <div className="col-12">
                            <h6 className="text-primary font-bold uppercase text-xs mb-3">Descrição</h6>
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold">Descrição</label>
                            <InputTextarea value={(form as any).descricao ?? ''} onChange={e => update('descricao' as any, e.target.value)}
                                rows={4} className="w-full" autoResize placeholder="Descreva o produto ou serviço..." />
                        </div>
                    </div>

                    <Divider />

                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => router.push('/financeiro/produtos')} disabled={saving} />
                        <Button label="Salvar Produto" icon="pi pi-save" className="p-button-success" onClick={handleSave} loading={saving} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NovoProdutoPage;
