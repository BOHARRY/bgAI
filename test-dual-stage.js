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
    if (systemPrompt.includes('環境感知和意圖分析專家')) {
        if (userMessage.includes('怎麼玩') || userMessage.includes('教我')) {
            return `{
  "intent": {
    "type": "start_game",
    "confidence": 0.95,
    "description": "用戶想要學習並開始 Similo 遊戲"
  },
  "environment_analysis": {
    "detected_info": {
      "player_count": null,
      "experience_level": null,
      "materials": null
    },
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
        } else if (userMessage.includes('兩個人') || userMessage.includes('2個人')) {
            return `{
  "intent": {
    "type": "start_game",
    "confidence": 0.9,
    "description": "用戶提供了玩家人數資訊"
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
    
    // 第二階段：回應生成
    if (systemPrompt.includes('Similo AI 陪玩員') && !systemPrompt.includes('環境感知和意圖分析專家')) {
        if (systemPrompt.includes('建立連結') && systemPrompt.includes('player_count')) {
            return '太棒了 🎉 我來當你們的陪玩員！在開始之前，先跟我說說：現在桌上有幾位玩家呢？';
        } else if (systemPrompt.includes('引導設置') && systemPrompt.includes('角色分配')) {
            // 有了玩家人數，立即轉向行動引導
            if (userMessage.includes('3個人') || userMessage.includes('三個人')) {
                return '很好！3個人玩 Similo 很棒 😊 現在我們來快速設置：請從牌堆中抽出 12 張卡片，排成 4×3 的方陣。你們三個人中誰想當出題者呢？';
            } else if (userMessage.includes('2個人') || userMessage.includes('兩個人')) {
                return '很好！兩個人玩 Similo 最棒了 😊 現在我們來快速設置：請從牌堆中抽出 12 張卡片，排成 4×3 的方陣。你們兩個人中誰想當出題者呢？';
            }
        } else if (systemPrompt.includes('experience_level')) {
            return '很好！兩個人玩 Similo 最棒了 😊 你們之前玩過 Similo 嗎？還是第一次接觸？';
        } else if (systemPrompt.includes('materials')) {
            return '沒問題！我會一步步帶你們 🎯 你們手邊有 Similo 卡牌嗎？如果沒有，我也可以教你們用其他卡片代替！';
        }
    }
    
    return '我理解了！讓我們繼續進行下去 😊';
};

async function testDualStageSystem() {
    console.log('🧪 測試雙階段處理系統\n');
    
    const handler = new LayeredAIHandler();
    
    // 確保使用雙階段模式
    handler.switchProcessingMode('dual_stage');
    
    console.log('=== 測試案例 1：你可以教我怎麼玩嗎？ ===');
    const result1 = await handler.processMessage('你可以教我怎麼玩嗎？', mockOpenAICall);
    
    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result1.intent);
    console.log('📋 策略:', result1.strategy);
    console.log('🌍 環境狀態:', JSON.stringify(result1.environmentState, null, 2));
    console.log('🎬 處理流程:', JSON.stringify(result1.processingFlow, null, 2));
    console.log('💬 最終回應:', result1.response);
    
    console.log('\n=== 測試案例 2：兩個人 ===');
    const result2 = await handler.processMessage('兩個人', mockOpenAICall);
    
    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result2.intent);
    console.log('📋 策略:', result2.strategy);
    console.log('🌍 環境狀態:', JSON.stringify(result2.environmentState, null, 2));
    console.log('🎬 處理流程:', JSON.stringify(result2.processingFlow, null, 2));
    console.log('💬 最終回應:', result2.response);
    
    console.log('\n=== 測試案例 3：3個人 ===');
    const result3 = await handler.processMessage('3個人', mockOpenAICall);

    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result3.intent);
    console.log('📋 策略:', result3.strategy);
    console.log('🌍 環境狀態:', JSON.stringify(result3.environmentState, null, 2));
    console.log('💬 最終回應:', result3.response);

    console.log('\n=== 測試案例 4：第一次玩 ===');
    const result4 = await handler.processMessage('第一次玩', mockOpenAICall);

    console.log('\n📊 處理結果:');
    console.log('🎯 意圖:', result4.intent);
    console.log('📋 策略:', result4.strategy);
    console.log('🌍 環境狀態:', JSON.stringify(result4.environmentState, null, 2));
    console.log('💬 最終回應:', result4.response);
    
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
