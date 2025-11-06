# Arquitetura da Plataforma de Networking

> **Versão:** 1.0  
> **Autor:** Tiago Barbosa Soares  
> **Data:05** Novembro 2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Diagrama de Arquitetura](#diagrama-de-arquitetura)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Modelo de Dados](#modelo-de-dados)
5. [Estrutura de Componentes Frontend](#estrutura-de-componentes-frontend)
6. [Definição da API](#definição-da-api)
7. [Segurança e Autenticação](#segurança-e-autenticação)
8. [Estratégia de Testes](#estratégia-de-testes)
9. [Escalabilidade e Performance](#escalabilidade-e-performance)
10. [Decisões Técnicas](#decisões-técnicas)

---

## 🎯 Visão Geral

A plataforma de networking é uma solução fullstack moderna para gestão de grupos de negócios, substituindo controles manuais e planilhas por um sistema centralizado, escalável e eficiente.

### Objetivos Principais

- **Gestão de Membros:** Fluxo completo desde intenção até aprovação e cadastro
- **Engajamento:** Sistema de avisos, check-in em reuniões e comunicação
- **Geração de Negócios:** Indicações, referências e acompanhamento de oportunidades
- **Performance:** Dashboards individuais e coletivos com métricas de desempenho
- **Financeiro:** Controle de mensalidades e status de pagamento

### Princípios Arquiteturais

1. **Separação de Responsabilidades:** Backend (API) e Frontend (UI) desacoplados
2. **Type-Safety:** TypeScript end-to-end para prevenir erros em tempo de compilação
3. **Escalabilidade Horizontal:** Arquitetura stateless pronta para múltiplas instâncias
4. **Manutenibilidade:** Código limpo, modular e bem documentado
5. **Testabilidade:** Componentes isolados e testáveis

---

## 🏗️ Diagrama de Arquitetura

```mermaid
graph TB
    subgraph "Cliente"
        A[Browser - Next.js App]
    end
    
    subgraph "Camada de Aplicação"
        B[Next.js Server]
        C[API Routes]
        D[Server Components]
        E[Client Components]
    end
    
    subgraph "Camada de Negócio"
        F[Services Layer]
        G[Business Logic]
        H[Validations - Zod]
    end
    
    subgraph "Camada de Dados"
        I[Prisma ORM]
        J[(PostgreSQL)]
    end
    
    subgraph "Infraestrutura"
        K[Environment Config]
        L[Logging - Pino]
        M[Error Handling]
    end
    
    A --> B
    B --> C
    B --> D
    D --> E
    C --> F
    F --> G
    G --> H
    H --> I
    I --> J
    
    C -.-> K
    F -.-> L
    C -.-> M
    
    style A fill:#e1f5ff
    style J fill:#ffe1e1
    style B fill:#e8f5e9
```

### Fluxo de Dados

```
[User Action] → [Next.js Client Component] → [API Route] 
    → [Service Layer] → [Prisma ORM] → [PostgreSQL]
    → [Response] → [UI Update]
```

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** (App Router) - Framework React com SSR/SSG
- **React 18** - Biblioteca UI com Server Components
- **TypeScript 5.x** - Type-safety em todo código
- **Tailwind CSS 3.x** - Styling utility-first
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **Recharts** - Visualização de dados para dashboards
- **React Hook Form + Zod** - Gerenciamento e validação de formulários
- **TanStack Query** - Cache e sincronização de dados server-state

### Backend
- **Next.js API Routes** - Endpoints REST integrados
- **Prisma 5.x** - ORM type-safe com migrations
- **Zod** - Validação de schemas runtime
- **bcryptjs** - Hash de senhas (se necessário)
- **jsonwebtoken** - Geração de tokens únicos
- **Pino** - Logging estruturado de alta performance

### Banco de Dados
- **PostgreSQL 15+** - Banco relacional ACID-compliant
- **Prisma Studio** - Interface visual para desenvolvimento

### Testes
- **Jest** - Framework de testes
- **React Testing Library** - Testes de componentes
- **MSW (Mock Service Worker)** - Mock de APIs
- **Supertest** - Testes de integração de API

### DevOps & Ferramentas
- **Docker & Docker Compose** - Containerização
- **ESLint + Prettier** - Linting e formatação
- **Husky + lint-staged** - Git hooks para qualidade
- **GitHub Actions** - CI/CD pipeline

---

## 🗄️ Modelo de Dados

### Justificativa: PostgreSQL + Prisma

**Por que PostgreSQL?**
- ✅ Relacionamentos complexos (membros ↔ indicações ↔ reuniões)
- ✅ Integridade referencial com foreign keys
- ✅ Transações ACID para operações financeiras
- ✅ Suporte nativo a JSON para dados flexíveis (avisos, configurações)
- ✅ Escalabilidade comprovada em produção
- ✅ Full-text search para busca de membros/empresas

**Por que Prisma?**
- ✅ Type-safety automática (tipos TypeScript gerados do schema)
- ✅ Migrations versionadas e reversíveis
- ✅ Query builder intuitivo e seguro (previne SQL injection)
- ✅ Prisma Studio para debug visual
- ✅ Excelente DX (Developer Experience)

### Schema do Banco de Dados

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========================================
// GESTÃO DE MEMBROS
// ========================================

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum MemberStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model Application {
  id                String            @id @default(cuid())
  name              String
  email             String            @unique
  company           String
  motivation        String            @db.Text
  status            ApplicationStatus @default(PENDING)
  
  // Token único para completar cadastro após aprovação
  inviteToken       String?           @unique
  inviteTokenExpiry DateTime?
  
  // Auditoria
  submittedAt       DateTime          @default(now())
  reviewedAt        DateTime?
  reviewedBy        String?           // Admin que aprovou/rejeitou
  
  // Relacionamento com membro criado
  member            Member?
  
  @@index([status])
  @@index([email])
}

model Member {
  id              String       @id @default(cuid())
  
  // Dados básicos (vindos da Application)
  applicationId   String       @unique
  application     Application  @relation(fields: [applicationId], references: [id])
  
  // Dados completos (preenchidos no cadastro final)
  name            String
  email           String       @unique
  phone           String?
  company         String
  position        String?
  bio             String?      @db.Text
  expertise       String[]     // Array de áreas de especialização
  
  // Avatar/Foto
  avatarUrl       String?
  
  // Status e metadata
  status          MemberStatus @default(ACTIVE)
  joinedAt        DateTime     @default(now())
  lastActiveAt    DateTime     @default(now())
  
  // Relacionamentos
  referralsMade      Referral[]   @relation("ReferralGiver")
  referralsReceived  Referral[]   @relation("ReferralReceiver")
  meetingsAsHost     Meeting[]    @relation("MeetingHost")
  meetingsAsGuest    Meeting[]    @relation("MeetingGuest")
  attendances        Attendance[]
  thanksGiven        Thank[]      @relation("ThankGiver")
  thanksReceived     Thank[]      @relation("ThankReceiver")
  payments           Payment[]
  
  @@index([email])
  @@index([status])
}

// ========================================
// COMUNICAÇÃO E ENGAJAMENTO
// ========================================

enum AnnouncementType {
  INFO
  URGENT
  EVENT
  SUCCESS
}

model Announcement {
  id          String           @id @default(cuid())
  title       String
  content     String           @db.Text
  type        AnnouncementType @default(INFO)
  
  // Autor (pode ser admin ou membro)
  authorName  String
  authorRole  String?          // "Admin" ou cargo do membro
  
  // Publicação
  publishedAt DateTime         @default(now())
  expiresAt   DateTime?        // Para avisos temporários
  isPinned    Boolean          @default(false)
  
  @@index([publishedAt])
  @@index([isPinned])
}

model GroupMeeting {
  id          String       @id @default(cuid())
  title       String
  description String?      @db.Text
  scheduledAt DateTime
  location    String?      // Presencial ou link virtual
  
  // Check-in de presença
  attendances Attendance[]
  
  createdAt   DateTime     @default(now())
  
  @@index([scheduledAt])
}

model Attendance {
  id              String        @id @default(cuid())
  
  memberId        String
  member          Member        @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  groupMeetingId  String
  groupMeeting    GroupMeeting  @relation(fields: [groupMeetingId], references: [id], onDelete: Cascade)
  
  checkedInAt     DateTime      @default(now())
  
  @@unique([memberId, groupMeetingId])
  @@index([groupMeetingId])
  @@index([memberId])
}

// ========================================
// GERAÇÃO DE NEGÓCIOS
// ========================================

enum ReferralStatus {
  SENT
  IN_NEGOTIATION
  CLOSED
  DECLINED
}

model Referral {
  id                  String         @id @default(cuid())
  
  // Quem indicou
  giverId             String
  giver               Member         @relation("ReferralGiver", fields: [giverId], references: [id], onDelete: Cascade)
  
  // Para quem foi indicado
  receiverId          String
  receiver            Member         @relation("ReferralReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  
  // Detalhes da indicação
  companyName         String
  contactName         String
  contactInfo         String         // Email, telefone, etc
  opportunityDesc     String         @db.Text
  estimatedValue      Float?         // Valor estimado do negócio
  
  // Acompanhamento
  status              ReferralStatus @default(SENT)
  notes               String?        @db.Text
  
  // Datas
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
  closedAt            DateTime?
  
  // Agradecimento público
  thank               Thank?
  
  @@index([giverId])
  @@index([receiverId])
  @@index([status])
  @@index([createdAt])
}

model Thank {
  id          String   @id @default(cuid())
  
  // Relacionamento com a indicação
  referralId  String   @unique
  referral    Referral @relation(fields: [referralId], references: [id], onDelete: Cascade)
  
  // Quem agradece (recebeu o negócio)
  giverId     String
  giver       Member   @relation("ThankGiver", fields: [giverId], references: [id], onDelete: Cascade)
  
  // Quem é agradecido (fez a indicação)
  receiverId  String
  receiver    Member   @relation("ThankReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  
  // Mensagem pública
  message     String   @db.Text
  isPublic    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  
  @@index([createdAt])
}

// ========================================
// ACOMPANHAMENTO E PERFORMANCE
// ========================================

model Meeting {
  id          String   @id @default(cuid())
  
  // Reunião 1 a 1 entre membros
  hostId      String
  host        Member   @relation("MeetingHost", fields: [hostId], references: [id], onDelete: Cascade)
  
  guestId     String
  guest       Member   @relation("MeetingGuest", fields: [guestId], references: [id], onDelete: Cascade)
  
  scheduledAt DateTime
  completedAt DateTime?
  notes       String?  @db.Text
  
  createdAt   DateTime @default(now())
  
  @@index([hostId])
  @@index([guestId])
  @@index([scheduledAt])
}

// ========================================
// FINANCEIRO
// ========================================

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

model Payment {
  id             String        @id @default(cuid())
  
  memberId       String
  member         Member        @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  // Detalhes do pagamento
  amount         Float
  referenceMonth String        // "2025-01", "2025-02"
  dueDate        DateTime
  paidAt         DateTime?
  
  status         PaymentStatus @default(PENDING)
  
  // Método de pagamento / comprovante
  paymentMethod  String?       // PIX, Boleto, Cartão
  receiptUrl     String?
  
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  @@index([memberId])
  @@index([status])
  @@index([referenceMonth])
}
```

### Relacionamentos Principais

```
Application (1) ←→ (1) Member
Member (1) ←→ (N) Referral (giver)
Member (1) ←→ (N) Referral (receiver)
Member (1) ←→ (N) Meeting (host/guest)
Member (1) ←→ (N) Attendance
Member (1) ←→ (N) Payment
Referral (1) ←→ (0..1) Thank
GroupMeeting (1) ←→ (N) Attendance
```

---

## 🧩 Estrutura de Componentes Frontend

### Organização de Pastas

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Rotas públicas (sem auth)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page
│   │   └── aplicar/
│   │       └── page.tsx          # Formulário de intenção
│   ├── (auth)/                   # Rotas protegidas
│   │   ├── layout.tsx            # Layout com verificação
│   │   ├── admin/
│   │   │   ├── candidatos/
│   │   │   │   └── page.tsx      # Lista de applications
│   │   │   └── dashboard/
│   │   │       └── page.tsx      # Dashboard admin
│   │   └── membro/
│   │       ├── dashboard/
│   │       │   └── page.tsx      # Dashboard do membro
│   │       ├── indicacoes/
│   │       │   └── page.tsx      # Indicações do membro
│   │       └── perfil/
│   │           └── page.tsx
│   ├── cadastro/
│   │   └── [token]/
│   │       └── page.tsx          # Cadastro completo com token
│   └── api/                      # API Routes
│       ├── applications/
│       │   ├── route.ts          # POST criar, GET listar
│       │   └── [id]/
│       │       ├── route.ts      # GET, PATCH
│       │       └── approve/
│       │           └── route.ts  # POST aprovar
│       ├── members/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── referrals/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── dashboard/
│       │   └── stats/
│       │       └── route.ts
│       └── health/
│           └── route.ts
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── ... (outros shadcn)
│   ├── features/                 # Componentes de funcionalidades
│   │   ├── applications/
│   │   │   ├── ApplicationForm.tsx
│   │   │   ├── ApplicationList.tsx
│   │   │   └── ApplicationCard.tsx
│   │   ├── members/
│   │   │   ├── MemberCard.tsx
│   │   │   ├── MemberList.tsx
│   │   │   └── MemberProfile.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ReferralsChart.tsx
│   │   │   └── PerformanceMetrics.tsx
│   │   └── referrals/
│   │       ├── ReferralForm.tsx
│   │       └── ReferralCard.tsx
│   ├── layout/                   # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── shared/                   # Componentes compartilhados
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
│
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── validations.ts            # Schemas Zod
│   ├── utils.ts                  # Funções utilitárias
│   ├── constants.ts              # Constantes da aplicação
│   └── logger.ts                 # Pino logger config
│
├── services/                     # Lógica de negócio
│   ├── applicationService.ts
│   ├── memberService.ts
│   ├── referralService.ts
│   └── dashboardService.ts
│
├── types/
│   ├── api.ts                    # Tipos de request/response
│   ├── models.ts                 # Tipos de domínio
│   └── index.ts
│
└── middleware.ts                 # Middleware Next.js (auth check)
```

### Padrões de Componentização

#### 1. Componentes UI (Atomic Design)
- **Atoms:** Componentes básicos reutilizáveis (Button, Input)
- **Molecules:** Combinações de atoms (FormField, SearchBar)
- **Organisms:** Componentes complexos (ApplicationForm, MemberCard)

#### 2. Server vs Client Components
```tsx
// Server Component (padrão no App Router)
// app/admin/candidatos/page.tsx
export default async function CandidatesPage() {
  const applications = await getApplications(); // Fetch no servidor
  return <ApplicationList applications={applications} />;
}

// Client Component (interatividade)
// components/features/applications/ApplicationList.tsx
'use client';
export function ApplicationList({ applications }) {
  const [filter, setFilter] = useState('all');
  // ... lógica de filtro
}
```

#### 3. Estado Global (Mínimo Necessário)
- **React Context:** Para tema, usuário autenticado (admin/member)
- **TanStack Query:** Para cache de dados da API (membros, indicações)
- **URL State:** Para filtros e paginação (mantém estado na URL)

#### 4. Composição de Formulários
```tsx
// Padrão com React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema } from '@/lib/validations';

export function ApplicationForm() {
  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: { name: '', email: '', company: '', motivation: '' }
  });
  
  // ... submit handler
}
```

---

## 🔌 Definição da API

### Padrões REST

- **Base URL:** `/api/v1` (versionamento futuro)
- **Formato:** JSON (Content-Type: application/json)
- **Status Codes:**
  - `200` OK (sucesso)
  - `201` Created (recurso criado)
  - `400` Bad Request (validação falhou)
  - `401` Unauthorized (não autenticado)
  - `403` Forbidden (sem permissão)
  - `404` Not Found
  - `500` Internal Server Error

### Schema de Resposta Padrão

```typescript
// Sucesso
{
  "success": true,
  "data": { ... },
  "message"?: "Operação realizada com sucesso"
}

// Erro
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      { "field": "email", "message": "Email inválido" }
    ]
  }
}
```

---

### 1. Gestão de Candidaturas (Applications)

#### `POST /api/applications`
**Descrição:** Submeter intenção de participação (formulário público)

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "company": "Tech Solutions Ltda",
  "motivation": "Busco expandir minha rede de contatos e gerar novos negócios..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxyz123abc",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "company": "Tech Solutions Ltda",
    "status": "PENDING",
    "submittedAt": "2025-11-05T14:30:00Z"
  },
  "message": "Candidatura enviada com sucesso! Você receberá um email quando for aprovada."
}
```

**Validações:**
- Email único (não pode duplicar)
- Todos os campos obrigatórios
- Motivação mínima de 50 caracteres

---

#### `GET /api/applications`
**Descrição:** Listar todas as candidaturas (admin only)

**Query Params:**
- `status` (opcional): "PENDING" | "APPROVED" | "REJECTED"
- `page` (opcional): número da página (default: 1)
- `limit` (opcional): itens por página (default: 20)

**Headers:**
```
X-Admin-Token: ${ADMIN_SECRET_TOKEN}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "clxyz123abc",
        "name": "João Silva",
        "email": "joao@empresa.com",
        "company": "Tech Solutions Ltda",
        "motivation": "Busco expandir...",
        "status": "PENDING",
        "submittedAt": "2025-11-05T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

#### `GET /api/applications/:id`
**Descrição:** Obter detalhes de uma candidatura específica (admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxyz123abc",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "company": "Tech Solutions Ltda",
    "motivation": "Busco expandir minha rede...",
    "status": "PENDING",
    "submittedAt": "2025-11-05T14:30:00Z",
    "reviewedAt": null,
    "reviewedBy": null
  }
}
```

---

#### `PATCH /api/applications/:id/approve`
**Descrição:** Aprovar uma candidatura e gerar token de convite (admin only)

**Request:**
```json
{
  "reviewedBy": "Admin Maria"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxyz123abc",
    "status": "APPROVED",
    "inviteToken": "inv_a1b2c3d4e5f6",
    "inviteLink": "https://plataforma.com/cadastro/inv_a1b2c3d4e5f6",
    "inviteTokenExpiry": "2025-11-12T14:30:00Z"
  },
  "message": "Candidatura aprovada! Link de convite gerado."
}
```

**Lógica:**
1. Atualiza status para APPROVED
2. Gera token único com JWT (expira em 7 dias)
3. Salva token no banco
4. Retorna link de cadastro completo
5. (Opcional) Envia email com link (simulado por log)

---

#### `PATCH /api/applications/:id/reject`
**Descrição:** Rejeitar uma candidatura (admin only)

**Request:**
```json
{
  "reviewedBy": "Admin Maria"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxyz123abc",
    "status": "REJECTED",
    "reviewedAt": "2025-11-05T15:00:00Z"
  },
  "message": "Candidatura rejeitada."
}
```

---

### 2. Gestão de Membros

#### `POST /api/members`
**Descrição:** Completar cadastro de membro aprovado (usa token único)

**Request:**
```json
{
  "inviteToken": "inv_a1b2c3d4e5f6",
  "phone": "+55 11 98765-4321",
  "position": "CEO",
  "bio": "Empreendedor com 15 anos de experiência...",
  "expertise": ["Tecnologia", "Vendas", "Marketing Digital"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "mem_xyz789",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "company": "Tech Solutions Ltda",
    "position": "CEO",
    "status": "ACTIVE",
    "joinedAt": "2025-11-05T16:00:00Z"
  },
  "message": "Cadastro completo! Bem-vindo à plataforma."
}
```

**Validações:**
- Token válido e não expirado
- Application deve estar APPROVED
- Membro não pode já existir

---

#### `GET /api/members`
**Descrição:** Listar todos os membros ativos

**Query Params:**
- `status` (opcional): "ACTIVE" | "INACTIVE" | "SUSPENDED"
- `search` (opcional): busca por nome, email ou empresa

**Response (200):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "mem_xyz789",
        "name": "João Silva",
        "company": "Tech Solutions Ltda",
        "position": "CEO",
        "expertise": ["Tecnologia", "Vendas"],
        "avatarUrl": null,
        "joinedAt": "2025-11-05T16:00:00Z"
      }
    ],
    "total": 48
  }
}
```

---

#### `GET /api/members/:id`
**Descrição:** Obter perfil completo de um membro

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "mem_xyz789",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "+55 11 98765-4321",
    "company": "Tech Solutions Ltda",
    "position": "CEO",
    "bio": "Empreendedor com 15 anos...",
    "expertise": ["Tecnologia", "Vendas", "Marketing Digital"],
    "status": "ACTIVE",
    "joinedAt": "2025-11-05T16:00:00Z",
    "stats": {
      "referralsMade": 12,
      "referralsReceived": 8,
      "referralsClosed": 3,
      "thanksReceived": 5,
      "meetingsCompleted": 24
    }
  }
}
```

---

### 3. Dashboard e Métricas

#### `GET /api/dashboard/stats`
**Descrição:** Obter estatísticas gerais da plataforma (admin/member)

**Query Params:**
- `period` (opcional): "week" | "month" | "quarter" | "year" | "all" (default: "month")
- `startDate` (opcional): data início (ISO 8601)
- `endDate` (opcional): data fim (ISO 8601)
- `memberId` (opcional): filtrar por membro específico

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-10-01T00:00:00Z",
      "endDate": "2025-10-31T23:59:59Z",
      "label": "Outubro 2025"
    },
    "members": {
      "total": 48,
      "active": 45,
      "new": 3,
      "inactive": 3
    },
    "referrals": {
      "total": 127,
      "sent": 84,
      "inNegotiation": 23,
      "closed": 15,
      "declined": 5,
      "conversionRate": 17.86,
      "estimatedValue": 450000.00
    },
    "thanks": {
      "total": 12,
      "public": 10
    },
    "meetings": {
      "oneOnOne": 156,
      "group": 4,
      "averagePerMember": 3.25
    },
    "payments": {
      "expected": 48000.00,
      "received": 43500.00,
      "pending": 4500.00,
      "overdue": 1200.00,
      "collectionRate": 90.63
    },
    "topPerformers": [
      {
        "memberId": "mem_xyz789",
        "memberName": "João Silva",
        "referralsMade": 12,
        "referralsClosed": 4,
        "thanksReceived": 6
      }
    ],
    "recentActivity": [
      {
        "type": "REFERRAL_CLOSED",
        "description": "João Silva fechou negócio de R$ 25.000",
        "timestamp": "2025-10-31T18:30:00Z"
      }
    ]
  }
}
```

---

#### `GET /api/dashboard/member/:memberId`
**Descrição:** Dashboard individual do membro

**Response (200):**
```json
{
  "success": true,
  "data": {
    "member": {
      "id": "mem_xyz789",
      "name": "João Silva",
      "company": "Tech Solutions Ltda"
    },
    "currentMonth": {
      "referralsMade": 4,
      "referralsReceived": 2,
      "referralsClosed": 1,
      "thanksReceived": 2,
      "meetingsCompleted": 6,
      "groupMeetingsAttended": 1
    },
    "allTime": {
      "referralsMade": 45,
      "referralsClosed": 12,
      "totalValue": 320000.00,
      "thanksReceived": 18,
      "meetingsCompleted": 87
    },
    "recentReferrals": [
      {
        "id": "ref_abc123",
        "companyName": "Cliente XYZ",
        "status": "IN_NEGOTIATION",
        "createdAt": "2025-10-28T10:00:00Z"
      }
    ],
    "upcomingMeetings": [
      {
        "id": "meet_def456",
        "withMember": "Maria Santos",
        "scheduledAt": "2025-11-06T15:00:00Z"
      }
    ]
  }
}
```

---

#### `GET /api/dashboard/charts/referrals`
**Descrição:** Dados para gráfico de evolução de indicações

**Query Params:**
- `period`: "week" | "month" | "quarter" | "year"
- `memberId` (opcional): filtrar por membro

**Response (200):**
```json
{
  "success": true,
  "data": {
    "labels": ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    "datasets": [
      {
        "label": "Indicações Enviadas",
        "data": [12, 15, 18, 14],
        "color": "#3b82f6"
      },
      {
        "label": "Indicações Fechadas",
        "data": [2, 3, 4, 3],
        "color": "#10b981"
      }
    ]
  }
}
```

---

### 4. Indicações e Referências (Implementação Opcional)

#### `POST /api/referrals`
**Descrição:** Criar nova indicação de negócio

**Request:**
```json
{
  "receiverId": "mem_abc456",
  "companyName": "Empresa ABC Ltda",
  "contactName": "Carlos Souza",
  "contactInfo": "carlos@abc.com | (11) 99999-8888",
  "opportunityDesc": "Empresa precisa de consultoria em TI...",
  "estimatedValue": 50000.00
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "ref_new789",
    "giverId": "mem_xyz789",
    "giverName": "João Silva",
    "receiverId": "mem_abc456",
    "receiverName": "Pedro Costa",
    "companyName": "Empresa ABC Ltda",
    "status": "SENT",
    "createdAt": "2025-11-05T17:00:00Z"
  },
  "message": "Indicação criada com sucesso!"
}
```

---

#### `GET /api/referrals`
**Descrição:** Listar indicações (filtradas por membro logado)

**Query Params:**
- `type`: "made" | "received" | "all"
- `status` (opcional): "SENT" | "IN_NEGOTIATION" | "CLOSED" | "DECLINED"
- `memberId` (obrigatório): ID do membro logado

**Response (200):**
```json
{
  "success": true,
  "data": {
    "referrals": [
      {
        "id": "ref_abc123",
        "type": "made",
        "giver": { "id": "mem_xyz789", "name": "João Silva" },
        "receiver": { "id": "mem_abc456", "name": "Pedro Costa" },
        "companyName": "Empresa ABC Ltda",
        "contactName": "Carlos Souza",
        "status": "IN_NEGOTIATION",
        "estimatedValue": 50000.00,
        "createdAt": "2025-10-28T10:00:00Z",
        "updatedAt": "2025-11-02T14:30:00Z"
      }
    ],
    "summary": {
      "total": 12,
      "sent": 4,
      "inNegotiation": 5,
      "closed": 2,
      "declined": 1
    }
  }
}
```

---

#### `PATCH /api/referrals/:id`
**Descrição:** Atualizar status de uma indicação

**Request:**
```json
{
  "status": "CLOSED",
  "notes": "Contrato fechado em 05/11/2025. Valor final: R$ 48.000"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ref_abc123",
    "status": "CLOSED",
    "closedAt": "2025-11-05T17:30:00Z",
    "notes": "Contrato fechado em 05/11/2025..."
  },
  "message": "Indicação atualizada com sucesso!"
}
```

---

### Middlewares e Tratamento de Erros

#### Middleware de Autenticação (Admin)
```typescript
// middleware.ts ou dentro dos API routes
export function requireAdmin(handler) {
  return async (req, res) => {
    const adminToken = req.headers.get('x-admin-token');
    
    if (adminToken !== process.env.ADMIN_SECRET_TOKEN) {
      return Response.json(
        { 
          success: false, 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'Token de administrador inválido' 
          } 
        },
        { status: 401 }
      );
    }
    
    return handler(req, res);
  };
}
```

#### Middleware de Validação
```typescript
import { z } from 'zod';

export function validateRequest(schema: z.ZodSchema) {
  return async (req) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        };
      }
      throw error;
    }
  };
}
```

---

## 🔒 Segurança e Autenticação

### Estratégia de Autenticação

#### 1. Admin (Simples com Token)
```typescript
// .env.local
ADMIN_SECRET_TOKEN=admin_super_secret_token_xyz_123

// Uso nas rotas protegidas
const isAdmin = req.headers.get('x-admin-token') === process.env.ADMIN_SECRET_TOKEN;
```

**Fluxo:**
1. Admin guarda o token (variável de ambiente)
2. Todas as requisições admin incluem header `X-Admin-Token`
3. Middleware valida o token antes de processar
4. Sem necessidade de login/logout (simplificado)

#### 2. Membros (Token Único para Cadastro)
```typescript
// Geração de token na aprovação
import jwt from 'jsonwebtoken';

const inviteToken = jwt.sign(
  { applicationId: application.id, email: application.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Fluxo:**
1. Admin aprova candidatura
2. Sistema gera token JWT com expiração de 7 dias
3. Link de cadastro: `/cadastro/${inviteToken}`
4. Na página de cadastro, valida token antes de mostrar formulário
5. Após cadastro, token é invalidado (marca como usado)

#### 3. Identificação de Membro Logado (Futuro)
Para dashboards individuais, podemos implementar:
- **Opção A:** Query param `?memberId=xxx` (menos seguro, mas funcional para MVP)
- **Opção B:** NextAuth.js com sessão (mais robusto, mas adiciona complexidade)

**Para o desafio, usaremos Opção A com validação:**
```typescript
// Membro acessa seu dashboard
GET /api/dashboard/member/mem_xyz789

// Validação: verificar se memberId existe e está ACTIVE
```

---

### Medidas de Segurança

#### 1. Validação de Entrada
```typescript
// Sempre validar com Zod antes de processar
const applicationSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().min(2).max(150),
  motivation: z.string().min(50).max(1000)
});
```

#### 2. SQL Injection (Prevenção Automática)
- Prisma usa **prepared statements** automaticamente
- Todas as queries são parametrizadas
- Zero risco de SQL injection

#### 3. Rate Limiting (Implementação Futura)
```typescript
// Proteger endpoints públicos com rate limit
// Exemplo: máximo 5 candidaturas por IP por hora
```

#### 4. CORS
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE' }
        ]
      }
    ];
  }
};
```

