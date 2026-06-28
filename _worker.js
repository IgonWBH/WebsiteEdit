export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 如果是 /player/ 开头的请求，返回 player/index.html
        if (path.startsWith('/player/')) {
            // 构造一个指向 /player/index.html 的新请求
            const newUrl = new URL(request.url);
            newUrl.pathname = '/player/index.html';
            const modifiedRequest = new Request(newUrl, request);
            return env.ASSETS.fetch(modifiedRequest);
        }

        // 其他所有请求（CSS、JS、图片等）使用默认行为
        return env.ASSETS.fetch(request);
    }
};