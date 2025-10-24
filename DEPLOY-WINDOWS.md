# 🪟 DEPLOY NO WINDOWS - GUIA COMPLETO

**Deploy do Sistema de Automação Empresarial no Cloudflare Workers via Windows**

---

## 🚀 MÉTODO MAIS RÁPIDO (2 Comandos)

Abra o **Prompt de Comando** (CMD) ou **PowerShell**:

### Passo 1: Preparar Ambiente

```cmd
deploy-setup.bat
```

Vai fazer:
- ✅ Verificar Node.js e npm
- ✅ Instalar Wrangler
- ✅ Login no Cloudflare (abre navegador)
- ✅ Preparar arquivos
- ✅ Instalar dependências

**Tempo: ~2 minutos**

---

### Passo 2: Deploy Completo

```cmd
deploy-cloudflare.bat
```

Vai fazer:
- ✅ Criar Database D1
- ✅ Criar Cache KV
- ✅ Criar Storage R2
- ✅ Configurar secrets
- ✅ Build e deploy

**Tempo: ~3 minutos**

---

## ✅ PRONTO!

Seu app estará em:
```
https://business-automation.pages.dev
```

---

## 📋 PRÉ-REQUISITOS (Windows)

### 1. Node.js (Obrigatório)

**Verificar se tem:**
```cmd
node -v
```

**Se não tiver:**
1. Baixe: https://nodejs.org/
2. Instale a versão LTS (recomendada)
3. Reinicie o CMD
4. Teste: `node -v`

### 2. Git (Recomendado)

**Verificar:**
```cmd
git --version
```

**Se não tiver:**
1. Baixe: https://git-scm.com/download/win
2. Instale com opções padrão
3. Reinicie o CMD

### 3. Conta Cloudflare (Grátis)

**Se não tiver:**
1. Acesse: https://dash.cloudflare.com/sign-up
2. Crie conta (não precisa cartão)
3. Confirme email

---

## 📂 ONDE EXECUTAR OS COMANDOS

### Opção 1: Prompt de Comando (CMD)

1. Pressione `Win + R`
2. Digite: `cmd`
3. Enter
4. Navegue até a pasta do projeto:
   ```cmd
   cd C:\caminho\para\seu\projeto\onix
   ```
5. Execute:
   ```cmd
   deploy-setup.bat
   ```

### Opção 2: PowerShell

1. Pressione `Win + X`
2. Escolha "Windows PowerShell"
3. Navegue até o projeto:
   ```powershell
   cd C:\caminho\para\seu\projeto\onix
   ```
4. Execute:
   ```powershell
   .\deploy-setup.bat
   ```

### Opção 3: Visual Studio Code (Recomendado)

1. Abra a pasta do projeto no VS Code
2. Terminal → New Terminal (`Ctrl + '`)
3. Execute:
   ```cmd
   deploy-setup.bat
   ```

---

## 🛠️ PASSO A PASSO DETALHADO

### 1. Preparar Ambiente

```cmd
cd C:\seu\projeto\onix
deploy-setup.bat
```

**O que acontece:**

1. **Verifica Node.js e npm**
   - Se não tiver, pede para instalar

2. **Instala Wrangler**
   ```
   npm install -g wrangler
   ```

3. **Login no Cloudflare**
   - Abre navegador automaticamente
   - Faça login com sua conta
   - Autorize o Wrangler
   - Volte para o CMD

4. **Prepara arquivos**
   - Faz backup dos originais em `.backup-original/`
   - Copia versões Workers

5. **Instala dependências**
   ```
   npm install
   ```

**Tempo total: ~2 minutos**

---

### 2. Criar Recursos Cloudflare

#### Opção A: Automático (Recomendado)

```cmd
deploy-cloudflare.bat
```

Siga as instruções na tela!

#### Opção B: Manual

Se preferir fazer manualmente:

**2.1 Criar Database D1**

```cmd
wrangler d1 create business_automation_db
```

