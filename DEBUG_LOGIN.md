# 🔍 Como Debugar o Problema de Login

## ⚠️ Se o botão de login não faz nada:

### 1. Abra o Console do Navegador (IMPORTANTE!)

1. Pressione **F12** no navegador
2. Vá na aba **"Console"** (ou "Console" em português)
3. Veja se há **mensagens em vermelho** (erros)

### 2. Verifique se o Supabase Carregou

No console, deve aparecer:
```
✅ Supabase conectado!
```

**Se NÃO aparecer**, pode ser problema de conexão.

### 3. Teste com Usuário e Senha

Tente fazer login com:
- **Usuário:** `weslleyleno60`
- **Senha:** `01072016Silva.`

### 4. Veja se Aparece Mensagem de Erro

Quando clicar em "Entrar", deve aparecer:
- Mensagem de erro (se usuário/senha incorretos)
- Ou o dashboard (se login bem-sucedido)

---

## 🔧 Possíveis Problemas:

### Problema 1: Campos Vazios
- Certifique-se de preencher usuário E senha
- Não pode deixar em branco

### Problema 2: JavaScript Não Carregou
- Veja no console se há erros
- Recarregue a página (F5)

### Problema 3: Supabase Não Conectou
- Verifique se aparece "✅ Supabase conectado!" no console
- Se não aparecer, pode ser problema de internet

---

## 📝 O Que Fazer:

1. **Abra o Console (F12)**
2. **Tente fazer login**
3. **Copie e me envie:**
   - Todas as mensagens do console (especialmente as vermelhas)
   - O que acontece quando você clica no botão

---

**Me diga o que aparece no console! 🔍**
