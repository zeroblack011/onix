// ===================================
// TIPOS PRINCIPAIS DO SISTEMA
// ===================================

export type UserRole = 'client' | 'admin' | 'team'
export type UserTier = 'basic' | 'premium' | 'enterprise'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  document?: string
  credits: number
  tier: UserTier
  createdAt: Date
  updatedAt: Date
}

// ===================================
// SERVIÇOS
// ===================================

export type ServiceCategory =
  | 'documents'
  | 'shops'
  | 'infrastructure'
  | 'manufacturing'
  | 'marketing'
  | 'technology'
  | 'business_managers'
  | 'ecommerce'
  | 'consulting'
  | 'support'

export type ProcessingType = 'automatic' | 'hybrid' | 'manual'
export type PriceType = 'one_time' | 'monthly' | 'annual'

export interface Service {
  id: string
  slug: string
  name: string
  description: string
  category: ServiceCategory
  price: number
  priceType: PriceType
  credits: number
  processingType: ProcessingType
  estimatedTime: string
  features: string[]
  requirements?: string[]
  formFields: FormField[]
  icon?: string
  image?: string
  popular: boolean
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// ===================================
// FORMULÁRIOS
// ===================================

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'file'
  | 'checkbox'
  | 'radio'

export interface FormField {
  id: string
  name: string
  label: string
  type: FormFieldType
  placeholder?: string
  required: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  options?: Array<{ value: string; label: string }>
  multiple?: boolean
  accept?: string // para file inputs
  maxSize?: number // para file inputs (MB)
  helperText?: string
  conditional?: {
    field: string
    value: any
  }
}

// ===================================
// PEDIDOS
// ===================================

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'waiting_info'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'

export interface Order {
  id: string
  orderNumber: string
  userId: string
  serviceId: string
  amount: number
  paidWithCredits: boolean
  creditsUsed: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  processingType: ProcessingType
  assignedTo?: string
  estimatedDelivery?: Date
  deliveredAt?: Date
  formData: Record<string, any>
  automations?: AutomationLog[]
  notes?: string
  clientNotes?: string
  createdAt: Date
  updatedAt: Date
}

// ===================================
// CRÉDITOS
// ===================================

export interface CreditPackage {
  id: string
  name: string
  price: number
  credits: number
  discount: number
  effectivePrice: number
  bestFor: string
  popular: boolean
  active: boolean
}

export type CreditTransactionType = 'purchase' | 'usage' | 'refund' | 'bonus'

export interface CreditTransaction {
  id: string
  userId: string
  type: CreditTransactionType
  amount: number
  balance: number
  description: string
  relatedOrderId?: string
  relatedPaymentId?: string
  metadata?: Record<string, any>
  createdAt: Date
}

// ===================================
// PAGAMENTOS
// ===================================

export type PaymentGateway = 'asaas' | 'paypal' | 'square'
export type PaymentMethod = 'pix' | 'credit_card' | 'boleto' | 'paypal'

export interface Payment {
  id: string
  userId: string
  orderId?: string
  creditPackageId?: string
  amount: number
  currency: string
  gateway: PaymentGateway
  gatewayTransactionId?: string
  gatewayStatus?: string
  status: PaymentStatus
  paymentMethod: PaymentMethod
  metadata?: Record<string, any>
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ===================================
// ASSINATURAS
// ===================================

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired'
export type SubscriptionInterval = 'monthly' | 'annual'

export interface Subscription {
  id: string
  userId: string
  serviceId: string
  status: SubscriptionStatus
  amount: number
  interval: SubscriptionInterval
  currentPeriodStart: Date
  currentPeriodEnd: Date
  gatewaySubscriptionId?: string
  gateway: PaymentGateway
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ===================================
// SUPORTE
// ===================================

export type TicketStatus =
  | 'open'
  | 'waiting_client'
  | 'waiting_team'
  | 'resolved'
  | 'closed'

export type TicketCategory = 'technical' | 'billing' | 'general'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface SupportTicket {
  id: string
  ticketNumber: string
  userId: string
  orderId?: string
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export interface SupportMessage {
  id: string
  ticketId: string
  userId: string
  message: string
  attachments?: string[]
  isInternal: boolean
  createdAt: Date
}

// ===================================
// NOTIFICAÇÕES
// ===================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'order' | 'payment' | 'support' | 'system'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  category: NotificationCategory
  link?: string
  read: boolean
  metadata?: Record<string, any>
  createdAt: Date
  readAt?: Date
}

// ===================================
// AUTOMAÇÕES
// ===================================

export type ConnectorType =
  | 'gmail'
  | 'google_drive'
  | 'google_calendar'
  | 'intercom'
  | 'github'
  | 'cloudinary'
  | 'figma'
  | 'vercel'
  | 'huggingface'
  | 'paypal'
  | 'square'

export type AutomationStatus = 'success' | 'failed' | 'pending'

export interface AutomationLog {
  id: string
  orderId: string
  connector: ConnectorType
  action: string
  status: AutomationStatus
  input?: Record<string, any>
  output?: Record<string, any>
  error?: string
  executionTime?: number
  createdAt: Date
}

// ===================================
// ANALYTICS
// ===================================

export interface Analytics {
  id: string
  date: string
  revenue: number
  orders: number
  newClients: number
  activeSubscriptions: number
  ordersProcessed: number
  averageProcessingTime: number
  automationSuccessRate: number
  nps?: number
  supportTickets: number
  averageResponseTime: number
  metadata?: Record<string, any>
  createdAt: Date
}

// ===================================
// CONECTORES
// ===================================

export interface ConnectorConfig {
  enabled: boolean
  credentials: Record<string, any>
  settings?: Record<string, any>
}

export interface ConnectorResult {
  success: boolean
  data?: any
  error?: string
  executionTime: number
}

// ===================================
// RECOMENDAÇÕES IA
// ===================================

export interface AIRecommendation {
  serviceId: string
  serviceName: string
  reason: string
  confidence: number
  potentialSavings?: number
  relatedServices?: string[]
}

// ===================================
// DASHBOARD
// ===================================

export interface ClientDashboard {
  user: User
  credits: number
  activeServices: number
  pendingOrders: number
  recentOrders: Order[]
  recommendations: AIRecommendation[]
  notifications: Notification[]
}

export interface AdminDashboard {
  revenue: {
    today: number
    week: number
    month: number
  }
  orders: {
    pending: number
    processing: number
    completed: number
  }
  clients: {
    total: number
    new: number
    active: number
  }
  automations: {
    total: number
    successful: number
    failed: number
  }
  recentOrders: Order[]
  team: {
    online: number
    offline: number
  }
}
