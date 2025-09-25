// 互動流程管理器 - 處理分步引導和情境感知
class InteractionFlow {
    constructor() {
        // 定義遊戲設置流程
        this.setupFlow = [
            'greeting',           // 歡迎和初步了解
            'check_preparation',  // 檢查準備狀態
            'role_selection',     // 角色選擇
            'card_setup',         // 卡牌設置
            'game_start'          // 開始遊戲
        ];

        // 定義遊戲中的互動流程
        this.gameFlow = [
            'clue_giving',        // 出線索
            'clue_analysis',      // 分析線索
            'elimination_decision', // 決定淘汰
            'elimination_action',  // 執行淘汰
            'round_transition'    // 回合轉換
        ];

        // 當前流程狀態
        this.currentFlow = null;
        this.currentStep = 0;
        this.flowContext = {};
    }

    // 開始新的互動流程
    startFlow(flowType, context = {}) {
        this.currentFlow = flowType;
        this.currentStep = 0;
        this.flowContext = { ...context };
        
        console.log(`🎬 開始新流程: ${flowType}`);
        return this.getCurrentStepInfo();
    }

    // 進入下一步
    nextStep(userResponse = null) {
        if (userResponse) {
            this.processUserResponse(userResponse);
        }
        
        this.currentStep++;
        
        if (this.isFlowComplete()) {
            console.log(`✅ 流程完成: ${this.currentFlow}`);
            return this.completeFlow();
        }
        
        return this.getCurrentStepInfo();
    }

    // 獲取當前步驟資訊
    getCurrentStepInfo() {
        if (!this.currentFlow) {
            return null;
        }

        const steps = this.currentFlow === 'setup' ? this.setupFlow : this.gameFlow;
        const stepName = steps[this.currentStep];
        
        return {
            flow: this.currentFlow,
            step: stepName,
            stepIndex: this.currentStep,
            totalSteps: steps.length,
            context: this.flowContext,
            isComplete: this.isFlowComplete()
        };
    }

    // 檢查流程是否完成
    isFlowComplete() {
        const steps = this.currentFlow === 'setup' ? this.setupFlow : this.gameFlow;
        return this.currentStep >= steps.length;
    }

    // 處理用戶回應
    processUserResponse(userResponse) {
        const stepName = this.getCurrentStepName();
        
        switch (stepName) {
            case 'greeting':
                this.flowContext.userGreeted = true;
                break;
                
            case 'check_preparation':
                this.flowContext.hasCards = this.detectHasCards(userResponse);
                this.flowContext.isReady = this.detectIsReady(userResponse);
                break;
                
            case 'role_selection':
                this.flowContext.userRole = this.detectRoleChoice(userResponse);
                this.flowContext.aiRole = this.flowContext.userRole === 'clue_giver' ? 'guesser' : 'clue_giver';
                break;
                
            case 'card_setup':
                this.flowContext.cardsSetup = this.detectCardsSetup(userResponse);
                break;
                
            case 'game_start':
                this.flowContext.gameStarted = true;
                break;
        }
    }

    // 獲取當前步驟名稱
    getCurrentStepName() {
        const steps = this.currentFlow === 'setup' ? this.setupFlow : this.gameFlow;
        return steps[this.currentStep];
    }

    // 完成流程
    completeFlow() {
        const result = {
            flowCompleted: this.currentFlow,
            context: this.flowContext,
            nextAction: this.determineNextAction()
        };
        
        // 重置流程狀態
        this.currentFlow = null;
        this.currentStep = 0;
        this.flowContext = {};
        
        return result;
    }

    // 決定下一個行動
    determineNextAction() {
        if (this.currentFlow === 'setup') {
            return 'start_game';
        } else if (this.currentFlow === 'game') {
            return 'continue_game';
        }
        return 'wait_for_input';
    }

    // 檢測用戶是否有卡牌
    detectHasCards(response) {
        const msg = response.toLowerCase();
        return msg.includes('有') || msg.includes('準備好') || msg.includes('拿出來') || 
               msg.includes('已經') || msg.includes('ok') || msg.includes('好了');
    }

    // 檢測用戶是否準備好
    detectIsReady(response) {
        const msg = response.toLowerCase();
        return msg.includes('準備好') || msg.includes('開始') || msg.includes('可以') ||
               msg.includes('馬上') || msg.includes('現在');
    }

    // 檢測角色選擇
    detectRoleChoice(response) {
        const msg = response.toLowerCase();
        if (msg.includes('出題者') || msg.includes('出題') || msg.includes('給線索')) {
            return 'clue_giver';
        } else if (msg.includes('猜題者') || msg.includes('猜') || msg.includes('猜測')) {
            return 'guesser';
        }
        return null;
    }

    // 檢測卡牌設置完成
    detectCardsSetup(response) {
        const msg = response.toLowerCase();
        return msg.includes('排好') || msg.includes('完成') || msg.includes('好了') ||
               msg.includes('設置好') || msg.includes('ok') || msg.includes('done');
    }

    // 生成步驟特定的提示詞
    generateStepPrompt(stepInfo) {
        const stepName = stepInfo.step;
        const context = stepInfo.context;
        
        const prompts = {
            greeting: this.generateGreetingPrompt(context),
            check_preparation: this.generatePreparationPrompt(context),
            role_selection: this.generateRoleSelectionPrompt(context),
            card_setup: this.generateCardSetupPrompt(context),
            game_start: this.generateGameStartPrompt(context)
        };
        
        return prompts[stepName] || this.generateDefaultPrompt(stepInfo);
    }

    // 生成各種提示詞
    generateGreetingPrompt(context) {
        return `你是 Similo AI 陪玩員 🎭！用戶想要學習 Similo，你要：

1. 熱情歡迎用戶
2. 簡單介紹自己是他們的遊戲夥伴
3. 詢問他們是否準備好開始
4. 保持輕鬆愉快的氛圍

回應要簡短有趣，不要一次講太多規則！`;
    }

    generatePreparationPrompt(context) {
        return `用戶想要開始 Similo，你要：

1. 確認他們是否有 Similo 卡牌
2. 如果沒有，建議替代方案
3. 詢問他們的準備狀態
4. 給出下一步的簡單指示

保持互動性，一次只問一件事！`;
    }

    generateRoleSelectionPrompt(context) {
        return `現在要選擇角色！你要：

1. 簡單解釋 Similo 有兩個角色
2. 出題者：選秘密角色，給線索
3. 猜題者：根據線索猜測並淘汰
4. 詢問用戶想當哪一個

如果用戶選猜題者，你就當出題者。保持輕鬆的語調！`;
    }

    generateCardSetupPrompt(context) {
        const userRole = context.userRole;
        
        return `用戶選擇了角色：${userRole}，現在要設置卡牌：

1. 指導用戶抽 12 張卡排成 4×3
2. 如果用戶是出題者，提醒他們秘密選擇一張
3. 如果你是出題者，告訴用戶你已經選好秘密角色
4. 確認設置完成

一步一步來，不要急！`;
    }

    generateGameStartPrompt(context) {
        return `卡牌設置完成！準備開始遊戲：

1. 確認遊戲狀態
2. 解釋第一回合的流程
3. 如果你是出題者，準備給第一個線索
4. 如果用戶是出題者，等待他們的線索

讓遊戲開始吧！🎉`;
    }

    generateDefaultPrompt(stepInfo) {
        return `當前步驟：${stepInfo.step}，請根據情況提供適當的引導。`;
    }
}

module.exports = InteractionFlow;
