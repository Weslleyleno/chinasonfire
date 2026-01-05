# 📦 Script de Migração de Dados - localStorage → Supabase

## 🔄 Como Migrar Dados Existentes

### Passo 1: Exportar Dados do localStorage

Abra o console do navegador (F12) e execute:

```javascript
// ============================================
// EXPORTAR TODOS OS DADOS DO LOCALSTORAGE
// ============================================

function exportAllData() {
    const exportData = {
        users: [],
        accounts: {},
        proxies: {},
        pixKeys: {},
        expenses: {},
        operationalExpenses: {},
        platforms: [],
        profiles: {}
    };
    
    // Exportar usuários do sistema
    const systemUsers = localStorage.getItem('systemUsers');
    if (systemUsers) {
        try {
            exportData.users = JSON.parse(systemUsers);
        } catch(e) {
            console.error('Erro ao exportar usuários:', e);
        }
    }
    
    // Exportar plataformas (globais)
    const platforms = localStorage.getItem('platforms');
    if (platforms) {
        try {
            exportData.platforms = JSON.parse(platforms);
        } catch(e) {
            console.error('Erro ao exportar plataformas:', e);
        }
    }
    
    // Exportar dados de cada usuário
    Object.keys(localStorage).forEach(key => {
        // Contas
        if (key.includes('_accounts')) {
            const username = key.split('_')[2];
            if (!exportData.accounts[username]) {
                exportData.accounts[username] = [];
            }
            try {
                exportData.accounts[username] = JSON.parse(localStorage.getItem(key) || '[]');
            } catch(e) {}
        }
        
        // Proxies
        if (key.includes('_proxies')) {
            const username = key.split('_')[2];
            if (!exportData.proxies[username]) {
                exportData.proxies[username] = [];
            }
            try {
                exportData.proxies[username] = JSON.parse(localStorage.getItem(key) || '[]');
            } catch(e) {}
        }
        
        // Chaves PIX
        if (key.includes('_pixKeys')) {
            const username = key.split('_')[2];
            if (!exportData.pixKeys[username]) {
                exportData.pixKeys[username] = [];
            }
            try {
                exportData.pixKeys[username] = JSON.parse(localStorage.getItem(key) || '[]');
            } catch(e) {}
        }
        
        // Gastos
        if (key.includes('_expenses')) {
            const username = key.split('_')[2];
            if (!exportData.expenses[username]) {
                exportData.expenses[username] = [];
            }
            try {
                exportData.expenses[username] = JSON.parse(localStorage.getItem(key) || '[]');
            } catch(e) {}
        }
        
        // Despesas Operacionais
        if (key.includes('_operationalExpenses')) {
            const username = key.split('_')[2];
            try {
                exportData.operationalExpenses[username] = JSON.parse(localStorage.getItem(key) || '{}');
            } catch(e) {}
        }
        
        // Perfis
        if (key.includes('_profile')) {
            const username = key.split('_')[2];
            try {
                exportData.profiles[username] = JSON.parse(localStorage.getItem(key) || '{}');
            } catch(e) {}
        }
    });
    
    // Exportar perfil global (admin)
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
        try {
            exportData.profiles['weslleyleno60'] = JSON.parse(userProfile);
        } catch(e) {}
    }
    
    // Gerar arquivo JSON para download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chinasonfire_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.log('✅ Dados exportados com sucesso!');
    console.log('📊 Resumo:', {
        usuarios: exportData.users.length,
        plataformas: exportData.platforms.length,
        usuariosComDados: Object.keys(exportData.accounts).length
    });
    
    return exportData;
}

// Executar exportação
const dadosExportados = exportAllData();
```

### Passo 2: Importar Dados no Supabase

Após fazer deploy e conectar ao Supabase, execute este script no console do navegador:

