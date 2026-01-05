// ============================================
// VARIABLES
// ============================================
const APP_VERSION = '1.0.0.2'; // Versão do aplicativo
let menuToggle, sidebar;
let navItems = [];
let contentSections = [];
let accounts = [];
let balanceChart = null;
let dailyChart = null;
let proxies = [];
let pixKeys = [];
let expenses = [];
let platforms = [];
let users = [];
let isAdmin = false;
let currentUser = null;

// ============================================
// GREETING
// ============================================
function updateGreeting() {
    const greetingElement = document.getElementById('greetingMessage');
    if (!greetingElement) return;
    
    const now = new Date();
    const hour = now.getHours();
    let greeting = '';
    
    if (hour >= 5 && hour < 12) {
        greeting = 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
        greeting = 'Boa tarde';
    } else {
        greeting = 'Boa noite';
    }
    
    // Get username from current user (sempre usar currentUser primeiro)
    let username = currentUser || 'weslleyleno60';
    
    // Se não tiver currentUser, tentar pegar do perfil (fallback)
    if (!currentUser) {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                if (profile.username) username = profile.username;
            } catch (e) {
                console.error('Erro ao carregar nome do usuário:', e);
            }
        }
    }
    
    greetingElement.textContent = `${greeting}, ${username}! 👋`;
}

// ============================================
// NAVIGATION
// ============================================
function showSection(sectionId) {
    // Fechar sidebar no mobile ao trocar de seção (evitar tela preta)
    if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
    }
    
    contentSections.forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        if (sectionId === 'dashboard') {
            updateGreeting();
            // Get current selected period or default to 'month'
            const activeTab = document.querySelector('.evolution-tabs .tab-btn.active');
            const period = activeTab ? activeTab.getAttribute('data-period') || 'month' : 'month';
            initBalanceChart(period);
            // Update dashboard with current data
            const todayAccounts = accounts;
            let totalDepositos = 0, totalRedepositos = 0, totalSaques = 0, totalBau = 0;
            todayAccounts.forEach(account => {
                totalDepositos += parseFloat(account.deposito) || 0;
                totalRedepositos += parseFloat(account.redeposito) || 0;
                totalSaques += parseFloat(account.saque) || 0;
                totalBau += parseFloat(account.bau) || 0;
            });
            let despesasOperacionais = 0;
            document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
                despesasOperacionais += parseFloat(input.value) || 0;
            });
            const lucroDiario = (totalSaques + totalBau) - (totalDepositos + totalRedepositos) - despesasOperacionais;
            const totalInvestido = totalDepositos + totalRedepositos + despesasOperacionais;
            updateDashboardCards(lucroDiario, totalInvestido, todayAccounts.length);
            updateBestDay();
            updateRanking().catch(err => console.error('Erro ao atualizar ranking:', err));
        }
        if (sectionId === 'controle-diario') {
            updateAccountsList();
            // Pequeno delay para garantir que o DOM esteja pronto
            setTimeout(() => {
                initDailyChart();
            }, 100);
        }
        if (sectionId === 'ranking') {
            populateYearFilter();
            
            // Set current year and month as default
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // 0-11
            
            const filterYear = document.getElementById('filterYear');
            const filterMonth = document.getElementById('filterMonth');
            
            if (filterYear) {
                // Set current year as default (always available since we populate 2024-2099)
                filterYear.value = currentYear.toString();
            }
            
            if (filterMonth) {
                filterMonth.value = currentMonth.toString();
            }
            
            // Populate days after setting defaults (small delay to ensure values are set)
            setTimeout(() => {
                populateDayFilter();
                // Pequeno delay adicional para garantir que a biblioteca de confetes esteja carregada
                setTimeout(() => {
                    updateRanking(true); // Passar true para indicar que a seção foi aberta
                }, 100);
            }, 50);
        }
        if (sectionId === 'contas') {
            // Contas section - em desenvolvimento
        }
        if (sectionId === 'perfil') {
            // Profile section loaded - recarregar perfil do usuário logado
            initProfile();
        }
        if (sectionId === 'proxy') {
            updateProxyList();
        }
        if (sectionId === 'chaves-pix') {
            updatePixKeysList();
        }
        if (sectionId === 'gastos') {
            updateExpensesList();
        }
        if (sectionId === 'plataformas') {
            updatePlatformsList();
        }
        if (sectionId === 'admin') {
            if (!isAdmin) {
                alert('Acesso negado. Apenas administradores podem acessar esta seção.');
                showSection('dashboard');
                return;
            }
            updateUsersList();
        }
    }
}

// ============================================
// CHARTS
// ============================================
function calculateChartData(period = 'month') {
    // Get operational expenses
    let despesasOperacionais = 0;
    document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
        despesasOperacionais += parseFloat(input.value) || 0;
    });
    
    const now = new Date();
    let filteredAccounts = [];
    
    // Filter accounts by period
    if (period === 'day') {
        // Only today's accounts
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredAccounts = accounts.filter(acc => {
            const accDate = new Date(acc.date);
            return accDate.toDateString() === today.toDateString();
        });
    } else if (period === 'month') {
        // Current month's accounts
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        filteredAccounts = accounts.filter(acc => {
            const accDate = new Date(acc.date);
            return accDate.getMonth() === currentMonth && accDate.getFullYear() === currentYear;
        });
    } else {
        // All accounts (total)
        filteredAccounts = accounts;
    }
    
    if (filteredAccounts.length === 0) {
        return { labels: [], data: [] };
    }
    
    // Group accounts by date
    const accountsByDate = {};
    filteredAccounts.forEach(account => {
        const accDate = new Date(account.date);
        const dateKey = accDate.toDateString();
        
        if (!accountsByDate[dateKey]) {
            accountsByDate[dateKey] = [];
        }
        accountsByDate[dateKey].push(account);
    });
    
    // Sort dates chronologically
    const sortedDates = Object.keys(accountsByDate).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    // Calculate daily profit and cumulative balance
    const labels = [];
    const dailyProfits = [];
    let cumulativeBalance = 0;
    
    sortedDates.forEach(dateKey => {
        const dateAccounts = accountsByDate[dateKey];
        let dayProfit = 0;
        
        dateAccounts.forEach(account => {
            const deposito = parseFloat(account.deposito) || 0;
            const redeposito = parseFloat(account.redeposito) || 0;
            const saque = parseFloat(account.saque) || 0;
            const bau = parseFloat(account.bau) || 0;
            const lucro = (saque + bau) - (deposito + redeposito);
            dayProfit += lucro;
        });
        
        // Subtract operational expenses only once per day
        dayProfit -= despesasOperacionais;
        
        cumulativeBalance += dayProfit;
        
        const date = new Date(dateKey);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        labels.push(`${day}/${month}`);
        dailyProfits.push(dayProfit);
    });
    
    // Calculate cumulative balance
    const data = [];
    let runningTotal = 0;
    dailyProfits.forEach(profit => {
        runningTotal += profit;
        data.push(runningTotal);
    });
    
    return { labels, data };
}

function initBalanceChart(period = 'month') {
    // Get canvas container
    const container = document.querySelector('.chart-container');
    if (!container) return;
    
    if (balanceChart) {
        try {
            balanceChart.destroy();
        } catch(e) {
            console.error('Erro ao destruir gráfico:', e);
        }
        balanceChart = null;
    }
    
    const chartData = calculateChartData(period);
    
    if (chartData.labels.length === 0) {
        // Show empty state
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                <p>Nenhum dado disponível para o período selecionado</p>
                <span style="font-size: 0.9rem; margin-top: 0.5rem;">Adicione contas para visualizar o gráfico.</span>
            </div>
        `;
        return;
    }
    
    // Restore canvas if it was replaced by empty state
    if (!container.querySelector('canvas')) {
        container.innerHTML = '<canvas id="balanceChart"></canvas>';
    }
    
    // Get the canvas element (might be new or existing)
    const canvas = container.querySelector('#balanceChart');
    if (!canvas) return;
    
    balanceChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: period === 'day' ? 'Saldo do Dia' : period === 'month' ? 'Saldo do Mês' : 'Saldo Total',
                data: chartData.data,
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#4facfe',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)', borderDash: [5, 5] },
                    ticks: {
                        color: '#a0aec0',
                        callback: function(value) {
                            return value >= 1000 ? 'R$ ' + (value / 1000).toFixed(1) + 'k' : 'R$ ' + value;
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0aec0' }
                }
            }
        }
    });
}

function initDailyChart() {
    if (typeof Chart === 'undefined') return;
    
    const container = document.getElementById('dailyEvolutionChart');
    if (!container) return;
    
    if (dailyChart) {
        try { dailyChart.destroy(); } catch(e) {}
        dailyChart = null;
    }
    
    const today = new Date();
    const todayAccounts = accounts.filter(acc => {
        const accDate = new Date(acc.date);
        return accDate.toDateString() === today.toDateString();
    });
    
    // Cria novo canvas
    container.innerHTML = '<canvas id="dailyChart"></canvas>';
    const ctx = document.getElementById('dailyChart');
    if (!ctx) {
        console.error('Não foi possível criar o canvas do gráfico');
        return;
    }
    
    if (todayAccounts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <p>Nenhuma conta cadastrada hoje</p>
                <span>Adicione novas contas para visualizar a evolução do lucro ao longo do dia.</span>
            </div>
        `;
        return;
    }
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourlyData = Array(24).fill(0);
    
    // Sort accounts by timestamp (mais preciso) ou por hora
    const sortedAccounts = [...todayAccounts].sort((a, b) => {
        // Usa timestamp se disponível para ordenação precisa
        if (a.timestamp && b.timestamp) {
            return a.timestamp - b.timestamp;
        }
        // Fallback: ordena por hora e minutos
        const hourA = a.hora !== undefined ? a.hora : new Date(a.date).getHours();
        const hourB = b.hora !== undefined ? b.hora : new Date(b.date).getHours();
        if (hourA !== hourB) return hourA - hourB;
        const minA = a.minutos !== undefined ? a.minutos : new Date(a.date).getMinutes();
        const minB = b.minutos !== undefined ? b.minutos : new Date(b.date).getMinutes();
        return minA - minB;
    });
    
    console.log('=== DEBUG GRÁFICO DIÁRIO ===');
    console.log('Total de contas hoje:', sortedAccounts.length);
    
    // Calculate cumulative profit for each hour
    sortedAccounts.forEach((account, index) => {
        const hour = account.hora !== undefined ? account.hora : new Date(account.date).getHours();
        const lucro = ((account.saque || 0) + (account.bau || 0)) - ((account.deposito || 0) + (account.redeposito || 0));
        
        console.log(`Conta ${index + 1}: Hora ${hour}:00, Lucro: R$ ${lucro.toFixed(2)}`);
        
        // Add this account's profit to all hours from this hour onwards
        for (let h = hour; h < 24; h++) {
            hourlyData[h] += lucro;
        }
    });
    
    console.log('Dados acumulados por hora (antes das despesas):', hourlyData.map((v, i) => `${i}:00 = R$ ${v.toFixed(2)}`));
    
    console.log('Dados por hora:', hourlyData);
    
    // Get operational expenses
    let despesasOperacionais = 0;
    document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
        despesasOperacionais += parseFloat(input.value) || 0;
    });
    
    // Subtract expenses from all hours (expenses affect the entire day)
    hourlyData.forEach((value, index) => {
        hourlyData[index] = value - despesasOperacionais;
    });
    
    const labels = hours.map(h => `${h.toString().padStart(2, '0')}:00`);
    const data = hourlyData;
    
    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lucro Acumulado',
                data: data,
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#4facfe',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(255, 255, 255, 0.1)', borderDash: [5, 5] },
                    ticks: {
                        color: '#a0aec0',
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0aec0', maxRotation: 45, minRotation: 45 }
                }
            }
        }
    });
}

// ============================================
// MODALS
// ============================================
function initModals() {
    const addAccountBtn = document.getElementById('addAccount');
    const viewAccountsBtn = document.getElementById('viewAccounts');
    const calculatorBtn = document.getElementById('calculatorBtn');
    const setGoalBtn = document.getElementById('setGoalBtn');
    const addAccountModal = document.getElementById('addAccountModal');
    const viewAccountsModal = document.getElementById('viewAccountsModal');
    const calculatorModal = document.getElementById('calculatorModal');
    const monthlyGoalModal = document.getElementById('monthlyGoalModal');
    const closeModal = document.getElementById('closeModal');
    const closeViewModal = document.getElementById('closeViewModal');
    const closeExpensesModal = document.getElementById('closeExpensesModal');
    const closeCalculatorModal = document.getElementById('closeCalculatorModal');
    const closeMonthlyGoalModal = document.getElementById('closeMonthlyGoalModal');
    const expensesModal = document.getElementById('expensesModal');
    
    if (addAccountBtn && addAccountModal) {
        addAccountBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            addAccountModal.classList.add('active');
        });
    }
    
    if (closeModal && addAccountModal) {
        closeModal.addEventListener('click', (e) => {
            e.stopPropagation();
            addAccountModal.classList.remove('active');
        });
    }
    
    if (viewAccountsBtn && viewAccountsModal) {
        viewAccountsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            updateAccountsList();
            viewAccountsModal.classList.add('active');
        });
    }
    
    if (closeViewModal && viewAccountsModal) {
        closeViewModal.addEventListener('click', (e) => {
            e.stopPropagation();
            viewAccountsModal.classList.remove('active');
        });
    }
    
    if (calculatorBtn && calculatorModal) {
        calculatorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            calculatorModal.classList.add('active');
            calcClear();
        });
    }
    
    if (closeCalculatorModal && calculatorModal) {
        closeCalculatorModal.addEventListener('click', (e) => {
            e.stopPropagation();
            calculatorModal.classList.remove('active');
        });
    }
    
    if (setGoalBtn && monthlyGoalModal) {
        setGoalBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Carregar do perfil do usuário atual
            const userProfileKey = getUserDataKey('profile');
            let savedProfile = localStorage.getItem(userProfileKey);
            // Se não encontrar, tentar o perfil global (para admin)
            if (!savedProfile && currentUser === 'weslleyleno60') {
                savedProfile = localStorage.getItem('userProfile');
            }
            
            if (savedProfile) {
                try {
                    const profile = JSON.parse(savedProfile);
                    if (profile.monthlyGoal) {
                        const input = document.getElementById('monthlyGoalInput');
                        if (input) input.value = profile.monthlyGoal;
                    }
                } catch(e) {}
            }
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            monthlyGoalModal.classList.add('active');
        });
    }
    
    if (closeMonthlyGoalModal && monthlyGoalModal) {
        closeMonthlyGoalModal.addEventListener('click', (e) => {
            e.stopPropagation();
            monthlyGoalModal.classList.remove('active');
        });
    }
    
    if (closeExpensesModal && expensesModal) {
        closeExpensesModal.addEventListener('click', () => {
            expensesModal.classList.remove('active');
        });
    }
    
    // Save monthly goal button
    const saveMonthlyGoalBtn = document.getElementById('saveMonthlyGoalBtn');
    if (saveMonthlyGoalBtn) {
        saveMonthlyGoalBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const monthlyGoal = parseFloat(document.getElementById('monthlyGoalInput')?.value) || 0;
            
            // Salvar no perfil do usuário atual
            const userProfileKey = getUserDataKey('profile');
            let savedProfile = localStorage.getItem(userProfileKey);
            // Se não encontrar, tentar o perfil global (para admin)
            if (!savedProfile && currentUser === 'weslleyleno60') {
                savedProfile = localStorage.getItem('userProfile');
            }
            
            let profile = {};
            if (savedProfile) {
                try {
                    profile = JSON.parse(savedProfile);
                } catch(e) {
                    profile = {};
                }
            }
            
            profile.monthlyGoal = monthlyGoal;
            
            // Salvar no perfil do usuário atual
            localStorage.setItem(userProfileKey, JSON.stringify(profile));
            
            // Se for admin, também salvar no perfil global
            if (currentUser === 'weslleyleno60') {
                localStorage.setItem('userProfile', JSON.stringify(profile));
            }
            
            monthlyGoalModal.classList.remove('active');
            updateRanking().catch(err => console.error('Erro ao atualizar ranking:', err));
            alert('Meta mensal salva com sucesso!');
        });
    }
}

// Close modal when clicking outside - removed to prevent blocking button clicks
// Each modal handles its own close behavior

// ============================================
// ACCOUNTS MANAGEMENT
// ============================================
function calculateAllTotals() {
    const todayAccounts = accounts;
    
    let totalDepositos = 0, totalRedepositos = 0, totalSaques = 0, totalBau = 0;
    let totalContas = todayAccounts.length;
    
    todayAccounts.forEach(account => {
        totalDepositos += parseFloat(account.deposito) || 0;
        totalRedepositos += parseFloat(account.redeposito) || 0;
        totalSaques += parseFloat(account.saque) || 0;
        totalBau += parseFloat(account.bau) || 0;
    });
    
    let despesasOperacionais = 0;
    document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
        despesasOperacionais += parseFloat(input.value) || 0;
    });
    
    const lucroDiario = (totalSaques + totalBau) - (totalDepositos + totalRedepositos) - despesasOperacionais;
    const totalInvestido = totalDepositos + totalRedepositos + despesasOperacionais;
    
    updateAccountStats(totalContas, totalDepositos, totalRedepositos, totalSaques, totalBau, lucroDiario);
    updateProfitDisplay(lucroDiario);
    updateDashboardCards(lucroDiario, totalInvestido, totalContas);
    updateBestDay();
    updateRanking();
}

function updateAccountStats(contas, depositos, redepositos, saques, bau, lucro) {
    const stats = document.querySelectorAll('.stat-mini');
    if (stats.length >= 5) {
        stats[0].querySelector('.stat-value').textContent = contas;
        stats[1].querySelector('.stat-value').textContent = formatCurrency(depositos);
        stats[2].querySelector('.stat-value').textContent = formatCurrency(redepositos);
        stats[3].querySelector('.stat-value').textContent = formatCurrency(saques);
        stats[4].querySelector('.stat-value').textContent = formatCurrency(bau);
    }
}

function updateProfitDisplay(lucro) {
    document.querySelectorAll('.profit-value').forEach(display => {
        display.textContent = formatCurrency(lucro);
    });
}

