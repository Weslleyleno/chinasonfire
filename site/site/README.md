# 🔥 CHINAS ON FIRE - Dashboard de Contas

Sistema completo de gerenciamento financeiro com controle diário, ranking de usuários, gestão de plataformas, proxies, chaves PIX e muito mais.

## ✨ Características

- ✅ **Dashboard Completo** - Visão geral de lucros, investimentos e ROI
- ✅ **Controle Diário** - Registro de contas com cálculo automático de lucro
- ✅ **Ranking de Usuários** - Sistema de classificação com confetes e trompetes para o top 1
- ✅ **Gestão de Plataformas** - Plataformas compartilhadas globalmente
- ✅ **Proxy Management** - Gerenciamento de proxies com adição em massa
- ✅ **Chaves PIX** - Cadastro e gestão de chaves de pagamento
- ✅ **Gastos** - Registro de despesas adicionais
- ✅ **Sistema de Usuários** - Login, permissões e administração
- ✅ **Perfil** - Avatar personalizado, meta mensal e configurações
- ✅ **Design Moderno** - Tema escuro com gradientes roxos
- ✅ **Totalmente Responsivo** - Funciona perfeitamente em mobile

## 🚀 Deploy e Hospedagem

**⚠️ IMPORTANTE:** Atualmente os dados são salvos apenas no `localStorage` do navegador. Para produção, você precisa fazer deploy com um servidor que salve os dados no banco de dados.

### 📚 Guias de Deploy:

1. **[DEPLOY.md](DEPLOY.md)** - Guia completo com todas as opções de deploy
2. **[SETUP_FIREBASE.md](SETUP_FIREBASE.md)** - Setup passo a passo do Firebase
3. **[SETUP_SUPABASE.md](SETUP_SUPABASE.md)** - Setup passo a passo do Supabase

### ⚡ Opções Rápidas:

- **Firebase** (Mais fácil) - Veja `SETUP_FIREBASE.md`
- **Supabase** (Recomendado) - Veja `SETUP_SUPABASE.md`
- **Vercel + MongoDB** - Veja `DEPLOY.md`

## 📁 Estrutura de Arquivos

```
site/
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos CSS
├── script.js            # JavaScript e lógica
├── README.md            # Este arquivo
├── DEPLOY.md            # Guia completo de deploy
├── SETUP_FIREBASE.md    # Setup Firebase passo a passo
└── SETUP_SUPABASE.md    # Setup Supabase passo a passo
```

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Design moderno com variáveis CSS e gradientes
- **JavaScript (Vanilla)** - Lógica e interatividade
- **Chart.js** - Gráficos de evolução
- **Font Awesome** - Ícones
- **Canvas Confetti** - Animações de confetes
- **DiceBear API** - Geração de avatares

## 📊 Dados Gerenciados

- **Usuários e Senhas** (com sistema de admin)
- **Contas** (depósitos, saques, re-depósitos, baú)
- **Proxies** (com adição em massa)
- **Chaves PIX** (tipo, chave, titular, banco)
- **Gastos** (descrição, valor, data)
- **Plataformas** (nome, status, descrição - compartilhadas)
- **Perfis** (avatar, meta mensal)

## 🔒 Segurança

⚠️ **ATENÇÃO:** Antes de fazer deploy em produção:

1. **Hash de Senhas** - Implemente bcrypt ou similar
2. **HTTPS** - Use sempre HTTPS
3. **Validação** - Valide todos os inputs no backend
4. **CORS** - Configure CORS corretamente
5. **Backup** - Configure backup automático do banco

## 🎨 Personalização

Você pode personalizar as cores editando as variáveis CSS no arquivo `styles.css`:

```css
:root {
    --dark-bg: #0a0e27;
    --purple-primary: #8b5cf6;
    --purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* ... */
}
```

## 📝 Como Usar Localmente

1. Abra o arquivo `index.html` no seu navegador
2. Ou use um servidor local:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```

## 🚀 Próximos Passos

1. Escolha uma opção de deploy (veja `DEPLOY.md`)
2. Configure o banco de dados
3. Adapte o código para usar API em vez de localStorage
4. Faça o deploy e teste

## 📞 Suporte

Para dúvidas sobre deploy, consulte os guias:
- `DEPLOY.md` - Visão geral
- `SETUP_FIREBASE.md` - Firebase
- `SETUP_SUPABASE.md` - Supabase

---

**Desenvolvido com ❤️ para CHINAS ON FIRE**

