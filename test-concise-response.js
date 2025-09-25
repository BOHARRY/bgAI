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
            max_tokens: 300  // 限制回應長度
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function testConciseResponse() {
    console.log('🧪 測試簡潔回應...\n');
    
    const processor = new MultiAIProcessor();
    
    // 模擬對話流程
    const conversations = [
        {
            message: "你可以教我怎麼玩嗎？",
            context: [],
            expected: "應該詢問人數和經驗"
        },
        {
            message: "我們有三位，之前都沒有玩過",
            context: [
                { role: 'user', content: '你可以教我怎麼玩嗎？' },
                { role: 'assistant', content: '當然可以！😊 在開始之前，我想了解一下你的情況：你要和多少位朋友一起遊玩 Similo 呢？你們之前有玩過這款遊戲嗎？這樣我可以更好地幫助你們！' }
            ],
            expected: "應該直接進入遊戲設置，不要冗長介紹"
        }
    ];
    
    for (let i = 0; i < conversations.length; i++) {
        const conv = conversations[i];
        console.log(`\n=== 測試 ${i + 1}: ${conv.message} ===`);
        console.log(`期望: ${conv.expected}`);
        
        try {
            const result = await processor.processMessage(conv.message, conv.context, callOpenAI);
            
            console.log(`\n📝 AI 回應 (${result.response.length} 字符):`);
            console.log(result.response);
            
            // 分析回應品質
            const response = result.response;
            const wordCount = response.length;
            
            if (wordCount > 150) {
                console.log(`⚠️  回應過長 (${wordCount} 字符)`);
            } else {
                console.log(`✅ 回應長度適中 (${wordCount} 字符)`);
            }
            
            // 檢查是否包含不必要的介紹
            if (response.includes('推理卡牌遊戲') || response.includes('觀察和推理') || response.includes('歡迎你們來到')) {
                console.log(`❌ 包含不必要的遊戲介紹`);
            } else {
                console.log(`✅ 沒有冗長的遊戲介紹`);
            }
            
        } catch (error) {
            console.error('❌ 測試失敗:', error);
        }
        
        console.log('\n' + '='.repeat(60));
    }
}

testConciseResponse();
