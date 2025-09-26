// 分層 AI 處理器 - 整合雙階段處理和環境感知
const IntentDetector = require('./intent-detector');
const GameState = require('./game-state');
const ResponseStrategy = require('./response-strategy');
const InteractionFlow = require('./interaction-flow');
const DualStageProcessor = require('./dual-stage-processor');

class LayeredAIHandler {
    constructor() {
        // 原有組件
        this.intentDetector = new IntentDetector();
        this.gameState = new GameState();
        this.responseStrategy = new ResponseStrategy();
        this.interactionFlow = new InteractionFlow();

        // 新增雙階段處理器
        this.dualStageProcessor = new DualStageProcessor();

        // 會話記憶
        this.chatHistory = [];
        this.maxHistoryLength = 40;  // 增加到 40 (20對對話)

        // 互動狀態
        this.isInFlow = false;
        this.currentFlowInfo = null;

        // 處理模式
        this.processingMode = 'dual_stage'; // 'dual_stage' 或 'legacy'
    }

    // 主要處理函數 - 支援雙階段處理
    async processMessage(userMessage, openaiApiCall) {
        try {
            if (this.processingMode === 'dual_stage') {
                // 使用新的雙階段處理
                return await this.processDualStage(userMessage, openaiApiCall);
            } else {
                // 使用原有的分層處理（備用）
                return await this.processLegacy(userMessage, openaiApiCall);
            }
        } catch (error) {
            console.error('處理錯誤:', error);
            return {
                response: '抱歉，我遇到了一些問題。請再試一次！ 🤔',
                intent: 'error',
                strategy: 'error_handling',
                gameState: this.gameState.getStateSummary(),
                processingMode: this.processingMode
            };
        }
    }

    // 雙階段處理模式
    async processDualStage(userMessage, openaiApiCall) {
        console.log(`🎬 使用雙階段處理模式`);

        // 使用雙階段處理器
        const result = await this.dualStageProcessor.processMessage(
            userMessage,
            openaiApiCall,
            this.chatHistory
        );

        // 更新聊天歷史
        this.addToChatHistory('user', userMessage);
        this.addToChatHistory('assistant', result.response);

        // 同步環境狀態到遊戲狀態
        this.syncEnvironmentToGameState(result.environmentState);

        return {
            response: result.response,
            intent: result.stage1.intent.type,
            strategy: result.stage2.strategy.approach,
            gameState: this.gameState.getStateSummary(),
            environmentState: result.environmentState,
            processingFlow: result.processingFlow,
            stage1Analysis: result.stage1,
            stage2Response: result.stage2,
            processingMode: 'dual_stage'
        };
    }

    // 原有的分層處理模式（備用）
    async processLegacy(userMessage, openaiApiCall) {
        console.log(`🎬 使用原有分層處理模式`);

        // 第1層：意圖檢測
        const intentResult = this.intentDetector.detectIntent(userMessage);
        console.log(`🎯 檢測到意圖: ${intentResult.intent} (信心度: ${intentResult.confidence.toFixed(2)})`);

        // 第1.5層：互動流程管理
        const flowInfo = this.manageInteractionFlow(userMessage, intentResult);
        console.log(`🎬 互動流程: ${flowInfo ? flowInfo.step : '無流程'}`);

        // 第2層：選擇回應策略（考慮流程狀態）
        const strategy = this.responseStrategy.selectStrategy(
            intentResult.intent,
            userMessage,
            this.gameState,
            this.chatHistory,
            flowInfo  // 新增流程資訊
        );
        console.log(`📋 選擇策略: ${strategy.type}`);

        // 第3層：內容生成（整合流程引導）
        const response = await this.generateResponse(
            userMessage,
            strategy,
            intentResult,
            openaiApiCall,
            flowInfo
        );

        // 第4層：狀態更新（包含流程狀態）
        this.updateState(userMessage, response, intentResult, strategy, flowInfo);

        return {
            response: response,
            intent: intentResult.intent,
            strategy: strategy.type,
            gameState: this.gameState.getStateSummary(),
            flowInfo: flowInfo,
            processingMode: 'legacy'
        };
    }

    // 管理互動流程
    manageInteractionFlow(userMessage, intentResult) {
        // 檢查是否需要開始新流程
        if (intentResult.intent === 'start_game' && !this.isInFlow) {
            this.isInFlow = true;
            this.currentFlowInfo = this.interactionFlow.startFlow('setup', {
                userMessage: userMessage,
                gamePhase: this.gameState.gamePhase
            });
            console.log(`🎬 開始設置流程`);
            return this.currentFlowInfo;
        }

        // 如果正在流程中，處理用戶回應並進入下一步
        if (this.isInFlow && this.currentFlowInfo) {
            this.currentFlowInfo = this.interactionFlow.nextStep(userMessage);

            // 檢查流程是否完成
            if (this.currentFlowInfo && this.currentFlowInfo.isComplete) {
                console.log(`✅ 流程完成`);
                this.isInFlow = false;
                const completedFlow = this.currentFlowInfo;
                this.currentFlowInfo = null;
                return completedFlow;
            }

            return this.currentFlowInfo;
        }

        return null;
    }