#### 5. Variáveis de Ambiente Sensíveis
```env
# .env.local (NUNCA commitar)
DATABASE_URL="postgresql://user:password@localhost:5432/networking"
ADMIN_SECRET_TOKEN="admin_xyz_super_secret_123"
JWT_SECRET="jwt_signing_key_very_secret_456"
NODE_ENV="development"
```

---

## 🧪 Estratégia de Testes

### Pirâmide de Testes

```
       /\
      /  \     E2E (10%)
     /----\    
    /      \   Integration (30%)
   /--------\  
  /          \ Unit (60%)
 /____________\
```

### 1. Testes Unitários (60%)

**O que testar:**
- ✅ Schemas de validação (Zod)
- ✅ Funções utilitárias (formatação, cálculos)
- ✅ Lógica de negócio isolada (services)
- ✅ Componentes React (rendering, props, estado)

**Exemplo: Validação de Application**
```typescript
// lib/validations.test.ts
import { applicationSchema } from './validations';

describe('applicationSchema', () => {
  it('deve aceitar dados válidos', () => {
    const valid = {
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Tech Co',
      motivation: 'A'.repeat(50)
    };
    expect(() => applicationSchema.parse(valid)).not.toThrow();
  });

  it('deve rejeitar email inválido', () => {
    const invalid = { ...valid, email: 'invalid-email' };
    expect(() => applicationSchema.parse(invalid)).toThrow();
  });

  it('deve rejeitar motivação curta', () => {
    const invalid = { ...valid, motivation: 'muito curta' };
    expect(() => applicationSchema.parse(invalid)).toThrow();
  });
});
```

