# 🚀 Atualizar Site Via CMD

## 📋 Arquivos Essenciais (NÃO APAGAR)

- ✅ `index.html` - Página principal
- ✅ `script.js` - Lógica do sistema
- ✅ `styles.css` - Estilos
- ✅ `iniciar.bat` - Servidor local (opcional)
- ✅ `README.md` - Documentação básica (opcional)

---

## 🧹 Passo 1: Limpar Pasta (Opcional)

Se quiser remover arquivos de documentação desnecessários:

```cmd
limpar_pasta.bat
```

Ou execute manualmente:
```cmd
del /Q *.md
del /Q CRIAR_TABELAS_SUPABASE.sql
```

**⚠️ CUIDADO:** Isso vai apagar TODOS os arquivos .md exceto README.md

---

## 📤 Passo 2: Atualizar Via CMD

### Opção A: GitHub + Vercel (Recomendado)

#### 1. Inicializar Git (se ainda não fez):

```cmd
cd C:\Users\weslley\Desktop\site
git init
git add .
git commit -m "Atualização do site"
```

#### 2. Conectar ao GitHub:

```cmd
git remote add origin https://github.com/SEU-USUARIO/chinas-on-fire.git
git branch -M main
git push -u origin main
```

**Substitua `SEU-USUARIO` pelo seu usuário do GitHub!**

#### 3. Atualizar (sempre que mudar algo):

```cmd
git add .
git commit -m "Atualização"
git push
```

O Vercel atualiza automaticamente em ~1 minuto!

---

### Opção B: Netlify CLI

#### 1. Instalar Netlify CLI:

```cmd
npm install -g netlify-cli
```

#### 2. Fazer login:

```cmd
netlify login
```

#### 3. Fazer deploy:

```cmd
netlify deploy --prod
```

---

### Opção C: Vercel CLI

#### 1. Instalar Vercel CLI:

```cmd
npm install -g vercel
```

#### 2. Fazer login:

```cmd
vercel login
```

#### 3. Fazer deploy:

```cmd
vercel --prod
```

---

## 🔄 Script Automático de Atualização

Crie um arquivo `atualizar.bat`:

```batch
@echo off
echo ========================================
echo   ATUALIZANDO SITE
echo ========================================
echo.

cd /d "C:\Users\weslley\Desktop\site"

echo Adicionando arquivos...
git add .

echo Fazendo commit...
git commit -m "Atualização automática - %date% %time%"

echo Enviando para GitHub...
git push

echo.
echo ✅ Atualização concluida!
echo.
pause
```

Depois é só clicar 2x no `atualizar.bat`!

---

## 📝 Comandos Úteis

### Ver status do Git:
```cmd
git status
```

### Ver histórico:
```cmd
git log --oneline
```

### Desfazer última mudança:
```cmd
git reset --hard HEAD~1
```

### Ver diferenças:
```cmd
git diff
```

---

## ⚠️ IMPORTANTE

1. **Sempre faça backup** antes de limpar arquivos
2. **Teste localmente** antes de fazer deploy
3. **Verifique o console** (F12) para erros
4. **Mantenha as credenciais do Supabase** no `index.html`

---

## 🎯 Resumo Rápido

```cmd
# Limpar (opcional)
limpar_pasta.bat

# Atualizar
git add .
git commit -m "Atualização"
git push
```

---

**Pronto! Agora você pode atualizar facilmente via CMD! 🚀**
