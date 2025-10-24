-- ===================================
-- SCHEMA PARA CLOUDFLARE D1
-- Sistema de Automação Empresarial
-- ===================================

-- ===================================
-- USUÁRIOS E AUTENTICAÇÃO
-- ===================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client', -- client, admin, team
  avatar TEXT,
  phone TEXT,
  document TEXT, -- CPF/CNPJ
  credits REAL NOT NULL DEFAULT 0,
  tier TEXT DEFAULT 'basic', -- basic, premium, enterprise
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ===================================
-- SERVIÇOS DISPONÍVEIS
-- ===================================
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- documents, shops, infrastructure, etc
  price REAL NOT NULL,
  price_type TEXT NOT NULL, -- one_time, monthly, annual
  credits REAL NOT NULL,
  processing_type TEXT NOT NULL, -- automatic, hybrid, manual
  estimated_time TEXT NOT NULL,
  features TEXT NOT NULL, -- JSON array
  requirements TEXT, -- JSON array
  form_fields TEXT NOT NULL, -- JSON array
  icon TEXT,
  image TEXT,
  popular INTEGER DEFAULT 0, -- boolean
  active INTEGER DEFAULT 1, -- boolean
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(active);

-- ===================================
-- PACOTES DE CRÉDITOS
-- ===================================
CREATE TABLE IF NOT EXISTS credit_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  credits REAL NOT NULL,
  discount REAL NOT NULL,
  effective_price REAL NOT NULL,
  best_for TEXT NOT NULL,
  popular INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_credit_packages_active ON credit_packages(active);

-- ===================================
-- PEDIDOS
-- ===================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id),
  service_id TEXT NOT NULL REFERENCES services(id),

  -- Valores
  amount REAL NOT NULL,
  paid_with_credits INTEGER DEFAULT 0,
  credits_used REAL DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',

  -- Processamento
  processing_type TEXT NOT NULL,
  assigned_to TEXT REFERENCES users(id),
  estimated_delivery INTEGER,
  delivered_at INTEGER,

  -- Dados
  form_data TEXT NOT NULL, -- JSON
  automations TEXT, -- JSON
  notes TEXT,
  client_notes TEXT,

  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ===================================
-- TRANSAÇÕES DE CRÉDITOS
-- ===================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL, -- purchase, usage, refund, bonus
  amount REAL NOT NULL,
  balance REAL NOT NULL,
  description TEXT NOT NULL,
  related_order_id TEXT REFERENCES orders(id),
  related_payment_id TEXT REFERENCES payments(id),
  metadata TEXT, -- JSON
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- ===================================
-- PAGAMENTOS
-- ===================================
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  order_id TEXT REFERENCES orders(id),
  credit_package_id TEXT REFERENCES credit_packages(id),

  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',

  -- Gateway
  gateway TEXT NOT NULL,
  gateway_transaction_id TEXT,
  gateway_status TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,

  -- Metadados
  metadata TEXT,

  paid_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway ON payments(gateway);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- ===================================
-- ASSINATURAS
-- ===================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  service_id TEXT NOT NULL REFERENCES services(id),

  status TEXT NOT NULL DEFAULT 'active',
  amount REAL NOT NULL,
  interval TEXT NOT NULL,

  current_period_start INTEGER NOT NULL,
  current_period_end INTEGER NOT NULL,

  gateway_subscription_id TEXT,
  gateway TEXT NOT NULL,

  cancelled_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ===================================
-- TICKETS DE SUPORTE
-- ===================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id),
  order_id TEXT REFERENCES orders(id),

  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',

  assigned_to TEXT REFERENCES users(id),

  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  resolved_at INTEGER
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);

-- ===================================
-- MENSAGENS DE SUPORTE
-- ===================================
CREATE TABLE IF NOT EXISTS support_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id),
  user_id TEXT NOT NULL REFERENCES users(id),

  message TEXT NOT NULL,
  attachments TEXT, -- JSON
  is_internal INTEGER DEFAULT 0,

  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at);

