# 🚀 DEPLOYMENT GUIDE

## Sistema: Global Business Automation Suite

---

## 📋 PRÉ-REQUISITOS

- Node.js 18+
- npm ou yarn
- Cloudflare Account (para D1)
- Contas nos serviços:
  - Asaas (pagamentos Brasil)
  - Gmail API
  - Google Drive API
  - Intercom
  - Cloudinary
  - Hugging Face

---

## 🔧 CONFIGURAÇÃO LOCAL

### 1. Clone e Instale

```bash
git clone <repo-url>
cd onix
npm install
```

### 2. Configure Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=<generate-with-openssl>

# Database (Local)
DATABASE_URL=file:./dev.db

# Asaas
ASAAS_API_KEY=<your-asaas-key>

# Gmail
GMAIL_CLIENT_ID=<your-gmail-client-id>
GMAIL_CLIENT_SECRET=<your-gmail-client-secret>
GMAIL_REFRESH_TOKEN=<your-gmail-refresh-token>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Hugging Face
HUGGINGFACE_API_KEY=<your-hf-api-key>
```

### 3. Configure o Banco de Dados

```bash
npm run db:push
```

### 4. Rode em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## ☁️ DEPLOY VERCEL (Recomendado)

### 1. Instale o Vercel CLI

```bash
npm i -g vercel
```

### 2. Configure o Cloudflare D1

```bash
# No dashboard da Cloudflare
# 1. Crie um banco D1
# 2. Copie a connection string
# 3. Adicione nas variáveis de ambiente
```

### 3. Deploy

```bash
vercel
```

### 4. Configure Variáveis de Ambiente

No dashboard da Vercel:
- Settings → Environment Variables
- Adicione TODAS as variáveis do `.env.example`

### 5. Webhooks

Configure os webhooks no Asaas/PayPal para apontarem para:
- `https://seu-dominio.vercel.app/api/webhooks/asaas`
- `https://seu-dominio.vercel.app/api/webhooks/paypal`

---

## 🔐 CONFIGURAÇÃO DE SERVIÇOS

### **1. Asaas (Pagamentos)**

1. Acesse https://asaas.com
2. Crie uma conta
3. Vá em Configurações → API
4. Copie a API Key
5. Configure o webhook:
   - URL: `https://seu-dominio/api/webhooks/asaas`
   - Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED

### **2. Gmail API**

1. Acesse https://console.cloud.google.com
2. Crie um projeto
3. Ative Gmail API
4. Crie credenciais OAuth 2.0
5. Gere refresh token usando:

```bash
npm run generate-gmail-token
```

### **3. Google Drive API**

1. No mesmo projeto do Gmail
2. Ative Google Drive API
3. Use as mesmas credenciais OAuth
4. Crie uma pasta principal no Drive
5. Copie o ID da pasta

### **4. Cloudinary**

1. Acesse https://cloudinary.com
2. Crie uma conta gratuita
3. Copie Cloud Name, API Key e API Secret

### **5. Hugging Face**

1. Acesse https://huggingface.co
2. Crie uma conta
3. Vá em Settings → Access Tokens
4. Crie um token com permissão de read

### **6. Intercom**

1. Acesse https://intercom.com
2. Crie uma conta
3. Vá em Settings → Developers → Access Tokens
4. Crie um token

---

## 🗄️ BANCO DE DADOS

### **SQLite (Desenvolvimento)**
Usado automaticamente em desenvolvimento.

### **Cloudflare D1 (Produção)**

1. Crie o banco:
```bash
npx wrangler d1 create business-automation
```

2. Atualize `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "business-automation"
database_id = "<database-id>"
```

3. Execute migrações:
```bash
npx wrangler d1 execute business-automation --file=./drizzle/schema.sql
```

---

## 🔒 SEGURANÇA

### **1. JWT Secret**

Gere uma chave segura:
```bash
openssl rand -base64 32
```

### **2. Rate Limiting**

Já implementado nas APIs. Configurável em:
- `src/lib/middleware/rate-limit.ts`

### **3. CORS**

Configure domínios permitidos em:
- `src/lib/middleware/security.ts`

### **4. Webhooks**

Sempre valide assinaturas:
```typescript
validateWebhookSignature(payload, signature, secret)
```

---

## 📊 MONITORAMENTO

### **1. Sentry (Errors)**

```bash
npm install @sentry/nextjs
```

Configure em `sentry.config.js`:
```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})
```

### **2. Vercel Analytics**

Já incluído automaticamente no deploy.

### **3. Logs**

Sistema de logging interno em:
- `src/lib/logger.ts`

Acesse logs via API:
```
GET /api/admin/logs
```

---

## 🔄 CI/CD

### **GitHub Actions**

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🧪 TESTES

### **Rodar Testes**

```bash
npm run test
npm run test:e2e
npm run test:coverage
```

---

## 📈 PERFORMANCE

### **1. Redis Cache**

Instale Redis (Upstash recomendado):
```bash
npm install ioredis
```

Configure:
```env
REDIS_URL=<your-upstash-url>
```

### **2. CDN**

Vercel já inclui CDN global automático.

### **3. Image Optimization**

Cloudinary otimiza automaticamente.

---

## 🔄 BACKUP

### **Automatizado**

Configure backup diário do D1:
```bash
# No Cloudflare dashboard
# D1 → Seu banco → Backups → Enable Daily Backups
```

### **Manual**

```bash
npx wrangler d1 export business-automation --output=backup.sql
```

---

## 🚨 TROUBLESHOOTING

### **Erro: Database connection failed**
- Verifique `DATABASE_URL`
- Rode `npm run db:push`

### **Erro: Webhook not working**
- Verifique URLs configuradas no gateway
- Valide assinatura do webhook

### **Erro: Token expired**
- Gere novo refresh token do Gmail/Drive

---

## 📞 SUPORTE

- **Documentação:** `/docs`
- **API Reference:** `/docs/API.md`
- **Arquitetura:** `/ARCHITECTURE.md`

---

**Deploy completo e pronto para produção!** 🚀
