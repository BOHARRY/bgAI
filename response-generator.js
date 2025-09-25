// Response Generator AI - 專門的回應生成模組
const fs = require('fs');
const path = require('path');

class ResponseGenerator {
    constructor() {
        this.name = 'ResponseGenerator';
        this.version = '1.0.0';
        this.specializations = [
            'natural_response_generation',
            'context_integration',
            'similo_personality',
            'conversation_flow_management'
        ];

        // 載入完整的 Similo 規則文件
        this.similoRules = this.loadSimiloRules();

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

            const gameRules = fs.readFileSync(gameRulesPath, 'utf8');
            const roleRules = fs.readFileSync(roleRulesPath, 'utf8');

            console.log(`✅ ${this.name}: 成功載入 Similo 規則文件`);
            console.log(`  - 遊戲規則: ${gameRules.length} 字符`);
            console.log(`  - 角色規則: ${roleRules.length} 字符`);

            return {
                gameRules: gameRules,
                roleRules: roleRules,
                loaded: true
            };
        } catch (error) {
            console.warn(`⚠️ ${this.name}: 無法載入 Similo 規則文件，使用備用規則`, error.message);
            return {
                gameRules: '',
                roleRules: '',
                loaded: false
            };
        }
    }

    // 主要生成方法
    async generate(currentMessage, contextAnalysis, intentResult, openaiApiCall) {
        try {
            console.log(`🎪 ${this.name}: 開始生成回應...`);
            
            const prompt = this.buildGenerationPrompt(currentMessage, contextAnalysis, intentResult);
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
    buildGenerationPrompt(currentMessage, contextAnalysis, intentResult) {
        const contextBridge = this.buildContextBridge(contextAnalysis);
        const strategyGuidance = this.buildStrategyGuidance(intentResult);
        const similoKnowledge = this.buildSimiloKnowledge(intentResult);
        
        return `你是 Similo 專門 AI 陪玩員 🎭，專門協助玩家學習和遊玩 Similo 這款推理卡牌遊戲。你只專注於 Similo，不處理其他遊戲。根據分析結果生成自然的回應。

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

    // 構建 Similo 知識庫 (使用完整規則文件)
    buildSimiloKnowledge(intentResult) {
        const intent = intentResult.intent?.primary_intent;

        // 如果成功載入了規則文件，提供完整的知識庫
        if (this.similoRules.loaded) {
            if (intent === 'rule_question') {
                return `🎯 Similo 完整規則知識庫：

=== 遊戲狀態與操作手冊 ===
${this.similoRules.gameRules}

=== 角色規則說明 ===
${this.similoRules.roleRules}

回答指導：
- 根據用戶具體問題，從上述規則中提取相關信息
- 保持簡潔明確，不要一次性提供所有規則
- 可以詢問是否需要了解其他部分`;
            }

            if (intent === 'start_game') {
                return `🎮 開始遊戲引導原則：
- 🚫 不要介紹遊戲背景或詳細規則
- ✅ 用戶已經買了桌遊，直接引導遊玩即可
- ✅ 簡潔詢問環境信息（人數、經驗）
- ✅ 立即進入遊戲設置流程
- ✅ 保持簡短、實用的回應
- ✅ 一步一步引導，不要一次說太多`;
            }

            if (intent === 'environment_info') {
                return `🎯 環境信息收集完成，立即進入遊戲設置：
- 🚫 不要介紹遊戲背景或歡迎詞
- ✅ 直接進入遊戲設置流程
- ✅ 簡潔說明下一步要做什麼
- ✅ 保持實用、簡短的回應
- ✅ 用戶已經知道這是什麼遊戲，直接開始即可`;
            }

            if (intent === 'progress_control') {
                return `🎮 流程控制 - 進入下一階段：
- 🚫 不要重複詢問已知信息（人數、經驗等）
- ✅ 直接進入下一個遊戲階段
- ✅ 開始具體的遊戲設置步驟
- ✅ 保持簡潔、實用的指導
- ✅ 用戶已經準備好，直接開始遊戲流程`;
            }

            return `🎭 Similo 專門知識：你擁有完整的 Similo 遊戲規則知識，包括遊戲狀態管理和角色規則。根據需要提供相關信息，但避免資訊轟炸。`;
        } else {
            // 降級到備用規則
            if (intent === 'rule_question') {
                return `🎯 回答規則問題時：
- 只回答用戶具體問的問題
- 不要主動提供其他規則
- 保持簡潔明確
- 可以詢問是否需要了解其他部分`;
            }

            if (intent === 'start_game') {
                return `🎮 開始遊戲引導原則：
- 🚫 不要介紹遊戲背景或詳細規則
- ✅ 用戶已經買了桌遊，直接引導遊玩即可
- ✅ 簡潔詢問環境信息（人數、經驗）
- ✅ 立即進入遊戲設置流程
- ✅ 保持簡短、實用的回應`;
            }

            if (intent === 'environment_info') {
                return `🎯 環境信息收集完成，立即進入遊戲設置：
- 🚫 不要介紹遊戲背景或歡迎詞
- ✅ 直接進入遊戲設置流程
- ✅ 簡潔說明下一步要做什麼
- ✅ 保持實用、簡短的回應`;
            }

            if (intent === 'progress_control') {
                return `🎮 流程控制 - 進入下一階段：
- 🚫 不要重複詢問已知信息（人數、經驗等）
- ✅ 直接進入下一個遊戲階段
- ✅ 開始具體的遊戲設置步驟
- ✅ 保持簡潔、實用的指導`;
            }

            return '根據具體情況提供必要的 Similo 知識，避免資訊轟炸。';
        }
    }

    // 後處理回應
    postProcessResponse(response) {
        // 移除可能的格式標記
        let cleaned = response.replace(/```[\s\S]*?```/g, '');
        cleaned = cleaned.replace(/^\s*[-*]\s*/gm, '');
        
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

    // 獲取備用回應
    getFallbackResponse(currentMessage, intentResult) {
        const intent = intentResult?.intent?.primary_intent || 'chitchat';
        
        const fallbackResponses = {
            chitchat: '你好！我是 Similo 專門 AI 陪玩員 🎭 很高興和你聊天！想要學習 Similo 這款推理遊戲嗎？',
            rule_question: '這是個好問題！讓我來解釋一下 Similo 的規則...',
            start_game: '太棒了！我來當你們的 Similo 陪玩員 🎉 在開始之前，先跟我說說：現在桌上有幾位玩家呢？',
            environment_info: '好的！現在讓我們直接開始設置遊戲吧！',
            game_action: '我明白你想進行 Similo 遊戲動作。讓我們一步步來處理...',
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
