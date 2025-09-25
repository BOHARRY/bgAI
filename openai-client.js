// OpenAI API 客戶端
class OpenAIClient {
    constructor(apiUrl = '/api/chat') {
        this.apiUrl = apiUrl;
        this.chatHistory = [];
    }

    // 發送消息到本地 API
    async sendMessage(message, systemPrompt = '', model = 'gpt-3.5-turbo') {
        try {
            // 發送 API 請求到本地服務器
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: this.chatHistory
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            const assistantMessage = data.message;

            // 更新聊天歷史
            this.addToHistory('user', message);
            this.addToHistory('assistant', assistantMessage);

            return assistantMessage;

        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
        }
    }

    // 添加消息到聊天歷史
    addToHistory(role, content) {
        this.chatHistory.push({
            role: role,
            content: content
        });

        // 限制歷史記錄長度
        if (this.chatHistory.length > CONFIG.MAX_CHAT_HISTORY) {
            this.chatHistory = this.chatHistory.slice(-CONFIG.MAX_CHAT_HISTORY);
        }
    }

    // 清除聊天歷史
    clearHistory() {
        this.chatHistory = [];
    }

    // 獲取聊天歷史
    getHistory() {
        return [...this.chatHistory];
    }

    // 流式響應（未來可以實現）
    async sendMessageStream(message, systemPrompt = '', model = 'gpt-3.5-turbo') {
        // TODO: 實現流式響應
        throw new Error('Stream mode not implemented yet');
    }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIClient;
} else {
    window.OpenAIClient = OpenAIClient;
}