**Exemplo: Componente React**
```typescript
// components/features/applications/ApplicationCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ApplicationCard } from './ApplicationCard';

describe('ApplicationCard', () => {
  const mockApplication = {
    id: '123',
    name: 'João Silva',
    email: 'joao@empresa.com',
    status: 'PENDING'
  };

  it('deve renderizar informações do candidato', () => {
    render(<ApplicationCard application={mockApplication} />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@empresa.com')).toBeInTheDocument();
  });

  it('deve mostrar badge PENDING', () => {
    render(<ApplicationCard application={mockApplication} />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });
});
```

---

### 2. Testes de Integração (30%)

**O que testar:**
- ✅ Endpoints da API (request → response)
- ✅ Integração com banco de dados
- ✅ Fluxos completos (criar → aprovar → cadastrar)

**Setup com Banco de Teste:**
```typescript
// jest.setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL_TEST } }
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Limpar banco antes de cada teste
  await prisma.application.deleteMany();
  await prisma.member.deleteMany();
});
```

**Exemplo: Teste de API Route**
```typescript
// app/api/applications/route.test.ts
import { POST } from './route';

describe('POST /api/applications', () => {
  it('deve criar nova candidatura com sucesso', async () => {
    const request = new Request('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@test.com',
        company: 'Tech Co',
        motivation: 'A'.repeat(50)
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('PENDING');
  });

  it('deve rejeitar email duplicado', async () => {
    // Criar primeira candidatura
    await prisma.application.create({
      data: { 
        name: 'João', 
        email: 'joao@test.com', 
        company: 'Co', 
        motivation: 'text' 
      }
    });

    // Tentar criar duplicada
    const request = new Request('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@test.com',
        company: 'Tech Co',
        motivation: 'A'.repeat(50)
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

---

### 3. Testes E2E (10% - Opcional)

**Ferramentas:** Playwright ou Cypress

**Exemplo de Fluxo:**
```typescript
// e2e/application-flow.spec.ts
import { test, expect } from '@playwright/test';

