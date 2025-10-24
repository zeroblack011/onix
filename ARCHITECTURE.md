# 🏗️ ARQUITETURA DO SISTEMA

## Sistema: Global Business Automation Suite

---

## 📊 VISÃO GERAL

Plataforma completa de automação empresarial que combina:
- **IA e Automação** (Conectores Claude + Hugging Face)
- **Qualidade Humana** (Processamento híbrido)
- **Múltiplos Serviços** (17+ serviços premium)
- **Sistema de Créditos** (Economia de até 100%)

---

## 🎯 STACK TECNOLÓGICO

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** Radix UI
- **Ícones:** Lucide React

### **Backend**
- **Runtime:** Node.js
- **API:** Next.js API Routes
- **Validação:** Zod
- **Autenticação:** NextAuth.js v5

### **Banco de Dados**
- **ORM:** Drizzle ORM
- **Dev:** SQLite (local)
- **Prod:** Cloudflare D1
- **Cache:** Redis (Upstash)

### **Conectores Claude**
1. **Gmail** - Emails automatizados
2. **Google Drive** - Armazenamento
3. **Google Calendar** - Agendamentos
4. **Intercom** - Suporte
5. **GitHub** - Código/Deploy
6. **Cloudinary** - Imagens
7. **Figma** - Design
8. **Vercel** - Hospedagem
9. **Hugging Face** - IA
10. **PayPal/Square** - Pagamentos

### **Pagamentos**
- **Principal:** Asaas (Brasil - PIX/Cartão/Boleto)
- **Internacional:** PayPal
- **Alternativa:** Square

---

## 🗂️ ESTRUTURA DO PROJETO

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # Autenticação
│   │   │   ├── services/       # Serviços
│   │   │   ├── orders/         # Pedidos
│   │   │   ├── credits/        # Créditos
│   │   │   ├── payments/       # Pagamentos
│   │   │   └── webhooks/       # Webhooks
│   │   │
│   │   ├── (auth)/             # Rotas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── (client)/           # Painel do Cliente
│   │   │   ├── dashboard/      # Dashboard principal
│   │   │   ├── services/       # Serviços do cliente
│   │   │   ├── orders/         # Pedidos
│   │   │   ├── credits/        # Gerenciar créditos
│   │   │   └── support/        # Suporte
│   │   │
│   │   ├── (admin)/            # Painel Administrativo
│   │   │   ├── dashboard/      # Dashboard admin
│   │   │   ├── orders/         # Gestão de pedidos
│   │   │   ├── clients/        # Gestão de clientes
│   │   │   ├── team/           # Gestão de equipe
│   │   │   └── analytics/      # Analytics
│   │   │
│   │   ├── services/           # Páginas de serviços
│   │   ├── layout.tsx          # Layout raiz
│   │   └── page.tsx            # Homepage
│   │
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes base (botões, cards)
│   │   ├── forms/              # Formulários inteligentes
│   │   ├── dashboard/          # Componentes dashboard
│   │   └── layouts/            # Layouts
│   │
│   ├── lib/                    # Bibliotecas e utils
│   │   ├── db/                 # Database
│   │   │   ├── schema.ts       # Schema Drizzle
│   │   │   └── index.ts        # DB instance
│   │   │
│   │   ├── connectors/         # Conectores Claude
│   │   │   ├── gmail.ts
│   │   │   ├── google-drive.ts
│   │   │   ├── intercom.ts
│   │   │   ├── huggingface.ts
│   │   │   └── ...
│   │   │
│   │   ├── payments/           # Gateways de pagamento
│   │   │   ├── asaas.ts
│   │   │   ├── paypal.ts
│   │   │   └── square.ts
│   │   │
│   │   ├── automation/         # Sistema de automação
│   │   │   ├── order-processor.ts
│   │   │   └── workflows.ts
│   │   │
│   │   ├── credits.ts          # Sistema de créditos
│   │   └── utils.ts            # Utilitários
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   │
│   ├── config/                 # Configurações
│   │   └── site.ts
│   │
│   └── constants/              # Constantes
│       └── services.ts         # Catálogo de serviços
│
├── drizzle/                    # Migrações do banco
├── public/                     # Assets estáticos
├── docs/                       # Documentação
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── drizzle.config.ts
└── .env.example
```

---

## 🔄 FLUXOS PRINCIPAIS

### **1. FLUXO DE COMPRA DE SERVIÇO**

```
Cliente → Escolhe Serviço → Preenche Formulário →
↓
Sistema verifica créditos disponíveis →
↓
Pagamento (PIX/Cartão/Créditos) →
↓
Webhook confirma pagamento →
↓
Order Processor inicia automações:
  ├── Gmail: Email de confirmação
  ├── Google Drive: Cria pasta do cliente
  ├── Intercom: Inicia suporte
  └── Hugging Face: Analisa perfil
↓
Processamento baseado no tipo:
  ├── Automático: Deploy/Ativação imediata
  ├── Híbrido: Automação + Fila equipe
  └── Manual: Fila equipe
