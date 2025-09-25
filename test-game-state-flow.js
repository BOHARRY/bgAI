const MultiAIProcessor = require('./multi-ai-processor');
const GameStateManager = require('./game-state-manager');

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
            max_tokens: 200  // 限制回應長度，確保簡潔
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function testGameStateFlow() {
    console.log('🧪 測試遊戲狀態感知流程...\n');
    
    const processor = new MultiAIProcessor();
    const gameStateManager = new GameStateManager();
    
    // 模擬完整的遊戲設置流程
    let context = [];
    
    const gameFlow = [
        {
            step: 1,
            message: "你可以教我怎麼玩嗎？",
            expectedIntent: "start_game",
            expectedBehavior: "詢問人數，不要長篇介紹",
            expectedPhase: "player_count_setup"
        },
        {
            step: 2,
            message: "我們有三個人",
            expectedIntent: "environment_info",
            expectedBehavior: "進入卡牌佈局設置",
            expectedPhase: "card_layout_setup"
        },
        {
            step: 3,
            message: "排好了",
            expectedIntent: "step_completion",
            expectedBehavior: "進入秘密人物選擇",
            expectedPhase: "secret_selection"
        },
        {
            step: 4,
            message: "選好了",
            expectedIntent: "step_completion",
            expectedBehavior: "進入手牌設置",
            expectedPhase: "hand_cards_setup"
        },
        {
            step: 5,
            message: "準備好了",
            expectedIntent: "step_completion",
            expectedBehavior: "開始第1回合",
            expectedPhase: "round_1_clue"
        }
    ];
    
    for (let i = 0; i < gameFlow.length; i++) {
        const step = gameFlow[i];
        console.log(`\n=== 步驟 ${step.step}: ${step.message} ===`);
        console.log(`期望意圖: ${step.expectedIntent}`);
        console.log(`期望行為: ${step.expectedBehavior}`);
        
        try {
            const result = await processor.processMessage(step.message, context, callOpenAI);
            
            console.log(`\n📝 實際結果:`);
            console.log(`意圖: ${result.intent}`);
            console.log(`策略: ${result.strategy}`);
            console.log(`回應長度: ${result.response.length} 字符`);
            console.log(`回應: ${result.response}`);
            
            // 驗證意圖檢測
            if (result.intent === step.expectedIntent) {
                console.log(`✅ 意圖檢測正確`);
            } else {
                console.log(`❌ 意圖檢測錯誤，期望: ${step.expectedIntent}，實際: ${result.intent}`);
            }
            
            // 檢查回應品質
            if (result.response.length > 150) {
                console.log(`⚠️  回應過長 (${result.response.length} 字符)`);
            } else {
                console.log(`✅ 回應長度適中`);
            }
            
            // 檢查是否包含明確指令
            const hasInstruction = result.response.includes('請') || 
                                 result.response.includes('現在') || 
                                 result.response.includes('接下來');
            if (hasInstruction) {
                console.log(`✅ 包含明確指令`);
            } else {
                console.log(`❌ 缺少明確指令`);
            }
            
            // 檢查角色術語一致性
            const hasConsistentTerms = !result.response.includes('隱藏者') && 
                                     !result.response.includes('玩家選角色');
            if (hasConsistentTerms) {
                console.log(`✅ 角色術語一致`);
            } else {
                console.log(`❌ 角色術語混亂`);
            }
            
            // 更新上下文
            context.push({ role: 'user', content: step.message });
            context.push({ role: 'assistant', content: result.response });
            
            // 模擬遊戲狀態推進（實際應該由系統自動處理）
            if (gameStateManager.canAdvancePhase(step.message, null)) {
                const completionData = {};
                if (step.message.includes('三個人')) {
                    completionData.playerCount = 3;
                }
                gameStateManager.advanceToNextPhase(completionData);
                console.log(`🎮 遊戲狀態推進到: ${gameStateManager.currentState.phase}`);
            }
            
        } catch (error) {
            console.error('❌ 測試失敗:', error);
        }
        
        console.log('\n' + '='.repeat(80));
    }
    
    // 測試遊戲狀態查詢
    console.log('\n=== 額外測試：遊戲狀態查詢 ===');
    try {
        const queryResult = await processor.processMessage("現在該做什麼？", context, callOpenAI);
        console.log(`查詢回應: ${queryResult.response}`);
        
        if (queryResult.intent === 'game_state_query') {
            console.log(`✅ 正確識別狀態查詢`);
        } else {
            console.log(`❌ 狀態查詢識別錯誤: ${queryResult.intent}`);
        }
    } catch (error) {
        console.error('❌ 狀態查詢測試失敗:', error);
    }
    
    // 測試規則澄清
    console.log('\n=== 額外測試：規則澄清 ===');
    try {
        const ruleResult = await processor.processMessage("直放是什麼意思？", context, callOpenAI);
        console.log(`規則回應: ${ruleResult.response}`);
        
        if (ruleResult.intent === 'rule_clarification') {
            console.log(`✅ 正確識別規則澄清`);
        } else {
            console.log(`❌ 規則澄清識別錯誤: ${ruleResult.intent}`);
        }
    } catch (error) {
        console.error('❌ 規則澄清測試失敗:', error);
    }
    
    console.log('\n🎉 測試完成！');
}

testGameStateFlow();
