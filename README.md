# 🚀 Plataforma de Networking

Sistema completo de gestão para grupos de networking com foco em geração de negócios.

> **Desafio Técnico:** Desenvolvimento Fullstack - Next.js + TypeScript + Prisma + PostgreSQL

---

## 📋 Sobre o Projeto

Plataforma web que substitui planilhas e controles manuais, oferecendo gestão centralizada de membros, interações, reuniões e negócios em grupos de networking profissional.

### ✨ Funcionalidades Implementadas

#### 🔹 Módulo Obrigatório: Fluxo de Admissão de Membros
- ✅ **Página Pública** (`/aplicar`) - Formulário de intenção de participação
- ✅ **Área Admin** (`/admin/candidatos`) - Gestão de candidaturas (aprovar/rejeitar)
- ✅ **Cadastro Completo** (`/cadastro/[token]`) - Formulário para membros aprovados com token JWT

#### 🔹 Módulo Opcional: Dashboard de Performance
- ✅ **Dashboard Administrativo** (`/admin/dashboard`)
- ✅ Métricas em tempo real (membros ativos, indicações, obrigados)
- ✅ Indicações por status (enviadas, em negociação, fechadas, recusadas)
- ✅ Ranking top 5 membros com mais indicações

---

## 🛠️ Stack Tecnológica

### **Frontend**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui (componentes)
- React Hook Form + Zod (validação)
- Recharts (gráficos)

### **Backend**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT (autenticação)
- Zod (validação server-side)

### **Testes**
- Jest
- React Testing Library
- 30+ testes automatizados

### **DevOps**
- Docker Compose (PostgreSQL local)
- ESLint + Prettier
- Husky (git hooks)
- GitHub Actions (CI/CD)

---

## 📦 Instalação e Execução

### **Pré-requisitos**
- Node.js 20+ 
- Docker (ou PostgreSQL instalado)
- Git

### **1. Clonar o Repositório**
```bash
git clone https://github.com/Inovaall/plataforma-networking.git
cd plataforma-networking
```

### **2. Instalar Dependências**
```bash
npm install
```

### **3. Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar .env.local com suas credenciais
# DATABASE_URL=postgresql://...
# ADMIN_SECRET_TOKEN=seu_token_aqui
# JWT_SECRET=sua_chave_jwt_aqui
```

### **4. Iniciar PostgreSQL (Docker)**
```bash
npm run docker:up
```

### **5. Rodar Migrations e Seed**
```bash
# Criar tabelas no banco
npm run prisma:migrate

# Popular com dados de teste
npm run prisma:seed
```

### **6. Iniciar Servidor de Desenvolvimento**
```bash
npm run dev
```

Acesse: **http://localhost:3000** 🎉

---

## 🔐 Acessos e Credenciais

### **Admin**
Para acessar rotas administrativas, use o header:
```
X-Admin-Token: admin_super_secret_token_change_me_in_production
```

### **Token de Convite**
Após aprovar uma candidatura, o sistema gera um token JWT válido por 7 dias.  
Link exemplo: `http://localhost:3000/cadastro/[token]`

---

## 🗺️ Rotas da Aplicação

### **Páginas Públicas**
- `/` - Landing page
- `/aplicar` - Formulário de candidatura

### **Páginas Administrativas**
- `/admin/candidatos` - Gestão de candidaturas
- `/admin/dashboard` - Dashboard de performance

### **Páginas com Token**
- `/cadastro/[token]` - Cadastro completo de membro

---

## 🔌 API Endpoints

### **Applications (Candidaturas)**
```
POST   /api/applications              # Criar candidatura
GET    /api/applications              # Listar (admin)
GET    /api/applications/:id          # Buscar por ID (admin)
POST   /api/applications/:id/approve  # Aprovar (admin)
POST   /api/applications/:id/reject   # Rejeitar (admin)
```

### **Members (Membros)**
```
POST   /api/members                   # Cadastro completo com token
GET    /api/members                   # Listar membros ativos
```

### **Dashboard**
```
GET    /api/dashboard/stats           # Estatísticas gerais (admin)
```

### **Health Check**
```
GET    /api/health                    # Status da API
```

---

## 🧪 Testes

### **Rodar Todos os Testes**
```bash
npm test
```

