import { Metadata } from 'next';
import Layout from '../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'NexoCRM',
    description: 'NexoCRM - Sistema de Gestão de Relacionamento com o Cliente',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'NexoCRM',
        url: 'https://nexocrm.com.br/',
        description: 'NexoCRM - Sistema de Gestão de Relacionamento com o Cliente',
        images: [],
        ttl: 604800
    },
    icons: {
        icon: '/favicon.ico'
    }
};

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>;
}
