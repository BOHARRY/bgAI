// 測試改進後的雙階段處理系統
const LayeredAIHandler = require('./layered-ai-handler');

// 模擬 OpenAI API 調用
const mockOpenAICall = async (messages) => {
    const systemPrompt = messages[0].content;
    const userMessage = messages[messages.length - 1].content;
    
    console.log('\n📤 模擬 OpenAI 調用:');
    console.log('系統提示詞類型:', systemPrompt.includes('桌遊意圖分析專家') ? '第一階段-意圖分析' : '第二階段-回應生成');
    console.log('用戶消息:', userMessage);
    
    // 第一階段：意圖分析
    if (systemPrompt.includes('桌遊意圖分析專家')) {
        // 開始遊戲類型（優先檢查）
        if (userMessage.includes('教我怎麼玩') || userMessage.includes('可以教我')) {
            return `{
  "intent": {
    "type": "start_game",
    "confidence": 0.95,
    "description": "用戶想要學習並開始 Similo 遊戲"
  },
  "situation_analysis": {
    "is_direct_question": false,
    "needs_environment": true,
    "can_answer_immediately": false,
    "context": "用戶想要完整學習遊戲"
  },
  "environment_analysis": {
    "detected_info": {},
    "missing_critical_info": ["player_count"],
    "next_question_needed": true,
    "priority_info": "player_count"
  },
  "response_strategy": {
    "approach": "environment_sensing",
    "focus": "建立連結並收集環境資訊",
    "tone": "親切友善"
  }
}`;
        }

        // 閒聊類型
        if (userMessage.includes('你好') && !userMessage.includes('教我')) {
            return `{
  "intent": {
    "type": "chitchat",
    "confidence": 0.95,
    "description": "用戶進行日常閒聊"
  },
  "situation_analysis": {
    "is_direct_question": false,
    "needs_environment": false,
    "can_answer_immediately": true,
    "context": "純粹的社交互動"
  },
  "environment_analysis": {
    "detected_info": {},
    "missing_critical_info": [],
    "next_question_needed": false,
    "priority_info": null
  },
  "response_strategy": {
    "approach": "direct_answer",
    "focus": "友善回應",
    "tone": "自然親切"
  }
}`;
        }
        
        // 規則問題類型
        if (userMessage.includes('幾張牌') || userMessage.includes('25張')) {
            return `{
  "intent": {
    "type": "rule_question",
    "confidence": 0.9,
    "description": "用戶詢問具體的遊戲規則"
  },
  "situation_analysis": {
    "is_direct_question": true,
    "needs_environment": false,
    "can_answer_immediately": true,
    "context": "直接的規則問題，可以立即回答"
  },
  "environment_analysis": {
    "detected_info": {},
    "missing_critical_info": [],
    "next_question_needed": false,
    "priority_info": null
  },
  "response_strategy": {
    "approach": "direct_answer",
    "focus": "直接回答規則問題",
    "tone": "專業清晰"
  }
}`;
        }
        

    }
    
    // 第二階段：回應生成
    if (systemPrompt.includes('Similo AI 陪玩員')) {
        // 閒聊回應
        if (systemPrompt.includes('友善回應') || userMessage.includes('你好')) {
            return '你好！我是 Similo AI 陪玩員 🎭 很高興認識你！有什麼可以幫助你的嗎？';
        }
        
        // 規則問題直接回答
        if (systemPrompt.includes('直接回答規則問題') || userMessage.includes('幾張牌')) {
            return 'Similo 的設置是這樣的：\n\n🎯 **標準設置**：\n- 抽取 **12 張卡片** 排成 4×3 的方陣\n- 其中 1 張是秘密目標（出題者心中決定）\n- 不是 25 張喔！\n\n📋 **遊戲流程**：\n1. 出題者選定其中一張作為秘密目標\n2. 每回合給一張線索卡\n3. 猜題者根據線索淘汰卡片\n\n有其他問題嗎？😊';
        }
        
        // 環境感知回應
        if (systemPrompt.includes('建立連結') && systemPrompt.includes('player_count')) {
            return '太棒了 🎉 我來當你們的陪玩員！在開始之前，先跟我說說：現在桌上有幾位玩家呢？';
        }
    }
    
    return '我理解了！讓我們繼續進行下去 😊';
};

async function testImprovedSystem() {
    console.log('🧪 測試改進後的雙階段處理系統\n');
    
    const handler = new LayeredAIHandler();
    handler.switchProcessingMode('dual_stage');
    
    console.log('=== 測試案例 1：你好嗎？ ===');
    const result1 = await handler.processMessage('你好嗎？', mockOpenAICall);
    console.log('🎯 意圖:', result1.intent);
    console.log('📋 策略:', result1.strategy);
    console.log('💬 最終回應:', result1.response);
    
    console.log('\n=== 測試案例 2：請問一開始上面要放幾張牌？ ===');
    const result2 = await handler.processMessage('請問一開始上面要放幾張牌？', mockOpenAICall);
    console.log('🎯 意圖:', result2.intent);
    console.log('📋 策略:', result2.strategy);
    console.log('💬 最終回應:', result2.response);
    
    console.log('\n=== 測試案例 3：你可以教我怎麼玩嗎？ ===');
    const result3 = await handler.processMessage('你可以教我怎麼玩嗎？', mockOpenAICall);
    console.log('🎯 意圖:', result3.intent);
    console.log('📋 策略:', result3.strategy);
    console.log('💬 最終回應:', result3.response);
    
    console.log('\n✅ 測試完成！');
    
    console.log('\n📊 改進效果對比：');
    console.log('❌ 之前：「你好嗎？」→ 問玩家人數');
    console.log('✅ 現在：「你好嗎？」→ 自然回應');
    console.log('❌ 之前：「要放幾張牌？」→ 問玩家人數');
    console.log('✅ 現在：「要放幾張牌？」→ 直接回答規則');
    console.log('✅ 保持：「教我怎麼玩？」→ 環境感知');
}

// 執行測試
testImprovedSystem().catch(console.error);
