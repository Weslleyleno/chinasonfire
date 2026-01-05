# 🚀 Como Usar o Site Localmente

## ⚠️ PROBLEMA: Abrir Diretamente Não Funciona!

**❌ NÃO FAÇA ISSO:**
- Clicar 2x no `index.html` 
- Abrir pelo `file:///C:/Users/AiNote/Desktop/site/index.html`

**Por quê?**
- O Supabase bloqueia requisições quando você abre direto do arquivo
- O login não funciona
- Nada sincroniza

---

## ✅ SOLUÇÃO: Use o Servidor Local

### Opção 1: Usar o arquivo `iniciar.bat` (MAIS FÁCIL!)

1. **Vá na pasta do projeto**
2. **Clique 2x no arquivo: `iniciar.bat`**
3. **Aguarde aparecer:** "Serving HTTP on 0.0.0.0 port 8000"
4. **Abra o navegador** e acesse: **http://localhost:8000**
5. **Pronto!** Agora funciona! 🎉

### Para Parar:
- Feche a janela do terminal
- Ou pressione `Ctrl + C` no terminal

---

### Opção 2: Manual (se o .bat não funcionar)

1. **Abra o PowerShell ou CMD** na pasta do projeto
   - Clique com botão direito na pasta → "Abrir no Terminal"

2. **Digite:**
   ```powershell
   python -m http.server 8000
   ```

3. **Abra o navegador** e acesse:
   ```
   http://localhost:8000
   ```

---

## ✅ Como Saber que Está Funcionando:

1. **Console do Navegador (F12):**
   - Deve aparecer: `✅ Supabase conectado!`

2. **Tela de Login aparece normalmente**

3. **Consegue fazer login** com:
   - Usuário: `weslleyleno60`
   - Senha: `01072016Silva.`

---

## 📝 Resumo:

- ❌ **NÃO:** `file:///C:/Users/AiNote/Desktop/site/index.html`
- ✅ **SIM:** `http://localhost:8000` (após rodar `iniciar.bat`)

---

**É só isso! Use o `iniciar.bat` e acesse `http://localhost:8000` 🚀**
