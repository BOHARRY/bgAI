const MultiAIProcessor = require('./multi-ai-processor');

// 真實的 OpenAI API 調用
async function callOpenAI(messages) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API Key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.1,
            max_tokens: 300
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function testContextFlow() {
    console.log('🧪 測試上下文流程...\n');
    
    const processor = new MultiAIProcessor();
    
    // 模擬完整對話流程
    let context = [];
    
    const conversations = [
        {
            message: "你可以教我怎麼玩嗎？",
            expected_intent: "start_game",
            expected_behavior: "詢問人數和經驗"
        },
        {
            message: "我們有三個人，之前沒有玩過",
            expected_intent: "environment_info",
            expected_behavior: "進入遊戲設置"
        },
        {
            message: "好，我們準備好了!",
            expected_intent: "progress_control",
            expected_behavior: "進入下一個遊戲階段，不要重新詢問人數"
        }
    ];
    
    for (let i = 0; i < conversations.length; i++) {
        const conv = conversations[i];
        console.log(`\n=== 對話 ${i + 1}: ${conv.message} ===`);
        console.log(`期望意圖: ${conv.expected_intent}`);
        console.log(`期望行為: ${conv.expected_behavior}`);
        
        try {
            const result = await processor.processMessage(conv.message, context, callOpenAI);
            
            console.log(`\n📝 實際結果:`);
            console.log(`意圖: ${result.intent}`);
            console.log(`策略: ${result.strategy}`);
            console.log(`回應: ${result.response}`);
            
            // 驗證意圖是否正確
            if (result.intent === conv.expected_intent) {
                console.log(`✅ 意圖檢測正確`);
            } else {
                console.log(`❌ 意圖檢測錯誤，期望: ${conv.expected_intent}，實際: ${result.intent}`);
            }
            
            // 檢查是否重複詢問人數
            if (i === 2 && result.response.includes('人數')) {
                console.log(`❌ 錯誤：重複詢問人數`);
            } else if (i === 2) {
                console.log(`✅ 沒有重複詢問人數`);
            }
            
            // 更新上下文
            context.push({ role: 'user', content: conv.message });
            context.push({ role: 'assistant', content: result.response });
            
        } catch (error) {
            console.error('❌ 測試失敗:', error);
        }
        
        console.log('\n' + '='.repeat(60));
    }
}

testContextFlow();
