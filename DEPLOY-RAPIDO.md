# 🚀 DEPLOY RÁPIDO - CLOUDFLARE WORKERS

**Guia Simplificado em 3 Passos**

---

## ⚡ OPÇÃO 1: DEPLOY AUTOMÁTICO (Recomendado)

### Passo 1: Preparar Ambiente

```bash
chmod +x deploy-setup.sh
./deploy-setup.sh
```

Isso vai:
- ✅ Instalar Wrangler
- ✅ Fazer login no Cloudflare
- ✅ Substituir arquivos para Workers
- ✅ Instalar dependências

### Passo 2: Deploy Completo

```bash
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

Isso vai:
- ✅ Criar Database D1
- ✅ Criar KV Cache
- ✅ Criar R2 Storage
- ✅ Configurar secrets
- ✅ Build e deploy

### Passo 3: Pronto! 🎉

Acesse: `https://business-automation.pages.dev`

---

## 🔧 OPÇÃO 2: MANUAL (Passo a Passo)

### 1. Instalar Wrangler

```bash
npm install -g wrangler
```

### 2. Login Cloudflare

```bash
wrangler login
```

Vai abrir o navegador → Faça login → Autorize

### 3. Preparar Arquivos

```bash
# Usar package.json para Workers
cp package-workers.json package.json
npm install

# Usar versões Workers dos arquivos
cp src/lib/db/index-d1.ts src/lib/db/index.ts
cp src/lib/auth-workers.ts src/lib/auth.ts
cp src/lib/cache/kv.ts src/lib/cache/redis.ts
```

### 4. Criar Database D1

```bash
wrangler d1 create business_automation_db
```

**IMPORTANTE**: Copie o `database_id` que aparecer

Edite `wrangler.toml` linha 36:
```toml
database_id = "COLE_O_ID_AQUI"
```

Executar schema:
```bash
wrangler d1 execute business_automation_db --file=./schema.sql
```

### 5. Criar KV (Cache)

```bash
# Produção
wrangler kv:namespace create "CACHE_KV"

# Preview
wrangler kv:namespace create "CACHE_KV" --preview
```

**IMPORTANTE**: Copie os IDs

Edite `wrangler.toml` linha 42-43:
```toml
id = "COLE_ID_PRODUCAO"
preview_id = "COLE_ID_PREVIEW"
```

### 6. Criar R2 (Storage)

```bash
wrangler r2 bucket create business-automation-uploads
```

### 7. Configurar Secrets

```bash
# Obrigatório
wrangler secret put JWT_SECRET
# Cole: $(openssl rand -base64 32)

# Gmail (opcional)
wrangler secret put GMAIL_CLIENT_ID
wrangler secret put GMAIL_CLIENT_SECRET
wrangler secret put GMAIL_REFRESH_TOKEN
wrangler secret put GMAIL_FROM_EMAIL
```

### 8. Build

```bash
npm install -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
```

### 9. Deploy

```bash
wrangler pages deploy .vercel/output/static \
  --project-name=business-automation
```

### 10. Pronto! 🎉

URL: `https://business-automation.pages.dev`

---

## 🧪 TESTAR LOCALMENTE (Opcional)

```bash
# Build
npx @cloudflare/next-on-pages

# Rodar local
npx wrangler pages dev .vercel/output/static
```

Acesse: `http://localhost:8788`

---

## 🔍 VERIFICAR SE FUNCIONOU

### 1. Testar API de Serviços

```bash
curl https://business-automation.pages.dev/api/services
```

Deve retornar JSON com lista de serviços

### 2. Testar Login Admin

```bash
curl -X POST https://business-automation.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@automacao.com","password":"admin123"}'
```

Deve retornar token JWT

### 3. Ver Logs em Tempo Real

```bash
wrangler pages deployment tail
```

### 4. Verificar Database

```bash
wrangler d1 execute business_automation_db \
  --command="SELECT * FROM users"
```

Deve mostrar o admin criado

---

## ⚠️ PROBLEMAS COMUNS

### "binding not found"

**Solução**: Verificar wrangler.toml tem os IDs corretos

```bash
cat wrangler.toml
# Procure por "CRIAR_COM_WRANGLER" e substitua pelos IDs reais
```

### "JWT_SECRET not defined"

**Solução**:
```bash
wrangler secret put JWT_SECRET
```

### Build falha

**Solução**: Verificar se usou package-workers.json
```bash
cp package-workers.json package.json
npm install
```

### D1 "database not found"

**Solução**: Verificar database_id no wrangler.toml

```bash
wrangler d1 list
# Copie o ID e cole no wrangler.toml
```

---

## 🔄 ATUALIZAR DEPOIS DO DEPLOY

```bash
# Fazer alterações no código
git add .
git commit -m "suas alterações"

# Rebuild e redeploy
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static
```

---

## 🎯 COMANDOS MAIS USADOS

```bash
# Ver logs
wrangler pages deployment tail

# Ver deployments
wrangler pages deployment list

# Rollback para versão anterior
wrangler pages deployment rollback

# Executar query no D1
wrangler d1 execute business_automation_db \
  --command="SELECT COUNT(*) FROM orders"

# Listar chaves do KV
wrangler kv:key list --namespace-id=SEU_KV_ID

# Ver buckets R2
wrangler r2 bucket list

# Ver secrets configurados
wrangler secret list
```

---

## 💰 CUSTOS

**Free Tier** (R$ 0/mês):
- ✅ 100.000 requests/dia
- ✅ Suficiente para MVP

**Paid** (~R$ 75/mês):
- ✅ Unlimited requests
- ✅ Para produção

---

## 📞 AJUDA

Se der erro, execute:

```bash
# Ver status
wrangler whoami

# Ver recursos criados
wrangler d1 list
wrangler kv:namespace list
wrangler r2 bucket list

# Ver logs detalhados
wrangler pages deployment tail --format=pretty
```

**Documentação completa**: `DEPLOY-CLOUDFLARE-WORKERS.md`

---

## ✅ CHECKLIST FINAL

Antes de considerar "no ar":

- [ ] ✅ Wrangler instalado e logado
- [ ] ✅ D1 database criado e schema executado
- [ ] ✅ KV namespace criado (prod + preview)
- [ ] ✅ R2 bucket criado
- [ ] ✅ JWT_SECRET configurado
- [ ] ✅ Build rodou sem erros
- [ ] ✅ Deploy concluído
- [ ] ✅ API de serviços respondendo
- [ ] ✅ Login funcionando
- [ ] ✅ Database tem dados (admin user)
- [ ] 🔒 Senha admin ALTERADA (não use "admin123"!)

---

**🎉 Pronto! Seu sistema está no ar!**

URL: `https://business-automation.pages.dev`

Dashboard: `https://dash.cloudflare.com/`
