# 🚀 Passo a Passo para Atualizar o Site

## 📋 Opção 1: GitHub + Vercel (RECOMENDADO - Mais Fácil)

### ✅ Vantagens:
- ✅ Atualiza automaticamente quando você faz upload
- ✅ Gratuito
- ✅ URL fixa (não muda)
- ✅ Fácil de atualizar

---

### 📝 Passo 1: Criar Conta no GitHub

1. Acesse: **https://github.com**
2. Clique em **"Sign up"** (canto superior direito)
3. Preencha:
   - Username (ex: `seu-nome`)
   - Email
   - Senha
4. Clique em **"Create account"**
5. Verifique seu email (se pedir)

---

### 📝 Passo 2: Criar Repositório

1. No GitHub, clique no **"+"** (canto superior direito)
2. Escolha **"New repository"**
3. Preencha:
   - **Repository name:** `chinas-on-fire` (ou qualquer nome)
   - **Description:** (opcional) "Sistema de controle financeiro"
   - Marque **"Public"** (gratuito) ou **"Private"** (privado)
   - **NÃO marque** "Add README" (os arquivos já existem)
4. Clique em **"Create repository"**

---

### 📝 Passo 3: Fazer Upload dos Arquivos

1. No repositório criado, clique em **"uploading an existing file"**
2. Arraste os arquivos:
   - `index.html`
   - `script.js`
   - `styles.css`
   - (Pode arrastar a pasta inteira também)
3. Role a página para baixo
4. Clique em **"Commit changes"** (botão verde)
5. Aguarde alguns segundos

---

### 📝 Passo 4: Fazer Deploy no Vercel

1. Acesse: **https://vercel.com**
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seu GitHub
5. Clique em **"Add New Project"**
6. Escolha o repositório **"chinas-on-fire"** (ou o nome que você deu)
7. Clique em **"Deploy"**
8. Aguarde ~1-2 minutos
9. **Pronto!** Você terá uma URL tipo: `https://chinas-on-fire.vercel.app`

---

### 📝 Passo 5: Atualizar o Site (Sempre que mudar algo)

1. No GitHub, vá no seu repositório
2. Clique em **"uploading an existing file"** novamente
3. Arraste os arquivos atualizados
4. Clique em **"Commit changes"**
5. O Vercel atualiza automaticamente em 1-2 minutos!

---

## 📋 Opção 2: Netlify Drop (SUPER RÁPIDO - Sem Conta)

### ✅ Vantagens:
- ✅ Não precisa criar conta
- ✅ Funciona em 30 segundos
- ✅ Gratuito

### ⚠️ Desvantagens:
- ⚠️ URL muda toda vez (mas você pode criar conta depois para URL fixa)

---

### 📝 Passo a Passo:

1. Acesse: **https://app.netlify.com/drop**
2. Arraste a pasta do site inteira (ou os arquivos)
3. Aguarde ~30 segundos
4. **Pronto!** Você terá uma URL tipo: `https://random-name-123.netlify.app`

### Para atualizar:
- Arraste a pasta novamente (vai substituir)

### Para URL fixa:
- Crie conta no Netlify
- Conecte com GitHub (mesmo processo do Vercel)

---

## 📋 Opção 3: GitHub Pages (Gratuito - URL Fixa)

### ✅ Vantagens:
- ✅ Gratuito
- ✅ URL fixa: `https://seu-usuario.github.io/chinas-on-fire`
- ✅ Fácil de atualizar

---

### 📝 Passo a Passo:

1. **Crie conta no GitHub** (se não tiver) - Passo 1 da Opção 1
2. **Crie repositório** - Passo 2 da Opção 1
3. **Faça upload dos arquivos** - Passo 3 da Opção 1
4. No repositório, clique em **"Settings"** (menu superior)
5. Role para baixo e clique em **"Pages"** (menu lateral esquerdo)
6. Em **"Source"**, escolha **"main"** (ou "master")
7. Clique em **"Save"**
8. Aguarde ~1-2 minutos
9. **Pronto!** Seu site estará em: `https://seu-usuario.github.io/chinas-on-fire`

### Para atualizar:
- Faça upload dos arquivos atualizados no GitHub (mesmo processo)

---

## 🎯 Qual Opção Escolher?

### 🥇 **Opção 1 (GitHub + Vercel)** - RECOMENDADO
- Melhor para atualizações frequentes
- Atualiza automaticamente
- URL profissional

### 🥈 **Opção 2 (Netlify Drop)** - MAIS RÁPIDO
- Se você quer testar rápido
- Sem criar conta
- Depois pode criar conta para URL fixa

### 🥉 **Opção 3 (GitHub Pages)** - MAIS SIMPLES
- Se você já tem GitHub
- URL fixa garantida
- Fácil de atualizar

---

## 📱 Como Acessar no Celular

Depois de fazer deploy, você terá uma URL. Use essa URL em qualquer dispositivo:

1. **No celular:** Abra o navegador e digite a URL
2. **Salve nos favoritos** para acessar rápido
3. **Funciona igual no PC e celular!**

---

## ⚠️ IMPORTANTE: Credenciais do Supabase

**NÃO ESQUEÇA:** As credenciais do Supabase estão no arquivo `index.html` (linhas 940-941).

Se você mudar o projeto do Supabase, precisa atualizar essas linhas:

```javascript
const SUPABASE_URL = 'https://olphpynltrofyfhpsbht.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## 🔄 Resumo Rápido

1. **Escolha uma opção** (recomendo Opção 1)
2. **Faça upload dos arquivos**
3. **Aguarde o deploy**
4. **Use a URL em qualquer dispositivo**
5. **Para atualizar:** Faça upload dos arquivos atualizados novamente

---

## ❓ Dúvidas?

- **GitHub:** https://docs.github.com
- **Vercel:** https://vercel.com/docs
- **Netlify:** https://docs.netlify.com

---

**Pronto! Agora você pode atualizar o site facilmente! 🚀**
