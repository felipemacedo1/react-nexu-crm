'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import { addLocale, locale } from 'primereact/api';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import 'primereact/resources/primereact.css';

// Register Brazilian Portuguese locale globally for all PrimeReact components
addLocale('pt-BR', {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar',
    dateFormat: 'dd/mm/yy',
    weekHeader: 'Sem',
    emptyFilterMessage: 'Nenhum resultado encontrado',
    emptyMessage: 'Nenhuma opção disponível',
    aria: {
        trueLabel: 'Verdadeiro',
        falseLabel: 'Falso',
        nullLabel: 'Não selecionado',
        star: '1 estrela',
        stars: '{0} estrelas',
        selectAll: 'Selecionar todos',
        unselectAll: 'Desmarcar todos',
        close: 'Fechar',
        previous: 'Anterior',
        next: 'Próximo',
        navigation: 'Navegação',
        scrollTop: 'Rolar para o topo',
        moveTop: 'Mover para o topo',
        moveUp: 'Mover para cima',
        moveDown: 'Mover para baixo',
        moveBottom: 'Mover para o final',
        moveToTarget: 'Mover para o destino',
        moveToSource: 'Mover para a origem',
        moveAllToTarget: 'Mover todos para o destino',
        moveAllToSource: 'Mover todos para a origem',
        pageLabel: 'Página {page}',
        firstPageLabel: 'Primeira Página',
        lastPageLabel: 'Última Página',
        nextPageLabel: 'Próxima Página',
        rowsPerPageLabel: 'Linhas por página',
        jumpToPageDropdownLabel: 'Ir para a Página',
        jumpToPageInputLabel: 'Ir para a Página',
        selectRow: 'Selecionar linha',
        unselectRow: 'Desmarcar linha',
        expandRow: 'Expandir linha',
        collapseRow: 'Recolher linha',
        showFilterMenu: 'Mostrar menu de filtro',
        hideFilterMenu: 'Ocultar menu de filtro',
        filterOperator: 'Operador do filtro',
        filterConstraint: 'Restrição do filtro',
        editRow: 'Editar linha',
        saveEdit: 'Salvar edição',
        cancelEdit: 'Cancelar edição',
        listView: 'Vista em lista',
        gridView: 'Vista em grade',
        slide: 'Slide',
        slideNumber: '{slideNumber}',
        zoomImage: 'Ampliar imagem',
        zoomIn: 'Aumentar zoom',
        zoomOut: 'Diminuir zoom',
        rotateRight: 'Girar para a direita',
        rotateLeft: 'Girar para a esquerda',
    }
});
locale('pt-BR');
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,      // 1 min
                gcTime: 5 * 60 * 1000,     // 5 min garbage collect
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <title>NexoCRM — Gestão de Relacionamento com Clientes</title>
                <meta name="description" content="NexoCRM é uma plataforma moderna de CRM para gestão de leads, contas, contatos, oportunidades e muito mais." />
                <meta name="keywords" content="CRM, leads, contas, oportunidades, gestão comercial, NexoCRM" />
                <meta name="author" content="NexoCRM" />
                <meta name="robots" content="noindex, nofollow" />
                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="NexoCRM" />
                <meta property="og:description" content="Plataforma de CRM moderna e intuitiva." />
                <meta property="og:site_name" content="NexoCRM" />
                {/* PWA */}
                <meta name="application-name" content="NexoCRM" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="NexoCRM" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#6366F1" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {/* Icons */}
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
                {/* Theme */}
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <a href="#main-content" className="skip-to-content">Pular para o conteúdo</a>
                <QueryClientProvider client={queryClient}>
                    <PrimeReactProvider>
                        <AuthProvider>
                            <LayoutProvider>
                                <ErrorBoundary>
                                    {children}
                                </ErrorBoundary>
                            </LayoutProvider>
                        </AuthProvider>
                    </PrimeReactProvider>
                </QueryClientProvider>
            </body>
        </html>
    );
}
