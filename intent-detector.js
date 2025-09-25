// Intent Detector AI - 專門的意圖檢測模組 (Phase 2B)
class IntentDetector {
    constructor() {
        this.name = 'IntentDetector';
        this.version = '2.0.0';
        this.phase = 'Phase2B';
        this.specializations = [
            'intent_classification',
            'urgency_assessment',
            'strategy_recommendation',
            'environment_sensing_needs'
        ];

        // 保留舊的模式檢測作為備用
        this.intentPatterns = {
            start_game: {
                keywords: ['開始', '怎麼玩', '新遊戲', '開局', '設置', 'setup', 'start', '玩法', '教我', '學習', '可以教'],
                phrases: ['我想開始', '怎麼開始', '如何設置', '開始新遊戲', '教我玩', '可以教我', '怎麼玩', '學習怎麼玩']
            },
            rule_question: {
                keywords: ['規則', '怎麼', '為什麼', '可以', '應該', '淘汰', '線索', '直放', '橫放', '回合'],
                phrases: ['淘汰幾張', '什麼意思', '怎麼淘汰', '線索怎麼', '規則是']
            },
            progress_control: {
                keywords: ['等等', '暫停', '回顧', '重複', '上一步', '下一步', '繼續', '狀態', '現在'],
                phrases: ['等一下', '再說一次', '回到上一步', '現在到哪', '目前狀況']
            },
            game_action: {
                keywords: ['出牌', '選擇', '淘汰', '決定', '我選', '打出', '放置'],
                phrases: ['我要淘汰', '我選擇', '出這張', '放這個位置', '決定是']
            },
            chitchat: {
                keywords: ['好難', '有趣', '喜歡', '討厭', '無聊', '換遊戲', '其他'],
                phrases: ['這遊戲', '太難了', '很有趣', '不喜歡', '可以換']
            }
        };
    }

    // 主要檢測方法 (Phase 2B)
    async detect(currentMessage, contextAnalysis, openaiApiCall) {
        try {
            console.log(`🎯 ${this.name}: 開始意圖檢測...`);

            const prompt = this.buildDetectionPrompt(currentMessage, contextAnalysis);
            const result = await openaiApiCall([{
                role: 'user',
                content: prompt
            }]);

            const intentResult = this.parseIntentResult(result);

            console.log(`✅ ${this.name}: 檢測完成`, {
                intent: intentResult.intent?.primary_intent,
                confidence: intentResult.intent?.confidence,
                strategy: intentResult.response_strategy?.approach
            });

            return intentResult;

        } catch (error) {
            console.error(`❌ ${this.name}: 檢測失敗，使用備用方法`, error);
            return this.fallbackDetection(currentMessage);
        }
    }

    // 構建檢測 Prompt
    buildDetectionPrompt(currentMessage, contextAnalysis) {
        const contextSummary = this.summarizeContextAnalysis(contextAnalysis);

        return `你是 Similo 專門 AI 陪玩員的意圖檢測專家，專門分析用戶在 Similo 推理卡牌遊戲情境中的真實意圖。你只處理 Similo 相關內容。

📝 **用戶消息**：「${currentMessage}」

🧠 **上下文分析摘要**：
${contextSummary}

🎯 **意圖檢測任務**：
基於用戶消息和上下文分析，精準判斷用戶的真實意圖和需求。

📋 **意圖分類系統**：

**主要意圖類型**：
- **chitchat** - 純聊天、問候、感謝
- **rule_question** - 詢問具體規則細節（如「線索卡怎麼放？」「怎麼淘汰？」）
- **start_game** - 想要學習並開始遊戲（如「教我玩」「怎麼玩」「可以開始嗎」）
- **game_action** - 遊戲中的具體行動
- **progress_control** - 流程控制（暫停、重來、繼續）
- **delayed_response** - 延遲回應（回答之前的問題）
- **environment_info** - 提供環境信息（玩家人數、經驗等）

🎯 **重要區分**：
- 「你可以教我怎麼玩嗎？」= **start_game** （想要學習並開始）
- 「怎麼玩？」= **start_game** （想要學習並開始）
- 「可以開始嗎？」= **start_game** （想要學習並開始）
- 「教我玩」= **start_game** （想要學習並開始）
- 「線索卡要怎麼放？」= **rule_question** （詢問具體規則）
- 「淘汰規則是什麼？」= **rule_question** （詢問具體規則）
- 「我們有4個人」= **environment_info** （提供環境信息）

⚠️ **關鍵判斷**：
如果用戶想要「學習如何玩」或「開始遊戲」→ **start_game**
如果用戶詢問「具體規則細節」→ **rule_question**

🎮 **start_game 意圖的回應策略**：
- approach: "environment_sensing" （必須進行環境感知）
- environment_sensing.needs_sensing: true
- environment_sensing.sensing_type: "player_count|experience|materials"

請返回以下 JSON 格式：

{
  "intent": {
    "primary_intent": "主要意圖類型",
    "confidence": 0.0-1.0,
    "description": "具體描述用戶想要什麼"
  },
  "urgency": {
    "level": "low|normal|high",
    "priority_score": 0.0-1.0
  },
  "response_strategy": {
    "approach": "direct_answer|environment_sensing|guided_action|context_bridge",
    "tone": "friendly",
    "should_reference_context": boolean
  },
  "environment_sensing": {
    "needs_sensing": boolean,
    "sensing_type": "player_count|experience|materials|none"
  }
}

只返回 JSON，不要其他文字。`;
    }

