// Context Analyzer AI - 專門的上下文分析模組
class ContextAnalyzer {
    constructor() {
        this.name = 'ContextAnalyzer';
        this.version = '1.0.0';
    }

    // 主要分析方法
    async analyze(currentMessage, chatHistory, openaiApiCall) {
        try {
            console.log(`🧠 ${this.name}: 開始分析上下文...`);
            
            const prompt = this.buildAnalysisPrompt(currentMessage, chatHistory);
            const result = await openaiApiCall([{
                role: 'user', 
                content: prompt
            }]);

            const analysis = this.parseAnalysisResult(result);
            
            console.log(`✅ ${this.name}: 分析完成`, {
                continuity: analysis.continuity_analysis?.is_continuous,
                topicSwitch: analysis.topic_analysis?.topic_switch_detected,
                relevantHistory: analysis.context_relevance?.relevant_history?.length || 0
            });

            return analysis;

        } catch (error) {
            console.error(`❌ ${this.name}: 分析失敗`, error);
            return this.getDefaultAnalysis();
        }
    }

    // 構建分析 Prompt
    buildAnalysisPrompt(currentMessage, chatHistory) {
        const historyText = this.formatChatHistory(chatHistory);
        
        return `你是專業的對話上下文分析師。深度分析用戶對話的連續性、話題切換和上下文相關性。

📝 **當前用戶消息**：「${currentMessage}」

📚 **對話歷史**：
${historyText}

🎯 **分析任務**：
1. **連續性分析** - 判斷當前消息是否是對之前問題的回應
2. **話題分析** - 檢測是否發生話題切換或回歸
3. **上下文相關性** - 識別哪些歷史對話與當前消息相關
4. **對話狀態** - 追蹤未完成的對話線程和當前階段

🔍 **特別注意**：
- 檢測延遲回應（用戶在幾輪對話後回答之前的問題）
- 識別話題跳躍（突然問不相關的問題）
- 分析數字、確認詞、角色選擇等關鍵回應模式
- 評估每條歷史記錄的相關性權重

請返回以下 JSON 格式的分析結果：

{
  "continuity_analysis": {
    "is_continuous": boolean,
    "continuity_type": "direct_response|delayed_response|topic_jump|new_conversation",
    "confidence": 0.0-1.0,
    "reasoning": "詳細解釋判斷依據"
  },
  "topic_analysis": {
    "current_topic": "當前話題標識",
    "previous_topic": "上一個話題標識",
    "topic_switch_detected": boolean,
    "return_to_topic": "回歸的話題標識或null"
  },
  "context_relevance": {
    "relevant_history": [相關歷史記錄的索引數組],
    "irrelevant_history": [不相關歷史記錄的索引數組],
    "key_information": {
      "pending_question": "未回答的問題或null",
      "question_asker": "assistant|user",
      "question_timestamp": "問題所在的歷史索引"
    }
  },
  "conversation_state": {
    "incomplete_threads": ["未完成的對話線程數組"],
    "completed_threads": ["已完成的對話線程數組"],
    "current_phase": "not_started|greeting|setup|playing|ended"
  }
}

只返回 JSON，不要其他文字。`;
    }

    // 格式化聊天歷史
    formatChatHistory(chatHistory) {
        if (!chatHistory || chatHistory.length === 0) {
            return '（無對話歷史）';
        }

        return chatHistory.map((msg, index) => {
            const role = msg.role === 'user' ? '用戶' : 'AI助手';
            return `${index}. ${role}: ${msg.content}`;
        }).join('\n');
    }

    // 解析分析結果
    parseAnalysisResult(result) {
        try {
            // 清理可能的格式問題
            const cleanResult = result.trim();
            const jsonMatch = cleanResult.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('無法找到有效的 JSON 格式');
            }
        } catch (error) {
            console.warn(`⚠️ ${this.name}: JSON 解析失敗，使用默認分析`, error);
            return this.getDefaultAnalysis();
        }
    }

    // 獲取默認分析結果（當 AI 分析失敗時使用）
    getDefaultAnalysis() {
        return {
            continuity_analysis: {
                is_continuous: false,
                continuity_type: "new_conversation",
                confidence: 0.5,
                reasoning: "分析失敗，使用默認判斷"
            },
            topic_analysis: {
                current_topic: "unknown",
                previous_topic: "unknown",
                topic_switch_detected: false,
                return_to_topic: null
            },
            context_relevance: {
                relevant_history: [],
                irrelevant_history: [],
                key_information: {
                    pending_question: null,
                    question_asker: null,
                    question_timestamp: null
                }
            },
            conversation_state: {
                incomplete_threads: [],
                completed_threads: [],
                current_phase: "not_started"
            }
        };
    }

    // 檢測簡單的連續性模式（備用方法）
    detectSimpleContinuity(currentMessage, chatHistory) {
        if (!chatHistory || chatHistory.length === 0) {
            return false;
        }

        const userMsg = currentMessage.toLowerCase();
        const lastAIMessage = chatHistory
            .filter(msg => msg.role === 'assistant')
            .pop();

        if (!lastAIMessage) {
            return false;
        }

        const aiMsg = lastAIMessage.content.toLowerCase();

        // 檢測數字回應
        if (/\d+/.test(userMsg) && (aiMsg.includes('幾') || aiMsg.includes('多少'))) {
            return true;
        }

        // 檢測確認回應
        if (['好的', '是的', '對', '沒錯', '可以', '行'].some(word => userMsg.includes(word))) {
            return true;
        }

        // 檢測角色選擇回應
        if (userMsg.includes('我當') || userMsg.includes('我來')) {
            return true;
        }

        return false;
    }

    // 獲取分析統計信息
    getAnalysisStats() {
        return {
            name: this.name,
            version: this.version,
            capabilities: [
                'continuity_detection',
                'topic_analysis',
                'context_relevance',
                'conversation_state_tracking'
            ]
        };
    }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextAnalyzer;
} else {
    window.ContextAnalyzer = ContextAnalyzer;
}
