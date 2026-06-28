export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 如果是 /player/ 开头的请求，返回 player/index.html
        if (path.startsWith('/player/')) {
            return env.ASSETS.fetch(new Request('/player/index.html', request));
        }

        // 其他请求正常处理
        return env.ASSETS.fetch(request);
    }
};