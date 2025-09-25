// Game State Manager - 遊戲狀態管理器
class GameStateManager {
    constructor() {
        this.name = 'GameStateManager';
        this.version = '1.0.0';
        
        // 遊戲階段定義
        this.GAME_PHASES = {
            NOT_STARTED: 'not_started',
            PLAYER_COUNT_SETUP: 'player_count_setup',
            CARD_LAYOUT_SETUP: 'card_layout_setup',
            SECRET_SELECTION: 'secret_selection',
            HAND_CARDS_SETUP: 'hand_cards_setup',
            ROUND_1_CLUE: 'round_1_clue',
            ROUND_1_ELIMINATION: 'round_1_elimination',
            ROUND_2_CLUE: 'round_2_clue',
            ROUND_2_ELIMINATION: 'round_2_elimination',
            ROUND_3_CLUE: 'round_3_clue',
            ROUND_3_ELIMINATION: 'round_3_elimination',
            ROUND_4_CLUE: 'round_4_clue',
            ROUND_4_ELIMINATION: 'round_4_elimination',
            ROUND_5_CLUE: 'round_5_clue',
            ROUND_5_ELIMINATION: 'round_5_elimination',
            GAME_END: 'game_end'
        };

        // 角色定義
        this.ROLES = {
            CLUE_GIVER: 'clue_giver',    // 出題者
            GUESSER: 'guesser'           // 猜題者
        };

        // 當前遊戲狀態
        this.currentState = {
            phase: this.GAME_PHASES.NOT_STARTED,
            playerCount: null,
            currentRole: null,
            roundNumber: 0,
            cardsRemaining: 12,
            completedSteps: [],
            gameData: {}
        };
    }

    // 獲取當前階段信息
    getCurrentPhaseInfo() {
        const phase = this.currentState.phase;
        const phaseConfig = this.getPhaseConfiguration(phase);
        
        return {
            phase: phase,
            phaseName: phaseConfig.name,
            description: phaseConfig.description,
            currentRole: this.getCurrentRole(),
            instruction: phaseConfig.instruction,
            completionCheck: phaseConfig.completionCheck,
            nextPhase: phaseConfig.nextPhase
        };
    }

    // 獲取階段配置
    getPhaseConfiguration(phase) {
        const configs = {
            [this.GAME_PHASES.NOT_STARTED]: {
                name: '遊戲未開始',
                description: '等待玩家開始學習遊戲',
                instruction: '詢問玩家人數',
                completionCheck: '確認玩家人數',
                nextPhase: this.GAME_PHASES.PLAYER_COUNT_SETUP,
                currentRole: null
            },
            [this.GAME_PHASES.PLAYER_COUNT_SETUP]: {
                name: '人數確認',
                description: '確認遊戲人數',
                instruction: '請告訴我你們有幾個人要一起玩？',
                completionCheck: '玩家提供了人數信息',
                nextPhase: this.GAME_PHASES.CARD_LAYOUT_SETUP,
                currentRole: null
            },
            [this.GAME_PHASES.CARD_LAYOUT_SETUP]: {
                name: '卡牌佈局設置',
                description: '設置12張卡牌的4×3佈局',
                instruction: '請洗牌後隨機抽出12張卡，排成4×3的方陣（4欄×3列）',
                completionCheck: '確認12張卡已排成4×3方陣',
                nextPhase: this.GAME_PHASES.SECRET_SELECTION,
                currentRole: null
            },
            [this.GAME_PHASES.SECRET_SELECTION]: {
                name: '秘密人物選擇',
                description: '出題者選擇秘密答案',
                instruction: '出題者請從這12張卡中秘密選擇1張作為答案，不要讓其他人看到',
                completionCheck: '出題者確認已選擇秘密人物',
                nextPhase: this.GAME_PHASES.HAND_CARDS_SETUP,
                currentRole: this.ROLES.CLUE_GIVER
            },
            [this.GAME_PHASES.HAND_CARDS_SETUP]: {
                name: '手牌設置',
                description: '出題者抽取起始手牌',
                instruction: '出題者請從剩餘卡牌中抽5張作為手牌',
                completionCheck: '出題者確認手牌已準備好',
                nextPhase: this.GAME_PHASES.ROUND_1_CLUE,
                currentRole: this.ROLES.CLUE_GIVER
            },
            [this.GAME_PHASES.ROUND_1_CLUE]: {
                name: '第1回合：出線索',
                description: '出題者打出第一張線索卡',
                instruction: '出題者請從手牌選1張作為線索。直放=相似，橫放=不相似',
                completionCheck: '出題者確認已打出線索卡',
                nextPhase: this.GAME_PHASES.ROUND_1_ELIMINATION,
                currentRole: this.ROLES.CLUE_GIVER
            },
            [this.GAME_PHASES.ROUND_1_ELIMINATION]: {
                name: '第1回合：淘汰',
                description: '猜題者淘汰1張卡',
                instruction: '猜題者請根據線索淘汰1張卡',
                completionCheck: '確認已淘汰1張卡',
                nextPhase: this.GAME_PHASES.ROUND_2_CLUE,
                currentRole: this.ROLES.GUESSER
            }
            // 其他回合配置類似...
        };

        return configs[phase] || configs[this.GAME_PHASES.NOT_STARTED];
    }

