// 回應策略層 (Response Strategy Layer)
const fs = require('fs');
const path = require('path');

class ResponseStrategy {
    constructor() {
        this.strategies = {
            start_game: this.handleStartGame.bind(this),
            rule_question: this.handleRuleQuestion.bind(this),
            progress_control: this.handleProgressControl.bind(this),
            game_action: this.handleGameAction.bind(this),
            chitchat: this.handleChitchat.bind(this)
        };
        
        // 載入 Similo 規則
        this.similoRules = this.loadSimiloRules();
    }

    // 載入 Similo 規則文件
    loadSimiloRules() {
        try {
            const gameRules = fs.readFileSync(path.join(__dirname, 'book', 'Similo.md'), 'utf8');
            const roleRules = fs.readFileSync(path.join(__dirname, 'book', 'SimiloRole.md'), 'utf8');
            return { gameRules, roleRules };
        } catch (error) {
            console.error('無法載入 Similo 規則:', error);
            return { gameRules: '', roleRules: '' };
        }
    }

    // 根據意圖選擇策略
    selectStrategy(intent, userMessage, gameState, chatHistory) {
        const strategy = this.strategies[intent] || this.strategies.chitchat;
        return strategy(userMessage, gameState, chatHistory);
    }

    // 處理開始遊戲 - 重新設計為分步引導
    handleStartGame(userMessage, gameState, chatHistory) {
        // 分析用戶的準備狀態和具體需求
        const preparationState = this.analyzePreparationState(userMessage, chatHistory);

        if (gameState.gamePhase === 'not_started') {
            return {
                type: 'interactive_setup',
                context: {
                    preparationState: preparationState,
                    nextStep: this.determineNextSetupStep(preparationState),
                    isFirstTime: chatHistory.length <= 2,
                    hasCards: preparationState.hasCards,
                    roleSelected: preparationState.roleSelected
                },
                prompt: this.buildInteractiveSetupPrompt(preparationState)
            };
        } else if (gameState.gamePhase === 'playing') {
            return {
                type: 'continue_or_restart',
                context: {
                    currentState: gameState.getDetailedState(),
                    suggestion: 'continue_current_game'
                },
                prompt: this.buildContinueGamePrompt(gameState)
            };
        } else {
            return {
                type: 'new_game_setup',
                context: {
                    resetRequired: true,
                    preparationState: preparationState
                },
                prompt: this.buildNewGameSetupPrompt(preparationState)
            };
        }
    }

    // 分析用戶的準備狀態
    analyzePreparationState(userMessage, chatHistory) {
        const msg = userMessage.toLowerCase();
        const historyText = chatHistory.map(h => h.content).join(' ').toLowerCase();

        return {
            hasCards: msg.includes('卡牌') || msg.includes('卡片') || msg.includes('已經有') || msg.includes('拿出來'),
            isReady: msg.includes('準備好') || msg.includes('開始') || msg.includes('馬上'),
            wantsRules: msg.includes('怎麼玩') || msg.includes('規則') || msg.includes('教我'),
            roleSelected: historyText.includes('出題者') || historyText.includes('猜題者'),
            isFirstTime: !historyText.includes('similo') && !historyText.includes('玩過'),
            needsEncouragement: msg.includes('難') || msg.includes('複雜') || msg.includes('不會')
        };
    }

    // 決定下一個設置步驟
    determineNextSetupStep(preparationState) {
        if (!preparationState.hasCards) return 'get_cards';
        if (!preparationState.roleSelected) return 'select_roles';
        if (preparationState.wantsRules) return 'explain_basics';
        return 'start_setup';
    }

    // 處理規則問題
    handleRuleQuestion(userMessage, gameState, chatHistory) {
        // 分析問題類型
        const questionType = this.analyzeRuleQuestion(userMessage);
        
        return {
            type: 'rule_explanation',
            context: {
                questionType: questionType,
                gamePhase: gameState.gamePhase,
                currentRound: gameState.currentRound,
                relevantRules: this.extractRelevantRules(questionType)
            },
            prompt: this.buildRuleExplanationPrompt(questionType, gameState)
        };
    }

