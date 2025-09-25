// 環境感知層 - 感知桌遊現場狀況
class EnvironmentSensor {
    constructor() {
        // 定義各種環境感知需求
        this.sensingNeeds = {
            start_game: ['player_count', 'experience_level', 'materials_check'],
            rule_question: ['game_phase', 'current_situation'],
            game_action: ['current_state', 'player_role'],
            progress_control: ['game_progress', 'confusion_point']
        };
    }

    // 分析環境感知需求
    analyzeEnvironmentNeeds(userMessage, intent, currentEnvironment) {
        const needs = [];
        const baseNeeds = this.sensingNeeds[intent] || [];
        
        // 檢查哪些環境資訊還缺失
        for (const need of baseNeeds) {
            if (!this.hasEnvironmentInfo(need, currentEnvironment)) {
                needs.push(need);
            }
        }

        // 根據用戶消息內容調整需求
        const adjustedNeeds = this.adjustNeedsBasedOnMessage(userMessage, needs);
        
        return {
            missingInfo: adjustedNeeds,
            priority: this.prioritizeNeeds(adjustedNeeds, intent),
            nextQuestion: this.generateNextQuestion(adjustedNeeds[0], userMessage)
        };
    }

    // 檢查是否已有環境資訊
    hasEnvironmentInfo(need, environment) {
        const checks = {
            player_count: () => environment.playerCount !== null,
            experience_level: () => environment.experienceLevel !== null,
            materials_check: () => environment.availableMaterials !== null,
            game_phase: () => environment.gamePhase !== 'unknown',
            current_situation: () => environment.currentSituation !== null,
            current_state: () => environment.gameState !== null,
            player_role: () => environment.playerRole !== null,
            game_progress: () => environment.gameProgress !== null,
            confusion_point: () => environment.confusionPoint !== null
        };

        return checks[need] ? checks[need]() : false;
    }

    // 根據用戶消息調整需求
    adjustNeedsBasedOnMessage(userMessage, needs) {
        const msg = userMessage.toLowerCase();
        
        // 如果用戶已經提到人數，移除 player_count 需求
        if (this.containsPlayerCount(msg)) {
            needs = needs.filter(need => need !== 'player_count');
        }

        // 如果用戶提到經驗，移除 experience_level 需求
        if (this.containsExperience(msg)) {
            needs = needs.filter(need => need !== 'experience_level');
        }

        // 如果用戶提到材料，移除 materials_check 需求
        if (this.containsMaterials(msg)) {
            needs = needs.filter(need => need !== 'materials_check');
        }

        return needs;
    }

    // 優先排序需求
    prioritizeNeeds(needs, intent) {
        const priority = {
            start_game: ['player_count', 'materials_check', 'experience_level'],
            rule_question: ['current_situation', 'game_phase'],
            game_action: ['current_state', 'player_role'],
            progress_control: ['game_progress', 'confusion_point']
        };

        const intentPriority = priority[intent] || needs;
        return needs.sort((a, b) => {
            const aIndex = intentPriority.indexOf(a);
            const bIndex = intentPriority.indexOf(b);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });
    }

    // 生成下一個問題
    generateNextQuestion(primaryNeed, userMessage) {
        const questions = {
            player_count: {
                question: "現在桌上有幾位玩家呢？",
                context: "需要了解玩家人數來調整遊戲規則",
                followUp: "player_count_response"
            },
            experience_level: {
                question: "你們之前玩過 Similo 嗎？還是第一次接觸？",
                context: "需要了解經驗程度來調整解釋深度",
                followUp: "experience_response"
            },
            materials_check: {
                question: "你們手邊有 Similo 卡牌嗎？如果沒有，我也可以教你們用其他卡片代替！",
                context: "需要確認遊戲材料準備狀況",
                followUp: "materials_response"
            },
            current_situation: {
                question: "可以告訴我現在遊戲進行到哪裡了嗎？",
                context: "需要了解當前遊戲狀況",
                followUp: "situation_response"
            },
            game_phase: {
                question: "你們現在是在哪個階段呢？設置、進行中、還是遇到問題？",
                context: "需要了解遊戲階段",
                followUp: "phase_response"
            }
        };

        return questions[primaryNeed] || {
            question: "告訴我更多關於你們現在的狀況吧！",
            context: "需要更多資訊",
            followUp: "general_response"
        };
    }

    // 檢測用戶消息中的環境資訊
    extractEnvironmentInfo(userMessage) {
        const msg = userMessage.toLowerCase();
        const extracted = {};

        // 提取玩家人數
        const playerCount = this.extractPlayerCount(msg);
        if (playerCount) extracted.playerCount = playerCount;

        // 提取經驗程度
        const experience = this.extractExperience(msg);
        if (experience) extracted.experienceLevel = experience;

        // 提取材料狀況
        const materials = this.extractMaterials(msg);
        if (materials) extracted.availableMaterials = materials;

        return extracted;
    }

    // 提取玩家人數
    extractPlayerCount(message) {
        const patterns = [
            /(\d+)\s*個人/,
            /(\d+)\s*人/,
            /我們\s*(\d+)/,
            /(一|二|三|四|五|六|七|八|九|十)個人/,
            /(兩|三|四|五|六|七|八|九|十)人/
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                let count = match[1];
                // 轉換中文數字
                const chineseNumbers = {
                    '一': 1, '二': 2, '兩': 2, '三': 3, '四': 4, '五': 5,
                    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
                };
                return chineseNumbers[count] || parseInt(count);
            }
        }
        return null;
    }

    // 提取經驗程度
    extractExperience(message) {
        if (message.includes('第一次') || message.includes('沒玩過') || message.includes('新手')) {
            return 'beginner';
        }
        if (message.includes('玩過') || message.includes('會玩') || message.includes('熟悉')) {
            return 'experienced';
        }
        if (message.includes('專家') || message.includes('很熟') || message.includes('常玩')) {
            return 'expert';
        }
        return null;
    }

    // 提取材料狀況
    extractMaterials(message) {
        if (message.includes('有卡') || message.includes('有牌') || message.includes('準備好')) {
            return 'available';
        }
        if (message.includes('沒有') || message.includes('沒帶') || message.includes('缺少')) {
            return 'missing';
        }
        if (message.includes('其他卡') || message.includes('代替') || message.includes('替代')) {
            return 'substitute';
        }
        return null;
    }

    // 輔助檢測方法
    containsPlayerCount(message) {
        return /\d+\s*(個人|人)|我們\s*\d+|(一|二|三|四|五|六|七|八|九|十|兩)(個人|人)/.test(message);
    }

    containsExperience(message) {
        return /(第一次|沒玩過|新手|玩過|會玩|熟悉|專家|很熟|常玩)/.test(message);
    }

    containsMaterials(message) {
        return /(有卡|有牌|準備好|沒有|沒帶|缺少|其他卡|代替|替代)/.test(message);
    }

    // 生成環境感知的系統提示詞
    generateSensingPrompt(userMessage, intent, missingInfo) {
        return `你是環境感知分析專家。分析用戶的桌遊現場狀況。

用戶消息：「${userMessage}」
檢測到的意圖：${intent}
缺失的環境資訊：${missingInfo.join(', ')}

請分析並回傳 JSON 格式：
{
  "detected_info": {
    "player_count": null,
    "experience_level": null,
    "materials": null
  },
  "confidence": 0.8,
  "next_sensing_need": "player_count",
  "environment_context": "描述當前感知到的環境狀況"
}`;
    }
}

module.exports = EnvironmentSensor;
