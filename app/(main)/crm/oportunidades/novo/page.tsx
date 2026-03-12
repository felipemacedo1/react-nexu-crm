'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete';

import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { OportunidadeService, OportunidadeDTO } from '@/services/oportunidade.service';
import { ContaService, ContaDTO } from '@/services/conta.service';
import { ContatoService, ContatoDTO } from '@/services/contato.service';

const ESTAGIO_OPTIONS = [
    { label: 'Prospecção', value: 'Prospecting' },
    { label: 'Qualificação', value: 'Qualification' },
    { label: 'Proposta', value: 'Proposal' },
    { label: 'Negociação', value: 'Negotiation' },
    { label: 'Fechado - Ganho', value: 'Closed Won' },
    { label: 'Fechado - Perdido', value: 'Closed Lost' }
];

const TIPO_OPTIONS = [
    { label: 'Novo Negócio', value: 'Novo Negócio' },
    { label: 'Renovação', value: 'Renovação' },
    { label: 'Upsell', value: 'Upsell' },
    { label: 'Cross-sell', value: 'Cross-sell' },
    { label: 'Outro', value: 'Outro' }
];

const ORIGEM_OPTIONS = [
    { label: 'Prospecção Ativa', value: 'Prospecção Ativa' },
    { label: 'Indicação', value: 'Indicação' },
    { label: 'Website', value: 'Website' },
    { label: 'Evento', value: 'Evento' },
    { label: 'Parceiro', value: 'Parceiro' },
    { label: 'Outro', value: 'Outro' }
];

