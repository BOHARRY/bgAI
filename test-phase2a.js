// 測試 Phase 2A: Context Analyzer + Enhanced Processing
const ContextAnalyzer = require('./context-analyzer.js');
const MultiAIProcessor = require('./multi-ai-processor.js');

// 模擬 OpenAI API 調用
function mockOpenAICall(messages) {
    const prompt = messages[0].content;
    
    // 根據 prompt 類型返回模擬結果
    if (prompt.includes('上下文分析師')) {
        // 模擬 Context Analyzer 的回應
        return Promise.resolve(`{
            "continuity_analysis": {
                "is_continuous": true,
                "continuity_type": "delayed_response",
                "confidence": 0.9,
                "reasoning": "用戶回答了第2輪對話中關於玩家人數的問題"
            },
            "topic_analysis": {
                "current_topic": "player_count_response",
                "previous_topic": "clue_card_rules",
                "topic_switch_detected": true,
                "return_to_topic": "player_count_question"
            },
            "context_relevance": {
                "relevant_history": [0, 1],
                "irrelevant_history": [2, 3],
                "key_information": {
                    "pending_question": "現在桌上有幾位玩家呢？",
                    "question_asker": "assistant",
                    "question_timestamp": 1
                }
            },
            "conversation_state": {
                "incomplete_threads": ["player_count_setup"],
                "completed_threads": ["clue_card_explanation"],
                "current_phase": "setup"
            }
        }`);
    } else if (prompt.includes('意圖分析專家')) {
        // 模擬增強版意圖檢測的回應
        return Promise.resolve(`{
            "intent": {
                "type": "delayed_response",
                "confidence": 0.95,
                "description": "用戶回答了之前關於玩家人數的問題",
                "context_influenced": true
            },
            "situation_analysis": {
                "is_continuous": true,
                "needs_environment": false,
                "can_answer_immediately": true,
                "context": "這是對之前問題的延遲回應"
            },
            "response_strategy": {
                "approach": "context_bridge",
                "focus": "確認理解並繼續設置流程",
                "tone": "自然友善",
                "should_reference_context": true
            }
        }`);
    } else if (prompt.includes('Similo AI 陪玩員')) {
        // 模擬回應生成的結果
        return Promise.resolve('太好了！4個人玩 Similo 很棒 😊 我注意到剛才你問了線索卡的問題，現在我們先完成設置，然後我會詳細解釋線索卡的使用方法。你們四個人中誰想當出題者呢？');
    } else {
        // 默認回應
        return Promise.resolve('這是一個模擬的 AI 回應。');
    }
}

// 測試用例
const testCases = [
    {
        name: '延遲回應測試',
        message: '我們有4個人',
        chatHistory: [
            { role: 'user', content: '你可以教我怎麼玩嗎？' },
            { role: 'assistant', content: '太棒了！先跟我說說：現在桌上有幾位玩家呢？' },
            { role: 'user', content: '線索卡要怎麼放？' },
            { role: 'assistant', content: '線索卡的擺放很重要：直放表示相似，橫放表示不相似...' }
        ]
    },
    {
        name: '話題跳躍測試',
        message: '這遊戲適合小朋友嗎？',
        chatHistory: [
            { role: 'user', content: '你可以教我怎麼玩嗎？' },
            { role: 'assistant', content: '太棒了！先跟我說說：現在桌上有幾位玩家呢？' }
        ]
    },
    {
        name: '首次對話測試',
        message: '你好嗎？',
        chatHistory: []
    },
    {
        name: '連續對話測試',
        message: '3個人',
        chatHistory: [
            { role: 'user', content: '你可以教我怎麼玩嗎？' },
            { role: 'assistant', content: '太棒了！先跟我說說：現在桌上有幾位玩家呢？' }
        ]
    }
];

