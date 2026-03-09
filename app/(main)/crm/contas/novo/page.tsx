'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import { ContaService, ContaDTO } from '@/services/conta.service';

const CONTA_TIPO_OPTIONS = [
    { label: 'Cliente', value: 'Cliente' },
    { label: 'Parceiro', value: 'Parceiro' },
    { label: 'Prospect', value: 'Prospect' },
    { label: 'Fornecedor', value: 'Fornecedor' },
    { label: 'Outro', value: 'Outro' }
];

const CONTA_SETOR_OPTIONS = [
    { label: 'Tecnologia', value: 'Tecnologia' },
    { label: 'Saúde', value: 'Saúde' },
    { label: 'Educação', value: 'Educação' },
    { label: 'Financeiro', value: 'Financeiro' },
    { label: 'Varejo', value: 'Varejo' },
    { label: 'Indústria', value: 'Indústria' },
    { label: 'Serviços', value: 'Serviços' },
    { label: 'Governo', value: 'Governo' },
    { label: 'Telecomunicações', value: 'Telecomunicações' },
    { label: 'Outro', value: 'Outro' }
];

const CONTA_CLASSIFICACAO_OPTIONS = [
    { label: 'Quente', value: 'Hot' },
    { label: 'Morno', value: 'Warm' },
    { label: 'Frio', value: 'Cold' }
];

const NovaContaPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState<Partial<ContaDTO>>({
        nome: '',
        site: '',
        tipo: '',
        setor: '',
        telefoneEscritorio: '',
        email: '',
        classificacao: '',
        faturamentoAnual: undefined,
        funcionarios: undefined,
        descricao: '',
        enderecoCobranca: '',
        cidadeCobranca: '',
        estadoCobranca: '',
        cepCobranca: '',
        paisCobranca: 'Brasil',
        enderecoEntrega: '',
        cidadeEntrega: '',
        estadoEntrega: '',
        cepEntrega: '',
        paisEntrega: 'Brasil'
    });

    const updateField = (field: keyof ContaDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isValidEmail = (email: string) => {
        if (!email) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isFormValid = () => {
        if (!formData.nome?.trim()) return false;
        if (formData.email && !isValidEmail(formData.email)) return false;
        return true;
    };

    const handleSave = async () => {
        setSubmitted(true);
        if (!isFormValid()) return;

        setSaving(true);
        try {
            const payload: Partial<ContaDTO> = { ...formData };

            // Limpar campos vazios
            Object.keys(payload).forEach(key => {
                const k = key as keyof ContaDTO;
                if (payload[k] === '' || payload[k] === undefined) {
                    delete payload[k];
                }
            });

            await ContaService.criar(payload as ContaDTO);

            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Empresa criada com sucesso!',
                life: 3000
            });

            setTimeout(() => router.push('/crm/contas'), 1000);
        } catch (error: any) {
            const detail = error?.response?.data?.message || 'Erro ao criar empresa';
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail,
                life: 5000
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />

                <div className="card">
                    {/* Header */}
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div className="flex align-items-center gap-3">
                            <Button
                                icon="pi pi-arrow-left"
                                rounded
                                text
                                severity="secondary"
                                onClick={() => router.push('/crm/contas')}
                            />
                            <h2 className="m-0 text-xl font-semibold">Nova Empresa</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                outlined
                                severity="secondary"
                                onClick={() => router.push('/crm/contas')}
                            />
                            <Button
                                label="Salvar"
                                icon="pi pi-check"
                                severity="success"
                                loading={saving}
                                onClick={handleSave}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Informações Principais */}
                    <h3 className="text-lg font-semibold mb-3">
                        <i className="pi pi-building mr-2" />
                        Informações da Empresa
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="nome" className="font-medium">
                                Nome <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="nome"
                                value={formData.nome || ''}
                                onChange={(e) => updateField('nome', e.target.value)}
                                className={classNames({ 'p-invalid': submitted && !formData.nome?.trim() })}
                                placeholder="Nome da empresa"
                            />
                            {submitted && !formData.nome?.trim() && (
                                <small className="p-error">Nome é obrigatório.</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="site" className="font-medium">Website</label>
                            <InputText
                                id="site"
                                value={formData.site || ''}
                                onChange={(e) => updateField('site', e.target.value)}
                                placeholder="https://www.exemplo.com"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="tipo" className="font-medium">Tipo</label>
                            <Dropdown
                                id="tipo"
                                value={formData.tipo || null}
                                options={CONTA_TIPO_OPTIONS}
                                onChange={(e) => updateField('tipo', e.value)}
                                placeholder="Selecionar tipo"
                                showClear
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="setor" className="font-medium">Setor</label>
                            <Dropdown
                                id="setor"
                                value={formData.setor || null}
                                options={CONTA_SETOR_OPTIONS}
                                onChange={(e) => updateField('setor', e.value)}
                                placeholder="Selecionar setor"
                                showClear
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="classificacao" className="font-medium">Classificação</label>
                            <Dropdown
                                id="classificacao"
                                value={formData.classificacao || null}
                                options={CONTA_CLASSIFICACAO_OPTIONS}
                                onChange={(e) => updateField('classificacao', e.value)}
                                placeholder="Selecionar classificação"
                                showClear
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="faturamentoAnual" className="font-medium">Faturamento Anual</label>
                            <InputNumber
                                id="faturamentoAnual"
                                value={formData.faturamentoAnual || null}
                                onValueChange={(e) => updateField('faturamentoAnual', e.value)}
                                mode="currency"
                                currency="BRL"
                                locale="pt-BR"
                                placeholder="R$ 0,00"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="funcionarios" className="font-medium">Nº de Funcionários</label>
                            <InputNumber
                                id="funcionarios"
                                value={formData.funcionarios || null}
                                onValueChange={(e) => updateField('funcionarios', e.value)}
                                placeholder="0"
                            />
                        </div>

                        <div className="field col-12">
                            <label htmlFor="descricao" className="font-medium">Descrição</label>
                            <InputTextarea
                                id="descricao"
                                value={formData.descricao || ''}
                                onChange={(e) => updateField('descricao', e.target.value)}
                                rows={3}
                                placeholder="Descrição da conta"
                                autoResize
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Contato */}
                    <h3 className="text-lg font-semibold mb-3">
                        <i className="pi pi-phone mr-2" />
                        Informações de Contato
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="telefoneEscritorio" className="font-medium">Telefone</label>
                            <InputText
                                id="telefoneEscritorio"
                                value={formData.telefoneEscritorio || ''}
                                onChange={(e) => updateField('telefoneEscritorio', e.target.value)}
                                placeholder="(11) 1234-5678"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="email" className="font-medium">Email</label>
                            <InputText
                                id="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => updateField('email', e.target.value)}
                                className={classNames({
                                    'p-invalid': submitted && formData.email && !isValidEmail(formData.email)
                                })}
                                placeholder="email@empresa.com"
                            />
                            {submitted && formData.email && !isValidEmail(formData.email) && (
                                <small className="p-error">Email inválido.</small>
                            )}
                        </div>
                    </div>

                    <Divider />

                    {/* Endereço de Cobrança */}
                    <h3 className="text-lg font-semibold mb-3">
                        <i className="pi pi-map-marker mr-2" />
                        Endereço de Cobrança
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12">
                            <label htmlFor="enderecoCobranca" className="font-medium">Endereço</label>
                            <InputText
                                id="enderecoCobranca"
                                value={formData.enderecoCobranca || ''}
                                onChange={(e) => updateField('enderecoCobranca', e.target.value)}
                                placeholder="Rua, número, complemento"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="cidadeCobranca" className="font-medium">Cidade</label>
                            <InputText
                                id="cidadeCobranca"
                                value={formData.cidadeCobranca || ''}
                                onChange={(e) => updateField('cidadeCobranca', e.target.value)}
                                placeholder="Cidade"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="estadoCobranca" className="font-medium">Estado</label>
                            <InputText
                                id="estadoCobranca"
                                value={formData.estadoCobranca || ''}
                                onChange={(e) => updateField('estadoCobranca', e.target.value)}
                                placeholder="Estado"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="cepCobranca" className="font-medium">CEP</label>
                            <InputText
                                id="cepCobranca"
                                value={formData.cepCobranca || ''}
                                onChange={(e) => updateField('cepCobranca', e.target.value)}
                                placeholder="00000-000"
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Endereço de Entrega */}
                    <h3 className="text-lg font-semibold mb-3">
                        <i className="pi pi-send mr-2" />
                        Endereço de Entrega
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12">
                            <label htmlFor="enderecoEntrega" className="font-medium">Endereço</label>
                            <InputText
                                id="enderecoEntrega"
                                value={formData.enderecoEntrega || ''}
                                onChange={(e) => updateField('enderecoEntrega', e.target.value)}
                                placeholder="Rua, número, complemento"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="cidadeEntrega" className="font-medium">Cidade</label>
                            <InputText
                                id="cidadeEntrega"
                                value={formData.cidadeEntrega || ''}
                                onChange={(e) => updateField('cidadeEntrega', e.target.value)}
                                placeholder="Cidade"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="estadoEntrega" className="font-medium">Estado</label>
                            <InputText
                                id="estadoEntrega"
                                value={formData.estadoEntrega || ''}
                                onChange={(e) => updateField('estadoEntrega', e.target.value)}
                                placeholder="Estado"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="cepEntrega" className="font-medium">CEP</label>
                            <InputText
                                id="cepEntrega"
                                value={formData.cepEntrega || ''}
                                onChange={(e) => updateField('cepEntrega', e.target.value)}
                                placeholder="00000-000"
                            />
                        </div>
                    </div>

                    {/* Footer actions */}
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            outlined
                            severity="secondary"
                            onClick={() => router.push('/crm/contas')}
                        />
                        <Button
                            label="Salvar"
                            icon="pi pi-check"
                            severity="success"
                            loading={saving}
                            onClick={handleSave}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NovaContaPage;
