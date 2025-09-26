const CONFIG = require('./config');
const OpenAIClient = require('./openai-client');
const LayeredAIHandler = require('./layered-ai-handler');

function testMemoryLimits() {
    console.log('🧪 測試記憶上限設置...\n');
    
    // 測試配置文件
    console.log('=== 配置文件測試 ===');
    console.log(`CONFIG.MAX_CHAT_HISTORY: ${CONFIG.MAX_CHAT_HISTORY}`);
    
    if (CONFIG.MAX_CHAT_HISTORY === 40) {
        console.log('✅ 主配置文件記憶上限正確設置為 40');
    } else {
        console.log(`❌ 主配置文件記憶上限錯誤: ${CONFIG.MAX_CHAT_HISTORY}，應該是 40`);
    }
    
    // 測試 OpenAI Client
    console.log('\n=== OpenAI Client 測試 ===');
    const openaiClient = new OpenAIClient();
    
    // 添加超過上限的消息
    for (let i = 1; i <= 50; i++) {
        openaiClient.addToHistory('user', `測試消息 ${i}`);
    }
    
    const history = openaiClient.getHistory();
    console.log(`OpenAI Client 歷史記錄數量: ${history.length}`);
    
    if (history.length === 40) {
        console.log('✅ OpenAI Client 正確限制記憶到 40 條');
        console.log(`最早消息: "${history[0].content}"`);
        console.log(`最新消息: "${history[history.length - 1].content}"`);
    } else {
        console.log(`❌ OpenAI Client 記憶限制錯誤: ${history.length}，應該是 40`);
    }
    
    // 測試 LayeredAIHandler
    console.log('\n=== LayeredAIHandler 測試 ===');
    const layeredHandler = new LayeredAIHandler();
    
    console.log(`LayeredAIHandler maxHistoryLength: ${layeredHandler.maxHistoryLength}`);
    
    if (layeredHandler.maxHistoryLength === 40) {
        console.log('✅ LayeredAIHandler 記憶上限正確設置為 40');
    } else {
        console.log(`❌ LayeredAIHandler 記憶上限錯誤: ${layeredHandler.maxHistoryLength}，應該是 40`);
    }
    
    // 添加超過上限的消息
    for (let i = 1; i <= 50; i++) {
        layeredHandler.addToChatHistory('user', `LayeredAI 測試消息 ${i}`);
    }
    
    console.log(`LayeredAIHandler 實際歷史記錄數量: ${layeredHandler.chatHistory.length}`);
    
    if (layeredHandler.chatHistory.length === 40) {
        console.log('✅ LayeredAIHandler 正確限制記憶到 40 條');
    } else {
        console.log(`❌ LayeredAIHandler 記憶限制錯誤: ${layeredHandler.chatHistory.length}，應該是 40`);
    }
    
    // 測試記憶內容質量
    console.log('\n=== 記憶內容質量測試 ===');
    
    // 模擬一個完整的遊戲對話
    const gameConversation = [
        { role: 'user', content: '你可以教我怎麼玩嗎？' },
        { role: 'assistant', content: '當然可以！請告訴我你們有幾個人？' },
        { role: 'user', content: '我們有三個人' },
        { role: 'assistant', content: '太好了！請洗牌後排成4×3方陣。' },
        { role: 'user', content: '排好了' },
        { role: 'assistant', content: '請出題者從這12張卡中秘密選擇1張。' },
        { role: 'user', content: '選好了' },
        { role: 'assistant', content: '請出題者抽5張手牌。' },
        { role: 'user', content: '準備好了' },
        { role: 'assistant', content: '第1回合開始！請出題者選1張線索卡。' }
    ];
    
    const testClient = new OpenAIClient();
    gameConversation.forEach(msg => {
        testClient.addToHistory(msg.role, msg.content);
    });
    
    const gameHistory = testClient.getHistory();
    console.log(`遊戲對話歷史長度: ${gameHistory.length}`);
    console.log('遊戲對話內容:');
    gameHistory.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.role}: ${msg.content}`);
    });
    
    // 檢查是否保留了關鍵信息
    const historyText = gameHistory.map(msg => msg.content).join(' ');
    const keyInfo = ['三個人', '排好了', '選好了', '準備好了'];
    
    console.log('\n關鍵信息保留檢查:');
    keyInfo.forEach(info => {
        const found = historyText.includes(info);
        console.log(`  ${found ? '✅' : '❌'} "${info}": ${found ? '已保留' : '遺失'}`);
    });
    
    console.log('\n🎉 記憶上限測試完成！');
    
    // 總結
    console.log('\n=== 總結 ===');
    console.log('記憶上限設置:');
    console.log(`- 配置文件: ${CONFIG.MAX_CHAT_HISTORY} 條`);
    console.log(`- OpenAI Client: 實際限制 ${history.length} 條`);
    console.log(`- LayeredAIHandler: 設置 ${layeredHandler.maxHistoryLength} 條，實際 ${layeredHandler.chatHistory.length} 條`);
    console.log(`- 前端提取: 20 條 (在 app.js 中設置)`);
    
    const allCorrect = CONFIG.MAX_CHAT_HISTORY === 40 && 
                      history.length === 40 && 
                      layeredHandler.maxHistoryLength === 40;
    
    if (allCorrect) {
        console.log('\n🎉 所有記憶上限設置正確！現在可以記住更多對話內容了。');
    } else {
        console.log('\n⚠️ 部分記憶上限設置需要檢查。');
    }
}

testMemoryLimits();
