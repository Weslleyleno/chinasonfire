# 🚀 Guia de Deploy - CHINAS ON FIRE

Este guia explica como fazer o deploy do site em um servidor com persistência de dados.

## 📋 Dados que Precisam ser Salvos

- **Usuários e Senhas** (com hash de segurança)
- **Contas** (depósitos, saques, re-depósitos, baú)
- **Proxies**
- **Chaves PIX**
- **Gastos**
- **Plataformas** (compartilhadas globalmente)
- **Perfis de Usuários** (avatar, meta mensal)

---

## 🎯 OPÇÃO 1: Firebase (Mais Fácil e Rápida) ⭐ RECOMENDADA

### Vantagens:
- ✅ Gratuito até certo limite
- ✅ Fácil de configurar
- ✅ Banco de dados em tempo real
- ✅ Autenticação pronta
- ✅ Hospedagem gratuita

### Passos:

1. **Criar conta no Firebase:**
   - Acesse: https://firebase.google.com
   - Crie um projeto novo
   - Ative "Firestore Database" e "Authentication"

2. **Configurar Firebase no projeto:**
   ```bash
   # Adicionar no index.html antes do </body>
   <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"></script>
   ```

3. **Hospedar no Firebase Hosting:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

---

## 🎯 OPÇÃO 2: Supabase (Gratuito e Poderoso)

### Vantagens:
- ✅ 100% gratuito para começar
- ✅ PostgreSQL (banco de dados profissional)
- ✅ API REST automática
- ✅ Autenticação incluída
- ✅ Hospedagem gratuita

### Passos:

1. **Criar conta:**
   - Acesse: https://supabase.com
   - Crie um novo projeto

2. **Configurar banco de dados:**
   - Crie as tabelas necessárias via SQL Editor
   - Configure autenticação

3. **Hospedar:**
   - Use Vercel, Netlify ou GitHub Pages para o frontend
   - Supabase já fornece o backend

---

## 🎯 OPÇÃO 3: Backend Node.js + MongoDB (Mais Controle)

### Estrutura:
```
projeto/
├── frontend/          (seus arquivos HTML/CSS/JS)
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── package.json
└── README.md
```

### Passos:

1. **Criar backend:**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   npm install express mongoose cors dotenv bcrypt jsonwebtoken
   ```

2. **Criar servidor (server.js):**
   ```javascript
   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   
   const app = express();
   app.use(cors());
   app.use(express.json());
   
   // Conectar MongoDB
   mongoose.connect('mongodb+srv://usuario:senha@cluster.mongodb.net/chinasonfire');
   
   // Rotas aqui...
   
   app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
   ```

3. **Hospedar:**
   - **Backend:** Railway, Render, ou Heroku
   - **Frontend:** Vercel, Netlify, ou GitHub Pages

---

## 🎯 OPÇÃO 4: Vercel + MongoDB Atlas (Simples)

### Passos:

1. **Criar conta MongoDB Atlas:**
   - https://www.mongodb.com/cloud/atlas
   - Crie um cluster gratuito

2. **Criar API Routes no Vercel:**
   - Crie arquivo `api/users.js` na pasta `api/`
   - Vercel automaticamente cria endpoints

3. **Deploy:**
   ```bash
   npm install -g vercel
   vercel
   ```

---

## 📝 Checklist Antes do Deploy

- [ ] **Senhas:** Implementar hash (bcrypt) - NUNCA salvar senhas em texto puro
- [ ] **HTTPS:** Usar sempre HTTPS em produção
- [ ] **CORS:** Configurar CORS corretamente
- [ ] **Validação:** Validar todos os inputs no backend
- [ ] **Backup:** Configurar backup automático do banco de dados
- [ ] **Variáveis de Ambiente:** Não commitar senhas/chaves no código

---

## 🔒 Segurança Importante

### ⚠️ CRÍTICO: Hash de Senhas

**NUNCA** salve senhas em texto puro! Sempre use hash:

```javascript
const bcrypt = require('bcrypt');

// Ao salvar usuário
const hashedPassword = await bcrypt.hash(password, 10);

// Ao verificar login
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

## 🚀 Hospedagem Recomendada

### Frontend (Gratuito):
- **Vercel** - https://vercel.com ⭐
- **Netlify** - https://netlify.com
- **GitHub Pages** - https://pages.github.com
- **Firebase Hosting** - https://firebase.google.com

### Backend (Gratuito/Pago):
- **Railway** - https://railway.app ⭐
- **Render** - https://render.com
- **Heroku** - https://heroku.com (pago agora)
- **Vercel Serverless** - https://vercel.com

### Banco de Dados (Gratuito):
- **MongoDB Atlas** - https://mongodb.com/cloud/atlas ⭐
- **Supabase** - https://supabase.com
- **Firebase Firestore** - https://firebase.google.com

---

## 📞 Próximos Passos

1. **Escolha uma opção** acima
2. **Crie as contas** necessárias
3. **Configure o banco de dados**
4. **Adapte o código** para usar API em vez de localStorage
5. **Teste localmente** antes de fazer deploy
6. **Faça o deploy** e teste em produção

---

## 💡 Recomendação Final

Para começar rápido e fácil, recomendo:
- **Frontend:** Vercel ou Netlify
- **Backend + Banco:** Supabase (tudo em um lugar)

Isso permite ter tudo funcionando em menos de 1 hora!

---

Precisa de ajuda com alguma opção específica? Posso criar os arquivos necessários!