test('fluxo completo de candidatura e aprovação', async ({ page }) => {
  // 1. Submeter candidatura
  await page.goto('/aplicar');
  await page.fill('[name="name"]', 'João Silva');
  await page.fill('[name="email"]', 'joao@test.com');
  await page.fill('[name="company"]', 'Tech Co');
  await page.fill('[name="motivation"]', 'A'.repeat(50));
  await page.click('button[type="submit"]');
  
  await expect(page.getByText('Candidatura enviada')).toBeVisible();

  // 2. Admin aprova
  await page.goto('/admin/candidatos');
  await page.setExtraHTTPHeaders({ 'X-Admin-Token': process.env.ADMIN_SECRET_TOKEN });
  await page.click('[data-testid="approve-button"]');
  
  await expect(page.getByText('Aprovado')).toBeVisible();

  // 3. Completar cadastro (simulado)
  const inviteToken = await getInviteTokenFromDB('joao@test.com');
  await page.goto(`/cadastro/${inviteToken}`);
  await page.fill('[name="phone"]', '11987654321');
  await page.click('button[type="submit"]');
  
  await expect(page.getByText('Cadastro completo')).toBeVisible();
});
```

---

### 4. Mocks e Fixtures

**Mock de Prisma Client:**
```typescript
// __mocks__/prisma.ts
export const prisma = {
  application: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  member: {
    create: jest.fn(),
    findMany: jest.fn()
  }
};
```

**Fixtures de Dados:**
```typescript
// tests/fixtures/applications.ts
export const mockApplication = {
  id: 'clxyz123',
  name: 'João Silva',
  email: 'joao@test.com',
  company: 'Tech Co',
  motivation: 'Quero expandir rede...',
  status: 'PENDING',
  submittedAt: new Date()
};

