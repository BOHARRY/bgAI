// Multi-AI Processor - Phase 2B 完整實現
const ContextAnalyzer = require('./context-analyzer.js');
const IntentDetector = require('./intent-detector.js');
const ResponseGenerator = require('./response-generator.js');
const GameStateManager = require('./game-state-manager.js');

class MultiAIProcessor {
    constructor() {
        this.name = 'MultiAIProcessor';
        this.version = '2.0.0-beta';
        this.phase = 'Phase2B';

        // 初始化三個專門化 AI 模組
        this.contextAnalyzer = new ContextAnalyzer();
        this.intentDetector = new IntentDetector();
        this.responseGenerator = new ResponseGenerator();

        // 初始化遊戲狀態管理器
        this.gameStateManager = new GameStateManager();

        // 環境狀態（簡化版）
        this.environmentState = {
            playerCount: null,
            experienceLevel: null,
            materials: null
        };
        
        console.log(`🚀 ${this.name} v${this.version} (${this.phase}) 初始化完成`);
    }

    // 主要處理方法 (Phase 2B - 完整三模組架構)
    async processMessage(userMessage, context, openaiApiCall) {
        try {
            console.log(`🎭 ${this.name}: 開始處理消息 "${userMessage}"`);

            // Phase 2B: 完整三階段處理

            // 第一階段：上下文分析
            const contextAnalysis = await this.contextAnalyzer.analyze(
                userMessage,
                context?.chatHistory || [],
                openaiApiCall
            );

            // 確保 chatHistory 被傳遞到 contextAnalysis 中
            contextAnalysis.chatHistory = context?.chatHistory || [];

            // 第二階段：意圖檢測（加入遊戲狀態信息）
            const gamePhaseInfo = this.gameStateManager.getCurrentPhaseInfo();
            contextAnalysis.game_state = {
                phase: gamePhaseInfo.phase,
                current_role: gamePhaseInfo.currentRole,
                phase_name: gamePhaseInfo.phaseName
            };

            const intentResult = await this.intentDetector.detect(
                userMessage,
                contextAnalysis,
                openaiApiCall
            );

            // 檢查是否需要推進遊戲狀態
            if (this.gameStateManager.canAdvancePhase(userMessage, contextAnalysis)) {
                const completionData = this.extractCompletionData(userMessage, intentResult);
                this.gameStateManager.advanceToNextPhase(completionData);
            }

            // 第三階段：回應生成（加入遊戲狀態信息）
            const updatedGamePhaseInfo = this.gameStateManager.getCurrentPhaseInfo();
            const response = await this.responseGenerator.generate(
                userMessage,
                contextAnalysis,
                intentResult,
                openaiApiCall,
                updatedGamePhaseInfo
            );

            return {
                intent: intentResult.intent?.primary_intent,
                strategy: intentResult.response_strategy?.approach,
                response: response,
                processingMode: 'multi_ai_phase2b',
                contextAnalysis: contextAnalysis,
                intentResult: intentResult,
                gameState: this.gameStateManager.getGameStateSummary(),
                contextUsed: true,
                historyLength: context?.chatHistory?.length || 0,
                aiModules: ['ContextAnalyzer', 'IntentDetector', 'ResponseGenerator', 'GameStateManager']
            };

        } catch (error) {
            console.error(`❌ ${this.name}: 處理失敗`, error);

            // 降級處理
            return await this.fallbackProcessing(userMessage, context, openaiApiCall, error);
        }
    }

    // 提取完成數據
    extractCompletionData(userMessage, intentResult) {
        const data = {};

        // 提取人數信息
        const playerCountMatch = userMessage.match(/(\d+).*人|三|四|五/);
        if (playerCountMatch) {
            if (playerCountMatch[1]) {
                data.playerCount = parseInt(playerCountMatch[1]);
            } else if (userMessage.includes('三')) {
                data.playerCount = 3;
            } else if (userMessage.includes('四')) {
                data.playerCount = 4;
            } else if (userMessage.includes('五')) {
                data.playerCount = 5;
            }
        }

        // 提取經驗信息
        if (userMessage.includes('沒有') || userMessage.includes('新手') || userMessage.includes('第一次')) {
            data.experienceLevel = 'beginner';
        } else if (userMessage.includes('玩過') || userMessage.includes('會玩')) {
            data.experienceLevel = 'experienced';
        }

        return data;
    }

