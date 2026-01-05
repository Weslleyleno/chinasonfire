# 🚀 Guia FÁCIL - Como Colocar seu Site no Ar

## 📋 O que você vai precisar:

1. ✅ Uma conta no GitHub (grátis)
2. ✅ Uma conta no Vercel (grátis)
3. ✅ Uma conta no Supabase (grátis)
4. ✅ 30-60 minutos do seu tempo

---

## 🎯 PASSO 1: Criar Conta no GitHub

### O que é GitHub?
É um lugar para guardar seu código na internet (tipo um Google Drive para programadores).

### Como fazer:

1. **Acesse:** https://github.com
2. Clique em **"Sign up"** (criar conta)
3. Preencha:
   - Username (escolha um nome)
   - Email
   - Senha
4. Clique em **"Create account"**
5. Confirme seu email (vai chegar um email para confirmar)

**✅ Pronto! Conta criada!**

---

## 🎯 PASSO 2: Enviar seu Código para o GitHub

### O que vamos fazer:
Vamos colocar todos os arquivos do seu site no GitHub.

### Como fazer:

1. **Abra o PowerShell** (no Windows):
   - Pressione `Windows + R`
   - Digite: `powershell`
   - Pressione Enter

2. **Vá até a pasta do seu site:**
   ```powershell
   cd C:\Users\AiNote\Desktop\site
   ```

3. **Instale o Git** (se ainda não tiver):
   - Acesse: https://git-scm.com/download/win
   - Baixe e instale (só clicar "Next" em tudo)

4. **Configure o Git** (só uma vez):
   ```powershell
   git config --global user.name "Seu Nome"
   git config --global user.email "seu-email@exemplo.com"
   ```
   (Substitua pelos seus dados)

5. **Crie um repositório no GitHub:**
   - Acesse: https://github.com/new
   - **Repository name:** `chinasonfire` (ou outro nome)
   - **NÃO marque** "Add a README file"
   - Clique em **"Create repository"**

6. **Envie seus arquivos:**
   No PowerShell, cole estes comandos um por um:

   ```powershell
   git init
   git add .
   git commit -m "Primeiro commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/chinasonfire.git
   git push -u origin main
   ```

   **⚠️ IMPORTANTE:** Substitua `SEU-USUARIO` pelo seu username do GitHub!

   Exemplo: Se seu username é `joaosilva`, seria:
   ```
   git remote add origin https://github.com/joaosilva/chinasonfire.git
   ```

7. **Vai pedir login:**
   - Username: seu username do GitHub
   - Password: use um **Personal Access Token** (veja abaixo)

### Como criar Personal Access Token:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** > **"Generate new token (classic)"**
3. Dê um nome: `Meu Site`
4. Marque: **`repo`** (todas as opções de repo)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá uma vez!)
7. Use esse token como senha quando pedir

**✅ Pronto! Seus arquivos estão no GitHub!**

---

## 🎯 PASSO 3: Criar Banco de Dados (Supabase)

### O que é Supabase?
É onde seus dados (usuários, contas, etc.) vão ficar salvos.

### Como fazer:

1. **Acesse:** https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub (mesma conta que você criou)
4. Clique em **"New Project"**
5. Preencha:
   - **Name:** `CHINAS ON FIRE`
   - **Database Password:** (escolha uma senha forte e ANOTE!)
   - **Region:** `South America (São Paulo)`
6. Clique em **"Create new project"**
7. Aguarde ~2 minutos (vai criar o banco)

8. **Copiar credenciais:**
   - No projeto, clique em ⚙️ (Settings)
   - Clique em **"API"**
   - **COPIE e GUARDE:**
     - `URL` (Project URL) - algo como: `https://xxxxx.supabase.co`
     - `anon` `public` key (API Key) - uma chave longa

9. **Criar tabelas:**
   - No menu lateral, clique em **"SQL Editor"**
   - Clique em **"New query"**
   - Cole este código SQL completo:

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
```

10. Clique em **"Run"** (ou pressione F5)

**✅ Pronto! Banco de dados criado!**

---

## 🎯 PASSO 4: Conectar Site ao Supabase

### O que vamos fazer:
Vamos adicionar o código do Supabase no seu site.

### Como fazer:

1. **Abra o arquivo `index.html`** no Bloco de Notas (ou editor de texto)

2. **Procure por `</body>`** (no final do arquivo)

3. **ANTES de `</body>`, adicione:**

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
  // SUAS CREDENCIAIS DO SUPABASE AQUI
  const SUPABASE_URL = 'COLE_AQUI_A_URL_DO_SUPABASE';
  const SUPABASE_KEY = 'COLE_AQUI_A_CHAVE_DO_SUPABASE';
  
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.supabaseClient = supabase;
</script>
```

4. **Substitua:**
   - `COLE_AQUI_A_URL_DO_SUPABASE` pela URL que você copiou do Supabase
   - `COLE_AQUI_A_CHAVE_DO_SUPABASE` pela chave que você copiou do Supabase

5. **Salve o arquivo**

6. **Envie para o GitHub novamente:**
   No PowerShell:
   ```powershell
   cd C:\Users\AiNote\Desktop\site
   git add .
   git commit -m "Adicionei Supabase"
   git push
   ```

**✅ Pronto! Site conectado ao banco!**

---

## 🎯 PASSO 5: Colocar Site no Ar (Vercel)

### O que é Vercel?
É onde seu site vai ficar acessível na internet (tipo hospedagem grátis).

### Como fazer:

1. **Acesse:** https://vercel.com
2. Clique em **"Sign Up"**
3. Faça login com GitHub (mesma conta)
4. Clique em **"Add New Project"**
5. **Importe seu repositório:**
   - Selecione `chinasonfire` (ou o nome que você deu)
   - Clique em **"Import"**
6. **Configure:**
   - **Framework Preset:** `Other`
   - **Root Directory:** `.` (ponto)
   - Deixe o resto como está
7. Clique em **"Deploy"**
8. Aguarde ~2 minutos

**✅ Pronto! Seu site está no ar!**

Você vai receber uma URL tipo: `https://chinasonfire.vercel.app`

---

## 🎉 PRONTO! Seu Site Está Funcionando!

### ✅ O que você tem agora:

1. ✅ Site funcionando na internet
2. ✅ Banco de dados salvando tudo
3. ✅ Atualizações automáticas (quando você fizer `git push`)

---

## 🔄 Como Fazer Atualizações no Site

Sempre que quiser mudar algo:

1. **Edite os arquivos** no seu computador
2. **No PowerShell:**
   ```powershell
   cd C:\Users\AiNote\Desktop\site
   git add .
   git commit -m "Atualizei o site"
   git push
   ```
3. **Aguarde ~1 minuto** - Vercel atualiza automaticamente!

---

## 🆘 Problemas Comuns

### "Não consigo fazer login no GitHub"
- Verifique se confirmou o email
- Tente criar um Personal Access Token

### "Erro ao criar tabelas no Supabase"
- Certifique-se de copiar o SQL completo
- Verifique se está na aba "SQL Editor"

### "Site não aparece"
- Aguarde alguns minutos
- Verifique se o deploy terminou no Vercel

### "Dados não estão salvando"
- Verifique se as credenciais do Supabase estão corretas no `index.html`
- Verifique se as tabelas foram criadas

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas em algum passo, me avise qual passo e o que está acontecendo!

**Boa sorte! 🚀**