    // 總結上下文分析
    summarizeContextAnalysis(contextAnalysis) {
        if (!contextAnalysis) {
            return '（無上下文分析）';
        }

        let summary = '';

        const continuity = contextAnalysis.continuity_analysis;
        if (continuity) {
            summary += `連續性: ${continuity.is_continuous ? '是' : '否'} (${continuity.continuity_type})\n`;
        }

        const topic = contextAnalysis.topic_analysis;
        if (topic) {
            summary += `話題切換: ${topic.topic_switch_detected ? '是' : '否'}\n`;
        }

        const keyInfo = contextAnalysis.context_relevance?.key_information;
        if (keyInfo?.pending_question) {
            summary += `未回答問題: ${keyInfo.pending_question}\n`;
        }

        return summary || '（上下文分析為空）';
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
            console.warn(`⚠️ ${this.name}: JSON 解析失敗`, error);
            throw error;
        }
    }

    // 備用檢測方法（使用舊邏輯）
    fallbackDetection(userMessage) {
        console.log(`🔄 ${this.name}: 使用備用檢測方法`);

        const oldResult = this.detectIntent(userMessage);

        return {
            intent: {
                primary_intent: oldResult.intent,
                confidence: oldResult.confidence,
                description: `備用檢測結果: ${oldResult.intent}`
            },
            urgency: {
                level: "normal",
                priority_score: 0.5
            },
            response_strategy: {
                approach: "direct_answer",
                tone: "friendly",
                should_reference_context: false
            },
            environment_sensing: {
                needs_sensing: oldResult.intent === 'start_game',
                sensing_type: oldResult.intent === 'start_game' ? 'player_count' : 'none'
            },
            fallback_used: true
        };
    }

    // 檢測用戶意圖 (舊方法，保留作為備用)
    detectIntent(userMessage) {
        const message = userMessage.toLowerCase();
        const scores = {};

        // 計算每個意圖的匹配分數
        for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
            scores[intent] = this.calculateScore(message, patterns);
        }

        // 找出最高分的意圖
        const bestIntent = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );

        // 如果最高分太低，歸類為 chitchat
        const confidence = scores[bestIntent];
        if (confidence < 0.3) {
            return { intent: 'chitchat', confidence: confidence };
        }

        return { intent: bestIntent, confidence: confidence };
    }

    // 計算匹配分數
    calculateScore(message, patterns) {
        let score = 0;
        let totalChecks = 0;

        // 檢查關鍵詞
        for (const keyword of patterns.keywords) {
            totalChecks++;
            if (message.includes(keyword)) {
                score += 1;
            }
        }

        // 檢查短語（權重更高）
        for (const phrase of patterns.phrases) {
            totalChecks++;
            if (message.includes(phrase)) {
                score += 2; // 短語匹配權重更高
            }
        }

        // 返回標準化分數
        return totalChecks > 0 ? score / totalChecks : 0;
    }

    // 獲取意圖的詳細信息
    getIntentInfo(intent) {
        const intentDescriptions = {
            start_game: {
                description: '用戶想要開始新遊戲或學習遊戲玩法',
                expectedActions: ['提供遊戲設置指導', '解釋基本規則', '引導角色選擇']
            },
            rule_question: {
                description: '用戶對遊戲規則有疑問',
                expectedActions: ['查找相關規則', '提供清楚解釋', '舉例說明']
            },
            progress_control: {
                description: '用戶想要控制遊戲進度',
                expectedActions: ['暫停/繼續遊戲', '回顧狀態', '提供當前進度']
            },
            game_action: {
                description: '用戶正在進行遊戲動作',
                expectedActions: ['處理遊戲動作', '更新遊戲狀態', '提供下一步指導']
            },
            chitchat: {
                description: '用戶進行閒聊或其他對話',
                expectedActions: ['友善回應', '引導回到遊戲', '提供鼓勵']
            }
        };

        return intentDescriptions[intent] || { description: '未知意圖', expectedActions: [] };
    }

    // 獲取檢測器統計信息
    getDetectorStats() {
        return {
            name: this.name,
            version: this.version,
            phase: this.phase,
            specializations: this.specializations,
            capabilities: [
                'ai_powered_detection',
                'context_aware_analysis',
                'urgency_assessment',
                'strategy_recommendation',
                'fallback_detection'
            ]
        };
    }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntentDetector;
} else {
    window.IntentDetector = IntentDetector;
}
