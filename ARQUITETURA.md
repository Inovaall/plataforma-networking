# 📐 Arquitetura da Plataforma de Networking e Geração de Negócios

Este documento descreve a arquitetura planejada para a plataforma de gestão
de grupos de networking, com foco em geração de negócios, engajamento,
controle financeiro e análises de performance.

---

## 🎯 Objetivo da Plataforma

Substituir planilhas e operações manuais, centralizando:

- Gestão e admissão de membros
- Comunicação e check-in de reuniões
- Registro e acompanhamento de indicações
- Controle de reuniões 1:1
- Dashboard de performance
- Gestão de mensalidades

---

## 🏗️ Arquitetura Geral

```mermaid
flowchart TD
    Client[Frontend - Next.js/React] --> API[Next.js API Routes]
    API --> DB[(PostgreSQL via Prisma ORM)]
    Client --> Auth[JWT Auth / Roles RBAC]
    AdminPanel[Admin Interface] --> API
Tecnologias principais:

Next.js + React + TypeScript

PostgreSQL

Prisma ORM

JWT (Access + Refresh) + Roles (admin/member)

Jest + React Testing Library + Supertest

Deploy: Vercel + Railway/Supabase (DB)

🧠 Decisões Técnicas
Área	Decisão
Framework	Next.js + TypeScript
API	REST (Next API Routes)
Banco	PostgreSQL (ACID, relacionamentos fortes)
ORM	Prisma
Autenticação	JWT + RBAC
Testes	Jest + RTL + Supertest

🗄️ Modelo de Dados (ERD)
mermaid
Copiar código
erDiagram

USER {
  uuid id PK
  string name
  string email
  string passwordHash
  string role "admin/member"
  string status "pending/active/rejected"
  datetime createdAt
}

APPLICATION {
  uuid id PK
  string name
  string email
  string phone
  string company
  string status "pending/approved/rejected"
  datetime createdAt
}

INVITE {
  uuid id PK
  uuid userId FK
  string token
  datetime expiresAt
}

ANNOUNCEMENT {
  uuid id PK
  uuid createdBy FK
  string title
  string message
  datetime createdAt
}

MEETING {
  uuid id PK
  datetime date
  string type "weekly/event"
}

CHECKIN {
  uuid id PK
  uuid userId FK
  uuid meetingId FK
  datetime createdAt
}

REFERRAL {
  uuid id PK
  uuid fromUserId FK
  uuid toUserId FK
  string description
  string status "sent/in_progress/closed"
  datetime createdAt
}

THANKYOU {
  uuid id PK
  uuid referralId FK
  uuid fromUserId FK
  uuid toUserId FK
  string message
  datetime createdAt
}

ONEONONE {
  uuid id PK
  uuid userA FK
  uuid userB FK
  datetime date
}

FEE {
  uuid id PK
  uuid userId FK
  decimal amount
  string status "pending/paid"
  datetime dueDate
  datetime paidAt
}
Justificativa do PostgreSQL

Relacionamentos complexos (muitos-para-muitos)

Consistência e auditoria

Escalável e compatível com Prisma e serviços cloud

🧩 Estrutura do Frontend (Next.js)
Padrão de organização:

swift
Copiar código
src/
 ├─ app/
 │   ├─ (public)/apply/
 │   ├─ dashboard/
 │   ├─ admin/
 ├─ components/
 │   ├─ ui/ (botões, inputs, cards)
 │   ├─ features/
 │   │   ├─ applications/
 │   │   ├─ referrals/
 │   │   ├─ meetings/
 ├─ lib/
 │   ├─ auth/
 │   ├─ prisma/
 ├─ hooks/
 ├─ tests/
 └─ prisma/
Estado Global:

Auth e User context

SWR ou React Query para dados

🌐 API — Endpoints Principais
1) Enviar intenção de participação
POST /api/applications

Request:

json
Copiar código
{
  "name": "Tiago",
  "email": "tiago@example.com",
  "phone": "999999999",
  "company": "Empresa XPTO"
}
Response:

json
Copiar código
{ "message": "Candidatura enviada com sucesso" }
2) Admin listar aplicações
GET /api/admin/applications

Response:

json
Copiar código
[
  { "id": "uuid", "name": "Tiago", "email": "tiago@email.com", "status": "pending" }
]
3) Criar indicação
POST /api/referrals

Request:

json
Copiar código
{
  "toUserId": "uuid",
  "description": "Indicação para serviço de marketing"
}
Response:

json
Copiar código
{ "id": "uuid", "status": "sent" }
📊 Dashboard
Métricas:

Indicações feitas vs recebidas

Taxa de conversão

Obrigados recebidos

Presença

1:1 realizados