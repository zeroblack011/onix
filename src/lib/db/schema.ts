import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ===================================
// USUÁRIOS E AUTENTICAÇÃO
// ===================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  role: text('role').notNull().default('client'), // client, admin, team
  avatar: text('avatar'),
  phone: text('phone'),
  document: text('document'), // CPF/CNPJ
  credits: real('credits').notNull().default(0),
  tier: text('tier').default('basic'), // basic, premium, enterprise
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ===================================
// SERVIÇOS DISPONÍVEIS
// ===================================
export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // documents, shops, infrastructure, etc
  price: real('price').notNull(),
  priceType: text('price_type').notNull(), // one_time, monthly, annual
  credits: real('credits').notNull(), // equivalente em créditos
  processingType: text('processing_type').notNull(), // automatic, hybrid, manual
  estimatedTime: text('estimated_time').notNull(), // ex: "Imediato", "4-8h", "24-48h"
  features: text('features').notNull(), // JSON array
  requirements: text('requirements'), // JSON array
  formFields: text('form_fields').notNull(), // JSON array - campos do formulário
  icon: text('icon'),
  image: text('image'),
  popular: integer('popular', { mode: 'boolean' }).default(false),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ===================================
// PACOTES DE CRÉDITOS
// ===================================
export const creditPackages = sqliteTable('credit_packages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // Starter, Business, Premium, Empire
  price: real('price').notNull(),
  credits: real('credits').notNull(),
  discount: real('discount').notNull(), // percentual
  effectivePrice: real('effective_price').notNull(), // preço efetivo por crédito
  bestFor: text('best_for').notNull(),
  popular: integer('popular', { mode: 'boolean' }).default(false),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ===================================
// PEDIDOS
// ===================================
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id),
  serviceId: text('service_id').notNull().references(() => services.id),

  // Valores
  amount: real('amount').notNull(),
  paidWithCredits: integer('paid_with_credits', { mode: 'boolean' }).default(false),
  creditsUsed: real('credits_used').default(0),

  // Status
  status: text('status').notNull().default('pending'),
  // pending, processing, waiting_info, completed, cancelled, refunded

  paymentStatus: text('payment_status').notNull().default('pending'),
  // pending, processing, paid, failed, refunded

  // Processamento
  processingType: text('processing_type').notNull(),
  assignedTo: text('assigned_to').references(() => users.id), // membro da equipe
  estimatedDelivery: integer('estimated_delivery', { mode: 'timestamp' }),
  deliveredAt: integer('delivered_at', { mode: 'timestamp' }),

  // Dados do formulário
  formData: text('form_data').notNull(), // JSON

  // Automações executadas
  automations: text('automations'), // JSON - log de automações

  // Notas e comunicação
  notes: text('notes'), // Notas internas
  clientNotes: text('client_notes'), // Notas para o cliente

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ===================================
// TRANSAÇÕES DE CRÉDITOS
// ===================================
export const creditTransactions = sqliteTable('credit_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // purchase, usage, refund, bonus
  amount: real('amount').notNull(), // positivo = ganho, negativo = gasto
  balance: real('balance').notNull(), // saldo após transação
  description: text('description').notNull(),
  relatedOrderId: text('related_order_id').references(() => orders.id),
  relatedPaymentId: text('related_payment_id').references(() => payments.id),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ===================================
// PAGAMENTOS
// ===================================
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  orderId: text('order_id').references(() => orders.id),
  creditPackageId: text('credit_package_id').references(() => creditPackages.id),

  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('BRL'),

  // Gateway
  gateway: text('gateway').notNull(), // asaas, paypal, square
  gatewayTransactionId: text('gateway_transaction_id'),
  gatewayStatus: text('gateway_status'),

  // Status
  status: text('status').notNull().default('pending'),
  // pending, processing, completed, failed, refunded

  // Método
  paymentMethod: text('payment_method').notNull(), // pix, credit_card, boleto

  // Metadados
  metadata: text('metadata'), // JSON

  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ===================================
// ASSINATURAS
// ===================================
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  serviceId: text('service_id').notNull().references(() => services.id),

  status: text('status').notNull().default('active'),
  // active, paused, cancelled, expired

  amount: real('amount').notNull(),
  interval: text('interval').notNull(), // monthly, annual

  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }).notNull(),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),

  gatewaySubscriptionId: text('gateway_subscription_id'),
  gateway: text('gateway').notNull(),

  cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ===================================
// TICKETS DE SUPORTE
// ===================================
export const supportTickets = sqliteTable('support_tickets', {
  id: text('id').primaryKey(),
  ticketNumber: text('ticket_number').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id),
  orderId: text('order_id').references(() => orders.id),

  subject: text('subject').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // technical, billing, general
  priority: text('priority').notNull().default('normal'), // low, normal, high, urgent

  status: text('status').notNull().default('open'),
  // open, waiting_client, waiting_team, resolved, closed

  assignedTo: text('assigned_to').references(() => users.id),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
})

// ===================================
// MENSAGENS DE SUPORTE
// ===================================
export const supportMessages = sqliteTable('support_messages', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').notNull().references(() => supportTickets.id),
  userId: text('user_id').notNull().references(() => users.id),

  message: text('message').notNull(),
  attachments: text('attachments'), // JSON array
  isInternal: integer('is_internal', { mode: 'boolean' }).default(false),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ===================================
// NOTIFICAÇÕES
// ===================================
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),

  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // info, success, warning, error
  category: text('category').notNull(), // order, payment, support, system

  link: text('link'),
  read: integer('read', { mode: 'boolean' }).default(false),

  metadata: text('metadata'), // JSON

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  readAt: integer('read_at', { mode: 'timestamp' }),
})

// ===================================
// LOGS DE AUTOMAÇÃO
// ===================================
export const automationLogs = sqliteTable('automation_logs', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),

  connector: text('connector').notNull(), // gmail, drive, intercom, etc
  action: text('action').notNull(),
  status: text('status').notNull(), // success, failed, pending

  input: text('input'), // JSON
  output: text('output'), // JSON
  error: text('error'),

  executionTime: integer('execution_time'), // milliseconds

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ===================================
// ANALYTICS
// ===================================
export const analytics = sqliteTable('analytics', {
  id: text('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD

  // Métricas de negócio
  revenue: real('revenue').default(0),
  orders: integer('orders').default(0),
  newClients: integer('new_clients').default(0),
  activeSubscriptions: integer('active_subscriptions').default(0),

  // Métricas de operação
  ordersProcessed: integer('orders_processed').default(0),
  averageProcessingTime: integer('average_processing_time').default(0),
  automationSuccessRate: real('automation_success_rate').default(0),

  // Métricas de satisfação
  nps: real('nps'),
  supportTickets: integer('support_tickets').default(0),
  averageResponseTime: integer('average_response_time').default(0),

  metadata: text('metadata'), // JSON - dados adicionais

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})
