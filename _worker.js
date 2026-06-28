// _worker.js
export default {
    async fetch(request, env) {
        let url = new URL(request.url);
        let path = url.pathname;

        // 如果是 /player/ 路径，则返回 player/index.html
        if (path.startsWith('/player/')) {
            // 直接返回 player/index.html 的内容
            // 这里你可以选择从磁盘读取，或者转发请求
            // 使用 fetch 获取原始文件
            let newUrl = new URL(request.url);
            newUrl.pathname = '/player/index.html';
            // 修改请求的路径并继续
            let modifiedRequest = new Request(newUrl, request);
            return env.ASSETS.fetch(modifiedRequest);
        }

        // 其他所有请求使用默认行为
        return env.ASSETS.fetch(request);
    }
};