    // 降級處理 (Phase 2B)
    async fallbackProcessing(userMessage, context, openaiApiCall, originalError) {
        console.warn(`⚠️ ${this.name}: 開始降級處理`);

        try {
            // 嘗試 Phase 2A 模式（Context Analyzer + 簡化處理）
            console.log(`🔄 嘗試 Phase 2A 降級模式`);

            const contextAnalysis = await this.contextAnalyzer.analyze(
                userMessage,
                context?.chatHistory || [],
                openaiApiCall
            );

            // 使用備用意圖檢測
            const fallbackIntent = this.intentDetector.fallbackDetection(userMessage);

            // 使用備用回應生成
            const fallbackResponse = this.responseGenerator.getFallbackResponse(userMessage, fallbackIntent);

            return {
                intent: fallbackIntent.intent?.primary_intent,
                strategy: fallbackIntent.response_strategy?.approach,
                response: fallbackResponse,
                processingMode: 'fallback_phase2a',
                contextAnalysis: contextAnalysis,
                contextUsed: true,
                historyLength: context?.chatHistory?.length || 0,
                aiModules: ['ContextAnalyzer', 'FallbackProcessor'],
                fallbackReason: originalError.message
            };

        } catch (fallbackError) {
            // 最終降級到簡單處理
            console.warn(`⚠️ ${this.name}: 降級到最簡單處理模式`);
            return await this.ultimateFallback(userMessage, context, fallbackError);
        }
    }

    // 增強版處理（使用上下文分析結果）
    async processWithEnhancedContext(userMessage, context, contextAnalysis, openaiApiCall) {
        // 第一階段：增強版意圖分析
        const intentAnalysis = await this.analyzeIntentWithContext(
            userMessage,
            context,
            contextAnalysis,
            openaiApiCall
        );

        // 第二階段：增強版回應生成
        const response = await this.generateResponseWithContext(
            userMessage,
            intentAnalysis,
            context,
            contextAnalysis,
            openaiApiCall
        );

        return {
            intent: intentAnalysis.intent.type,
            strategy: intentAnalysis.response_strategy.approach,
            response: response
        };
    }

    // 增強版意圖分析
    async analyzeIntentWithContext(userMessage, context, contextAnalysis, openaiApiCall) {
        const contextInfo = this.buildContextInfo(context, contextAnalysis);
        
        const stage1Prompt = `你是桌遊意圖分析專家。結合上下文分析結果，精準判斷用戶的真實意圖。

📝 **用戶消息**：「${userMessage}」

🧠 **上下文分析結果**：
${JSON.stringify(contextAnalysis, null, 2)}

📚 **對話歷史摘要**：
${contextInfo}

🎯 **增強分析重點**：
1. **結合連續性分析** - 如果是延遲回應，優先考慮回答之前的問題
2. **考慮話題切換** - 如果是話題跳躍，判斷是否需要直接回答
3. **利用相關歷史** - 重點關注相關的歷史對話
4. **評估對話狀態** - 根據當前階段調整意圖判斷

📋 **意圖類型**：
- **chitchat** - 純聊天
- **rule_question** - 規則問題（可直接回答）
- **start_game** - 開始遊戲（需要環境感知）
- **game_action** - 遊戲中的行動
- **progress_control** - 流程控制
- **delayed_response** - 延遲回應（回答之前的問題）

請返回 JSON 格式：
{
  "intent": {
    "type": "選擇最符合的意圖類型",
    "confidence": 0.95,
    "description": "具體描述用戶想要什麼",
    "context_influenced": true
  },
  "situation_analysis": {
    "is_continuous": ${contextAnalysis.continuity_analysis?.is_continuous || false},
    "needs_environment": false,
    "can_answer_immediately": true,
    "context": "結合上下文的情況分析"
  },
  "response_strategy": {
    "approach": "direct_answer|environment_sensing|guided_action|context_bridge",
    "focus": "根據上下文決定回應重點",
    "tone": "自然友善",
    "should_reference_context": true
  }
}

只返回 JSON，不要其他文字。`;

        try {
            const result = await openaiApiCall([{
                role: 'user',
                content: stage1Prompt
            }]);

            return this.parseIntentResult(result);
        } catch (error) {
            console.error('意圖分析失敗:', error);
            return this.getDefaultIntentResult();
        }
    }

