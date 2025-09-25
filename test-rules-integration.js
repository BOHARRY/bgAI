// 測試規則文件整合效果
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
    } else if (prompt.includes('Similo 專門 AI 陪玩員的意圖檢測專家')) {
        return Promise.resolve(`{
            "intent": {
                "primary_intent": "start_game",
                "confidence": 0.95,
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
                "sensing_type": "player_count"
            }
        }`);
    } else if (prompt.includes('Similo 專門 AI 陪玩員') && prompt.includes('完整規則知識庫')) {
        // 這裡應該生成包含 Similo 專門知識的回應
        return Promise.resolve('太棒了！我是 Similo 專門 AI 陪玩員 🎭 我來協助你們學習這款推理卡牌遊戲！在開始之前，先跟我說說：現在桌上有幾位玩家呢？');
    } else {
        return Promise.resolve('我是 Similo 專門 AI 陪玩員，很高興為你服務！');
    }
}

async function testRulesIntegration() {
    console.log('🧪 測試規則文件整合效果\n');
    
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
        
        // 檢查回應是否體現了 Similo 專門性
        const response = result.response;
        const hasSimiloSpecialty = 
            response.includes('Similo') && // 明確提到 Similo
            !response.includes('你想了解哪一款遊戲') && // 不問其他遊戲
            !response.includes('請告訴我你想了解哪一款遊戲') && // 不問其他遊戲
            (response.includes('幾位玩家') || response.includes('玩家人數')); // 進行環境感知
        
        if (hasSimiloSpecialty) {
            console.log('🎉 規則整合成功！AI 展現了 Similo 專門性');
        } else {
            console.log('❌ 仍有問題，AI 沒有展現 Similo 專門性');
            console.log('  檢查項目:');
            console.log(`  - 包含 Similo: ${response.includes('Similo')}`);
            console.log(`  - 不問其他遊戲: ${!response.includes('你想了解哪一款遊戲')}`);
            console.log(`  - 環境感知: ${response.includes('幾位玩家') || response.includes('玩家人數')}`);
        }
        
        // 檢查 ResponseGenerator 是否載入了規則
        console.log('\n📚 規則載入狀態檢查:');
        const generator = processor.responseGenerator;
        if (generator.similoRules.loaded) {
            console.log('✅ 規則文件載入成功');
            console.log(`  - 遊戲規則: ${generator.similoRules.gameRules.length} 字符`);
            console.log(`  - 角色規則: ${generator.similoRules.roleRules.length} 字符`);
        } else {
            console.log('❌ 規則文件載入失敗，使用備用規則');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        console.error(error.stack);
    }
}

testRulesIntegration().catch(console.error);
