// Response Generator AI - 專門的回應生成模組
const fs = require('fs');
const path = require('path');
const GameStateManager = require('./game-state-manager');

class ResponseGenerator {
    constructor() {
        this.name = 'ResponseGenerator';
        this.version = '2.0.0';
        this.specializations = [
            'game_state_aware_generation',
            'step_by_step_guidance',
            'role_consistent_communication',
            'similo_rule_accuracy'
        ];

        // 載入完整的 Similo 規則文件
        this.similoRules = this.loadSimiloRules();

        // 初始化遊戲狀態管理器
        this.gameStateManager = new GameStateManager();

        // Similo 規則快速參考（備用）
        this.similoRulesBackup = {
            basic: {
                cards: '12張卡片排成4×3方陣',
                clues: '線索卡直放=相似，橫放=不相似',
                elimination: '第1回合淘汰1張，第2回合淘汰2張，依此類推',
                victory: '最後剩下的卡片就是秘密角色則勝利'
            },
            setup: {
                players: '2-8人，建議3-5人',
                roles: '出題者選擇秘密角色，猜題者進行淘汰',
                materials: '需要角色卡牌和線索卡牌'
            }
        };
    }

    // 載入 Similo 規則文件
    loadSimiloRules() {
        try {
            const gameRulesPath = path.join(__dirname, 'book', 'Similo.md');
            const roleRulesPath = path.join(__dirname, 'book', 'SimiloRole.md');
            const structuredRulesPath = path.join(__dirname, 'book', 'Similo-Structured.md');

            const gameRules = fs.readFileSync(gameRulesPath, 'utf8');
            const roleRules = fs.readFileSync(roleRulesPath, 'utf8');

            // 優先使用結構化規則
            let structuredRules = '';
            try {
                structuredRules = fs.readFileSync(structuredRulesPath, 'utf8');
                console.log(`✅ ${this.name}: 成功載入結構化 Similo 規則文件`);
            } catch (structuredError) {
                console.warn(`⚠️ ${this.name}: 結構化規則文件不存在，使用原始規則`);
            }

            console.log(`✅ ${this.name}: 成功載入 Similo 規則文件`);
            console.log(`  - 遊戲規則: ${gameRules.length} 字符`);
            console.log(`  - 角色規則: ${roleRules.length} 字符`);
            console.log(`  - 結構化規則: ${structuredRules.length} 字符`);

            return {
                gameRules: gameRules,
                roleRules: roleRules,
                structuredRules: structuredRules,
                loaded: true
            };
        } catch (error) {
            console.warn(`⚠️ ${this.name}: 無法載入 Similo 規則文件，使用備用規則`, error.message);
            return {
                gameRules: '',
                roleRules: '',
                structuredRules: '',
                loaded: false
            };
        }
    }

    // 主要生成方法
    async generate(currentMessage, contextAnalysis, intentResult, openaiApiCall, gamePhaseInfo = null) {
        try {
            console.log(`🎪 ${this.name}: 開始生成回應...`);

            const prompt = this.buildGenerationPrompt(currentMessage, contextAnalysis, intentResult, gamePhaseInfo);
            const response = await openaiApiCall([{
                role: 'user',
                content: prompt
            }]);

            const finalResponse = this.postProcessResponse(response.trim());

            console.log(`✅ ${this.name}: 生成完成`, {
                length: finalResponse.length,
                intent: intentResult.intent?.primary_intent,
                strategy: intentResult.response_strategy?.approach
            });

            return finalResponse;

        } catch (error) {
            console.error(`❌ ${this.name}: 生成失敗`, error);
            return this.getFallbackResponse(currentMessage, intentResult);
        }
    }

