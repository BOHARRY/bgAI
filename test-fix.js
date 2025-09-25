// 測試修復效果
const MultiAIProcessor = require('./multi-ai-processor.js');

// 模擬 OpenAI API 調用
function mockOpenAICall(messages) {
    const prompt = messages[0].content;
    
    // 根據 prompt 類型返回模擬結果
    if (prompt.includes('上下文分析師')) {
        return Promise.resolve(`{
            "continuity_analysis": {
                "is_continuous": false,
                "continuity_type": "new_conversation",
                "confidence": 0.9
            },
            "topic_analysis": {
                "current_topic": "game_learning_request",
                "topic_switch_detected": false
            },
            "context_relevance": {
                "relevant_history": [],
                "key_information": {}
            },
            "conversation_state": {
                "incomplete_threads": [],
                "current_phase": "initial"
            }
        }`);
    } else if (prompt.includes('意圖檢測專家')) {
        return Promise.resolve(`{
            "intent": {
                "primary_intent": "start_game",
                "confidence": 0.95,
                "description": "用戶想要學習並開始遊戲"
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
                "sensing_type": "player_count"
            }
        }`);
    } else if (prompt.includes('Similo AI 陪玩員')) {
        // 這裡應該生成正確的引導式回應，而不是百科全書式
        return Promise.resolve('太棒了！我來當你們的陪玩員 🎉 在開始之前，先跟我說說：現在桌上有幾位玩家呢？');
    }
    
    return Promise.resolve('模擬回應');
}

async function testFix() {
    console.log('🧪 測試修復效果\n');
    
    const processor = new MultiAIProcessor();
    
    try {
        const result = await processor.processMessage(
            '可以教我玩遊戲嗎?',
            { chatHistory: [], sessionId: 'test' },
            mockOpenAICall
        );
        
        console.log('✅ 處理成功');
        console.log(`📝 回應: "${result.response}"`);
        console.log(`🎯 意圖: ${result.intent}`);
        console.log(`📋 策略: ${result.strategy}`);
        console.log(`🤖 處理模式: ${result.processingMode}`);
        console.log(`🔧 AI 模組: ${result.aiModules?.join(' → ')}`);
        
        // 檢查回應是否符合預期
        const response = result.response;
        const isGoodResponse = 
            !response.includes('Similo 是一款有趣的推理遊戲') && // 不是百科全書開頭
            !response.includes('12張卡片排成4x3的方陣') && // 不包含詳細規則
            (response.includes('幾位玩家') || response.includes('玩家人數')); // 包含環境感知
        
        if (isGoodResponse) {
            console.log('🎉 修復成功！回應符合預期');
        } else {
            console.log('❌ 仍有問題，回應不符合預期');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    }
}

testFix().catch(console.error);
