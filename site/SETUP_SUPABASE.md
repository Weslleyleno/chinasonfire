# 🚀 Setup Supabase - Passo a Passo

## 1. Criar Conta e Projeto

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub
4. Clique em "New Project"
5. Preencha:
   - **Name:** CHINAS ON FIRE
   - **Database Password:** (anote esta senha!)
   - **Region:** Escolha mais próxima (ex: South America)
6. Clique em "Create new project"
7. Aguarde ~2 minutos para criar

## 2. Obter Credenciais

1. No projeto, clique em ⚙️ (Settings)
2. Clique em "API"
3. **COPIE:**
   - `URL` (Project URL)
   - `anon` `public` key (API Key)

## 3. Criar Tabelas no Banco

1. No menu lateral, clique em "SQL Editor"
2. Clique em "New query"
3. Cole este SQL:

```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  avatar INTEGER DEFAULT 0,
  avatar_url TEXT,
  monthly_goal DECIMAL DEFAULT 30000,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de contas
CREATE TABLE accounts (
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
CREATE TABLE proxies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de chaves PIX
CREATE TABLE pix_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  key TEXT NOT NULL,
  owner_name TEXT,
  bank_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de gastos
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  value DECIMAL NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de plataformas (global)
CREATE TABLE platforms (
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
CREATE INDEX idx_accounts_user_date ON accounts(user_id, date);
CREATE INDEX idx_proxies_user ON proxies(user_id);
CREATE INDEX idx_pix_keys_user ON pix_keys(user_id);
CREATE INDEX idx_expenses_user ON expenses(user_id);
```

4. Clique em "Run" (ou F5)

## 4. Configurar Row Level Security (RLS)

No SQL Editor, execute:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários só veem seus próprios dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Contas
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

-- Proxies
CREATE POLICY "Users can manage own proxies" ON proxies
  FOR ALL USING (auth.uid() = user_id);

-- Chaves PIX
CREATE POLICY "Users can manage own pix keys" ON pix_keys
  FOR ALL USING (auth.uid() = user_id);

-- Gastos
CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- Plataformas (todos podem ver, todos podem editar)
CREATE POLICY "Anyone can view platforms" ON platforms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage platforms" ON platforms
  FOR ALL USING (auth.role() = 'authenticated');
```

## 5. Configurar Autenticação

1. No menu lateral, clique em "Authentication"
2. Clique em "Providers"
3. Ative "Email" provider
4. Desative "Confirm email" (para desenvolvimento rápido)
5. Salve

## 6. Adicionar Supabase ao Projeto

Adicione no `index.html` antes do `</body>`:

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
  const SUPABASE_URL = 'SUA_URL_AQUI';
  const SUPABASE_KEY = 'SUA_KEY_AQUI';
  
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Tornar disponível globalmente
  window.supabaseClient = supabase;
</script>
```

## 7. Deploy do Frontend

### Opção A: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Opção B: Netlify

1. Acesse: https://netlify.com
2. Arraste a pasta do projeto
3. Pronto!

### Opção C: GitHub Pages

1. Crie repositório no GitHub
2. Faça upload dos arquivos
3. Settings > Pages > Source: main branch
4. Pronto!

## 8. Adaptar Código para Supabase

Exemplo de substituição:

```javascript
// ANTES (localStorage)
localStorage.setItem('accounts', JSON.stringify(accounts));

// DEPOIS (Supabase)
async function saveAccounts(accounts) {
  const { data, error } = await supabase
    .from('accounts')
    .upsert(accounts.map(acc => ({
      ...acc,
      user_id: currentUserId
    })));
}

// Carregar contas
async function loadAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', currentUserId);
  
  return data || [];
}
```

---

**Pronto!** Seu site estará online e todos os dados salvos no banco!

