'use client';
import React from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { useFavoritos, FavoritoItem } from '@/hooks/useFavoritos';

interface FavoritoButtonProps {
    item: Omit<FavoritoItem, 'adicionadoEm'>;
    /** 'icon' = apenas ícone; 'button' = botão com texto */
    mode?: 'icon' | 'button';
    className?: string;
}

const FavoritoButton: React.FC<FavoritoButtonProps> = ({ item, mode = 'icon', className }) => {
    const { isFavorito, toggleFavorito } = useFavoritos();
    const ativo = isFavorito(item.id, item.tipo);
    const tooltipId = `fav-btn-${item.tipo}-${item.id}`;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorito(item);
    };

    if (mode === 'button') {
        return (
            <Button
                label={ativo ? 'Favoritado' : 'Favoritar'}
                icon={ativo ? 'pi pi-star-fill' : 'pi pi-star'}
                className={`p-button-sm ${ativo ? 'p-button-warning' : 'p-button-outlined p-button-secondary'} ${className ?? ''}`}
                onClick={handleClick}
            />
        );
    }

    return (
        <>
            <Tooltip target={`#${tooltipId}`} content={ativo ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} position="top" />
            <button
                id={tooltipId}
                type="button"
                className={`p-link ${className ?? ''}`}
                onClick={handleClick}
                style={{ color: ativo ? '#f59e0b' : '#94a3b8', fontSize: '1rem', lineHeight: 1 }}
                aria-label={ativo ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
                <i className={ativo ? 'pi pi-star-fill' : 'pi pi-star'} />
            </button>
        </>
    );
};

export default FavoritoButton;
