# 🚀 Passo a Passo: Atualizar Site via CMD

## ✅ Pré-requisitos:
- Git instalado (verificar com: `git --version`)
- Conta no GitHub
- Repositório já criado no GitHub
- Projeto já conectado ao Vercel

---

## 📝 PASSO A PASSO COMPLETO:

### 1. Abrir o PowerShell ou CMD na pasta do projeto

**Opção A - Pelo Explorer:**
1. Abra a pasta: `C:\Users\AiNote\Desktop\site`
2. Clique com botão direito na pasta
3. Escolha: **"Abrir no Terminal"** ou **"Abrir no PowerShell"**

**Opção B - Pelo CMD:**
1. Pressione `Win + R`
2. Digite: `cmd` e pressione Enter
3. Digite: `cd C:\Users\AiNote\Desktop\site`
4. Pressione Enter

---

### 2. Verificar Status do Git

```powershell
git status
```

**O que deve aparecer:**
- Lista de arquivos modificados (em vermelho)
- Ou mensagem: "nothing to commit, working tree clean"

---

### 3. Adicionar TODOS os arquivos modificados

```powershell
git add .
```

**O que faz:**
- Prepara todos os arquivos para commit
- Não mostra mensagem (normal)

---

### 4. Fazer Commit (salvar as alterações)

```powershell
git commit -m "Correção: ajustes de sincronização e login"
```

**Ou use uma mensagem mais descritiva:**
```powershell
git commit -m "Correção: erro async/await, sincronização Supabase e sistema de versão"
```

**O que deve aparecer:**
- Lista de arquivos alterados
- Mensagem de sucesso

---

### 5. Enviar para o GitHub

```powershell
git push
```

**Se pedir credenciais:**
- **Username:** Seu usuário do GitHub
- **Password:** Use um **Personal Access Token** (não a senha normal)
  - Como criar token: https://github.com/settings/tokens
  - Ou use: GitHub Desktop / credenciais salvas

**O que deve aparecer:**
- Progresso do upload
- Mensagem de sucesso

---

### 6. Verificar no Vercel (Atualização Automática)

1. **Acesse:** https://vercel.com
2. **Faça login**
3. **Vá no projeto:** `chinasonfire1`
4. **Vá em "Deployments"**
5. **Aguarde 1-2 minutos**
6. **Deve aparecer um novo deployment:**
   - Status: **"Building"** → **"Ready"** (verde)
   - Mensagem do commit que você fez

---

### 7. Testar o Site Atualizado

1. **Acesse a URL do Vercel:**
   ```
   https://chinasonfire1-git-main-weslleyleno.vercel.app
   ```

2. **Teste:**
   - Fazer login
   - Verificar se as correções estão funcionando
   - Ver a versão no sidebar/header (v1.0.0.0)

---

## 🔄 Comandos Rápidos (Copiar e Colar):

```powershell
cd C:\Users\AiNote\Desktop\site
git status
git add .
git commit -m "Atualização: correções de login e sincronização"
git push
```

---

## ⚠️ Se Der Erro:

### Erro: "fatal: not a git repository"
**Solução:**
```powershell
git init
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
```

### Erro: "fatal: remote origin already exists"
**Solução:** Ignore, está correto

### Erro: "Authentication failed"
**Solução:**
1. Use Personal Access Token ao invés de senha
2. Ou configure credenciais: `git config --global user.name "SeuNome"`
3. Ou use GitHub Desktop

### Erro: "Updates were rejected"
**Solução:**
```powershell
git pull
git push
```

---

## ✅ Checklist Final:

- [ ] Git status mostra arquivos modificados
- [ ] `git add .` executado sem erro
- [ ] `git commit` executado com sucesso
- [ ] `git push` enviado para GitHub
- [ ] Vercel mostra novo deployment
- [ ] Site atualizado funciona corretamente

---

## 📝 Dica:

Crie um arquivo `atualizar.bat` na pasta do projeto para facilitar:

```batch
@echo off
echo Atualizando site...
git add .
git commit -m "Atualização automática"
git push
echo Pronto! Aguarde o Vercel atualizar (1-2 minutos)
pause
```

Depois é só clicar 2x no arquivo!

---

**Pronto! Siga esses passos e seu site será atualizado! 🚀**