function formatCurrency(value) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateAccountsList() {
    const accountsListModal = document.querySelector('.empty-accounts');
    const todayAccounts = accounts;
    
    if (todayAccounts.length === 0) {
        if (accountsListModal) accountsListModal.innerHTML = '<p>Nenhuma conta encontrada.</p>';
        return;
    }
    
    let totalDep = 0, totalRedep = 0, totalSaq = 0, totalBau = 0, totalLucro = 0;
    let html = '<div class="accounts-list">';
    
    todayAccounts.forEach((account, index) => {
        const deposito = parseFloat(account.deposito) || 0;
        const redeposito = parseFloat(account.redeposito) || 0;
        const saque = parseFloat(account.saque) || 0;
        const bau = parseFloat(account.bau) || 0;
        const lucro = (saque + bau) - (deposito + redeposito);
        
        totalDep += deposito;
        totalRedep += redeposito;
        totalSaq += saque;
        totalBau += bau;
        totalLucro += lucro;
        
        const profitClass = lucro < 0 ? 'profit negative' : 'profit positive';
        
        html += `
            <div class="account-item-compact">
                <span class="account-number-compact">Círculo ${index + 1}</span>
                <span class="field-compact">Dep: ${formatCurrency(deposito)}</span>
                <span class="field-compact">Saq: ${formatCurrency(saque)}</span>
                <span class="field-compact">Re-dep: ${formatCurrency(redeposito)}</span>
                <span class="field-compact">Baú: ${formatCurrency(bau)}</span>
                <span class="field-compact ${profitClass}">Lucro: ${formatCurrency(lucro)}</span>
                <button class="btn-edit-compact" onclick="editAccount(${account.id})" title="Editar conta">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete-compact" onclick="deleteAccount(${account.id})" title="Excluir conta">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    
    if (accountsListModal) {
        accountsListModal.innerHTML = html;
    }
}

function editAccount(accountId) {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    // Preenche o modal com os dados da conta
    document.getElementById('depositoInput').value = account.deposito || '';
    document.getElementById('redepositoInput').value = account.redeposito || '';
    document.getElementById('saqueInput').value = account.saque || '';
    document.getElementById('bauInput').value = account.bau || '';
    
    // Marca que está editando
    const modal = document.getElementById('addAccountModal');
    modal.setAttribute('data-editing-id', accountId);
    
    // Atualiza o título do modal
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = 'Editar conta';
    }
    
    // Abre o modal
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    modal.classList.add('active');
}

async function deleteAccount(accountId) {
    accounts = accounts.filter(acc => acc.id !== accountId);
    await saveUserData(); // Salvar após deletar
    calculateAllTotals();
    updateAccountsList();
    initDailyChart();
}

// ============================================
// OPERATIONAL EXPENSES (Despesas Operacionais)
// ============================================
async function saveOperationalExpenses() {
    if (!currentUser) return;
    
    const proxyExpense = document.getElementById('proxyExpenseInput');
    const numbersExpense = document.getElementById('numbersExpenseInput');
    
    if (proxyExpense && numbersExpense) {
        const expenses = {
            proxy: parseFloat(proxyExpense.value) || 0,
            numbers: parseFloat(numbersExpense.value) || 0
        };
        
        // Salvar no localStorage primeiro (cache rápido)
        localStorage.setItem(getUserDataKey('operationalExpenses'), JSON.stringify(expenses));
        
        // Sincronizar com Supabase (em background)
        if (window.supabaseClient) {
            try {
                await saveOperationalExpensesToSupabase();
            } catch (error) {
                console.error('Erro ao sincronizar despesas operacionais com Supabase:', error);
            }
        }
    }
}

async function loadOperationalExpenses() {
    if (!currentUser) return;
    
    // Tentar carregar do Supabase primeiro
    if (window.supabaseClient) {
        try {
            await loadOperationalExpensesFromSupabase();
            // Sincronizar com localStorage como cache
            const proxyExpense = document.getElementById('proxyExpenseInput');
            const numbersExpense = document.getElementById('numbersExpenseInput');
            if (proxyExpense && numbersExpense) {
                const expenses = {
                    proxy: parseFloat(proxyExpense.value) || 0,
                    numbers: parseFloat(numbersExpense.value) || 0
                };
                localStorage.setItem(getUserDataKey('operationalExpenses'), JSON.stringify(expenses));
            }
            // Calcular total após carregar
            calculateExpenses();
            return;
        } catch (error) {
            console.error('Erro ao carregar despesas operacionais do Supabase, usando localStorage:', error);
        }
    }
    
    // Fallback para localStorage
    const saved = localStorage.getItem(getUserDataKey('operationalExpenses'));
    const proxyExpense = document.getElementById('proxyExpenseInput');
    const numbersExpense = document.getElementById('numbersExpenseInput');
    
    if (proxyExpense && numbersExpense) {
        if (saved) {
            try {
                const expenses = JSON.parse(saved);
                proxyExpense.value = expenses.proxy || 0;
                numbersExpense.value = expenses.numbers || 0;
            } catch(e) {
                // Se houver erro, manter valores padrão
                proxyExpense.value = 0;
                numbersExpense.value = 0;
            }
        } else {
            // Se não houver valores salvos, garantir que estão em 0
            proxyExpense.value = 0;
            numbersExpense.value = 0;
        }
        
        // Calcular total após carregar
        calculateExpenses();
    }
}

// ============================================
// EXPENSES
// ============================================
function calculateExpenses() {
    const expenseInputs = document.querySelectorAll('.expenses-controls input[type="number"]');
    const expenseTotal = document.querySelector('.expense-total span');
    const expenseTotalModal = document.querySelector('.expense-total-modal span');
    
    let total = 0;
    expenseInputs.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    if (expenseTotal) {
        expenseTotal.textContent = `Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    if (expenseTotalModal) {
        expenseTotalModal.textContent = `Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    calculateAllTotals();
    initDailyChart();
    
    // Update balance chart if dashboard is active
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection && dashboardSection.classList.contains('active')) {
        const activeTab = document.querySelector('.evolution-tabs .tab-btn.active');
        const period = activeTab ? activeTab.getAttribute('data-period') || 'month' : 'month';
        initBalanceChart(period);
    }
}

// ============================================
// AUTHENTICATION
// ============================================
function checkLogin() {
    // Sempre garantir que o usuário admin padrão existe
    const savedProfile = localStorage.getItem('userProfile');
    let profile = null;
    
    if (savedProfile) {
        try {
            profile = JSON.parse(savedProfile);
        } catch(e) {
            profile = null;
        }
    }
    
    // Se não existe perfil ou o perfil não é o admin padrão, criar/atualizar
    if (!profile || profile.username !== 'weslleyleno60') {
        const defaultAdmin = {
            username: 'weslleyleno60',
            password: '01072016Silva.',
            isAdmin: true,
            avatar: 0,
            avatarUrl: 'https://flagcdn.com/w160/cn.png'
        };
        localStorage.setItem('userProfile', JSON.stringify(defaultAdmin));
        profile = defaultAdmin;
    }
    
    // Verificar se a senha está correta, se não, atualizar
    if (profile.password !== '01072016Silva.') {
        profile.password = '01072016Silva.';
        profile.isAdmin = true;
        localStorage.setItem('userProfile', JSON.stringify(profile));
    }
    
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = loggedInUser;
        showDashboard();
        loadUserData().then(() => {
            // Carregar despesas operacionais após carregar dados
            loadOperationalExpenses();
        });
    } else {
        showLogin();
    }
}

function showLogin() {
    console.log('🔓 Mostrando tela de login');
    const loginScreen = document.getElementById('loginScreen');
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (loginScreen) {
        loginScreen.style.display = 'flex';
        console.log('✅ Tela de login exibida');
    } else {
        console.error('❌ ERRO: Elemento loginScreen não encontrado!');
    }
    if (dashboardContainer) {
        dashboardContainer.style.display = 'none';
    }
}

function showDashboard() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'flex';
    
    // Garantir que menu Gastos esteja sempre visível
    const gastosNavItem = document.getElementById('gastosNavItem');
    if (gastosNavItem) {
        gastosNavItem.style.display = '';
    }
}

// Verificar status do cadastro público
function checkPublicRegistrationStatus() {
    const isEnabled = localStorage.getItem('publicRegistrationEnabled') === 'true';
    const registerLinkContainer = document.getElementById('registerLinkContainer');
    
    if (registerLinkContainer) {
        registerLinkContainer.style.display = isEnabled ? 'block' : 'none';
    }
}

// Cadastro público de usuário
async function registerPublicUser() {
    const registerUsername = document.getElementById('registerUsername');
    const registerPassword = document.getElementById('registerPassword');
    const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
    const registerError = document.getElementById('registerError');
    
    if (!registerUsername || !registerPassword || !registerPasswordConfirm) return;
    
    const username = registerUsername.value.trim();
    const password = registerPassword.value;
    const passwordConfirm = registerPasswordConfirm.value;
    
    // Limpar erro anterior
    if (registerError) {
        registerError.style.display = 'none';
        registerError.textContent = '';
    }
    
    // Validações
    if (!username) {
        if (registerError) {
            registerError.textContent = 'Por favor, digite o nome de usuário.';
            registerError.style.display = 'block';
        }
        return;
    }
    
    if (!password) {
        if (registerError) {
            registerError.textContent = 'Por favor, digite uma senha.';
            registerError.style.display = 'block';
        }
        return;
    }
    
    if (password.length < 4) {
        if (registerError) {
            registerError.textContent = 'A senha deve ter pelo menos 4 caracteres.';
            registerError.style.display = 'block';
        }
        return;
    }
    
    if (password !== passwordConfirm) {
        if (registerError) {
            registerError.textContent = 'As senhas não coincidem.';
            registerError.style.display = 'block';
        }
        return;
    }
    
    // Verificar se cadastro público está ativado
    const isEnabled = localStorage.getItem('publicRegistrationEnabled') === 'true';
    if (!isEnabled) {
        if (registerError) {
            registerError.textContent = 'Cadastro público está desativado.';
            registerError.style.display = 'block';
        }
        return;
    }
    
    // Carregar lista de usuários
    const savedUsers = localStorage.getItem('systemUsers');
    let users = [];
    if (savedUsers) {
        try {
            users = JSON.parse(savedUsers);
        } catch(e) {
            users = [];
        }
    }
    
    // Verificar se o usuário já existe
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        if (registerError) {
            registerError.textContent = 'Este nome de usuário já está cadastrado.';
            registerError.style.display = 'block';
        }
        return;
    }
    
    // Verificar se não é o admin padrão
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            if (profile.username && profile.username.toLowerCase() === username.toLowerCase()) {
                if (registerError) {
                    registerError.textContent = 'Este nome de usuário já está em uso.';
                    registerError.style.display = 'block';
                }
                return;
            }
        } catch(e) {}
    }
    
    // Criar novo usuário com todas as permissões (exceto admin)
    const newUser = {
        id: Date.now().toString(),
        username: username,
        password: password, // Em produção, isso deveria ser hash
        isAdmin: false,
        permissions: {
            dashboard: true,
            controleDiario: true,
            ranking: true,
            plataformas: true,
            proxy: true,
            chavesPix: true,
            gastos: true,
            perfil: true
        },
        date: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('systemUsers', JSON.stringify(users));
    
    // Sincronizar com Supabase
    if (window.supabaseClient) {
        try {
            await createOrUpdateUserInSupabase(username, password, false);
            console.log('✅ Usuário sincronizado com Supabase');
        } catch (error) {
            console.error('Erro ao sincronizar usuário com Supabase:', error);
        }
    }
    
    // Limpar campos
    registerUsername.value = '';
    registerPassword.value = '';
    registerPasswordConfirm.value = '';
    
    // Mostrar sucesso e voltar para login
    alert('Conta criada com sucesso! Faça login para continuar.');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    if (registerError) {
        registerError.style.display = 'none';
    }
    
    // Preencher campo de login com o novo usuário
    const loginUsername = document.getElementById('loginUsername');
    if (loginUsername) {
        loginUsername.value = username;
    }
}

async function login() {
    console.log('🔐 Função login() chamada');
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');
    
    console.log('👤 Usuário digitado:', username ? 'Preenchido' : 'VAZIO');
    console.log('🔑 Senha digitada:', password ? 'Preenchida' : 'VAZIA');
    
    if (!username || !password) {
        console.warn('⚠️ Campos vazios!');
        if (loginError) {
            loginError.style.display = 'block';
            loginError.textContent = 'Por favor, preencha todos os campos!';
        }
        return;
    }
    
    console.log('✅ Campos preenchidos, iniciando autenticação...');
    
    // PRIMEIRO: Verificar no Supabase (servidor)
    if (window.supabaseClient) {
        const supabaseUser = await verifyUserInSupabase(username, password);
        if (supabaseUser) {
            // Login bem-sucedido via Supabase
            currentUser = supabaseUser.username;
            localStorage.setItem('currentUser', currentUser);
            
            // Sincronizar usuário no localStorage para cache
            await createOrUpdateUserInSupabase(username, password, supabaseUser.isAdmin);
            
            // Salvar credenciais se "Lembrar-me" estiver marcado
            const rememberMe = document.getElementById('rememberMe');
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('savedCredentials', JSON.stringify({
                    username: username,
                    password: password,
                    remember: true
                }));
            } else {
                localStorage.removeItem('savedCredentials');
            }
            
            if (loginError) loginError.style.display = 'none';
            showDashboard();
            loadUserData().then(() => {
                checkAdminStatus();
                updateSidebarAvatar();
                updateGreeting();
                initProfile();
                loadOperationalExpenses();
                startAutoRefresh();
            });
            return;
        }
    }
    
    // SEGUNDO: Verificar na lista de usuários cadastrados (localStorage - fallback)
    const savedUsers = localStorage.getItem('systemUsers');
    let allUsers = [];
    if (savedUsers) {
        try {
            allUsers = JSON.parse(savedUsers);
        } catch(e) {
            console.error('Erro ao carregar usuários:', e);
        }
    }
    
    // Verificar usuário na lista (comparação case-insensitive para username, exata para senha)
    const user = allUsers.find(u => {
        const usernameMatch = u.username.toLowerCase() === username.toLowerCase();
        const passwordMatch = u.password === password;
        return usernameMatch && passwordMatch;
    });
    
    if (user) {
        // Login bem-sucedido - usuário cadastrado pelo admin (localStorage)
        currentUser = user.username;
        localStorage.setItem('currentUser', currentUser);
        
        // Sincronizar com Supabase
        if (window.supabaseClient) {
            await createOrUpdateUserInSupabase(username, password, false);
        }
        
        // Salvar credenciais se "Lembrar-me" estiver marcado
        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe && rememberMe.checked) {
            localStorage.setItem('savedCredentials', JSON.stringify({
                username: username,
                password: password,
                remember: true
            }));
        } else {
            localStorage.removeItem('savedCredentials');
        }
        
        if (loginError) loginError.style.display = 'none';
        showDashboard();
        loadUserData().then(() => {
            checkAdminStatus();
            updateSidebarAvatar();
            updateGreeting();
            initProfile();
        });
        return;
    }
    
    // TERCEIRO: Verificar login no perfil admin (localStorage - fallback)
    let savedProfile = localStorage.getItem('userProfile');
    let profile = null;
    
    if (savedProfile) {
        try {
            profile = JSON.parse(savedProfile);
        } catch(e) {
            profile = null;
        }
    }
    
    // Se não existe ou não é o admin padrão, criar/atualizar
    if (!profile || profile.username !== 'weslleyleno60') {
        profile = {
            username: 'weslleyleno60',
            password: '01072016Silva.',
            isAdmin: true,
            avatar: profile ? profile.avatar : 0,
            avatarUrl: profile ? profile.avatarUrl : 'https://flagcdn.com/w160/cn.png'
        };
        localStorage.setItem('userProfile', JSON.stringify(profile));
    }
    
    // Verificar login no perfil admin
    if (profile && profile.username.toLowerCase() === username.toLowerCase()) {
        if (profile.password === password) {
            // Login bem-sucedido - admin
            currentUser = profile.username;
            localStorage.setItem('currentUser', currentUser);
            
            // Sincronizar com Supabase
            if (window.supabaseClient) {
                await createOrUpdateUserInSupabase(username, password, true);
            }
            
            // Salvar credenciais se "Lembrar-me" estiver marcado
            const rememberMe = document.getElementById('rememberMe');
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('savedCredentials', JSON.stringify({
                    username: username,
                    password: password,
                    remember: true
                }));
            } else {
                localStorage.removeItem('savedCredentials');
            }
            
            if (loginError) loginError.style.display = 'none';
            showDashboard();
            loadUserData().then(() => {
                checkAdminStatus();
                loadOperationalExpenses();
                startAutoRefresh();
            });
            
            setTimeout(() => {
                updateSidebarAvatar();
                updateGreeting();
                initProfile();
            }, 100);
            return;
        }
    }
    
    // Login falhou
    console.warn('❌ Login falhou - usuário ou senha incorretos');
    if (loginError) {
        loginError.style.display = 'block';
        loginError.textContent = 'Usuário ou senha incorretos!';
        console.log('✅ Mensagem de erro exibida');
    } else {
        console.error('❌ ERRO: Elemento loginError não encontrado!');
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        // Parar atualização automática
        stopAutoRefresh();
        
        // Salvar dados do usuário antes de sair
        saveUserData();
        
        // Limpar sessão
        currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Limpar campos de login
        const loginUsername = document.getElementById('loginUsername');
        const loginPassword = document.getElementById('loginPassword');
        const loginError = document.getElementById('loginError');
        if (loginUsername) loginUsername.value = '';
        if (loginPassword) loginPassword.value = '';
        if (loginError) loginError.style.display = 'none';
        
        // Mostrar tela de login
        showLogin();
    }
}

function getUserDataKey(key) {
    return `userData_${currentUser}_${key}`;
}

// ============================================
// SUPABASE SYNC FUNCTIONS
// ============================================

// Cache de user IDs para evitar múltiplas consultas
let userIdCache = {};

// Verificar usuário no Supabase (para login)
async function verifyUserInSupabase(username, password) {
    if (!window.supabaseClient) {
        return null;
    }
    
    try {
        // Buscar usuário no Supabase
        const { data: user, error } = await window.supabaseClient
            .from('users')
            .select('id, username, password_hash, is_admin')
            .eq('username', username)
            .single();
        
        if (error || !user) {
            return null;
        }
        
        // Verificar senha (comparação simples por enquanto - em produção usar hash)
        // Se password_hash estiver vazio, aceitar qualquer senha (migração)
        if (!user.password_hash || user.password_hash === '' || user.password_hash === password) {
            return {
                id: user.id,
                username: user.username,
                isAdmin: user.is_admin || false
            };
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao verificar usuário no Supabase:', error);
        return null;
    }
}

// Criar ou atualizar usuário no Supabase
async function createOrUpdateUserInSupabase(username, password, isAdmin = false) {
    if (!window.supabaseClient) {
        return null;
    }
    
    try {
        // Verificar se usuário já existe
        const { data: existingUser, error: searchError } = await window.supabaseClient
            .from('users')
            .select('id')
            .eq('username', username)
            .single();
        
        if (existingUser && !searchError) {
            // Atualizar usuário existente
            const { data: updatedUser, error: updateError } = await window.supabaseClient
                .from('users')
                .update({
                    password_hash: password, // Em produção, usar hash
                    is_admin: isAdmin,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingUser.id)
                .select('id')
                .single();
            
            if (updatedUser && !updateError) {
                userIdCache[username] = updatedUser.id;
                return updatedUser.id;
            }
        } else {
            // Criar novo usuário
            const { data: newUser, error: createError } = await window.supabaseClient
                .from('users')
                .insert({
                    username: username,
                    password_hash: password, // Em produção, usar hash
                    is_admin: isAdmin
                })
                .select('id')
                .single();
            
            if (newUser && !createError) {
                userIdCache[username] = newUser.id;
                return newUser.id;
            }
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao criar/atualizar usuário no Supabase:', error);
        return null;
    }
}

// Obter ou criar user ID no Supabase
async function getUserId(username) {
    if (!window.supabaseClient) {
        console.warn('Supabase não está configurado');
        return null;
    }
    
    // Verificar cache
    if (userIdCache[username]) {
        return userIdCache[username];
    }
    
    try {
        // Buscar usuário existente
        const { data: existingUser, error: searchError } = await window.supabaseClient
            .from('users')
            .select('id')
            .eq('username', username)
            .single();
        
        if (existingUser && !searchError) {
            userIdCache[username] = existingUser.id;
            return existingUser.id;
        }
        
        // Se não existe, criar novo usuário
        const { data: newUser, error: createError } = await window.supabaseClient
            .from('users')
            .insert({
                username: username,
                password_hash: '', // Será atualizado quando salvar perfil
                is_admin: username === 'weslleyleno60'
            })
            .select('id')
            .single();
        
        if (newUser && !createError) {
            userIdCache[username] = newUser.id;
            return newUser.id;
        }
        
        console.error('Erro ao criar/buscar usuário:', createError || searchError);
        return null;
    } catch (error) {
        console.error('Erro ao acessar Supabase:', error);
        return null;
    }
}

// Salvar contas no Supabase
async function saveAccountsToSupabase() {
    if (!currentUser || !window.supabaseClient) return;
    
    const userId = await getUserId(currentUser);
    if (!userId) return;
    
    try {
        // Deletar contas antigas do usuário
        await window.supabaseClient
            .from('accounts')
            .delete()
            .eq('user_id', userId);
        
        // Inserir novas contas
        if (accounts.length > 0) {
            const accountsToInsert = accounts.map(account => ({
                user_id: userId,
                deposito: parseFloat(account.deposito) || 0,
                redeposito: parseFloat(account.redeposito) || 0,
                saque: parseFloat(account.saque) || 0,
                bau: parseFloat(account.bau) || 0,
                date: account.date
            }));
            
            await window.supabaseClient
                .from('accounts')
                .insert(accountsToInsert);
        }
        
        console.log('✅ Contas sincronizadas com Supabase');
    } catch (error) {
        console.error('Erro ao salvar contas no Supabase:', error);
    }
}

// Carregar perfil do usuário do Supabase
async function loadUserProfileFromSupabase() {
    if (!currentUser || !window.supabaseClient) return null;
    
    const userId = await getUserId(currentUser);
    if (!userId) return null;
    
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('avatar, avatar_url, monthly_goal')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('Erro ao carregar perfil do Supabase:', error);
            return null;
        }
        
        if (data) {
            return {
                avatar: data.avatar || 0,
                avatarUrl: data.avatar_url || '',
                monthlyGoal: data.monthly_goal || 30000
            };
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao carregar perfil do Supabase:', error);
        return null;
    }
}

// Salvar perfil do usuário no Supabase
async function saveUserProfileToSupabase(profile) {
    if (!currentUser || !window.supabaseClient) return;
    
    const userId = await getUserId(currentUser);
    if (!userId) return;
    
    try {
        const { error } = await window.supabaseClient
            .from('users')
            .update({
                avatar: profile.avatar || 0,
                avatar_url: profile.avatarUrl || '',
                password_hash: profile.password || '',
                monthly_goal: profile.monthlyGoal || 30000,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        
        if (error) {
            console.error('Erro ao salvar perfil no Supabase:', error);
        } else {
            console.log('✅ Perfil sincronizado com Supabase');
        }
    } catch (error) {
        console.error('Erro ao salvar perfil no Supabase:', error);
    }
}

// Carregar contas do Supabase
async function loadAccountsFromSupabase() {
    if (!currentUser || !window.supabaseClient) return [];
    
    const userId = await getUserId(currentUser);
    if (!userId) return [];
    
    try {
        const { data, error } = await window.supabaseClient
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        
        if (error) {
            console.error('Erro ao carregar contas do Supabase:', error);
            return [];
        }
        
        if (data) {
            return data.map(account => ({
                deposito: account.deposito || 0,
                redeposito: account.redeposito || 0,
                saque: account.saque || 0,
                bau: account.bau || 0,
                date: account.date
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Erro ao carregar contas do Supabase:', error);
        return [];
    }
}

// Carregar TODAS as contas de TODOS os usuários do Supabase (para ranking global)
async function loadAllAccountsFromSupabase() {
    if (!window.supabaseClient) return {};
    
    try {
        // Buscar todas as contas
        const { data: accountsData, error: accountsError } = await window.supabaseClient
            .from('accounts')
            .select('*')
            .order('date', { ascending: false });
        
        if (accountsError) {
            console.error('Erro ao carregar todas as contas do Supabase:', accountsError);
            return {};
        }
        
        if (!accountsData || accountsData.length === 0) return {};
        
        // Buscar todos os user_ids únicos
        const userIds = [...new Set(accountsData.map(a => a.user_id))];
        
        // Buscar usernames
        const { data: usersData } = await window.supabaseClient
            .from('users')
            .select('id, username')
            .in('id', userIds);
        
        // Criar mapa user_id -> username
        const userMap = {};
        if (usersData) {
            usersData.forEach(u => {
                userMap[u.id] = u.username;
            });
        }
        
        // Agrupar contas por username
        const accountsByUser = {};
        accountsData.forEach(account => {
            const username = userMap[account.user_id];
            if (!username) return;
            
            if (!accountsByUser[username]) {
                accountsByUser[username] = [];
            }
            
            accountsByUser[username].push({
                deposito: account.deposito || 0,
                redeposito: account.redeposito || 0,
                saque: account.saque || 0,
                bau: account.bau || 0,
                date: account.date
            });
        });
        
        return accountsByUser;
    } catch (error) {
        console.error('Erro ao carregar todas as contas do Supabase:', error);
        return {};
    }
}

// Salvar proxies no Supabase
async function saveProxiesToSupabase() {
    if (!currentUser || !window.supabaseClient) return;
    
    const userId = await getUserId(currentUser);
    if (!userId) return;
    
    try {
        await window.supabaseClient
            .from('proxies')
            .delete()
            .eq('user_id', userId);
        
        if (proxies.length > 0) {
            const proxiesToInsert = proxies.map(proxy => ({
                user_id: userId,
                name: proxy.name || '',
                address: proxy.address
            }));
            
            await window.supabaseClient
                .from('proxies')
                .insert(proxiesToInsert);
        }
        
        console.log('✅ Proxies sincronizados com Supabase');
    } catch (error) {
        console.error('Erro ao salvar proxies no Supabase:', error);
    }
}

// Carregar proxies do Supabase
async function loadProxiesFromSupabase() {
    if (!currentUser || !window.supabaseClient) return [];
    
    const userId = await getUserId(currentUser);
    if (!userId) return [];
    
    try {
        const { data, error } = await window.supabaseClient
            .from('proxies')
            .select('*')
            .eq('user_id', userId);
        
        if (error) {
            console.error('Erro ao carregar proxies do Supabase:', error);
            return [];
        }
        
        if (data) {
            return data.map(proxy => ({
                name: proxy.name || '',
                address: proxy.address
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Erro ao carregar proxies do Supabase:', error);
        return [];
    }
}

// Salvar chaves PIX no Supabase
async function savePixKeysToSupabase() {
    if (!currentUser || !window.supabaseClient) return;
    
    const userId = await getUserId(currentUser);
    if (!userId) return;
    
    try {
        await window.supabaseClient
            .from('pix_keys')
            .delete()
            .eq('user_id', userId);
        
        if (pixKeys.length > 0) {
            const pixKeysToInsert = pixKeys.map(pix => ({
                user_id: userId,
                type: pix.type,
                key: pix.key,
                owner_name: pix.ownerName || '',
                bank_name: pix.bankName || ''
            }));
            
            await window.supabaseClient
                .from('pix_keys')
                .insert(pixKeysToInsert);
        }
        
        console.log('✅ Chaves PIX sincronizadas com Supabase');
    } catch (error) {
        console.error('Erro ao salvar chaves PIX no Supabase:', error);
    }
}

// Carregar chaves PIX do Supabase
async function loadPixKeysFromSupabase() {
    if (!currentUser || !window.supabaseClient) return [];
    
    const userId = await getUserId(currentUser);
    if (!userId) return [];
    
    try {
        const { data, error } = await window.supabaseClient
            .from('pix_keys')
            .select('*')
            .eq('user_id', userId);
        
        if (error) {
            console.error('Erro ao carregar chaves PIX do Supabase:', error);
            return [];
        }
        
        if (data) {
            return data.map(pix => ({
                type: pix.type,
                key: pix.key,
                ownerName: pix.owner_name || '',
                bankName: pix.bank_name || ''
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Erro ao carregar chaves PIX do Supabase:', error);
        return [];
    }
}

// Salvar gastos no Supabase
async function saveExpensesToSupabase() {
    if (!currentUser || !window.supabaseClient) {
        console.warn('⚠️ Não é possível salvar gastos: currentUser ou supabaseClient não disponível');
        return;
    }
    
    const userId = await getUserId(currentUser);
    if (!userId) {
        console.warn('⚠️ Não é possível salvar gastos: userId não encontrado');
        return;
    }
    
    try {
        // Deletar gastos antigos do usuário
        const { error: deleteError } = await window.supabaseClient
            .from('expenses')
            .delete()
            .eq('user_id', userId);
        
        if (deleteError) {
            console.error('Erro ao deletar gastos antigos:', deleteError);
        }
        
        // Inserir novos gastos
        if (expenses.length > 0) {
            const expensesToInsert = expenses.map(exp => ({
                user_id: userId,
                description: exp.description || '',
                value: parseFloat(exp.value) || 0,
                date: exp.date
            }));
            
            const { data, error: insertError } = await window.supabaseClient
                .from('expenses')
                .insert(expensesToInsert);
            
            if (insertError) {
                console.error('Erro ao inserir gastos:', insertError);
                throw insertError;
            }
            
            console.log(`✅ ${expenses.length} gasto(s) sincronizado(s) com Supabase`);
        } else {
            console.log('✅ Nenhum gasto para sincronizar (lista vazia)');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar gastos no Supabase:', error);
        throw error;
    }
}

// Carregar gastos do Supabase
async function loadExpensesFromSupabase() {
    if (!currentUser || !window.supabaseClient) {
        console.warn('⚠️ Não é possível carregar gastos: currentUser ou supabaseClient não disponível');
        return [];
    }
    
    const userId = await getUserId(currentUser);
    if (!userId) {
        console.warn('⚠️ Não é possível carregar gastos: userId não encontrado');
        return [];
    }
    
    try {
        console.log('🔄 Carregando gastos do Supabase...');
        const { data, error } = await window.supabaseClient
            .from('expenses')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        
        if (error) {
            console.error('❌ Erro ao carregar gastos do Supabase:', error);
            return [];
        }
        
        if (data && data.length > 0) {
            console.log(`✅ ${data.length} gasto(s) carregado(s) do Supabase`);
            return data.map(exp => ({
                id: exp.id || Date.now(),
                description: exp.description || '',
                value: exp.value || 0,
                date: exp.date,
                createdAt: exp.created_at || new Date().toISOString()
            }));
        }
        
        console.log('ℹ️ Nenhum gasto encontrado no Supabase');
        return [];
    } catch (error) {
        console.error('❌ Erro ao carregar gastos do Supabase:', error);
        return [];
    }
}

// Salvar despesas operacionais no Supabase
async function saveOperationalExpensesToSupabase() {
    if (!currentUser || !window.supabaseClient) return;
    
    const userId = await getUserId(currentUser);
    if (!userId) return;
    
    try {
        const proxyExpense = parseFloat(document.getElementById('proxyExpenseInput')?.value) || 0;
        const numbersExpense = parseFloat(document.getElementById('numbersExpenseInput')?.value) || 0;
        
        await window.supabaseClient
            .from('operational_expenses')
            .upsert({
                user_id: userId,
                proxy_expense: proxyExpense,
                numbers_expense: numbersExpense
            }, { onConflict: 'user_id' });
        
        console.log('✅ Despesas operacionais sincronizadas com Supabase');
    } catch (error) {
        console.error('Erro ao salvar despesas operacionais no Supabase:', error);
    }
}

// Carregar despesas operacionais do Supabase
async function loadOperationalExpensesFromSupabase() {
    if (!currentUser || !window.supabaseClient) return;
    
    const userId = await getUserId(currentUser);
    if (!userId) return;
    
    try {
        const { data, error } = await window.supabaseClient
            .from('operational_expenses')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
            console.error('Erro ao carregar despesas operacionais do Supabase:', error);
            return;
        }
        
        if (data) {
            const proxyInput = document.getElementById('proxyExpenseInput');
            const numbersInput = document.getElementById('numbersExpenseInput');
            
            if (proxyInput) proxyInput.value = data.proxy_expense || 0;
            if (numbersInput) numbersInput.value = data.numbers_expense || 0;
        }
    } catch (error) {
        console.error('Erro ao carregar despesas operacionais do Supabase:', error);
    }
}

// Salvar plataformas no Supabase (globais)
async function savePlatformsToSupabase() {
    if (!window.supabaseClient) return;
    
    try {
        // Buscar todas as plataformas existentes no Supabase
        const { data: existingPlatforms } = await window.supabaseClient
            .from('platforms')
            .select('id, name');
        
        const existingNames = existingPlatforms?.map(p => p.name) || [];
        const localNames = platforms.map(p => p.name);
        
        // Deletar plataformas que não existem mais localmente
        const platformsToDelete = existingPlatforms?.filter(p => !localNames.includes(p.name)) || [];
        if (platformsToDelete.length > 0) {
            for (const platform of platformsToDelete) {
                await window.supabaseClient
                    .from('platforms')
                    .delete()
                    .eq('id', platform.id);
            }
            console.log(`🗑️ ${platformsToDelete.length} plataforma(s) deletada(s) do Supabase`);
        }
        
        // Inserir novas plataformas
        const newPlatforms = platforms.filter(p => !existingNames.includes(p.name));
        if (newPlatforms.length > 0) {
            const userId = await getUserId(currentUser || 'weslleyleno60');
            
            const platformsToInsert = newPlatforms.map(platform => ({
                name: platform.name,
                status: platform.status,
                description: platform.description || '',
                created_by: userId,
                updated_by: userId
            }));
            
            await window.supabaseClient
                .from('platforms')
                .insert(platformsToInsert);
            console.log(`➕ ${newPlatforms.length} plataforma(s) inserida(s) no Supabase`);
        }
        
        // Atualizar plataformas existentes
        for (const platform of platforms) {
            if (existingNames.includes(platform.name)) {
                const userId = await getUserId(currentUser || 'weslleyleno60');
                await window.supabaseClient
                    .from('platforms')
                    .update({
                        status: platform.status,
                        description: platform.description || '',
                        updated_by: userId
                    })
                    .eq('name', platform.name);
            }
        }
        
        console.log('✅ Plataformas sincronizadas com Supabase');
    } catch (error) {
        console.error('Erro ao salvar plataformas no Supabase:', error);
    }
}

// Deletar plataforma do Supabase
async function deletePlatformFromSupabase(platformName) {
    if (!window.supabaseClient) return;
    
    try {
        const { error } = await window.supabaseClient
            .from('platforms')
            .delete()
            .eq('name', platformName);
        
        if (error) {
            console.error('Erro ao deletar plataforma do Supabase:', error);
        } else {
            console.log('✅ Plataforma deletada do Supabase:', platformName);
        }
    } catch (error) {
        console.error('Erro ao deletar plataforma do Supabase:', error);
    }
}

// Carregar plataformas do Supabase
async function loadPlatformsFromSupabase() {
    if (!window.supabaseClient) return [];
    
    try {
        const { data, error } = await window.supabaseClient
            .from('platforms')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Erro ao carregar plataformas do Supabase:', error);
            return [];
        }
        
        if (data && data.length > 0) {
            // Buscar todos os user_ids únicos
            const userIds = new Set();
            data.forEach(p => {
                if (p.created_by) userIds.add(p.created_by);
                if (p.updated_by) userIds.add(p.updated_by);
            });
            
            // Buscar usernames
            let userMap = {};
            if (userIds.size > 0) {
                const { data: usersData } = await window.supabaseClient
                    .from('users')
                    .select('id, username')
                    .in('id', Array.from(userIds));
                
                if (usersData) {
                    usersData.forEach(u => {
                        userMap[u.id] = u.username;
                    });
                }
            }
            
            return data.map(platform => ({
                name: platform.name,
                status: platform.status,
                description: platform.description || '',
                createdAt: platform.created_at,
                updatedAt: platform.updated_at,
                createdBy: userMap[platform.created_by] || 'Usuário',
                updatedBy: platform.updated_by ? (userMap[platform.updated_by] || 'Usuário') : null,
                date: platform.created_at
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Erro ao carregar plataformas do Supabase:', error);
        return [];
    }
}

async function loadUserData() {
    if (!currentUser) return;
    
    // Tentar carregar do Supabase primeiro
    if (window.supabaseClient) {
        try {
            const [supabaseAccounts, supabaseProxies, supabasePixKeys, supabaseExpenses] = await Promise.all([
                loadAccountsFromSupabase(),
                loadProxiesFromSupabase(),
                loadPixKeysFromSupabase(),
                loadExpensesFromSupabase()
            ]);
            
            if (supabaseAccounts.length > 0) accounts = supabaseAccounts;
            if (supabaseProxies.length > 0) proxies = supabaseProxies;
            if (supabasePixKeys.length > 0) pixKeys = supabasePixKeys;
            if (supabaseExpenses.length > 0) expenses = supabaseExpenses;
            
            // Sincronizar com localStorage como cache
            localStorage.setItem(getUserDataKey('accounts'), JSON.stringify(accounts));
            localStorage.setItem(getUserDataKey('proxies'), JSON.stringify(proxies));
            localStorage.setItem(getUserDataKey('pixKeys'), JSON.stringify(pixKeys));
            localStorage.setItem(getUserDataKey('expenses'), JSON.stringify(expenses));
        } catch (error) {
            console.error('Erro ao carregar do Supabase, usando localStorage:', error);
            // Fallback para localStorage
            loadFromLocalStorage();
        }
    } else {
        // Se Supabase não estiver disponível, usar localStorage
        loadFromLocalStorage();
    }
    
    // Carregar despesas operacionais do Supabase
    if (window.supabaseClient) {
        await loadOperationalExpensesFromSupabase();
    }
}

function loadFromLocalStorage() {
    const userAccounts = localStorage.getItem(getUserDataKey('accounts'));
    if (userAccounts) {
        try {
            accounts = JSON.parse(userAccounts);
        } catch(e) {
            accounts = [];
        }
    } else {
        accounts = [];
    }
    
    const userProxies = localStorage.getItem(getUserDataKey('proxies'));
    if (userProxies) {
        try {
            proxies = JSON.parse(userProxies);
        } catch(e) {
            proxies = [];
        }
    } else {
        proxies = [];
    }
    
    const userPixKeys = localStorage.getItem(getUserDataKey('pixKeys'));
    if (userPixKeys) {
        try {
            pixKeys = JSON.parse(userPixKeys);
        } catch(e) {
            pixKeys = [];
        }
    } else {
        pixKeys = [];
    }
    
    const userExpenses = localStorage.getItem(getUserDataKey('expenses'));
    if (userExpenses) {
        try {
            expenses = JSON.parse(userExpenses);
        } catch(e) {
            expenses = [];
        }
    } else {
        expenses = [];
    }
}

async function loadUserData() {
    if (!currentUser) {
        console.warn('⚠️ Não é possível carregar dados: usuário não logado');
        return;
    }
    
    console.log('🔄 Carregando dados do usuário:', currentUser);
    
    // Tentar carregar do Supabase primeiro
    if (window.supabaseClient) {
        try {
            console.log('🔄 Carregando do Supabase...');
            const [supabaseAccounts, supabaseProxies, supabasePixKeys, supabaseExpenses] = await Promise.all([
                loadAccountsFromSupabase(),
                loadProxiesFromSupabase(),
                loadPixKeysFromSupabase(),
                loadExpensesFromSupabase()
            ]);
            
            console.log('📊 Dados carregados do Supabase:', {
                accounts: supabaseAccounts.length,
                proxies: supabaseProxies.length,
                pixKeys: supabasePixKeys.length,
                expenses: supabaseExpenses.length
            });
            
            if (supabaseAccounts.length > 0) accounts = supabaseAccounts;
            if (supabaseProxies.length > 0) proxies = supabaseProxies;
            if (supabasePixKeys.length > 0) pixKeys = supabasePixKeys;
            if (supabaseExpenses.length > 0) expenses = supabaseExpenses;
            
            // Sincronizar com localStorage como cache
            localStorage.setItem(getUserDataKey('accounts'), JSON.stringify(accounts));
            localStorage.setItem(getUserDataKey('proxies'), JSON.stringify(proxies));
            localStorage.setItem(getUserDataKey('pixKeys'), JSON.stringify(pixKeys));
            localStorage.setItem(getUserDataKey('expenses'), JSON.stringify(expenses));
            
            console.log('✅ Dados carregados e sincronizados com localStorage');
        } catch (error) {
            console.error('❌ Erro ao carregar do Supabase, usando localStorage:', error);
            // Fallback para localStorage
            loadFromLocalStorage();
        }
    } else {
        console.warn('⚠️ Supabase não disponível, usando localStorage');
        // Se Supabase não estiver disponível, usar localStorage
        loadFromLocalStorage();
    }
    
    // Carregar despesas operacionais do Supabase
    if (window.supabaseClient) {
        await loadOperationalExpensesFromSupabase();
    }
    
    // Carregar perfil do usuário do Supabase
    if (window.supabaseClient) {
        try {
            const supabaseProfile = await loadUserProfileFromSupabase();
            if (supabaseProfile) {
                const userProfileKey = getUserDataKey('profile');
                // Carregar perfil existente do localStorage para manter dados completos
                let existingProfile = {};
                const localProfile = localStorage.getItem(userProfileKey);
                if (localProfile) {
                    try {
                        existingProfile = JSON.parse(localProfile);
                    } catch(e) {}
                }
                // Combinar dados do Supabase com dados locais
                const combinedProfile = {
                    ...existingProfile,
                    username: currentUser,
                    avatar: supabaseProfile.avatar,
                    avatarUrl: supabaseProfile.avatarUrl,
                    monthlyGoal: supabaseProfile.monthlyGoal
                };
                localStorage.setItem(userProfileKey, JSON.stringify(combinedProfile));
                console.log('✅ Perfil carregado do Supabase');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar perfil do Supabase:', error);
        }
    }
    
    // Perfil do usuário - sempre carregar o perfil do usuário logado
    const userProfileKey = getUserDataKey('profile');
    const userProfile = localStorage.getItem(userProfileKey);
    
    if (userProfile) {
        try {
            const profile = JSON.parse(userProfile);
            // Só atualizar o userProfile global se for o admin
            if (currentUser === 'weslleyleno60') {
                localStorage.setItem('userProfile', JSON.stringify(profile));
            }
        } catch(e) {
            console.error('Erro ao carregar perfil do usuário:', e);
        }
    } else {
        // Se não tiver perfil salvo, criar um perfil básico
        let basicProfile = null;
        
        if (currentUser === 'weslleyleno60') {
            // Se for o admin, verificar se tem perfil antigo
            const oldProfile = localStorage.getItem('userProfile');
            if (oldProfile) {
                try {
                    basicProfile = JSON.parse(oldProfile);
                    // Salvar também na chave específica do usuário
                    localStorage.setItem(userProfileKey, oldProfile);
                } catch(e) {}
            }
        } else {
            // Se for usuário comum, buscar dados do sistema de usuários
            // MAS só criar perfil básico se realmente não existir nenhum perfil salvo
            // Não sobrescrever se já tiver um perfil (mesmo que seja básico)
            const savedUsers = localStorage.getItem('systemUsers');
            if (savedUsers) {
                try {
                    const allUsers = JSON.parse(savedUsers);
                    const user = allUsers.find(u => u.username === currentUser);
                    if (user) {
                        // Verificar se já existe um perfil salvo antes de criar um básico
                        const existingProfile = localStorage.getItem(userProfileKey);
                        if (!existingProfile) {
                            // Só criar perfil básico se não existir nenhum
                            basicProfile = {
                                username: user.username,
                                password: user.password,
                                avatar: 0,
                                avatarUrl: 'https://flagcdn.com/w160/cn.png'
                            };
                        }
                    }
                } catch(e) {}
            }
        }
        
        if (basicProfile) {
            // Salvar apenas na chave específica do usuário
            localStorage.setItem(userProfileKey, JSON.stringify(basicProfile));
            // Só salvar no userProfile global se for admin
            if (currentUser === 'weslleyleno60') {
                localStorage.setItem('userProfile', JSON.stringify(basicProfile));
            }
        }
    }
    
    // Plataformas são globais (não por usuário)
    loadPlatforms();
    
    // Carregar despesas operacionais (async)
    loadOperationalExpenses().then(() => {
        // Despesas operacionais carregadas
    });
    
    // Recarregar tudo
    calculateAllTotals();
    updateAccountsList();
    updateProxyList();
    updatePixKeysList();
    updateExpensesList();
    checkAdminStatus();
    initProfile();
}

async function saveUserData() {
    if (!currentUser) {
        console.warn('⚠️ Não é possível salvar dados: usuário não logado');
        return;
    }
    
    console.log('🔄 Iniciando sincronização de dados...');
    
    // Salvar no localStorage primeiro (cache rápido)
    localStorage.setItem(getUserDataKey('accounts'), JSON.stringify(accounts));
    localStorage.setItem(getUserDataKey('proxies'), JSON.stringify(proxies));
    localStorage.setItem(getUserDataKey('pixKeys'), JSON.stringify(pixKeys));
    localStorage.setItem(getUserDataKey('expenses'), JSON.stringify(expenses));
    
    console.log('✅ Dados salvos no localStorage:', {
        accounts: accounts.length,
        proxies: proxies.length,
        pixKeys: pixKeys.length,
        expenses: expenses.length
    });
    
    // Sincronizar com Supabase (em background)
    if (window.supabaseClient) {
        try {
            console.log('🔄 Sincronizando com Supabase...');
            await Promise.all([
                saveAccountsToSupabase(),
                saveProxiesToSupabase(),
                savePixKeysToSupabase(),
                saveExpensesToSupabase(),
                saveOperationalExpensesToSupabase()
            ]);
            console.log('✅ Todos os dados sincronizados com Supabase!');
        } catch (error) {
            console.error('❌ Erro ao sincronizar com Supabase:', error);
        }
    } else {
        console.warn('⚠️ Supabase não está disponível');
    }
    
    // NÃO sobrescrever o perfil aqui - o perfil é salvo apenas quando o usuário clica em "Salvar Alterações"
    // Isso evita sobrescrever o avatar quando o usuário faz logout/login
}

// Migrar dados do localStorage para Supabase (executar uma vez)
async function migrateLocalStorageToSupabase() {
    if (!window.supabaseClient) return;
    
    // Verificar se já migrou
    const migrationKey = 'dataMigratedToSupabase';
    if (localStorage.getItem(migrationKey) === 'true') {
        return; // Já migrou
    }
    
    try {
        console.log('🔄 Iniciando migração de dados para Supabase...');
        
        // Migrar usuários do sistema
        const savedUsers = localStorage.getItem('systemUsers');
        if (savedUsers) {
            try {
                const users = JSON.parse(savedUsers);
                for (const user of users) {
                    await createOrUpdateUserInSupabase(user.username, user.password, user.isAdmin || false);
                }
                console.log('✅ Usuários migrados');
            } catch (e) {
                console.error('Erro ao migrar usuários:', e);
            }
        }
        
        // Migrar admin
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                if (profile.username && profile.password) {
                    await createOrUpdateUserInSupabase(profile.username, profile.password, profile.isAdmin || false);
                    console.log('✅ Admin migrado');
                }
            } catch (e) {
                console.error('Erro ao migrar admin:', e);
            }
        }
        
        // Marcar como migrado
        localStorage.setItem(migrationKey, 'true');
        console.log('✅ Migração concluída!');
    } catch (error) {
        console.error('Erro na migração:', error);
    }
}

// ============================================
// INITIALIZATION
// ============================================
// ============================================
// VERSION
// ============================================
function updateVersionDisplay() {
    const versionInfo = document.getElementById('versionInfo');
    const headerVersion = document.getElementById('headerVersion');
    
    if (versionInfo) {
        versionInfo.textContent = `v${APP_VERSION}`;
    }
    if (headerVersion) {
        headerVersion.textContent = `v${APP_VERSION}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Carregado! Iniciando configuração...');
    
    // Atualizar versão
    updateVersionDisplay();
    
    // Migrar dados para Supabase (se necessário)
    if (window.supabaseClient) {
        migrateLocalStorageToSupabase();
    }
    
    // Verificar login primeiro
    checkLogin();
    
    // Verificar se cadastro público está ativado
    checkPublicRegistrationStatus();
    
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        console.log('✅ Botão de login encontrado, adicionando event listener');
        // Remover listeners antigos se existirem
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        
        newLoginBtn.addEventListener('click', (e) => {
            console.log('🖱️ Botão de login clicado!');
            e.preventDefault();
            e.stopPropagation();
            login();
        });
        
        // Também adicionar listener direto no elemento original (backup)
        document.getElementById('loginBtn').addEventListener('click', function(e) {
            console.log('🖱️ Botão clicado (backup listener)');
            e.preventDefault();
            login();
        });
    } else {
        console.error('❌ ERRO: Botão de login não encontrado!');
        console.error('Elementos disponíveis:', document.querySelectorAll('button'));
    }
    
    // Register button (cadastro público)
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            registerPublicUser();
        });
    }
    
    // Show register form link
    const showRegisterForm = document.getElementById('showRegisterForm');
    if (showRegisterForm) {
        showRegisterForm.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
            document.getElementById('registerLinkContainer').style.display = 'none';
        });
    }
    
    // Back to login link
    const backToLogin = document.getElementById('backToLogin');
    if (backToLogin) {
        backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
            const isPublicRegistrationEnabled = localStorage.getItem('publicRegistrationEnabled') === 'true';
            if (isPublicRegistrationEnabled) {
                document.getElementById('registerLinkContainer').style.display = 'block';
            }
        });
    }
    
    // Toggle register password visibility
    const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
    const registerPassword = document.getElementById('registerPassword');
    const registerPasswordIcon = document.getElementById('registerPasswordIcon');
    
    if (toggleRegisterPassword && registerPassword && registerPasswordIcon) {
        toggleRegisterPassword.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const type = registerPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            registerPassword.setAttribute('type', type);
            registerPasswordIcon.classList.toggle('fa-eye');
            registerPasswordIcon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const loginPassword = document.getElementById('loginPassword');
    const passwordIcon = document.getElementById('passwordIcon');
    
    console.log('🔍 Verificando botão de mostrar senha:', {
        togglePassword: !!togglePassword,
        loginPassword: !!loginPassword,
        passwordIcon: !!passwordIcon
    });
    
    if (togglePassword && loginPassword && passwordIcon) {
        console.log('✅ Elementos encontrados, adicionando listener para mostrar senha');
        // Remover listeners antigos
        const newToggleBtn = togglePassword.cloneNode(true);
        togglePassword.parentNode.replaceChild(newToggleBtn, togglePassword);
        
        newToggleBtn.addEventListener('click', (e) => {
            console.log('👁️ Botão de mostrar senha clicado!');
            e.preventDefault();
            e.stopPropagation();
            const currentType = document.getElementById('loginPassword').getAttribute('type');
            const newType = currentType === 'password' ? 'text' : 'password';
            document.getElementById('loginPassword').setAttribute('type', newType);
            
            const icon = document.getElementById('passwordIcon');
            if (newType === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    } else {
        console.error('❌ ERRO: Elementos de mostrar senha não encontrados!');
    }
    
    // Load saved credentials if "Remember me" was checked
    const loginUsername = document.getElementById('loginUsername');
    const rememberMe = document.getElementById('rememberMe');
    
    if (loginUsername && loginPassword && rememberMe) {
        const savedCredentials = localStorage.getItem('savedCredentials');
        if (savedCredentials) {
            try {
                const creds = JSON.parse(savedCredentials);
                if (creds.username) loginUsername.value = creds.username;
                if (creds.password) loginPassword.value = creds.password;
                if (creds.remember) rememberMe.checked = true;
            } catch(e) {}
        }
        
        // Enter key on login form
        [loginUsername, loginPassword].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    login();
                }
            });
        });
    }
    
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
    }
    
    // Toggle Sidebar Button
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    function updateMainContentMargin() {
        if (mainContent && sidebar) {
            if (sidebar.classList.contains('collapsed')) {
                mainContent.style.marginLeft = '80px';
            } else {
                mainContent.style.marginLeft = '280px';
            }
        }
    }
    
    if (toggleSidebarBtn && sidebar) {
        // Verificar se há preferência salva
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
        }
        
        // Atualizar margin inicial
        updateMainContentMargin();
        
        toggleSidebarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            // Salvar preferência
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            // Atualizar margin do conteúdo principal
            updateMainContentMargin();
        });
    }
    
    // Menu toggle (antigo, manter para compatibilidade)
    menuToggle = document.getElementById('menuToggle');
    if (!sidebar) {
        sidebar = document.querySelector('.sidebar');
    }
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('open');
            // Não adicionar classe sidebar-open - estava causando tela preta
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
    
    // Navigation
    navItems = document.querySelectorAll('.sidebar-nav li');
    contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const sectionId = item.getAttribute('data-section');
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            showSection(sectionId);
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Check admin status first
    checkAdminStatus();
    
    updateGreeting();
    showSection('dashboard');
    
    // Initialize modals with delay to ensure DOM is ready
    setTimeout(() => {
        initModals();
        
        // Force enable all buttons
        const allButtons = document.querySelectorAll('button, .btn-primary, .btn-save, .goal-btn');
        allButtons.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
            btn.style.userSelect = 'none';
            btn.style.webkitUserSelect = 'none';
        });
        
        console.log('✅ Modais inicializados. Total de botões:', allButtons.length);
    }, 300);
    
    // Save account button - use both addEventListener and onclick
    const saveAccountBtn = document.querySelector('#addAccountModal .btn-save');
    if (saveAccountBtn) {
        // Remove old listeners by cloning
        const newSaveBtn = saveAccountBtn.cloneNode(true);
        saveAccountBtn.parentNode.replaceChild(newSaveBtn, saveAccountBtn);
        
        // Add event listener
        newSaveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            console.log('✅ Botão salvar clicado!');
            
            const modal = document.getElementById('addAccountModal');
            const editingId = modal.getAttribute('data-editing-id');
            const deposito = parseFloat(document.getElementById('depositoInput').value) || 0;
            const redeposito = parseFloat(document.getElementById('redepositoInput').value) || 0;
            const saque = parseFloat(document.getElementById('saqueInput').value) || 0;
            const bau = parseFloat(document.getElementById('bauInput').value) || 0;
            
            if (editingId) {
                // EDITANDO CONTA EXISTENTE
                const accountIndex = accounts.findIndex(acc => acc.id === parseInt(editingId));
                if (accountIndex !== -1) {
                    // Mantém a data e hora original, apenas atualiza os valores
                    accounts[accountIndex].deposito = deposito;
                    accounts[accountIndex].redeposito = redeposito;
                    accounts[accountIndex].saque = saque;
                    accounts[accountIndex].bau = bau;
                    
                    console.log('✅ Conta editada:', accounts[accountIndex]);
                }
                // Remove o atributo de edição
                modal.removeAttribute('data-editing-id');
                // Restaura o título
                const modalTitle = modal.querySelector('h2');
                if (modalTitle) {
                    modalTitle.textContent = 'Adicionar nova conta';
                }
            } else {
                // CRIANDO NOVA CONTA
                const now = new Date();
                const horaAtual = now.getHours();
                const minutosAtuais = now.getMinutes();
                
                const account = {
                    id: Date.now(),
                    deposito: deposito,
                    redeposito: redeposito,
                    saque: saque,
                    bau: bau,
                    date: now,
                    hora: horaAtual,
                    minutos: minutosAtuais,
                    timestamp: now.getTime()
                };
                
                console.log('✅ Conta salva automaticamente às', `${horaAtual.toString().padStart(2, '0')}:${minutosAtuais.toString().padStart(2, '0')}`);
                
                accounts.push(account);
            }
            
            // Salvar dados do usuário
            saveUserData();
            
            calculateAllTotals();
            
            // Update ranking if ranking section is active
            const rankingSection = document.getElementById('ranking');
            if (rankingSection && rankingSection.classList.contains('active')) {
                updateRanking().catch(err => console.error('Erro ao atualizar ranking:', err));
            }
            
            // Limpa os campos
            document.getElementById('depositoInput').value = '';
            document.getElementById('redepositoInput').value = '';
            document.getElementById('saqueInput').value = '';
            document.getElementById('bauInput').value = '';
            
            modal.classList.remove('active');
            updateAccountsList();
            initDailyChart();
            
            // Update balance chart if dashboard is active
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection && dashboardSection.classList.contains('active')) {
                const activeTab = document.querySelector('.evolution-tabs .tab-btn.active');
                const period = activeTab ? activeTab.getAttribute('data-period') || 'month' : 'month';
                initBalanceChart(period);
            }
        });
    }
    
    // Make functions available globally
    window.deleteAccount = deleteAccount;
    window.editAccount = editAccount;
    
    // Initialize expense inputs
    document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            calculateExpenses();
            saveOperationalExpenses(); // Salvar quando o usuário digitar
        });
    });
    
    // Carregar despesas operacionais salvas
    loadOperationalExpenses();
    
    // Tab switching for balance chart periods
    document.querySelectorAll('.evolution-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.evolution-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const period = btn.getAttribute('data-period') || 'month';
            initBalanceChart(period);
        });
    });
    
    // Initial calculations
    calculateExpenses();
    calculateAllTotals();
    updateAccountsList();
    updateBestDay();
    updateRanking();
    
    // Ranking filters
    const filterYear = document.getElementById('filterYear');
    const filterMonth = document.getElementById('filterMonth');
    const filterDay = document.getElementById('filterDay');
    
    if (filterYear) {
        filterYear.addEventListener('change', (e) => {
            e.stopPropagation();
            populateDayFilter();
            updateRanking().catch(err => console.error('Erro ao atualizar ranking:', err));
        });
    }
    
    if (filterMonth) {
        filterMonth.addEventListener('change', (e) => {
            e.stopPropagation();
            populateDayFilter();
            updateRanking().catch(err => console.error('Erro ao atualizar ranking:', err));
        });
    }
    
    if (filterDay) {
        filterDay.addEventListener('change', () => {
            updateRanking().catch(err => console.error('Erro ao atualizar ranking:', err));
        });
    }
    
    // Profile section
    initProfile();
    
    // Update sidebar avatar on load
    updateSidebarAvatar();
    
    // Iniciar atualização automática
    startAutoRefresh();
    
    // Load and initialize Proxy section
    loadProxies().catch(err => console.error('Erro ao carregar proxies:', err));
    const addProxyBtn = document.getElementById('addProxyBtn');
    if (addProxyBtn) {
        addProxyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addProxy();
        });
    }
    
    // Load and initialize PIX Keys section
    loadPixKeys().catch(err => console.error('Erro ao carregar chaves PIX:', err));
    const addPixKeyBtn = document.getElementById('addPixKeyBtn');
    if (addPixKeyBtn) {
        addPixKeyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addPixKey();
        });
    }
    
    // Load and initialize Expenses section
    loadExpenses().catch(err => console.error('Erro ao carregar gastos:', err));
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addExpense().catch(err => console.error('Erro ao adicionar gasto:', err));
        });
    }
    
    // Set default date for expense date input
    const expenseDate = document.getElementById('expenseDate');
    if (expenseDate && !expenseDate.value) {
        expenseDate.value = new Date().toISOString().split('T')[0];
    }
    
    // Check admin status and initialize admin section
    checkAdminStatus();
    loadUsers().catch(err => console.error('Erro ao carregar usuários:', err));
    
    // Admin section - toggle public registration
    const enablePublicRegistration = document.getElementById('enablePublicRegistration');
    if (enablePublicRegistration) {
        // Carregar estado salvo
        const isEnabled = localStorage.getItem('publicRegistrationEnabled') === 'true';
        enablePublicRegistration.checked = isEnabled;
        
        enablePublicRegistration.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            localStorage.setItem('publicRegistrationEnabled', isEnabled.toString());
            // Atualizar tela de login se estiver visível
            checkPublicRegistrationStatus();
        });
    }
    
    // Admin section - add user button
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isAdmin) {
                addUser();
            } else {
                alert('Acesso negado. Apenas administradores podem cadastrar usuários.');
            }
        });
    }
    
    // Load and initialize Platforms section
    loadPlatforms();
    const addPlatformBtn = document.getElementById('addPlatformBtn');
    if (addPlatformBtn) {
        addPlatformBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Verificar se está editando
            const editingIndex = addPlatformBtn.getAttribute('data-editing-index');
            if (editingIndex !== null && editingIndex !== '') {
                // Está editando - salvar a edição
                const platformName = document.getElementById('platformName');
                const platformStatus = document.getElementById('platformStatus');
                const platformDescription = document.getElementById('platformDescription');
                
                if (platformName && platformStatus) {
                    const name = platformName.value.trim();
                    const status = platformStatus.value;
                    const description = platformDescription ? platformDescription.value.trim() : '';
                    const index = parseInt(editingIndex);
                    
                    if (!name) {
                        alert('Por favor, digite o nome da plataforma.');
                        return;
                    }
                    
                    if (index >= 0 && index < platforms.length) {
                        // Obter o username do usuário logado
                        let username = currentUser || 'weslleyleno60';
                        
                        // Se não tiver currentUser, tentar pegar do perfil
                        if (!currentUser) {
                            const savedProfile = localStorage.getItem('userProfile');
                            if (savedProfile) {
                                try {
                                    const profile = JSON.parse(savedProfile);
                                    if (profile.username) username = profile.username;
                                } catch(e) {}
                            }
                        }
                        
                        // Atualizar a plataforma existente mantendo a data original
                        platforms[index].name = name;
                        platforms[index].status = status;
                        platforms[index].description = description;
                        platforms[index].updatedBy = username;
                        platforms[index].updatedAt = new Date().toISOString();
                        
                        savePlatforms();
                        updatePlatformsList();
                        platformName.value = '';
                        platformStatus.value = 'passando';
                        if (platformDescription) platformDescription.value = '';
                        
                        // Restaurar o botão
                        addPlatformBtn.textContent = 'Adicionar Plataforma';
                        addPlatformBtn.removeAttribute('data-editing-index');
                    }
                }
            } else {
                // Adicionar nova plataforma
                addPlatform();
            }
        });
    }
});

