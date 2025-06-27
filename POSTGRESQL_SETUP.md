# Configuração PostgreSQL - Minimal Reviews

Este projeto foi migrado do SQLite para PostgreSQL para melhor compatibilidade com a Vercel.

## Configuração Local

### 1. Instalar PostgreSQL
```bash
# Windows (usando chocolatey)
choco install postgresql

# macOS (usando homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

### 2. Criar Banco de Dados
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE minimalreviews;

# Criar usuário (opcional)
CREATE USER minimalreviews_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE minimalreviews TO minimalreviews_user;
```

### 3. Configurar Variável de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
SHOPIFY_API_KEY="your_api_key_here"
SHOPIFY_API_SECRET="your_api_secret_here"
SCOPES="write_products,read_orders,write_webhooks"
HOST="your_app_url_here"

# PostgreSQL Local
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/minimalreviews"

# Ou com usuário específico
DATABASE_URL="postgresql://minimalreviews_user:sua_senha@localhost:5432/minimalreviews"

# Configurações de email
MAILTRAP_API_TOKEN="your_mailtrap_token"
MAILTRAP_INBOX_ID="your_inbox_id"
RWS_BASE_URL="https://your-rws-domain.vercel.app"
```

## Configuração na Vercel

### 1. Criar Banco PostgreSQL
Recomendamos usar um dos seguintes provedores:

- **Vercel Postgres** (mais fácil integração)
- **Supabase** (gratuito até 500MB)
- **Railway** (simples de usar)
- **Neon** (serverless PostgreSQL)

### 2. Configurar Variáveis de Ambiente na Vercel
No painel da Vercel, vá em Settings > Environment Variables e adicione:

```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_orders,write_webhooks
HOST=https://your-app.vercel.app
MAILTRAP_API_TOKEN=your_token
MAILTRAP_INBOX_ID=your_inbox_id
RWS_BASE_URL=https://your-rws-domain.vercel.app
```

## Comandos de Migração

### Primeira Migração
```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Criar e aplicar primeira migração
npx prisma migrate dev --name init

# Executar seed (opcional)
npx prisma db seed
```

### Aplicar Migrações em Produção
```bash
npx prisma migrate deploy
```

### Reset do Banco (desenvolvimento)
```bash
npx prisma migrate reset
```

## Verificação da Conexão

Para testar a conexão com o banco:

```bash
npx prisma studio
```

Isso abrirá uma interface web para visualizar e editar os dados.

## Troubleshooting

### Erro de SSL
Se você receber erros de SSL, adicione `?sslmode=require` na URL do banco:
```
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
```

### Erro de Conexão
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais na DATABASE_URL
- Teste a conectividade com `psql` ou `pgAdmin`

### Migrações Pendentes
Se houver problemas com migrações:
```bash
npx prisma migrate status
npx prisma migrate resolve --applied "migration_name"
```

## Estrutura do Banco

O banco contém as seguintes tabelas:
- `Session` - Sessões do Shopify
- `Review` - Reviews dos produtos
- `ReviewInvitation` - Convites para reviews
- `EmailSettings` - Configurações de email
- `ReviewTemplate` - Templates de email

Todas as tabelas são criadas automaticamente pelas migrações do Prisma. 