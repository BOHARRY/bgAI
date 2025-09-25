// 簡單的本地服務器，用於處理 OpenAI API 請求
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 載入環境變數（簡單實現）
try {
    const envFile = fs.readFileSync('.env', 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (error) {
    console.log('📝 未找到 .env 文件，請參考 .env.example 創建配置文件');
}

// 配置
const PORT = process.env.PORT || 7777;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';

// MIME 類型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// 創建服務器
const server = http.createServer(async (req, res) => {
    // 設置 CORS 頭
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 處理 OPTIONS 請求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
        // API 路由：處理 OpenAI 請求
        if (pathname === '/api/chat' && req.method === 'POST') {
            await handleChatAPI(req, res);
            return;
        }

        // 靜態文件服務
        await serveStaticFile(req, res, pathname);

    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

// 處理聊天 API 請求
async function handleChatAPI(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { message, history = [] } = JSON.parse(body);

            // 構建發送給 OpenAI 的消息
            const messages = [
                {
                    role: 'system',
                    content: `你是 RuleBuddy.ai，一個專業的桌遊 AI 助手。你的任務是：

1. 解釋桌遊規則 - 用清楚易懂的方式說明遊戲規則
2. 回答遊戲問題 - 解決玩家在遊戲過程中的疑問
3. 提供策略建議 - 分享遊戲技巧和策略
4. 推薦桌遊 - 根據玩家喜好推薦適合的桌遊

請用友善、專業且有趣的語調回答，並盡量提供具體實用的建議。如果遇到不確定的規則問題，請建議查閱官方規則書。`
                },
                ...history.slice(-10), // 只保留最近10條對話
                {
                    role: 'user',
                    content: message
                }
            ];

            // 發送請求到 OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;

            // 返回結果
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: assistantMessage
            }));

        } catch (error) {
            console.error('Chat API error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
    });
}

// 服務靜態文件
async function serveStaticFile(req, res, pathname) {
    // 默認文件
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(__dirname, pathname);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';

    try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else {
            throw error;
        }
    }
}

// 啟動服務器
server.listen(PORT, () => {
    console.log(`🚀 RuleBuddy.ai 服務器已啟動！`);
    console.log(`📱 請在瀏覽器中打開: http://localhost:${PORT}`);
    console.log(`🎲 準備好與 AI 桌遊助手對話了！`);
});

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n👋 正在關閉服務器...');
    server.close(() => {
        console.log('✅ 服務器已關閉');
        process.exit(0);
    });
});
