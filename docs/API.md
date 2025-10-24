# 📡 API DOCUMENTATION

## Global Business Automation Suite - REST API

---

## 🔐 AUTENTICAÇÃO

Todas as requisições autenticadas devem incluir o token JWT no header:

```
Authorization: Bearer <token>
```

### **POST /api/auth/login**
Login do usuário

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "credits": 1250,
    "tier": "premium"
  }
}
```

---

## 🛍️ SERVIÇOS

### **GET /api/services**
Lista todos os serviços disponíveis

**Query Params:**
- `category` - Filtrar por categoria
- `popular` - Apenas serviços populares
- `limit` - Limite de resultados

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "id": "llc-usa-complete",
      "name": "LLC EUA Completa",
      "price": 2997,
      "credits": 2997,
      "processingType": "manual",
      "estimatedTime": "24-48h",
      "features": [...],
      "formFields": [...]
    }
  ]
}
```

### **GET /api/services/:slug**
Detalhes de um serviço específico

**Response:**
```json
{
  "success": true,
  "service": { ... }
}
```

---

## 📦 PEDIDOS

### **POST /api/orders**
Cria novo pedido

**Request:**
```json
{
  "serviceId": "tiktok-shop-br",
  "paymentMethod": "credits",
  "formData": {
    "full_name": "João Silva",
    "cpf": "12345678900",
    "store_name": "Minha Loja",
    ...
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "orderNumber": "ORD-8472",
    "status": "pending",
    "estimatedDelivery": "2024-01-15T10:00:00Z"
  }
}
```

### **GET /api/orders**
Lista pedidos do usuário

**Query Params:**
- `status` - Filtrar por status
- `limit` - Limite de resultados

**Response:**
```json
{
  "success": true,
  "orders": [...]
}
```

### **GET /api/orders/:id**
Detalhes de um pedido

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "orderNumber": "ORD-8472",
    "service": {...},
    "status": "processing",
    "automations": [
      {
        "connector": "gmail",
        "action": "send_confirmation",
        "status": "success"
      }
    ]
  }
}
```

---

## 💰 CRÉDITOS

### **GET /api/credits/balance**
Saldo de créditos do usuário

**Response:**
```json
{
  "success": true,
  "balance": 1250,
  "history": [...]
}
```

### **GET /api/credits/packages**
Pacotes de créditos disponíveis

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "id": "business",
      "name": "Business",
      "price": 997,
      "credits": 1400,
      "discount": 40
    }
  ]
}
```

### **POST /api/credits/purchase**
Comprar pacote de créditos

**Request:**
```json
{
  "packageId": "business",
  "paymentMethod": "pix"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "status": "pending",
    "pixQrCode": "00020126...",
    "amount": 997
  }
}
```

---

## 💳 PAGAMENTOS

### **POST /api/payments/create**
Cria novo pagamento

**Request:**
```json
{
  "amount": 997,
  "method": "pix",
  "orderId": "uuid",
  "gateway": "asaas"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "status": "pending",
    "qrCode": "...",
    "expiresAt": "2024-01-01T12:00:00Z"
  }
}
```

### **GET /api/payments/:id**
Status do pagamento

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "status": "paid",
    "paidAt": "2024-01-01T10:30:00Z"
  }
}
```

### **POST /api/webhooks/asaas**
Webhook Asaas (interno)

### **POST /api/webhooks/paypal**
Webhook PayPal (interno)

---

## 🎯 RECOMENDAÇÕES

### **GET /api/recommendations**
Recomendações personalizadas com IA

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "serviceId": "tiktok-shop-br",
      "serviceName": "TikTok Shop Brasil",
      "reason": "Complementa seu TikTok Shop US",
      "confidence": 0.92,
      "potentialSavings": 500
    }
  ]
}
```

---

## 💬 SUPORTE

### **POST /api/support/tickets**
Criar ticket de suporte

**Request:**
```json
{
  "subject": "Problema com pedido",
  "description": "Não recebi o acesso",
  "category": "technical",
  "priority": "high",
  "orderId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "uuid",
    "ticketNumber": "TKT-1234",
    "status": "open"
  }
}
```

### **GET /api/support/tickets**
Lista tickets do usuário

### **POST /api/support/tickets/:id/messages**
Adicionar mensagem ao ticket

---

## 📊 ANALYTICS (Admin)

### **GET /api/admin/analytics/overview**
Overview geral do sistema

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "today": 8450,
      "week": 45800,
      "month": 182000
    },
    "orders": {
      "pending": 12,
      "processing": 8,
      "completed": 156
    },
    "clients": {
      "total": 89,
      "new": 5,
      "active": 67
    }
  }
}
```

---

## 🔧 WEBHOOKS

### **Webhook Events**

Todos os webhooks enviam POST para URLs configuradas:

#### **order.created**
```json
{
  "event": "order.created",
  "data": {
    "orderId": "uuid",
    "orderNumber": "ORD-8472"
  }
}
```

#### **order.completed**
```json
{
  "event": "order.completed",
  "data": {
    "orderId": "uuid",
    "completedAt": "2024-01-01T10:00:00Z"
  }
}
```

#### **payment.completed**
```json
{
  "event": "payment.completed",
  "data": {
    "paymentId": "uuid",
    "amount": 997
  }
}
```

---

## ⚠️ CÓDIGOS DE ERRO

```
200 - Success
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
422 - Validation Error
429 - Rate Limit Exceeded
500 - Internal Server Error
```

**Formato de Erro:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Créditos insuficientes"
  }
}
```

---

## 🔄 RATE LIMITS

- **Autenticado:** 100 req/min
- **Não autenticado:** 20 req/min
- **Webhooks:** Ilimitado

---

**Documentação completa em: https://docs.businessautomation.com**
