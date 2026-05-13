document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    const socket = io();
    let trendChart, pieChart;

    // Stats cache
    let statsData = { total: 0, safe: 0, joki: 0, skip: 0 };

    // DOM Elements
    const tabContents = document.querySelectorAll('.tab-content');
    const navItems = document.querySelectorAll('.nav-item');
    const breadcrumbPage = document.getElementById('breadcrumb-page');
    const miniLogList = document.getElementById('mini-log-list');
    const fullLogList = document.getElementById('full-log-list');

    // Sidebar Mobile Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar && sidebarOverlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('active');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Navigation Logic
    window.showTab = function(tabId, label) {
        // Close sidebar on mobile after clicking item
        if (window.innerWidth <= 1024 && sidebar && sidebarOverlay) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }

        // Update Tabs
        tabContents.forEach(c => {
            c.classList.remove('active');
            if (c.id === 'content-' + tabId) {
                c.classList.add('active');
            }
        });
        
        // Update Sidebar Active State
        navItems.forEach(b => {
            b.classList.remove('active');
            if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId)) {
                b.classList.add('active');
            }
        });

        // Update Breadcrumb
        if (breadcrumbPage && label) {
            breadcrumbPage.innerText = label;
        }

        // Specific Tab Actions
        if (tabId === 'analytics') {
            renderCharts();
        }

        lucide.createIcons();
    };

    function updateStatUI() {
        if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = statsData.total;
        if (document.getElementById('stat-safe')) document.getElementById('stat-safe').innerText = statsData.safe;
        if (document.getElementById('stat-joki')) document.getElementById('stat-joki').innerText = statsData.joki;
        if (document.getElementById('stat-skip')) document.getElementById('stat-skip').innerText = statsData.skip;
    }

    function createLogRow(log, isNew = false) {
        const isJoki = log.classification === 'JOKI';
        return `
            <tr class="log-table-row ${isNew ? 'new-row-pulse' : ''}">
                <td class="log-time-cell" style="vertical-align: top;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${new Date(log.timestamp).toLocaleDateString()}</div>
                    <div style="font-size: 0.8125rem; font-weight: 600; color: var(--text-main);">${new Date(log.timestamp).toLocaleTimeString()}</div>
                </td>
                <td class="log-sender-cell" style="vertical-align: top;">
                    <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-main);">${log.sender_name || 'Anonymous'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${log.sender.split('@')[0]}</div>
                </td>
                <td class="log-message-cell" style="vertical-align: top;">
                    <div class="message-truncate">
                        ${log.message}
                    </div>
                </td>
                <td class="log-status-cell" style="vertical-align: top;">
                    <span class="status-badge ${isJoki ? 'status-joki' : (log.classification === 'SAFE' ? 'status-safe' : 'status-skip')}">
                        ${log.classification}
                    </span>
                </td>
            </tr>
        `;
    }

    function createMiniLogRow(log) {
        const isJoki = log.classification === 'JOKI';
        const icon = isJoki ? 'shield-alert' : (log.classification === 'SAFE' ? 'shield-check' : 'user-check');
        const iconColor = isJoki ? '#ef4444' : (log.classification === 'SAFE' ? '#10b981' : '#f59e0b');
        const bgColor = isJoki ? '#fef2f2' : (log.classification === 'SAFE' ? '#ecfdf5' : '#fffbeb');
        
        return `
            <div class="mini-log-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; border-bottom: 1px solid var(--border); transition: background-color 0.2s;">
                <div style="display: flex; align-items: center; gap: 1.25rem; min-width: 0;">
                    <div style="height: 44px; width: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background-color: ${bgColor};">
                        <i data-lucide="${icon}" style="width: 20px; height: 20px; color: ${iconColor};"></i>
                    </div>
                    <div style="overflow: hidden;">
                        <p style="font-size: 0.9375rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.125rem;">${log.sender_name || 'Anonymous'}</p>
                        <p style="font-size: 0.8125rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px;">${log.message}</p>
                    </div>
                </div>
                <div style="flex-shrink: 0; margin-left: 1rem;">
                    <span class="status-badge ${isJoki ? 'status-joki' : (log.classification === 'SAFE' ? 'status-safe' : 'status-skip')}">
                        ${log.classification}
                    </span>
                </div>
            </div>
        `;
    }

    window.refreshData = async function() {
        try {
            const statsRes = await fetch('/api/stats');
            statsData = await statsRes.json();
            updateStatUI();

            const logsRes = await fetch('/api/logs');
            const logs = await logsRes.json();
            
            if (miniLogList) {
                miniLogList.innerHTML = logs.slice(0, 5).map(createMiniLogRow).join('') || '<div class="p-8 text-center text-gray-500">No logs found.</div>';
            }
            if (fullLogList) {
                fullLogList.innerHTML = logs.map(l => createLogRow(l)).join('');
            }
            
            lucide.createIcons();
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    };

    // LISTEN FOR REAL-TIME UPDATES
    socket.on('new-log', (log) => {
        // Update stats
        statsData.total++;
        if (log.classification === 'SAFE') statsData.safe++;
        else if (log.classification === 'JOKI') statsData.joki++;
        else if (log.classification === 'SKIP') statsData.skip++;
        updateStatUI();

        // Prepend to mini log
        if (miniLogList) {
            if (miniLogList.innerHTML.includes('No logs found')) miniLogList.innerHTML = '';
            const newMiniItem = document.createElement('div');
            newMiniItem.innerHTML = createMiniLogRow(log);
            miniLogList.prepend(newMiniItem.firstElementChild);
            if (miniLogList.children.length > 5) miniLogList.lastElementChild.remove();
        }

        // Prepend to full log
        if (fullLogList) {
            const tempTable = document.createElement('table');
            tempTable.innerHTML = createLogRow(log, true);
            fullLogList.prepend(tempTable.firstElementChild);
            
            // Remove pulse after 2 seconds
            setTimeout(() => {
                if (fullLogList.firstElementChild) {
                    fullLogList.firstElementChild.classList.remove('bg-blue-50', 'animate-pulse');
                }
            }, 2000);
        }

        lucide.createIcons();
        
        // Update charts if in analytics tab
        const analyticsTab = document.getElementById('content-analytics');
        if (analyticsTab && analyticsTab.classList.contains('active')) {
            renderCharts();
        }
    });

    async function renderCharts() {
        try {
            const res = await fetch('/api/analytics');
            const data = await res.json();
            
            const labels = data.map(d => d.hour);
            const safeData = data.map(d => d.safe);
            const jokiData = data.map(d => d.joki);

            const ctxTrend = document.getElementById('chart-trends');
            if (ctxTrend) {
                if (trendChart) trendChart.destroy();
                trendChart = new Chart(ctxTrend, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Safe', data: safeData, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
                            { label: 'Joki', data: jokiData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                });
            }

            const ctxPie = document.getElementById('chart-pie');
            if (ctxPie) {
                if (pieChart) pieChart.destroy();
                pieChart = new Chart(ctxPie, {
                    type: 'doughnut',
                    data: {
                        labels: ['Safe', 'Joki', 'Skip'],
                        datasets: [{
                            data: [statsData.safe, statsData.joki, statsData.skip],
                            backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
                });
            }
        } catch (err) {
            console.error('Failed to render charts:', err);
        }
    }

    // Initial Load
    refreshData();
});
