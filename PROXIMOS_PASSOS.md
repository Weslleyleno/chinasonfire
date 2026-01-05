# 🚀 Próximos Passos - Enviar para GitHub

## ✅ O que você já fez:
- ✅ `git init` - Repositório inicializado
- ✅ `git add .` - Arquivos adicionados
- ✅ `git commit` - Commit feito com sucesso!

## 📤 Agora precisa:

### Passo 1: Criar Repositório no GitHub

1. Acesse: **https://github.com**
2. Faça login
3. Clique no **"+"** (canto superior direito)
4. Escolha **"New repository"**
5. Preencha:
   - **Name:** `chinas-on-fire` (ou qualquer nome)
   - **Description:** (opcional)
   - Marque **"Public"** ou **"Private"**
   - **NÃO marque** "Add README"
6. Clique em **"Create repository"**

### Passo 2: Conectar ao GitHub

No PowerShell, digite:

```powershell
git remote add origin https://github.com/SEU-USUARIO/chinas-on-fire.git
```

**⚠️ IMPORTANTE:** Substitua `SEU-USUARIO` pelo seu usuário do GitHub!

Exemplo:
```powershell
git remote add origin https://github.com/weslleyleno60/chinas-on-fire.git
```

### Passo 3: Enviar para GitHub

```powershell
git branch -M main
git push -u origin main
```

Se pedir login, use:
- **Usuário:** Seu usuário do GitHub
- **Senha:** Use um **Personal Access Token** (não a senha normal)

### Como criar Personal Access Token:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Clique em "Generate new token"
3. Dê um nome (ex: "chinas-on-fire")
4. Marque "repo" (todos os checkboxes)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (só aparece uma vez!)
7. Use esse token como senha no git push

---

## 🔄 Para Atualizar Depois (Sempre que mudar algo):

```powershell
git add .
git commit -m "Atualização"
git push
```

Ou simplesmente use:
```powershell
.\atualizar.bat
```

---

## 🎯 Resumo dos Comandos:

```powershell
# Conectar ao GitHub (só uma vez)
git remote add origin https://github.com/SEU-USUARIO/chinas-on-fire.git

# Enviar (só uma vez)
git branch -M main
git push -u origin main

# Atualizar depois (sempre que mudar)
git add .
git commit -m "Atualização"
git push
```

---

**Próximo passo: Criar o repositório no GitHub e executar os comandos acima! 🚀**
