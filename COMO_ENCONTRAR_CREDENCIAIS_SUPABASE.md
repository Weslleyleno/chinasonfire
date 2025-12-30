# 🔍 Como Encontrar as Credenciais do Supabase

## 📍 Passo a Passo Visual

### PASSO 1: No Dashboard do Supabase

Você está vendo a tela principal do projeto, certo?

### PASSO 2: Olhe no Menu Lateral (Lado Esquerdo)

Você deve ver um menu com várias opções. Procure por:

- 🏠 **Home** (ou Dashboard)
- 📊 **Table Editor**
- 🔍 **SQL Editor**
- ⚙️ **Settings** ← **CLIQUE AQUI!**

### PASSO 3: Dentro de Settings

Depois de clicar em **Settings**, você verá um submenu:

- **General**
- **API** ← **CLIQUE AQUI!**
- **Database**
- **Auth**
- etc.

### PASSO 4: Na Página de API

Você verá várias seções. Procure por:

**"Project API keys"** ou **"API Settings"**

Você verá:

1. **Project URL**
   - Algo como: `https://xxxxxxxxxxxxx.supabase.co`
   - **COPIE ISSO!**

2. **anon public** (ou **anon key**)
   - Uma chave muito longa que começa com `eyJ...`
   - **COPIE ISSO TAMBÉM!**

---

## 🎯 Se Ainda Não Encontrar:

### Opção 1: Procure por "API" na barra de busca
- No topo do Supabase, tem uma barra de busca
- Digite: `API`
- Clique no resultado

### Opção 2: URL Direta
Tente acessar diretamente:
```
https://supabase.com/dashboard/project/[SEU-PROJETO]/settings/api
```

(Substitua `[SEU-PROJETO]` pelo ID do seu projeto)

---

## 📸 O Que Você Deve Ver:

Na página de API, você verá algo assim:

```
Project URL
https://xxxxxxxxxxxxx.supabase.co
[Botão de copiar]

API Keys
┌─────────────────────────────────────────┐
│ anon public                             │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
│ [Botão de copiar]                       │
└─────────────────────────────────────────┘
```

---

## 💡 Dica:

Se você não encontrar, me diga:
- O que você vê no menu lateral?
- Quais opções aparecem quando clica em Settings?

Assim posso te guiar melhor! 😊

