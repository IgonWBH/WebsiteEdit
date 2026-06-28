export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 只有在以下情况下才重定向到 player/index.html：
        // 1. 路径以 /player/ 开头
        // 2. 不是 /player/index.html 本身
        // 3. 不是 /player/css/ 或 /player/js/ 等资源文件
        // 4. 路径不是 /player/ (空路径)
        const isPlayerPath = path.startsWith('/player/');
        const isIndexHtml = path === '/player/index.html';
        const isPlayerRoot = path === '/player/';
        const isResourceFile = path.match(/^\/player\/.*\.(css|js|png|jpg|jpeg|gif|svg|ico|json)$/);

        if (isPlayerPath && !isIndexHtml && !isPlayerRoot && !isResourceFile) {
            // 这是一个合法的玩家页面请求，重定向到 index.html
            return env.ASSETS.fetch(new Request('/player/index.html', request));
        }

        // 其他所有请求使用默认行为
        return env.ASSETS.fetch(request);
    }
};