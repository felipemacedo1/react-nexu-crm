'use client';
import React from 'react';
import Link from 'next/link';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { useFavoritos, FavoritoItem } from '@/hooks/useFavoritos';

const TIPO_ICON: Record<FavoritoItem['tipo'], string> = {
    lead:         'pi-user-plus',
    conta:        'pi-building',
    contato:      'pi-users',
    oportunidade: 'pi-dollar',
    caso:         'pi-ticket',
    evento:       'pi-calendar',
};

const TIPO_COLOR: Record<FavoritoItem['tipo'], 'info' | 'success' | 'warning' | 'danger' | 'info'> = {
    lead:         'info',
    conta:        'success',
    contato:      'warning',
    oportunidade: 'danger',
    caso:         'info',
    evento:       'info',
};

export default function FavoritosPage() {
    const { favoritos, remover, limpar } = useFavoritos();

    return (
        <div className="grid">
            <div className="col-12">
                <div className="flex align-items-center justify-content-between mb-4">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-star-fill text-warning text-2xl" style={{ color: '#f59e0b' }} />
                        <div>
                            <h2 className="m-0 text-2xl font-bold">Favoritos</h2>
                            <p className="m-0 text-color-secondary text-sm">Registros marcados como favoritos</p>
                        </div>
                    </div>
                    {favoritos.length > 0 && (
                        <Button
                            label="Limpar todos"
                            icon="pi pi-trash"
                            className="p-button-outlined p-button-danger p-button-sm"
                            onClick={() => { if (confirm('Remover todos os favoritos?')) limpar(); }}
                        />
                    )}
                </div>
            </div>

            {favoritos.length === 0 ? (
                <div className="col-12">
                    <div className="surface-card border-round border-1 surface-border p-6 flex flex-column align-items-center gap-3 text-center">
                        <i className="pi pi-star text-4xl text-color-secondary" />
                        <p className="text-xl font-semibold m-0">Nenhum favorito ainda</p>
                        <p className="text-color-secondary m-0">
                            Clique no ícone ⭐ em qualquer registro para adicioná-lo aqui.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="col-12">
                    <div className="surface-card border-round border-1 surface-border">
                        {favoritos.map((item, idx) => (
                            <React.Fragment key={`${item.tipo}_${item.id}`}>
                                {idx > 0 && <Divider className="m-0" />}
                                <div className="flex align-items-center gap-3 p-3 hover:surface-hover transition-colors transition-duration-150">
                                    <div className="flex align-items-center justify-content-center border-circle surface-100"
                                        style={{ width: '2.5rem', height: '2.5rem', flexShrink: 0 }}>
                                        <i className={`pi ${TIPO_ICON[item.tipo]} text-primary`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={item.url} className="font-semibold text-color hover:text-primary no-underline white-space-nowrap overflow-hidden text-overflow-ellipsis block">
                                            {item.titulo}
                                        </Link>
                                        {item.subtitulo && (
                                            <span className="text-sm text-color-secondary">{item.subtitulo}</span>
                                        )}
                                    </div>
                                    <Tag value={item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)} severity={TIPO_COLOR[item.tipo]} className="text-xs flex-shrink-0" />
                                    <span className="text-xs text-color-secondary flex-shrink-0 hidden md:inline">
                                        {new Date(item.adicionadoEm).toLocaleDateString('pt-BR')}
                                    </span>
                                    <Button
                                        icon="pi pi-star-fill"
                                        className="p-button-text p-button-sm flex-shrink-0"
                                        style={{ color: '#f59e0b' }}
                                        tooltip="Remover favorito"
                                        tooltipOptions={{ position: 'top' }}
                                        onClick={() => remover(item.id, item.tipo)}
                                    />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
