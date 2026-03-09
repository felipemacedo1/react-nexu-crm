'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import {
    LigacaoService,
    LigacaoRequestDTO,
    STATUS_ATIVIDADE_OPTIONS,
    DIRECAO_LIGACAO_OPTIONS
} from '@/services/atividade.service';

const ligacaoService = new LigacaoService();

const NovaLigacaoPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<LigacaoRequestDTO>({
        nome: '',
        status: 'Planned',
        direcao: 'Outbound',
        descricao: '',
        duracaoHoras: 0,
        duracaoMinutos: 0
    });

    const update = (field: keyof LigacaoRequestDTO, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!form.nome?.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'O assunto da ligação é obrigatório.',
                life: 4000
            });
            return;
        }
        setSaving(true);
        try {
            await ligacaoService.criar(form);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Ligação registrada com sucesso!',
                life: 3000
            });
            setTimeout(() => router.push('/crm/atividades'), 1500);
        } catch (err: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: err?.response?.data?.message ?? 'Erro ao salvar ligação.',
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
                            onClick={() => router.push('/crm/atividades')}
                            tooltip="Voltar"
                        />
                        <div>
                            <h5 className="m-0 text-xl font-bold">Nova Ligação</h5>
                            <span className="text-500 text-sm">Registre uma nova ligação</span>
                        </div>
                    </div>

                    <Divider />

                    {/* Formulário */}
                    <div className="grid formgrid">

                        {/* Assunto */}
                        <div className="field col-12 md:col-8">
                            <label htmlFor="nome" className="font-semibold">
                                Assunto <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="nome"
                                value={form.nome}
                                onChange={(e) => update('nome', e.target.value)}
                                placeholder="Descreva o assunto da ligação"
                                className="w-full"
                            />
                        </div>

                        {/* Status */}
                        <div className="field col-12 md:col-4">
                            <label htmlFor="status" className="font-semibold">Status</label>
                            <Dropdown
                                id="status"
                                value={form.status}
                                options={STATUS_ATIVIDADE_OPTIONS}
                                onChange={(e) => update('status', e.value)}
                                placeholder="Selecione o status"
                                className="w-full"
                            />
                        </div>

                        {/* Direção */}
                        <div className="field col-12 md:col-4">
                            <label htmlFor="direcao" className="font-semibold">Direção</label>
                            <Dropdown
                                id="direcao"
                                value={form.direcao}
                                options={DIRECAO_LIGACAO_OPTIONS}
                                onChange={(e) => update('direcao', e.value)}
                                placeholder="Entrada / Saída"
                                className="w-full"
                            />
                        </div>

                        {/* Data de Início */}
                        <div className="field col-12 md:col-4">
                            <label htmlFor="dataInicio" className="font-semibold">Data / Hora</label>
                            <Calendar
                                id="dataInicio"
                                value={form.dataInicio ? new Date(form.dataInicio) : null}
                                onChange={(e) =>
                                    update('dataInicio', e.value ? (e.value as Date).toISOString() : undefined)
                                }
                                showTime
                                hourFormat="24"
                                placeholder="Selecione data e hora"
                                className="w-full"
                                dateFormat="dd/mm/yy"
                            />
                        </div>

                        {/* Duração */}
                        <div className="field col-6 md:col-2">
                            <label htmlFor="duracaoHoras" className="font-semibold">Horas</label>
                            <InputNumber
                                id="duracaoHoras"
                                value={form.duracaoHoras ?? 0}
                                onValueChange={(e) => update('duracaoHoras', e.value ?? 0)}
                                min={0}
                                max={23}
                                className="w-full"
                                showButtons
                            />
                        </div>

                        <div className="field col-6 md:col-2">
                            <label htmlFor="duracaoMinutos" className="font-semibold">Minutos</label>
                            <InputNumber
                                id="duracaoMinutos"
                                value={form.duracaoMinutos ?? 0}
                                onValueChange={(e) => update('duracaoMinutos', e.value ?? 0)}
                                min={0}
                                max={59}
                                className="w-full"
                                showButtons
                            />
                        </div>

                        {/* Descrição */}
                        <div className="field col-12">
                            <label htmlFor="descricao" className="font-semibold">Descrição</label>
                            <InputTextarea
                                id="descricao"
                                value={form.descricao ?? ''}
                                onChange={(e) => update('descricao', e.target.value)}
                                rows={4}
                                placeholder="Detalhes sobre a ligação..."
                                className="w-full"
                                autoResize
                            />
                        </div>

                    </div>

                    <Divider />

                    {/* Ações */}
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => router.push('/crm/atividades')}
                            disabled={saving}
                        />
                        <Button
                            label="Salvar Ligação"
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

export default NovaLigacaoPage;
