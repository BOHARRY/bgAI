// 測試新的分層架構系統
const LayeredAIHandler = require('./layered-ai-handler');

// 模擬 OpenAI API 調用
const mockOpenAICall = async (messages) => {
    console.log('\n📤 模擬 OpenAI 調用:');
    console.log('系統提示詞長度:', messages[0].content.length);
    console.log('用戶消息:', messages[messages.length - 1].content);
    
    // 根據系統提示詞返回模擬回應
    const systemPrompt = messages[0].content;
    
    if (systemPrompt.includes('greeting')) {
        return '嗨！我是你的 Similo AI 陪玩員 🎭 很高興認識你！你準備好要開始這個有趣的推理遊戲了嗎？';
    } else if (systemPrompt.includes('check_preparation')) {
        return '太好了！你手邊有 Similo 卡牌嗎？如果沒有的話，我們也可以用其他卡片來玩喔！';
    } else if (systemPrompt.includes('role_selection')) {
        return '現在我們要選擇角色！Similo 有兩個角色：\n\n🎯 **出題者**：選擇秘密角色，給線索\n🧠 **猜題者**：根據線索猜測並淘汰\n\n你想當哪一個呢？如果你選猜題者，我就當出題者！';
    } else {
        return '我理解了！讓我們繼續進行下去 😊';
    }
};

async function testLayeredSystem() {
    console.log('🧪 測試分層架構系統\n');
    
    const handler = new LayeredAIHandler();
    
    // 測試案例 1：用戶詢問怎麼玩
    console.log('=== 測試案例 1：你可以教我怎麼玩嗎？ ===');
    const result1 = await handler.processMessage('你可以教我怎麼玩嗎？', mockOpenAICall);
    console.log('🎯 意圖:', result1.intent);
    console.log('📋 策略:', result1.strategy);
    console.log('🎬 流程:', result1.flowInfo ? result1.flowInfo.step : '無');
    console.log('💬 回應:', result1.response);
    console.log('🎮 遊戲狀態:', result1.gameState);
    
    // 測試案例 2：用戶回應準備好了
    console.log('\n=== 測試案例 2：我準備好了 ===');
    const result2 = await handler.processMessage('我準備好了', mockOpenAICall);
    console.log('🎯 意圖:', result2.intent);
    console.log('📋 策略:', result2.strategy);
    console.log('🎬 流程:', result2.flowInfo ? result2.flowInfo.step : '無');
    console.log('💬 回應:', result2.response);
    
    // 測試案例 3：用戶選擇角色
    console.log('\n=== 測試案例 3：我想當猜題者 ===');
    const result3 = await handler.processMessage('我想當猜題者', mockOpenAICall);
    console.log('🎯 意圖:', result3.intent);
    console.log('📋 策略:', result3.strategy);
    console.log('🎬 流程:', result3.flowInfo ? result3.flowInfo.step : '無');
    console.log('💬 回應:', result3.response);
    console.log('🎮 遊戲狀態:', result3.gameState);
    
    console.log('\n✅ 測試完成！');
}

// 執行測試
testLayeredSystem().catch(console.error);
