const IntentDetector = require('./intent-detector');

// 真實的 OpenAI API 調用（使用現有的 fetch 方式）
async function realOpenAICall(messages) {
    console.log('📤 發送到 OpenAI API...');

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
    const content = data.choices[0].message.content;

    console.log('📥 OpenAI 回應:', content);
    console.log('\n' + '='.repeat(80) + '\n');

    return content;
}

async function testRealAPI() {
    console.log('🧪 測試真實 OpenAI API...\n');
    
    const detector = new IntentDetector();
    
    const testMessage = "你可以教我怎麼玩嗎？";
    
    try {
        const result = await detector.detect(testMessage, [], realOpenAICall);
        
        console.log('✅ 最終檢測結果:');
        console.log(JSON.stringify(result, null, 2));
        
        // 驗證結果
        if (result.intent?.primary_intent === 'start_game') {
            console.log('\n🎉 成功！正確識別為 start_game');
        } else {
            console.log('\n❌ 失敗！錯誤分類為:', result.intent?.primary_intent);
        }
        
        if (result.environment_sensing?.needs_sensing) {
            console.log('✅ 正確觸發環境感知');
        } else {
            console.log('❌ 未觸發環境感知');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    }
}

testRealAPI();
