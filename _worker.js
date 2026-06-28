export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const path = url.pathname;

            // 只有 /player/ 后面的路径不为空时才处理
            if (path.startsWith('/player/') && path !== '/player/') {
                // 排除 index.html 本身和资源文件
                if (path !== '/player/index.html' && !path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|json|webp)$/)) {
                    // 重写请求到 /player/index.html
                    const newUrl = new URL(request.url);
                    newUrl.pathname = '/player/index.html';
                    const newRequest = new Request(newUrl, request);
                    return env.ASSETS.fetch(newRequest);
                }
            }

            return env.ASSETS.fetch(request);
        } catch (error) {
            // 如果发生错误，返回 500 并显示错误信息
            return new Response('Error: ' + error.message, { status: 500 });
        }
    }
};