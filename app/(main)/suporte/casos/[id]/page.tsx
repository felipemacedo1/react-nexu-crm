'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { CasoService, CasoResponseDTO } from '@/services/caso.service';
import { formatDateTime } from '@/utils/format';

const STATUS_SEVERITY: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
    New: 'info', Assigned: 'secondary', 'In Review': 'warning', 'Pending Input': 'warning', Resolved: 'success', Closed: 'secondary'
};
const PRIORIDADE_SEVERITY: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    Low: 'success', Medium: 'warning', High: 'danger', Urgent: 'danger'
};

const CasoDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const [caso, setCaso] = useState<CasoResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCaso = async () => {
            try {
                const data = await CasoService.buscarPorId(params.id as string);
                setCaso(data);
            } catch {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar caso', life: 5000 });
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchCaso();
    }, [params.id]);

    if (loading) return (
        <div className="flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <ProgressSpinner />
        </div>
    );

    if (!caso) return (
        <div className="card text-center">
            <i className="pi pi-exclamation-circle text-4xl text-500 mb-3" />
            <p className="text-500">Caso não encontrado.</p>
            <Button label="Voltar" icon="pi pi-arrow-left" className="p-button-text" onClick={() => router.push('/suporte/casos')} />
        </div>
    );

    const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
        <div className="field">
            <label className="block text-500 text-sm font-semibold mb-1">{label}</label>
            <p className="m-0 text-900">{value || '-'}</p>
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    {/* Header */}
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div className="flex align-items-center gap-3">
                            <Button icon="pi pi-arrow-left" className="p-button-text p-button-rounded" onClick={() => router.push('/suporte/casos')} />
                            <div>
                                <h4 className="m-0 text-2xl font-bold">{caso.nome}</h4>
                                <span className="text-500 text-sm">Detalhes do caso de suporte</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button label="Editar" icon="pi pi-pencil" severity="warning"
                                onClick={() => router.push(`/suporte/casos/${caso.id}/editar`)} />
                        </div>
                    </div>

                    {/* Status tags */}
                    <div className="flex gap-3 mb-4 flex-wrap">
                        {caso.estado && <Tag value={caso.estado} severity={caso.estado === 'Open' ? 'success' : 'danger'} className="text-sm" />}
                        {caso.status && <Tag value={caso.status} severity={STATUS_SEVERITY[caso.status] ?? 'info'} className="text-sm" />}
                        {caso.prioridade && <Tag value={caso.prioridade} severity={PRIORIDADE_SEVERITY[caso.prioridade] ?? 'info'} className="text-sm" />}
                    </div>

                    <Divider />

                    {/* Info grid */}
                    <div className="grid">
                        <div className="col-12 md:col-6 lg:col-4">
                            <Card className="h-full surface-50 border-none shadow-1">
                                <h6 className="mt-0 mb-3 text-primary font-bold uppercase text-xs letter-spacing-2">Relacionamentos</h6>
                                <InfoField label="Empresa" value={caso.contaNome} />
                                <InfoField label="Criado por (contato)" value={caso.contatoCriadoPorNome} />
                            </Card>
                        </div>
                        <div className="col-12 md:col-6 lg:col-4">
                            <Card className="h-full surface-50 border-none shadow-1">
                                <h6 className="mt-0 mb-3 text-primary font-bold uppercase text-xs letter-spacing-2">Classificação</h6>
                                <InfoField label="Estado" value={caso.estado} />
                                <InfoField label="Status" value={caso.status} />
                                <InfoField label="Prioridade" value={caso.prioridade} />
                            </Card>
                        </div>
                        <div className="col-12 lg:col-4">
                            <Card className="h-full surface-50 border-none shadow-1">
                                <h6 className="mt-0 mb-3 text-primary font-bold uppercase text-xs letter-spacing-2">Resolução</h6>
                                <InfoField label="Resolução" value={caso.resolucao} />
                                <InfoField label="Texto de atualização" value={caso.textoAtualizacao} />
                            </Card>
                        </div>
                    </div>

                    {/* Description */}
                    {caso.descricao && (
                        <>
                            <Divider />
                            <h6 className="text-primary font-bold uppercase text-xs letter-spacing-2">Descrição</h6>
                            <p className="text-900 line-height-3">{caso.descricao}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CasoDetailPage;
