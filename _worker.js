export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // 只有 /player/ 后面的路径不为空时才处理
        if (path.startsWith('/player/') && path.length > 8) {
            // 排除资源文件
            if (!path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|json|webp)$/)) {
                // 排除 index.html 本身
                if (path !== '/player/index.html') {
                    // ✅ 必须使用 new Request() 包装
                    return env.ASSETS.fetch(new Request('/player/index.html', request));
                }
            }
        }

        return env.ASSETS.fetch(request);
    }
};