export const mockApprovedApplication = {
  ...mockApplication,
  status: 'APPROVED',
  inviteToken: 'inv_abc123',
  inviteTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
};
```

---

### Cobertura Mínima Recomendada

```
Overall:     75%
Statements:  75%
Branches:    70%
Functions:   75%
Lines:       75%

Crítico (90%+):
- Schemas de validação
- Lógica de aprovação/rejeição
- Geração de tokens
- Services de negócio
```

---

## 📈 Escalabilidade e Performance

### 1. Otimizações de Banco de Dados

#### Índices Estratégicos
```prisma
// Já incluídos no schema
@@index([status])        // Filtros por status
@@index([email])         // Busca por email
@@index([createdAt])     // Ordenação temporal
@@index([memberId])      // JOINs frequentes
```

#### Paginação Eficiente
```typescript
// Cursor-based pagination (melhor que offset)
const referrals = await prisma.referral.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastReferralId },
  orderBy: { createdAt: 'desc' }
});
```

#### Queries Otimizadas
```typescript
// Include relacionamentos necessários de uma vez
const member = await prisma.member.findUnique({
  where: { id: memberId },
  include: {
    referralsMade: { where: { status: 'CLOSED' } },
    _count: { 
      select: { 
        referralsMade: true, 
        thanksReceived: true 
      } 
    }
  }
});
```

---

### 2. Caching Strategy

#### Server-Side Caching (React Cache)
```typescript
import { cache } from 'react';

