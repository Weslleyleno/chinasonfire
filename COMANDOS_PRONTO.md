# 📋 Comandos Prontos para Copiar e Colar

## 🎯 Configuração Inicial (Só uma vez)

### 1. Configurar Git
```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

### 2. Ir para a pasta do site
```powershell
cd C:\Users\AiNote\Desktop\site
```

---

## 🚀 Enviar Site para o GitHub (Primeira vez)

```powershell
git init
git add .
git commit -m "Primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/chinasonfire.git
git push -u origin main
```

**⚠️ LEMBRE-SE:** Substitua `SEU-USUARIO` pelo seu username do GitHub!

---

## 🔄 Atualizar Site (Sempre que mudar algo)

```powershell
cd C:\Users\AiNote\Desktop\site
git add .
git commit -m "Atualizei o site"
git push
```

---

## 📝 Exemplos de Mensagens de Commit

Você pode usar estas mensagens ao invés de "Atualizei o site":

```powershell
git commit -m "Corrigi o problema do avatar"
git commit -m "Adicionei nova funcionalidade"
git commit -m "Melhorei o design"
git commit -m "Corrigi bugs"
```

---

## ✅ Verificar Status

Para ver o que mudou:

```powershell
git status
```

Para ver histórico:

```powershell
git log
```

---

## 🔙 Voltar Versão Anterior (Se algo der errado)

```powershell
git log
# Copie o código do commit anterior (ex: abc123)
git checkout abc123
```

---

**Dica:** Salve este arquivo para consultar depois! 📌