-- ===================================
-- NOTIFICAÇÕES
-- ===================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),

  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,

  link TEXT,
  read INTEGER DEFAULT 0,
  metadata TEXT, -- JSON

  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  read_at INTEGER
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ===================================
-- LOGS DE AUTOMAÇÃO
-- ===================================
CREATE TABLE IF NOT EXISTS automation_logs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),

  connector TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,

  input TEXT, -- JSON
  output TEXT, -- JSON
  error TEXT,

  execution_time INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_automation_logs_order_id ON automation_logs(order_id);
CREATE INDEX idx_automation_logs_connector ON automation_logs(connector);
CREATE INDEX idx_automation_logs_status ON automation_logs(status);
CREATE INDEX idx_automation_logs_created_at ON automation_logs(created_at);

-- ===================================
-- ANALYTICS
-- ===================================
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE, -- YYYY-MM-DD

  -- Métricas de negócio
  revenue REAL DEFAULT 0,
  orders INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,

  -- Métricas de operação
  orders_processed INTEGER DEFAULT 0,
  average_processing_time INTEGER DEFAULT 0,
  automation_success_rate REAL DEFAULT 0,

  -- Métricas de satisfação
  nps REAL,
  support_tickets INTEGER DEFAULT 0,
  average_response_time INTEGER DEFAULT 0,

  metadata TEXT, -- JSON
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_analytics_date ON analytics(date);

-- ===================================
-- DADOS INICIAIS (SEED)
-- ===================================

-- Admin padrão (senha: admin123 - TROCAR EM PRODUÇÃO!)
-- Hash SHA-256 de "admin123": 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT OR IGNORE INTO users (id, email, name, password, role, credits, tier)
VALUES (
  'admin-001',
  'admin@automacao.com',
  'Administrador',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'admin',
  0,
  'enterprise'
);

-- Pacotes de Créditos
INSERT OR IGNORE INTO credit_packages (id, name, price, credits, discount, effective_price, best_for, popular) VALUES
  ('pkg-starter', 'Starter', 497, 600, 20, 0.83, 'Pequenos negócios iniciando', 0),
  ('pkg-business', 'Business', 997, 1400, 40, 0.71, 'Empresas em crescimento', 1),
  ('pkg-premium', 'Premium', 2997, 5000, 67, 0.60, 'Operações de médio porte', 0),
  ('pkg-empire', 'Empire', 4997, 10000, 100, 0.50, 'Grandes volumes e agências', 0);

-- ===================================
-- COMANDOS ÚTEIS PARA D1
-- ===================================

-- Criar banco:
-- wrangler d1 create business_automation_db

-- Executar este schema:
-- wrangler d1 execute business_automation_db --file=./schema.sql

-- Query de teste:
-- wrangler d1 execute business_automation_db --command="SELECT * FROM users"

-- Ver tabelas:
-- wrangler d1 execute business_automation_db --command="SELECT name FROM sqlite_master WHERE type='table'"

-- Backup:
-- wrangler d1 export business_automation_db --output=backup.sql

-- ===================================
-- PERFORMANCE NOTES
-- ===================================

-- D1 é otimizado para:
-- ✅ Leituras rápidas (distribuídas globalmente)
-- ✅ Queries simples com índices
-- ✅ Baixa latência (<50ms)
-- ⚠️ Escritas têm limite (1000/min em free tier)
-- ⚠️ Sem JOINs complexos (manter simples)
-- ⚠️ Tamanho máximo: 500MB (free), 10GB (paid)

-- Dicas de otimização:
-- 1. Use índices em colunas de filtro/busca
-- 2. Evite JOINs com mais de 3 tabelas
-- 3. Cache resultados no KV quando possível
-- 4. Use batch inserts para múltiplos registros
-- 5. Normalize apenas o necessário