// ============================================
// AUTO REFRESH SYSTEM
// ============================================
let autoRefreshInterval = null;
const AUTO_REFRESH_INTERVAL = 30000; // 30 segundos

function startAutoRefresh() {
    // Limpar intervalo anterior se existir
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // Iniciar atualização automática
    autoRefreshInterval = setInterval(() => {
        refreshAllData();
    }, AUTO_REFRESH_INTERVAL);
    
    console.log('🔄 Atualização automática iniciada (a cada 30 segundos)');
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        console.log('⏸️ Atualização automática parada');
    }
}

async function refreshAllData() {
    // Verificar se o usuário está logado
    if (!currentUser) return;
    
    // Verificar qual seção está ativa
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    const sectionId = activeSection.id;
    
    console.log('🔄 Atualizando dados automaticamente...');
    
    // Recarregar dados do usuário (contas, proxies, pixkeys, expenses)
    await loadUserData();
    
    // Recarregar plataformas do Supabase (sempre, pois é global)
    if (window.supabaseClient) {
        try {
            const supabasePlatforms = await loadPlatformsFromSupabase();
            if (supabasePlatforms.length > 0) {
                platforms = supabasePlatforms;
                localStorage.setItem('platforms', JSON.stringify(platforms));
                updatePlatformsList();
            }
        } catch(e) {
            console.error('Erro ao recarregar plataformas:', e);
        }
    }
    
    // Recarregar usuários do Supabase (para admin)
    if (isAdmin && window.supabaseClient) {
        try {
            await loadUsers();
            updateUsersList();
        } catch(e) {
            console.error('Erro ao recarregar usuários:', e);
        }
    }
    
    // Atualizar listas específicas baseado na seção ativa
    switch(sectionId) {
        case 'proxy':
            updateProxyList();
            break;
        case 'chaves-pix':
            updatePixKeysList();
            break;
        case 'gastos':
            updateExpensesList();
            break;
        case 'controle-diario':
            updateAccountsList();
            break;
    }
    
    // Atualizar ranking (sempre, pois pode ter mudanças de outros usuários)
    await updateRanking();
    
    // Atualizar seção específica se estiver visível
    switch(sectionId) {
        case 'dashboard':
            // Atualizar dashboard
            const todayAccounts = accounts;
            let totalDepositos = 0, totalRedepositos = 0, totalSaques = 0, totalBau = 0;
            todayAccounts.forEach(account => {
                totalDepositos += parseFloat(account.deposito) || 0;
                totalRedepositos += parseFloat(account.redeposito) || 0;
                totalSaques += parseFloat(account.saque) || 0;
                totalBau += parseFloat(account.bau) || 0;
            });
            let despesasOperacionais = 0;
            document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
                despesasOperacionais += parseFloat(input.value) || 0;
            });
            const lucroDiario = (totalSaques + totalBau) - (totalDepositos + totalRedepositos) - despesasOperacionais;
            const totalInvestido = totalDepositos + totalRedepositos + despesasOperacionais;
            updateDashboardCards(lucroDiario, totalInvestido, todayAccounts.length);
            updateBestDay();
            
            // Atualizar gráfico de saldo
            const activeTab = document.querySelector('.evolution-tabs .tab-btn.active');
            const period = activeTab ? activeTab.getAttribute('data-period') || 'month' : 'month';
            initBalanceChart(period);
            break;
            
        case 'controle-diario':
            updateAccountsList();
            initDailyChart();
            break;
            
        case 'ranking':
            // Ranking já foi atualizado acima, mas atualizar novamente para garantir
            updateRanking().catch(err => console.error('Erro ao atualizar ranking:', err));
            break;
            
        case 'plataformas':
            updatePlatformsList();
            break;
            
        case 'proxy':
            updateProxyList();
            break;
            
        case 'chaves-pix':
            updatePixKeysList();
            break;
            
        case 'gastos':
            updateExpensesList();
            break;
            
        case 'admin':
            if (isAdmin) {
                loadUsers().catch(err => console.error('Erro ao carregar usuários:', err));
            }
            break;
    }
    
    // Atualizar avatar e saudação (caso tenha mudado)
    updateSidebarAvatar();
    updateGreeting();
}

