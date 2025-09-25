// RuleBuddy.ai 服務器
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

const PORT = process.env.PORT || 7777;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
};

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
        if (pathname === '/api/chat' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                try {
                    const { message, history = [] } = JSON.parse(body);

                    const messages = [
                        {
                            role: 'system',
                            content: '你是 RuleBuddy.ai，一個專業的桌遊 AI 助手。請用友善、專業且有趣的語調回答桌遊相關問題。'
                        },
                        ...history.slice(-10),
                        { role: 'user', content: message }
                    ];

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
                        throw new Error(`OpenAI API Error: ${response.status}`);
                    }

                    const data = await response.json();
                    const assistantMessage = data.choices[0].message.content;

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: assistantMessage }));

                } catch (error) {
                    console.error('Chat API error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            });
            return;
        }

        // 靜態文件服務
        if (pathname === '/') {
            pathname = '/index.html';
        }

        const filePath = path.join(__dirname, pathname);
        const extname = path.extname(filePath).toLowerCase();
        const mimeType = mimeTypes[extname] || 'application/octet-stream';

        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);

    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else {
            console.error('Server error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }
});

server.listen(PORT, () => {
    console.log(`🚀 RuleBuddy.ai 服務器已啟動！`);
    console.log(`📱 請在瀏覽器中打開: http://localhost:${PORT}`);
    console.log(`🎲 準備好與 AI 桌遊助手對話了！`);
});

process.on('SIGINT', () => {
    console.log('\n👋 正在關閉服務器...');
    server.close(() => {
        console.log('✅ 服務器已關閉');
        process.exit(0);
    });
});
