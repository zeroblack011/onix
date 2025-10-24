@echo off
chcp 65001 > nul
echo.
echo ============================================
echo 🚀 Deploy Completo - Cloudflare Workers
echo ============================================
echo.

REM ============================================
REM 1. CRIAR DATABASE D1
REM ============================================

echo 📊 Passo 1/5: Criando Database D1...
echo.

wrangler d1 list | findstr "business_automation_db" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Database 'business_automation_db' já existe
    echo    Pulando criação...
) else (
    echo 🔨 Criando database...
    call wrangler d1 create business_automation_db > nul

    echo.
    echo ✅ Database criado!
    echo.
    echo ⚠️  IMPORTANTE:
    echo    1. Execute: wrangler d1 list
    echo    2. Copie o database_id
    echo    3. Cole no arquivo wrangler.toml (linha 36)
    echo.
    echo Pressione qualquer tecla APÓS atualizar o wrangler.toml...
    pause >nul
)

echo.
echo 🔨 Executando schema SQL...
call wrangler d1 execute business_automation_db --file=./schema.sql

echo.
echo ✅ Database configurado!
echo.

REM ============================================
REM 2. CRIAR KV NAMESPACE
REM ============================================

echo 💾 Passo 2/5: Criando KV Namespace...
echo.

echo 🔨 Criando KV para produção...
call wrangler kv:namespace create "CACHE_KV" 2>nul

echo.
echo 🔨 Criando KV para preview...
call wrangler kv:namespace create "CACHE_KV" --preview 2>nul

echo.
echo ✅ KV Namespaces criados!
echo.
echo ⚠️  IMPORTANTE:
echo    1. Execute: wrangler kv:namespace list
echo    2. Copie os IDs
echo    3. Cole no arquivo wrangler.toml (linhas 42-43)
echo.
echo Pressione qualquer tecla APÓS atualizar...
pause >nul
echo.

REM ============================================
REM 3. CRIAR R2 BUCKET
REM ============================================

echo 📦 Passo 3/5: Criando R2 Bucket...
echo.

wrangler r2 bucket list | findstr "business-automation-uploads" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Bucket 'business-automation-uploads' já existe
) else (
    echo 🔨 Criando R2 bucket...
    call wrangler r2 bucket create business-automation-uploads
    echo ✅ R2 Bucket criado!
)

echo.

REM ============================================
REM 4. CONFIGURAR SECRETS
REM ============================================

echo 🔐 Passo 4/5: Configurando Secrets...
echo.

echo Vamos configurar os secrets necessários:
echo.

REM JWT Secret
echo 1️⃣  JWT_SECRET (chave secreta para tokens)
echo    Pressione qualquer tecla para configurar...
pause >nul
call wrangler secret put JWT_SECRET

echo.
echo ✅ JWT_SECRET configurado!
echo.

REM Gmail (opcional)
echo 2️⃣  Gmail Credentials (para envio de emails)
echo.
set /p SETUP_GMAIL="   Configurar Gmail agora? (S/N): "
if /i "%SETUP_GMAIL%"=="S" (
    echo.
    echo    GMAIL_CLIENT_ID:
    call wrangler secret put GMAIL_CLIENT_ID

    echo.
    echo    GMAIL_CLIENT_SECRET:
    call wrangler secret put GMAIL_CLIENT_SECRET

    echo.
    echo    GMAIL_REFRESH_TOKEN:
    call wrangler secret put GMAIL_REFRESH_TOKEN

    echo.
    echo    GMAIL_FROM_EMAIL:
    call wrangler secret put GMAIL_FROM_EMAIL
) else (
    echo    ⏭️  Pulando Gmail (pode configurar depois)
)

echo.
echo ✅ Secrets configurados!
echo.

REM ============================================
REM 5. BUILD E DEPLOY
REM ============================================

echo 🏗️  Passo 5/5: Build e Deploy...
echo.

echo 🔨 Instalando @cloudflare/next-on-pages...
call npm install -D @cloudflare/next-on-pages

echo.
echo 🔨 Building projeto para Workers...
call npx @cloudflare/next-on-pages

echo.
echo ✅ Build concluído!
echo.

echo 🚀 Fazendo deploy para Cloudflare Pages...
echo.

call wrangler pages deploy .vercel\output\static --project-name=business-automation --branch=main

echo.
echo ============================================
echo 🎉 DEPLOY CONCLUÍDO!
echo ============================================
echo.
echo Seu app está no ar em:
echo https://business-automation.pages.dev
echo.
echo 📊 Para ver analytics e logs:
echo    https://dash.cloudflare.com/
echo.
echo 🔧 Comandos úteis:
echo    wrangler pages deployment tail
echo    wrangler d1 execute business_automation_db --command="SELECT * FROM users"
echo.
echo ============================================
echo.
pause