    // 增強版回應生成
    async generateResponseWithContext(userMessage, intentAnalysis, context, contextAnalysis, openaiApiCall) {
        const contextInfo = this.buildContextInfo(context, contextAnalysis);
        const contextBridge = this.buildContextBridge(contextAnalysis);
        
        const stage2Prompt = `你是 Similo AI 陪玩員。根據意圖分析和上下文分析結果，生成自然友善的回應。

📝 **用戶消息**：「${userMessage}」

🎯 **意圖分析結果**：
${JSON.stringify(intentAnalysis, null, 2)}

🧠 **上下文分析結果**：
${JSON.stringify(contextAnalysis, null, 2)}

📚 **對話歷史摘要**：
${contextInfo}

🌉 **上下文銜接建議**：
${contextBridge}

🎭 **回應指導原則**：
1. **保持人格一致** - 友善、專業、有趣的 Similo 陪玩員
2. **善用上下文** - 適當引用之前的對話，保持連貫性
3. **處理話題切換** - 如果是跳躍問題，先回答再引導回原話題
4. **確認延遲回應** - 如果是延遲回應，要確認理解並繼續流程
5. **自然過渡** - 使用自然的語言銜接不同話題

🎮 **Similo 規則重點**：
- 12張卡片排成4×3方陣
- 線索卡直放=相似，橫放=不相似
- 第1回合淘汰1張，第2回合淘汰2張，依此類推
- 目標是最後剩下的卡片就是秘密角色

請生成自然、友善、有用的回應，保持 Similo AI 陪玩員的專業形象。`;

        try {
            const response = await openaiApiCall([{
                role: 'user',
                content: stage2Prompt
            }]);

            return response.trim();
        } catch (error) {
            console.error('回應生成失敗:', error);
            return '抱歉，我遇到了一些技術問題。讓我們重新開始吧！你想了解 Similo 的什麼呢？';
        }
    }

    // 構建上下文信息
    buildContextInfo(context, contextAnalysis) {
        if (!context?.chatHistory || context.chatHistory.length === 0) {
            return '（這是第一次對話）';
        }

        let info = `對話歷史（共 ${context.chatHistory.length} 條）：\n`;
        
        // 重點顯示相關的歷史記錄
        const relevantIndices = contextAnalysis.context_relevance?.relevant_history || [];
        
        context.chatHistory.forEach((msg, index) => {
            const role = msg.role === 'user' ? '用戶' : 'AI';
            const isRelevant = relevantIndices.includes(index) ? '⭐' : '';
            info += `${index}. ${role}${isRelevant}: ${msg.content}\n`;
        });

        return info;
    }

    // 構建上下文銜接建議
    buildContextBridge(contextAnalysis) {
        const continuity = contextAnalysis.continuity_analysis;
        const topic = contextAnalysis.topic_analysis;
        
        let bridge = '';

        if (continuity?.is_continuous && continuity.continuity_type === 'delayed_response') {
            bridge += '✅ 這是延遲回應，要確認理解並繼續之前的流程\n';
        }

        if (topic?.topic_switch_detected) {
            bridge += '🔄 檢測到話題切換，先回答當前問題，然後可以引導回原話題\n';
        }

        if (topic?.return_to_topic) {
            bridge += `🎯 用戶可能想回到「${topic.return_to_topic}」話題\n`;
        }

        const pendingQuestion = contextAnalysis.context_relevance?.key_information?.pending_question;
        if (pendingQuestion) {
            bridge += `❓ 有未回答的問題：「${pendingQuestion}」\n`;
        }

        return bridge || '📝 正常對話流程，按意圖回應即可';
    }

