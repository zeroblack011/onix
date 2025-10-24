#!/bin/bash

# ============================================
# DEPLOY COMPLETO PARA CLOUDFLARE WORKERS
# ============================================

set -e

echo "🚀 Deploy Automático para Cloudflare Workers"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 1. CRIAR DATABASE D1
# ============================================

echo -e "${BLUE}📊 Passo 1/5: Criando Database D1...${NC}"
echo ""

if wrangler d1 list | grep -q "business_automation_db"; then
    echo -e "${YELLOW}⚠️  Database 'business_automation_db' já existe${NC}"
    echo "   Pulando criação..."
else
    echo "🔨 Criando database..."
    wrangler d1 create business_automation_db > /tmp/d1_output.txt

    # Extrair database_id
    DATABASE_ID=$(grep "database_id" /tmp/d1_output.txt | cut -d'"' -f2)

    echo ""
    echo -e "${GREEN}✅ Database criado!${NC}"
    echo "   Database ID: $DATABASE_ID"
    echo ""
    echo -e "${YELLOW}📝 AÇÃO NECESSÁRIA:${NC}"
    echo "   Abra o arquivo 'wrangler.toml' e atualize:"
    echo "   database_id = \"$DATABASE_ID\""
    echo ""
    echo "   Pressione ENTER após atualizar o wrangler.toml..."
    read
fi

echo ""
echo "🔨 Executando schema SQL..."
wrangler d1 execute business_automation_db --file=./schema.sql

echo ""
echo -e "${GREEN}✅ Database configurado com 12 tabelas!${NC}"
echo ""

# ============================================
# 2. CRIAR KV NAMESPACE
# ============================================

echo -e "${BLUE}💾 Passo 2/5: Criando KV Namespace...${NC}"
echo ""

# Produção
echo "🔨 Criando KV para produção..."
wrangler kv:namespace create "CACHE_KV" > /tmp/kv_prod.txt || true

KV_PROD_ID=$(grep "id" /tmp/kv_prod.txt | grep -v "preview" | cut -d'"' -f2)

echo ""

# Preview
echo "🔨 Criando KV para preview..."
wrangler kv:namespace create "CACHE_KV" --preview > /tmp/kv_preview.txt || true

KV_PREVIEW_ID=$(grep "id" /tmp/kv_preview.txt | cut -d'"' -f2)

echo ""
echo -e "${GREEN}✅ KV Namespaces criados!${NC}"

if [ ! -z "$KV_PROD_ID" ]; then
    echo "   Production ID: $KV_PROD_ID"
    echo ""
    echo -e "${YELLOW}📝 AÇÃO NECESSÁRIA:${NC}"
    echo "   Abra o arquivo 'wrangler.toml' e atualize:"
    echo "   id = \"$KV_PROD_ID\""
    echo "   preview_id = \"$KV_PREVIEW_ID\""
    echo ""
    echo "   Pressione ENTER após atualizar..."
    read
fi

echo ""

# ============================================
# 3. CRIAR R2 BUCKET
# ============================================

echo -e "${BLUE}📦 Passo 3/5: Criando R2 Bucket...${NC}"
echo ""

if wrangler r2 bucket list | grep -q "business-automation-uploads"; then
    echo -e "${YELLOW}⚠️  Bucket 'business-automation-uploads' já existe${NC}"
else
    echo "🔨 Criando R2 bucket..."
    wrangler r2 bucket create business-automation-uploads
    echo -e "${GREEN}✅ R2 Bucket criado!${NC}"
fi

echo ""

# ============================================
# 4. CONFIGURAR SECRETS
# ============================================

echo -e "${BLUE}🔐 Passo 4/5: Configurando Secrets...${NC}"
echo ""

echo "Vamos configurar os secrets necessários:"
echo ""

# JWT Secret
echo "1️⃣  JWT_SECRET (chave secreta para tokens)"
echo "   💡 Dica: Use uma string aleatória forte"
echo "   Exemplo: $(openssl rand -base64 32 2>/dev/null || echo 'sua-chave-super-secreta-aqui-123456789')"
echo ""
wrangler secret put JWT_SECRET

echo ""

# Gmail (opcional)
echo "2️⃣  Gmail Credentials (para envio de emails)"
echo "   Você quer configurar Gmail agora? (s/N)"
read -r SETUP_GMAIL

if [[ "$SETUP_GMAIL" =~ ^[Ss]$ ]]; then
    echo ""
    echo "   GMAIL_CLIENT_ID:"
    wrangler secret put GMAIL_CLIENT_ID

    echo ""
    echo "   GMAIL_CLIENT_SECRET:"
    wrangler secret put GMAIL_CLIENT_SECRET

    echo ""
    echo "   GMAIL_REFRESH_TOKEN:"
    wrangler secret put GMAIL_REFRESH_TOKEN

    echo ""
    echo "   GMAIL_FROM_EMAIL:"
    wrangler secret put GMAIL_FROM_EMAIL
else
    echo "   ⏭️  Pulando configuração do Gmail (pode fazer depois)"
fi

echo ""

# Outros secrets opcionais
echo "3️⃣  Outros secrets (opcional - pode configurar depois):"
echo "   - ASAAS_API_KEY (pagamentos)"
echo "   - PAYPAL_CLIENT_ID (pagamentos internacionais)"
echo "   - CLOUDINARY_API_KEY (upload de imagens)"
echo "   - HUGGING_FACE_API_KEY (IA)"
echo ""
echo "   Configurar agora? (s/N)"
read -r SETUP_OTHERS

if [[ "$SETUP_OTHERS" =~ ^[Ss]$ ]]; then
    echo ""
    echo "   ASAAS_API_KEY (Enter para pular):"
    read -r ASAAS_KEY
    if [ ! -z "$ASAAS_KEY" ]; then
        echo "$ASAAS_KEY" | wrangler secret put ASAAS_API_KEY
    fi

    # Adicione mais conforme necessário
fi

echo ""
echo -e "${GREEN}✅ Secrets configurados!${NC}"
echo ""

# ============================================
# 5. BUILD E DEPLOY
# ============================================

echo -e "${BLUE}🏗️  Passo 5/5: Build e Deploy...${NC}"
echo ""

echo "🔨 Instalando @cloudflare/next-on-pages..."
npm install -D @cloudflare/next-on-pages

echo ""
echo "🔨 Building projeto para Workers..."
npx @cloudflare/next-on-pages

echo ""
echo -e "${GREEN}✅ Build concluído!${NC}"
echo ""

echo "🚀 Fazendo deploy para Cloudflare Pages..."
echo ""

wrangler pages deploy .vercel/output/static \
    --project-name=business-automation \
    --branch=main

echo ""
echo "============================================"
echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO!${NC}"
echo "============================================"
echo ""
echo "Seu app está no ar em:"
echo "https://business-automation.pages.dev"
echo ""
echo "📊 Para ver analytics e logs:"
echo "   https://dash.cloudflare.com/"
echo ""
echo "🔧 Comandos úteis:"
echo "   wrangler pages deployment tail  # Ver logs em tempo real"
echo "   wrangler d1 execute business_automation_db --command=\"SELECT * FROM users\""
echo "   wrangler kv:key list --namespace-id=seu-kv-id"
echo ""
echo "============================================"
