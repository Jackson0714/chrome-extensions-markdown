// 当接收到来自popup的消息时执行转换
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "convert") {
        try {
            // 获取页面内容
            const content = document.querySelector('body');
            
            // 检查Turndown是否已加载
            if (typeof TurndownService === 'undefined') {
                sendResponse({ 
                    success: false, 
                    error: "Turndown库未加载" 
                });
                return true;
            }
            
            // 创建Turndown实例
            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced',
                emDelimiter: '*'
            });
            
            // 配置Turndown规则
            turndownService.addRule('removeScripts', {
                filter: ['script', 'noscript', 'style'],
                replacement: () => ''
            });
            
            // 转换HTML为Markdown
            const markdown = turndownService.turndown(content);
            
            // 发送转换结果回popup
            sendResponse({ success: true, markdown: markdown });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
        
        // 返回true表示将异步发送响应
        return true;
    }
});