    // 處理進度控制
    handleProgressControl(userMessage, gameState, chatHistory) {
        const controlType = this.analyzeProgressControl(userMessage);
        
        return {
            type: 'progress_control',
            context: {
                controlType: controlType,
                gameState: gameState.getDetailedState(),
                recentActions: gameState.actionHistory.slice(-5)
            },
            prompt: this.buildProgressControlPrompt(controlType, gameState)
        };
    }

    // 處理遊戲動作
    handleGameAction(userMessage, gameState, chatHistory) {
        const actionType = this.analyzeGameAction(userMessage, gameState);
        
        return {
            type: 'game_action',
            context: {
                actionType: actionType,
                gameState: gameState.getDetailedState(),
                expectedAction: this.getExpectedAction(gameState),
                validMoves: this.getValidMoves(gameState)
            },
            prompt: this.buildGameActionPrompt(actionType, gameState)
        };
    }

    // 處理閒聊
    handleChitchat(userMessage, gameState, chatHistory) {
        return {
            type: 'chitchat',
            context: {
                gamePhase: gameState.gamePhase,
                encouragement: true,
                redirectToGame: gameState.gamePhase === 'playing'
            },
            prompt: this.buildChitchatPrompt(gameState)
        };
    }

    // 分析規則問題類型
    analyzeRuleQuestion(message) {
        const msg = message.toLowerCase();
        if (msg.includes('淘汰') || msg.includes('幾張')) return 'elimination_rules';
        if (msg.includes('線索') || msg.includes('直放') || msg.includes('橫放')) return 'clue_rules';
        if (msg.includes('回合') || msg.includes('順序')) return 'turn_rules';
        if (msg.includes('設置') || msg.includes('開始')) return 'setup_rules';
        if (msg.includes('勝利') || msg.includes('結束')) return 'victory_rules';
        return 'general_rules';
    }

    // 分析進度控制類型
    analyzeProgressControl(message) {
        const msg = message.toLowerCase();
        if (msg.includes('暫停') || msg.includes('等等')) return 'pause';
        if (msg.includes('回顧') || msg.includes('重複')) return 'review';
        if (msg.includes('上一步')) return 'previous';
        if (msg.includes('下一步') || msg.includes('繼續')) return 'continue';
        if (msg.includes('狀態') || msg.includes('現在')) return 'status';
        return 'status';
    }

    // 分析遊戲動作類型
    analyzeGameAction(message, gameState) {
        const msg = message.toLowerCase();
        if (gameState.roles.clueGiver === 'ai' && gameState.currentRound <= gameState.clueArea.length) {
            return 'elimination_request';
        }
        if (msg.includes('出牌') || msg.includes('線索')) return 'clue_giving';
        if (msg.includes('淘汰') || msg.includes('選擇')) return 'elimination';
        if (msg.includes('角色') || msg.includes('我是')) return 'role_selection';
        return 'general_action';
    }

    // 構建互動式設置提示詞
    buildInteractiveSetupPrompt(preparationState) {
        const step = this.determineNextSetupStep(preparationState);

        let basePrompt = `你是 Similo AI 陪玩員 🎭，一個熱愛桌遊的朋友！用戶想要學習/開始 Similo，你要像真正的朋友一樣陪伴他們。

當前情況分析：
- 用戶準備狀態：${JSON.stringify(preparationState)}
- 下一步：${step}

🎯 你的任務：
1. **分步引導** - 一次只給一個小步驟，不要一口氣倒出所有規則
2. **情境感知** - 根據用戶的準備狀態調整回應
3. **互動導向** - 每次回應都要有明確的 CTA（下一步行動）
4. **有人味** - 用朋友的語氣，加上適當的 emoji 和鼓勵

🚫 避免：
- 長篇大論的規則解釋
- 一次性倒出所有資訊
- 冷冰冰的百科式回答
- 沒有下一步指引的回應

💡 回應策略：
${this.getStepSpecificStrategy(step)}

請用繁體中文回應，保持輕鬆愉快的氛圍！`;

        return basePrompt;
    }