export const getMembers = cache(async () => {
  return await prisma.member.findMany({
    where: { status: 'ACTIVE' }
  });
});
// Automaticamente cacheado durante o request
```

#### Client-Side Caching (TanStack Query)
```typescript
// Configuração global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false
    }
  }
});

// Uso em componentes
const { data: members } = useQuery({
  queryKey: ['members', 'active'],
  queryFn: () => fetch('/api/members').then(r => r.json())
});
```

---

### 3. Performance Frontend

#### Code Splitting
```typescript
// Lazy loading de componentes pesados
const DashboardCharts = dynamic(
  () => import('@/components/features/dashboard/Charts'),
  { loading: () => <LoadingSpinner /> }
);
```

#### Image Optimization
```typescript
import Image from 'next/image';

<Image 
  src={member.avatarUrl} 
  alt={member.name}
  width={100}
  height={100}
  placeholder="blur"
/>
```

#### Server Components (Padrão)
```typescript
// Renderizado no servidor, zero JS no cliente
export default async function MembersPage() {
  const members = await getMembers();
  return <MembersList members={members} />;
}
```

---

### 4. Escalabilidade Horizontal

#### Stateless API
- ✅ Sem sessão no servidor (JWT/tokens stateless)
- ✅ Pode rodar múltiplas instâncias
- ✅ Load balancer distribui requisições

#### Connection Pooling (Prisma)
```typescript
// prisma/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
    // Connection pool otimizado
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### Database Read Replicas (Futuro)
```typescript
// Leituras em replicas, escritas no master
const readPrisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_READ_URL } }
});

const writePrisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_WRITE_URL } }
});
```

---

## 🎯 Decisões Técnicas

### 1. Por que Next.js 14 (App Router)?