```javascript
// ============================================
// IMPORTAR DADOS PARA O SUPABASE
// ============================================

async function importToSupabase(dadosExportados) {
    if (!window.supabaseClient) {
        console.error('❌ Supabase não está configurado!');
        return;
    }
    
    console.log('🔄 Iniciando importação...');
    
    // 1. Importar usuários
    for (const user of dadosExportados.users) {
        try {
            // Hash da senha (em produção, use bcrypt no backend)
            const { data, error } = await window.supabaseClient
                .from('users')
                .upsert({
                    username: user.username,
                    password_hash: user.password, // TEMPORÁRIO - implementar hash depois
                    is_admin: user.isAdmin || false,
                    avatar: user.permissions?.avatar || 0
                }, { onConflict: 'username' });
            
            if (error) console.error('Erro ao importar usuário:', user.username, error);
            else console.log('✅ Usuário importado:', user.username);
        } catch(e) {
            console.error('Erro:', e);
        }
    }
    
    // 2. Importar plataformas
    for (const platform of dadosExportados.platforms) {
        try {
            const { error } = await window.supabaseClient
                .from('platforms')
                .upsert({
                    name: platform.name,
                    status: platform.status,
                    description: platform.description
                });
            
            if (error) console.error('Erro ao importar plataforma:', error);
            else console.log('✅ Plataforma importada:', platform.name);
        } catch(e) {
            console.error('Erro:', e);
        }
    }
    
    // 3. Para cada usuário, importar seus dados
    for (const username of Object.keys(dadosExportados.accounts)) {
        // Buscar ID do usuário no Supabase
        const { data: userData } = await window.supabaseClient
            .from('users')
            .select('id')
            .eq('username', username)
            .single();
        
        if (!userData) {
            console.warn('⚠️ Usuário não encontrado:', username);
            continue;
        }
        
        const userId = userData.id;
        
        // Importar contas
        if (dadosExportados.accounts[username]) {
            for (const account of dadosExportados.accounts[username]) {
                await window.supabaseClient
                    .from('accounts')
                    .insert({
                        user_id: userId,
                        deposito: account.deposito || 0,
                        redeposito: account.redeposito || 0,
                        saque: account.saque || 0,
                        bau: account.bau || 0,
                        date: account.date
                    });
            }
        }
        
        // Importar proxies
        if (dadosExportados.proxies[username]) {
            for (const proxy of dadosExportados.proxies[username]) {
                await window.supabaseClient
                    .from('proxies')
                    .insert({
                        user_id: userId,
                        name: proxy.name,
                        address: proxy.address
                    });
            }
        }
        
        // Importar chaves PIX
        if (dadosExportados.pixKeys[username]) {
            for (const pixKey of dadosExportados.pixKeys[username]) {
                await window.supabaseClient
                    .from('pix_keys')
                    .insert({
                        user_id: userId,
                        type: pixKey.type,
                        key: pixKey.key,
                        owner_name: pixKey.ownerName,
                        bank_name: pixKey.bankName
                    });
            }
        }
        
        // Importar gastos
        if (dadosExportados.expenses[username]) {
            for (const expense of dadosExportados.expenses[username]) {
                await window.supabaseClient
                    .from('expenses')
                    .insert({
                        user_id: userId,
                        description: expense.description,
                        value: expense.value,
                        date: expense.date
                    });
            }
        }
        
        // Importar despesas operacionais
        if (dadosExportados.operationalExpenses[username]) {
            await window.supabaseClient
                .from('operational_expenses')
                .upsert({
                    user_id: userId,
                    proxy_expense: dadosExportados.operationalExpenses[username].proxy || 0,
                    numbers_expense: dadosExportados.operationalExpenses[username].numbers || 0
                }, { onConflict: 'user_id' });
        }
        
        console.log('✅ Dados do usuário importados:', username);
    }
    
    console.log('✅ Importação concluída!');
}

// Para usar:
// 1. Primeiro exporte os dados (script acima)
// 2. Depois execute: importToSupabase(dadosExportados)
```

---

## 📋 Resumo

1. **Exportar:** Execute o primeiro script para baixar um arquivo JSON com todos os dados
2. **Fazer Deploy:** Configure Supabase e faça deploy no Vercel
3. **Importar:** Execute o segundo script para importar os dados para o Supabase

---

**Importante:** Antes de importar, certifique-se de que:
- ✅ Supabase está configurado
- ✅ Tabelas foram criadas
- ✅ Você está logado no Supabase




