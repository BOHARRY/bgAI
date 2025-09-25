// 測試上下文傳遞功能
const fs = require('fs');

// 模擬前端提取聊天歷史的功能
function simulateChatHistory() {
    return [
        { role: 'user', content: '你可以教我怎麼玩嗎？' },
        { role: 'assistant', content: '太棒了 🎉 我來當你們的陪玩員！在開始之前，先跟我說說：現在桌上有幾位玩家呢？' },
        { role: 'user', content: '3個人' }
    ];
}

// 模擬 API 請求
function simulateAPIRequest(message, chatHistory) {
    const context = {
        chatHistory: chatHistory,
        timestamp: Date.now(),
        sessionId: 'test_session_123'
    };
    
    console.log('🧪 測試上下文傳遞');
    console.log('📤 發送請求:');
    console.log('  消息:', message);
    console.log('  上下文:', JSON.stringify(context, null, 2));
    
    return { message, context };
}

// 測試場景
console.log('🎯 測試場景 1: 連續對話');
const scenario1 = simulateAPIRequest('我當出題者', simulateChatHistory());
console.log('✅ 場景 1 完成\n');

console.log('🎯 測試場景 2: 首次對話');
const scenario2 = simulateAPIRequest('你好嗎？', []);
console.log('✅ 場景 2 完成\n');

console.log('🎯 測試場景 3: 跳躍式問題');
const scenario3 = simulateAPIRequest('線索卡要怎麼放？', simulateChatHistory());
console.log('✅ 場景 3 完成\n');

console.log('🎉 所有測試場景完成！');

// 測試連續對話檢測邏輯
function testDirectResponseDetection() {
    console.log('\n🔍 測試連續對話檢測:');
    
    const testCases = [
        {
            userMessage: '3個人',
            lastAIMessage: '現在桌上有幾位玩家呢？',
            expected: true
        },
        {
            userMessage: '我當出題者',
            lastAIMessage: '你們三個人中誰想當出題者呢？',
            expected: true
        },
        {
            userMessage: '好的',
            lastAIMessage: '請從牌堆中抽出 12 張卡片',
            expected: true
        },
        {
            userMessage: '線索卡要怎麼放？',
            lastAIMessage: '現在桌上有幾位玩家呢？',
            expected: false
        }
    ];
    
    testCases.forEach((testCase, index) => {
        const result = isDirectResponse(testCase.userMessage, testCase.lastAIMessage);
        const status = result === testCase.expected ? '✅' : '❌';
        console.log(`${status} 測試 ${index + 1}: "${testCase.userMessage}" -> ${result}`);
    });
}

// 簡化版的連續對話檢測函數（與 API 中的邏輯一致）
function isDirectResponse(userMessage, lastAIMessage) {
    const userMsg = userMessage.toLowerCase();
    const aiMsg = lastAIMessage.toLowerCase();
    
    // 檢測數字回應
    if (/\d+/.test(userMsg) && (aiMsg.includes('幾') || aiMsg.includes('多少'))) {
        return true;
    }
    
    // 檢測確認回應
    if (['好的', '是的', '對', '沒錯', '可以', '行'].some(word => userMsg.includes(word))) {
        return true;
    }
    
    // 檢測角色選擇回應
    if (userMsg.includes('我當') || userMsg.includes('我來')) {
        return true;
    }
    
    return false;
}

testDirectResponseDetection();
