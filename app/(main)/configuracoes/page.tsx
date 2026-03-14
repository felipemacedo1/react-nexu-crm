// Redirect: /configuracoes → /admin/configuracoes
// O topbar aponta para /configuracoes mas a página real fica em /admin/configuracoes
import { redirect } from 'next/navigation';

export default function ConfiguracoesRedirectPage() {
    redirect('/admin/configuracoes');
}
