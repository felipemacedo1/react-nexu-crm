'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import { OportunidadeService, OportunidadeDTO } from '@/services/oportunidade.service';
import Link from 'next/link';

const ESTAGIOS = [
    { key: 'Prospecting',         label: 'Prospecção',       color: '#42A5F5', bg: '#E3F2FD' },
    { key: 'Qualification',       label: 'Qualificação',     color: '#66BB6A', bg: '#E8F5E9' },
    { key: 'Proposal',            label: 'Proposta',         color: '#FFA726', bg: '#FFF3E0' },
    { key: 'Negotiation',         label: 'Negociação',       color: '#AB47BC', bg: '#F3E5F5' },
    { key: 'Closed Won',          label: 'Ganho ✓',          color: '#26C6DA', bg: '#E0F7FA' },
    { key: 'Closed Lost',         label: 'Perdido ✗',        color: '#EF5350', bg: '#FFEBEE' },
];

const formatCurrency = (v?: number) =>
    (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const KanbanPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [oportunidades, setOportunidades] = useState<OportunidadeDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);
    const [moving, setMoving] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await OportunidadeService.listarPaginado({ page: 0, size: 200, sort: 'nome', direction: 'asc' });
            setOportunidades(data.content);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar oportunidades', life: 4000 });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const byStage = (stage: string) => oportunidades.filter(o => o.estagio === stage);

    const stageTotal = (stage: string) =>
        byStage(stage).reduce((acc, o) => acc + (o.montante ?? 0), 0);

    // ── Drag & Drop ────────────────────────────────────────────────────────────

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (e: React.DragEvent, stage: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverStage(stage);
    };

    const handleDrop = async (e: React.DragEvent, targetStage: string) => {
        e.preventDefault();
        setDragOverStage(null);
        const id = draggedId ?? e.dataTransfer.getData('text/plain');
        if (!id) return;

        const oport = oportunidades.find(o => o.id === id);
        if (!oport || oport.estagio === targetStage) return;

        setMoving(id);
        // Optimistic update
        setOportunidades(prev => prev.map(o => o.id === id ? { ...o, estagio: targetStage } : o));

        try {
            await OportunidadeService.atualizar(id, { ...oport, estagio: targetStage });
            toast.current?.show({ severity: 'success', summary: 'Movido', detail: `Estágio atualizado para ${ESTAGIOS.find(e => e.key === targetStage)?.label}`, life: 2500 });
        } catch {
            // Rollback
            setOportunidades(prev => prev.map(o => o.id === id ? { ...o, estagio: oport.estagio } : o));
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível mover a oportunidade', life: 4000 });
        } finally {
            setMoving(null);
            setDraggedId(null);
        }
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverStage(null);
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div>
            <Toast ref={toast} />

            {/* Header */}
            <div className="card mb-3">
                <div className="flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="flex align-items-center gap-3">
                        <Button
                            icon="pi pi-arrow-left"
                            rounded text severity="info"
                            onClick={() => router.push('/crm/oportunidades')}
                            tooltip="Voltar para lista"
                            tooltipOptions={{ position: 'top' }}
                        />
                        <div>
                            <h2 className="m-0 text-xl font-semibold">Kanban — Pipeline de Vendas</h2>
                            <span className="text-500 text-sm">{oportunidades.length} oportunidades</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            label="Vista em Lista"
                            icon="pi pi-list"
                            severity="info"
                            outlined
                            size="small"
                            onClick={() => router.push('/crm/oportunidades')}
                        />
                        <Link href="/crm/oportunidades/novo">
                            <Button label="Nova Oportunidade" icon="pi pi-plus" size="small" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-3 overflow-x-auto pb-3" style={{ alignItems: 'flex-start' }}>
                {ESTAGIOS.map(estagio => {
                    const cards = byStage(estagio.key);
                    const total = stageTotal(estagio.key);
                    const isOver = dragOverStage === estagio.key;

                    return (
                        <div
                            key={estagio.key}
                            className="flex-shrink-0"
                            style={{ width: '280px' }}
                            onDragOver={(e) => handleDragOver(e, estagio.key)}
                            onDrop={(e) => handleDrop(e, estagio.key)}
                            onDragLeave={() => setDragOverStage(null)}
                        >
                            {/* Column header */}
                            <div
                                className="border-round-top p-3 flex align-items-center justify-content-between"
                                style={{ backgroundColor: estagio.bg, borderBottom: `3px solid ${estagio.color}` }}
                            >
                                <div className="flex align-items-center gap-2">
                                    <span className="font-bold text-900">{estagio.label}</span>
                                    <Badge value={cards.length} style={{ backgroundColor: estagio.color }} />
                                </div>
                                <span className="text-600 text-sm font-medium">{formatCurrency(total)}</span>
                            </div>

                            {/* Drop zone */}
                            <div
                                className="flex flex-column gap-2 p-2 border-round-bottom"
                                style={{
                                    minHeight: '400px',
                                    backgroundColor: isOver ? `${estagio.bg}` : 'var(--surface-ground)',
                                    border: isOver ? `2px dashed ${estagio.color}` : '2px dashed transparent',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {cards.length === 0 && (
                                    <div className="flex flex-column align-items-center justify-content-center py-4 text-400 text-sm">
                                        <i className="pi pi-inbox text-2xl mb-2" />
                                        <span>Arraste oportunidades aqui</span>
                                    </div>
                                )}

                                {cards.map(op => (
                                    <div
                                        key={op.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, op.id!)}
                                        onDragEnd={handleDragEnd}
                                        className="card p-3 cursor-move border-round shadow-1"
                                        style={{
                                            opacity: draggedId === op.id ? 0.4 : (moving === op.id ? 0.7 : 1),
                                            transition: 'opacity 0.2s ease',
                                            margin: 0
                                        }}
                                    >
                                        <div className="flex justify-content-between align-items-start mb-2">
                                            <span
                                                className="font-semibold text-900 text-sm cursor-pointer hover:text-primary line-height-2"
                                                onClick={() => router.push(`/crm/oportunidades/${op.id}`)}
                                                title={op.nome}
                                                style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                                            >
                                                {op.nome}
                                            </span>
                                            <i className="pi pi-arrows-alt text-300 flex-shrink-0" style={{ fontSize: '0.8rem' }} />
                                        </div>

                                        {op.montante != null && (
                                            <div className="text-primary font-bold text-sm mb-2">
                                                {formatCurrency(op.montante)}
                                            </div>
                                        )}

                                        {op.contaNome && (
                                            <div className="flex align-items-center gap-1 text-500 text-xs mb-1">
                                                <i className="pi pi-building" />
                                                <span className="text-overflow-ellipsis overflow-hidden white-space-nowrap" style={{ maxWidth: '200px' }}>{op.contaNome}</span>
                                            </div>
                                        )}

                                        {op.contatoNome && (
                                            <div className="flex align-items-center gap-1 text-500 text-xs mb-1">
                                                <i className="pi pi-user" />
                                                <span>{op.contatoNome}</span>
                                            </div>
                                        )}

                                        {op.dataFechamento && (
                                            <div className="flex align-items-center gap-1 text-500 text-xs mb-2">
                                                <i className="pi pi-calendar" />
                                                <span>{formatDate(op.dataFechamento)}</span>
                                            </div>
                                        )}

                                        {op.probabilidade != null && (
                                            <div className="flex align-items-center gap-2">
                                                <div className="flex-1 border-round overflow-hidden" style={{ height: '4px', backgroundColor: '#e0e0e0' }}>
                                                    <div
                                                        style={{
                                                            width: `${op.probabilidade}%`,
                                                            height: '100%',
                                                            backgroundColor: op.probabilidade >= 70 ? '#66BB6A' : op.probabilidade >= 40 ? '#FFA726' : '#EF5350',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-500">{op.probabilidade}%</span>
                                            </div>
                                        )}

                                        <div className="flex gap-1 mt-2 justify-content-end">
                                            <Button
                                                icon="pi pi-eye"
                                                text rounded size="small"
                                                tooltip="Ver detalhes"
                                                tooltipOptions={{ position: 'top' }}
                                                onClick={() => router.push(`/crm/oportunidades/${op.id}`)}
                                            />
                                            <Button
                                                icon="pi pi-pencil"
                                                text rounded size="small"
                                                severity="warning"
                                                tooltip="Editar"
                                                tooltipOptions={{ position: 'top' }}
                                                onClick={() => router.push(`/crm/oportunidades/${op.id}/editar`)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanPage;
