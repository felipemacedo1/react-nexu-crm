'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';

interface SistemaConfig {
    nomeSistema: string;
    urlBase: string;
    emailSuporte: string;
    telefoneContato: string;
    fusoHorario: string;
    idioma: string;
    moedaPadrao: string;
    limiteArquivoMB: number;
}

interface EmailConfig {
    smtpHost: string;
    smtpPorta: number;
    smtpUsuario: string;
    smtpSenha: string;
    smtpSsl: boolean;
    emailRemetente: string;
    nomeRemetente: string;
}

interface IntegracaoConfig {
    webhookAtivo: boolean;
    webhookUrl: string;
    webhookSecret: string;
    apiRateLimit: number;
    oauthAtivo: boolean;
}

const FUSO_OPTIONS = [
    { label: 'América/São Paulo (UTC-3)', value: 'America/Sao_Paulo' },
    { label: 'América/Fortaleza (UTC-3)', value: 'America/Fortaleza' },
    { label: 'América/Manaus (UTC-4)', value: 'America/Manaus' },
    { label: 'UTC', value: 'UTC' }
];

const IDIOMA_OPTIONS = [
    { label: 'Português (BR)', value: 'pt-BR' },
    { label: 'English', value: 'en-US' },
    { label: 'Español', value: 'es-ES' }
];

const MOEDA_OPTIONS = [
    { label: 'BRL — Real Brasileiro', value: 'BRL' },
    { label: 'USD — Dólar Americano', value: 'USD' },
    { label: 'EUR — Euro', value: 'EUR' }
];

