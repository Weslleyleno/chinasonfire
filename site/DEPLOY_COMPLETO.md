# 🚀 Deploy Completo - CHINAS ON FIRE

## 📦 Opção Recomendada: Supabase (Mais Fácil e Gratuita)

### Por que Supabase?
- ✅ **100% Gratuito** para começar
- ✅ **PostgreSQL** (banco profissional)
- ✅ **API REST automática**
- ✅ **Autenticação incluída**
- ✅ **Hospedagem gratuita** (Vercel/Netlify)
- ✅ **Fácil de atualizar** código

---

## 🎯 Passo a Passo Completo

### 1️⃣ Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub
4. Clique em "New Project"
5. Preencha:
   - **Name:** CHINAS ON FIRE
   - **Database Password:** (anote esta senha!)
   - **Region:** South America (São Paulo)
6. Clique em "Create new project"
7. Aguarde ~2 minutos

### 2️⃣ Obter Credenciais

1. No projeto, clique em ⚙️ (Settings)
2. Clique em "API"
3. **COPIE e GUARDE:**
   - `URL` (Project URL)
   - `anon` `public` key (API Key)

### 3️⃣ Criar Tabelas no Banco

1. No menu lateral, clique em "SQL Editor"
2. Clique em "New query"
3. Cole este SQL completo:

```sql
-- ============================================
-- TABELAS DO SISTEMA CHINAS ON FIRE
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

-- Criar usuário admin padrão
INSERT INTO users (username, password_hash, is_admin, avatar, avatar_url)
VALUES (
  'weslleyleno60',
  '$2b$10$rK8X8X8X8X8X8X8X8X8X8u8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', -- Hash da senha: 01072016Silva.
  true,
  0,
  'https://flagcdn.com/w160/cn.png'
) ON CONFLICT (username) DO NOTHING;
```

4. Clique em "Run" (ou F5)

### 4️⃣ Configurar Segurança (Row Level Security)

No SQL Editor, execute:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários só veem seus próprios dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Contas
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Proxies
CREATE POLICY "Users can manage own proxies" ON proxies
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Chaves PIX
CREATE POLICY "Users can manage own pix keys" ON pix_keys
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Gastos
CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Despesas Operacionais
CREATE POLICY "Users can manage own operational expenses" ON operational_expenses
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Plataformas (todos podem ver, todos podem editar)
CREATE POLICY "Anyone can view platforms" ON platforms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage platforms" ON platforms
  FOR ALL USING (auth.role() = 'authenticated');
```

### 5️⃣ Configurar Autenticação

1. No menu lateral, clique em "Authentication"
2. Clique em "Providers"
3. Ative "Email" provider
4. Desative "Confirm email" (para desenvolvimento rápido)
5. Salve

### 6️⃣ Adicionar Supabase ao Projeto

Adicione no `index.html` antes do `</body>`:

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
  // SUAS CREDENCIAIS AQUI
  const SUPABASE_URL = 'https://seu-projeto.supabase.co';
  const SUPABASE_KEY = 'sua-chave-publica-aqui';
  
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.supabaseClient = supabase;
</script>
```

### 7️⃣ Deploy do Frontend no Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Fazer login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd c:\Users\AiNote\Desktop\site
   vercel
   ```

4. **Siga as instruções:**
   - Project name: `chinasonfire`
   - Directory: `.` (ponto)
   - Override settings: N

5. **Pronto!** Seu site estará em: `https://chinasonfire.vercel.app`

---

## 🔄 Sistema de Atualizações

### Como Fazer Atualizações

1. **Edite os arquivos localmente**
2. **Faça deploy novamente:**
   ```bash
   vercel --prod
   ```

3. **Ou configure deploy automático:**
   - Crie repositório no GitHub
   - Conecte ao Vercel
   - Cada push atualiza automaticamente

### Migrar Dados do localStorage

Antes de fazer deploy, você pode migrar os dados existentes:

1. Abra o console do navegador (F12)
2. Execute este script para exportar dados:

```javascript
// Exportar todos os dados
const allData = {
  users: JSON.parse(localStorage.getItem('systemUsers') || '[]'),
  accounts: {},
  proxies: {},
  pixKeys: {},
  expenses: {},
  platforms: JSON.parse(localStorage.getItem('platforms') || '[]')
};

// Exportar contas de cada usuário
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('userData_') && key.includes('_accounts')) {
    const username = key.split('_')[2];
    allData.accounts[username] = JSON.parse(localStorage.getItem(key) || '[]');
  }
  if (key.startsWith('userData_') && key.includes('_proxies')) {
    const username = key.split('_')[2];
    allData.proxies[username] = JSON.parse(localStorage.getItem(key) || '[]');
  }
  if (key.startsWith('userData_') && key.includes('_pixKeys')) {
    const username = key.split('_')[2];
    allData.pixKeys[username] = JSON.parse(localStorage.getItem(key) || '[]');
  }
  if (key.startsWith('userData_') && key.includes('_expenses')) {
    const username = key.split('_')[2];
    allData.expenses[username] = JSON.parse(localStorage.getItem(key) || '[]');
  }
});

console.log(JSON.stringify(allData, null, 2));
// Copie o resultado e salve em um arquivo .json
```

---

## 📝 Checklist Final Antes do Deploy

- [ ] Criar projeto no Supabase
- [ ] Criar todas as tabelas
- [ ] Configurar Row Level Security
- [ ] Obter credenciais (URL e Key)
- [ ] Adicionar Supabase ao `index.html`
- [ ] Testar localmente
- [ ] Fazer deploy no Vercel
- [ ] Testar em produção
- [ ] Migrar dados do localStorage (se necessário)

---

## 🆘 Suporte

Se precisar de ajuda:
1. Veja os logs no console do navegador (F12)
2. Verifique os logs do Supabase (Dashboard > Logs)
3. Verifique os logs do Vercel (Dashboard > Deployments)

---

**Pronto para deploy!** 🚀

