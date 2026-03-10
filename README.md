# NexoCRM Frontend

> Plataforma moderna de CRM construída com **Next.js 13+**, **PrimeReact 10** e **TypeScript**.

---

## ✨ Funcionalidades

| Módulo | Funcionalidades |
|---|---|
| **Dashboard** | KPIs, funil de vendas (doughnut), valor por estágio (bar), lembretes do dia, filtro de período |
| **CRM — Pré-Clientes** | CRUD completo, conversão Lead → Contato/Conta/Oportunidade, timeline de atividades |
| **CRM — Empresas** | CRUD, abas de contatos/oportunidades/atividades vinculadas |
| **CRM — Contatos** | CRUD, vínculo com conta, histórico de interações |
| **CRM — Oportunidades** | CRUD, **Kanban drag-and-drop** entre estágios, probabilidade |
| **CRM — Atividades** | CRUD, tipos (chamada/email/reunião/tarefa) |
| **Agenda** | Calendário FullCalendar, Eventos, Lembretes, Tarefas |
| **Suporte** | Casos, Base de Conhecimento |
| **Financeiro** | Orçamentos, Produtos/Serviços |
| **Relatórios** | Funil, performance, conversão; exportação CSV |
| **Admin** | Usuários, Grupos de Segurança, Configurações |
| **Integrações** | OAuth, Webhooks |
| **Ferramentas** | Exportação/Importação em massa, Favoritos, Filtros salvos |

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js **18+**
- npm **9+**
- Backend Spring Boot NexoCRM rodando em `http://localhost:8080`

### Instalação

```bash
git clone https://github.com/felipemacedo1/react-nexu-crm.git
cd react-nexu-crm
npm install
cp .env.example .env.local
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/nexocrm/api
NEXT_PUBLIC_APP_NAME=NexoCRM
```

### Desenvolvimento

```bash
npm run dev
# Acesse http://localhost:3000
```

### Testes

```bash
npm test               # Todos os testes
npm run test:watch     # Modo watch
npm run test:coverage  # Cobertura de código
```

### Build de Produção

```bash
npm run build
npm run start
```

---

## 🏗️ Estrutura do Projeto

```
react-crm-frontend/
├── app/
│   ├── (full-page)/auth/       # Login, Registro, Recuperação
│   ├── (main)/
│   │   ├── page.tsx            # Dashboard
│   │   ├── crm/                # Leads, Contas, Contatos, Oportunidades, Atividades
│   │   │   └── oportunidades/kanban/  # Vista Kanban
│   │   ├── agenda/             # Calendário, Eventos, Lembretes, Tarefas
│   │   ├── suporte/            # Casos, Base de Conhecimento
│   │   ├── financeiro/         # Orçamentos, Produtos
│   │   ├── relatorios/         # Relatórios e analytics
│   │   ├── admin/              # Usuários, Grupos, Configurações
│   │   ├── integracao/         # OAuth, Webhooks
│   │   └── favoritos/          # Registros favoritados
│   └── components/             # DataTableCrud, FormDialog...
├── components/shared/          # ActivityTimeline, FavoritoButton, SkeletonLoader
├── services/                   # Integração REST
├── hooks/                      # useAuth, useDebounce, useFavoritos...
├── layout/                     # AppMenu, AppTopbar, layoutcontext (dark mode persistente)
├── constants/                  # api-routes, app-constants
└── utils/                      # format, validation
```

---

## 🔐 Autenticação

- JWT armazenado em cookies via `js-cookie`
- Interceptor Axios adiciona token automaticamente
- Refresh token automático em respostas `401`
- Logout sincronizado entre múltiplas abas

---

## 🎨 Temas e Dark Mode

- Preferência de tema **persistida automaticamente** no localStorage
- Troca disponível no painel de configurações (ícone ⚙)
- Temas: `lara-light-indigo`, `lara-dark-indigo` e outros

---

## 🧪 Testes

Jest 29 + React Testing Library — 18 testes passando.

---

## 🚢 Deploy

### Vercel

```bash
npm i -g vercel && vercel --prod
```

Defina `NEXT_PUBLIC_API_BASE_URL` no painel da Vercel.

### CI/CD (GitHub Actions)

`.github/workflows/ci.yml`: lint → test → build → deploy (apenas `main`)

---

## 🔗 Backend

- Repositório: [spring-nexu-crm](https://github.com/felipemacedo1/spring-nexu-crm)
- Stack: Spring Boot + MySQL + JWT
- Swagger: `http://localhost:8080/swagger-ui.html`

---

## 📄 Licença

MIT © Felipe Macedo
