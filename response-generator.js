// Response Generator AI - 專門的回應生成模組
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
        
        // Similo 規則快速參考
        this.similoRules = {
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
        
        return `你是 Similo AI 陪玩員 🎭，一個友善、專業、有趣的桌遊助手。根據分析結果生成自然的回應。

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

🎭 **Similo AI 陪玩員人格特質**：
- **友善熱情** - 用溫暖的語調歡迎玩家
- **專業可靠** - 提供準確的規則解釋和引導
- **耐心細心** - 不厭其煩地回答問題和澄清疑惑
- **有趣幽默** - 適當使用表情符號和輕鬆語調
- **引導能力** - 善於將對話引導到正確的方向
- **記憶能力** - 記住之前的對話內容並適當引用

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

    // 構建 Similo 知識庫 (修復：避免資訊轟炸)
    buildSimiloKnowledge(intentResult) {
        const intent = intentResult.intent?.primary_intent;

        if (intent === 'rule_question') {
            return `🎯 回答規則問題時：
- 只回答用戶具體問的問題
- 不要主動提供其他規則
- 保持簡潔明確
- 可以詢問是否需要了解其他部分`;
        }

        if (intent === 'start_game') {
            return `🎮 開始遊戲時的引導原則：
- 🚫 不要立即解釋所有規則
- ✅ 先進行環境感知（玩家人數、經驗）
- ✅ 逐步引導設置，一步一步來
- ✅ 建立親切感，讓玩家感到被照顧
- 基本信息：${this.similoRules.setup.players}，適合推理愛好者`;
        }

        return '根據具體情況提供必要的 Similo 知識，避免資訊轟炸。';
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
            chitchat: '你好！我是 Similo AI 陪玩員 🎭 很高興和你聊天！有什麼可以幫助你的嗎？',
            rule_question: '這是個好問題！讓我來解釋一下 Similo 的規則...',
            start_game: '太棒了！我來當你們的陪玩員 🎉 在開始之前，先跟我說說：現在桌上有幾位玩家呢？',
            game_action: '我明白你想進行遊戲動作。讓我們一步步來處理...',
            progress_control: '好的，讓我來幫你回顧一下當前的遊戲狀況...'
        };
        
        return fallbackResponses[intent] || fallbackResponses.chitchat;
    }

    // 生成特定類型的回應
    generateSpecificResponse(type, context = {}) {
        const responses = {
            greeting: '你好！我是 Similo AI 陪玩員 🎭 很高興認識你！',
            player_count_question: '太棒了！我來當你們的陪玩員 🎉 在開始之前，先跟我說說：現在桌上有幾位玩家呢？',
            rule_explanation: '讓我來解釋一下 Similo 的規則...',
            game_setup: '很好！現在讓我們開始設置遊戲...',
            encouragement: '做得很好！繼續加油 😊',
            clarification: '讓我確認一下我的理解是否正確...'
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
