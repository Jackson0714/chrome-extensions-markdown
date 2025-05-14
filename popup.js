document.getElementById('convertBtn').addEventListener('click', async () => {
    try {
        // 显示加载状态
        const button = document.getElementById('convertBtn');
        const originalText = button.textContent;
        button.textContent = '转换中...';
        button.disabled = true;
        
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // 直接获取页面HTML并在popup中进行转换
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => document.documentElement.outerHTML
        });
        
        const html = results[0].result;
        console.log("获取到HTML内容，长度:", html.length);
        
        // 使用Turndown库转换HTML为Markdown
        // 注意：这里我们需要在popup.html中引入turndown.min.js
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
        
        console.log("开始转换为Markdown");
        const markdown = turndownService.turndown(html);
        console.log("转换完成，Markdown长度:", markdown.length);
        
        // 创建下载链接
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        // 处理文件名，只替换不允许的字符，保留中文和空格等
        const filename = `${tab.title.replace(/[\\/:*?"<>|]/g, '_')}.md`;
        
        console.log("准备下载文件:", filename);
        chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("下载失败:", chrome.runtime.lastError);
                button.textContent = '下载失败';
            } else {
                console.log("下载已启动，ID:", downloadId);
                button.textContent = '转换成功!';
            }
            
            // 恢复按钮状态
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        });
    } catch (error) {
        console.error('转换失败:', error);
        const button = document.getElementById('convertBtn');
        button.textContent = '转换失败';
        setTimeout(() => {
            button.textContent = '转换为Markdown';
            button.disabled = false;
        }, 2000);
    }
});