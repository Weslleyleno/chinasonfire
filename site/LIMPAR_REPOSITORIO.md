# 🔄 COMO LIMPAR E RECRIAR O REPOSITORIO GIT

## ⚠️ ATENÇÃO: Isso vai limpar TODO o histórico Git!

---

## 📋 PASSO A PASSO:

### 1️⃣ **Fazer Backup (Opcional mas Recomendado)**
Copie a pasta `site` para outro lugar antes de continuar (só por segurança).

---

### 2️⃣ **Executar o Script**
Execute o arquivo `limpar_e_recriar_git.bat` que foi criado.

---

### 3️⃣ **OU Fazer Manualmente:**

```powershell
# 1. Remover pasta .git
Remove-Item -Path .git -Recurse -Force

# 2. Inicializar novo repositorio
git init

# 3. Adicionar apenas arquivos essenciais
git add .gitignore
git add index.html
git add script.js
git add styles.css
git add vercel.json
git add CRIAR_TABELAS_SUPABASE.sql

# 4. Fazer primeiro commit
git commit -m "Repositorio limpo - apenas arquivos essenciais"

# 5. Adicionar remote
git remote add origin https://github.com/Weslleyleno/chinasonfire1.git

# 6. FORCAR PUSH (cuidado!)
git push -f origin main
```

---

## ⚠️ IMPORTANTE:

- **`git push -f`** vai **SOBRESCREVER** todo o histórico do GitHub
- Isso é **IRREVERSÍVEL**
- Use apenas se tiver certeza!

---

## ✅ Alternativa Mais Segura:

Se não quiser limpar o histórico, apenas garanta que os arquivos estão corretos:

```powershell
git add .
git commit -m "Limpar arquivos desnecessarios"
git push
```

O Vercel deve atualizar automaticamente em 1-2 minutos.
