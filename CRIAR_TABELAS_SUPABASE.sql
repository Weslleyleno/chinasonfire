-- ============================================
-- TABELAS DO SISTEMA CHINAS ON FIRE
-- ============================================
-- COPIE TODO ESTE ARQUIVO E COLE NO SQL EDITOR DO SUPABASE
-- ============================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  avatar INTEGER DEFAULT 0,
  avatar_url TEXT,
  monthly_goal DECIMAL DEFAULT 30000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de contas
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  deposito DECIMAL DEFAULT 0,
  redeposito DECIMAL DEFAULT 0,
  saque DECIMAL DEFAULT 0,
  bau DECIMAL DEFAULT 0,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de proxies
CREATE TABLE IF NOT EXISTS proxies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de chaves PIX
CREATE TABLE IF NOT EXISTS pix_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  key TEXT NOT NULL,
  owner_name TEXT,
  bank_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de gastos
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  value DECIMAL NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de despesas operacionais
CREATE TABLE IF NOT EXISTS operational_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  proxy_expense DECIMAL DEFAULT 0,
  numbers_expense DECIMAL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de plataformas (global)
CREATE TABLE IF NOT EXISTS platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_date ON accounts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_proxies_user ON proxies(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_keys_user ON pix_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_user ON operational_expenses(user_id);




