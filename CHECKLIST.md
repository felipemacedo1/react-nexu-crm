# 📋 Checklist de Desenvolvimento - NexoCRM Frontend

**Projeto:** react-nexu-crm  
**Stack:** PrimeReact + Next.js + TypeScript  
**Backend:** Spring Boot NexoCRM API  
**Repositório:** https://github.com/felipemacedo1/react-nexu-crm.git

---

## 📦 FASE 1: Configuração Inicial e Branding

### 1.1 Configuração do Projeto
- [x] Alterar `name` em `package.json` para `"nexocrm-frontend"`
- [x] Atualizar `README.md` com informações do NexoCRM
- [x] Alterar título da aplicação no `layout/AppTopbar.tsx`
- [x] Adicionar logo NexoCRM em `public/layout/images/`
- [ ] Atualizar favicon em `public/favicon.ico`
- [ ] Atualizar `package.json` description e author

### 1.2 Configuração de Ambiente
- [x] Criar `.env.local` com variáveis de ambiente
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/nexocrm/api`
  - `NEXT_PUBLIC_APP_NAME=NexoCRM`
  - `NEXT_PUBLIC_JWT_SECRET_KEY` (mesmo do backend)
- [x] Adicionar `.env.local` ao `.gitignore`
- [x] Criar `.env.example` com template das variáveis
- [x] Verificar dependências e atualizar se necessário
  ```bash
  npm install axios
  npm install js-cookie
  npm install @types/js-cookie --save-dev
  ```

### 1.3 Estrutura de Diretórios
- [x] Criar estrutura de pastas:
  ```
  app/
    (main)/
      auth/           # Login, Registro, Recuperação de Senha
      crm/            # Módulo CRM
        contas/
        leads/
        contatos/
        oportunidades/
        atividades/
      agenda/         # Módulo Agenda
      admin/          # Módulo Admin
      financeiro/     # Módulo Financeiro
      integracao/     # Módulo Integração
      marketing/      # Módulo Marketing
      projeto/        # Módulo Projeto
      relatorio/      # Módulo Relatório
      suporte/        # Módulo Suporte
  services/          # Services para API
  hooks/             # Custom React Hooks
  types/             # TypeScript Types/Interfaces
  utils/             # Funções utilitárias
  constants/         # Constantes da aplicação
  ```

---

## 🔐 FASE 2: Autenticação e Segurança

### 2.1 Context de Autenticação
- [x] Criar `app/context/AuthContext.tsx`
  - Estado: `user`, `token`, `isAuthenticated`, `loading`
  - Métodos: `login()`, `logout()`, `register()`, `refreshToken()`
- [x] Implementar persistência de token (localStorage/sessionStorage)
- [x] Criar HOC/middleware de proteção de rotas
- [x] Implementar auto-logout em caso de token expirado

### 2.2 Serviço de Autenticação
- [x] Criar `services/auth.service.ts`
  - `login(email, password)` → POST `/api/auth/login`
  - `register(data)` → POST `/api/auth/registrar`
  - `logout()` → Limpar token
  - `getCurrentUser()` → GET `/api/usuario/perfil`
  - `refreshToken()` → POST `/api/auth/refresh` (se existir)
- [x] Configurar interceptor Axios para adicionar token JWT nos headers
- [x] Configurar interceptor para refresh token automático (401)
- [x] Tratamento de erros de autenticação

### 2.3 Páginas de Autenticação
- [x] Criar `app/(full-page)/auth/login/page.tsx`
  - Formulário com email/senha
  - Validação de campos
  - Link para recuperação de senha
  - Feedback de erros
- [x] Criar `app/(full-page)/auth/register/page.tsx`
  - Formulário de cadastro completo
  - Validação de senha forte
  - Confirmação de senha
- [x] Criar `app/(full-page)/auth/forgot-password/page.tsx`
- [x] Criar `app/(full-page)/auth/reset-password/page.tsx`
- [x] Estilizar páginas seguindo identidade NexoCRM

---

## 🛠️ FASE 3: Infraestrutura Base

### 3.1 Configuração de API Client
- [x] Criar `services/api.config.ts`
  - Instância Axios configurada com baseURL
  - Request interceptor (adicionar token)
  - Response interceptor (tratamento de erros)
  - Timeout configuration
- [x] Criar `services/base.service.ts`
  - Classe genérica com métodos CRUD padrão
  - `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)`
  - `search(params)`, `paginate(page, size, filters)`

### 3.2 TypeScript Types e Interfaces
- [x] Criar `types/entities.ts` com todas as entidades:
  - `Usuario`, `Conta`, `Lead`, `Contato`, `Oportunidade`, `Atividade`
  - `Evento`, `Lembrete`, `Tarefa`, `Caso`, `Produto`, etc.
  - Espelhar DTOs do backend _(DTOs definidos nos service files)_
- [x] Criar `types/api.ts`
  - `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`
  - `LoginRequest`, `LoginResponse`, `RegisterRequest` _(definidos em base.service.ts)_
- [ ] Criar `types/forms.ts` para tipos de formulários

### 3.3 Utilities e Helpers
- [x] Criar `utils/format.ts`
  - `formatDate()`, `formatCurrency()`, `formatPhone()`, `formatCPF()`
- [x] Criar `utils/validation.ts`
  - `validateEmail()`, `validateCPF()`, `validatePhone()`
- [ ] Criar `utils/storage.ts`
  - `saveToLocalStorage()`, `getFromLocalStorage()`, `removeFromLocalStorage()`
- [x] Criar `constants/api-routes.ts` com todas as rotas
- [x] Criar `constants/app-constants.ts`

### 3.4 Custom Hooks
- [x] Criar `hooks/useAuth.ts` (wrapper do AuthContext)
- [ ] Criar `hooks/useApi.ts` (generic hook para chamadas API)
- [x] Criar `hooks/useDebounce.ts` (para filtros de busca)
- [ ] Criar `hooks/usePagination.ts`
- [x] Criar `hooks/useToast.ts` (wrapper do PrimeReact Toast)

---

## 🎨 FASE 4: Componentes Globais e Layout

### 4.1 Atualizar Menu de Navegação
- [x] Atualizar `layout/AppMenu.tsx` com menu NexoCRM:
  ```typescript
  - Dashboard
  - CRM
    - Leads
    - Contas
    - Contatos
    - Oportunidades
    - Atividades
  - Agenda
    - Calendário
    - Eventos
    - Lembretes
    - Tarefas
  - Suporte
    - Casos
    - Base de Conhecimento
  - Projetos
  - Marketing
  - Financeiro
  - Relatórios
  - Admin
    - Usuários
    - Grupos de Segurança
    - Configurações
  ```
- [x] Adicionar ícones apropriados (PrimeIcons)
- [ ] Configurar permissões de menu por perfil de usuário

### 4.2 Componentes Compartilhados
- [ ] Criar `app/components/DataTableCrud.tsx` (componente reutilizável)
  - DataTable com filtros, ordenação, paginação
  - Botões de ação (criar, editar, excluir)
  - Confirmação de exclusão
  - Export (CSV, Excel, PDF)
- [ ] Criar `app/components/FormDialog.tsx` (modal genérico para formulários)
- [ ] Criar `app/components/ConfirmDialog.tsx`
- [ ] Criar `app/components/PageHeader.tsx` (breadcrumb + título)
- [ ] Criar `app/components/EmptyState.tsx`
- [ ] Criar `app/components/LoadingSpinner.tsx`
- [ ] Criar `app/components/ErrorBoundary.tsx`

### 4.3 Layout Customization
- [x] Atualizar `layout/AppTopbar.tsx`
  - Logo NexoCRM
  - Nome do usuário logado
  - Avatar
  - Dropdown com perfil/configurações/logout
- [x] Atualizar `layout/AppFooter.tsx` com informações do NexoCRM
- [ ] Configurar tema padrão em `layout/context/layoutcontext.tsx`

---

## 📊 FASE 5: Dashboard

### 5.1 Dashboard Principal
- [x] Criar `app/(main)/page.tsx` (Dashboard) _(layout completo, dados placeholder)_
- [ ] Criar serviço `services/dashboard.service.ts`
  - `getKPIs()` → Métricas principais
  - `getRecentActivities()`
  - `getLeadsByStatus()`
  - `getOpportunitiesByStage()`
- [ ] Implementar cards de KPIs:
  - Total de Leads
  - Total de Contas
  - Oportunidades em aberto
  - Receita projetada
  - Taxa de conversão
- [ ] Implementar gráficos (Chart.js):
  - Funil de vendas
  - Leads por origem
  - Oportunidades por estágio
  - Evolução mensal
- [ ] Criar widget de atividades recentes
- [ ] Criar widget de lembretes/tarefas do dia
- [ ] Implementar filtros de período (hoje, semana, mês, ano)

---

## 👥 FASE 6: Módulo CRM - CRUD Principal

### 6.1 Leads
- [x] Criar `services/lead.service.ts`
  - CRUD completo
  - `search(filters)`, `convertToContact(id)`, `assignTo(id, userId)`
- [x] Criar `types/lead.types.ts` _(DTOs definidos no service)_
- [x] Criar `app/(main)/crm/leads/page.tsx` (listagem)
  - DataTable com filtros (nome, email, status, origem)
  - Paginação server-side
  - Ações: visualizar, editar, excluir, converter
- [x] Criar `app/(main)/crm/leads/[id]/page.tsx` (detalhes)
  - Informações completas do lead
  - Timeline de atividades
  - Botão de conversão para contato
- [x] Criar `app/(main)/crm/leads/create/page.tsx` (formulário)
- [x] Criar componente `LeadForm.tsx`
  - Validação de campos obrigatórios
  - Campos: nome, email, telefone, empresa, cargo, origem, status
- [ ] Implementar conversão de Lead → Contato/Conta

### 6.2 Contas
- [x] Criar `services/conta.service.ts`
- [x] Criar `types/conta.types.ts` _(DTOs definidos no service)_
- [x] Criar `app/(main)/crm/contas/page.tsx` (listagem)
  - Filtros: nome, setor, tipo, cidade
- [x] Criar `app/(main)/crm/contas/[id]/page.tsx` (detalhes)
  - Aba de informações gerais
  - Aba de contatos relacionados
  - Aba de oportunidades
  - Aba de atividades
- [x] Criar `app/(main)/crm/contas/create/page.tsx`
- [x] Criar componente `ContaForm.tsx`
  - Campos: nome, CNPJ, setor, site, telefone, endereço

### 6.3 Contatos
- [x] Criar `services/contato.service.ts`
- [x] Criar `types/contato.types.ts` _(DTOs definidos no service)_
- [x] Criar `app/(main)/crm/contatos/page.tsx` (listagem)
  - Filtros: nome, email, cargo, conta
- [x] Criar `app/(main)/crm/contatos/[id]/page.tsx` (detalhes)
  - Informações pessoais
  - Conta vinculada
  - Oportunidades relacionadas
  - Histórico de interações
- [x] Criar `app/(main)/crm/contatos/create/page.tsx`
- [x] Criar componente `ContatoForm.tsx`
  - AutoComplete para vincular conta
  - Campos: nome, email, telefone, cargo, departamento

### 6.4 Oportunidades (Pipeline de Vendas)
- [x] Criar `services/oportunidade.service.ts`
  - `updateStage(id, newStage)`, `calculateProbability()`
- [x] Criar `types/oportunidade.types.ts` _(DTOs definidos no service)_
- [x] Criar `app/(main)/crm/oportunidades/page.tsx` (listagem)
  - Filtros: nome, estágio, valor, probabilidade, data de fechamento
  - Visualização em cards (Kanban)
- [x] Criar `app/(main)/crm/oportunidades/[id]/page.tsx` (detalhes)
  - Informações da oportunidade
  - Estágio do pipeline
  - Produtos/Serviços
  - Timeline de progresso
- [x] Criar `app/(main)/crm/oportunidades/create/page.tsx`
- [x] Criar componente `OportunidadeForm.tsx`
  - Campos: nome, valor, probabilidade, data de fechamento, estágio
  - Vincular conta e contato
- [ ] Implementar visualização Kanban (arrastar entre estágios)

### 6.5 Atividades
- [ ] Criar `services/atividade.service.ts`
- [ ] Criar `types/atividade.types.ts`
- [ ] Criar `app/(main)/crm/atividades/page.tsx` (listagem)
  - Filtros: tipo, status, data, responsável
- [ ] Criar componente `AtividadeForm.tsx`
  - Tipos: chamada, email, reunião, tarefa
  - Vincular com lead/contato/oportunidade
- [ ] Criar timeline de atividades (componente reutilizável)

---

## 📅 FASE 7: Módulo Agenda

### 7.1 Calendário
- [ ] Criar `services/evento.service.ts`
- [ ] Criar `app/(main)/agenda/calendario/page.tsx`
  - Integrar PrimeReact FullCalendar
  - Visualizações: mês, semana, dia
  - Criar evento ao clicar no calendário
  - Editar evento ao clicar em evento existente
- [ ] Criar componente `EventoForm.tsx`
  - Campos: título, descrição, data/hora, local, participantes
  - Lembretes configuráveis

### 7.2 Eventos e Lembretes
- [ ] Criar `app/(main)/agenda/eventos/page.tsx` (listagem)
- [ ] Criar `services/lembrete.service.ts`
- [ ] Criar `app/(main)/agenda/lembretes/page.tsx`
- [ ] Implementar notificações de lembretes

### 7.3 Tarefas
- [ ] Criar `services/tarefa.service.ts`
- [ ] Criar `app/(main)/agenda/tarefas/page.tsx`
  - Lista de tarefas com checkbox
  - Filtros: status, prioridade, data
  - Marcar como concluída

---

## 🛡️ FASE 8: Módulo Suporte

### 8.1 Casos
- [ ] Criar `services/caso.service.ts`
- [ ] Criar `app/(main)/suporte/casos/page.tsx` (listagem)
  - Filtros: status, prioridade, categoria
- [ ] Criar `app/(main)/suporte/casos/[id]/page.tsx` (detalhes)
  - Informações do caso
  - Comentários/Atualizações
  - Anexos
- [ ] Criar componente `CasoForm.tsx`

### 8.2 Base de Conhecimento
- [ ] Criar `services/base-conhecimento.service.ts`
- [ ] Criar `app/(main)/suporte/base-conhecimento/page.tsx`
  - Busca de artigos
  - Categorias
- [ ] Criar visualizador de artigo com rich text

---

## 💼 FASE 9: Módulo Financeiro

### 9.1 Orçamentos
- [ ] Criar `services/orcamento.service.ts`
- [ ] Criar `app/(main)/financeiro/orcamentos/page.tsx`
- [ ] Criar componente `OrcamentoForm.tsx`
  - Adicionar produtos com quantidade e desconto
  - Cálculo automático de totais

### 9.2 Produtos/Serviços
- [ ] Criar `services/produto.service.ts`
- [ ] Criar `app/(main)/financeiro/produtos/page.tsx`
- [ ] Criar componente `ProdutoForm.tsx`

---

## 📈 FASE 10: Módulo Relatórios

### 10.1 Relatórios Pré-definidos
- [ ] Criar `services/relatorio.service.ts`
- [ ] Criar `app/(main)/relatorios/page.tsx`
  - Lista de relatórios disponíveis
- [ ] Implementar relatórios:
  - Funil de vendas
  - Performance de vendas
  - Leads por origem
  - Taxa de conversão
  - Oportunidades ganhas/perdidas
- [ ] Implementar exportação (PDF, Excel, CSV)
- [ ] Implementar filtros de período

---

## ⚙️ FASE 11: Módulo Admin

### 11.1 Gestão de Usuários
- [x] Criar `services/usuario.service.ts`
- [ ] Criar `app/(main)/admin/usuarios/page.tsx` (listagem)
- [ ] Criar `app/(main)/admin/usuarios/[id]/page.tsx`
- [ ] Criar componente `UsuarioForm.tsx`
  - Campos: nome, email, senha, papéis, ativo
  - Associar a grupos de segurança

### 11.2 Grupos de Segurança e Permissões
- [ ] Criar `services/grupo-seguranca.service.ts`
- [ ] Criar `app/(main)/admin/grupos/page.tsx`
- [ ] Implementar matriz de permissões
- [ ] Criar componente `PermissoesMatrix.tsx`

### 11.3 Configurações do Sistema
- [ ] Criar `app/(main)/admin/configuracoes/page.tsx`
  - Configurações gerais
  - Configurações de email
  - Configurações de integração
  - Backup e restauração

---

## 🔌 FASE 12: Integrações

### 12.1 OAuth e APIs Externas
- [ ] Criar `services/oauth.service.ts`
- [ ] Criar `app/(main)/integracao/oauth/page.tsx`
- [ ] Implementar conexões OAuth externas

### 12.2 Webhooks
- [ ] Criar `app/(main)/integracao/webhooks/page.tsx`
- [ ] Gerenciar webhooks de entrada/saída

---

## 🎯 FASE 13: Funcionalidades Avançadas

### 13.1 Busca Global
- [ ] Implementar busca global no AppTopbar
- [ ] Criar `services/search.service.ts`
- [ ] Buscar em todas as entidades (leads, contas, contatos, etc.)
- [ ] Exibir resultados em Overlay/Dialog

### 13.2 Notificações em Tempo Real
- [ ] Implementar WebSocket/SSE para notificações
- [ ] Criar componente de notificações no Topbar
- [ ] Badge de notificações não lidas

### 13.3 Upload de Arquivos
- [ ] Criar `services/upload.service.ts`
- [ ] Criar componente `FileUpload.tsx`
- [ ] Implementar preview de imagens
- [ ] Galeria de anexos

### 13.4 Exportação e Importação
- [ ] Implementar exportação em massa (CSV, Excel)
- [ ] Implementar importação de dados (CSV)
- [ ] Validação de dados importados

### 13.5 Favoritos e Filtros Salvos
- [ ] Adicionar funcionalidade de favoritar registros
- [ ] Salvar filtros personalizados
- [ ] Persistir preferências do usuário

---

## 🧪 FASE 14: Testes

### 14.1 Testes Unitários
- [ ] Configurar Jest + React Testing Library
- [ ] Testar componentes principais
- [ ] Testar hooks customizados
- [ ] Testar services (mock de API)

### 14.2 Testes de Integração
- [ ] Testar fluxos completos (login → CRUD)
- [ ] Testar integração com backend

### 14.3 Testes E2E
- [ ] Configurar Cypress ou Playwright
- [ ] Testar jornadas críticas do usuário

---

## 🚀 FASE 15: Performance e Otimização

### 15.1 Performance
- [ ] Implementar lazy loading de componentes
- [ ] Otimizar bundle size (code splitting)
- [ ] Implementar cache de dados (React Query ou SWR)
- [ ] Otimizar imagens (next/image)
- [ ] Implementar virtualização para listas grandes

### 15.2 SEO e Acessibilidade
- [ ] Configurar meta tags (Next.js Metadata API)
- [ ] Implementar semantic HTML
- [ ] Garantir navegação por teclado
- [ ] Adicionar ARIA labels

### 15.3 PWA (Progressive Web App)
- [ ] Configurar Service Worker
- [ ] Implementar offline mode
- [ ] Adicionar manifest.json
- [ ] Implementar instalação como app

---

## 📱 FASE 16: Responsividade

### 16.1 Mobile Optimization
- [ ] Testar e ajustar layout em mobile (< 768px)
- [ ] Implementar menu mobile (hamburger)
- [ ] Ajustar DataTables para mobile (responsive cards)
- [ ] Testar formulários em telas pequenas

### 16.2 Tablet Optimization
- [ ] Testar e ajustar layout em tablet (768px - 1024px)

---

## 🎨 FASE 17: UX/UI Refinamento

### 17.1 Feedback Visual
- [ ] Implementar loading states em todos os botões
- [ ] Skeleton loaders para carregamento de dados
- [ ] Toasts para feedback de ações (sucesso/erro)
- [ ] Animações sutis (transições, hover states)

### 17.2 Temas e Personalização
- [ ] Implementar dark mode completo
- [ ] Permitir troca de tema (light/dark)
- [ ] Persistir preferência de tema
- [ ] Criar temas customizados do NexoCRM

### 17.3 Internacionalização (i18n)
- [ ] Configurar next-intl ou react-intl
- [ ] Traduzir interface para PT-BR (padrão)
- [ ] Adicionar suporte para EN-US
- [ ] Adicionar suporte para ES-ES

---

## 📚 FASE 18: Documentação

### 18.1 Documentação Técnica
- [ ] Documentar arquitetura do projeto
- [ ] Documentar padrões de código
- [ ] Documentar estrutura de pastas
- [ ] Documentar services e API integration

### 18.2 Documentação de Uso
- [ ] Criar guia de instalação (README.md)
- [ ] Criar guia de desenvolvimento
- [ ] Documentar variáveis de ambiente
- [ ] Criar guia de deploy

### 18.3 Storybook (Opcional)
- [ ] Configurar Storybook
- [ ] Documentar componentes compartilhados
- [ ] Criar stories para cada componente

---

## 🔒 FASE 19: Segurança

### 19.1 Boas Práticas de Segurança
- [ ] Implementar CSP (Content Security Policy)
- [ ] Sanitizar inputs de usuário
- [ ] Implementar rate limiting no frontend
- [ ] Validar dados antes de enviar ao backend
- [ ] Implementar proteção contra XSS
- [ ] Implementar proteção contra CSRF

### 19.2 Gestão de Tokens
- [ ] Implementar refresh token automático
- [ ] Implementar logout em múltiplas abas
- [ ] Limpar dados sensíveis ao deslogar

---

## 🌐 FASE 20: Deploy e CI/CD

### 20.1 Build de Produção
- [ ] Configurar variáveis de ambiente de produção
- [ ] Testar build de produção localmente
- [ ] Otimizar assets para produção
- [ ] Configurar .env.production

### 20.2 Deploy
- [ ] Escolher plataforma de deploy (Vercel, Netlify, AWS, etc.)
- [ ] Configurar domínio customizado
- [ ] Configurar SSL/HTTPS
- [ ] Configurar CORS no backend para domínio de produção

### 20.3 CI/CD Pipeline
- [ ] Configurar GitHub Actions
  - Lint e format check
  - Testes automatizados
  - Build automático
  - Deploy automático
- [ ] Configurar ambientes (dev, staging, production)

---

## 📊 FASE 21: Monitoramento e Analytics

### 21.1 Error Tracking
- [ ] Integrar Sentry ou similar
- [ ] Configurar alertas de erro
- [ ] Implementar error boundaries globais

### 21.2 Analytics
- [ ] Integrar Google Analytics ou Plausible
- [ ] Rastrear eventos importantes
- [ ] Criar dashboards de uso

### 21.3 Performance Monitoring
- [ ] Configurar Core Web Vitals tracking
- [ ] Monitorar tempo de carregamento
- [ ] Identificar gargalos de performance

---

## 🎓 FASE 22: Treinamento e Onboarding

### 22.1 Tour Guiado
- [ ] Implementar tour interativo para novos usuários
- [ ] Criar tooltips contextuais
- [ ] Criar seção de ajuda/FAQ

### 22.2 Documentação do Usuário
- [ ] Criar manual do usuário
- [ ] Criar vídeos tutoriais
- [ ] Criar base de conhecimento interna

---

## ✅ FASE 23: Lançamento

### 23.1 Pré-Lançamento
- [ ] Code review completo
- [ ] Testes de aceitação com usuários
- [ ] Ajustes baseados em feedback
- [ ] Verificar todos os requisitos funcionais

### 23.2 Lançamento
- [ ] Deploy em produção
- [ ] Monitoramento intensivo nas primeiras 48h
- [ ] Suporte para primeiros usuários
- [ ] Coletar feedback inicial

### 23.3 Pós-Lançamento
- [ ] Corrigir bugs críticos imediatamente
- [ ] Planejar melhorias para próximas versões
- [ ] Atualizar documentação baseada em feedback
- [ ] Celebrar! 🎉

---

## 📝 Notas de Desenvolvimento

### Padrões de Código
- **Nomenclatura:** PascalCase para componentes, camelCase para funções/variáveis
- **Imports:** Organizar em ordem: React → Libs → Components → Services → Types → Styles
- **Tipos:** Sempre usar TypeScript, evitar `any`
- **Comentários:** JSDoc para funções públicas
- **Git:** Commits semânticos (feat, fix, refactor, docs, style, test, chore)

### Convenções de Commits
```
feat: adicionar CRUD de leads
fix: corrigir filtro de contas
refactor: reorganizar estrutura de services
docs: atualizar README
style: formatar código com prettier
test: adicionar testes para ContaService
chore: atualizar dependências
```

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format

# Testes
npm test
npm run test:watch
npm run test:coverage

# Produção
npm run start
```

---

**Última atualização:** 03/03/2026  
**Versão:** 1.0.0  
**Status:** Em desenvolvimento