// ============================================
// PROFILE MANAGEMENT
// ============================================
function updateSidebarAvatar() {
    const sidebarAvatar = document.getElementById('sidebarUserAvatar');
    const sidebarUsername = document.getElementById('sidebarUsername');
    if (!sidebarAvatar) return;
    
    // Sempre usar currentUser primeiro
    let username = currentUser || 'weslleyleno60';
    
    // Carregar perfil do usuário logado
    let savedProfile = null;
    if (currentUser) {
        const userProfileKey = getUserDataKey('profile');
        savedProfile = localStorage.getItem(userProfileKey);
    }
    
    // Se não encontrou, tentar o userProfile global (para compatibilidade com admin)
    if (!savedProfile) {
        savedProfile = localStorage.getItem('userProfile');
    }
    
    let avatarUrl = '';
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            // Garantir que o username seja do currentUser
            username = currentUser || profile.username || username;
            if (profile.avatarUrl) {
                avatarUrl = profile.avatarUrl;
            } else if (profile.avatar !== undefined) {
                // Generate avatar URL if not saved
                if (profile.avatar === 0) {
                    avatarUrl = 'https://flagcdn.com/w160/cn.png';
                } else {
                    const avatarStyles = [
                        'lorelei', 'lorelei-neutral', 'micah', 'adventurer', 'adventurer-neutral',
                        'avataaars', 'big-ears', 'big-ears-neutral', 'big-smile', 'bottts',
                        'croodles', 'croodles-neutral', 'fun-emoji', 'icons', 'identicon',
                        'miniavs', 'notionists', 'open-peeps', 'personas', 'pixel-art',
                        'rings', 'shapes', 'thumbs', 'initials'
                    ];
                    const styleIndex = (profile.avatar - 1) % avatarStyles.length;
                    const style = avatarStyles[styleIndex];
                    const seed = `avatar-${profile.avatar}-user`;
                    avatarUrl = `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
                }
            }
        } catch(e) {
            console.error('Erro ao carregar avatar:', e);
        }
    }
    
    // Default to China flag if no avatar
    if (!avatarUrl) {
        avatarUrl = 'https://flagcdn.com/w160/cn.png';
    }
    
    sidebarAvatar.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="sidebar-avatar-img">`;
    
    // Atualizar nome do usuário no sidebar
    if (sidebarUsername) {
        sidebarUsername.textContent = username;
    }
}

function generateAvatars() {
    const avatarGrid = document.getElementById('avatarGrid');
    if (!avatarGrid) return;
    
    // China flag as first avatar
    const chinaFlagUrl = 'https://flagcdn.com/w160/cn.png';
    
    // Estilos modernos do DiceBear 8.x
    const avatarStyles = [
        'lorelei', 'lorelei-neutral', 'micah', 'adventurer', 'adventurer-neutral',
        'avataaars', 'big-ears', 'big-ears-neutral', 'big-smile', 'bottts',
        'croodles', 'croodles-neutral', 'fun-emoji', 'icons', 'identicon',
        'miniavs', 'notionists', 'open-peeps', 'personas', 'pixel-art',
        'rings', 'shapes', 'thumbs', 'initials'
    ];
    
    // Generate avatars with different seeds for variety
    avatarGrid.innerHTML = '';
    
    // Add China flag as first avatar
    const chinaAvatar = document.createElement('div');
    chinaAvatar.className = 'avatar-item';
    chinaAvatar.innerHTML = `<img src="${chinaFlagUrl}" alt="CHINAS ON FIRE" class="avatar-image" title="CHINAS ON FIRE">`;
    chinaAvatar.setAttribute('data-avatar', 0);
    chinaAvatar.setAttribute('data-avatar-url', chinaFlagUrl);
    chinaAvatar.addEventListener('click', () => {
        selectAvatar(0, chinaFlagUrl, 'CHINAS ON FIRE');
    });
    avatarGrid.appendChild(chinaAvatar);
    
    // Generate other avatars with modern styles
    for (let i = 1; i <= 23; i++) {
        const styleIndex = (i - 1) % avatarStyles.length;
        const style = avatarStyles[styleIndex];
        const seed = `avatar-${i}-${Date.now()}`;
        // Usar versão 8.x com estilos mais modernos
        const avatarUrl = `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
        
        const avatarItem = document.createElement('div');
        avatarItem.className = 'avatar-item';
        avatarItem.innerHTML = `<img src="${avatarUrl}" alt="Avatar ${i}" class="avatar-image">`;
        avatarItem.setAttribute('data-avatar', i);
        avatarItem.setAttribute('data-avatar-url', avatarUrl);
        avatarItem.addEventListener('click', () => {
            selectAvatar(i, avatarUrl, `Avatar ${i}`);
        });
        avatarGrid.appendChild(avatarItem);
    }
}

function selectAvatar(avatarId, avatarUrl, avatarName) {
    // Se não for foto customizada, marcar o item selecionado
    if (avatarId !== -1) {
        document.querySelectorAll('.avatar-item').forEach(item => item.classList.remove('selected'));
        const avatarItem = document.querySelector(`.avatar-item[data-avatar="${avatarId}"]`);
        if (avatarItem) avatarItem.classList.add('selected');
    }
    
    document.getElementById('selectedAvatar').value = avatarId;
    document.getElementById('selectedAvatarUrl').value = avatarUrl;
    
    // Update preview
    const preview = document.getElementById('currentAvatarPreview');
    if (preview) {
        if (avatarId === -1) {
            // Foto customizada
            preview.innerHTML = `<img src="${avatarUrl}" alt="${avatarName}" class="avatar-preview-img"> ${avatarName}`;
        } else {
            preview.innerHTML = `<img src="${avatarUrl}" alt="${avatarName}" class="avatar-preview-img"> ${avatarName}`;
        }
    }
    
    // Update sidebar avatar
    updateSidebarAvatar();
    
    // Close modal
    const avatarModal = document.getElementById('avatarModal');
    if (avatarModal) {
        avatarModal.classList.remove('active');
    }
    
    // Limpar input de arquivo
    const photoUpload = document.getElementById('photoUpload');
    if (photoUpload) {
        photoUpload.value = '';
    }
}

function initProfile() {
    // Generate avatars
    generateAvatars();
    
    // Toggle password visibility in profile - remover listeners antigos primeiro
    const toggleProfilePassword = document.getElementById('toggleProfilePassword');
    const profilePassword = document.getElementById('profilePassword');
    const profilePasswordIcon = document.getElementById('profilePasswordIcon');
    
    if (toggleProfilePassword && profilePassword && profilePasswordIcon) {
        // Remover listeners antigos clonando o elemento
        const newToggleBtn = toggleProfilePassword.cloneNode(true);
        toggleProfilePassword.parentNode.replaceChild(newToggleBtn, toggleProfilePassword);
        
        // Adicionar novo listener
        newToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentType = profilePassword.getAttribute('type');
            const newType = currentType === 'password' ? 'text' : 'password';
            profilePassword.setAttribute('type', newType);
            
            // Atualizar ícone
            if (newType === 'text') {
                profilePasswordIcon.classList.remove('fa-eye');
                profilePasswordIcon.classList.add('fa-eye-slash');
            } else {
                profilePasswordIcon.classList.remove('fa-eye-slash');
                profilePasswordIcon.classList.add('fa-eye');
            }
        });
    }
    
    // Toggle password visibility in admin (new user)
    const toggleNewUserPassword = document.getElementById('toggleNewUserPassword');
    const newUserPassword = document.getElementById('newUserPassword');
    const newUserPasswordIcon = document.getElementById('newUserPasswordIcon');
    
    if (toggleNewUserPassword && newUserPassword && newUserPasswordIcon) {
        toggleNewUserPassword.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const type = newUserPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            newUserPassword.setAttribute('type', type);
            newUserPasswordIcon.classList.toggle('fa-eye');
            newUserPasswordIcon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Load saved profile data - sempre carregar do perfil do usuário logado
    let savedProfile = null;
    let userPassword = null;
    
    if (currentUser) {
        // Carregar do perfil específico do usuário
        const userProfileKey = getUserDataKey('profile');
        savedProfile = localStorage.getItem(userProfileKey);
        
        // SEMPRE buscar a senha do sistema de usuários primeiro (fonte da verdade)
        if (currentUser !== 'weslleyleno60') {
            const savedUsers = localStorage.getItem('systemUsers');
            if (savedUsers) {
                try {
                    const allUsers = JSON.parse(savedUsers);
                    const user = allUsers.find(u => u.username === currentUser);
                    if (user && user.password) {
                        userPassword = user.password;
                    }
                } catch(e) {
                    console.error('Erro ao buscar senha do usuário:', e);
                }
            }
        }
        
        // Se não encontrou perfil específico do usuário, criar um básico a partir dos dados do sistema
        // MAS só criar se realmente não existir nenhum perfil (não sobrescrever)
        if (!savedProfile) {
            const savedUsers = localStorage.getItem('systemUsers');
            if (savedUsers) {
                try {
                    const allUsers = JSON.parse(savedUsers);
                    const user = allUsers.find(u => u.username === currentUser);
                    if (user) {
                        // Verificar novamente se não existe perfil (pode ter sido criado em outra função)
                        const doubleCheck = localStorage.getItem(userProfileKey);
                        if (!doubleCheck) {
                            // Só criar perfil básico se realmente não existir nenhum
                            const basicProfile = {
                                username: user.username,
                                password: user.password,
                                avatar: 0,
                                avatarUrl: 'https://flagcdn.com/w160/cn.png'
                            };
                            localStorage.setItem(userProfileKey, JSON.stringify(basicProfile));
                            // NÃO salvar no userProfile global para não sobrescrever o admin
                            savedProfile = JSON.stringify(basicProfile);
                        } else {
                            // Se encontrou agora, usar o que já existe
                            savedProfile = doubleCheck;
                        }
                    }
                } catch(e) {
                    console.error('Erro ao criar perfil básico:', e);
                }
            }
        }
    }
    
    // Se não encontrou e for admin, tentar o userProfile global (apenas para admin)
    if (!savedProfile && currentUser === 'weslleyleno60') {
        savedProfile = localStorage.getItem('userProfile');
    }
    
    // Carregar dados do perfil
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            // Garantir que o username seja do usuário logado
            const profileUsername = currentUser || profile.username;
            if (document.getElementById('profileUsername')) {
                document.getElementById('profileUsername').value = profileUsername;
            }
            
            // Carregar senha - SEMPRE priorizar a senha do sistema de usuários
            const profilePasswordField = document.getElementById('profilePassword');
            if (profilePasswordField) {
                // Se tiver senha do sistema de usuários, usar ela (fonte da verdade)
                if (userPassword) {
                    profilePasswordField.value = userPassword;
                } else if (profile.password) {
                    // Se não tiver do sistema, usar do perfil
                    profilePasswordField.value = profile.password;
                } else if (currentUser === 'weslleyleno60') {
                    // Se for admin e não tiver senha, usar do perfil admin
                    profilePasswordField.value = profile.password || '';
                }
                // Garantir que o campo seja do tipo password inicialmente
                profilePasswordField.setAttribute('type', 'password');
            }
            if (profile.avatar !== undefined) {
                document.getElementById('selectedAvatar').value = profile.avatar;
            }
            if (profile.avatarUrl) {
                document.getElementById('selectedAvatarUrl').value = profile.avatarUrl;
                // Update preview
                const preview = document.getElementById('currentAvatarPreview');
                if (preview) {
                    let avatarName = '';
                    if (profile.avatar === 0) {
                        avatarName = 'CHINAS ON FIRE';
                    } else if (profile.avatar === -1) {
                        avatarName = 'Foto Personalizada';
                    } else {
                        avatarName = `Avatar ${profile.avatar}`;
                    }
                    preview.innerHTML = `<img src="${profile.avatarUrl}" alt="${avatarName}" class="avatar-preview-img"> ${avatarName}`;
                }
                // Update sidebar avatar
                updateSidebarAvatar();
            }
        } catch (e) {
            console.error('Erro ao carregar perfil:', e);
        }
    } else {
        // Set default avatar (China flag)
        document.getElementById('selectedAvatar').value = 0;
        const chinaFlagUrl = 'https://flagcdn.com/w160/cn.png';
        document.getElementById('selectedAvatarUrl').value = chinaFlagUrl;
        const preview = document.getElementById('currentAvatarPreview');
        if (preview) {
            preview.innerHTML = `<img src="${chinaFlagUrl}" alt="CHINAS ON FIRE" class="avatar-preview-img"> CHINAS ON FIRE`;
        }
        // Update sidebar with default avatar
        updateSidebarAvatar();
    }
    
    // Avatar modal handlers
    const openAvatarModal = document.getElementById('openAvatarModal');
    const avatarModal = document.getElementById('avatarModal');
    const closeAvatarModal = document.getElementById('closeAvatarModal');
    
    if (openAvatarModal && avatarModal) {
        openAvatarModal.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            avatarModal.classList.add('active');
        });
    }
    
    if (closeAvatarModal && avatarModal) {
        closeAvatarModal.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            avatarModal.classList.remove('active');
        });
    }
    
    // Close modal when clicking outside
    if (avatarModal) {
        avatarModal.addEventListener('click', (e) => {
            if (e.target === avatarModal) {
                avatarModal.classList.remove('active');
            }
        });
    }
    
    // Save profile button - remover listeners antigos primeiro
    const saveProfileBtn = document.getElementById('saveProfile');
    if (saveProfileBtn) {
        // Remover listeners antigos clonando o botão
        const newSaveBtn = saveProfileBtn.cloneNode(true);
        saveProfileBtn.parentNode.replaceChild(newSaveBtn, saveProfileBtn);
        
        newSaveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('✅ Botão salvar perfil clicado!');
            
            const profileUsername = document.getElementById('profileUsername');
            const profilePassword = document.getElementById('profilePassword');
            const selectedAvatar = document.getElementById('selectedAvatar');
            const selectedAvatarUrl = document.getElementById('selectedAvatarUrl');
            
            if (!profileUsername || !profilePassword || !selectedAvatar || !selectedAvatarUrl) {
                alert('Erro: Campos do perfil não encontrados.');
                console.error('Campos não encontrados:', { profileUsername, profilePassword, selectedAvatar, selectedAvatarUrl });
                return;
            }
            
            const profile = {
                username: profileUsername.value.trim(),
                password: profilePassword.value,
                avatar: parseInt(selectedAvatar.value) || 0,
                avatarUrl: selectedAvatarUrl.value || ''
            };
            
            if (!profile.username) {
                alert('Por favor, digite um nome de usuário.');
                return;
            }
            
            // Carregar perfil existente para manter dados adicionais
            let existingProfile = null;
            if (currentUser) {
                const userProfileKey = getUserDataKey('profile');
                const savedProfile = localStorage.getItem(userProfileKey);
                if (savedProfile) {
                    try {
                        existingProfile = JSON.parse(savedProfile);
                    } catch(e) {
                        console.error('Erro ao carregar perfil existente:', e);
                    }
                }
            }
            
            // Se não encontrou, tentar o userProfile global
            if (!existingProfile) {
                const savedProfile = localStorage.getItem('userProfile');
                if (savedProfile) {
                    try {
                        existingProfile = JSON.parse(savedProfile);
                    } catch(e) {}
                }
            }
            
            // Manter monthly goal e admin status se existirem
            if (existingProfile) {
                if (existingProfile.monthlyGoal) {
                    profile.monthlyGoal = existingProfile.monthlyGoal;
                }
                if (existingProfile.isAdmin !== undefined) {
                    profile.isAdmin = existingProfile.isAdmin;
                }
            } else if (currentUser === 'weslleyleno60') {
                // Se for admin e não tiver perfil, marcar como admin
                profile.isAdmin = true;
            }
            
            // Salvar perfil do usuário na chave específica
            if (currentUser) {
                const userProfileKey = getUserDataKey('profile');
                localStorage.setItem(userProfileKey, JSON.stringify(profile));
                console.log('✅ Perfil salvo em:', userProfileKey);
                
                // Só salvar no userProfile global se for admin
                if (currentUser === 'weslleyleno60') {
                    localStorage.setItem('userProfile', JSON.stringify(profile));
                    console.log('✅ Perfil admin salvo em userProfile global');
                }
                
                saveUserData(); // Salvar todos os dados do usuário
            } else {
                // Se não tiver currentUser, salvar no userProfile global (compatibilidade)
                localStorage.setItem('userProfile', JSON.stringify(profile));
                console.log('✅ Perfil salvo em userProfile global (sem currentUser)');
            }
            
            // Salvar perfil no Supabase
            if (window.supabaseClient) {
                await saveUserProfileToSupabase(profile);
            }
            
            checkAdminStatus(); // Re-check admin status after saving
            alert('Perfil salvo com sucesso!');
            updateSidebarAvatar(); // Update sidebar avatar
            updateRanking().catch(err => console.error('Erro ao atualizar ranking:', err)); // Update ranking to show new avatar
            console.log('✅ Perfil salvo:', profile);
        });
    }
}

function updateDashboardCards(lucroDiario, totalInvestido, totalContas) {
    // Calculate total profit from all accounts
    let totalProfit = 0;
    accounts.forEach(account => {
        const lucro = ((account.saque || 0) + (account.bau || 0)) - ((account.deposito || 0) + (account.redeposito || 0));
        totalProfit += lucro;
    });
    
    // Get expenses
    let despesasOperacionais = 0;
    document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
        despesasOperacionais += parseFloat(input.value) || 0;
    });
    totalProfit -= despesasOperacionais;
    
    // Calculate unique days
    const uniqueDates = new Set(accounts.map(acc => {
        const date = new Date(acc.date);
        return date.toDateString();
    })).size;
    
    // Calculate ROI
    const roi = totalInvestido > 0 ? ((totalProfit / totalInvestido) * 100) : 0;
    
    // Calculate daily average
    const dailyAverage = uniqueDates > 0 ? totalProfit / uniqueDates : 0;
    
    // Update cards
    const totalProfitCard = document.getElementById('totalProfitCard');
    const totalDaysCard = document.getElementById('totalDaysCard');
    const totalInvestedCard = document.getElementById('totalInvestedCard');
    const roiCard = document.getElementById('roiCard');
    const averageDayCard = document.getElementById('averageDayCard');
    
    if (totalProfitCard) totalProfitCard.textContent = formatCurrency(totalProfit);
    if (totalDaysCard) totalDaysCard.textContent = `${uniqueDates} ${uniqueDates === 1 ? 'dia registrado' : 'dias registrados'}`;
    if (totalInvestedCard) totalInvestedCard.textContent = formatCurrency(totalInvestido);
    if (roiCard) roiCard.textContent = `${roi.toFixed(1)}%`;
    if (averageDayCard) averageDayCard.textContent = formatCurrency(dailyAverage);
}

function updateBestDay() {
    // Group accounts by date and calculate profit per day
    const dailyProfits = {};
    
    accounts.forEach(account => {
        const date = new Date(account.date);
        const dateKey = date.toDateString();
        const lucro = ((account.saque || 0) + (account.bau || 0)) - ((account.deposito || 0) + (account.redeposito || 0));
        
        if (!dailyProfits[dateKey]) {
            dailyProfits[dateKey] = { date: date, profit: 0 };
        }
        dailyProfits[dateKey].profit += lucro;
    });
    
    // Get expenses
    let despesasOperacionais = 0;
    document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
        despesasOperacionais += parseFloat(input.value) || 0;
    });
    
    // Subtract expenses from each day
    Object.keys(dailyProfits).forEach(key => {
        dailyProfits[key].profit -= despesasOperacionais;
    });
    
    // Find best day
    let bestDay = null;
    let bestProfit = -Infinity;
    
    Object.values(dailyProfits).forEach(day => {
        if (day.profit > bestProfit) {
            bestProfit = day.profit;
            bestDay = day;
        }
    });
    
    const bestDayCard = document.getElementById('bestDayCard');
    const bestDayValue = document.getElementById('bestDayValue');
    
    if (bestDay && bestProfit > 0) {
        const dayStr = `${bestDay.date.getDate().toString().padStart(2, '0')}/${(bestDay.date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (bestDayCard) bestDayCard.style.display = 'flex';
        if (bestDayValue) bestDayValue.textContent = `${dayStr}: ${formatCurrency(bestProfit)}`;
    } else {
        if (bestDayCard) bestDayCard.style.display = 'none';
    }
}

function populateYearFilter() {
    const filterYear = document.getElementById('filterYear');
    if (!filterYear) return;
    
    // Clear and populate with years from 2024 to 2099
    filterYear.innerHTML = '<option value="">Todos os anos</option>';
    for (let year = 2024; year <= 2099; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        filterYear.appendChild(option);
    }
}

function populateDayFilter() {
    const filterYear = document.getElementById('filterYear');
    const filterMonth = document.getElementById('filterMonth');
    const filterDay = document.getElementById('filterDay');
    
    if (!filterDay || !filterYear || !filterMonth) return;
    
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value;
    
    // Clear days
    filterDay.innerHTML = '<option value="">Todos os dias</option>';
    
    if (!selectedYear || selectedMonth === '') {
        return;
    }
    
    // Convert to numbers for comparison
    const yearNum = parseInt(selectedYear);
    const monthNum = parseInt(selectedMonth);
    
    if (isNaN(yearNum) || isNaN(monthNum)) {
        return;
    }
    
    // Get the number of days in the selected month/year
    const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();
    
    // Populate with all days from 1 to daysInMonth
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        filterDay.appendChild(option);
    }
}

function getFilteredAccounts() {
    const filterYear = document.getElementById('filterYear');
    const filterMonth = document.getElementById('filterMonth');
    const filterDay = document.getElementById('filterDay');
    
    let filtered = accounts;
    
    if (filterYear && filterYear.value) {
        const year = parseInt(filterYear.value);
        filtered = filtered.filter(account => {
            const date = new Date(account.date);
            return date.getFullYear() === year;
        });
    }
    
    if (filterMonth && filterMonth.value !== '') {
        const month = parseInt(filterMonth.value);
        filtered = filtered.filter(account => {
            const date = new Date(account.date);
            return date.getMonth() === month;
        });
    }
    
    if (filterDay && filterDay.value) {
        const day = parseInt(filterDay.value);
        filtered = filtered.filter(account => {
            const date = new Date(account.date);
            return date.getDate() === day;
        });
    }
    
    return filtered;
}

async function updateRanking(isSectionOpened = false) {
    // Get filtered accounts for current user
    const filteredAccounts = getFilteredAccounts();
    
    // Calculate current user's total profit from filtered accounts
    let totalProfit = 0;
    filteredAccounts.forEach(account => {
        const lucro = ((account.saque || 0) + (account.bau || 0)) - ((account.deposito || 0) + (account.redeposito || 0));
        totalProfit += lucro;
    });
    
    // Get expenses for current user (only count expenses for filtered period - for now, count all)
    let despesasOperacionais = 0;
    document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
        despesasOperacionais += parseFloat(input.value) || 0;
    });
    totalProfit -= despesasOperacionais;
    
    // Calculate total invested for current user
    let totalDepositos = 0, totalRedepositos = 0;
    filteredAccounts.forEach(account => {
        totalDepositos += parseFloat(account.deposito) || 0;
        totalRedepositos += parseFloat(account.redeposito) || 0;
    });
    const totalInvestido = totalDepositos + totalRedepositos + despesasOperacionais;
    
    // Calculate ROI for current user
    const roi = totalInvestido > 0 ? ((totalProfit / totalInvestido) * 100) : 0;
    
    // Calculate today's profit for current user
    const today = new Date();
    const todayAccounts = accounts.filter(account => {
        const date = new Date(account.date);
        return date.toDateString() === today.toDateString();
    });
    
    let todayProfit = 0;
    todayAccounts.forEach(account => {
        const lucro = ((account.saque || 0) + (account.bau || 0)) - ((account.deposito || 0) + (account.redeposito || 0));
        todayProfit += lucro;
    });
    
    // Get expenses for today
    let todayExpenses = 0;
    document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
        todayExpenses += parseFloat(input.value) || 0;
    });
    todayProfit -= todayExpenses;
    
    // Get monthly goal and calculate daily goal for current user
    // Usar o perfil do usuário atual, não o perfil global
    const userProfileKey = getUserDataKey('profile');
    let savedProfile = localStorage.getItem(userProfileKey);
    // Se não encontrar, tentar o perfil global (para admin)
    if (!savedProfile && currentUser === 'weslleyleno60') {
        savedProfile = localStorage.getItem('userProfile');
    }
    
    let monthlyGoal = 30000; // Default
    let selectedAvatar = 0;
    let avatarUrl = '';
    
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            if (profile.monthlyGoal) monthlyGoal = profile.monthlyGoal;
            if (profile.avatar) selectedAvatar = profile.avatar;
            if (profile.avatarUrl) avatarUrl = profile.avatarUrl;
        } catch(e) {}
    }
    
    // Calculate daily goal: monthly goal / days in month
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyGoal = monthlyGoal / daysInMonth;
    
    // Update goal displays
    const goalProgressBar = document.getElementById('goalProgressBar');
    const goalProgressText = document.getElementById('goalProgressText');
    const goalTarget = document.getElementById('goalTarget');
    const goalAchieved = document.getElementById('goalAchieved');
    const goalRemaining = document.getElementById('goalRemaining');
    const goalDailyTarget = document.getElementById('goalDailyTarget');
    const goalDailyAchieved = document.getElementById('goalDailyAchieved');
    const goalDailyRemaining = document.getElementById('goalDailyRemaining');
    
    // Calculate progress
    const goalProgress = monthlyGoal > 0 ? Math.min((totalProfit / monthlyGoal) * 100, 100) : 0;
    const goalRemainingValue = Math.max(monthlyGoal - totalProfit, 0);
    const dailyGoalRemainingValue = Math.max(dailyGoal - todayProfit, 0);
    const dailyGoalProgress = dailyGoal > 0 ? Math.min((todayProfit / dailyGoal) * 100, 100) : 0;
    
    if (goalProgressBar) goalProgressBar.style.width = `${goalProgress}%`;
    if (goalProgressText) goalProgressText.textContent = `${goalProgress.toFixed(1)}%`;
    if (goalTarget) goalTarget.textContent = formatCurrency(monthlyGoal);
    if (goalAchieved) goalAchieved.textContent = formatCurrency(totalProfit);
    if (goalRemaining) goalRemaining.textContent = formatCurrency(goalRemainingValue);
    if (goalDailyTarget) goalDailyTarget.textContent = formatCurrency(dailyGoal);
    if (goalDailyAchieved) goalDailyAchieved.textContent = formatCurrency(todayProfit);
    if (goalDailyRemaining) goalDailyRemaining.textContent = formatCurrency(dailyGoalRemainingValue);
    
    // ============================================
    // RANKING DE TODOS OS USUÁRIOS (GLOBAL)
    // ============================================
    // Carregar TODOS os usuários do sistema
    let allUsers = [];
    if (window.supabaseClient) {
        try {
            const supabaseUsers = await loadUsersFromSupabase();
            allUsers = supabaseUsers;
            
            // Adicionar admin se existir no perfil
            const adminProfile = localStorage.getItem('userProfile');
            if (adminProfile) {
                try {
                    const admin = JSON.parse(adminProfile);
                    if (admin.username && !allUsers.find(u => u.username === admin.username)) {
                        allUsers.push({
                            id: null,
                            username: admin.username,
                            isAdmin: true,
                            date: null
                        });
                    }
                } catch(e) {}
            }
        } catch(e) {
            // Fallback para localStorage
            const savedUsers = localStorage.getItem('systemUsers');
            if (savedUsers) {
                try {
                    allUsers = JSON.parse(savedUsers);
                } catch(e) {}
            }
        }
    } else {
        const savedUsers = localStorage.getItem('systemUsers');
        if (savedUsers) {
            try {
                allUsers = JSON.parse(savedUsers);
            } catch(e) {}
        }
    }
    
    // Carregar TODAS as contas de TODOS os usuários do Supabase
    let allAccountsByUser = {};
    if (window.supabaseClient) {
        try {
            allAccountsByUser = await loadAllAccountsFromSupabase();
        } catch(e) {
            console.error('Erro ao carregar todas as contas do Supabase:', e);
        }
    }
    
    // Coletar contas de todos os usuários
    const userRankings = [];
    
    // Função para obter avatar de um usuário
    function getUserAvatar(username) {
        const userProfileKey = `userData_${username}_profile`;
        const userProfile = localStorage.getItem(userProfileKey);
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                if (profile.avatarUrl) return profile.avatarUrl;
                if (profile.avatar !== undefined) {
                    if (profile.avatar === 0) {
                        return 'https://flagcdn.com/w160/cn.png';
                    } else {
                        const avatarStyles = [
                            'adventurer', 'adventurer-neutral', 'avataaars', 'big-ears', 'big-ears-neutral',
                            'big-smile', 'bottts', 'croodles', 'croodles-neutral', 'fun-emoji',
                            'icons', 'identicon', 'lorelei', 'lorelei-neutral', 'micah',
                            'miniavs', 'notionists', 'open-peeps', 'personas', 'pixel-art',
                            'shapes', 'thumbs'
                        ];
                        const styleIndex = (profile.avatar - 1) % avatarStyles.length;
                        const style = avatarStyles[styleIndex];
                        const seed = `avatar-${profile.avatar}-${username}`;
                        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
                    }
                }
            } catch(e) {}
        }
        return 'https://flagcdn.com/w160/cn.png';
    }
    
    // Para cada usuário, calcular seu lucro
    allUsers.forEach(user => {
        const username = user.username;
        
        // Tentar usar contas do Supabase primeiro, depois localStorage
        let userAccounts = allAccountsByUser[username] || [];
        
        // Se não tiver no Supabase, tentar localStorage
        if (userAccounts.length === 0) {
            const userAccountsKey = `userData_${username}_accounts`;
            const userAccountsData = localStorage.getItem(userAccountsKey);
            if (userAccountsData) {
                try {
                    userAccounts = JSON.parse(userAccountsData);
                } catch(e) {}
            }
        }
        
        if (userAccounts.length === 0) return;
        
        try {
            
            // Aplicar filtros de data
            let filteredUserAccounts = userAccounts;
            const filterYear = document.getElementById('filterYear');
            const filterMonth = document.getElementById('filterMonth');
            const filterDay = document.getElementById('filterDay');
            
            if (filterYear && filterYear.value) {
                const year = parseInt(filterYear.value);
                filteredUserAccounts = filteredUserAccounts.filter(account => {
                    const date = new Date(account.date);
                    return date.getFullYear() === year;
                });
            }
            
            if (filterMonth && filterMonth.value !== '') {
                const month = parseInt(filterMonth.value);
                filteredUserAccounts = filteredUserAccounts.filter(account => {
                    const date = new Date(account.date);
                    return date.getMonth() === month;
                });
            }
            
            if (filterDay && filterDay.value) {
                const day = parseInt(filterDay.value);
                filteredUserAccounts = filteredUserAccounts.filter(account => {
                    const date = new Date(account.date);
                    return date.getDate() === day;
                });
            }
            
            if (filteredUserAccounts.length === 0) return;
            
            // Calcular lucro do usuário
            let userProfit = 0;
            let userDepositos = 0, userRedepositos = 0;
            
            filteredUserAccounts.forEach(account => {
                const lucro = ((account.saque || 0) + (account.bau || 0)) - ((account.deposito || 0) + (account.redeposito || 0));
                userProfit += lucro;
                userDepositos += parseFloat(account.deposito) || 0;
                userRedepositos += parseFloat(account.redeposito) || 0;
            });
            
            // Obter despesas operacionais (dos inputs) - apenas para o usuário atual
            // Para outros usuários, não há como saber as despesas operacionais deles
            // então não subtraímos (ou podemos usar as despesas da seção "Gastos" como alternativa)
            let userExpenses = 0;
            
            // Se for o usuário atual, usar despesas operacionais dos inputs
            if (username === currentUser) {
                document.querySelectorAll('.expenses-controls input[type="number"]').forEach(input => {
                    userExpenses += parseFloat(input.value) || 0;
                });
            } else {
                // Para outros usuários, usar despesas da seção "Gastos" se disponível
                const userExpensesKey = `userData_${username}_expenses`;
                const userExpensesData = localStorage.getItem(userExpensesKey);
                
                if (userExpensesData) {
                    try {
                        const expenses = JSON.parse(userExpensesData);
                        expenses.forEach(expense => {
                            userExpenses += parseFloat(expense.value) || 0;
                        });
                    } catch(e) {}
                }
            }
            
            userProfit -= userExpenses;
            const userInvestido = userDepositos + userRedepositos + userExpenses;
            const userROI = userInvestido > 0 ? ((userProfit / userInvestido) * 100) : 0;
            
            userRankings.push({
                username: username,
                profit: userProfit,
                roi: userROI,
                operations: filteredUserAccounts.length,
                avatar: getUserAvatar(username)
            });
        } catch(e) {
            console.error('Erro ao processar contas do usuário:', username, e);
        }
    });
    
    // Ordenar por lucro (maior para menor)
    userRankings.sort((a, b) => b.profit - a.profit);
    
    // Encontrar posição do usuário atual
    const currentUserIndex = userRankings.findIndex(u => u.username === currentUser);
    const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : null;
    
    // Atualizar lista de ranking
    const rankingList = document.getElementById('rankingList');
    if (rankingList) {
        if (userRankings.length === 0) {
            rankingList.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 20px;">Nenhum usuário com operações no período selecionado.</p>';
        } else {
            // Verificar se o usuário atual está em 1º lugar e se a seção foi aberta
            let shouldCelebrate = false;
            if (isSectionOpened && userRankings.length > 0 && userRankings[0].username === currentUser) {
                shouldCelebrate = true;
            }
            
            // Animar confetes e tocar trompetes se o usuário estiver em 1º (apenas no topo)
            if (shouldCelebrate) {
                // Verificar se a biblioteca está disponível
                const confettiFn = window.confetti || (typeof confetti !== 'undefined' ? confetti : null);
                
                if (confettiFn) {
                    // Confetes apenas no topo
                    const duration = 3000;
                    const animationEnd = Date.now() + duration;
                    const defaults = { 
                        startVelocity: 30, 
                        spread: 360, 
                        ticks: 60, 
                        zIndex: 10000,
                        gravity: 0.8,
                        decay: 0.9
                    };

                    function randomInRange(min, max) {
                        return Math.random() * (max - min) + min;
                    }

                    const interval = setInterval(function() {
                        const timeLeft = animationEnd - Date.now();

                        if (timeLeft <= 0) {
                            return clearInterval(interval);
                        }

                        const particleCount = 30 * (timeLeft / duration);
                        // Confetes apenas no topo (y próximo de 0)
                        confettiFn({
                            ...defaults,
                            particleCount,
                            origin: { x: randomInRange(0.2, 0.4), y: 0.1 },
                            angle: randomInRange(45, 135)
                        });
                        confettiFn({
                            ...defaults,
                            particleCount,
                            origin: { x: randomInRange(0.6, 0.8), y: 0.1 },
                            angle: randomInRange(45, 135)
                        });
                    }, 250);
                }
                
                // Som de trompetes (usando Web Audio API) - apenas no topo
                // Tocar sempre que o usuário estiver em 1º, independente dos confetes
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    // Primeira nota (mais aguda para soar como trompete)
                    const oscillator1 = audioContext.createOscillator();
                    const gainNode1 = audioContext.createGain();
                    
                    oscillator1.connect(gainNode1);
                    gainNode1.connect(audioContext.destination);
                    
                    oscillator1.frequency.value = 523.25; // Nota C5
                    oscillator1.type = 'sine';
                    
                    gainNode1.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                    
                    oscillator1.start(audioContext.currentTime);
                    oscillator1.stop(audioContext.currentTime + 0.4);
                    
                    // Segunda nota
                    setTimeout(() => {
                        const osc2 = audioContext.createOscillator();
                        const gain2 = audioContext.createGain();
                        osc2.connect(gain2);
                        gain2.connect(audioContext.destination);
                        osc2.frequency.value = 659.25; // Nota E5
                        osc2.type = 'sine';
                        gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                        osc2.start();
                        osc2.stop(audioContext.currentTime + 0.4);
                    }, 200);
                    
                    // Terceira nota (final)
                    setTimeout(() => {
                        const osc3 = audioContext.createOscillator();
                        const gain3 = audioContext.createGain();
                        osc3.connect(gain3);
                        gain3.connect(audioContext.destination);
                        osc3.frequency.value = 783.99; // Nota G5
                        osc3.type = 'sine';
                        gain3.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                        osc3.start();
                        osc3.stop(audioContext.currentTime + 0.5);
                    }, 400);
                } catch(e) {
                    console.log('Áudio não disponível');
                }
            }
            
            rankingList.innerHTML = userRankings.map((user, index) => {
                const position = index + 1;
                const isCurrentUser = user.username === currentUser;
                
                let positionHTML = '';
                let itemClass = 'ranking-item';
                
                if (position === 1) {
                    positionHTML = '<div class="crown-icon">👑</div>';
                    itemClass += ' first';
                } else if (position === 2) {
                    positionHTML = '<div class="medal-icon">🥈</div>';
                    itemClass += ' second';
                } else if (position === 3) {
                    positionHTML = '<div class="medal-icon">🥉</div>';
                    itemClass += ' third';
                } else {
                    positionHTML = `<div class="rank-number">#${position}</div>`;
                }
                
                // Calcular quanto falta para passar do próximo no ranking
                let nextRankInfo = '';
                if (position === 1) {
                    // Top 1 não precisa mostrar nada
                    nextRankInfo = '';
                } else if (index > 0) {
                    // Pegar o usuário na posição anterior (melhor posição)
                    const nextUser = userRankings[index - 1];
                    const amountNeeded = nextUser.profit - user.profit + 0.01;
                    nextRankInfo = `<span style="color: #a0aec0; font-size: 0.85rem; margin-left: 8px;">• Faltam ${formatCurrency(amountNeeded)} para ${nextUser.username}</span>`;
                }
                
                const avatarImg = user.avatar ? `<img src="${user.avatar}" alt="${user.username}" class="rank-avatar-img">` : `
                    <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="#8b5cf6" opacity="0.2"/>
                        <path d="M16 8C12 8 9 11 9 15C9 17 10 18.5 11 19.5L11 22C11 22.5 11.5 23 12 23H20C20.5 23 21 22.5 21 22V19.5C22 18.5 23 17 23 15C23 11 20 8 16 8Z" fill="#a0aec0"/>
                    </svg>
                `;
                
                return `
                    <div class="${itemClass}" ${isCurrentUser ? 'style="border: 2px solid #8b5cf6;"' : ''}>
                        <div class="rank-position">
                            ${positionHTML}
                        </div>
                        <div class="rank-avatar">
                            ${avatarImg}
                        </div>
                        <div class="rank-info">
                            <div class="rank-name">${user.username}${isCurrentUser ? ' <span style="color: #8b5cf6;">(Você)</span>' : ''}</div>
                            <div class="rank-stats">${user.operations} ${user.operations === 1 ? 'operação' : 'operações'}${nextRankInfo}</div>
                        </div>
                        <div class="rank-value">
                            <div class="rank-amount">${formatCurrency(user.profit)}</div>
                            <div class="rank-change ${user.roi >= 0 ? 'positive' : ''}">${user.roi >= 0 ? '+' : ''}${user.roi.toFixed(0)}% ROI</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    // Calcular próximo no ranking
    const nextRankingCard = document.getElementById('nextRankingCard');
    if (nextRankingCard && currentUserRank && currentUserRank > 1 && userRankings.length > 1) {
        const nextUser = userRankings[currentUserRank - 2]; // -2 porque index começa em 0
        const currentUserData = userRankings[currentUserIndex];
        const amountNeeded = nextUser.profit - currentUserData.profit + 0.01;
        
        nextRankingCard.style.display = 'block';
        const nextRankingText = document.getElementById('nextRankingText');
        const nextRankingBar = document.getElementById('nextRankingBar');
        const nextRankingAmount = document.getElementById('nextRankingAmount');
        
        if (nextRankingText) nextRankingText.textContent = `Faltam ${formatCurrency(amountNeeded)} para passar ${nextUser.username}`;
        if (nextRankingBar) {
            const progress = Math.min((currentUserData.profit / nextUser.profit) * 100, 100);
            nextRankingBar.style.width = `${progress}%`;
        }
        if (nextRankingAmount) nextRankingAmount.textContent = formatCurrency(amountNeeded);
    } else if (nextRankingCard) {
        nextRankingCard.style.display = 'none';
    }
}

// ============================================
// CALCULATOR
// ============================================
let calcValue = '0';
let calcPreviousValue = null;
let calcCurrentOperation = null;
let calcWaitingForValue = false;

function calcInput(num) {
    if (calcWaitingForValue) {
        calcValue = num;
        calcWaitingForValue = false;
    } else {
        calcValue = calcValue === '0' ? num : calcValue + num;
    }
    updateCalcDisplay();
}

function calcSetOperation(op) {
    const inputValue = parseFloat(calcValue);
    
    if (calcPreviousValue === null) {
        calcPreviousValue = inputValue;
    } else if (calcCurrentOperation) {
        const currentValue = calcPreviousValue || 0;
        const newValue = performCalcOperation(currentValue, inputValue, calcCurrentOperation);
        
        calcValue = String(newValue);
        calcPreviousValue = newValue;
        updateCalcDisplay();
    }
    
    calcWaitingForValue = true;
    calcCurrentOperation = op;
}

function performCalcOperation(prev, current, op) {
    switch(op) {
        case '+':
            return prev + current;
        case '-':
            return prev - current;
        case '*':
            return prev * current;
        case '/':
            return current !== 0 ? prev / current : 0;
        default:
            return current;
    }
}

function calcEquals() {
    if (calcCurrentOperation && calcPreviousValue !== null) {
        const inputValue = parseFloat(calcValue);
        const newValue = performCalcOperation(calcPreviousValue, inputValue, calcCurrentOperation);
        
        calcValue = String(newValue);
        calcPreviousValue = null;
        calcCurrentOperation = null;
        calcWaitingForValue = true;
        updateCalcDisplay();
    }
}

function calcClear() {
    calcValue = '0';
    calcPreviousValue = null;
    calcCurrentOperation = null;
    calcWaitingForValue = false;
    updateCalcDisplay();
}

function calcClearEntry() {
    calcValue = '0';
    updateCalcDisplay();
}

function calcBackspace() {
    calcValue = calcValue.length > 1 ? calcValue.slice(0, -1) : '0';
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const display = document.getElementById('calcDisplay');
    if (display) {
        const num = parseFloat(calcValue);
        if (!isNaN(num)) {
            display.textContent = num % 1 === 0 ? num.toString() : num.toFixed(10).replace(/\.?0+$/, '');
        } else {
            display.textContent = calcValue;
        }
    }
}

// ============================================
// PROXY MANAGEMENT
// ============================================
async function loadProxies() {
    // Tentar carregar do Supabase primeiro
    if (window.supabaseClient && currentUser) {
        try {
            const supabaseProxies = await loadProxiesFromSupabase();
            if (supabaseProxies.length > 0) {
                proxies = supabaseProxies;
                // Sincronizar com localStorage como cache
                localStorage.setItem(getUserDataKey('proxies'), JSON.stringify(proxies));
            } else {
                // Se não tiver no Supabase, tentar localStorage
                const key = getUserDataKey('proxies');
                const saved = localStorage.getItem(key);
                if (saved) {
                    try {
                        proxies = JSON.parse(saved);
                    } catch(e) {
                        proxies = [];
                    }
                } else {
                    proxies = [];
                }
            }
        } catch (error) {
            console.error('Erro ao carregar proxies do Supabase, usando localStorage:', error);
            // Fallback para localStorage
            const key = getUserDataKey('proxies');
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    proxies = JSON.parse(saved);
                } catch(e) {
                    proxies = [];
                }
            } else {
                proxies = [];
            }
        }
    } else {
        // Se não tiver Supabase ou usuário, usar localStorage
        const key = currentUser ? getUserDataKey('proxies') : 'proxies';
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                proxies = JSON.parse(saved);
            } catch(e) {
                proxies = [];
            }
        } else {
            proxies = [];
        }
    }
    updateProxyList();
}

async function saveProxies() {
    // Salvar no localStorage primeiro (cache rápido)
    if (currentUser) {
        localStorage.setItem(getUserDataKey('proxies'), JSON.stringify(proxies));
    } else {
        localStorage.setItem('proxies', JSON.stringify(proxies));
    }
    
    // Sincronizar com Supabase (em background)
    if (window.supabaseClient && currentUser) {
        try {
            await saveProxiesToSupabase();
        } catch (error) {
            console.error('Erro ao sincronizar proxies com Supabase:', error);
        }
    }
}

function updateProxyList() {
    const proxyList = document.getElementById('proxyList');
    if (!proxyList) return;
    
    if (proxies.length === 0) {
        proxyList.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 20px;">Nenhum proxy adicionado ainda.</p>';
        return;
    }
    
    proxyList.innerHTML = proxies.map((proxy, index) => `
        <div class="account-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
            <div>
                ${proxy.name ? `<strong style="color: #fff;">${proxy.name}</strong>` : ''}
                <p style="color: #a0aec0; margin: ${proxy.name ? '5px' : '0'} 0 0 0; font-size: 14px;">${proxy.address}</p>
            </div>
            <button class="btn-primary" onclick="deleteProxy(${index})" style="background: #ef4444; padding: 8px 15px; font-size: 12px;">Remover</button>
        </div>
    `).join('');
}

async function addProxy() {
    const proxyName = document.getElementById('proxyName');
    const proxyInput = document.getElementById('proxyInput');
    if (!proxyInput) return;
    
    const name = proxyName ? proxyName.value.trim() : '';
    const inputValue = proxyInput.value.trim();
    
    if (!inputValue) {
        alert('Por favor, digite um ou mais endereços de proxy.');
        return;
    }
    
    // Dividir por quebras de linha e processar cada proxy
    const addresses = inputValue.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    if (addresses.length === 0) {
        alert('Por favor, digite pelo menos um endereço de proxy válido.');
        return;
    }
    
    let addedCount = 0;
    addresses.forEach((address, index) => {
        if (address) {
            // Se houver nome e múltiplos proxies, adiciona número ao nome
            const finalName = addresses.length > 1 && name 
                ? `${name} ${index + 1}` 
                : name;
            
            proxies.push({
                id: Date.now() + index, // Garante IDs únicos
                name: finalName,
                address: address,
                date: new Date().toISOString()
            });
            addedCount++;
        }
    });
    
    await saveProxies();
    updateProxyList();
    
    if (proxyName) proxyName.value = '';
    proxyInput.value = '';
    
    if (addedCount > 0) {
        alert(`${addedCount} proxy(s) adicionado(s) com sucesso!`);
    }
}

async function deleteProxy(index) {
    if (confirm('Tem certeza que deseja remover este proxy?')) {
        proxies.splice(index, 1);
        await saveProxies();
        updateProxyList();
    }
}

// ============================================
// PIX KEYS MANAGEMENT
// ============================================
async function loadPixKeys() {
    // Tentar carregar do Supabase primeiro
    if (window.supabaseClient && currentUser) {
        try {
            const supabasePixKeys = await loadPixKeysFromSupabase();
            if (supabasePixKeys.length > 0) {
                pixKeys = supabasePixKeys;
                // Sincronizar com localStorage como cache
                localStorage.setItem(getUserDataKey('pixKeys'), JSON.stringify(pixKeys));
            } else {
                // Se não tiver no Supabase, tentar localStorage
                const key = getUserDataKey('pixKeys');
                const saved = localStorage.getItem(key);
                if (saved) {
                    try {
                        pixKeys = JSON.parse(saved);
                    } catch(e) {
                        pixKeys = [];
                    }
                } else {
                    pixKeys = [];
                }
            }
        } catch (error) {
            console.error('Erro ao carregar chaves PIX do Supabase, usando localStorage:', error);
            // Fallback para localStorage
            const key = getUserDataKey('pixKeys');
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    pixKeys = JSON.parse(saved);
                } catch(e) {
                    pixKeys = [];
                }
            } else {
                pixKeys = [];
            }
        }
    } else {
        // Se não tiver Supabase ou usuário, usar localStorage
        const key = currentUser ? getUserDataKey('pixKeys') : 'pixKeys';
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                pixKeys = JSON.parse(saved);
            } catch(e) {
                pixKeys = [];
            }
        } else {
            pixKeys = [];
        }
    }
    updatePixKeysList();
}

async function savePixKeys() {
    // Salvar no localStorage primeiro (cache rápido)
    if (currentUser) {
        localStorage.setItem(getUserDataKey('pixKeys'), JSON.stringify(pixKeys));
    } else {
        localStorage.setItem('pixKeys', JSON.stringify(pixKeys));
    }
    
    // Sincronizar com Supabase (em background)
    if (window.supabaseClient && currentUser) {
        try {
            await savePixKeysToSupabase();
        } catch (error) {
            console.error('Erro ao sincronizar chaves PIX com Supabase:', error);
        }
    }
}

function updatePixKeysList() {
    const pixKeysList = document.getElementById('pixKeysList');
    if (!pixKeysList) return;
    
    if (pixKeys.length === 0) {
        pixKeysList.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 20px;">Nenhuma chave PIX adicionada ainda.</p>';
        return;
    }
    
    const typeNames = {
        'cpf': 'CPF',
        'email': 'E-mail',
        'telefone': 'Telefone',
        'aleatoria': 'Chave Aleatória'
    };
    
    pixKeysList.innerHTML = pixKeys.map((key, index) => `
        <div class="account-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
            <div>
                <strong style="color: #fff;">${typeNames[key.type] || key.type}</strong>
                <p style="color: #a0aec0; margin: 5px 0; font-size: 14px;">${key.key}</p>
                ${key.ownerName ? `<p style="color: #a0aec0; margin: 3px 0; font-size: 12px;">${key.ownerName}</p>` : ''}
                ${key.bankName ? `<p style="color: #8b5cf6; margin: 0; font-size: 12px; font-weight: 500;">${key.bankName}</p>` : ''}
            </div>
            <button class="btn-primary" onclick="deletePixKey(${index})" style="background: #ef4444; padding: 8px 15px; font-size: 12px;">Remover</button>
        </div>
    `).join('');
}

async function addPixKey() {
    const pixKeyType = document.getElementById('pixKeyType');
    const pixKeyInput = document.getElementById('pixKeyInput');
    const pixOwnerName = document.getElementById('pixOwnerName');
    const pixBankName = document.getElementById('pixBankName');
    
    if (!pixKeyType || !pixKeyInput) return;
    
    const type = pixKeyType.value;
    const key = pixKeyInput.value.trim();
    const ownerName = pixOwnerName ? pixOwnerName.value.trim() : '';
    const bankName = pixBankName ? pixBankName.value.trim() : '';
    
    if (!key) {
        alert('Por favor, digite uma chave PIX.');
        return;
    }
    
    pixKeys.push({
        id: Date.now(),
        type: type,
        key: key,
        ownerName: ownerName,
        bankName: bankName,
        date: new Date().toISOString()
    });
    
    await savePixKeys();
    updatePixKeysList();
    pixKeyInput.value = '';
    if (pixOwnerName) pixOwnerName.value = '';
    if (pixBankName) pixBankName.value = '';
}

async function deletePixKey(index) {
    if (confirm('Tem certeza que deseja remover esta chave PIX?')) {
        pixKeys.splice(index, 1);
        await savePixKeys();
        updatePixKeysList();
    }
}

// ============================================
// EXPENSES MANAGEMENT
// ============================================
async function loadExpenses() {
    // Tentar carregar do Supabase primeiro
    if (window.supabaseClient && currentUser) {
        try {
            const supabaseExpenses = await loadExpensesFromSupabase();
            if (supabaseExpenses.length > 0) {
                expenses = supabaseExpenses;
                // Sincronizar com localStorage como cache
                localStorage.setItem(getUserDataKey('expenses'), JSON.stringify(expenses));
            } else {
                // Se não tiver no Supabase, tentar localStorage
                const key = getUserDataKey('expenses');
                const saved = localStorage.getItem(key);
                if (saved) {
                    try {
                        expenses = JSON.parse(saved);
                    } catch(e) {
                        expenses = [];
                    }
                } else {
                    expenses = [];
                }
            }
        } catch (error) {
            console.error('Erro ao carregar gastos do Supabase, usando localStorage:', error);
            // Fallback para localStorage
            const key = getUserDataKey('expenses');
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    expenses = JSON.parse(saved);
                } catch(e) {
                    expenses = [];
                }
            } else {
                expenses = [];
            }
        }
    } else {
        // Se não tiver Supabase ou usuário, usar localStorage
        const key = currentUser ? getUserDataKey('expenses') : 'expenses';
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                expenses = JSON.parse(saved);
            } catch(e) {
                expenses = [];
            }
        } else {
            expenses = [];
        }
    }
    updateExpensesList();
}

async function saveExpenses() {
    // Salvar no localStorage primeiro (cache rápido)
    if (currentUser) {
        localStorage.setItem(getUserDataKey('expenses'), JSON.stringify(expenses));
    } else {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }
    
    // Sincronizar com Supabase (em background)
    if (window.supabaseClient && currentUser) {
        try {
            await saveExpensesToSupabase();
        } catch (error) {
            console.error('Erro ao sincronizar gastos com Supabase:', error);
        }
    }
}

function updateExpensesList() {
    const expensesList = document.getElementById('expensesList');
    if (!expensesList) return;
    
    // Gastos sempre visível no menu (como Proxy e Chaves PIX)
    // Não precisa esconder o menu
    
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 20px;">Nenhum gasto registrado ainda.</p>';
        return;
    }
    
    const total = expenses.reduce((sum, exp) => sum + (parseFloat(exp.value) || 0), 0);
    
    expensesList.innerHTML = `
        <div style="margin-bottom: 20px; padding: 15px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
            <strong style="color: #fff; font-size: 18px;">Total de Gastos: ${formatCurrency(total)}</strong>
        </div>
        ${expenses.map((expense, index) => {
            const date = new Date(expense.date);
            const dateStr = date.toLocaleDateString('pt-BR');
            return `
                <div class="account-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
                    <div>
                        <strong style="color: #fff;">${expense.description || 'Sem descrição'}</strong>
                        <p style="color: #a0aec0; margin: 5px 0; font-size: 14px;">${formatCurrency(parseFloat(expense.value) || 0)}</p>
                        <p style="color: #a0aec0; margin: 0; font-size: 12px;">${dateStr}</p>
                    </div>
                    <button class="btn-primary" onclick="deleteExpense(${index})" style="background: #ef4444; padding: 8px 15px; font-size: 12px;">Remover</button>
                </div>
            `;
        }).join('')}
    `;
}

async function addExpense() {
    const expenseDescription = document.getElementById('expenseDescription');
    const expenseValue = document.getElementById('expenseValue');
    const expenseDate = document.getElementById('expenseDate');
    
    if (!expenseDescription || !expenseValue || !expenseDate) return;
    
    const description = expenseDescription.value.trim();
    const value = parseFloat(expenseValue.value) || 0;
    const date = expenseDate.value || new Date().toISOString().split('T')[0];
    
    if (!description) {
        alert('Por favor, digite uma descrição para o gasto.');
        return;
    }
    
    if (value <= 0) {
        alert('Por favor, digite um valor válido maior que zero.');
        return;
    }
    
    expenses.push({
        id: Date.now(),
        description: description,
        value: value,
        date: date,
        createdAt: new Date().toISOString()
    });
    
    await saveExpenses();
    updateExpensesList();
    expenseDescription.value = '';
    expenseValue.value = '';
    expenseDate.value = '';
}

async function deleteExpense(index) {
    if (confirm('Tem certeza que deseja remover este gasto?')) {
        expenses.splice(index, 1);
        await saveExpenses();
        updateExpensesList();
    }
}

// ============================================
// PLATFORMS MANAGEMENT (GLOBAL)
// ============================================
async function loadPlatforms() {
    // Tentar carregar do Supabase primeiro
    if (window.supabaseClient) {
        try {
            const supabasePlatforms = await loadPlatformsFromSupabase();
            if (supabasePlatforms.length > 0) {
                platforms = supabasePlatforms;
                // Sincronizar com localStorage como cache
                localStorage.setItem('platforms', JSON.stringify(platforms));
            } else {
                // Se não tiver no Supabase, tentar localStorage
                const saved = localStorage.getItem('platforms');
                if (saved) {
                    try {
                        platforms = JSON.parse(saved);
                    } catch(e) {
                        platforms = [];
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar plataformas do Supabase, usando localStorage:', error);
            const saved = localStorage.getItem('platforms');
            if (saved) {
                try {
                    platforms = JSON.parse(saved);
                } catch(e) {
                    platforms = [];
                }
            }
        }
    } else {
        // Se Supabase não estiver disponível, usar localStorage
        const saved = localStorage.getItem('platforms');
        if (saved) {
            try {
                platforms = JSON.parse(saved);
            } catch(e) {
                platforms = [];
            }
        }
    }
    updatePlatformsList();
}

async function savePlatforms() {
    // Salvar no localStorage primeiro (cache rápido)
    localStorage.setItem('platforms', JSON.stringify(platforms));
    
    // Sincronizar com Supabase (em background)
    if (window.supabaseClient) {
        try {
            await savePlatformsToSupabase();
        } catch (error) {
            console.error('Erro ao sincronizar plataformas com Supabase:', error);
        }
    }
}

function updatePlatformsList() {
    const platformsList = document.getElementById('platformsList');
    if (!platformsList) return;
    
    if (platforms.length === 0) {
        platformsList.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 20px;">Nenhuma plataforma adicionada ainda.</p>';
        return;
    }
    
    const statusColors = {
        'passando': '#10b981', // verde
        'instavel': '#f59e0b', // amarelo/laranja
        'indisponivel': '#ef4444' // vermelho
    };
    
    const statusLabels = {
        'passando': 'Passando',
        'instavel': 'Instável',
        'indisponivel': 'Indisponível'
    };
    
    platformsList.innerHTML = platforms.map((platform, index) => {
        const createdDate = new Date(platform.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const createdBy = platform.createdBy || 'Usuário';
        let updateInfo = '';
        
        if (platform.updatedAt && platform.updatedBy) {
            const updatedDate = new Date(platform.updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            updateInfo = `<p style="color: #10b981; margin: 3px 0 0 0; font-size: 12px;">Atualizado por <strong>${platform.updatedBy}</strong> em ${updatedDate}</p>`;
        }
        
        const descriptionHtml = platform.description ? `<p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 13px; font-style: italic; line-height: 1.4;">${platform.description}</p>` : '';
        
        return `
        <div class="account-item" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 15px; margin-bottom: 10px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
            <div style="flex: 1;">
                <strong style="color: #fff; font-size: 16px;">${platform.name}</strong>
                <p style="color: #a0aec0; margin: 5px 0; font-size: 14px;">
                    Status: <span style="color: ${statusColors[platform.status] || '#a0aec0'}; font-weight: 500;">${statusLabels[platform.status] || platform.status}</span>
                </p>
                ${descriptionHtml}
                <p style="color: #8b5cf6; margin: 8px 0 0 0; font-size: 12px;">Criado por <strong>${createdBy}</strong> em ${createdDate}</p>
                ${updateInfo}
            </div>
            <div style="display: flex; gap: 10px; margin-left: 15px;">
                <button class="btn-primary" onclick="editPlatform(${index})" style="background: #3b82f6; padding: 8px 15px; font-size: 12px;">Editar</button>
                <button class="btn-primary" onclick="deletePlatform(${index})" style="background: #ef4444; padding: 8px 15px; font-size: 12px;">Apagar</button>
            </div>
        </div>
        `;
    }).join('');
}