↓
Cliente acompanha status em tempo real →
↓
Entrega → Email + Notificação → Documentos no Drive
```

### **2. FLUXO DE COMPRA DE CRÉDITOS**

```
Cliente → Vê recomendação de economia →
↓
Escolhe pacote de créditos →
↓
Pagamento (Asaas/PayPal) →
↓
Webhook confirma →
↓
Sistema adiciona créditos →
↓
Email de confirmação + Notificação →
↓
Cliente usa créditos em serviços futuros
```

### **3. FLUXO DE SUPORTE**

```
Cliente → Abre ticket/chat →
↓
Intercom recebe →
↓
IA analisa sentimento e urgência →
↓
Se simples: Resposta automática
Se complexo: Escalona para humano →
↓
Equipe responde →
↓
Google Calendar agenda follow-up →
↓
Gmail envia resolução
```

---

## 🤖 SISTEMA DE AUTOMAÇÕES

### **Automações por Conector**

#### **Gmail**
- Email de confirmação de pedido
- Email de conclusão
- Email de boas-vindas
- Sequências de follow-up

#### **Google Drive**
- Criar pasta para cliente
- Criar pasta para pedido
- Upload de documentos
- Compartilhamento com cliente

#### **Google Calendar**
- Agendar follow-ups
- Agendar consultorias
- Lembretes de renovação

#### **Intercom**
- Criar/atualizar usuário
- Enviar mensagens
- Notificações de pedido
- Suporte automatizado

#### **Hugging Face**
- Recomendações personalizadas
- Otimização de textos
- Análise de sentimentos
- Geração de conteúdo

#### **GitHub + Vercel**
- Deploy automático de sites
- Versionamento de código
- Hospedagem

#### **Cloudinary**
- Upload de imagens
- Otimização
- Transformações

---

## 💾 MODELO DE DADOS

### **Principais Entidades**

```typescript
User {
  id, email, name, password, role, credits, tier
}

Service {
  id, slug, name, description, price, credits,
  processingType, formFields, features
}

Order {
  id, orderNumber, userId, serviceId, amount,
  status, paymentStatus, formData, automations
}

CreditTransaction {
  id, userId, type, amount, balance, description
}

Payment {
  id, userId, amount, gateway, status, method
}

SupportTicket {
  id, userId, subject, status, priority
}

AutomationLog {
  id, orderId, connector, action, status, output
}
```

---

## 🔐 SEGURANÇA

### **Medidas Implementadas**

1. **Autenticação**
   - JWT tokens
   - Sessões seguras
   - Refresh tokens

2. **Criptografia**
   - Senhas com bcrypt
   - Dados sensíveis criptografados
   - SSL/TLS obrigatório

3. **Validação**
   - Input validation (Zod)
   - Sanitização de dados
   - Rate limiting

4. **Compliance**
   - LGPD
   - GDPR
   - PCI-DSS (pagamentos)

5. **Auditoria**
   - Logs de todas ações
   - Tracking de automações
   - Histórico de transações

---

## 📈 ESCALABILIDADE

### **Estratégias**

1. **Database**
   - Cloudflare D1 (distributed)
   - Redis cache
   - Índices otimizados

2. **Frontend**
   - Static Generation
   - ISR (Incremental Static Regeneration)
   - CDN (Vercel Edge)

3. **Backend**
   - API caching
   - Worker pools
   - Queue system (para processamento)

4. **Conectores**
   - Rate limiting
   - Retry logic
   - Fallback strategies

---

## 🧪 TESTES

### **Estratégia de Testes**

1. **Unit Tests**
   - Funções de negócio
   - Conectores
   - Validações

2. **Integration Tests**
   - Fluxos completos
   - APIs
   - Webhooks

3. **E2E Tests**
   - Jornada do cliente
   - Processamento de pedidos
   - Pagamentos

---

## 🚀 DEPLOY

### **Ambientes**

- **Development:** localhost
- **Staging:** Vercel preview
- **Production:** Vercel + Cloudflare D1

### **CI/CD**

```
Git Push → GitHub Actions →
  ├── Lint & Type Check
  ├── Run Tests
  ├── Build
  └── Deploy to Vercel
```

---

## 📊 MONITORAMENTO

### **Ferramentas**

- **Performance:** Vercel Analytics
- **Errors:** Sentry
- **Logs:** Custom logging system
- **Uptime:** UptimeRobot

---

## 🔮 ROADMAP FUTURO

### **Fase 2 - Expansão**
- [ ] Mobile app (React Native)
- [ ] Sistema de afiliados
- [ ] White-label para parceiros

### **Fase 3 - IA Avançada**
- [ ] Chatbot inteligente
- [ ] Previsão de churn
- [ ] Otimização automática de preços

### **Fase 4 - Global**
- [ ] Mais países
- [ ] Multi-moeda
- [ ] Multi-idioma completo

---

**Desenvolvido com ❤️ usando Claude AI + Conectores Avançados**