**Vantagens:**
- ✅ **Server Components:** Menos JS no cliente, melhor performance
- ✅ **API Routes integradas:** Fullstack em um projeto
- ✅ **File-based routing:** Estrutura intuitiva
- ✅ **Streaming SSR:** Carregamento progressivo
- ✅ **TypeScript first-class:** Suporte nativo excelente
- ✅ **Deploy simplificado:** Vercel, Netlify, Docker

**Trade-offs:**
- ⚠️ Curva de aprendizado (novo paradigma Server/Client)
- ⚠️ Alguns bugs em versões recentes (mas estável desde 14.2)

---

### 2. Por que PostgreSQL + Prisma?

**PostgreSQL:**
- ✅ Relacionamentos complexos (foreign keys, cascades)
- ✅ ACID compliant (crucial para financeiro)
- ✅ JSON support (flexibilidade quando necessário)
- ✅ Full-text search nativo
- ✅ Maturidade e comunidade

**Prisma:**
- ✅ Type-safety (erros em compile-time, não runtime)
- ✅ Migrations versionadas (histórico de mudanças)
- ✅ Introspection (gera schema de DB existente)
- ✅ Prisma Studio (debug visual excelente)
- ✅ Melhor DX do mercado para TypeScript

**Alternativas consideradas:**
- MongoDB: Flexibilidade, mas perde integridade referencial
- Drizzle ORM: Mais leve, mas menos maduro que Prisma
- TypeORM: Mais verboso, decorators complexos

---

### 3. Por que Tailwind CSS + shadcn/ui?

**Tailwind:**
- ✅ Utility-first (produtividade alta)
- ✅ Zero CSS global conflicts
- ✅ Tree-shaking automático (bundle pequeno)
- ✅ Design system consistente (spacing, colors)

**shadcn/ui:**
- ✅ Componentes acessíveis (ARIA compliant)
- ✅ Customizáveis (código no projeto, não node_modules)
- ✅ Radix UI under the hood (robusto)
- ✅ Documentação excelente

---

### 4. Estratégia de Autenticação Simplificada

**Por que não NextAuth.js?**
- ⚠️ Overhead desnecessário para o MVP
- ⚠️ Adiciona complexidade (providers, callbacks, session)
- ⚠️ O desafio permite solução simplificada

**Solução Escolhida:**
- ✅ Admin: Token em variável de ambiente (X-Admin-Token header)
- ✅ Membros: Token único JWT para cadastro
- ✅ Identificação: Query param `memberId` validado

**Migração Futura (Produção):**
- Implementar NextAuth.js com roles (ADMIN, MEMBER)
- OAuth (Google, LinkedIn)
- 2FA para admins

---

### 5. Estrutura Monorepo vs Separado

**Escolha: Monorepo (Frontend + Backend no mesmo projeto)**

**Vantagens:**
- ✅ Compartilhamento de tipos TypeScript
- ✅ Schemas Zod reutilizados (validação front/back)
- ✅ Deploy único
- ✅ Desenvolvimento mais rápido

**Quando separar:**
- Times diferentes (frontend/backend)
- Escalas diferentes (API precisa 10x mais instâncias)
- Deploy independente necessário

---

## 🚀 Roadmap de Implementação

### Fase 1: Setup (Dia 1 - 4h)
- [x] Inicializar Next.js 14 + TypeScript
- [x] Configurar Prisma + PostgreSQL
- [x] Setup Tailwind + shadcn/ui
- [x] Estrutura de pastas
- [x] Configurar ESLint + Prettier
- [x] Configurar Jest + RTL

### Fase 2: Modelo de Dados (Dia 1-2 - 3h)
- [x] Definir schema Prisma completo
- [x] Criar migrations
- [x] Seed inicial (dados de teste)
- [x] Testar relacionamentos no Prisma Studio

### Fase 3: Fluxo de Admissão (Dia 2-3 - 10h)
- [x] API POST /api/applications
- [x] Página pública /aplicar
- [x] API GET /api/applications (admin)
- [x] Página admin /admin/candidatos
- [x] API PATCH aprovar/rejeitar
- [x] API POST /api/members (cadastro completo)
- [x] Página /cadastro/[token]
- [x] Testes unitários e integração

### Fase 4: Dashboard (Dia 3-4 - 8h)
- [x] API GET /api/dashboard/stats
- [x] Componentes de gráficos (Recharts)
- [x] Página /admin/dashboard
- [x] Dashboard individual (opcional)
- [x] Testes de componentes

### Fase 5: Qualidade & Docs (Dia 4-5 - 6h)
- [x] Cobertura de testes mínima (75%)
- [x] README.md completo
- [x] Variáveis de ambiente documentadas
- [x] Docker Compose (opcional)
- [x] CI/CD GitHub Actions
- [x] Revisão de código e refatoração
- [x] Deploy de demonstração (Vercel)

---

## 📦 Estrutura de Deploy

### Desenvolvimento Local

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/networking-platform.git
cd networking-platform

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 4. Setup do banco de dados
docker-compose up -d postgres  # Subir PostgreSQL
npx prisma migrate dev         # Rodar migrations
npx prisma db seed            # Popular dados iniciais

# 5. Iniciar desenvolvimento
npm run dev
```

### Docker Compose (Desenvolvimento)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: networking-db
    environment:
      POSTGRES_USER: networking
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: networking_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U networking"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: networking-app
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://networking:dev_password@postgres:5432/networking_dev
      NODE_ENV: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

### Dockerfile (Produção)

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# 1. Dependências
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2. Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 3. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Deploy em Produção (Vercel - Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar variáveis de ambiente no dashboard
# https://vercel.com/seu-usuario/networking-platform/settings/environment-variables
```

**Variáveis de Ambiente (Vercel):**
```
DATABASE_URL=postgresql://user:pass@host:5432/db (usar Neon, Supabase ou Railway)
ADMIN_SECRET_TOKEN=seu_token_super_secreto_aqui
JWT_SECRET=chave_secreta_para_jwt_tokens
NODE_ENV=production
```

---

## 🔧 Configurações Adicionais

### GitHub Actions (CI/CD)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: postgresql://dummy:dummy@localhost:5432/dummy
```

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:testing-library/react",
    "plugin:jest-dom/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "testing-library", "jest-dom"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "prefer-const": "error"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e": "playwright test",
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "tsx prisma/seed.ts",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "prepare": "husky install"
  }
}
```

---

## 🎨 Design System e Componentes UI