    // 獲取特定步驟的策略
    getStepSpecificStrategy(step) {
        const strategies = {
            get_cards: `
- 先確認用戶是否有 Similo 卡牌
- 如果沒有，建議替代方案（用其他卡片或線上版本）
- 給出簡單的準備指示
- 結尾問：「卡牌準備好了嗎？」`,

            select_roles: `
- 簡單解釋 Similo 有兩個角色：出題者和猜題者
- 詢問用戶想當哪一個（如果選猜題者，你就當出題者）
- 用輕鬆的語氣介紹角色差異
- 結尾問：「你想當出題者還是猜題者呢？」`,

            explain_basics: `
- 用最簡單的話解釋遊戲目標（找出秘密角色）
- 不要講太多細節，重點是讓用戶有概念
- 強調這是合作遊戲，大家一起贏
- 結尾問：「聽起來有趣嗎？我們開始設置吧！」`,

            start_setup: `
- 開始第一個具體步驟：排卡牌
- 給出明確指示：「請從牌堆抽 12 張卡，排成 4×3 的方陣」
- 鼓勵用戶：「別擔心，我會一步步帶你！」
- 結尾問：「排好了嗎？跟我說一聲！」`
        };

        return strategies[step] || strategies.start_setup;
    }

    buildRuleExplanationPrompt(questionType, gameState) {
        const relevantRules = this.extractRelevantRules(questionType);
        
        return `你是 Similo AI 陪玩員。用戶對遊戲規則有疑問，請提供清楚的解釋。

相關規則資訊：
${relevantRules}

當前遊戲狀態：
- 遊戲階段：${gameState.gamePhase}
- 當前回合：${gameState.currentRound}
- 剩餘角色數：${gameState.getRemainingCharacters().length}

請：
1. 直接回答用戶的問題
2. 用簡單易懂的語言解釋
3. 如果適用，結合當前遊戲狀態舉例
4. 保持友善專業的語調

請用繁體中文回應。`;
    }

    buildGameActionPrompt(actionType, gameState) {
        const state = gameState.getDetailedState();
        
        return `你是 Similo AI 陪玩員。用戶正在進行遊戲動作，請協助處理。

當前遊戲狀態：
${JSON.stringify(state, null, 2)}

動作類型：${actionType}

請：
1. 理解用戶想要進行的動作
2. 檢查動作是否符合規則
3. 如果是有效動作，協助執行並更新狀態
4. 提供下一步的指導
5. 保持遊戲的流暢性

請用繁體中文回應，保持遊戲的趣味性。`;
    }

    // 提取相關規則
    extractRelevantRules(questionType) {
        // 根據問題類型返回相關的規則片段
        const ruleMap = {
            elimination_rules: '淘汰規則：第1回合淘汰1張，第2回合淘汰2張，依此類推...',
            clue_rules: '線索規則：直放表示相似，橫放表示不相似...',
            turn_rules: '回合規則：出題者出線索，猜題者淘汰，然後進入下一回合...',
            setup_rules: '設置規則：12張卡排成4x3，選擇秘密角色...',
            victory_rules: '勝利條件：最後剩下的卡就是秘密角色則勝利，淘汰秘密角色則失敗...'
        };
        
        return ruleMap[questionType] || this.similoRules.gameRules + '\n\n' + this.similoRules.roleRules;
    }

    // 其他輔助方法...
    buildGameStatusPrompt(gameState) {
        return `提供當前遊戲狀態摘要，詢問用戶是否要繼續當前遊戲。`;
    }

    buildNewGamePrompt() {
        return `用戶想要開始新遊戲，請重置狀態並開始設置。`;
    }

    buildProgressControlPrompt(controlType, gameState) {
        return `處理進度控制請求：${controlType}，提供相應的狀態資訊或操作。`;
    }

    buildChitchatPrompt(gameState) {
        return `友善回應用戶的閒聊，適當時引導回到遊戲。保持輕鬆愉快的氛圍。`;
    }

    getExpectedAction(gameState) {
        if (gameState.gamePhase === 'not_started') return 'setup';
        if (gameState.roles.clueGiver === 'ai') return 'give_clue';
        return 'eliminate_characters';
    }

    getValidMoves(gameState) {
        return gameState.getRemainingCharacters().map(char => char.position);
    }
}

module.exports = ResponseStrategy;
