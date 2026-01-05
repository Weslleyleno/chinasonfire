# 🔍 Como Testar se Está Sincronizando

## 📋 Passo a Passo para Verificar

### 1. Abrir o Console do Navegador

**No Chrome/Edge:**
- Pressione `F12` ou `Ctrl + Shift + I`
- Clique na aba **"Console"**

**No Firefox:**
- Pressione `F12` ou `Ctrl + Shift + I`
- Clique na aba **"Console"**

**No Celular:**
- Use um app como "Eruda" ou acesse via USB Debugging

---

### 2. Verificar se o Supabase Está Conectado

No console, você deve ver:
```
✅ Supabase conectado!
```

Se não aparecer, o Supabase não está configurado corretamente.

---

### 3. Fazer Login

Após fazer login, você deve ver no console:
```
🔄 Carregando dados do usuário: seu-usuario
🔄 Carregando do Supabase...
📊 Dados carregados do Supabase: {accounts: X, proxies: X, pixKeys: X, expenses: X}
✅ Dados carregados e sincronizados com localStorage
```

---

### 4. Adicionar uma Conta

1. Vá em **"Controle Diário"**
2. Clique em **"Adicionar conta"**
3. Preencha os valores
4. Clique em **"Salvar conta"**

No console, você deve ver:
```
🔄 Iniciando sincronização de dados...
✅ Dados salvos no localStorage: {accounts: 1, ...}
🔄 Sincronizando com Supabase...
✅ Contas sincronizadas com Supabase
✅ Todos os dados sincronizados com Supabase!
```

---

### 5. Adicionar um Gasto

1. Vá em **"Gastos"** (deve aparecer no menu)
2. Preencha:
   - Descrição: "Almoço"
   - Valor: 25.00
   - Data: (hoje)
3. Clique em **"Adicionar Gasto"**

No console, você deve ver:
```
✅ 1 gasto(s) sincronizado(s) com Supabase
```

---

### 6. Verificar no Celular

1. Abra o site no celular (mesma URL)
2. Faça login com a mesma conta
3. No console (se conseguir), você deve ver os dados sendo carregados
4. Verifique se:
   - ✅ As contas aparecem
   - ✅ Os gastos aparecem
   - ✅ Tudo está sincronizado

---

## ⚠️ Problemas Comuns

### Problema 1: "Gastos" não aparece no menu

**Solução:**
- A opção "Gastos" está no HTML, mas pode estar escondida por CSS
- Verifique se há algum CSS escondendo o item
- Tente recarregar a página (Ctrl + F5)

### Problema 2: Nada sincroniza

**Verifique:**
1. Console mostra erros? (mensagens em vermelho)
2. Supabase está conectado? (mensagem verde no console)
3. Você está logado? (verifique se `currentUser` não é null)

### Problema 3: Dados não aparecem no celular

**Verifique:**
1. Você fez login com a mesma conta?
2. Console mostra dados sendo carregados?
3. Há erros no console?

---

## 🔧 Comandos Úteis no Console

Para verificar se está funcionando, digite no console:

```javascript
// Ver usuário atual
console.log('Usuário:', currentUser);

// Ver dados carregados
console.log('Contas:', accounts);
console.log('Gastos:', expenses);
console.log('Proxies:', proxies);
console.log('Chaves PIX:', pixKeys);

// Verificar Supabase
console.log('Supabase:', window.supabaseClient);

// Forçar sincronização
saveUserData();
```

---

## ✅ Checklist

- [ ] Console mostra "✅ Supabase conectado!"
- [ ] Ao fazer login, console mostra dados sendo carregados
- [ ] Ao adicionar conta, console mostra "✅ Contas sincronizadas"
- [ ] Ao adicionar gasto, console mostra "✅ gasto(s) sincronizado(s)"
- [ ] Menu "Gastos" aparece no sidebar
- [ ] Dados aparecem no celular após login

---

**Se algo não estiver funcionando, copie as mensagens do console e me envie!**