function addPlatform() {
    const platformName = document.getElementById('platformName');
    const platformStatus = document.getElementById('platformStatus');
    const platformDescription = document.getElementById('platformDescription');
    
    if (!platformName || !platformStatus) return;
    
    const name = platformName.value.trim();
    const status = platformStatus.value;
    const description = platformDescription ? platformDescription.value.trim() : '';
    
    if (!name) {
        alert('Por favor, digite o nome da plataforma.');
        return;
    }
    
    // Obter o username do usuário logado
    let username = currentUser || 'weslleyleno60';
    
    // Se não tiver currentUser, tentar pegar do perfil
    if (!currentUser) {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                if (profile.username) username = profile.username;
            } catch(e) {}
        }
    }
    
    platforms.push({
        id: Date.now(),
        name: name,
        status: status,
        description: description,
        date: new Date().toISOString(),
        createdBy: username
    });
    
    savePlatforms();
    updatePlatformsList();
    platformName.value = '';
    platformStatus.value = 'passando';
    if (platformDescription) platformDescription.value = '';
}

function editPlatform(index) {
    if (index < 0 || index >= platforms.length) return;
    
    const platform = platforms[index];
    const platformName = document.getElementById('platformName');
    const platformStatus = document.getElementById('platformStatus');
    const platformDescription = document.getElementById('platformDescription');
    
    if (!platformName || !platformStatus) return;
    
    // Preencher os campos com os dados da plataforma
    platformName.value = platform.name;
    platformStatus.value = platform.status;
    if (platformDescription) platformDescription.value = platform.description || '';
    
    // Focar no campo de nome
    platformName.focus();
    
    // Alterar o botão para "Salvar Edição" e salvar o índice
    const addBtn = document.getElementById('addPlatformBtn');
    if (addBtn) {
        addBtn.textContent = 'Salvar Edição';
        addBtn.setAttribute('data-editing-index', index.toString());
    }
}

