'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import { LeadService, LeadRequestDTO, LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '@/services/lead.service';

const NovoLeadPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState<LeadRequestDTO>({
        nome: '',
        descricao: '',
        status: 'New',
        origemLead: '',
        nomeConta: '',
        departamento: '',
        webParaLeadEmail1: '',
        webParaLeadEmail2: '',
        website: '',
        indicadoPor: '',
        dataNascimento: '',
        descricaoOrigemLead: '',
        descricaoConta: '',
        campanhaId: ''
    });

    const updateField = (field: keyof LeadRequestDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isValidEmail = (email: string) => {
        if (!email) return true; // Campo não obrigatório
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isFormValid = () => {
        if (!formData.nome.trim()) return false;
        if (formData.webParaLeadEmail1 && !isValidEmail(formData.webParaLeadEmail1)) return false;
        if (formData.webParaLeadEmail2 && !isValidEmail(formData.webParaLeadEmail2)) return false;
        return true;
    };

    const handleSave = async () => {
        setSubmitted(true);
        if (!isFormValid()) return;

        setSaving(true);
        try {
            const payload: LeadRequestDTO = {
                ...formData,
                dataNascimento: formData.dataNascimento
                    ? new Date(formData.dataNascimento).toISOString().split('T')[0]
                    : undefined
            };

            // Limpar campos vazios
            Object.keys(payload).forEach(key => {
                const k = key as keyof LeadRequestDTO;
                if (payload[k] === '' || payload[k] === undefined) {
                    delete payload[k];
                }
            });

            await LeadService.criar(payload);

            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Lead criado com sucesso!',
                life: 3000
            });

            setTimeout(() => router.push('/crm/leads'), 1000);
        } catch (error: any) {
            const detail = error?.response?.data?.message || 'Erro ao criar lead';
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
                                onClick={() => router.push('/crm/leads')}
                            />
                            <h2 className="m-0 text-xl font-semibold">Novo Lead</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                outlined
                                severity="secondary"
                                onClick={() => router.push('/crm/leads')}
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
                        <i className="pi pi-user mr-2" />
                        Informações Principais
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="nome" className="font-medium">
                                Nome <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => updateField('nome', e.target.value)}
                                className={classNames({ 'p-invalid': submitted && !formData.nome.trim() })}
                                placeholder="Nome do lead"
                            />
                            {submitted && !formData.nome.trim() && (
                                <small className="p-error">Nome é obrigatório.</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="nomeConta" className="font-medium">Empresa</label>
                            <InputText
                                id="nomeConta"
                                value={formData.nomeConta || ''}
                                onChange={(e) => updateField('nomeConta', e.target.value)}
                                placeholder="Nome da empresa"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="status" className="font-medium">Status</label>
                            <Dropdown
                                id="status"
                                value={formData.status}
                                options={LEAD_STATUS_OPTIONS}
                                onChange={(e) => updateField('status', e.value)}
                                placeholder="Selecionar status"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="origemLead" className="font-medium">Origem</label>
                            <Dropdown
                                id="origemLead"
                                value={formData.origemLead || null}
                                options={LEAD_SOURCE_OPTIONS}
                                onChange={(e) => updateField('origemLead', e.value)}
                                placeholder="Selecionar origem"
                                showClear
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="departamento" className="font-medium">Departamento</label>
                            <InputText
                                id="departamento"
                                value={formData.departamento || ''}
                                onChange={(e) => updateField('departamento', e.target.value)}
                                placeholder="Departamento"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="indicadoPor" className="font-medium">Indicado Por</label>
                            <InputText
                                id="indicadoPor"
                                value={formData.indicadoPor || ''}
                                onChange={(e) => updateField('indicadoPor', e.target.value)}
                                placeholder="Quem indicou"
                            />
                        </div>

                        <div className="field col-12">
                            <label htmlFor="descricao" className="font-medium">Descrição</label>
                            <InputTextarea
                                id="descricao"
                                value={formData.descricao || ''}
                                onChange={(e) => updateField('descricao', e.target.value)}
                                rows={3}
                                placeholder="Descrição do lead"
                                autoResize
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Contato */}
                    <h3 className="text-lg font-semibold mb-3">
                        <i className="pi pi-envelope mr-2" />
                        Informações de Contato
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="webParaLeadEmail1" className="font-medium">Email Principal</label>
                            <InputText
                                id="webParaLeadEmail1"
                                type="email"
                                value={formData.webParaLeadEmail1 || ''}
                                onChange={(e) => updateField('webParaLeadEmail1', e.target.value)}
                                className={classNames({
                                    'p-invalid': submitted && formData.webParaLeadEmail1 && !isValidEmail(formData.webParaLeadEmail1)
                                })}
                                placeholder="email@exemplo.com"
                            />
                            {submitted && formData.webParaLeadEmail1 && !isValidEmail(formData.webParaLeadEmail1) && (
                                <small className="p-error">Email inválido.</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="webParaLeadEmail2" className="font-medium">Email Secundário</label>
                            <InputText
                                id="webParaLeadEmail2"
                                type="email"
                                value={formData.webParaLeadEmail2 || ''}
                                onChange={(e) => updateField('webParaLeadEmail2', e.target.value)}
                                className={classNames({
                                    'p-invalid': submitted && formData.webParaLeadEmail2 && !isValidEmail(formData.webParaLeadEmail2)
                                })}
                                placeholder="email@exemplo.com"
                            />
                            {submitted && formData.webParaLeadEmail2 && !isValidEmail(formData.webParaLeadEmail2) && (
                                <small className="p-error">Email inválido.</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="website" className="font-medium">Website</label>
                            <InputText
                                id="website"
                                value={formData.website || ''}
                                onChange={(e) => updateField('website', e.target.value)}
                                placeholder="https://www.exemplo.com"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="dataNascimento" className="font-medium">Data de Nascimento</label>
                            <Calendar
                                id="dataNascimento"
                                value={formData.dataNascimento ? new Date(formData.dataNascimento) : null}
                                onChange={(e) => updateField('dataNascimento', e.value?.toISOString() || '')}
                                dateFormat="dd/mm/yy"
                                showIcon
                                placeholder="Selecionar data"
                                maxDate={new Date()}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Informações Adicionais */}
                    <h3 className="text-lg font-semibold mb-3">
                        <i className="pi pi-info-circle mr-2" />
                        Informações Adicionais
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="descricaoOrigemLead" className="font-medium">Descrição da Origem</label>
                            <InputTextarea
                                id="descricaoOrigemLead"
                                value={formData.descricaoOrigemLead || ''}
                                onChange={(e) => updateField('descricaoOrigemLead', e.target.value)}
                                rows={2}
                                placeholder="Detalhes sobre a origem do lead"
                                autoResize
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="descricaoConta" className="font-medium">Descrição da Empresa</label>
                            <InputTextarea
                                id="descricaoConta"
                                value={formData.descricaoConta || ''}
                                onChange={(e) => updateField('descricaoConta', e.target.value)}
                                rows={2}
                                placeholder="Informações sobre a empresa"
                                autoResize
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
                            onClick={() => router.push('/crm/leads')}
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

export default NovoLeadPage;
