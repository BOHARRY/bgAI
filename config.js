// 配置文件
const CONFIG = {
    // 本地 API 配置
    API_URL: '/api/chat',
    
    // AI 模型配置
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    
    // 系統提示詞
    SYSTEM_PROMPT: `你是 RuleBuddy.ai，一個專業的桌遊 AI 助手。你的任務是：

1. 解釋桌遊規則 - 用清楚易懂的方式說明遊戲規則
2. 回答遊戲問題 - 解決玩家在遊戲過程中的疑問
3. 提供策略建議 - 分享遊戲技巧和策略
4. 推薦桌遊 - 根據玩家喜好推薦適合的桌遊

請用友善、專業且有趣的語調回答，並盡量提供具體實用的建議。如果遇到不確定的規則問題，請建議查閱官方規則書。`,

    // UI 配置
    TYPING_DELAY: 50,
    MAX_CHAT_HISTORY: 20
};

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
