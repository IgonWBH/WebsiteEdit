export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 如果是 /player/ 开头的请求，且不是 /player/index.html 本身
        if (path.startsWith('/player/') && !path.endsWith('/index.html')) {
            // 重写请求到 /player/index.html
            const newUrl = new URL(request.url);
            newUrl.pathname = '/player/index.html';
            const modifiedRequest = new Request(newUrl, request);
            return env.ASSETS.fetch(modifiedRequest);
        }

        // 其他所有请求使用默认行为
        return env.ASSETS.fetch(request);
    }
};