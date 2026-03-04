# NexoCRM Frontend

Sistema de Gestão de Relacionamento com o Cliente (CRM) construído com **Next.js**, **PrimeReact** e **TypeScript**.

## Tecnologias

- **Next.js 13** (App Router)
- **React 18**
- **PrimeReact 10** (componentes UI)
- **PrimeFlex** (CSS utilities)
- **TypeScript**
- **Axios** (HTTP client)
- **Chart.js** (gráficos)

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Backend NexoCRM rodando em `http://localhost:8080`

## Instalação

```bash
git clone https://github.com/felipemacedo1/react-nexu-crm.git
cd react-nexu-crm
npm install
cp .env.example .env.local
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | URL base da API | `http://localhost:8080/nexocrm/api` |
| `NEXT_PUBLIC_APP_NAME` | Nome do aplicativo | `NexoCRM` |

## Scripts

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run start     # Iniciar produção
npm run lint      # Verificar código
npm run format    # Formatar código
```

## Backend

Repositório: [spring-nexu-crm](https://github.com/felipemacedo1/spring-nexu-crm)

## Licença

MIT
