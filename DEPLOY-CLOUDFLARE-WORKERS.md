# 🚀 DEPLOY PARA CLOUDFLARE WORKERS

**Guia Completo de Deploy do Sistema de Automação Empresarial**

---

## 📋 PRÉ-REQUISITOS

1. **Conta Cloudflare** (gratuita ou paga)
   - Criar em: https://dash.cloudflare.com/sign-up

2. **Wrangler CLI** instalado
   ```bash
   npm install -g wrangler
   ```

3. **Node.js 18+** instalado

4. **Autenticação Cloudflare**
   ```bash
   wrangler login
   ```

---

## 🔧 PASSO 1: PREPARAR O PROJETO

### 1.1 Substituir Arquivos

Os arquivos para Workers foram criados com sufixo `-workers` ou `-d1`. Você precisa substituir os originais:

```bash
# Backup dos arquivos originais
mv src/lib/db/index.ts src/lib/db/index-original.ts
mv src/lib/auth.ts src/lib/auth-original.ts
mv src/lib/cache/redis.ts src/lib/cache/redis-original.ts
mv package.json package-original.json

# Usar versões Workers
cp src/lib/db/index-d1.ts src/lib/db/index.ts
cp src/lib/auth-workers.ts src/lib/auth.ts
cp src/lib/cache/kv.ts src/lib/cache/redis.ts
cp package-workers.json package.json
```

### 1.2 Instalar Dependências

```bash
npm install
```

### 1.3 Adicionar @cloudflare/next-on-pages

```bash
npm install -D @cloudflare/next-on-pages @cloudflare/workers-types wrangler
```

---

## 🗄️ PASSO 2: CONFIGURAR CLOUDFLARE D1 (Banco de Dados)

### 2.1 Criar Database D1

```bash
wrangler d1 create business_automation_db
```

**Saída esperada:**
```
✅ Successfully created DB 'business_automation_db'

[[d1_databases]]
binding = "DB"
database_name = "business_automation_db"
database_id = "xxxxx-xxxxx-xxxxx-xxxxx"
```

### 2.2 Copiar database_id para wrangler.toml

Edite `wrangler.toml` e cole o `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "business_automation_db"
database_id = "COLE_O_ID_AQUI"  # ← substituir
```

### 2.3 Executar Schema SQL

```bash
wrangler d1 execute business_automation_db --file=./schema.sql
```

**Verificar se funcionou:**
```bash
wrangler d1 execute business_automation_db --command="SELECT * FROM users"
```

---

## 💾 PASSO 3: CONFIGURAR CLOUDFLARE KV (Cache)

### 3.1 Criar KV Namespace (Produção)

```bash
wrangler kv:namespace create "CACHE_KV"
```

**Saída:**
```
🌀 Creating namespace with title "global-business-automation-CACHE_KV"
✨ Success!
Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "CACHE_KV"
id = "xxxxx"
```

### 3.2 Criar KV Namespace (Preview/Dev)

```bash
wrangler kv:namespace create "CACHE_KV" --preview
```

**Saída:**
```
[[kv_namespaces]]
binding = "CACHE_KV"
preview_id = "yyyyy"
```

### 3.3 Atualizar wrangler.toml

```toml
[[kv_namespaces]]
binding = "CACHE_KV"
id = "xxxxx"           # ← ID de produção
preview_id = "yyyyy"   # ← ID de preview
```

---

## 📦 PASSO 4: CONFIGURAR CLOUDFLARE R2 (Storage)

### 4.1 Criar R2 Bucket

```bash
wrangler r2 bucket create business-automation-uploads
```

### 4.2 Criar Preview Bucket (opcional)

```bash
wrangler r2 bucket create business-automation-uploads-preview
```

### 4.3 Verificar em wrangler.toml

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "business-automation-uploads"
preview_bucket_name = "business-automation-uploads-preview"
```

---

## 🔐 PASSO 5: CONFIGURAR SECRETS

**IMPORTANTE**: Nunca commite secrets no wrangler.toml!

### 5.1 JWT Secret

```bash
wrangler secret put JWT_SECRET
# Digite um secret forte (ex: gere com: openssl rand -base64 32)
```

### 5.2 Gmail (para envio de emails)

```bash
wrangler secret put GMAIL_CLIENT_ID
wrangler secret put GMAIL_CLIENT_SECRET
wrangler secret put GMAIL_REFRESH_TOKEN
wrangler secret put GMAIL_FROM_EMAIL
```

**Como obter credenciais Gmail:**
1. Acesse https://console.cloud.google.com/
2. Crie projeto
3. Ative Gmail API
4. Crie credenciais OAuth 2.0
5. Obtenha refresh token usando OAuth Playground

### 5.3 Outros Secrets

```bash
# Asaas (pagamentos)
wrangler secret put ASAAS_API_KEY
wrangler secret put ASAAS_API_URL