### **Testes com Cobertura**
```bash
npm run test:ci
```

### **Cobertura Atual**
- ✅ 30 testes passando
- ✅ 4 suites completas
- ✅ Validações Zod
- ✅ Autenticação JWT
- ✅ Componentes React
- ✅ Funções utilitárias

---

## 🏗️ Estrutura do Projeto
```
plataforma-networking/
├── prisma/
│   ├── schema.prisma           # Modelo do banco
│   └── seed.ts                 # Dados de teste
├── src/
│   ├── app/
│   │   ├── (public)/           # Rotas públicas
│   │   ├── (auth)/             # Rotas autenticadas
│   │   └── api/                # API Routes
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── features/           # Componentes de funcionalidades
│   │   └── shared/             # Componentes compartilhados
│   ├── lib/
│   │   ├── prisma.ts           # Cliente Prisma
│   │   ├── validations.ts      # Schemas Zod
│   │   ├── auth.ts             # Autenticação
│   │   └── utils.ts            # Utilitários
│   ├── services/               # Lógica de negócio
│   └── types/                  # Tipos TypeScript
├── ARQUITETURA.md              # Documentação técnica
└── README.md                   # Este arquivo
```

---

## 📊 Modelo de Dados

### **Entidades Principais**
- **Application** - Candidaturas de intenção
- **Member** - Membros ativos do grupo
- **Referral** - Indicações de negócios
- **Thank** - Agradecimentos por negócios fechados

Ver detalhes completos no [ARQUITETURA.md](./ARQUITETURA.md)

---

## 🚀 Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Servidor de produção
npm run lint             # Verificar código
npm run format           # Formatar código
npm run type-check       # Verificar tipos TypeScript

# Banco de Dados
npm run prisma:studio    # Interface visual do banco
npm run prisma:migrate   # Criar nova migration
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:seed      # Popular dados de teste

# Testes
npm test                 # Testes em watch mode
npm run test:ci          # Testes com coverage

# Docker
npm run docker:up        # Iniciar PostgreSQL
npm run docker:down      # Parar PostgreSQL
npm run docker:logs      # Ver logs
```

---

## 🎨 Design e UX

- Interface responsiva (mobile-first)
- Design limpo e profissional com Tailwind CSS
- Componentes acessíveis (ARIA compliant)
- Feedback visual (loading, success, error states)
- Validação em tempo real nos formulários

---

## 🔒 Segurança

- Validação de entrada com Zod (client + server)
- Tokens JWT com expiração
- Autenticação via headers (X-Admin-Token)
- Prepared statements (Prisma - previne SQL injection)
- Variáveis de ambiente para secrets
- CORS configurado

---

## 📈 Performance

- Server Components (menos JS no cliente)
- Static Generation onde possível
- Code splitting automático (Next.js)
- Otimização de imagens (next/image)
- Índices no banco de dados
- Connection pooling (Prisma)

---

## 🧩 Arquitetura

### **Decisões Técnicas**

1. **Next.js 14 (App Router)**: Fullstack integrado, Server Components, melhor DX
2. **PostgreSQL + Prisma**: Relacionamentos complexos, type-safety, migrations versionadas
3. **Tailwind + shadcn/ui**: Produtividade, componentes acessíveis, customizáveis
4. **Monorepo**: Compartilhamento de tipos, deploy único, desenvolvimento mais rápido

Ver detalhes completos no [ARQUITETURA.md](./ARQUITETURA.md)

---

## 🎯 Próximas Melhorias

- [ ] Autenticação completa com NextAuth.js
- [ ] Sistema de notificações (email + push)
- [ ] Upload de avatares (AWS S3 / Cloudinary)
- [ ] Busca full-text de membros
- [ ] Exportação de relatórios (PDF / Excel)
- [ ] Testes E2E com Playwright
- [ ] Deploy em produção (Vercel)

---

## 📝 Notas de Desenvolvimento

### **Convenções**
- Commits semânticos (feat, fix, test, docs, chore)
- Componentes em PascalCase
- Arquivos utilitários em camelCase
- Testes em `*.test.ts(x)`

### **Qualidade**
- ESLint configurado
- Prettier para formatação
- Husky para git hooks
- TypeScript strict mode
- Testes automatizados