// 執行測試
async function runTests() {
    console.log('🧪 開始 Phase 2A 測試\n');
    
    // 測試 Context Analyzer
    console.log('📋 測試 1: Context Analyzer 獨立測試');
    const contextAnalyzer = new ContextAnalyzer();
    
    try {
        const analysis = await contextAnalyzer.analyze(
            '我們有4個人',
            testCases[0].chatHistory,
            mockOpenAICall
        );
        
        console.log('✅ Context Analyzer 測試成功');
        console.log('  - 連續性檢測:', analysis.continuity_analysis?.is_continuous);
        console.log('  - 話題切換:', analysis.topic_analysis?.topic_switch_detected);
        console.log('  - 相關歷史:', analysis.context_relevance?.relevant_history?.length);
    } catch (error) {
        console.error('❌ Context Analyzer 測試失敗:', error);
    }
    
    console.log('\n📋 測試 2: Multi-AI Processor 完整測試');
    const processor = new MultiAIProcessor();
    
    for (const testCase of testCases) {
        console.log(`\n🎯 測試場景: ${testCase.name}`);
        console.log(`📝 用戶消息: "${testCase.message}"`);
        console.log(`📚 歷史記錄: ${testCase.chatHistory.length} 條`);
        
        try {
            const context = {
                chatHistory: testCase.chatHistory,
                timestamp: Date.now(),
                sessionId: 'test_session'
            };
            
            const result = await processor.processMessage(
                testCase.message,
                context,
                mockOpenAICall
            );
            
            console.log('✅ 處理成功');
            console.log(`  - 意圖: ${result.intent}`);
            console.log(`  - 策略: ${result.strategy}`);
            console.log(`  - 處理模式: ${result.processingMode}`);
            console.log(`  - AI 模組: ${result.aiModules?.join(' + ')}`);
            console.log(`  - 上下文使用: ${result.contextUsed ? '是' : '否'}`);
            console.log(`  - 回應長度: ${result.response?.length || 0} 字符`);
            
            if (result.contextAnalysis) {
                console.log(`  - 連續性: ${result.contextAnalysis.continuity_analysis?.is_continuous ? '是' : '否'}`);
                console.log(`  - 話題切換: ${result.contextAnalysis.topic_analysis?.topic_switch_detected ? '是' : '否'}`);
            }
            
        } catch (error) {
            console.error('❌ 處理失敗:', error.message);
        }
    }
    
    console.log('\n📋 測試 3: 降級機制測試');
    
    // 模擬 Context Analyzer 失敗
    function failingOpenAICall() {
        throw new Error('模擬 API 調用失敗');
    }
    
    try {
        const result = await processor.processMessage(
            '測試降級',
            { chatHistory: [], sessionId: 'test' },
            failingOpenAICall
        );
        
        console.log('✅ 降級機制正常工作');
        console.log(`  - 處理模式: ${result.processingMode}`);
        console.log(`  - AI 模組: ${result.aiModules?.join(' + ')}`);
        
    } catch (error) {
        console.error('❌ 降級機制失敗:', error);
    }
    
    console.log('\n📋 測試 4: 性能測試');
    
    const startTime = Date.now();
    
    try {
        await processor.processMessage(
            '性能測試消息',
            {
                chatHistory: testCases[0].chatHistory,
                sessionId: 'perf_test'
            },
            mockOpenAICall
        );
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ 性能測試完成`);
        console.log(`  - 處理時間: ${duration}ms`);
        console.log(`  - 性能評級: ${duration < 1000 ? '優秀' : duration < 3000 ? '良好' : '需要優化'}`);
        
    } catch (error) {
        console.error('❌ 性能測試失敗:', error);
    }
    
    console.log('\n🎉 Phase 2A 測試完成！');
    
    // 顯示處理器狀態
    console.log('\n📊 處理器狀態:');
    const status = processor.getProcessorStatus();
    console.log(JSON.stringify(status, null, 2));
}

// 執行測試
runTests().catch(console.error);
