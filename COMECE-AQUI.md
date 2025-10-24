# 🎯 COMECE AQUI - DEPLOY EM 5 MINUTOS

---

## 💻 ESCOLHA SEU SISTEMA OPERACIONAL

### 🪟 **WINDOWS** (Você está aqui!)

```cmd
deploy-setup.bat
```

Depois:
```cmd
deploy-cloudflare.bat
```

**📚 Guia completo Windows**: [DEPLOY-WINDOWS.md](DEPLOY-WINDOWS.md)

---

### 🐧 **LINUX / MAC**

```bash
./deploy-setup.sh
```

Depois:
```bash
./deploy-cloudflare.sh
```

---

## 🚀 MÉTODO MAIS RÁPIDO

### Windows (CMD ou PowerShell):

**Passo 1:**
```cmd
deploy-setup.bat
```

**O que isso faz:**
1. ✅ Instala Wrangler (ferramenta Cloudflare)
2. ✅ Faz login no Cloudflare (abre navegador)
3. ✅ Prepara todos os arquivos
4. ✅ Instala dependências
5. ✅ Mostra próximos passos

**Tempo**: ~2 minutos

---

**Passo 2:**
```cmd
deploy-cloudflare.bat
```

**O que isso faz:**
1. ✅ Cria database (D1)
2. ✅ Cria cache (KV)
3. ✅ Cria storage (R2)
4. ✅ Configura senhas (secrets)
5. ✅ Build do projeto
6. ✅ Deploy final

**Tempo**: ~3 minutos

---

### Linux/Mac:

```bash
./deploy-setup.sh
./deploy-cloudflare.sh
```

---

## ✅ PRONTO!

Seu app estará em:
```
https://business-automation.pages.dev
```

---

## 📱 PRECISA DE CONTA CLOUDFLARE

**Ainda não tem conta?**

1. Acesse: https://dash.cloudflare.com/sign-up
2. Crie conta grátis (nem precisa cartão)
3. Confirme email
4. Pronto!

**Já tem conta?**
- Execute `deploy-setup.bat` (Windows) ou `./deploy-setup.sh` (Linux/Mac)
- Faça login quando pedir

---

## ⚠️ PROBLEMAS COMUNS

### Windows: "não é reconhecido como um comando"

**Você precisa estar na pasta correta do projeto!**

```cmd
cd C:\Users\SeuUsuario\Downloads\onix
deploy-setup.bat
```

### Windows: "Node.js não instalado"

1. Baixe: https://nodejs.org/
2. Instale (versão LTS)
3. **Feche e abra o CMD novamente**
4. Teste: `node -v`

### Linux/Mac: "permission denied"

```bash
chmod +x deploy-setup.sh deploy-cloudflare.sh
./deploy-setup.sh
```

### Qualquer outro erro

**Windows**: Leia [DEPLOY-WINDOWS.md](DEPLOY-WINDOWS.md)

**Linux/Mac**: Leia `DEPLOY-RAPIDO.md`

---

## 🎯 RESUMO VISUAL

### Windows:
```
C:\projeto\onix>

1. deploy-setup.bat
   ↓
   Login no Cloudflare (navegador)
   ↓
   Arquivos preparados ✅

2. deploy-cloudflare.bat
   ↓
   Criar recursos (D1, KV, R2)
   ↓
   Configurar secrets
   ↓
   Build e Deploy ✅

3. PRONTO! 🎉
   https://business-automation.pages.dev
```

### Linux/Mac:
```
$ ./deploy-setup.sh
$ ./deploy-cloudflare.sh
✅ https://business-automation.pages.dev
```

---

## 💡 DICAS

### O que você VAI precisar:

1. **JWT_SECRET** (senha para tokens)
   - O script vai pedir
   - Pode deixar ele gerar automaticamente

2. **Credenciais Gmail** (OPCIONAL - só se quiser emails)
   - Client ID, Secret, Refresh Token
   - **Pode pular** e configurar depois

3. **Outras APIs** (OPCIONAL)
   - Asaas (pagamentos)
   - PayPal (pagamentos internacionais)
   - **Pode pular tudo** e configurar depois

### O que NÃO precisa agora:

- ❌ Domínio próprio (pode usar .pages.dev)
- ❌ Cartão de crédito (free tier funciona)
- ❌ Servidor próprio (Cloudflare cuida)
- ❌ Conhecimento avançado (scripts fazem tudo)

---

## 📚 GUIAS DISPONÍVEIS

- 🪟 **Windows**: [DEPLOY-WINDOWS.md](DEPLOY-WINDOWS.md) - Guia completo para Windows
- 🚀 **Rápido**: [DEPLOY-RAPIDO.md](DEPLOY-RAPIDO.md) - Guia rápido (10 min)
- 📖 **Completo**: [DEPLOY-CLOUDFLARE-WORKERS.md](DEPLOY-CLOUDFLARE-WORKERS.md) - Documentação técnica (30 min)

---

## 🎬 VAMOS LÁ!

### No Windows:

1. Abra o **Prompt de Comando** (CMD) ou **PowerShell**
2. Navegue para a pasta do projeto:
   ```cmd
   cd C:\Users\SeuUsuario\Downloads\onix
   ```
3. Execute:
   ```cmd
   deploy-setup.bat
   ```
4. Siga as instruções na tela! 🚀

### No Linux/Mac:

```bash
./deploy-setup.sh
```

---

## 🆘 AJUDA RÁPIDA

| Problema | Solução |
|----------|---------|
| Windows: "não reconhecido" | Use `cd` para ir até a pasta do projeto |
| "Node.js não instalado" | Baixe em https://nodejs.org/ |
| "permission denied" (Linux) | Execute `chmod +x deploy-setup.sh` |
| Scripts não funcionam | Leia o guia do seu SO (Windows/Linux) |

---

**Dúvidas?**
- 🪟 Windows: [DEPLOY-WINDOWS.md](DEPLOY-WINDOWS.md)
- 🐧 Linux/Mac: [DEPLOY-RAPIDO.md](DEPLOY-RAPIDO.md)

**Problemas?**
- Seção "Problemas Comuns" nos guias acima

**Quer fazer manual?**
- Todos os guias têm opção "MANUAL"