const ConfiguracoesPage = () => {
    const toast = useRef<Toast>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [saving, setSaving] = useState(false);

    const [sistema, setSistema] = useState<SistemaConfig>({
        nomeSistema: 'NexoCRM',
        urlBase: 'http://localhost:3000',
        emailSuporte: 'suporte@nexocrm.com.br',
        telefoneContato: '',
        fusoHorario: 'America/Sao_Paulo',
        idioma: 'pt-BR',
        moedaPadrao: 'BRL',
        limiteArquivoMB: 10
    });

    const [email, setEmail] = useState<EmailConfig>({
        smtpHost: '',
        smtpPorta: 587,
        smtpUsuario: '',
        smtpSenha: '',
        smtpSsl: true,
        emailRemetente: '',
        nomeRemetente: 'NexoCRM'
    });

    const [integracao, setIntegracao] = useState<IntegracaoConfig>({
        webhookAtivo: false,
        webhookUrl: '',
        webhookSecret: '',
        apiRateLimit: 100,
        oauthAtivo: false
    });

    const updateSistema = (field: keyof SistemaConfig, value: any) =>
        setSistema(prev => ({ ...prev, [field]: value }));

    const updateEmail = (field: keyof EmailConfig, value: any) =>
        setEmail(prev => ({ ...prev, [field]: value }));

    const updateIntegracao = (field: keyof IntegracaoConfig, value: any) =>
        setIntegracao(prev => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            // Simulated save — connect to backend settings endpoint when available
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.current?.show({ severity: 'success', summary: 'Salvo', detail: 'Configurações salvas com sucesso!', life: 3000 });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar configurações.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));
            toast.current?.show({ severity: 'success', summary: 'Email enviado', detail: 'Email de teste enviado com sucesso!', life: 3000 });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao enviar email de teste.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div className="flex align-items-center gap-3">
                            <i className="pi pi-cog text-2xl text-primary" />
                            <div>
                                <h4 className="m-0 text-2xl font-bold">Configurações do Sistema</h4>
                                <span className="text-500 text-sm">Gerencie as configurações globais do NexoCRM</span>
                            </div>
                        </div>
                        <Button label="Salvar Configurações" icon="pi pi-save" className="p-button-success" onClick={handleSave} loading={saving} />
                    </div>

                    <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>

                        {/* ── Tab 1: Geral ── */}
                        <TabPanel header="Geral" leftIcon="pi pi-sliders-h mr-2">
                            <div className="grid formgrid mt-2">
                                <div className="col-12">
                                    <h6 className="text-primary font-bold uppercase text-xs mb-3">Identificação</h6>
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold">Nome do Sistema</label>
                                    <InputText value={sistema.nomeSistema} onChange={e => updateSistema('nomeSistema', e.target.value)} className="w-full" />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold">URL Base</label>
                                    <InputText value={sistema.urlBase} onChange={e => updateSistema('urlBase', e.target.value)} className="w-full" placeholder="https://..." />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold">Email de Suporte</label>
                                    <InputText value={sistema.emailSuporte} onChange={e => updateSistema('emailSuporte', e.target.value)} className="w-full" />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold">Telefone de Contato</label>
                                    <InputText value={sistema.telefoneContato} onChange={e => updateSistema('telefoneContato', e.target.value)} className="w-full" placeholder="(11) 99999-9999" />
                                </div>

                                <Divider className="col-12 my-2" />
                                <div className="col-12">
                                    <h6 className="text-primary font-bold uppercase text-xs mb-3">Localização</h6>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Fuso Horário</label>
                                    <Dropdown value={sistema.fusoHorario} options={FUSO_OPTIONS} onChange={e => updateSistema('fusoHorario', e.value)} className="w-full" />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Idioma Padrão</label>
                                    <Dropdown value={sistema.idioma} options={IDIOMA_OPTIONS} onChange={e => updateSistema('idioma', e.value)} className="w-full" />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Moeda Padrão</label>
                                    <Dropdown value={sistema.moedaPadrao} options={MOEDA_OPTIONS} onChange={e => updateSistema('moedaPadrao', e.value)} className="w-full" />
                                </div>

                                <Divider className="col-12 my-2" />
                                <div className="col-12">
                                    <h6 className="text-primary font-bold uppercase text-xs mb-3">Armazenamento</h6>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Limite de Arquivo (MB)</label>
                                    <InputText type="number" value={String(sistema.limiteArquivoMB)} onChange={e => updateSistema('limiteArquivoMB', Number(e.target.value))} className="w-full" />
                                </div>
                            </div>
                        </TabPanel>

                        {/* ── Tab 2: Email ── */}
                        <TabPanel header="Email" leftIcon="pi pi-envelope mr-2">
                            <div className="grid formgrid mt-2">
                                <div className="col-12">
                                    <h6 className="text-primary font-bold uppercase text-xs mb-3">Servidor SMTP</h6>
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold">Host SMTP</label>
                                    <InputText value={email.smtpHost} onChange={e => updateEmail('smtpHost', e.target.value)} className="w-full" placeholder="smtp.gmail.com" />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label className="font-semibold">Porta</label>
                                    <InputText type="number" value={String(email.smtpPorta)} onChange={e => updateEmail('smtpPorta', Number(e.target.value))} className="w-full" />
                                </div>
                                <div className="field col-12 md:col-3 flex flex-column justify-content-end">
                                    <label className="font-semibold">SSL/TLS</label>
                                    <div className="mt-2">
                                        <InputSwitch checked={email.smtpSsl} onChange={e => updateEmail('smtpSsl', e.value)} />
                                        <span className="ml-2 text-sm">{email.smtpSsl ? 'Ativo' : 'Inativo'}</span>
                                    </div>
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold">Usuário SMTP</label>
                                    <InputText value={email.smtpUsuario} onChange={e => updateEmail('smtpUsuario', e.target.value)} className="w-full" placeholder="usuario@email.com" />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold">Senha SMTP</label>
                                    <InputText type="password" value={email.smtpSenha} onChange={e => updateEmail('smtpSenha', e.target.value)} className="w-full" placeholder="••••••••" />
                                </div>

                                <Divider className="col-12 my-2" />
                                <div className="col-12">
                                    <h6 className="text-primary font-bold uppercase text-xs mb-3">Remetente Padrão</h6>
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold">Email Remetente</label>
                                    <InputText value={email.emailRemetente} onChange={e => updateEmail('emailRemetente', e.target.value)} className="w-full" placeholder="noreply@nexocrm.com.br" />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold">Nome Remetente</label>
                                    <InputText value={email.nomeRemetente} onChange={e => updateEmail('nomeRemetente', e.target.value)} className="w-full" placeholder="NexoCRM" />
                                </div>
                                <div className="col-12 mt-2">
                                    <Button label="Enviar Email de Teste" icon="pi pi-send" className="p-button-outlined" onClick={handleTestEmail} loading={saving} />
                                </div>
                            </div>
                        </TabPanel>

                        {/* ── Tab 3: Integração ── */}
                        <TabPanel header="Integração" leftIcon="pi pi-link mr-2">
                            <div className="grid formgrid mt-2">
                                <div className="col-12">
                                    <h6 className="text-primary font-bold uppercase text-xs mb-3">Webhooks</h6>
                                </div>
                                <div className="field col-12 flex align-items-center gap-3">
                                    <InputSwitch checked={integracao.webhookAtivo} onChange={e => updateIntegracao('webhookAtivo', e.value)} />
                                    <label className="font-semibold">Webhooks ativos</label>
                                </div>
                                {integracao.webhookAtivo && (
                                    <>
                                        <div className="field col-12 md:col-8">
                                            <label className="font-semibold">URL do Webhook</label>
                                            <InputText value={integracao.webhookUrl} onChange={e => updateIntegracao('webhookUrl', e.target.value)} className="w-full" placeholder="https://..." />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold">Secret</label>
                                            <InputText value={integracao.webhookSecret} onChange={e => updateIntegracao('webhookSecret', e.target.value)} className="w-full" placeholder="seu-secret..." />
                                        </div>
                                    </>
                                )}

                                <Divider className="col-12 my-2" />
                                <div className="col-12">
                                    <h6 className="text-primary font-bold uppercase text-xs mb-3">API</h6>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Rate Limit (req/min)</label>
                                    <InputText type="number" value={String(integracao.apiRateLimit)} onChange={e => updateIntegracao('apiRateLimit', Number(e.target.value))} className="w-full" />
                                </div>
                                <div className="field col-12 flex align-items-center gap-3 mt-2">
                                    <InputSwitch checked={integracao.oauthAtivo} onChange={e => updateIntegracao('oauthAtivo', e.value)} />
                                    <label className="font-semibold">OAuth externo ativo</label>
                                </div>
                            </div>
                        </TabPanel>

                        {/* ── Tab 4: Backup ── */}
                        <TabPanel header="Backup" leftIcon="pi pi-database mr-2">
                            <div className="grid mt-2">
                                <div className="col-12 md:col-6 lg:col-4">
                                    <Card className="surface-50 border-none shadow-1 text-center">
                                        <i className="pi pi-download text-3xl text-primary mb-3" />
                                        <h6 className="font-bold mb-2">Exportar Dados</h6>
                                        <p className="text-500 text-sm mb-3">Baixe todos os dados do sistema em formato JSON ou CSV</p>
                                        <div className="flex gap-2 justify-content-center">
                                            <Button label="JSON" icon="pi pi-download" size="small" className="p-button-outlined" />
                                            <Button label="CSV" icon="pi pi-download" size="small" className="p-button-outlined" />
                                        </div>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6 lg:col-4">
                                    <Card className="surface-50 border-none shadow-1 text-center">
                                        <i className="pi pi-upload text-3xl text-warning mb-3" />
                                        <h6 className="font-bold mb-2">Importar Dados</h6>
                                        <p className="text-500 text-sm mb-3">Restaure dados a partir de um arquivo de backup</p>
                                        <Button label="Selecionar arquivo" icon="pi pi-upload" size="small" className="p-button-warning p-button-outlined" />
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6 lg:col-4">
                                    <Card className="surface-50 border-none shadow-1 text-center">
                                        <i className="pi pi-history text-3xl text-green-500 mb-3" />
                                        <h6 className="font-bold mb-2">Backup Automático</h6>
                                        <p className="text-500 text-sm mb-3">Configure backups automáticos agendados</p>
                                        <Tag value="Em breve" severity="secondary" />
                                    </Card>
                                </div>
                            </div>
                        </TabPanel>

                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracoesPage;