# PayPal
wrangler secret put PAYPAL_CLIENT_ID
wrangler secret put PAYPAL_CLIENT_SECRET
wrangler secret put PAYPAL_MODE

# Cloudinary
wrangler secret put CLOUDINARY_CLOUD_NAME
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET

# Hugging Face
wrangler secret put HUGGING_FACE_API_KEY

# Intercom
wrangler secret put INTERCOM_ACCESS_TOKEN
```

### 5.4 Listar Secrets Configurados

```bash
wrangler secret list
```

---

## 🏗️ PASSO 6: BUILD PARA WORKERS

### 6.1 Instalar Edge Runtime Config

Crie `next.config.js` se ainda não existir:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // IMPORTANTE: Edge runtime para Workers
  experimental: {
    runtime: 'experimental-edge',
  },
  images: {
    // Cloudflare Images ou outro CDN
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig
```

### 6.2 Build Next.js para Workers

```bash
npx @cloudflare/next-on-pages
```

**Saída esperada:**
```
⚡ @cloudflare/next-on-pages CLI v1.x.x
✨ Detected Package Manager: npm (10.x.x)
✨ Preparing project...
✨ Building project...
✨ Completed in X.XXs
✨ Compiled successfully!
```

### 6.3 Verificar Build

```bash
ls .vercel/output/static
```

Deve conter:
- `_worker.js` (Workers bundle)
- `_routes.json`
- Arquivos estáticos

---

## 🧪 PASSO 7: TESTAR LOCALMENTE

### 7.1 Desenvolvimento Local

```bash
npx wrangler pages dev .vercel/output/static \
  --binding DB=business_automation_db \
  --kv CACHE_KV \
  --r2 R2_BUCKET
```

### 7.2 Acessar

Abra: http://localhost:8788

### 7.3 Testar Endpoints

```bash
# Login
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@automacao.com","password":"admin123"}'

# Listar serviços
curl http://localhost:8788/api/services
```

---

## 🚀 PASSO 8: DEPLOY PARA PRODUÇÃO

### 8.1 Deploy via Cloudflare Pages

```bash
npx wrangler pages deploy .vercel/output/static \
  --project-name=business-automation \
  --branch=main
```

**Primeira vez irá criar o projeto:**
```
✨ Creating project 'business-automation'...
✨ Deploying to Cloudflare Pages...
✨ Success! Deployed to:
   https://business-automation.pages.dev
```

### 8.2 Configurar Domínio Custom (opcional)

1. Acesse https://dash.cloudflare.com/
2. Vá em **Pages** → Seu projeto
3. **Custom domains** → Add domain
4. Digite seu domínio (ex: `app.suaempresa.com`)
5. Cloudflare configura DNS automaticamente

### 8.3 Verificar Deploy

```bash
curl https://business-automation.pages.dev/api/services
```

---

## 🔄 PASSO 9: CI/CD AUTOMÁTICO

### 9.1 GitHub Actions

Crie `.github/workflows/deploy-workers.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npx @cloudflare/next-on-pages

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: business-automation
          directory: .vercel/output/static
```

### 9.2 Configurar Secrets no GitHub

