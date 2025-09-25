// 雙階段 AI 處理器 - 第一次意圖分析，第二次針對性回應
const EnvironmentSensor = require('./environment-sensor');
const EnvironmentState = require('./environment-state');

class DualStageProcessor {
    constructor() {
        this.environmentSensor = new EnvironmentSensor();
        this.environmentState = new EnvironmentState();
    }

    // 主要處理函數 - 雙階段處理
    async processMessage(userMessage, openaiApiCall, chatHistory = []) {
        try {
            console.log(`🎬 開始雙階段處理: "${userMessage}"`);

            // 自動從用戶回應中更新環境
            this.environmentState.autoUpdateFromResponse(userMessage);

            // 第一階段：意圖分析 + 環境感知
            const stage1Result = await this.stage1_IntentAndEnvironment(userMessage, openaiApiCall);
            console.log(`🎯 第一階段完成:`, stage1Result);

            // 第二階段：針對性回應生成
            const stage2Result = await this.stage2_ContextualResponse(
                userMessage, 
                stage1Result, 
                openaiApiCall, 
                chatHistory
            );
            console.log(`💬 第二階段完成`);

            // 更新環境狀態
            this.updateEnvironmentFromAnalysis(stage1Result);

            return {
                response: stage2Result.response,
                stage1: stage1Result,
                stage2: stage2Result,
                environmentState: this.environmentState.getEnvironmentSummary(),
                processingFlow: this.determineProcessingFlow(stage1Result)
            };

        } catch (error) {
            console.error('雙階段處理錯誤:', error);
            return this.getFallbackResponse(userMessage);
        }
    }

    // 第一階段：意圖分析 + 環境感知
    async stage1_IntentAndEnvironment(userMessage, openaiApiCall) {
        const currentEnv = this.environmentState.getEnvironmentSummary();
        const missingInfo = this.environmentState.getMissingInfo();

        const stage1Prompt = `你是桌遊環境感知和意圖分析專家。分析用戶的意圖並感知桌遊現場環境。

用戶消息：「${userMessage}」

當前已知環境：
${JSON.stringify(currentEnv, null, 2)}

缺失的環境資訊：${missingInfo.join(', ')}

請分析並回傳 JSON 格式：
{
  "intent": {
    "type": "start_game|rule_question|game_action|progress_control|chitchat",
    "confidence": 0.95,
    "description": "意圖描述"
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
    "approach": "environment_sensing|direct_answer|guided_action",
    "focus": "建立連結並收集環境資訊",
    "tone": "親切友善"
  }
}

重要：如果是 start_game 意圖且缺少關鍵環境資訊，優先選擇 environment_sensing 策略。`;

        try {
            const stage1Response = await openaiApiCall([
                { role: 'system', content: stage1Prompt },
                { role: 'user', content: userMessage }
            ]);

            // 嘗試解析 JSON 回應
            const analysis = this.parseStage1Response(stage1Response);
            return analysis;

        } catch (error) {
            console.error('第一階段處理失敗:', error);
            return this.getStage1Fallback(userMessage);
        }
    }

    // 第二階段：針對性回應生成
    async stage2_ContextualResponse(userMessage, stage1Result, openaiApiCall, chatHistory) {
        const environmentContext = this.environmentState.generateContextDescription();
        const strategy = stage1Result.response_strategy;
        const environmentAnalysis = stage1Result.environment_analysis;

        let stage2Prompt;

        if (strategy.approach === 'environment_sensing') {
            // 環境感知模式 - 優先收集環境資訊
            stage2Prompt = this.buildEnvironmentSensingPrompt(
                userMessage, 
                stage1Result, 
                environmentContext
            );
        } else if (strategy.approach === 'direct_answer') {
            // 直接回答模式
            stage2Prompt = this.buildDirectAnswerPrompt(
                userMessage, 
                stage1Result, 
                environmentContext
            );
        } else {
            // 引導行動模式
            stage2Prompt = this.buildGuidedActionPrompt(
                userMessage, 
                stage1Result, 
                environmentContext
            );
        }

        try {
            const stage2Response = await openaiApiCall([
                { role: 'system', content: stage2Prompt },
                ...chatHistory.slice(-4), // 保留最近2輪對話
                { role: 'user', content: userMessage }
            ]);

            return {
                response: stage2Response,
                strategy: strategy,
                environmentFocus: environmentAnalysis.priority_info
            };

        } catch (error) {
            console.error('第二階段處理失敗:', error);
            return this.getStage2Fallback(stage1Result);
        }
    }

