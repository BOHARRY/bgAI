// 測試雙階段處理系統
const LayeredAIHandler = require('./layered-ai-handler');

// 模擬 OpenAI API 調用
const mockOpenAICall = async (messages) => {
    const systemPrompt = messages[0].content;
    const userMessage = messages[messages.length - 1].content;
    
    console.log('\n📤 模擬 OpenAI 調用:');
    console.log('系統提示詞類型:', systemPrompt.includes('環境感知') ? '第一階段-環境感知' : '第二階段-回應生成');
    console.log('用戶消息:', userMessage);
    
    // 第一階段：意圖分析 + 環境感知
    if (systemPrompt.includes('桌遊意圖分析專家')) {
        // 閒聊類型
        if (userMessage.includes('你好') || userMessage.includes('謝謝') || userMessage.includes('再見')) {
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
        if (userMessage.includes('幾張牌') || userMessage.includes('怎麼放') || userMessage.includes('規則') || userMessage.includes('怎麼玩')) {
            const isStartGame = userMessage.includes('教我怎麼玩') || userMessage.includes('可以教我');

            if (isStartGame) {
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
            } else {
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
        } else if (userMessage.includes('兩個人') || userMessage.includes('2個人')) {
            return `{
  "intent": {
    "type": "start_game",
    "confidence": 0.9,
    "description": "用戶提供了玩家人數資訊"
  },
  "situation_analysis": {
    "is_direct_question": false,
    "needs_environment": false,
    "can_answer_immediately": true,
    "context": "用戶提供人數，可以開始設置"
  },
  "environment_analysis": {
    "detected_info": {
      "player_count": 2,
      "experience_level": null,
      "materials": null
    },
    "missing_critical_info": [],
    "next_question_needed": true,
    "priority_info": "action_guidance"
  },
  "response_strategy": {
    "approach": "environment_sensing",
    "focus": "立即開始遊戲設置",
    "tone": "行動導向"
  }
}`;
        } else if (userMessage.includes('3個人') || userMessage.includes('三個人')) {
            return `{
  "intent": {
    "type": "start_game",
    "confidence": 0.9,
    "description": "用戶提供了玩家人數資訊"
  },
  "situation_analysis": {
    "is_direct_question": false,
    "needs_environment": false,
    "can_answer_immediately": true,
    "context": "用戶提供人數，可以開始設置"
  },
  "environment_analysis": {
    "detected_info": {
      "player_count": 3,
      "experience_level": null,
      "materials": null
    },
    "missing_critical_info": [],
    "next_question_needed": true,
    "priority_info": "action_guidance"
  },
  "response_strategy": {
    "approach": "environment_sensing",
    "focus": "立即開始遊戲設置",
    "tone": "行動導向"
  }
}`;
        }
    }

    // 備用回應
    return `{
  "intent": {
    "type": "chitchat",
    "confidence": 0.5,
    "description": "一般對話"
  },
  "situation_analysis": {
    "is_direct_question": false,
    "needs_environment": false,
    "can_answer_immediately": true,
    "context": "一般互動"
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
    "tone": "輕鬆愉快"
  }
}`;
    
    // 第二階段：回應生成
    if (systemPrompt.includes('Similo AI 陪玩員') && !systemPrompt.includes('桌遊意圖分析專家')) {
        // 閒聊回應
        if (systemPrompt.includes('友善回應') || userMessage.includes('你好')) {
            return '你好！我是 Similo AI 陪玩員 🎭 很高興認識你！有什麼可以幫助你的嗎？';
        }

        // 規則問題直接回答
        if (systemPrompt.includes('直接回答規則問題') || userMessage.includes('幾張牌')) {
            if (userMessage.includes('幾張牌') || userMessage.includes('25張')) {
                return 'Similo 的設置是這樣的：\n\n🎯 **標準設置**：\n- 抽取 **12 張卡片** 排成 4×3 的方陣\n- 其中 1 張是秘密目標（出題者心中決定）\n- 不是 25 張喔！\n\n📋 **遊戲流程**：\n1. 出題者選定其中一張作為秘密目標\n2. 每回合給一張線索卡\n3. 猜題者根據線索淘汰卡片\n\n有其他問題嗎？😊';
            }
        }

        // 環境感知回應
        if (systemPrompt.includes('建立連結') && systemPrompt.includes('player_count')) {
            return '太棒了 🎉 我來當你們的陪玩員！在開始之前，先跟我說說：現在桌上有幾位玩家呢？';
        } else if (systemPrompt.includes('引導設置') && systemPrompt.includes('角色分配')) {
            // 有了玩家人數，立即轉向行動引導
            if (userMessage.includes('3個人') || userMessage.includes('三個人')) {
                return '很好！3個人玩 Similo 很棒 😊 現在我們來快速設置：請從牌堆中抽出 12 張卡片，排成 4×3 的方陣。你們三個人中誰想當出題者呢？';
            } else if (userMessage.includes('2個人') || userMessage.includes('兩個人')) {
                return '很好！兩個人玩 Similo 最棒了 😊 現在我們來快速設置：請從牌堆中抽出 12 張卡片，排成 4×3 的方陣。你們兩個人中誰想當出題者呢？';
            }
        }
    }
    
    return '我理解了！讓我們繼續進行下去 😊';
};

async function testDualStageSystem() {
    console.log('🧪 測試雙階段處理系統\n');

    const handler = new LayeredAIHandler();

    // 確保使用雙階段模式
    handler.switchProcessingMode('dual_stage');

    console.log('=== 測試案例 1：你好嗎？ ===');
    const result1 = await handler.processMessage('你好嗎？', mockOpenAICall);

    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result1.intent);
    console.log('📋 策略:', result1.strategy);
    console.log('💬 最終回應:', result1.response);

    console.log('\n=== 測試案例 2：請問一開始上面要放幾張牌？ ===');
    const result2 = await handler.processMessage('請問一開始上面要放幾張牌？', mockOpenAICall);

    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result2.intent);
    console.log('📋 策略:', result2.strategy);
    console.log('💬 最終回應:', result2.response);

    console.log('\n=== 測試案例 3：你可以教我怎麼玩嗎？ ===');
    const result3 = await handler.processMessage('你可以教我怎麼玩嗎？', mockOpenAICall);
    
    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result3.intent);
    console.log('📋 策略:', result3.strategy);
    console.log('🌍 環境狀態:', JSON.stringify(result3.environmentState, null, 2));
    console.log('🎬 處理流程:', JSON.stringify(result3.processingFlow, null, 2));
    console.log('💬 最終回應:', result3.response);

    console.log('\n=== 測試案例 4：兩個人 ===');
    const result4 = await handler.processMessage('兩個人', mockOpenAICall);
    
    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result4.intent);
    console.log('📋 策略:', result4.strategy);
    console.log('🌍 環境狀態:', JSON.stringify(result4.environmentState, null, 2));
    console.log('🎬 處理流程:', JSON.stringify(result4.processingFlow, null, 2));
    console.log('💬 最終回應:', result4.response);

    console.log('\n=== 測試案例 5：3個人 ===');
    const result5 = await handler.processMessage('3個人', mockOpenAICall);

    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result5.intent);
    console.log('📋 策略:', result5.strategy);
    console.log('🌍 環境狀態:', JSON.stringify(result5.environmentState, null, 2));
    console.log('💬 最終回應:', result5.response);

    console.log('\n=== 測試案例 6：第一次玩 ===');
    const result6 = await handler.processMessage('第一次玩', mockOpenAICall);

    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result6.intent);
    console.log('📋 策略:', result6.strategy);
    console.log('🌍 環境狀態:', JSON.stringify(result6.environmentState, null, 2));
    console.log('💬 最終回應:', result6.response);
    
    // 測試環境狀態追蹤
    console.log('\n=== 環境狀態追蹤 ===');
    const envSummary = handler.getEnvironmentSummary();
    console.log('環境摘要:', JSON.stringify(envSummary, null, 2));
    
    console.log('\n✅ 雙階段處理測試完成！');
    
    // 比較與原有模式的差異
    console.log('\n=== 比較原有模式 ===');
    handler.switchProcessingMode('legacy');
    const legacyResult = await handler.processMessage('你可以教我怎麼玩嗎？', mockOpenAICall);
    console.log('原有模式回應:', legacyResult.response);
    console.log('處理模式:', legacyResult.processingMode);
}

// 執行測試
testDualStageSystem().catch(console.error);
