# 🖥️ Como Testar o Site Localmente (Na Pasta do Projeto)

## ⚠️ Problema: Abrir Diretamente Não Funciona

Quando você abre o `index.html` diretamente (clicando 2x no arquivo), o navegador abre com `file://` e isso causa problemas:

- ❌ **Supabase pode bloquear** (CORS - Cross-Origin)
- ❌ **Sincronização não funciona**
- ❌ **Alguns recursos não carregam**

## ✅ Solução: Usar um Servidor Local

Você precisa rodar um servidor local simples. É muito fácil!

---

## 🚀 Opção 1: Python (Mais Fácil - Windows já tem!)

### Passo a Passo:

1. **Abra o PowerShell ou CMD** na pasta do projeto:
   - Clique com botão direito na pasta do projeto
   - Escolha "Abrir no Terminal" ou "Abrir no PowerShell"

2. **Digite o comando:**
   ```bash
   python -m http.server 8000
   ```
   
   Se não funcionar, tente:
   ```bash
   python3 -m http.server 8000
   ```

3. **Abra o navegador** e acesse:
   ```
   http://localhost:8000
   ```

4. **Pronto!** Agora o site funciona normalmente!

### Para Parar o Servidor:
- Pressione `Ctrl + C` no terminal

---

## 🚀 Opção 2: Node.js (Se tiver instalado)

### Passo a Passo:

1. **Abra o Terminal** na pasta do projeto

2. **Digite:**
   ```bash
   npx http-server
   ```

3. **Abra o navegador** e acesse:
   ```
   http://localhost:8080
   ```

---

## 🚀 Opção 3: VS Code (Se usar VS Code)

### Passo a Passo:

1. **Instale a extensão "Live Server"** no VS Code
2. **Clique com botão direito** no arquivo `index.html`
3. **Escolha "Open with Live Server"**
4. **Pronto!** O site abre automaticamente

---

## 🚀 Opção 4: Extensão do Chrome (Mais Rápido)

### Passo a Passo:

1. **Instale a extensão "Web Server for Chrome"**:
   - Acesse: https://chrome.google.com/webstore
   - Procure por "Web Server for Chrome"
   - Instale

2. **Configure:**
   - Clique no ícone da extensão
   - Clique em "Choose folder"
   - Selecione a pasta do projeto
   - Marque "Accessible on local network" (opcional)
   - Clique em "Open Web Server"

3. **Pronto!** O site abre automaticamente

---

## ✅ Como Saber se Está Funcionando

### Teste 1: Console do Navegador
1. Pressione `F12`
2. Vá na aba "Console"
3. Deve aparecer: `✅ Supabase conectado!`

### Teste 2: Fazer Login
1. Faça login com o usuário admin
2. No console, deve aparecer: `🔄 Carregando dados do usuário...`
3. Deve aparecer: `✅ Dados carregados e sincronizados`

### Teste 3: Adicionar Dados
1. Adicione uma conta
2. No console, deve aparecer: `✅ Contas sincronizadas com Supabase`

---

## 🎯 Resumo Rápido

**❌ NÃO FAÇA:**
- Clicar 2x no `index.html` e abrir direto

**✅ FAÇA:**
- Usar um servidor local (Python é o mais fácil!)
- Acessar via `http://localhost:8000`

---

## 💡 Dica

Crie um arquivo `iniciar.bat` na pasta do projeto para facilitar:

**Conteúdo do arquivo `iniciar.bat`:**
```batch
@echo off
echo Iniciando servidor local...
python -m http.server 8000
pause
```

Depois é só clicar 2x no `iniciar.bat` e acessar `http://localhost:8000`!

---

**Agora você pode testar tudo localmente antes de fazer deploy! 🚀**