    // 解析意圖結果
    parseIntentResult(result) {
        try {
            const cleanResult = result.trim();
            const jsonMatch = cleanResult.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('無法找到有效的 JSON 格式');
            }
        } catch (error) {
            console.warn('意圖分析 JSON 解析失敗，使用默認結果', error);
            return this.getDefaultIntentResult();
        }
    }

    // 獲取默認意圖結果
    getDefaultIntentResult() {
        return {
            intent: {
                type: "chitchat",
                confidence: 0.5,
                description: "默認處理",
                context_influenced: false
            },
            situation_analysis: {
                is_continuous: false,
                needs_environment: false,
                can_answer_immediately: true,
                context: "分析失敗，使用默認判斷"
            },
            response_strategy: {
                approach: "direct_answer",
                focus: "友善回應",
                tone: "自然友善",
                should_reference_context: false
            }
        };
    }

    // 最終降級處理
    async ultimateFallback(userMessage, context, error) {
        console.error(`🚨 ${this.name}: 最終降級處理`, error);

        // 使用預設回應模板
        const intent = this.detectSimpleIntent(userMessage);
        const response = this.getUltimateFallbackResponse(intent, userMessage);

        return {
            intent: intent,
            strategy: 'ultimate_fallback',
            response: response,
            processingMode: 'ultimate_fallback',
            contextUsed: false,
            historyLength: context?.chatHistory?.length || 0,
            aiModules: ['UltimateFallback'],
            error: error.message
        };
    }

    // 簡單意圖檢測
    detectSimpleIntent(message) {
        const msg = message.toLowerCase();

        if (['你好', '嗨', '哈囉'].some(word => msg.includes(word))) {
            return 'chitchat';
        }

        if (['怎麼', '如何', '什麼是', '規則'].some(word => msg.includes(word))) {
            return 'rule_question';
        }

        if (['教我', '開始', '玩'].some(word => msg.includes(word))) {
            return 'start_game';
        }

        if (/\d+/.test(msg) && (msg.includes('人') || msg.includes('個'))) {
            return 'environment_info';
        }

        return 'chitchat';
    }

    // 最終備用回應
    getUltimateFallbackResponse(intent, message) {
        const responses = {
            chitchat: '你好！我是 Similo AI 陪玩員 🎭 很高興和你聊天！',
            rule_question: '這是個好問題！Similo 是一款很有趣的推理遊戲。你想了解哪個部分的規則呢？',
            start_game: '太棒了！我來當你們的陪玩員 🎉 先跟我說說：現在桌上有幾位玩家呢？',
            environment_info: '好的！讓我們繼續設置遊戲...',
            default: '我是 Similo AI 陪玩員，很高興為你服務！有什麼可以幫助你的嗎？'
        };

        return responses[intent] || responses.default;
    }

    // 獲取處理器狀態 (Phase 2B)
    getProcessorStatus() {
        return {
            name: this.name,
            version: this.version,
            phase: this.phase,
            modules: {
                contextAnalyzer: this.contextAnalyzer.getAnalysisStats(),
                intentDetector: this.intentDetector.getDetectorStats(),
                responseGenerator: this.responseGenerator.getGeneratorStats()
            },
            capabilities: [
                'three_stage_processing',
                'context_analysis',
                'specialized_intent_detection',
                'natural_response_generation',
                'multi_level_fallback'
            ],
            architecture: 'Context Analyzer → Intent Detector → Response Generator'
        };
    }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiAIProcessor;
} else {
    window.MultiAIProcessor = MultiAIProcessor;
}
