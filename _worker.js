export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const path = url.pathname;

            // 如果是 /player/ 开头的请求（且不是 /player/ 本身）
            if (path.startsWith('/player/') && path !== '/player/') {
                // 排除资源文件
                if (!path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|json|webp)$/)) {
                    if (path !== '/player/index.html') {
                        // 提取玩家名
                        const playerName = path.replace('/player/', '');
                        // 构造新 URL，将玩家名作为查询参数
                        const newUrl = new URL(request.url);
                        newUrl.pathname = '/player/index.html';
                        newUrl.search = `?player=${encodeURIComponent(playerName)}`;
                        const newRequest = new Request(newUrl, request);
                        return env.ASSETS.fetch(newRequest);
                    }
                }
            }

            return env.ASSETS.fetch(request);
        } catch (error) {
            return new Response('Error: ' + error.message, { status: 500 });
        }
    }
};