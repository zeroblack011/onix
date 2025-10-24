#!/bin/bash

# ============================================
# SCRIPT DE SETUP PARA CLOUDFLARE WORKERS
# ============================================

set -e  # Para em caso de erro

echo "🚀 Setup para Cloudflare Workers"
echo "=================================="
echo ""

# ============================================
# 1. VERIFICAR PRÉ-REQUISITOS
# ============================================

echo "📋 Verificando pré-requisitos..."
echo ""

# Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não instalado!"
    echo "   Instale em: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js: $NODE_VERSION"

# npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não instalado!"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm: $NPM_VERSION"

# Wrangler
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler não instalado. Instalando..."
    npm install -g wrangler
    echo "✅ Wrangler instalado!"
else
    WRANGLER_VERSION=$(wrangler --version)
    echo "✅ Wrangler: $WRANGLER_VERSION"
fi

echo ""

# ============================================
# 2. AUTENTICAÇÃO CLOUDFLARE
# ============================================

echo "🔐 Verificando autenticação Cloudflare..."
echo ""

if wrangler whoami &> /dev/null; then
    ACCOUNT=$(wrangler whoami | grep "Account Name" || echo "Logado")
    echo "✅ Já autenticado: $ACCOUNT"
else
    echo "⚠️  Não autenticado. Iniciando login..."
    echo ""
    echo "📝 Isso vai abrir o navegador para você fazer login no Cloudflare"
    echo "   Pressione ENTER para continuar..."
    read

    wrangler login

    if wrangler whoami &> /dev/null; then
        echo "✅ Login realizado com sucesso!"
    else
        echo "❌ Falha no login. Execute: wrangler login"
        exit 1
    fi
fi

echo ""

# ============================================
# 3. BACKUP E SUBSTITUIÇÃO DE ARQUIVOS
# ============================================

echo "📦 Preparando arquivos para Workers..."
echo ""

# Criar diretório de backup
mkdir -p .backup-original

# Backup e substituição de package.json
if [ -f "package.json" ]; then
    echo "📋 Backup: package.json → .backup-original/"
    cp package.json .backup-original/package.json
fi

if [ -f "package-workers.json" ]; then
    echo "✅ Usando: package-workers.json → package.json"
    cp package-workers.json package.json
else
    echo "❌ package-workers.json não encontrado!"
    exit 1
fi

# Backup e substituição de arquivos de lib
echo ""
echo "📋 Preparando arquivos de biblioteca..."

# Database
if [ -f "src/lib/db/index.ts" ]; then
    echo "📋 Backup: src/lib/db/index.ts → .backup-original/"
    cp src/lib/db/index.ts .backup-original/db-index.ts
fi

if [ -f "src/lib/db/index-d1.ts" ]; then
    echo "✅ Usando: src/lib/db/index-d1.ts → src/lib/db/index.ts"
    cp src/lib/db/index-d1.ts src/lib/db/index.ts
fi

# Auth
if [ -f "src/lib/auth.ts" ]; then
    echo "📋 Backup: src/lib/auth.ts → .backup-original/"
    cp src/lib/auth.ts .backup-original/auth.ts
fi

if [ -f "src/lib/auth-workers.ts" ]; then
    echo "✅ Usando: src/lib/auth-workers.ts → src/lib/auth.ts"
    cp src/lib/auth-workers.ts src/lib/auth.ts
fi

# Cache
if [ -f "src/lib/cache/redis.ts" ]; then
    echo "📋 Backup: src/lib/cache/redis.ts → .backup-original/"
    cp src/lib/cache/redis.ts .backup-original/redis.ts
fi

if [ -f "src/lib/cache/kv.ts" ]; then
    echo "✅ Usando: src/lib/cache/kv.ts → src/lib/cache/redis.ts"
    cp src/lib/cache/kv.ts src/lib/cache/redis.ts
fi

echo ""
echo "✅ Arquivos preparados!"

# ============================================
# 4. INSTALAR DEPENDÊNCIAS
# ============================================

echo ""
echo "📦 Instalando dependências..."
echo ""

npm install

echo ""
echo "✅ Dependências instaladas!"

# ============================================
# 5. INSTRUÇÕES PARA CRIAR RECURSOS
# ============================================

echo ""
echo "============================================"
echo "🎯 PRÓXIMOS PASSOS"
echo "============================================"
echo ""
echo "Agora você precisa criar os recursos no Cloudflare:"
echo ""
echo "1️⃣  CRIAR DATABASE D1:"
echo "   wrangler d1 create business_automation_db"
echo ""
echo "   Copie o 'database_id' que aparecer e cole no wrangler.toml"
echo ""
echo "2️⃣  EXECUTAR SCHEMA SQL:"
echo "   wrangler d1 execute business_automation_db --file=./schema.sql"
echo ""
echo "3️⃣  CRIAR KV NAMESPACE:"
echo "   wrangler kv:namespace create \"CACHE_KV\""
echo "   wrangler kv:namespace create \"CACHE_KV\" --preview"
echo ""
echo "   Copie os IDs e cole no wrangler.toml"
echo ""
echo "4️⃣  CRIAR R2 BUCKET:"
echo "   wrangler r2 bucket create business-automation-uploads"
echo ""
echo "5️⃣  CONFIGURAR SECRETS:"
echo "   wrangler secret put JWT_SECRET"
echo "   wrangler secret put GMAIL_CLIENT_ID"
echo "   wrangler secret put GMAIL_CLIENT_SECRET"
echo "   (... outros secrets conforme necessário)"
echo ""
echo "6️⃣  BUILD E DEPLOY:"
echo "   npm run build:workers"
echo "   npm run deploy"
echo ""
echo "============================================"
echo ""
echo "💡 DICA: Execute os comandos acima um por vez"
echo "📚 GUIA COMPLETO: DEPLOY-CLOUDFLARE-WORKERS.md"
echo ""
echo "✅ Setup inicial concluído!"