    // 構建環境感知提示詞
    buildEnvironmentSensingPrompt(userMessage, stage1Result, environmentContext) {
        const priorityInfo = stage1Result.environment_analysis.priority_info;
        const intent = stage1Result.intent.type;
        const currentEnv = this.environmentState.getEnvironmentSummary();

        // 檢查是否已經有足夠的關鍵資訊可以開始行動
        const hasPlayerCount = currentEnv.playerCount !== null;
        const shouldStartAction = hasPlayerCount && priorityInfo !== 'player_count';

        if (shouldStartAction) {
            // 有了玩家人數，立即轉向行動引導
            return `你是 Similo AI 陪玩員 🎭，專門引導玩家進行遊戲設置！

用戶剛說：「${userMessage}」
當前環境：${environmentContext}
玩家人數：${currentEnv.playerCount}人

🎯 你的任務：
1. **確認人數** - 簡短確認玩家人數
2. **引導設置** - 指導玩家進行遊戲準備
3. **角色分配** - 幫助玩家決定誰當出題者

🌟 回應策略：
- 第一句：確認人數並表示興奮
- 第二句：給出設置指示（抽12張卡排成4×3）
- 第三句：詢問玩家間的角色分配

⚠️ 重要限制：
- 你是陪玩引導員，不是遊戲參與者
- 不要說「我當出題者」或「我來猜」
- 只引導玩家之間分配角色
- 不要進入實際遊戲流程

請用繁體中文回應，保持節奏感！`;
        } else {
            // 還需要收集基本環境資訊
            return `你是 Similo AI 陪玩員 🎭，專門協助和引導玩家！

用戶剛說：「${userMessage}」
檢測到的意圖：${intent}
當前環境：${environmentContext}
優先需要了解：${priorityInfo}

🎯 你的任務：
1. **建立連結** - 先熱情回應用戶，建立陪玩引導員身份
2. **環境感知** - 詢問最重要的環境資訊（${priorityInfo}）
3. **保持互動** - 一次只問一個問題，不要倒出大量資訊

🌟 回應策略：
- 第一句：熱情歡迎，建立陪玩引導員身份
- 第二句：簡短說明為什麼需要了解環境
- 第三句：詢問具體的環境資訊

⚠️ 重要限制：
- 你是引導員，不是遊戲參與者
- 不要提及「我當出題者」等參與遊戲的話
- 專注於協助玩家之間的遊戲

🚫 避免：
- 直接開始解釋規則
- 一次問太多問題
- 忽略建立連結的重要性
- 自己參與遊戲

請用繁體中文回應，語調要親切有趣！`;
        }
    }

    // 構建直接回答提示詞
    buildDirectAnswerPrompt(userMessage, stage1Result, environmentContext) {
        return `你是 Similo AI 陪玩員 🎭，專門引導和協助玩家，但不參與遊戲。

用戶問題：「${userMessage}」
當前環境：${environmentContext}
意圖：${stage1Result.intent.type}

⚠️ 重要限制：
- 你是陪玩引導員，不是遊戲參與者
- 不要說「我當出題者」、「我來猜」、「我的線索」等
- 只提供規則解釋和流程引導
- 幫助玩家之間進行遊戲，而不是與玩家對戰

請提供精確、有用的回答，保持引導員身份。`;
    }

