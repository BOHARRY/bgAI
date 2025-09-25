// Vercel API 路由 - 處理 AI 聊天請求

// 導入多 AI 處理器
const MultiAIProcessor = require('../multi-ai-processor.js');

// 簡化版的 AI 處理器 - 直接在這裡實現核心邏輯（保留作為降級選項）
class SimpleAIHandler {
    constructor() {
        this.environmentState = {
            playerCount: null,
            experienceLevel: null,
            materials: null
        };
    }

    async processMessage(userMessage, context, openaiApiCall) {
        // 第一階段：意圖分析（包含上下文）
        const intentAnalysis = await this.analyzeIntent(userMessage, context, openaiApiCall);

        // 第二階段：回應生成（包含上下文）
        const response = await this.generateResponse(userMessage, intentAnalysis, context, openaiApiCall);

        return {
            intent: intentAnalysis.intent.type,
            strategy: intentAnalysis.response_strategy.approach,
            response: response,
            processingMode: 'dual_stage',
            contextUsed: context ? true : false,
            historyLength: context?.chatHistory?.length || 0
        };
    }

    async analyzeIntent(userMessage, context, openaiApiCall) {
        // 構建上下文信息
        let contextInfo = '';
        if (context && context.chatHistory && context.chatHistory.length > 0) {
            contextInfo = `\n\n📚 **對話上下文**：\n`;
            context.chatHistory.forEach((msg, index) => {
                contextInfo += `${index + 1}. ${msg.role === 'user' ? '用戶' : 'AI'}: ${msg.content}\n`;
            });
            contextInfo += `\n當前是第 ${context.chatHistory.length + 1} 輪對話。`;
        }

        const stage1Prompt = `你是 Similo 專門 AI 陪玩員的意圖分析模組。你只處理 Similo 這款推理卡牌遊戲相關的內容。精準分析用戶的真實意圖和當下狀況。

用戶消息：「${userMessage}」${contextInfo}

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

    async generateResponse(userMessage, intentAnalysis, context, openaiApiCall) {
        // 構建上下文信息
        let contextInfo = '';
        if (context && context.chatHistory && context.chatHistory.length > 0) {
            contextInfo = `\n\n📚 **對話歷史**：\n`;
            context.chatHistory.forEach((msg, index) => {
                contextInfo += `${index + 1}. ${msg.role === 'user' ? '用戶' : 'AI'}: ${msg.content}\n`;
            });

            // 分析對話連續性
            const lastAIMessage = context.chatHistory.filter(msg => msg.role === 'assistant').pop();
            if (lastAIMessage) {
                contextInfo += `\n🔗 **上下文分析**：上一次 AI 回應是「${lastAIMessage.content.substring(0, 50)}...」`;

                // 檢測是否是連續對話
                if (this.isDirectResponse(userMessage, lastAIMessage.content)) {
                    contextInfo += `\n✅ 這似乎是對上一個問題的直接回應，請保持對話連續性。`;
                }
            }
        }

        const stage2Prompt = `你是 Similo 專門 AI 陪玩員 🎭。你只專注於協助玩家學習和遊玩 Similo 這款推理卡牌遊戲，不處理其他遊戲。

用戶消息：「${userMessage}」
意圖分析：${JSON.stringify(intentAnalysis, null, 2)}${contextInfo}

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

    // 檢測是否是對上一個問題的直接回應
    isDirectResponse(userMessage, lastAIMessage) {
        const userMsg = userMessage.toLowerCase();
        const aiMsg = lastAIMessage.toLowerCase();

        // 檢測數字回應（如：「3個人」回應「幾位玩家」）
        if (/\d+/.test(userMsg) && (aiMsg.includes('幾') || aiMsg.includes('多少'))) {
            return true;
        }

        // 檢測確認回應（如：「好的」「是的」）
        if (['好的', '是的', '對', '沒錯', '可以', '行'].some(word => userMsg.includes(word))) {
            return true;
        }

        // 檢測角色選擇回應（如：「我當出題者」）
        if (userMsg.includes('我當') || userMsg.includes('我來')) {
            return true;
        }

        return false;
    }
}

// 全局 AI 處理器實例
let aiHandler = new SimpleAIHandler(); // 保留作為降級選項
let multiAIHandler = new MultiAIProcessor(); // 新的多 AI 處理器

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
        const { message, context } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        console.log(`🎭 收到用戶消息: "${message}"`);

        // 記錄上下文信息
        if (context) {
            console.log(`📚 上下文信息: 歷史=${context.chatHistory?.length || 0}條, 會話=${context.sessionId}`);
        }

        // 使用多 AI 處理器處理消息（Phase 2B - 完整三模組架構）
        let result;
        try {
            console.log(`🚀 使用多 AI 處理器 (Phase 2B - 三模組架構)`);
            result = await multiAIHandler.processMessage(message, context, callOpenAI);
        } catch (error) {
            console.error(`❌ 多 AI 處理器失敗，降級到簡單處理器`, error);
            console.error(`錯誤詳情:`, error.stack);
            console.log(`🔄 使用 SimpleAIHandler 降級處理`);
            result = await aiHandler.processMessage(message, context, callOpenAI);
        }

        console.log(`🎯 處理結果: 意圖=${result.intent}, 策略=${result.strategy}, 模式=${result.processingMode}`);

        const assistantMessage = result.response;

        // 返回結果
        res.status(200).json({
            success: true,
            message: assistantMessage,
            debug: {
                intent: result.intent,
                strategy: result.strategy,
                processingMode: result.processingMode || 'dual_stage',
                contextUsed: result.contextUsed || false,
                historyLength: result.historyLength || 0,
                sessionId: context?.sessionId || 'no-session',
                aiModules: result.aiModules || [],
                contextAnalysis: result.contextAnalysis || null
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