    // 獲取當前角色
    getCurrentRole() {
        const phaseConfig = this.getPhaseConfiguration(this.currentState.phase);
        return phaseConfig.currentRole;
    }

    // 轉換到下一階段
    advanceToNextPhase(completionData = {}) {
        const currentConfig = this.getPhaseConfiguration(this.currentState.phase);
        
        // 記錄完成的步驟
        this.currentState.completedSteps.push({
            phase: this.currentState.phase,
            completedAt: new Date().toISOString(),
            data: completionData
        });

        // 更新遊戲數據
        Object.assign(this.currentState.gameData, completionData);

        // 轉換階段
        this.currentState.phase = currentConfig.nextPhase;

        // 更新回合數
        if (this.currentState.phase.includes('round_')) {
            const roundMatch = this.currentState.phase.match(/round_(\d+)/);
            if (roundMatch) {
                this.currentState.roundNumber = parseInt(roundMatch[1]);
            }
        }

        console.log(`🎮 GameStateManager: 階段轉換 → ${this.currentState.phase}`);
        
        return this.getCurrentPhaseInfo();
    }

    // 檢查是否可以轉換階段
    canAdvancePhase(userMessage, contextAnalysis) {
        const currentConfig = this.getPhaseConfiguration(this.currentState.phase);
        
        // 簡單的完成檢查邏輯
        const completionKeywords = {
            [this.GAME_PHASES.PLAYER_COUNT_SETUP]: ['人', '個', '三', '四', '五'],
            [this.GAME_PHASES.CARD_LAYOUT_SETUP]: ['排好', '完成', '好了'],
            [this.GAME_PHASES.SECRET_SELECTION]: ['選好', '選了', '完成'],
            [this.GAME_PHASES.HAND_CARDS_SETUP]: ['抽好', '準備好', '完成'],
            [this.GAME_PHASES.ROUND_1_CLUE]: ['打出', '放了', '線索'],
            [this.GAME_PHASES.ROUND_1_ELIMINATION]: ['淘汰', '移除', '完成']
        };

        const keywords = completionKeywords[this.currentState.phase] || [];
        return keywords.some(keyword => userMessage.includes(keyword));
    }

    // 重置遊戲狀態
    resetGame() {
        this.currentState = {
            phase: this.GAME_PHASES.NOT_STARTED,
            playerCount: null,
            currentRole: null,
            roundNumber: 0,
            cardsRemaining: 12,
            completedSteps: [],
            gameData: {}
        };
    }

    // 獲取遊戲狀態摘要
    getGameStateSummary() {
        return {
            phase: this.currentState.phase,
            playerCount: this.currentState.playerCount,
            roundNumber: this.currentState.roundNumber,
            cardsRemaining: this.currentState.cardsRemaining,
            completedSteps: this.currentState.completedSteps.length
        };
    }
}

module.exports = GameStateManager;