    // 構建引導行動提示詞
    buildGuidedActionPrompt(userMessage, stage1Result, environmentContext) {
        return `你是 Similo AI 陪玩員 🎭，專門引導玩家進行遊戲，但不參與遊戲。

用戶消息：「${userMessage}」
當前環境：${environmentContext}
意圖：${stage1Result.intent.type}

🎯 你的角色：
- 遊戲流程引導員
- 規則解釋員
- 玩家間的協調者

⚠️ 重要限制：
- 不要成為遊戲參與者
- 不要說「我當出題者」、「我來選擇」等
- 只引導玩家之間的互動
- 提供流程指導，不參與決策

請提供具體的行動指導，幫助玩家順利進行遊戲。`;
    }

    // 解析第一階段回應
    parseStage1Response(response) {
        try {
            // 嘗試提取 JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('JSON 解析失敗:', error);
        }

        // 備用解析
        return this.getStage1Fallback(response);
    }

    // 第一階段備用回應
    getStage1Fallback(userMessage) {
        const msg = userMessage.toLowerCase();
        
        if (msg.includes('怎麼玩') || msg.includes('教我') || msg.includes('開始')) {
            return {
                intent: { type: 'start_game', confidence: 0.8, description: '用戶想要開始遊戲' },
                environment_analysis: {
                    detected_info: {},
                    missing_critical_info: ['player_count'],
                    next_question_needed: true,
                    priority_info: 'player_count'
                },
                response_strategy: {
                    approach: 'environment_sensing',
                    focus: '建立連結並收集環境資訊',
                    tone: '親切友善'
                }
            };
        }

        return {
            intent: { type: 'chitchat', confidence: 0.5, description: '一般對話' },
            environment_analysis: {
                detected_info: {},
                missing_critical_info: [],
                next_question_needed: false,
                priority_info: null
            },
            response_strategy: {
                approach: 'direct_answer',
                focus: '友善回應',
                tone: '輕鬆愉快'
            }
        };
    }

    // 第二階段備用回應
    getStage2Fallback(stage1Result) {
        const intent = stage1Result.intent.type;
        
        const fallbacks = {
            start_game: '太棒了 🎉 我來當你們的陪玩員！在開始之前，先跟我說說：現在桌上有幾位玩家呢？',
            rule_question: '這是一個很好的問題！讓我為你解答 🤔',
            game_action: '我理解你想要進行遊戲動作。告訴我更多細節吧！',
            chitchat: '很高興和你聊天！我們要不要開始 Similo 遊戲呢？😊'
        };

        return {
            response: fallbacks[intent] || '我會盡力協助你享受 Similo 遊戲！🎭',
            strategy: stage1Result.response_strategy,
            environmentFocus: null
        };
    }

    // 從分析結果更新環境狀態
    updateEnvironmentFromAnalysis(stage1Result) {
        const detectedInfo = stage1Result.environment_analysis.detected_info;
        if (detectedInfo && Object.keys(detectedInfo).length > 0) {
            this.environmentState.updateEnvironment(detectedInfo);
        }
    }

    // 決定處理流程
    determineProcessingFlow(stage1Result) {
        return {
            needsEnvironmentSensing: stage1Result.environment_analysis.next_question_needed,
            priorityInfo: stage1Result.environment_analysis.priority_info,
            approach: stage1Result.response_strategy.approach,
            nextStep: this.environmentState.getNextInfoNeeded(stage1Result.intent.type)
        };
    }

    // 完整備用回應
    getFallbackResponse(userMessage) {
        return {
            response: '很高興見到你！我是 Similo AI 陪玩員 🎭 有什麼可以幫助你的嗎？',
            stage1: { intent: { type: 'chitchat' } },
            stage2: { strategy: { approach: 'direct_answer' } },
            environmentState: this.environmentState.getEnvironmentSummary(),
            processingFlow: { needsEnvironmentSensing: true }
        };
    }

    // 重置處理器狀態
    reset() {
        this.environmentState.reset();
        console.log('🔄 雙階段處理器已重置');
    }

    // 獲取當前狀態
    getCurrentState() {
        return {
            environment: this.environmentState.getDetailedState(),
            lastProcessing: this.lastProcessingResult
        };
    }
}

module.exports = DualStageProcessor;
