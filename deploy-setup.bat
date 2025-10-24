@echo off
chcp 65001 > nul
echo.
echo ============================================
echo 🚀 Setup para Cloudflare Workers (Windows)
echo ============================================
echo.

REM ============================================
REM 1. VERIFICAR PRÉ-REQUISITOS
REM ============================================

echo 📋 Verificando pré-requisitos...
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não instalado!
    echo    Baixe em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js: %NODE_VERSION%

REM Verificar npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm não instalado!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm: %NPM_VERSION%

REM Verificar/Instalar Wrangler
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Wrangler não instalado. Instalando...
    call npm install -g wrangler
    echo ✅ Wrangler instalado!
) else (
    for /f "tokens=*" %%i in ('wrangler --version') do set WRANGLER_VERSION=%%i
    echo ✅ Wrangler: %WRANGLER_VERSION%
)

echo.

REM ============================================
REM 2. AUTENTICAÇÃO CLOUDFLARE
REM ============================================

echo 🔐 Verificando autenticação Cloudflare...
echo.

wrangler whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Não autenticado. Iniciando login...
    echo.
    echo 📝 Isso vai abrir o navegador para você fazer login no Cloudflare
    echo    Pressione qualquer tecla para continuar...
    pause >nul

    call wrangler login

    wrangler whoami >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Falha no login. Execute: wrangler login
        pause
        exit /b 1
    )
    echo ✅ Login realizado com sucesso!
) else (
    echo ✅ Já autenticado no Cloudflare!
)

echo.

REM ============================================
REM 3. BACKUP E SUBSTITUIÇÃO DE ARQUIVOS
REM ============================================

echo 📦 Preparando arquivos para Workers...
echo.

REM Criar diretório de backup
if not exist ".backup-original" mkdir .backup-original

REM Backup package.json
if exist "package.json" (
    echo 📋 Backup: package.json
    copy /Y package.json .backup-original\package.json >nul
)

REM Copiar package-workers.json
if exist "package-workers.json" (
    echo ✅ Usando: package-workers.json
    copy /Y package-workers.json package.json >nul
) else (
    echo ❌ package-workers.json não encontrado!
    pause
    exit /b 1
)

REM Backup e copiar arquivos lib
echo.
echo 📋 Preparando arquivos de biblioteca...

REM Database
if exist "src\lib\db\index.ts" (
    echo 📋 Backup: src\lib\db\index.ts
    copy /Y src\lib\db\index.ts .backup-original\db-index.ts >nul
)

if exist "src\lib\db\index-d1.ts" (
    echo ✅ Usando: src\lib\db\index-d1.ts
    copy /Y src\lib\db\index-d1.ts src\lib\db\index.ts >nul
)

REM Auth
if exist "src\lib\auth.ts" (
    echo 📋 Backup: src\lib\auth.ts
    copy /Y src\lib\auth.ts .backup-original\auth.ts >nul
)

if exist "src\lib\auth-workers.ts" (
    echo ✅ Usando: src\lib\auth-workers.ts
    copy /Y src\lib\auth-workers.ts src\lib\auth.ts >nul
)

REM Cache
if exist "src\lib\cache\redis.ts" (
    echo 📋 Backup: src\lib\cache\redis.ts
    copy /Y src\lib\cache\redis.ts .backup-original\redis.ts >nul
)

if exist "src\lib\cache\kv.ts" (
    echo ✅ Usando: src\lib\cache\kv.ts
    copy /Y src\lib\cache\kv.ts src\lib\cache\redis.ts >nul
)

echo.
echo ✅ Arquivos preparados!

REM ============================================
REM 4. INSTALAR DEPENDÊNCIAS
REM ============================================

echo.
echo 📦 Instalando dependências...
echo.

call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)

echo.
echo ✅ Dependências instaladas!

REM ============================================
REM 5. PRÓXIMOS PASSOS
REM ============================================

echo.
echo ============================================
echo 🎯 PRÓXIMOS PASSOS
echo ============================================
echo.
echo Agora você precisa criar os recursos no Cloudflare:
echo.
echo 1️⃣  CRIAR DATABASE D1:
echo    wrangler d1 create business_automation_db
echo.
echo    Copie o 'database_id' que aparecer e cole no wrangler.toml
echo.
echo 2️⃣  EXECUTAR SCHEMA SQL:
echo    wrangler d1 execute business_automation_db --file=./schema.sql
echo.
echo 3️⃣  CRIAR KV NAMESPACE:
echo    wrangler kv:namespace create "CACHE_KV"
echo    wrangler kv:namespace create "CACHE_KV" --preview
echo.
echo 4️⃣  CRIAR R2 BUCKET:
echo    wrangler r2 bucket create business-automation-uploads
echo.
echo 5️⃣  EXECUTAR DEPLOY AUTOMÁTICO:
echo    deploy-cloudflare.bat
echo.
echo ============================================
echo.
echo ✅ Setup inicial concluído!
echo.
pause
