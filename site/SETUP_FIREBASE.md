# 🔥 Setup Firebase - Passo a Passo

## 1. Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com
2. Clique em "Adicionar projeto"
3. Nome: "CHINAS ON FIRE"
4. Desative Google Analytics (ou deixe ativo)
5. Clique em "Criar projeto"

## 2. Configurar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Escolha uma localização (ex: us-central)
5. Clique em "Ativar"

## 3. Configurar Authentication

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Ative "Email/Senha" como provedor
4. Salve

## 4. Obter Credenciais

1. No menu lateral, clique em ⚙️ (Configurações do projeto)
2. Role até "Seus apps"
3. Clique no ícone `</>` (Web)
4. Registre o app (ex: "CHINAS ON FIRE Web")
5. **COPIE as credenciais** que aparecem (será algo como):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 5. Configurar Regras de Segurança

No Firestore, vá em "Regras" e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Dados globais (plataformas)
    match /platforms/{platformId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Dados do usuário
    match /userData/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 6. Adicionar Firebase ao Projeto

Adicione no `index.html` antes do `</body>`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>

<script>
  // Suas credenciais aqui
  const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
  };
  
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Tornar disponível globalmente
  window.db = firebase.firestore();
  window.auth = firebase.auth();
</script>
```

## 7. Deploy no Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init hosting

# Escolha:
# - Use existing project: Seu projeto Firebase
# - Public directory: . (ponto)
# - Single-page app: N
# - GitHub: N

# Deploy
firebase deploy --only hosting
```

## 8. Adaptar Código para Firebase

Substituir `localStorage` por chamadas ao Firestore:

```javascript
// Exemplo: Salvar conta
async function saveAccount(account) {
  await db.collection('userData')
    .doc(currentUser)
    .collection('accounts')
    .add(account);
}

// Exemplo: Carregar contas
async function loadAccounts() {
  const snapshot = await db.collection('userData')
    .doc(currentUser)
    .collection('accounts')
    .get();
  
  return snapshot.docs.map(doc => doc.data());
}
```

---

**Pronto!** Seu site estará online em: `https://seu-projeto.web.app`

