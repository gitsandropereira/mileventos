<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🛠️ MIL_EVENTOS | Sistema de Gestão e Marketing para Casas de Festas

## 🎯 Propósito e Escopo do Projeto

O **mileventos** é um sistema Full Stack desenvolvido para estabelecimentos que comercializam serviços completos de festas (infantis, casamentos, 15 anos).

A premissa principal do sistema é registrar detalhadamente os **convidados** que compareceram aos eventos. Com esses dados cadastrados, o sistema deve ofertar **insights, gestão de funil** e **ferramentas de marketing** (automação via API/e-mail) para os administradores da casa de festas.

A arquitetura prioriza:
* **Performance:** Vite, Vercel Serverless Functions.
* **Integridade de Dados:** TypeScript, Zod e PostgreSQL.
* **Developer Experience (DX):** React Hooks, Zustand, React Query.

---

## 💻 Stack Técnica (Full Stack)

| Camada | Tecnologia Principal | Uso |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite | UI responsiva, performance e tipagem. |
| **Estilo** | Tailwind CSS, Lucide React | Estilização rápida e componentes Headless UI. |
| **Estado/Form** | Zustand, React Query, Zod | Gerenciamento de estado global, caching de dados e validação E2E. |
| **Backend** | Vercel Serverless Functions (Node.js) | Hospedagem Serverless das APIs. |
| **Banco de Dados** | PostgreSQL (Prisma ORM) | Persistência de dados Multi-tenant (eventos, clientes, propostas). |
| **IA** | Google Gemini API | Geração de descrições para propostas (movido para Serverless). |

---

## 🚀 Rodando o Projeto Localmente

**Pré-requisitos:** Node.js (v18+), PostgreSQL (local ou remoto) e uma conta GitHub/Vercel.

### 1. Instalação e Configuração

1.  Clone este repositório.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure suas variáveis de ambiente:
    * Crie o arquivo **`.env.local`** na raiz do projeto.
    * Defina as chaves críticas (ex: `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`).

4.  Execute a migração do banco de dados (se você alterou o `schema.prisma`):
    ```bash
    npx prisma migrate dev
    ```

### 2. Execução

1.  Rode o aplicativo (Frontend e Backend Serverless localmente via `Vite` e `Vercel Dev` ou similar):
    ```bash
    npm run dev
    ```
2.  Acesse seu aplicativo em `http://localhost:5173` (ou a porta indicada pelo Vite).

---

### 🌐 Deploy na Vercel

O projeto está configurado para **Deploy Automático** na Vercel (via integração Git).

1.  Conecte este repositório à Vercel.
2.  Defina todas as **Environment Variables** listadas no painel da Vercel (como Secrets).
3.  A Vercel construirá o Frontend (via `npm run build`) e publicará as APIs na pasta `/api`.