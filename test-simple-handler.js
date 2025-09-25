// 測試 SimpleAIHandler 的行為
const fs = require('fs');

// 從 api/chat.js 中提取 SimpleAIHandler 類
const apiContent = fs.readFileSync('./api/chat.js', 'utf8');

// 模擬 OpenAI API 調用
function mockOpenAICall(messages) {
    const prompt = messages[0].content;
    
    if (prompt.includes('意圖檢測')) {
        return Promise.resolve(`{
            "intent": "start_game",
            "confidence": 0.9,
            "reasoning": "用戶想要學習遊戲"
        }`);
    } else {
        // 模擬可能的問題回應
        return Promise.resolve('當然可以！😊 我很高興能幫助你學習遊戲。請告訴我你想了解哪一款遊戲的規則，或者有什麼特定的問題，我會盡力解釋清楚！');
    }
}

// 簡化版的 SimpleAIHandler 測試
class TestSimpleAIHandler {
    constructor() {
        this.environmentState = {
            playerCount: null,
            experienceLevel: null,
            materials: null
        };
    }

    async analyzeIntent(userMessage, context, openaiApiCall) {
        const stage1Prompt = `你是 Similo AI 陪玩員的意圖檢測模組。分析用戶意圖並返回 JSON。

用戶消息：「${userMessage}」

請分析用戶的真實意圖，返回以下格式的 JSON：
{
    "intent": "chitchat|rule_question|start_game|game_action|progress_control",
    "confidence": 0.0-1.0,
    "reasoning": "分析原因"
}

⚠️ 重要原則：
- 如果是規則問題，選擇 direct_answer，不要強制收集環境
- 如果是閒聊，選擇 direct_answer，自然回應
- 只有明確想要「開始遊戲」時，才選擇 environment_sensing`;

        const messages = [
            { role: 'system', content: stage1Prompt },
            { role: 'user', content: userMessage }
        ];

        const result = await openaiApiCall(messages);
        return JSON.parse(result);
    }

    async generateResponse(userMessage, intentAnalysis, context, openaiApiCall) {
        const stage2Prompt = `你是 Similo 專門 AI 陪玩員 🎭。你只專注於協助玩家學習和遊玩 Similo 這款推理卡牌遊戲，不處理其他遊戲。

用戶消息：「${userMessage}」
意圖分析：${JSON.stringify(intentAnalysis, null, 2)}

🎯 **重要身份設定**：
- 你是 Similo 專門陪玩員，只處理 Similo 相關內容
- 如果用戶問其他遊戲，要引導回 Similo
- 你是陪玩引導員，不是遊戲參與者

你的職責是：
- 引導玩家設置遊戲
- 解釋規則
- 協調流程
- 絕對不參與實際遊戲

根據意圖分析結果，生成適當的回應：

如果是 chitchat（閒聊）：
- 自然友善地回應
- 可以詢問是否需要幫助

如果是 rule_question（規則問題）：
- 簡潔回答具體問題
- 避免一次性提供所有規則
- 可以詢問是否還有其他問題

如果是 start_game（開始遊戲）：
- 🚫 不要立即解釋所有規則
- ✅ 先詢問玩家人數和經驗
- ✅ 建立連結感，逐步引導
- ✅ 一步一步來，不要資訊轟炸

請生成一個自然、有幫助的回應。`;

        const messages = [
            { role: 'system', content: stage2Prompt },
            { role: 'user', content: userMessage }
        ];

        return await openaiApiCall(messages);
    }

    async processMessage(userMessage, context, openaiApiCall) {
        try {
            // Stage 1: 意圖檢測
            const intentAnalysis = await this.analyzeIntent(userMessage, context, openaiApiCall);
            
            // Stage 2: 回應生成
            const response = await this.generateResponse(userMessage, intentAnalysis, context, openaiApiCall);
            
            return {
                intent: intentAnalysis.intent,
                strategy: 'simple_handler',
                response: response.trim(),
                processingMode: 'simple_ai_handler',
                contextUsed: false,
                historyLength: 0,
                aiModules: ['SimpleAIHandler']
            };
        } catch (error) {
            console.error('SimpleAIHandler 處理失敗:', error);
            return {
                intent: 'error',
                strategy: 'error',
                response: '抱歉，我遇到了技術問題。請稍後再試！',
                processingMode: 'error',
                contextUsed: false,
                historyLength: 0,
                aiModules: []
            };
        }
    }
}

async function testSimpleHandler() {
    console.log('🧪 測試 SimpleAIHandler 行為\n');
    
    const handler = new TestSimpleAIHandler();
    
    try {
        const result = await handler.processMessage(
            '可以教我玩遊戲嗎?',
            { chatHistory: [], sessionId: 'test' },
            mockOpenAICall
        );
        
        console.log('✅ SimpleAIHandler 處理結果:');
        console.log(`📝 回應: "${result.response}"`);
        console.log(`🎯 意圖: ${result.intent}`);
        console.log(`📋 策略: ${result.strategy}`);
        console.log(`🤖 處理模式: ${result.processingMode}`);
        
        // 檢查是否有問題
        const response = result.response;
        const hasProblem = 
            response.includes('你想了解哪一款遊戲') ||
            response.includes('請告訴我你想了解哪一款遊戲');
        
        if (hasProblem) {
            console.log('❌ 發現問題：SimpleAIHandler 仍在問其他遊戲');
        } else {
            console.log('✅ SimpleAIHandler 行為正常');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    }
}

testSimpleHandler().catch(console.error);