### Paleta de Cores (Tailwind)

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',  // Azul principal
          600: '#2563eb',
          900: '#1e3a8a',
        },
        success: {
          500: '#10b981',  // Verde (indicações fechadas)
          600: '#059669',
        },
        warning: {
          500: '#f59e0b',  // Amarelo (pendente)
          600: '#d97706',
        },
        danger: {
          500: '#ef4444',  // Vermelho (rejeitado)
          600: '#dc2626',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          500: '#6b7280',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    }
  }
};
```

### Componentes Principais (shadcn/ui)

**Instalar componentes necessários:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dropdown-menu
```

**Exemplo de Uso:**
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatsCard({ title, value, icon }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
```

---

## 📊 Métricas e Monitoramento

### Logging Estruturado (Pino)

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Uso
logger.info({ userId: '123', action: 'login' }, 'User logged in');
logger.error({ err: error }, 'Database connection failed');
```

### Error Tracking (Opcional - Sentry)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Remover dados sensíveis
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  },
});
```

### Performance Monitoring

```typescript
// Exemplo de tracking de performance em API
export async function GET(request: Request) {
  const start = Date.now();
  
  try {
    const data = await fetchData();
    const duration = Date.now() - start;
    
    logger.info({ duration, endpoint: '/api/members' }, 'API request completed');
    
    return Response.json({ success: true, data });
  } catch (error) {
    logger.error({ error, endpoint: '/api/members' }, 'API request failed');
    throw error;
  }
}
```

---

## 🔐 Backup e Recuperação

### Backup Automatizado (PostgreSQL)

```bash
# Script de backup diário
# scripts/backup.sh
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="networking_production"

pg_dump -U $DB_USER -h $DB_HOST $DB_NAME | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### Restauração

```bash
# Restaurar backup
gunzip -c backup_20250105_120000.sql.gz | psql -U $DB_USER -h $DB_HOST -d $DB_NAME
```

---

## 📈 Métricas de Sucesso do Projeto

### KPIs Técnicos
- ✅ **Cobertura de Testes:** ≥ 75%
- ✅ **Lighthouse Score:** ≥ 90
- ✅ **Tempo de Build:** ≤ 2 minutos
- ✅ **Tempo de Response API:** ≤ 200ms (p95)
- ✅ **Zero vulnerabilidades críticas:** `npm audit`

### KPIs de Negócio (Para Demonstração)
- ✅ **Taxa de Aprovação:** 60-70% das candidaturas
- ✅ **Tempo de Onboarding:** ≤ 48h (submissão → cadastro completo)
- ✅ **Indicações por Membro/Mês:** ≥ 2
- ✅ **Taxa de Conversão:** ≥ 15% (indicações → negócios fechados)

---

## 🚦 Checklist de Qualidade

### Antes de Submeter

#### Código
- [ ] Todos os testes passando (`npm run test:ci`)
- [ ] Cobertura ≥ 75% (`npm run test:ci -- --coverage`)
- [ ] Linter sem erros (`npm run lint`)
- [ ] Type-check sem erros (`npm run type-check`)
- [ ] Build completo com sucesso (`npm run build`)

#### Documentação
- [ ] README.md completo e atualizado
- [ ] ARQUITETURA.md revisado e finalizado
- [ ] Variáveis de ambiente documentadas (.env.example)
- [ ] Comentários em código complexo
- [ ] API endpoints documentados

#### Funcionalidades
- [ ] Fluxo de candidatura funcionando end-to-end
- [ ] Área admin acessível e funcional
- [ ] Cadastro completo com token validado
- [ ] Dashboard com dados reais renderizando
- [ ] Tratamento de erros em todas as rotas

#### Qualidade
- [ ] Sem `console.log` em produção
- [ ] Sem secrets commitados
- [ ] Sem `any` desnecessários em TypeScript
- [ ] Componentes React otimizados (memo quando necessário)
- [ ] Queries de banco otimizadas (índices, N+1 prevenido)

#### Git
- [ ] Histórico de commits limpo e semântico
- [ ] Branch `main` estável
- [ ] `.gitignore` configurado corretamente
- [ ] Sem arquivos sensíveis no repositório

---

## 📚 Referências e Recursos

### Documentação Oficial
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Artigos e Guias
- [Next.js Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [React Server Components Explained](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Ferramentas Úteis
- [Prisma Studio](https://www.prisma.io/studio) - Visualizar dados
- [Excalidraw](https://excalidraw.com/) - Criar diagramas
- [Mermaid Live Editor](https://mermaid.live/) - Editar diagramas
- [Transform](https://transform.tools/) - Conversões de código

---

## 🎓 Considerações Finais

### Pontos Fortes da Arquitetura

1. **Type-Safety End-to-End:** TypeScript + Prisma + Zod = zero erros de tipo em runtime
2. **Escalabilidade:** Stateless API, connection pooling, queries otimizadas
3. **Manutenibilidade:** Código modular, componentes reutilizáveis, testes abrangentes
4. **Performance:** Server Components, caching, code splitting
5. **Developer Experience:** Hot reload, Prisma Studio, logs estruturados

### Melhorias Futuras (Pós-MVP)

#### Curto Prazo (1-2 meses)
- [ ] Autenticação completa com NextAuth.js
- [ ] Sistema de notificações (email + push)
- [ ] Upload de avatares (AWS S3 / Cloudinary)
- [ ] Busca full-text de membros (PostgreSQL tsvector)
- [ ] Exportação de relatórios (PDF / Excel)

#### Médio Prazo (3-6 meses)
- [ ] Sistema de gamificação (badges, rankings)
- [ ] Chat em tempo real (Socket.io / Pusher)
- [ ] Mobile app (React Native)
- [ ] Integração com calendários (Google Calendar)
- [ ] Webhooks para integrações externas

#### Longo Prazo (6-12 meses)
- [ ] Multi-tenancy (múltiplos grupos)
- [ ] IA para matching de indicações
- [ ] Analytics avançado (BI dashboards)
- [ ] Marketplace de serviços entre membros
- [ ] API pública com rate limiting

---

## 📞 Contato e Suporte

**Desenvolvido por:** [Seu Nome]  
**Email:** seu.email@example.com  
**LinkedIn:** [linkedin.com/in/seu-perfil](https://linkedin.com/in/seu-perfil)  
**GitHub:** [github.com/seu-usuario](https://github.com/seu-usuario)

---

## 📄 Licença

Este projeto foi desenvolvido como parte de um processo seletivo e é fornecido "como está", sem garantias.

**Nota:** Este documento reflete o planejamento arquitetural completo. A implementação no código seguirá estas diretrizes com as adaptações necessárias durante o desenvolvimento.

---

**Última atualização:** 05 de Novembro de 2025  
**Versão:** 1.0.0