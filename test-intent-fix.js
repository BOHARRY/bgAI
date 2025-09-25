const IntentDetector = require('./intent-detector');

// 模擬 OpenAI API 調用
function mockOpenAICall(messages) {
    console.log('📤 發送到 OpenAI:');
    console.log(messages[0].content);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // 這裡我們手動返回期望的結果來測試
    return Promise.resolve(`{
        "intent": {
            "primary_intent": "start_game",
            "confidence": 0.9,
            "description": "用戶想要學習並開始 Similo 遊戲"
        },
        "urgency": {
            "level": "normal",
            "priority_score": 0.7
        },
        "response_strategy": {
            "approach": "environment_sensing",
            "tone": "friendly",
            "should_reference_context": false
        },
        "environment_sensing": {
            "needs_sensing": true,
            "sensing_type": "player_count|experience|materials"
        }
    }`);
}

async function testIntentDetection() {
    console.log('🧪 測試 IntentDetector 修復...\n');
    
    const detector = new IntentDetector();
    
    const testMessage = "你可以教我怎麼玩嗎？";
    
    try {
        const result = await detector.detect(testMessage, [], mockOpenAICall);
        
        console.log('✅ 檢測結果:');
        console.log(JSON.stringify(result, null, 2));
        
        // 驗證結果
        if (result.intent?.primary_intent === 'start_game') {
            console.log('\n🎉 成功！正確識別為 start_game');
        } else {
            console.log('\n❌ 失敗！仍然錯誤分類為:', result.intent?.primary_intent);
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

testIntentDetection();