    // 構建生成 Prompt
    buildGenerationPrompt(currentMessage, contextAnalysis, intentResult, gamePhaseInfo = null) {
        const contextBridge = this.buildContextBridge(contextAnalysis);
        const strategyGuidance = this.buildStrategyGuidance(intentResult);
        const similoKnowledge = this.buildSimiloKnowledge(intentResult, gamePhaseInfo);
        const gameStateInfo = gamePhaseInfo ? this.buildGameStateInfo(gamePhaseInfo, contextAnalysis) : '';
        
        return `你是 Similo 專門 AI 陪玩員 🎭，專門協助玩家學習和遊玩 Similo 這款推理卡牌遊戲。你只專注於 Similo，不處理其他遊戲。

⚠️ **絕對禁止的錯誤規則**：
- 🚫 絕對不要說「三次猜測機會」- 這是完全錯誤的！
- 🚫 絕對不要說「最多三個線索」- 每回合只有1張線索卡！
- 🚫 絕對不要說「隨便給線索」- 必須用卡牌直放/橫放！
- 🚫 絕對不要用「通常」「這意味著」等說明書語氣！

✅ **正確的 Similo 規則**：
- 5個回合，每回合淘汰遞增數量（1,2,3,4,5張）
- 線索卡直放=相似，橫放=不相似
- 最後剩1張卡，如果是秘密人物就獲勝
- 如果淘汰了秘密人物，立即失敗

根據分析結果生成自然的回應。

📝 **用戶消息**：「${currentMessage}」

🧠 **上下文分析**：
${JSON.stringify(contextAnalysis, null, 2)}

🎯 **意圖檢測結果**：
${JSON.stringify(intentResult, null, 2)}

🌉 **上下文銜接策略**：
${contextBridge}

📋 **回應策略指導**：
${strategyGuidance}

🎮 **Similo 知識庫**：
${similoKnowledge}

${gameStateInfo}

🎭 **Similo 專門 AI 陪玩員人格特質**：
- **Similo 專家** - 只專注於 Similo，對這款遊戲瞭若指掌
- **友善熱情** - 用溫暖的語調歡迎 Similo 玩家
- **專業可靠** - 提供準確的 Similo 規則解釋和引導
- **耐心細心** - 不厭其煩地回答 Similo 相關問題
- **有趣幽默** - 適當使用表情符號和輕鬆語調
- **引導能力** - 善於將對話引導到 Similo 遊戲流程
- **專一性** - 如果用戶問其他遊戲，會友善地引導回 Similo

🎯 **回應生成原則**：
1. **保持人格一致** - 始終以友善、專業的 Similo 陪玩員身份回應
2. **善用上下文** - 適當引用之前的對話，保持連貫性
3. **處理話題切換** - 如果是跳躍問題，先回答再引導回原話題
4. **確認延遲回應** - 如果是延遲回應，要確認理解並繼續流程
5. **自然過渡** - 使用自然的語言銜接不同話題
6. **提供價值** - 每個回應都要對用戶有幫助
7. **引導下一步** - 適當提示用戶下一步該做什麼

🚫 **避免事項**：
- 不要說「我當出題者」或參與遊戲
- 不要一次性提供過多信息
- 不要忽略用戶的上下文
- 不要使用過於正式或機械化的語言
- 不要重複之前已經說過的內容
- 🚫 **絕對不要問「你想了解哪一款遊戲」** - 你只處理 Similo！
- 🚫 **不要提及其他遊戲** - 專注於 Similo

請生成一個自然、友善、有用的回應，體現 Similo AI 陪玩員的專業素養。`;
    }