async function deletePlatform(index) {
    if (confirm('Tem certeza que deseja remover esta plataforma?')) {
        const platformName = platforms[index].name;
        platforms.splice(index, 1);
        
        // Deletar do Supabase
        if (window.supabaseClient) {
            await deletePlatformFromSupabase(platformName);
        }
        
        savePlatforms();
        updatePlatformsList();
    }
}

// ============================================
// ADMIN MANAGEMENT
// ============================================
async function checkAdminStatus() {
    if (!currentUser) {
        isAdmin = false;
        const adminNavItem = document.getElementById('adminNavItem');
        if (adminNavItem) adminNavItem.style.display = 'none';
        // Garantir que menu Gastos esteja visível
        const gastosNavItem = document.getElementById('gastosNavItem');
        if (gastosNavItem) gastosNavItem.style.display = '';
        return;
    }
    
    // Verificar se o usuário atual é o admin padrão
    if (currentUser === 'weslleyleno60') {
        isAdmin = true;
    } else {
        // Verificar no Supabase primeiro
        if (window.supabaseClient) {
            try {
                const supabaseUsers = await loadUsersFromSupabase();
                const user = supabaseUsers.find(u => u.username === currentUser);
                isAdmin = user ? (user.isAdmin === true) : false;
                
                // Sincronizar com localStorage
                if (supabaseUsers.length > 0) {
                    localStorage.setItem('systemUsers', JSON.stringify(supabaseUsers));
                }
            } catch(e) {
                // Fallback para localStorage
                const savedUsers = localStorage.getItem('systemUsers');
                if (savedUsers) {
                    try {
                        const allUsers = JSON.parse(savedUsers);
                        const user = allUsers.find(u => u.username === currentUser);
                        isAdmin = user ? (user.isAdmin === true) : false;
                    } catch(e2) {
                        isAdmin = false;
                    }
                } else {
                    isAdmin = false;
                }
            }
        } else {
            // Se Supabase não disponível, usar localStorage
            const savedUsers = localStorage.getItem('systemUsers');
            if (savedUsers) {
                try {
                    const allUsers = JSON.parse(savedUsers);
                    const user = allUsers.find(u => u.username === currentUser);
                    isAdmin = user ? (user.isAdmin === true) : false;
                } catch(e) {
                    isAdmin = false;
                }
            } else {
                isAdmin = false;
            }
        }
    }
    
    // Mostrar/ocultar menu de admin
    const adminNavItem = document.getElementById('adminNavItem');
    if (adminNavItem) {
        adminNavItem.style.display = isAdmin ? 'flex' : 'none';
    }
    
    // Garantir que menu Gastos esteja sempre visível
    const gastosNavItem = document.getElementById('gastosNavItem');
    if (gastosNavItem) {
        gastosNavItem.style.display = '';
    }
}

