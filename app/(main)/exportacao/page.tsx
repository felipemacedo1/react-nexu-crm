'use client';
import React, { useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { FileUpload as PrimeFileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import apiClient from '@/services/api.config';

interface ImportacaoLinha {
    linha: number;
    dado: Record<string, unknown>;
    status: 'OK' | 'ERRO';
    mensagem?: string;
}

const ENTIDADES_EXPORT = [
    { label: 'Leads', value: 'lead', icon: 'pi-user-plus', descricao: 'Exportar todos os leads cadastrados' },
    { label: 'Contas', value: 'conta', icon: 'pi-building', descricao: 'Exportar todas as contas/empresas' },
    { label: 'Contatos', value: 'contato', icon: 'pi-users', descricao: 'Exportar todos os contatos' },
    { label: 'Oportunidades', value: 'oportunidade', icon: 'pi-dollar', descricao: 'Exportar pipeline de oportunidades' },
    { label: 'Casos', value: 'caso', icon: 'pi-ticket', descricao: 'Exportar chamados de suporte' },
];

const ENTIDADES_IMPORT = [
    { label: 'Leads', value: 'lead' },
    { label: 'Contas', value: 'conta' },
    { label: 'Contatos', value: 'contato' },
];

export default function ExportacaoImportacaoPage() {
    const toast = useRef<Toast>(null);
    const [exporting, setExporting] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [entidadeImport, setEntidadeImport] = useState<string>('lead');
    const [resultadoImport, setResultadoImport] = useState<ImportacaoLinha[]>([]);
    const [showResultado, setShowResultado] = useState(false);

    // ─── Exportação ────────────────────────────────────────────────
    const exportarCSV = async (entidade: string, label: string) => {
        setExporting(entidade);
        try {
            const { data } = await apiClient.get(`/${entidade}/export/csv`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8;' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `nexocrm_${entidade}_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.current?.show({ severity: 'success', summary: 'Exportado!', detail: `${label} exportados com sucesso.`, life: 3000 });
        } catch {
            // Fallback simulado: exporta um CSV de exemplo
            const csvContent = `id,nome,email,telefone,status\n1,Exemplo,exemplo@email.com,(11) 9000-0000,Novo`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nexocrm_${entidade}_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.current?.show({ severity: 'info', summary: 'CSV gerado', detail: 'Arquivo de exemplo gerado (endpoint ainda não disponível).', life: 4000 });
        } finally {
            setExporting(null);
        }
    };

    const exportarJSON = async (entidade: string, label: string) => {
        setExporting(`${entidade}_json`);
        try {
            const { data } = await apiClient.get(`/${entidade}`, { params: { page: 0, size: 9999 } });
            const lista = Array.isArray(data) ? data : data.content ?? data.data ?? [];
            const json = JSON.stringify(lista, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nexocrm_${entidade}_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.current?.show({ severity: 'success', summary: 'JSON exportado!', detail: `${label} exportados.`, life: 3000 });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível exportar.', life: 3000 });
        } finally {
            setExporting(null);
        }
    };

    // ─── Importação ────────────────────────────────────────────────
    const handleImport = async (e: FileUploadHandlerEvent) => {
        const file = e.files[0];
        if (!file) return;
        setImporting(true);
        setImportProgress(20);

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const text = ev.target?.result as string;
                const linhas = text.split('\n').filter(Boolean);
                const cabecalho = linhas[0].split(',').map(h => h.trim().replace(/"/g, ''));
                setImportProgress(40);

                // Monta preview das linhas com validação básica
                const preview: ImportacaoLinha[] = linhas.slice(1, 11).map((linha, idx) => {
                    const valores = linha.split(',').map(v => v.trim().replace(/"/g, ''));
                    const dado: Record<string, unknown> = {};
                    cabecalho.forEach((h, i) => { dado[h] = valores[i] ?? ''; });
                    const status = cabecalho.includes('nome') && dado['nome'] ? 'OK' : 'ERRO';
                    return {
                        linha: idx + 2,
                        dado,
                        status,
                        mensagem: status === 'ERRO' ? 'Campo "nome" obrigatório' : undefined,
                    };
                });

                setImportProgress(70);

                try {
                    const formData = new FormData();
                    formData.append('arquivo', file);
                    await apiClient.post(`/${entidadeImport}/import/csv`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    toast.current?.show({ severity: 'success', summary: 'Importação concluída!', detail: 'Registros importados com sucesso.', life: 4000 });
                } catch {
                    toast.current?.show({ severity: 'info', summary: 'Pré-visualização', detail: 'Endpoint de importação ainda não disponível — mostrando prévia de validação.', life: 4000 });
                }

                setResultadoImport(preview);
                setShowResultado(true);
            } finally {
                setImportProgress(100);
                setTimeout(() => { setImporting(false); setImportProgress(0); }, 500);
            }
        };
        reader.readAsText(file);
    };

    // ─── Render ────────────────────────────────────────────────────
    const statusBody = (row: ImportacaoLinha) => (
        <Tag value={row.status} severity={row.status === 'OK' ? 'success' : 'danger'} />
    );

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <div className="flex align-items-center gap-2 mb-4">
                    <i className="pi pi-arrows-h text-primary text-2xl" />
                    <div>
                        <h2 className="m-0 text-2xl font-bold">Exportação e Importação</h2>
                        <p className="m-0 text-color-secondary text-sm">Exporte dados em CSV/JSON ou importe registros em massa</p>
                    </div>
                </div>
            </div>

            {/* ─── Exportação ─── */}
            <div className="col-12 lg:col-7">
                <Card title="Exportar Dados" subTitle="Baixe registros nos formatos CSV ou JSON">
                    <div className="grid">
                        {ENTIDADES_EXPORT.map(ent => (
                            <div key={ent.value} className="col-12 md:col-6">
                                <div className="surface-50 border-1 surface-border border-round p-3 flex flex-column gap-2">
                                    <div className="flex align-items-center gap-2">
                                        <i className={`pi ${ent.icon} text-primary text-lg`} />
                                        <span className="font-semibold">{ent.label}</span>
                                    </div>
                                    <p className="text-sm text-color-secondary m-0">{ent.descricao}</p>
                                    <div className="flex gap-2 mt-1">
                                        <Button
                                            label="CSV"
                                            icon="pi pi-file"
                                            className="p-button-outlined p-button-sm flex-1"
                                            loading={exporting === ent.value}
                                            onClick={() => exportarCSV(ent.value, ent.label)}
                                        />
                                        <Button
                                            label="JSON"
                                            icon="pi pi-code"
                                            className="p-button-outlined p-button-secondary p-button-sm flex-1"
                                            loading={exporting === `${ent.value}_json`}
                                            onClick={() => exportarJSON(ent.value, ent.label)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ─── Importação ─── */}
            <div className="col-12 lg:col-5">
                <Card title="Importar Dados" subTitle="Carregue um arquivo CSV para importação em massa">
                    <div className="flex flex-column gap-3">
                        <div>
                            <label className="text-sm font-semibold block mb-1">Entidade de destino</label>
                            <Dropdown
                                value={entidadeImport}
                                options={ENTIDADES_IMPORT}
                                onChange={e => setEntidadeImport(e.value)}
                                className="w-full"
                            />
                        </div>

                        <Divider />

                        <div className="surface-50 border-1 surface-border border-round p-3">
                            <p className="text-sm font-semibold mb-1">Formato esperado do CSV:</p>
                            <code className="text-xs text-color-secondary" style={{ whiteSpace: 'pre-line' }}>
                                {`nome,email,telefone,status\n"João Silva","joao@mail.com","11999990000","Novo"`}
                            </code>
                        </div>

                        {importing && <ProgressBar value={importProgress} style={{ height: '6px' }} />}

                        <PrimeFileUpload
                            mode="basic"
                            accept=".csv"
                            maxFileSize={10 * 1024 * 1024}
                            customUpload
                            uploadHandler={handleImport}
                            auto
                            chooseLabel="Selecionar CSV"
                            uploadLabel="Importar"
                            disabled={importing}
                            className="w-full"
                        />

                        <Button
                            label="Ver modelo CSV de exemplo"
                            icon="pi pi-download"
                            className="p-button-text p-button-sm"
                            onClick={() => {
                                const csv = `nome,email,telefone,status\n"João Silva","joao@mail.com","11999990000","Novo"\n"Maria Souza","maria@mail.com","11888880000","Qualificado"`;
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `modelo_${entidadeImport}.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                        />
                    </div>
                </Card>
            </div>

            {/* ─── Dialog resultado importação ─── */}
            <Dialog
                header="Resultado da Importação"
                visible={showResultado}
                onHide={() => setShowResultado(false)}
                style={{ width: '760px' }}
                maximizable
            >
                <p className="text-sm text-color-secondary mb-3">
                    Pré-visualização das primeiras linhas processadas:
                </p>
                <DataTable value={resultadoImport} size="small" scrollable scrollHeight="320px">
                    <Column field="linha" header="Linha" style={{ width: '60px' }} />
                    <Column
                        header="Nome"
                        body={(row: ImportacaoLinha) => String(row.dado['nome'] ?? '—')}
                    />
                    <Column
                        header="Email"
                        body={(row: ImportacaoLinha) => String(row.dado['email'] ?? '—')}
                    />
                    <Column header="Status" body={statusBody} style={{ width: '90px' }} />
                    <Column field="mensagem" header="Observação" />
                </DataTable>
            </Dialog>
        </div>
    );
}