const NovaOportunidadePage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [saving, setSaving] = useState(false);
    const [contaSelecionada, setContaSelecionada] = useState<ContaDTO | null>(null);
    const [contaSugestoes, setContaSugestoes] = useState<ContaDTO[]>([]);
    const [contatoSelecionado, setContatoSelecionado] = useState<ContatoDTO | null>(null);
    const [contatoSugestoes, setContatoSugestoes] = useState<ContatoDTO[]>([]);
    const [oportunidade, setOportunidade] = useState<Partial<OportunidadeDTO>>({
        nome: '',
        estagio: 'Prospecting',
        probabilidade: 10,
        tipo: '',
        origem: '',
        descricao: '',
        proximoPasso: '',
        contaId: undefined,
        contatoId: undefined
    });

    const buscarContas = async (event: AutoCompleteCompleteEvent) => {
        try {
            const resultados = await ContaService.buscarPorNome(event.query);
            setContaSugestoes(resultados);
        } catch {
            setContaSugestoes([]);
        }
    };

    const buscarContatos = async (event: AutoCompleteCompleteEvent) => {
        try {
            const resultados = await ContatoService.buscarPorNome(event.query);
            setContatoSugestoes(resultados);
        } catch {
            setContatoSugestoes([]);
        }
    };

    const handleChange = (field: string, value: any) => {
        setOportunidade(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação
        if (!oportunidade.nome?.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'O nome da oportunidade é obrigatório',
                life: 4000
            });
            return;
        }

        setSaving(true);
        try {
            // Limpar campos vazios
            const data: any = { ...oportunidade };
            Object.keys(data).forEach(key => {
                if (data[key] === '' || data[key] === undefined) {
                    delete data[key];
                }
            });

            // Converter data
            if (data.dataFechamento instanceof Date) {
                data.dataFechamento = data.dataFechamento.toISOString().split('T')[0];
            }

            await OportunidadeService.criar(data);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Oportunidade criada com sucesso!',
                life: 3000
            });
            setTimeout(() => router.push('/crm/oportunidades'), 1000);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: error?.response?.data?.message || 'Erro ao criar oportunidade',
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
                    <div className="flex align-items-center gap-3 mb-4">
                        <Button
                            icon="pi pi-arrow-left"
                            rounded
                            text
                            severity="info"
                            onClick={() => router.push('/crm/oportunidades')}
                        />
                        <h2 className="m-0 text-xl font-semibold">Nova Oportunidade</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Informações Principais */}
                        <Divider align="left">
                            <span className="font-semibold text-lg">
                                <i className="pi pi-star mr-2" />
                                Informações Principais
                            </span>
                        </Divider>

                        <div className="grid formgrid p-fluid">
                            <div className="field col-12 md:col-6">
                                <label htmlFor="nome" className="font-medium">
                                    Nome da Oportunidade <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="nome"
                                    value={oportunidade.nome || ''}
                                    onChange={(e) => handleChange('nome', e.target.value)}
                                    placeholder="Nome da oportunidade"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label htmlFor="estagio" className="font-medium">Estágio</label>
                                <Dropdown
                                    id="estagio"
                                    value={oportunidade.estagio}
                                    options={ESTAGIO_OPTIONS}
                                    onChange={(e) => handleChange('estagio', e.value)}
                                    placeholder="Selecione o estágio"
                                    className="mt-1"
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label htmlFor="probabilidade" className="font-medium">Probabilidade (%)</label>
                                <InputNumber
                                    id="probabilidade"
                                    value={oportunidade.probabilidade}
                                    onValueChange={(e) => handleChange('probabilidade', e.value)}
                                    suffix="%"
                                    min={0}
                                    max={100}
                                    className="mt-1"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="montante" className="font-medium">Valor (R$)</label>
                                <InputNumber
                                    id="montante"
                                    value={oportunidade.montante}
                                    onValueChange={(e) => handleChange('montante', e.value)}
                                    mode="currency"
                                    currency="BRL"
                                    locale="pt-BR"
                                    className="mt-1"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="dataFechamento" className="font-medium">Data de Fechamento</label>
                                <Calendar
                                    id="dataFechamento"
                                    value={oportunidade.dataFechamento ? new Date(oportunidade.dataFechamento) : undefined}
                                    onChange={(e) => handleChange('dataFechamento', e.value)}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="mt-1"
                                    placeholder="dd/mm/aaaa"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="tipo" className="font-medium">Tipo</label>
                                <Dropdown
                                    id="tipo"
                                    value={oportunidade.tipo}
                                    options={TIPO_OPTIONS}
                                    onChange={(e) => handleChange('tipo', e.value)}
                                    placeholder="Selecione o tipo"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Origem e Associações */}
                        <Divider align="left">
                            <span className="font-semibold text-lg">
                                <i className="pi pi-link mr-2" />
                                Origem e Associações
                            </span>
                        </Divider>

                        <div className="grid formgrid p-fluid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="origem" className="font-medium">Origem</label>
                                <Dropdown
                                    id="origem"
                                    value={oportunidade.origem}
                                    options={ORIGEM_OPTIONS}
                                    onChange={(e) => handleChange('origem', e.value)}
                                    placeholder="Selecione a origem"
                                    className="mt-1"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="contaId" className="font-medium">Empresa</label>
                                <AutoComplete
                                    id="contaId"
                                    value={contaSelecionada}
                                    suggestions={contaSugestoes}
                                    completeMethod={buscarContas}
                                    field="nome"
                                    onChange={(e) => {
                                        setContaSelecionada(e.value);
                                        if (e.value && typeof e.value === 'object') {
                                            handleChange('contaId', e.value.id);
                                        } else {
                                            handleChange('contaId', undefined);
                                        }
                                    }}
                                    onClear={() => { setContaSelecionada(null); handleChange('contaId', undefined); }}
                                    placeholder="Digite para buscar empresa..."
                                    dropdown
                                    forceSelection
                                    className="w-full mt-1"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="contatoId" className="font-medium">Contato</label>
                                <AutoComplete
                                    id="contatoId"
                                    value={contatoSelecionado}
                                    suggestions={contatoSugestoes}
                                    completeMethod={buscarContatos}
                                    field="nome"
                                    itemTemplate={(item: ContatoDTO) => (
                                        <span>{item.nome} {item.sobrenome || ''}</span>
                                    )}
                                    selectedItemTemplate={(item: ContatoDTO) => (
                                        item ? `${item.nome} ${item.sobrenome || ''}` : ''
                                    )}
                                    onChange={(e) => {
                                        setContatoSelecionado(e.value);
                                        if (e.value && typeof e.value === 'object') {
                                            handleChange('contatoId', e.value.id);
                                        } else {
                                            handleChange('contatoId', undefined);
                                        }
                                    }}
                                    onClear={() => { setContatoSelecionado(null); handleChange('contatoId', undefined); }}
                                    placeholder="Digite para buscar contato..."
                                    dropdown
                                    forceSelection
                                    className="w-full mt-1"
                                />
                            </div>
                        </div>

                        {/* Informações Adicionais */}
                        <Divider align="left">
                            <span className="font-semibold text-lg">
                                <i className="pi pi-info-circle mr-2" />
                                Informações Adicionais
                            </span>
                        </Divider>

                        <div className="grid formgrid p-fluid">
                            <div className="field col-12 md:col-6">
                                <label htmlFor="descricao" className="font-medium">Descrição</label>
                                <InputTextarea
                                    id="descricao"
                                    value={oportunidade.descricao || ''}
                                    onChange={(e) => handleChange('descricao', e.target.value)}
                                    rows={4}
                                    autoResize
                                    className="mt-1"
                                    placeholder="Descreva a oportunidade..."
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="proximoPasso" className="font-medium">Próximo Passo</label>
                                <InputTextarea
                                    id="proximoPasso"
                                    value={oportunidade.proximoPasso || ''}
                                    onChange={(e) => handleChange('proximoPasso', e.target.value)}
                                    rows={4}
                                    autoResize
                                    className="mt-1"
                                    placeholder="Próximas ações a serem tomadas..."
                                />
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex justify-content-end gap-2 mt-4">
                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                outlined
                                severity="info"
                                type="button"
                                onClick={() => router.push('/crm/oportunidades')}
                            />
                            <Button
                                label="Salvar Oportunidade"
                                icon="pi pi-check"
                                severity="success"
                                type="submit"
                                loading={saving}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NovaOportunidadePage;