    // 構建上下文銜接策略
    buildContextBridge(contextAnalysis) {
        if (!contextAnalysis) {
            return '這是首次對話，正常回應即可。';
        }

        let bridge = '';
        const continuity = contextAnalysis.continuity_analysis;
        const topic = contextAnalysis.topic_analysis;
        
        if (continuity?.is_continuous && continuity.continuity_type === 'delayed_response') {
            bridge += '✅ 這是延遲回應，要確認理解用戶的回答並繼續之前的流程\n';
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

    // 構建策略指導
    buildStrategyGuidance(intentResult) {
        const strategy = intentResult.response_strategy;
        if (!strategy) {
            return '使用友善的語調直接回應。';
        }

        let guidance = `回應方式: ${strategy.approach}\n`;
        guidance += `語調: ${strategy.tone}\n`;
        
        if (strategy.should_reference_context) {
            guidance += '✅ 需要引用上下文\n';
        }
        
        if (strategy.next_action) {
            guidance += `下一步行動: ${strategy.next_action}\n`;
        }

        return guidance;
    }

    // 構建遊戲狀態感知的 Similo 知識庫
    buildSimiloKnowledge(intentResult, gamePhaseInfo = null) {
        const intent = intentResult.intent?.primary_intent;

        // 獲取當前遊戲階段信息
        const currentPhase = gamePhaseInfo || this.gameStateManager.getCurrentPhaseInfo();

        // 根據意圖和遊戲階段提供精確指導
        if (intent === 'start_game') {
            return this.getStartGameGuidance();
        }

        if (intent === 'step_completion') {
            return this.getStepCompletionGuidance(currentPhase);
        }

        if (intent === 'game_state_query') {
            return this.getGameStateGuidance(currentPhase);
        }

        if (intent === 'rule_clarification') {
            return this.getRuleClarificationGuidance(currentPhase);
        }

        if (intent === 'environment_info') {
            return this.getEnvironmentInfoGuidance(currentPhase);
        }

        if (intent === 'error_recovery') {
            return this.getErrorRecoveryGuidance(currentPhase);
        }

        // 默認指導
        return this.getDefaultGuidance(currentPhase);
    }

    // 開始遊戲指導
    getStartGameGuidance() {
        return `🎮 Similo 遊戲開始指導：
- 🎯 目標：一步一步引導玩家完成遊戲設置
- 📋 流程：人數確認 → 卡牌佈局 → 角色選擇 → 開始遊戲
- ✅ 原則：每次只給一個明確指令，等待確認後再繼續
- 🚫 避免：長篇規則解釋、一次性說太多步驟

角色術語統一：
- 出題者 (Clue Giver)：選擇秘密人物並給線索
- 猜題者 (Guesser)：根據線索淘汰卡牌`;
    }

    // 步驟完成指導
    getStepCompletionGuidance(phaseInfo) {
        return `🎯 步驟完成處理 - 當前階段：${phaseInfo.phaseName}
- ✅ 確認用戶已完成：${phaseInfo.description}
- 🎮 下一步指令：${phaseInfo.instruction}
- 🚫 不要重複已完成的步驟
- ✅ 直接進入下一階段的具體指導

回應模式：簡短確認 + 下一步明確指令`;
    }

    // 遊戲狀態查詢指導
    getGameStateGuidance(phaseInfo) {
        return `📋 遊戲狀態回答 - 當前階段：${phaseInfo.phaseName}
- 🎯 當前任務：${phaseInfo.instruction}
- 👤 當前角色：${phaseInfo.currentRole || '所有玩家'}
- ✅ 完成標準：${phaseInfo.completionCheck}
- 📝 回應要點：簡潔說明當前該做什麼，不要重複歷史`;
    }

    // 規則澄清指導
    getRuleClarificationGuidance(phaseInfo) {
        return `🎯 規則澄清回答：
- ✅ 只回答用戶具體問的問題
- 📋 提供準確的 Similo 規則信息
- 🚫 不要擴展到其他規則
- ✅ 回答後詢問是否可以繼續當前步驟

⚠️ 絕對不能說的錯誤規則：
- ❌ "三次猜測機會" - 這是完全錯誤的！
- ❌ "隨便給線索" - 必須用卡牌直放/橫放
- ❌ "猜角色名字" - 是淘汰不要的卡牌

✅ 正確的核心規則：
- 直放 = 相似，橫放 = 不相似
- 12張卡排成4×3方陣
- 每回合淘汰數量遞增（第1回合淘汰1張，第2回合淘汰2張...第5回合淘汰5張）
- 最後剩1張卡，如果是秘密人物就獲勝
- 如果淘汰了秘密人物，立即失敗`;
    }

    // 環境信息指導
    getEnvironmentInfoGuidance(phaseInfo) {
        return `🎯 環境信息處理：
- ✅ 記錄用戶提供的信息（人數、經驗等）
- 🎮 立即進入下一設置步驟
- 🚫 不要重複詢問已知信息
- ✅ 根據人數調整指導內容

當前階段：${phaseInfo.phaseName}
下一步：${phaseInfo.instruction}`;
    }

    // 錯誤恢復指導
    getErrorRecoveryGuidance(phaseInfo) {
        return `🔄 錯誤恢復處理：
- ✅ 理解用戶想要重來或修正
- 📋 提供當前階段的重新指導
- 🎯 確認用戶想要回到哪一步
- ✅ 重新給出清晰的指令

當前可以重做的步驟：${phaseInfo.instruction}`;
    }

    // 默認指導
    getDefaultGuidance(phaseInfo) {
        return `🎭 Similo 專門陪玩指導：
- 🎯 當前階段：${phaseInfo.phaseName}
- 📋 當前任務：${phaseInfo.instruction}
- ✅ 保持角色術語一致：出題者、猜題者
- 🚫 避免資訊轟炸，一步一步來`;
    }

    // 構建遊戲狀態信息
    buildGameStateInfo(gamePhaseInfo, contextAnalysis) {
        if (!gamePhaseInfo) return '';

        return `🎮 **當前遊戲狀態**：
- 階段：${gamePhaseInfo.phaseName}
- 當前任務：${gamePhaseInfo.instruction}
- 當前角色：${gamePhaseInfo.currentRole || '所有玩家'}
- 完成標準：${gamePhaseInfo.completionCheck}

🧠 **已知信息記憶**：
${this.buildMemoryContext(contextAnalysis)}

⚠️ **重要提醒**：
- 🚫 不要重複詢問已知信息
- ✅ 只給出當前階段需要的指令
- ✅ 等待用戶完成後再進入下一步
- ✅ 保持簡潔，避免一次說太多`;
    }

    // 構建記憶上下文 - 提取並傳遞關鍵信息
    buildMemoryContext(contextAnalysis) {
        const memory = {
            playerCount: null,
            experienceLevel: null,
            selectedTheme: null,
            gamePhase: null,
            completedSteps: []
        };

        // 從上下文歷史中提取關鍵信息
        if (contextAnalysis && contextAnalysis.chatHistory) {
            const history = contextAnalysis.chatHistory;

            for (let i = 0; i < history.length; i++) {
                const message = history[i];
                if (message.role === 'user') {
                    const content = message.content.toLowerCase();

                    // 提取人數信息
                    if (!memory.playerCount) {
                        const playerMatch = content.match(/(\d+).*人|三|四|五|六|七|八/);
                        if (playerMatch) {
                            if (playerMatch[1]) {
                                memory.playerCount = parseInt(playerMatch[1]);
                            } else if (content.includes('三')) {
                                memory.playerCount = 3;
                            } else if (content.includes('四')) {
                                memory.playerCount = 4;
                            } else if (content.includes('五')) {
                                memory.playerCount = 5;
                            } else if (content.includes('六')) {
                                memory.playerCount = 6;
                            } else if (content.includes('七')) {
                                memory.playerCount = 7;
                            } else if (content.includes('八')) {
                                memory.playerCount = 8;
                            }
                        }
                    }

                    // 提取經驗信息
                    if (!memory.experienceLevel) {
                        if (content.includes('沒有') || content.includes('新手') || content.includes('第一次')) {
                            memory.experienceLevel = '新手';
                        } else if (content.includes('玩過') || content.includes('會玩') || content.includes('熟悉')) {
                            memory.experienceLevel = '有經驗';
                        }
                    }

                    // 提取主題選擇
                    if (!memory.selectedTheme) {
                        if (content.includes('神話') || content.includes('mythology')) {
                            memory.selectedTheme = '神話';
                        } else if (content.includes('人物') || content.includes('角色')) {
                            memory.selectedTheme = '人物';
                        } else if (content.includes('動物')) {
                            memory.selectedTheme = '動物';
                        } else if (content.includes('歷史')) {
                            memory.selectedTheme = '歷史';
                        }
                    }

                    // 提取完成步驟
                    if (content.includes('排好了') || content.includes('完成了')) {
                        if (!memory.completedSteps.includes('卡牌佈局')) {
                            memory.completedSteps.push('卡牌佈局');
                        }
                    }
                    if (content.includes('選好了')) {
                        if (!memory.completedSteps.includes('秘密人物選擇')) {
                            memory.completedSteps.push('秘密人物選擇');
                        }
                    }
                    if (content.includes('準備好了')) {
                        if (!memory.completedSteps.includes('手牌準備')) {
                            memory.completedSteps.push('手牌準備');
                        }
                    }
                }
            }
        }

        // 構建記憶提示
        let memoryText = '';

        if (memory.playerCount) {
            memoryText += `- 👥 玩家人數：${memory.playerCount}人 (已確認，不要再問)\n`;
        }

        if (memory.experienceLevel) {
            memoryText += `- 🎯 經驗水平：${memory.experienceLevel} (已確認)\n`;
        }

        if (memory.selectedTheme) {
            memoryText += `- 🎨 選擇主題：${memory.selectedTheme} (已確認)\n`;
        }

        if (memory.completedSteps.length > 0) {
            memoryText += `- ✅ 已完成步驟：${memory.completedSteps.join('、')}\n`;
        }

        if (memoryText === '') {
            memoryText = '- 📝 尚無已知信息，可以開始收集基本信息';
        }

        return memoryText;
    }

    // 規則驗證 - 檢查回應是否包含錯誤規則
    validateRules(response) {
        const errorPatterns = [
            /三次猜測/i,
            /三個線索/i,
            /隨便給線索/i,
            /猜角色名字/i,
            /隱藏者/i,
            /通常.*意味著/i
        ];

        const errors = [];
        errorPatterns.forEach((pattern, index) => {
            if (pattern.test(response)) {
                const errorMessages = [
                    '包含錯誤規則：三次猜測',
                    '包含錯誤規則：三個線索',
                    '包含錯誤描述：隨便給線索',
                    '包含錯誤玩法：猜角色名字',
                    '使用錯誤術語：隱藏者',
                    '使用說明書語氣'
                ];
                errors.push(errorMessages[index]);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // 後處理回應
    postProcessResponse(response) {
        // 移除可能的格式標記
        let cleaned = response.replace(/```[\s\S]*?```/g, '');
        cleaned = cleaned.replace(/^\s*[-*]\s*/gm, '');

        // 規則驗證
        const validation = this.validateRules(cleaned);
        if (!validation.isValid) {
            console.error(`❌ ${this.name}: 回應包含錯誤規則:`, validation.errors);
            cleaned = this.correctRuleErrors(cleaned);
        }

        // 確保回應不會太長
        if (cleaned.length > 500) {
            const sentences = cleaned.split(/[。！？.!?]/);
            cleaned = sentences.slice(0, 3).join('。') + '。';
        }
        
        // 確保有適當的表情符號
        if (!cleaned.match(/[😊🎭🎉🎯🎮]/)) {
            cleaned = cleaned.replace(/！/, '！😊');
        }
        
        return cleaned.trim();
    }

    // 修正規則錯誤
    correctRuleErrors(response) {
        let corrected = response;

        // 修正常見錯誤規則
        corrected = corrected.replace(/三次猜測.*?機會/gi, '5回合淘汰，每回合淘汰遞增數量');
        corrected = corrected.replace(/最多三個線索/gi, '每回合1張線索卡');
        corrected = corrected.replace(/隱藏者/gi, '出題者');
        corrected = corrected.replace(/通常.*?這意味著/gi, '');
        corrected = corrected.replace(/隨便給線索/gi, '用線索卡直放或橫放');

        return corrected;
    }

    // 獲取備用回應
    getFallbackResponse(currentMessage, intentResult) {
        const intent = intentResult?.intent?.primary_intent || 'chitchat';
        
        const fallbackResponses = {
            chitchat: '你好！我是 Similo 專門 AI 陪玩員 🎭 很高興和你聊天！想要學習 Similo 這款推理遊戲嗎？',
            rule_clarification: '這是個好問題！讓我來解釋一下 Similo 的規則...',
            start_game: '太棒了！我來當你們的 Similo 陪玩員 🎉 在開始之前，先跟我說說：現在桌上有幾位玩家呢？',
            step_completion: '太好了！讓我們繼續下一步...',
            game_state_query: '讓我告訴你現在該做什麼...',
            environment_info: '好的！現在讓我們直接開始設置遊戲吧！',
            game_action: '我明白你想進行 Similo 遊戲動作。讓我們一步步來處理...',
            error_recovery: '沒問題！讓我們重新來過...',
            progress_control: '太好了！讓我們開始下一步的遊戲設置吧！'
        };
        
        return fallbackResponses[intent] || fallbackResponses.chitchat;
    }

    // 生成特定類型的回應
    generateSpecificResponse(type, context = {}) {
        const responses = {
            greeting: '你好！我是 Similo 專門 AI 陪玩員 🎭 很高興認識你！想要學習 Similo 這款推理遊戲嗎？',
            player_count_question: '太棒了！我來當你們的 Similo 陪玩員 🎉 在開始之前，先跟我說說：現在桌上有幾位玩家呢？',
            rule_explanation: '讓我來解釋一下 Similo 的規則...',
            game_setup: '很好！現在讓我們開始設置 Similo 遊戲...',
            encouragement: '做得很好！繼續加油 😊',
            clarification: '讓我確認一下我對 Similo 的理解是否正確...'
        };
        
        return responses[type] || responses.greeting;
    }

    // 獲取生成器統計信息
    getGeneratorStats() {
        return {
            name: this.name,
            version: this.version,
            specializations: this.specializations,
            capabilities: [
                'natural_language_generation',
                'context_aware_responses',
                'personality_consistency',
                'similo_knowledge_integration',
                'conversation_flow_management'
            ],
            personality_traits: [
                'friendly',
                'professional',
                'patient',
                'humorous',
                'guiding',
                'memorable'
            ]
        };
    }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponseGenerator;
} else {
    window.ResponseGenerator = ResponseGenerator;
}