Vai mostrar algo como:
```
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Copie esse ID!**

Abra `wrangler.toml` e cole na linha 36:
```toml
database_id = "COLE_AQUI"
```

**2.2 Executar Schema**

```cmd
wrangler d1 execute business_automation_db --file=schema.sql
```

**2.3 Criar KV (Cache)**

```cmd
wrangler kv:namespace create "CACHE_KV"
wrangler kv:namespace create "CACHE_KV" --preview
```

Copie os IDs e cole no `wrangler.toml` linhas 42-43:
```toml
id = "COLE_ID_PRODUCAO"
preview_id = "COLE_ID_PREVIEW"
```

**2.4 Criar R2 (Storage)**

```cmd
wrangler r2 bucket create business-automation-uploads
```

**2.5 Configurar Secrets**

```cmd
wrangler secret put JWT_SECRET
```

Quando pedir, digite uma senha forte ou cole:
```
(Gere uma senha aleatória ou use: https://randomkeygen.com/)
```

Gmail (opcional):
```cmd
wrangler secret put GMAIL_CLIENT_ID
wrangler secret put GMAIL_CLIENT_SECRET
wrangler secret put GMAIL_REFRESH_TOKEN
wrangler secret put GMAIL_FROM_EMAIL
```

---

### 3. Build e Deploy

```cmd
npm install -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel\output\static --project-name=business-automation
```

**Tempo: ~2 minutos**

---

## ⚠️ PROBLEMAS COMUNS (Windows)

### Erro: "não é reconhecido como um comando"

**Causa**: Não está na pasta correta

**Solução**:
```cmd
cd C:\Users\SeuUsuario\Downloads\onix
dir
```

Deve ver os arquivos: `deploy-setup.bat`, `wrangler.toml`, etc.

### Erro: "Node.js não instalado"

**Solução**:
1. Baixe: https://nodejs.org/
2. Instale (deixe opções padrão)
3. **IMPORTANTE**: Feche e abra o CMD novamente
4. Teste: `node -v`

### Erro: "wrangler: command not found"

**Solução**:
```cmd
npm install -g wrangler
```

Se continuar com erro, reinicie o CMD.

### Erro: "Access denied" ou "Permission denied"

**Solução**: Execute o CMD como Administrador
1. Pressione `Win`
2. Digite "cmd"
3. Clique com botão direito
4. "Executar como administrador"

### Erro ao executar .sh (Shell scripts)

**Causa**: Arquivos .sh são para Linux/Mac

**Solução**: Use os arquivos .bat:
- ❌ `./deploy-setup.sh`
- ✅ `deploy-setup.bat`

### Erro: "npx não é reconhecido"

**Solução**: Seu Node.js está desatualizado
```cmd
node -v
```

Se for menor que v18, atualize:
1. Desinstale Node.js antigo
2. Baixe versão LTS: https://nodejs.org/
3. Instale
4. Reinicie CMD

### Erro de encoding (caracteres estranhos)

**Solução**: Execute no início do CMD:
```cmd
chcp 65001
```

Ou use PowerShell em vez de CMD.

---

## 🧪 TESTAR LOCALMENTE (Windows)

```cmd
npx @cloudflare/next-on-pages
npx wrangler pages dev .vercel\output\static
```

Acesse: http://localhost:8788

---

## 🔧 COMANDOS ÚTEIS (Windows)

### Ver logs em tempo real

```cmd
wrangler pages deployment tail
```

### Verificar database

```cmd
wrangler d1 execute business_automation_db --command="SELECT * FROM users"
```

### Listar recursos criados

```cmd
wrangler d1 list
wrangler kv:namespace list
wrangler r2 bucket list
```

### Ver secrets configurados

```cmd
wrangler secret list
```

### Atualizar app (após mudanças)

```cmd
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel\output\static
```

---

## 📁 ESTRUTURA DE PASTAS (Windows)

Seu projeto deve estar assim:

```
C:\Users\SeuUsuario\projeto\onix\
├── deploy-setup.bat          ← Execute este primeiro
├── deploy-cloudflare.bat     ← Depois execute este
├── wrangler.toml             ← Configuração Cloudflare
├── schema.sql                ← Database schema
├── package.json
├── src\
│   ├── app\
│   └── lib\
│       ├── db\
│       │   ├── index.ts
│       │   └── index-d1.ts
│       └── auth.ts
└── .backup-original\         ← Criado automaticamente
```

---

## 💡 DICAS WINDOWS

### Use Git Bash (Alternativa)

Se instalou Git, você pode usar Git Bash:

1. Clique com botão direito na pasta do projeto
2. "Git Bash Here"
3. Execute:
   ```bash
   ./deploy-setup.sh
   ./deploy-cloudflare.sh
   ```

Os scripts .sh funcionam no Git Bash!

### Use Windows Terminal (Moderno)

Se tem Windows 10/11:

1. Instale Windows Terminal (Microsoft Store)
2. Melhor visualização e suporte a Unicode
3. Pode usar PowerShell ou CMD dentro dele

### PowerShell vs CMD

Ambos funcionam! Diferenças:

**CMD** (Prompt de Comando):
- ✅ Tradicional
- ✅ Scripts .bat
- ⚠️ Menos recursos

**PowerShell**:
- ✅ Mais moderno
- ✅ Melhor encoding (UTF-8)
- ✅ Mais cores e formatação
- ✅ Scripts .bat também funcionam

**Recomendação**: Use PowerShell se disponível

---

## 🎯 CHECKLIST WINDOWS

Antes de começar:

- [ ] ✅ Node.js instalado (v18+)
- [ ] ✅ npm funcionando
- [ ] ✅ Conta Cloudflare criada
- [ ] ✅ Na pasta correta do projeto
- [ ] ✅ CMD ou PowerShell aberto

Durante deploy:

- [ ] ✅ Wrangler instalado
- [ ] ✅ Login Cloudflare feito
- [ ] ✅ Arquivos preparados
- [ ] ✅ D1 database criado
- [ ] ✅ KV namespace criado
- [ ] ✅ R2 bucket criado
- [ ] ✅ JWT_SECRET configurado
- [ ] ✅ Build concluído
- [ ] ✅ Deploy feito

Após deploy:

- [ ] ✅ App acessível em .pages.dev
- [ ] ✅ API respondendo
- [ ] 🔒 Senha admin alterada

---

## 🆘 AINDA COM PROBLEMAS?

### 1. Verifique a pasta

```cmd
cd C:\seu\projeto\onix
dir deploy-setup.bat
```

Deve mostrar o arquivo.

### 2. Verifique Node.js

```cmd
node -v
npm -v
```

Deve mostrar versões (v18+ recomendado).

### 3. Execute como Admin

1. Feche o CMD
2. Abra como Administrador
3. Tente novamente

### 4. Use o método manual

Se os scripts não funcionarem, siga "Opção B: Manual" acima.

---

## 📚 MAIS RECURSOS

- **Troubleshooting geral**: `DEPLOY-RAPIDO.md`
- **Documentação completa**: `DEPLOY-CLOUDFLARE-WORKERS.md`
- **Cloudflare Docs**: https://developers.cloudflare.com/

---

## ✅ RESUMO PARA WINDOWS

```cmd
REM 1. Navegue para a pasta
cd C:\seu\projeto\onix

REM 2. Execute setup
deploy-setup.bat

REM 3. Execute deploy
deploy-cloudflare.bat

REM 4. Pronto!
```

**Total: 5 minutos!** 🎉

---

**Dúvidas específicas do Windows?** Confira a seção "Problemas Comuns" acima!
