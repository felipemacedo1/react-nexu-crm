'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from './context/AuthContext';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
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
                <PrimeReactProvider>
                    <AuthProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </AuthProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}
