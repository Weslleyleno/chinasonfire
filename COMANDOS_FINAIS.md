# 🚀 Comandos Finais - Enviar Arquivos para o GitHub

## ✅ Seu repositório:
- **Username:** Weslleyleno
- **Repositório:** chinasonfire
- **URL:** https://github.com/Weslleyleno/chinasonfire.git

---

## 📋 COMANDOS PARA COLAR NO POWERSHELL:

### 1. Ir para a pasta do site:
```powershell
cd C:\Users\AiNote\Desktop\site
```

### 2. Verificar se já inicializou o Git:
```powershell
git status
```

Se aparecer "not a git repository", execute:
```powershell
git init
```

### 3. Adicionar TODOS os arquivos:
```powershell
git add .
```

### 4. Fazer commit:
```powershell
git commit -m "Primeiro commit - Site CHINAS ON FIRE"
```

### 5. Renomear branch:
```powershell
git branch -M main
```

### 6. Conectar ao repositório do GitHub:
```powershell
git remote add origin https://github.com/Weslleyleno/chinasonfire.git
```

### 7. Enviar arquivos para o GitHub:
```powershell
git push -u origin main
```

---

## ⚠️ IMPORTANTE:

Quando executar o comando `git push`, vai pedir:
- **Username:** `Weslleyleno`
- **Password:** Use um **Personal Access Token** (não sua senha normal!)

### Como criar o Token:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** > **"Generate new token (classic)"**
3. Dê um nome: `Meu Site`
4. Marque: **`repo`** (todas as opções de repo)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá uma vez!)
7. Use esse token como senha quando pedir

---

## ✅ Depois que funcionar:

Você verá uma mensagem tipo:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
...
To https://github.com/Weslleyleno/chinasonfire.git
 * [new branch]      main -> main
```

**Pronto! Seus arquivos estão no GitHub!** 🎉

---

## 🔄 Se der erro "remote origin already exists":

Execute este comando antes do passo 6:
```powershell
git remote remove origin
```

Depois execute o passo 6 novamente.

