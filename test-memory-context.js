const MultiAIProcessor = require('./multi-ai-processor');

// 模擬 OpenAI API 調用
async function mockOpenAI(messages) {
    // 簡化的模擬回應，專注於測試記憶功能
    const prompt = messages[0].content;
    
    if (prompt.includes('已知信息記憶')) {
        console.log('\n🧠 檢測到記憶提示詞：');
        const memorySection = prompt.match(/🧠 \*\*已知信息記憶\*\*：\n(.*?)\n\n/s);
        if (memorySection) {
            console.log(memorySection[1]);
        }
    }
    
    // 根據不同情況返回不同回應
    if (prompt.includes('你可以教我怎麼玩嗎')) {
        return '當然可以！請告訴我你們有幾個人？';
    } else if (prompt.includes('三個人')) {
        return '太好了！請選擇卡牌主題。';
    } else if (prompt.includes('神話')) {
        return '很好！現在請洗牌後排成4×3方陣。';
    } else {
        return '我明白了，讓我們繼續下一步。';
    }
}

async function testMemoryContext() {
    console.log('🧪 測試記憶上下文傳遞...\n');
    
    const processor = new MultiAIProcessor();
    
    // 模擬完整的對話歷史
    let chatHistory = [];
    
    const conversations = [
        {
            step: 1,
            userMessage: "你可以教我怎麼玩嗎？",
            expectedMemory: "尚無已知信息"
        },
        {
            step: 2,
            userMessage: "我們有三個人",
            expectedMemory: "玩家人數：3人"
        },
        {
            step: 3,
            userMessage: "神話!",
            expectedMemory: "玩家人數：3人, 選擇主題：神話"
        },
        {
            step: 4,
            userMessage: "排好了",
            expectedMemory: "玩家人數：3人, 選擇主題：神話, 已完成步驟：卡牌佈局"
        }
    ];
    
    for (let i = 0; i < conversations.length; i++) {
        const conv = conversations[i];
        console.log(`\n=== 步驟 ${conv.step}: ${conv.userMessage} ===`);
        
        try {
            // 構建上下文
            const context = {
                chatHistory: chatHistory,
                sessionId: 'test_session'
            };
            
            console.log(`📚 當前歷史記錄數量: ${chatHistory.length}`);
            
            const result = await processor.processMessage(conv.userMessage, context, mockOpenAI);
            
            console.log(`📝 AI 回應: ${result.response}`);
            console.log(`🎯 意圖: ${result.intent}`);
            
            // 更新對話歷史
            chatHistory.push({ role: 'user', content: conv.userMessage });
            chatHistory.push({ role: 'assistant', content: result.response });
            
            console.log(`📚 更新後歷史記錄數量: ${chatHistory.length}`);
            
        } catch (error) {
            console.error('❌ 測試失敗:', error);
        }
        
        console.log('\n' + '='.repeat(80));
    }
    
    // 測試記憶提取功能
    console.log('\n=== 記憶提取測試 ===');
    
    const testHistory = [
        { role: 'user', content: '你可以教我怎麼玩嗎？' },
        { role: 'assistant', content: '當然可以！請告訴我你們有幾個人？' },
        { role: 'user', content: '我們有三個人，都是新手' },
        { role: 'assistant', content: '太好了！請選擇卡牌主題。' },
        { role: 'user', content: '神話!' },
        { role: 'assistant', content: '很好！現在請洗牌後排成4×3方陣。' },
        { role: 'user', content: '排好了' }
    ];
    
    const responseGenerator = processor.responseGenerator;
    const mockContextAnalysis = { chatHistory: testHistory };
    const memoryContext = responseGenerator.buildMemoryContext(mockContextAnalysis);
    
    console.log('🧠 提取的記憶上下文：');
    console.log(memoryContext);
    
    // 驗證記憶內容
    const expectedElements = ['3人', '新手', '神話', '卡牌佈局'];
    let foundElements = 0;
    
    expectedElements.forEach(element => {
        if (memoryContext.includes(element)) {
            console.log(`✅ 找到預期元素: ${element}`);
            foundElements++;
        } else {
            console.log(`❌ 缺少預期元素: ${element}`);
        }
    });
    
    console.log(`\n📊 記憶準確率: ${foundElements}/${expectedElements.length} (${Math.round(foundElements/expectedElements.length*100)}%)`);
    
    if (foundElements === expectedElements.length) {
        console.log('🎉 記憶功能測試通過！');
    } else {
        console.log('⚠️ 記憶功能需要改進');
    }
}

testMemoryContext();