1. Acesse: Settings → Secrets → Actions
2. Adicione:
   - `CLOUDFLARE_API_TOKEN` (criar em: https://dash.cloudflare.com/profile/api-tokens)
   - `CLOUDFLARE_ACCOUNT_ID` (pegar em: Workers & Pages)

---

## 📊 PASSO 10: MONITORAMENTO E LOGS

### 10.1 Ver Logs em Tempo Real

```bash
wrangler pages deployment tail
```

### 10.2 Analytics no Dashboard

Acesse: https://dash.cloudflare.com/ → Pages → Seu projeto → Analytics

Métricas disponíveis:
- Requests por segundo
- Latência (p50, p99)
- Erros 4xx/5xx
- Bandwidth

### 10.3 Configurar Alertas (opcional)

Dashboard → Notifications → Add

Alertas para:
- Taxa de erro > 5%
- Latência > 1s
- Uso de recursos

---

## 🔧 COMANDOS ÚTEIS

### D1 (Database)

```bash
# Executar query
wrangler d1 execute business_automation_db --command="SELECT * FROM users LIMIT 10"

# Backup
wrangler d1 export business_automation_db --output=backup.sql

# Importar
wrangler d1 execute business_automation_db --file=backup.sql

# Ver todas as tabelas
wrangler d1 execute business_automation_db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### KV (Cache)

```bash
# Adicionar valor
wrangler kv:key put "test" "hello world" --namespace-id=xxxxx

# Ler valor
wrangler kv:key get "test" --namespace-id=xxxxx

# Listar chaves
wrangler kv:key list --namespace-id=xxxxx

# Deletar
wrangler kv:key delete "test" --namespace-id=xxxxx
```

### R2 (Storage)

```bash
# Listar buckets
wrangler r2 bucket list

# Listar objetos
wrangler r2 object list business-automation-uploads

# Upload arquivo
wrangler r2 object put business-automation-uploads/test.txt --file=./test.txt

# Download
wrangler r2 object get business-automation-uploads/test.txt
```

### Pages (Deploy)

```bash
# Ver deployments
wrangler pages deployment list --project-name=business-automation

# Rollback para deploy anterior
wrangler pages deployment rollback --project-name=business-automation

# Ver logs
wrangler pages deployment tail
```

---

## ⚠️ TROUBLESHOOTING

### Erro: "binding not found"

**Problema**: D1, KV ou R2 não configurado corretamente

**Solução**:
```bash
# Verificar wrangler.toml tem todos os bindings
cat wrangler.toml

# Recriar namespaces se necessário
wrangler kv:namespace create "CACHE_KV"
wrangler d1 create business_automation_db
```

### Erro: "JWT_SECRET not defined"

**Problema**: Secret não configurado

**Solução**:
```bash
wrangler secret put JWT_SECRET
# Digite um secret forte
```

### Erro: "Cannot find module 'better-sqlite3'"

**Problema**: Usando versão errada do código

**Solução**: Verificar que está usando os arquivos `-workers`:
```bash
# src/lib/db/index.ts deve importar de drizzle-orm/d1
grep "drizzle-orm/d1" src/lib/db/index.ts
```

### Build falha com "Edge runtime required"

**Solução**: Adicionar em cada API route:
```typescript
export const runtime = 'edge'
```

### D1 retorna "database locked"

**Problema**: Múltiplas escritas simultâneas

**Solução**: Usar transactions ou queue:
```typescript
await db.batch([
  db.insert(users).values({...}),
  db.insert(orders).values({...})
])
```

---

## 💰 CUSTOS ESTIMADOS

### Free Tier

- **Pages**: 500 builds/mês
- **Workers**: 100k requests/dia
- **D1**:
  - 5 GB storage
  - 5M rows read/dia
  - 100k rows written/dia
- **KV**: 100k reads/dia, 1k writes/dia
- **R2**: 10 GB storage

**Total**: R$ 0/mês (suficiente para MVP)

### Paid Tier (Recomendado para Produção)

- **Workers Paid**: $5/mês
  - Unlimited requests
  - 30s CPU time (vs 10ms free)
  - 128 MB memory

- **D1**: $5/mês
  - 10 GB storage
  - Unlimited reads
  - Unlimited writes

- **KV**: $5/mês
  - 1 GB storage
  - Unlimited operations

- **R2**: $0.015/GB/mês

**Total estimado**: ~$15-20/mês para pequena operação

---

## 📚 RECURSOS ADICIONAIS

- **Documentação Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Next.js on Pages**: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **D1 Docs**: https://developers.cloudflare.com/d1/
- **KV Docs**: https://developers.cloudflare.com/kv/
- **R2 Docs**: https://developers.cloudflare.com/r2/

---

## ✅ CHECKLIST FINAL

Antes de ir para produção:

- [ ] D1 database criado e schema executado
- [ ] KV namespace criado (prod + preview)
- [ ] R2 bucket criado
- [ ] Todos os secrets configurados
- [ ] Build funciona localmente (`wrangler pages dev`)
- [ ] Deploy funciona (`wrangler pages deploy`)
- [ ] Testes de API passam
- [ ] Domínio custom configurado (se aplicável)
- [ ] CI/CD configurado no GitHub
- [ ] Monitoramento ativo
- [ ] Backup do D1 configurado
- [ ] Senha admin alterada (trocar "admin123"!)

---

**🎉 Parabéns! Seu sistema está no ar com Cloudflare Workers!**

Próximos passos:
1. Testar fluxo completo (registro → compra → pedido)
2. Configurar domínio próprio
3. Ativar analytics
4. Configurar alertas
5. Otimizar cache para reduzir custos
