export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 如果是 /player/ 开头的请求，且不是 /player/index.html
        if (path.startsWith('/player/') && !path.includes('/player/index.html')) {
            // 直接返回 player/index.html 的内容
            return env.ASSETS.fetch(new Request('/player/index.html', request));
        }

        return env.ASSETS.fetch(request);
    }
};