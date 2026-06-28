// ==================== 配置 ====================
const CONFIG = {
    // ⚠️ 替换为你的 Cloudflare Worker 真实地址（不要包含末尾斜杠）
    API_BASE: 'https://api.cnolm.dpdns.org',
    // 或者如果使用 workers.dev：
    // API_BASE: 'https://你的-worker名称.你的子域.workers.dev',

    // 定义需要展示的权限组及其顺序
    GROUPS: ['owner', 'admin', 'mod', 'helper', 'builder', 'partner'],
    // 页面跳转的基础 URL（玩家卡片点击后跳转）
    BASE_URL: window.location.origin
};

// ==================== DOM 引用 ====================
const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-links li');

// ==================== 页面加载器 ====================
const pageLoader = {
    cache: {},

    async load(pageName) {
        if (this.cache[pageName]) {
            return this.cache[pageName];
        }

        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            this.cache[pageName] = html;
            return html;
        } catch (error) {
            console.error(`加载页面 ${pageName} 失败:`, error);
            return `<div class="error-message">⚠️ 页面加载失败，请刷新重试。</div>`;
        }
    }
};

// ==================== 渲染器 ====================
const renderer = {
    async render(pageName) {
        app.innerHTML = `<div class="status-message">⏳ 加载中...</div>`;

        const pageHtml = await pageLoader.load(pageName);

        if (pageName === 'player') {
            app.innerHTML = pageHtml;
            await PlayerView.fetchAndRender();
        } else {
            app.innerHTML = pageHtml;
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });
    }
};

// ==================== Player 视图逻辑 ====================
const PlayerView = {
    // 缓存数据
    cache: {
        data: null,
        timestamp: 0,
        ttl: 60000 // 缓存有效期 60 秒
    },

    async fetchAndRender(forceRefresh = false) {
        const container = document.getElementById('playerListContainer');
        if (!container) return;

        const { API_BASE, GROUPS, BASE_URL } = CONFIG;

        // 验证 API 配置
        //if (!API_BASE || API_BASE.includes('你的实际域名')) {
        //    container.innerHTML = `<div class="error-message">⚠️ 请先配置 API_BASE 地址（在 js/main.js 的 CONFIG 中替换）</div>`;
        //    return;
        //}

        // 检查缓存是否有效
        const now = Date.now();
        if (!forceRefresh && this.cache.data && (now - this.cache.timestamp) < this.cache.ttl) {
            console.log('📦 使用缓存的玩家数据');
            this.renderPlayers(this.cache.data, container, GROUPS, BASE_URL);
            return;
        }

        container.innerHTML = `<div class="status-message">⏳ 请求玩家数据...</div>`;

        try {
            const response = await fetch(`${API_BASE}/api/players`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const players = Array.isArray(data) ? data : (data.players || []);

            // 存入缓存
            this.cache.data = players;
            this.cache.timestamp = now;

            this.renderPlayers(players, container, GROUPS, BASE_URL);

        } catch (error) {
            console.error('玩家列表加载失败:', error);
            container.innerHTML = `
                <div class="error-message">
                    ❌ 无法加载玩家数据：${error.message || '网络错误'}
                    <span style="font-size:0.85rem;color:#6a7a8e;display:block;margin-top:0.5rem;">请确认 API 地址正确且支持 CORS</span>
                </div>
            `;
        }
    },

    renderPlayers(players, container, GROUPS, BASE_URL) {
        if (!players || !players.length) {
            container.innerHTML = `<div class="status-message">📭 暂无玩家数据</div>`;
            return;
        }

        // 分组逻辑
        const grouped = {};
        GROUPS.forEach(g => grouped[g] = []);
        const others = [];

        players.forEach(p => {
            const groupName = p.group || 'Default';
            if (grouped[groupName]) grouped[groupName].push(p);
            else others.push(p);
        });

        let html = '';
        GROUPS.forEach(group => {
            const list = grouped[group] || [];
            html += `
                <div class="group-section">
                    <div class="group-title">${group} <span class="badge">${list.length}</span></div>
                    <div class="player-grid">
            `;
            if (list.length === 0) {
                html += `<div class="empty-group">— 暂无成员</div>`;
            } else {
                list.forEach(p => {
                    const displayName = p.name || p.uuid?.slice(0, 8) || '未知';
                    html += `
                        <div class="player-item" data-uuid="${p.uuid || ''}">
                            <span class="player-name">${displayName}</span>
                            <span class="player-uuid">${p.uuid ? p.uuid.slice(0, 8) : '—'}</span>
                        </div>
                    `;
                });
            }
            html += `</div></div>`;
        });

        if (others.length) {
            html += `
                <div class="group-section">
                    <div class="group-title">Other <span class="badge">${others.length}</span></div>
                    <div class="player-grid">
            `;
            others.forEach(p => {
                const displayName = p.name || p.uuid?.slice(0, 8) || '未知';
                html += `
                    <div class="player-item" data-uuid="${p.uuid || ''}">
                        <span class="player-name">${displayName}</span>
                        <span class="player-uuid">${p.uuid ? p.uuid.slice(0, 8) : '—'}</span>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        container.innerHTML = html;

        // 绑定点击跳转事件
        document.querySelectorAll('.player-item').forEach(item => {
            const uuid = item.dataset.uuid;
            if (uuid) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    window.location.href = `${BASE_URL}/player/${uuid}`;
                });
            }
        });
    }
};

// ==================== 导航与搜索事件绑定 ====================
function initNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const pageName = this.dataset.page;
            renderer.render(pageName);
        });
    });
}

function initSearch() {
    const searchInput = document.getElementById('playerSearchInput');
    const searchBtn = document.getElementById('playerSearchBtn');

    if (!searchInput || !searchBtn) return;

    const handleSearch = () => {
        const query = searchInput.value.trim();
        if (!query) {
            app.innerHTML = `<div class="status-message">🔍 请输入玩家 ID 或名称</div>`;
            return;
        }
        // 使用简洁路径格式跳转
        // BASE_URL 已在 CONFIG 中定义（例如 http://localhost:8080 或 https://你的域名.com）
        window.location.href = `${CONFIG.BASE_URL}/player/${encodeURIComponent(query)}`;
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    });
}

// ==================== 初始化 ====================
async function init() {
    initNavigation();
    await renderer.render('home');

    // 搜索功能绑定（在 Player 页面渲染后）
    const observer = new MutationObserver(() => {
        if (document.getElementById('playerSearchBtn')) {
            initSearch();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', init);

window.renderer = renderer;
window.PlayerView = PlayerView;