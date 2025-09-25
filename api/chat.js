// Vercel API 路由 - 處理 AI 聊天請求

// 簡化版的 AI 處理器 - 直接在這裡實現核心邏輯
class SimpleAIHandler {
    constructor() {
        this.environmentState = {
            playerCount: null,
            experienceLevel: null,
            materials: null
        };
    }

    async processMessage(userMessage, openaiApiCall) {
        // 第一階段：意圖分析
        const intentAnalysis = await this.analyzeIntent(userMessage, openaiApiCall);

        // 第二階段：回應生成
        const response = await this.generateResponse(userMessage, intentAnalysis, openaiApiCall);

        return {
            intent: intentAnalysis.intent.type,
            strategy: intentAnalysis.response_strategy.approach,
            response: response,
            processingMode: 'dual_stage'
        };
    }

    async analyzeIntent(userMessage, openaiApiCall) {
        const stage1Prompt = `你是桌遊意圖分析專家。精準分析用戶的真實意圖和當下狀況。

用戶消息：「${userMessage}」

🎯 分析重點：
1. **真實意圖判斷** - 用戶現在真正想要什麼？
2. **情境感知** - 這是閒聊、規則問題、還是想開始遊戲？
3. **環境需求** - 回答這個問題是否真的需要環境資訊？

📋 意圖類型說明：
- **chitchat** - 純聊天（你好、謝謝等）
- **rule_question** - 規則問題（可以直接回答，不需要環境資訊）
- **start_game** - 想要開始遊戲（需要環境感知）
- **game_action** - 遊戲中的行動（需要遊戲狀態）
- **progress_control** - 流程控制（暫停、重來等）

請分析並回傳 JSON 格式：
{
  "intent": {
    "type": "選擇最符合的意圖類型",
    "confidence": 0.95,
    "description": "具體描述用戶想要什麼"
  },
  "situation_analysis": {
    "is_direct_question": true,
    "needs_environment": false,
    "can_answer_immediately": true,
    "context": "用戶直接問規則，可以立即回答"
  },
  "response_strategy": {
    "approach": "direct_answer|environment_sensing|guided_action",
    "focus": "根據意圖決定回應重點",
    "tone": "自然友善"
  }
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

    async generateResponse(userMessage, intentAnalysis, openaiApiCall) {
        const stage2Prompt = `你是 Similo AI 陪玩員。根據意圖分析結果生成回應。

用戶消息：「${userMessage}」
意圖分析：${JSON.stringify(intentAnalysis, null, 2)}

你是陪玩引導員，不是遊戲參與者。你的職責是：
- 引導玩家設置遊戲
- 解釋規則
- 協調流程
- 絕對不參與實際遊戲

根據意圖分析結果，生成適當的回應：

如果是 chitchat（閒聊）：
- 自然友善地回應
- 可以詢問是否需要幫助

如果是 rule_question（規則問題）：
- 直接回答規則問題
- 提供清晰的解釋
- 可以詢問是否還有其他問題

如果是 start_game（開始遊戲）：
- 先詢問玩家人數
- 建立連結感
- 準備引導設置

請生成一個自然、有幫助的回應。`;

        const messages = [
            { role: 'system', content: stage2Prompt },
            { role: 'user', content: userMessage }
        ];

        return await openaiApiCall(messages);
    }
}

// 全局 AI 處理器實例
let aiHandler = new SimpleAIHandler();

// OpenAI API 調用函數
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
            max_tokens: 1000,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// 主要 API 處理函數
module.exports = async function handler(req, res) {
    // 設置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 處理 OPTIONS 請求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只允許 POST 請求
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { message } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        console.log(`🎭 收到用戶消息: "${message}"`);

        // 使用 AI 處理器處理消息
        const result = await aiHandler.processMessage(message, callOpenAI);

        console.log(`🎯 處理結果: 意圖=${result.intent}, 策略=${result.strategy}`);

        const assistantMessage = result.response;

        // 返回結果
        res.status(200).json({
            success: true,
            message: assistantMessage,
            debug: {
                intent: result.intent,
                strategy: result.strategy,
                processingMode: result.processingMode || 'dual_stage'
            }
        });

    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}
