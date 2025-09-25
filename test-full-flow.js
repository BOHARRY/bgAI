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
            max_tokens: 500
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function testFullFlow() {
    console.log('🧪 測試完整流程...\n');
    
    const processor = new MultiAIProcessor();
    
    const testMessage = "你可以教我怎麼玩嗎？";
    const context = []; // 空的上下文
    
    try {
        console.log(`📝 用戶消息: "${testMessage}"`);
        console.log('🔄 開始處理...\n');
        
        const result = await processor.processMessage(testMessage, context, callOpenAI);
        
        console.log('✅ 處理結果:');
        console.log('意圖:', result.intent);
        console.log('策略:', result.strategy);
        console.log('回應長度:', result.response.length);
        console.log('\n📝 AI 回應:');
        console.log(result.response);
        
        // 驗證結果
        if (result.intent === 'start_game') {
            console.log('\n🎉 意圖檢測正確！');
        } else {
            console.log('\n❌ 意圖檢測錯誤:', result.intent);
        }
        
        if (result.strategy === 'environment_sensing') {
            console.log('✅ 策略選擇正確！');
        } else {
            console.log('❌ 策略選擇錯誤:', result.strategy);
        }
        
        // 檢查回應是否包含環境感知相關內容
        const response = result.response.toLowerCase();
        if (response.includes('人數') || response.includes('經驗') || response.includes('幾個人')) {
            console.log('✅ 回應包含環境感知內容！');
        } else {
            console.log('❌ 回應缺少環境感知內容');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    }
}

testFullFlow();