function getAdminUsers() {
    const savedUsers = localStorage.getItem('systemUsers');
    if (savedUsers) {
        try {
            const allUsers = JSON.parse(savedUsers);
            return allUsers.filter(u => u.isAdmin === true);
        } catch(e) {
            return [];
        }
    }
    return [];
}

// Carregar usuários do Supabase
async function loadUsersFromSupabase() {
    if (!window.supabaseClient) return [];
    
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('id, username, is_admin, created_at')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Erro ao carregar usuários do Supabase:', error);
            return [];
        }
        
        if (data) {
            return data.map(user => ({
                id: user.id,
                username: user.username,
                isAdmin: user.is_admin || false,
                date: user.created_at
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Erro ao carregar usuários do Supabase:', error);
        return [];
    }
}

async function loadUsers() {
    // Tentar carregar do Supabase primeiro
    if (window.supabaseClient) {
        try {
            const supabaseUsers = await loadUsersFromSupabase();
            if (supabaseUsers.length > 0) {
                // Sincronizar TODOS os usuários no localStorage (incluindo admins)
                localStorage.setItem('systemUsers', JSON.stringify(supabaseUsers));
                // Filtrar apenas usuários não-admin para a lista (admin não aparece na lista)
                users = supabaseUsers.filter(u => !u.isAdmin);
            } else {
                // Se não tiver no Supabase, tentar localStorage
                const saved = localStorage.getItem('systemUsers');
                if (saved) {
                    try {
                        const allUsers = JSON.parse(saved);
                        // Filtrar apenas usuários não-admin para a lista
                        users = allUsers.filter(u => !u.isAdmin);
                    } catch(e) {
                        users = [];
                    }
                } else {
                    users = [];
                }
            }
        } catch (error) {
            console.error('Erro ao carregar usuários do Supabase, usando localStorage:', error);
            const saved = localStorage.getItem('systemUsers');
            if (saved) {
                try {
                    const allUsers = JSON.parse(saved);
                    // Filtrar apenas usuários não-admin para a lista
                    users = allUsers.filter(u => !u.isAdmin);
                } catch(e) {
                    users = [];
                }
            } else {
                users = [];
            }
        }
    } else {
        // Se Supabase não estiver disponível, usar localStorage
        const saved = localStorage.getItem('systemUsers');
        if (saved) {
            try {
                const allUsers = JSON.parse(saved);
                // Filtrar apenas usuários não-admin para a lista
                users = allUsers.filter(u => !u.isAdmin);
            } catch(e) {
                users = [];
            }
        } else {
            users = [];
        }
    }
    updateUsersList();
}

function saveUsers() {
    localStorage.setItem('systemUsers', JSON.stringify(users));
}

function updateUsersList() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    // Filtrar apenas usuários não-admin (admin não aparece na lista)
    const regularUsers = users.filter(u => !u.isAdmin);
    
    if (regularUsers.length === 0) {
        usersList.innerHTML = `
            <div class="card-header-section" style="margin-bottom: 20px;">
                <h3>Usuários Cadastrados</h3>
                <p>Lista de todos os usuários do sistema</p>
            </div>
            <p style="color: #a0aec0; text-align: center; padding: 20px;">Nenhum usuário cadastrado ainda.</p>
        `;
        return;
    }
    
    usersList.innerHTML = `
        <div class="card-header-section" style="margin-bottom: 20px;">
            <h3>Usuários Cadastrados</h3>
            <p>Lista de todos os usuários do sistema</p>
        </div>
        ${regularUsers.map((user, index) => {
            const createdDate = new Date(user.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const userId = user.id;
            const passwordVisible = `passwordVisible_${userId}`;
            return `
                <div class="account-item" style="padding: 15px; margin-bottom: 10px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <div style="flex: 1;">
                            <strong style="color: #fff; font-size: 16px;">${user.username}</strong>
                            <p style="color: #8b5cf6; margin: 5px 0; font-size: 12px;">Cadastrado em: ${createdDate}</p>
                            <div style="margin-top: 8px;">
                                <p style="color: #a0aec0; margin: 3px 0; font-size: 12px;">
                                    <strong>Senha:</strong> 
                                    <span id="userPassword_${userId}" style="font-family: monospace;">${'*'.repeat(user.password.length)}</span>
                                    <button type="button" onclick="toggleUserPassword('${userId}')" style="background: none; border: none; color: var(--purple-primary); cursor: pointer; margin-left: 8px; font-size: 12px;">
                                        <i class="fas fa-eye" id="userPasswordIcon_${userId}"></i>
                                    </button>
                                </p>
                            </div>
                            ${user.permissions ? `
                                <div style="margin-top: 10px;">
                                    <p style="color: #a0aec0; margin: 5px 0; font-size: 12px;"><strong>Permissões:</strong></p>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px;">
                                        ${user.permissions.dashboard ? '<span style="background: rgba(139, 92, 246, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px;">Dashboard</span>' : ''}
                                        ${user.permissions.controleDiario ? '<span style="background: rgba(139, 92, 246, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px;">Controle Diário</span>' : ''}
                                        ${user.permissions.ranking ? '<span style="background: rgba(139, 92, 246, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px;">Ranking</span>' : ''}
                                        ${user.permissions.plataformas ? '<span style="background: rgba(139, 92, 246, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px;">Plataformas</span>' : ''}
                                        ${user.permissions.proxy ? '<span style="background: rgba(139, 92, 246, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px;">Proxy</span>' : ''}
                                        ${user.permissions.chavesPix ? '<span style="background: rgba(139, 92, 246, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px;">Chaves PIX</span>' : ''}
                                        ${user.permissions.gastos ? '<span style="background: rgba(139, 92, 246, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px;">Gastos</span>' : ''}
                                        ${user.permissions.perfil ? '<span style="background: rgba(139, 92, 246, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px;">Perfil</span>' : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 10px; margin-left: 15px;">
                            <button class="btn-primary" onclick="editUser('${userId}')" style="background: #3b82f6; padding: 8px 15px; font-size: 12px;">Editar</button>
                            <button class="btn-primary" onclick="deleteUser('${userId}')" style="background: #ef4444; padding: 8px 15px; font-size: 12px;">Remover</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

async function addUser() {
    const newUsername = document.getElementById('newUsername');
    const newUserPassword = document.getElementById('newUserPassword');
    const newUserPasswordConfirm = document.getElementById('newUserPasswordConfirm');
    const addUserBtn = document.getElementById('addUserBtn');
    
    if (!newUsername || !newUserPassword || !newUserPasswordConfirm) return;
    
    const username = newUsername.value.trim();
    const password = newUserPassword.value;
    const passwordConfirm = newUserPasswordConfirm.value;
    const editingId = addUserBtn ? addUserBtn.getAttribute('data-editing-id') : null;
    
    if (!username) {
        alert('Por favor, digite o nome de usuário.');
        return;
    }
    
    if (!password) {
        alert('Por favor, digite uma senha.');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('As senhas não coincidem.');
        return;
    }
    
    // Dar todas as permissões por padrão (exceto admin)
    const permissions = {
        dashboard: true,
        controleDiario: true,
        ranking: true,
        plataformas: true,
        proxy: true,
        chavesPix: true,
        gastos: true,
        perfil: true
    };
    
    if (editingId) {
        // EDITANDO USUÁRIO EXISTENTE
        const userIndex = users.findIndex(u => u.id === editingId);
        if (userIndex !== -1) {
            // Verificar se o username mudou e não conflita
            if (users[userIndex].username.toLowerCase() !== username.toLowerCase()) {
                const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== editingId);
                if (existingUser) {
                    alert('Este nome de usuário já está cadastrado.');
                    return;
                }
                
                // Verificar se não é o admin padrão
                const savedProfile = localStorage.getItem('userProfile');
                if (savedProfile) {
                    try {
                        const profile = JSON.parse(savedProfile);
                        if (profile.username && profile.username.toLowerCase() === username.toLowerCase()) {
                            alert('Este nome de usuário já está em uso pelo administrador.');
                            return;
                        }
                    } catch(e) {}
                }
            }
            
            // Atualizar usuário
            users[userIndex].username = username;
            users[userIndex].password = password;
            users[userIndex].permissions = permissions;
            
            saveUsers();
            
            // Sincronizar com Supabase
            if (window.supabaseClient) {
                try {
                    await createOrUpdateUserInSupabase(username, password, false);
                    console.log('✅ Usuário atualizado no Supabase');
                } catch (error) {
                    console.error('Erro ao atualizar usuário no Supabase:', error);
                }
            }
            
            updateUsersList();
            
            // Limpar campos e restaurar botão
            newUsername.value = '';
            newUserPassword.value = '';
            newUserPasswordConfirm.value = '';
            if (addUserBtn) {
                addUserBtn.textContent = 'Cadastrar Usuário';
                addUserBtn.removeAttribute('data-editing-id');
            }
            
            alert('Usuário atualizado com sucesso!');
            return;
        }
    }
    
    // CRIANDO NOVO USUÁRIO
    // Verificar se o usuário já existe na lista
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        alert('Este nome de usuário já está cadastrado.');
        return;
    }
    
    // Verificar se não é o admin padrão
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            if (profile.username && profile.username.toLowerCase() === username.toLowerCase()) {
                alert('Este nome de usuário já está em uso pelo administrador.');
                return;
            }
        } catch(e) {}
    }
    
    // Adicionar novo usuário (não é admin)
    users.push({
        id: Date.now().toString(),
        username: username,
        password: password, // Em produção, isso deveria ser hash
        isAdmin: false,
        permissions: permissions,
        date: new Date().toISOString()
    });
    
    saveUsers();
    
    // Sincronizar com Supabase
    if (window.supabaseClient) {
        try {
            await createOrUpdateUserInSupabase(username, password, false);
            console.log('✅ Usuário sincronizado com Supabase');
        } catch (error) {
            console.error('Erro ao sincronizar usuário com Supabase:', error);
        }
    }
    
    updateUsersList();
    newUsername.value = '';
    newUserPassword.value = '';
    newUserPasswordConfirm.value = '';
    
    alert('Usuário cadastrado com sucesso!');
}

function toggleUserPassword(userId) {
    const passwordSpan = document.getElementById(`userPassword_${userId}`);
    const passwordIcon = document.getElementById(`userPasswordIcon_${userId}`);
    if (!passwordSpan || !passwordIcon) return;
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (passwordSpan.textContent.includes('*') || passwordSpan.textContent === '') {
        // Mostrar senha
        passwordSpan.textContent = user.password;
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    } else {
        // Ocultar senha
        passwordSpan.textContent = '*'.repeat(user.password.length);
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Preencher os campos com os dados do usuário
    const newUsername = document.getElementById('newUsername');
    const newUserPassword = document.getElementById('newUserPassword');
    const newUserPasswordConfirm = document.getElementById('newUserPasswordConfirm');
    
    if (!newUsername || !newUserPassword || !newUserPasswordConfirm) return;
    
    newUsername.value = user.username;
    newUserPassword.value = user.password;
    newUserPasswordConfirm.value = user.password;
    
    // Preencher permissões
    if (user.permissions) {
        if (document.getElementById('permDashboard')) document.getElementById('permDashboard').checked = user.permissions.dashboard || false;
        if (document.getElementById('permControleDiario')) document.getElementById('permControleDiario').checked = user.permissions.controleDiario || false;
        if (document.getElementById('permRanking')) document.getElementById('permRanking').checked = user.permissions.ranking || false;
        if (document.getElementById('permPlataformas')) document.getElementById('permPlataformas').checked = user.permissions.plataformas || false;
        if (document.getElementById('permProxy')) document.getElementById('permProxy').checked = user.permissions.proxy || false;
        if (document.getElementById('permChavesPix')) document.getElementById('permChavesPix').checked = user.permissions.chavesPix || false;
        if (document.getElementById('permGastos')) document.getElementById('permGastos').checked = user.permissions.gastos || false;
        if (document.getElementById('permPerfil')) document.getElementById('permPerfil').checked = user.permissions.perfil || false;
    } else {
        // Se não tem permissões, marcar todas como true
        if (document.getElementById('permDashboard')) document.getElementById('permDashboard').checked = true;
        if (document.getElementById('permControleDiario')) document.getElementById('permControleDiario').checked = true;
        if (document.getElementById('permRanking')) document.getElementById('permRanking').checked = true;
        if (document.getElementById('permPlataformas')) document.getElementById('permPlataformas').checked = true;
        if (document.getElementById('permProxy')) document.getElementById('permProxy').checked = true;
        if (document.getElementById('permChavesPix')) document.getElementById('permChavesPix').checked = true;
        if (document.getElementById('permGastos')) document.getElementById('permGastos').checked = true;
        if (document.getElementById('permPerfil')) document.getElementById('permPerfil').checked = true;
    }
    
    // Alterar o botão para "Salvar Edição"
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.textContent = 'Salvar Edição';
        addUserBtn.setAttribute('data-editing-id', userId);
    }
    
    // Focar no campo de nome
    newUsername.focus();
}

function deleteUser(userId) {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
        users = users.filter(u => u.id !== userId);
        saveUsers();
        updateUsersList();
        alert('Usuário removido com sucesso!');
    }
}