    // 同步環境狀態到遊戲狀態
    syncEnvironmentToGameState(environmentState) {
        if (environmentState.playerCount && !this.gameState.roles.clueGiver) {
            // 根據玩家人數和環境狀態更新遊戲狀態
            console.log(`🔄 同步環境狀態: ${environmentState.playerCount}位玩家`);
        }

        // 可以在這裡添加更多同步邏輯
    }

    // 內容生成層 - 整合流程引導
    async generateResponse(userMessage, strategy, intentResult, openaiApiCall, flowInfo) {
        // 構建針對性的系統提示詞（考慮流程狀態）
        const systemPrompt = this.buildSystemPrompt(strategy, intentResult, flowInfo);

        // 構建用戶消息（包含上下文和流程資訊）
        const contextualMessage = this.buildContextualMessage(userMessage, strategy, flowInfo);

        // 調用 OpenAI API
        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.chatHistory.slice(-4), // 保留最近2輪對話，為流程引導留更多空間
            { role: 'user', content: contextualMessage }
        ];

        try {
            const aiResponse = await openaiApiCall(messages);
            return aiResponse;
        } catch (error) {
            console.error('OpenAI API 調用失敗:', error);
            return this.getFallbackResponse(strategy.type, flowInfo);
        }
    }

    // 構建系統提示詞 - 整合流程引導
    buildSystemPrompt(strategy, intentResult, flowInfo) {
        let basePrompt = `你是 Similo AI 陪玩員 🎭，一個熱愛桌遊的朋友！

當前處理情境：
- 用戶意圖：${intentResult.intent}
- 回應策略：${strategy.type}
- 遊戲階段：${this.gameState.gamePhase}`;

        // 如果有流程資訊，加入流程引導
        if (flowInfo) {
            basePrompt += `
- 互動流程：${flowInfo.flow}
- 當前步驟：${flowInfo.step} (${flowInfo.stepIndex + 1}/${flowInfo.totalSteps})

🎯 流程引導提示詞：
${this.interactionFlow.generateStepPrompt(flowInfo)}`;
        } else {
            basePrompt += `

${strategy.prompt}`;
        }

        basePrompt += `

🌟 核心原則：
1. **分步引導** - 一次只給一個小步驟，不要倒出所有資訊
2. **互動導向** - 每次回應都要有明確的下一步行動
3. **情境感知** - 根據用戶狀態調整語調和內容
4. **有人味** - 像朋友一樣親切，適當使用 emoji
5. **簡潔有力** - 回應要簡短有趣，避免長篇大論

🚫 絕對避免：
- 一次性倒出大量規則
- 冷冰冰的百科式回答
- 沒有下一步指引的回應
- 過於正式的語調

請用繁體中文回應，保持輕鬆愉快的氛圍！`;

        return basePrompt;
    }

    // 構建上下文消息 - 整合流程資訊
    buildContextualMessage(userMessage, strategy, flowInfo) {
        let contextualMessage = userMessage;

        // 如果有流程資訊，優先顯示流程上下文
        if (flowInfo) {
            contextualMessage += `\n\n[互動流程上下文]
流程：${flowInfo.flow}
步驟：${flowInfo.step}
進度：${flowInfo.stepIndex + 1}/${flowInfo.totalSteps}
流程狀態：${JSON.stringify(flowInfo.context, null, 2)}`;
        }

        // 根據策略類型添加遊戲狀態上下文
        if (strategy.type === 'game_action' || strategy.type === 'progress_control') {
            const gameState = this.gameState.getDetailedState();
            contextualMessage += `\n\n[當前遊戲狀態]\n${JSON.stringify(gameState.summary, null, 2)}`;
        }

        if (strategy.context) {
            contextualMessage += `\n\n[策略上下文]\n${JSON.stringify(strategy.context, null, 2)}`;
        }

        return contextualMessage;
    }

    // 狀態更新層 - 整合流程狀態
    updateState(userMessage, aiResponse, intentResult, strategy, flowInfo) {
        // 更新聊天歷史
        this.addToChatHistory('user', userMessage);
        this.addToChatHistory('assistant', aiResponse);

        // 根據意圖和策略更新遊戲狀態
        this.updateGameState(intentResult, strategy, userMessage, aiResponse, flowInfo);

        // 記錄互動（包含流程資訊）
        const actionDesc = `意圖: ${intentResult.intent}, 策略: ${strategy.type}${flowInfo ? `, 流程: ${flowInfo.step}` : ''}`;
        this.gameState.addAction('interaction', actionDesc);
    }

    // 更新遊戲狀態 - 整合流程狀態
    updateGameState(intentResult, strategy, userMessage, aiResponse, flowInfo) {
        // 如果有流程資訊，根據流程步驟更新狀態
        if (flowInfo && flowInfo.context) {
            this.updateStateFromFlow(flowInfo);
        }

        switch (intentResult.intent) {
            case 'start_game':
                if (this.gameState.gamePhase === 'not_started') {
                    // 檢查是否包含角色選擇資訊
                    if (userMessage.includes('出題者') || userMessage.includes('clue giver')) {
                        this.gameState.roles.clueGiver = 'human';
                        this.gameState.roles.guesser = 'ai';
                    } else if (userMessage.includes('猜題者') || userMessage.includes('guesser')) {
                        this.gameState.roles.clueGiver = 'ai';
                        this.gameState.roles.guesser = 'human';
                    }
                }
                break;

            case 'game_action':
                // 這裡可以解析具體的遊戲動作並更新狀態
                // 例如：淘汰角色、出線索等
                this.parseAndExecuteGameAction(userMessage);
                break;

            case 'progress_control':
                // 處理進度控制（暫停、繼續等）
                break;
        }
    }

    // 根據流程狀態更新遊戲狀態
    updateStateFromFlow(flowInfo) {
        const context = flowInfo.context;

        if (context.userRole) {
            if (context.userRole === 'clue_giver') {
                this.gameState.roles.clueGiver = 'human';
                this.gameState.roles.guesser = 'ai';
            } else if (context.userRole === 'guesser') {
                this.gameState.roles.clueGiver = 'ai';
                this.gameState.roles.guesser = 'human';
            }
        }

        if (context.cardsSetup && this.gameState.gamePhase === 'not_started') {
            // 可以在這裡觸發遊戲設置
            console.log('🎮 卡牌設置完成，準備開始遊戲');
        }

        if (context.gameStarted) {
            this.gameState.gamePhase = 'setup';
            console.log('🎯 遊戲開始！');
        }
    }

    // 解析並執行遊戲動作
    parseAndExecuteGameAction(userMessage) {
        // 這裡可以實作更複雜的動作解析邏輯
        // 例如：解析座標、角色名稱等
        
        // 簡單示例：檢測淘汰動作
        if (userMessage.includes('淘汰') && this.gameState.gamePhase === 'playing') {
            // 這裡需要更複雜的解析邏輯來提取具體的淘汰目標
            console.log('檢測到淘汰動作，需要進一步解析');
        }
    }

    // 添加到聊天歷史
    addToChatHistory(role, content) {
        this.chatHistory.push({ role, content });
        
        // 限制歷史長度
        if (this.chatHistory.length > this.maxHistoryLength) {
            this.chatHistory = this.chatHistory.slice(-this.maxHistoryLength);
        }
    }

    // 獲取備用回應 - 考慮流程狀態
    getFallbackResponse(strategyType, flowInfo) {
        if (flowInfo) {
            const flowFallbacks = {
                greeting: '嗨！我是你的 Similo AI 陪玩員 🎭 準備好一起玩嗎？',
                check_preparation: '你手邊有 Similo 卡牌嗎？我們來準備開始吧！',
                role_selection: '你想當出題者還是猜題者呢？我可以當另一個角色！',
                card_setup: '請把 12 張卡排成 4×3 的方陣，完成後告訴我！',
                game_start: '太好了！讓我們開始 Similo 的推理之旅吧！🎉'
            };

            return flowFallbacks[flowInfo.step] || '讓我們繼續進行下去吧！';
        }

        const fallbacks = {
            interactive_setup: '讓我們一步步設置 Similo 遊戲吧！你準備好了嗎？🎲',
            rule_explanation: '這是一個很好的問題！讓我為你解答 🤔',
            game_action: '我理解你想要進行遊戲動作。告訴我更多細節吧！',
            progress_control: '好的，讓我為你提供當前的遊戲狀態 📋',
            chitchat: '很高興和你聊天！我們要不要繼續 Similo 遊戲呢？😊'
        };

        return fallbacks[strategyType] || '我會盡力協助你享受 Similo 遊戲！🎭';
    }

    // 切換處理模式
    switchProcessingMode(mode) {
        if (['dual_stage', 'legacy'].includes(mode)) {
            this.processingMode = mode;
            console.log(`🔄 切換到 ${mode} 處理模式`);
        }
    }

    // 重置遊戲
    resetGame() {
        this.gameState.reset();
        this.dualStageProcessor.reset();
        this.chatHistory = [];
        this.isInFlow = false;
        this.currentFlowInfo = null;
        console.log('🔄 遊戲狀態已重置');
    }

    // 獲取當前狀態
    getCurrentState() {
        const baseState = {
            gameState: this.gameState.getDetailedState(),
            chatHistory: this.chatHistory.slice(-10),
            processingMode: this.processingMode,
            isInFlow: this.isInFlow
        };

        if (this.processingMode === 'dual_stage') {
            baseState.environmentState = this.dualStageProcessor.getCurrentState();
        }

        return baseState;
    }

    // 獲取環境狀態摘要
    getEnvironmentSummary() {
        if (this.processingMode === 'dual_stage') {
            return this.dualStageProcessor.environmentState.getEnvironmentSummary();
        }
        return null;
    }
}

module.exports = LayeredAIHandler;
