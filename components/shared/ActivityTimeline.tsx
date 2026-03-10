'use client';
import React from 'react';
import { Timeline } from 'primereact/timeline';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

export interface TimelineEvent {
    id?: string;
    titulo: string;
    descricao?: string;
    data?: string;
    tipo?: 'criacao' | 'atualizacao' | 'chamada' | 'email' | 'reuniao' | 'tarefa' | 'nota' | 'conversao' | 'sistema';
    usuario?: string;
    extra?: React.ReactNode;
}

const TIPO_CONFIG: Record<NonNullable<TimelineEvent['tipo']>, { icon: string; color: string; severity?: any }> = {
    criacao:    { icon: 'pi-plus-circle',      color: '#22C55E', severity: 'success' },
    atualizacao:{ icon: 'pi-pencil',           color: '#F59E0B', severity: 'warning' },
    chamada:    { icon: 'pi-phone',            color: '#3B82F6', severity: 'info'    },
    email:      { icon: 'pi-envelope',         color: '#8B5CF6', severity: undefined },
    reuniao:    { icon: 'pi-users',            color: '#0EA5E9', severity: 'info'    },
    tarefa:     { icon: 'pi-check-circle',     color: '#10B981', severity: 'success' },
    nota:       { icon: 'pi-file',             color: '#64748B', severity: 'secondary'},
    conversao:  { icon: 'pi-sync',             color: '#F97316', severity: 'warning' },
    sistema:    { icon: 'pi-cog',              color: '#94A3B8', severity: 'secondary'},
};

export interface ActivityTimelineProps {
    events: TimelineEvent[];
    emptyMessage?: string;
    /** Show "Adicionar nota" button */
    onAddNote?: () => void;
    className?: string;
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
    events,
    emptyMessage = 'Nenhuma atividade registrada.',
    onAddNote,
    className,
}) => {
    if (events.length === 0) {
        return (
            <div className={`flex flex-column align-items-center justify-content-center py-6 text-center ${className ?? ''}`}>
                <i className="pi pi-clock text-5xl text-300 mb-3" />
                <p className="text-600 mb-3">{emptyMessage}</p>
                {onAddNote && (
                    <Button label="Adicionar nota" icon="pi pi-plus" outlined size="small" onClick={onAddNote} />
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {onAddNote && (
                <div className="flex justify-content-end mb-3">
                    <Button label="Adicionar nota" icon="pi pi-plus" outlined size="small" onClick={onAddNote} />
                </div>
            )}

            <Timeline
                value={events}
                align="left"
                className="customized-timeline"
                marker={(item: TimelineEvent) => {
                    const config = TIPO_CONFIG[item.tipo ?? 'sistema'];
                    return (
                        <span
                            className="flex align-items-center justify-content-center border-circle"
                            style={{ width: '2.2rem', height: '2.2rem', backgroundColor: config.color, color: '#fff', flexShrink: 0 }}
                        >
                            <i className={`pi ${config.icon}`} style={{ fontSize: '0.9rem' }} />
                        </span>
                    );
                }}
                content={(item: TimelineEvent) => {
                    const config = TIPO_CONFIG[item.tipo ?? 'sistema'];
                    return (
                        <div className="mb-4">
                            <div className="flex flex-wrap align-items-center gap-2 mb-1">
                                <span className="font-semibold text-900">{item.titulo}</span>
                                {item.tipo && (
                                    <Tag
                                        value={item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                                        severity={config.severity}
                                        className="text-xs"
                                        style={{ backgroundColor: config.color, color: '#fff' }}
                                    />
                                )}
                            </div>
                            {item.descricao && (
                                <p className="text-700 text-sm mt-1 mb-1 line-height-3">{item.descricao}</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-500 mt-1">
                                {item.data && (
                                    <span>
                                        <i className="pi pi-calendar mr-1" />
                                        {formatDate(item.data)}
                                    </span>
                                )}
                                {item.usuario && (
                                    <span>
                                        <i className="pi pi-user mr-1" />
                                        {item.usuario}
                                    </span>
                                )}
                            </div>
                            {item.extra && <div className="mt-2">{item.extra}</div>}
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default ActivityTimeline;
