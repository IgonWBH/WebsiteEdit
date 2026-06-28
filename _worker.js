export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const path = url.pathname;

            // 精确匹配：只有 /player/ 后面有内容时才重定向
            if (path.startsWith('/player/') && path.length > 8) {
                // 排除资源文件
                if (!path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|json|webp)$/)) {
                    // 排除 index.html 本身
                    if (path !== '/player/index.html') {
                        return env.ASSETS.fetch(new Request('/player/index.html', request));
                    }
                }
            }

            return env.ASSETS.fetch(request);
        } catch (error) {
            // 如果发生错误，返回错误信息
            return new Response('Error: ' + error.message, { status: 500 });
        }
    }
};